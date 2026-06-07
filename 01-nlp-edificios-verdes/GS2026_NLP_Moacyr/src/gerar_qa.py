#!/usr/bin/env python3
"""Etapa 3 (parte 2) — Geracao sintetica de pares Q&A com o Llama 3.2 3B.

Decisao do projeto: os pares de treino sao gerados pelo PROPRIO modelo base
(meta-llama/Llama-3.2-3B-Instruct), e NAO por um LLM externo. Para mitigar
alucinacao e circularidade, a geracao e EXTRATIVA e GROUNDED:

  - o modelo recebe uma passagem do corpus e e instruido a extrair perguntas cujas
    respostas estejam LITERALMENTE contidas na passagem (temperatura baixa);
  - cada par passa por uma VERIFICACAO ANTI-ALUCINACAO: todo numero/percentual da
    resposta precisa aparecer na passagem de origem; caso contrario, o par e
    descartado. Isso reduz o 3B ao papel de extrator (que ele faz bem), evitando
    que ele invente requisitos normativos (que ele faz mal).

Projetado para rodar no Colab (GPU T4), reaproveitando o modelo ja carregado para o
fine-tuning. Tem checkpoint incremental (retomavel) e funciona offline apos o
download dos pesos.

Uso (no notebook, com o modelo/tokenizer ja carregados):
    from gerar_qa import gerar_pares
    gerar_pares(model, tokenizer, alvo=1000)

Ou standalone (carrega o modelo sozinho):
    python src/gerar_qa.py --alvo 1000
"""
from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path

import chunking

RAIZ = Path(__file__).resolve().parent.parent
ENTRADA = RAIZ / "data" / "textos_limpos.jsonl"
SAIDA = RAIZ / "data" / "pares_qa.jsonl"
CHECKPOINT = RAIZ / "data" / ".qa_checkpoint.json"
RELATORIO = RAIZ / "relatorios" / "qa_geracao.md"

MODELO_BASE = "meta-llama/Llama-3.2-3B-Instruct"
# Passagem menor para a soma (system + instrucao + passagem + geracao) caber com folga
# no contexto efetivo de 1024 tokens usado no carregamento (evita o truncamento que o
# unsloth avisava e que sujava a saida JSON).
ALVO_TOKENS_PASSAGEM = 480
TETO_CHUNKS_POR_DOC = 60
MIN_CHARS_RESPOSTA = 30
JACCARD_DUP = 0.85
MAX_NEW_TOKENS = 512
# Contexto com que o modelo e carregado no notebook (FastLanguageModel max_seq_length).
# A geracao de Q&A precisa de prompt longo (passagem ~480 tok no tokenizer do Llama,
# que gasta mais tokens em PT que o tiktoken do chunking) + espaco para a resposta.
# 2048 da folga; o prompt e truncado defensivamente em CONTEXTO_MODELO - MAX_NEW_TOKENS.
CONTEXTO_MODELO = 2048

SYSTEM = (
    "Voce e um assistente que cria perguntas e respostas de estudo a partir de um "
    "texto tecnico sobre edificios verdes e Net Zero de energia e agua. Voce responde "
    "SOMENTE com base no texto fornecido e nunca inventa numeros, normas ou fatos."
)

INSTRUCAO = """A partir EXCLUSIVAMENTE da passagem abaixo, escreva {n} pares de
pergunta e resposta em portugues do Brasil. Cada resposta deve estar apoiada
LITERALMENTE no texto da passagem — copie numeros, percentuais e nomes de normas
exatamente como aparecem. Nao use conhecimento externo. Nao escreva nada alem do
JSON. Formato de saida (array JSON valido):
[{{"pergunta": "...", "resposta": "...", "tipo": "definicao|requisito|comparacao|aplicacao|procedimento"}}]

PASSAGEM:
\"\"\"
{passagem}
\"\"\"
"""

_RE_NUM = re.compile(r"\d[\d.,]*\s*%?")


def _tokens(s: str) -> set[str]:
    return set(s.lower().split())


def jaccard(a: str, b: str) -> float:
    ta, tb = _tokens(a), _tokens(b)
    return len(ta & tb) / len(ta | tb) if ta and tb else 0.0


def _numeros(s: str) -> set[str]:
    """Numeros SUBSTANTIVOS normalizados presentes em s.

    Ignora digitos isolados de um unico algarismo (1-9) sem % nem separador, que quase
    sempre sao marcadores de enumeracao ("1.", "2.") e nao fatos do dominio. Mantem
    percentuais, valores com virgula/milhar e numeros de 2+ algarismos (ex.: 50%, 15527,
    5000, 73,5).
    """
    out = set()
    for m in _RE_NUM.findall(s):
        t = m.strip().rstrip(".,").replace(" ", "")
        if not any(ch.isdigit() for ch in t):
            continue
        # marcador de lista: um unico digito, sem % e sem separador -> ignora
        if len(t) == 1 and t.isdigit():
            continue
        out.add(t)
    return out


def grounded(resposta: str, passagem: str) -> bool:
    """Verificacao anti-alucinacao: TODO numero substantivo da resposta (percentual,
    valor com virgula/milhar ou numero de 2+ algarismos) deve aparecer na passagem de
    origem. Respostas puramente conceituais (sem numeros) sao aceitas. Marcadores de
    enumeracao de um digito ja sao filtrados por _numeros()."""
    nums_resp = _numeros(resposta)
    if not nums_resp:
        return True
    nums_pass = _numeros(passagem)
    return all(n in nums_pass for n in nums_resp)


def montar_passagens() -> list[dict]:
    docs = [json.loads(l) for l in ENTRADA.read_text(encoding="utf-8").splitlines()]
    docs = [d for d in docs if d.get("palavras", 0) >= 500]
    passagens: list[dict] = []
    for d in docs:
        chunks = chunking.segmentar(d["texto"], alvo_tokens=ALVO_TOKENS_PASSAGEM)
        if len(chunks) > TETO_CHUNKS_POR_DOC:
            passo = len(chunks) / TETO_CHUNKS_POR_DOC
            chunks = [chunks[int(i * passo)] for i in range(TETO_CHUNKS_POR_DOC)]
        for c in chunks:
            passagens.append({
                "passagem_id": f"{d['id']}#{c['indice']}", "doc_id": d["id"],
                "categoria": d["categoria"], "subcategoria": d["subcategoria"],
                "texto": c["texto"],
            })
    return passagens


def _extrair_json(texto: str) -> list[dict]:
    """Extrai os pares da resposta do modelo, tolerante a ruido e a JSON truncado.

    Estrategia em camadas:
      1. tenta json.loads do array completo [...];
      2. se falhar (modelo cortou o ']' final), faz parse objeto-a-objeto via regex,
         aceitando os pares completos e ignorando o ultimo objeto truncado.
    """
    i = texto.find("[")
    j = texto.rfind("]")
    if i != -1 and j > i:
        try:
            dados = json.loads(texto[i:j + 1])
            if isinstance(dados, list):
                return [d for d in dados if isinstance(d, dict)]
        except json.JSONDecodeError:
            pass
    # fallback: cada objeto {...} com pergunta e resposta, mesmo sem o array fechar
    objetos = []
    for m in re.finditer(r"\{[^{}]*\}", texto, re.DOTALL):
        try:
            d = json.loads(m.group(0))
            if isinstance(d, dict) and "pergunta" in d and "resposta" in d:
                objetos.append(d)
        except json.JSONDecodeError:
            continue
    return objetos


def _gerar_uma(model, tokenizer, passagem: str, n: int) -> list[dict]:
    import torch
    msgs = [{"role": "system", "content": SYSTEM},
            {"role": "user", "content": INSTRUCAO.format(n=n, passagem=passagem)}]
    # tokeniza com truncamento explicito: garante que o prompt + geracao caibam no
    # contexto e evita o corte silencioso do unsloth que sujava a saida.
    enc = tokenizer.apply_chat_template(
        msgs, add_generation_prompt=True, return_tensors="pt",
        truncation=True, max_length=CONTEXTO_MODELO - MAX_NEW_TOKENS, return_dict=True)
    enc = {k: v.to(model.device) for k, v in enc.items()}
    with torch.no_grad():
        saida = model.generate(
            **enc, max_new_tokens=MAX_NEW_TOKENS, do_sample=True,
            temperature=0.3, top_p=0.9,
            pad_token_id=tokenizer.eos_token_id)  # attention_mask vem em enc
    texto = tokenizer.decode(saida[0][enc["input_ids"].shape[1]:],
                             skip_special_tokens=True)
    return _extrair_json(texto)


def gerar_pares(model, tokenizer, alvo: int = 1000, teste: int = 0) -> int:
    """Gera pares usando um model/tokenizer HF ja carregados. Retorna total final."""
    passagens = montar_passagens()
    feitas = set(json.loads(CHECKPOINT.read_text())) if CHECKPOINT.exists() else set()
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    existentes = ([json.loads(l) for l in SAIDA.read_text(encoding="utf-8").splitlines()]
                  if SAIDA.exists() else [])
    vistas = [p["pergunta"] for p in existentes]

    pendentes = [p for p in passagens if p["passagem_id"] not in feitas]
    if teste:
        pendentes = pendentes[:teste]
    print(f"Passagens: {len(passagens)} | feitas: {len(feitas)} | "
          f"pendentes: {len(pendentes)} | pares atuais: {len(existentes)}")

    novos = descartados = halluc = 0
    with open(SAIDA, "a", encoding="utf-8") as fout:
        for k, p in enumerate(pendentes, 1):
            if not teste and len(existentes) + novos >= alvo:
                print(f"Alvo {alvo} atingido."); break
            try:
                itens = _gerar_uma(model, tokenizer, p["texto"], n=3)
            except Exception as e:
                print(f"  ERRO {p['passagem_id']}: {type(e).__name__}: {str(e)[:70]}")
                continue
            for it in itens:
                perg = (it.get("pergunta") or "").strip()
                resp = (it.get("resposta") or "").strip()
                if not perg or len(resp) < MIN_CHARS_RESPOSTA:
                    descartados += 1; continue
                if jaccard(perg, resp) > 0.9:
                    descartados += 1; continue
                if not grounded(resp, p["texto"]):     # anti-alucinacao
                    halluc += 1; continue
                if any(jaccard(perg, q) > JACCARD_DUP for q in vistas[-400:]):
                    descartados += 1; continue
                par = {"pergunta": perg, "resposta": resp, "tipo": it.get("tipo", ""),
                       "doc_id": p["doc_id"], "categoria": p["categoria"],
                       "subcategoria": p["subcategoria"], "passagem_id": p["passagem_id"]}
                fout.write(json.dumps(par, ensure_ascii=False) + "\n"); fout.flush()
                vistas.append(perg); novos += 1
            feitas.add(p["passagem_id"])
            if k % 10 == 0:
                CHECKPOINT.write_text(json.dumps(sorted(feitas)))
                print(f"  [{k}/{len(pendentes)}] +{novos} pares | "
                      f"{descartados} filtrados | {halluc} anti-alucinacao")
    CHECKPOINT.write_text(json.dumps(sorted(feitas)))

    todos = [json.loads(l) for l in SAIDA.read_text(encoding="utf-8").splitlines()]
    _escrever_relatorio(todos, halluc)
    print(f"\nOK: +{novos} novos | {descartados} filtrados | {halluc} anti-alucinacao "
          f"| TOTAL={len(todos)}")
    return len(todos)


def _escrever_relatorio(todos: list[dict], halluc: int) -> None:
    por_cat = Counter(p["categoria"] for p in todos)
    por_sub = Counter(p["subcategoria"] for p in todos)
    por_tipo = Counter(p.get("tipo", "") for p in todos)
    RELATORIO.parent.mkdir(parents=True, exist_ok=True)
    RELATORIO.write_text(
        "# Etapa 3 — Relatorio de geracao de pares Q&A\n\n"
        f"- Total de pares: **{len(todos)}**\n"
        f"- Modelo gerador: `{MODELO_BASE}` (extrativo, grounded, temp=0.3)\n"
        f"- Pares descartados por verificacao anti-alucinacao: {halluc}\n"
        f"- Por categoria: {dict(por_cat)}\n"
        f"- Por subcategoria: {dict(por_sub)}\n"
        f"- Por tipo: {dict(por_tipo)}\n",
        encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--alvo", type=int, default=1000)
    ap.add_argument("--teste", type=int, default=0)
    args = ap.parse_args()

    import os
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer
    from dotenv import load_dotenv
    load_dotenv(str(RAIZ / ".env"))
    tok = AutoTokenizer.from_pretrained(MODELO_BASE, token=os.environ.get("HF_TOKEN"))
    model = AutoModelForCausalLM.from_pretrained(
        MODELO_BASE, token=os.environ.get("HF_TOKEN"),
        torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
        device_map="auto")
    gerar_pares(model, tok, alvo=args.alvo, teste=args.teste)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
