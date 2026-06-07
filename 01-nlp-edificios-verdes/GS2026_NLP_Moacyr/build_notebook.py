#!/usr/bin/env python3
"""Gera o notebook Colab da disciplina de NLP (chatbot Edifícios Verdes / Net Zero).

Mantém o conteúdo em Python aqui (mais legível para revisão e diff) e exporta o
.ipynb em formato Jupyter v4. Rodar sempre que o conteúdo for alterado:

    python build_notebook.py

O notebook cobre, em ordem, as fases que o critério de avaliação da disciplina
exige no mesmo artefato (30%): corpus -> pré-processamento -> chunking -> embeddings
-> indexação -> geração de Q&A (Llama 3.2 3B) -> fine-tuning QLoRA -> avaliação
base vs ajustado -> chatbot. As fases locais (corpus/limpeza/embeddings) são
reexecutadas a partir dos scripts versionados em src/, clonados do GitHub.
"""

import json
from pathlib import Path

NOTEBOOK_PATH = Path(__file__).parent / "notebooks" / "finetuning_llama_qlora.ipynb"
REPO_URL = "https://github.com/moacyrsz/gs-space-connect.git"
SUBDIR = "gs-space-connect/01-nlp-edificios-verdes/GS2026_NLP_Moacyr"


def md(*lines):
    return {"cell_type": "markdown", "metadata": {}, "source": list(lines)}


def code(*lines):
    return {"cell_type": "code", "execution_count": None, "metadata": {},
            "outputs": [], "source": list(lines)}


cells = [
    md(
        "# Chatbot Especialista em Edifícios Verdes / Net Zero de Energia e Água\n",
        "\n",
        "**GS 2026.1 - Space Connect**  \n",
        "**Aluno:** Moacyr Cabral da Silva - RM 559263  \n",
        "**Disciplina:** Processamento de Linguagem Natural, Chatbots & Virtual Agents  \n",
        "**Atividade:** Chat Bot com LLM fine tunned  \n",
        "**Entrega:** 2026-06-09\n",
        "\n",
        "Fine-tuning **QLoRA** de `meta-llama/Llama-3.2-3B-Instruct` em um corpus técnico ",
        "próprio sobre edifícios capazes de suprir metade ou todas as suas necessidades de ",
        "água e energia sem depender de fontes externas.\n",
        "\n",
        "**Pipeline (todas as fases neste notebook):** clonar repo -> ambiente -> corpus + ",
        "limpeza (versionados) -> chunking + embeddings + ChromaDB -> geração de pares Q&A ",
        "com o próprio modelo base -> fine-tuning QLoRA -> avaliação base vs ajustado -> ",
        "chatbot.\n",
        "\n",
        "> **Runtime:** Colab com GPU **T4** (Runtime -> Change runtime type -> T4 GPU).",
    ),

    md("## 0. Ambiente\n",
       "\n",
       "Verifica a GPU e instala as dependências de fine-tuning. `unsloth` acelera o ",
       "treino de Llama em T4 e já traz `transformers`/`peft`/`trl`/`bitsandbytes` ",
       "compatíveis."),
    code("!nvidia-smi"),
    code(
        "%%capture\n",
        "# unsloth puxa versões compatíveis de transformers/peft/trl/bitsandbytes para T4\n",
        "!pip install -q \"unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git\"\n",
        "!pip install -q sentence-transformers chromadb evaluate bert_score sacrebleu rouge_score\n",
        "!pip install -q pymupdf python-dotenv",
    ),

    md("## 1. Clonar o repositório e posicionar na pasta da disciplina\n",
       "\n",
       "O corpus (PDFs), os textos já limpos e os scripts-fonte (`src/`) estão ",
       "versionados. Assim o notebook reexecuta as fases locais de forma reproduzível."),
    code(
        f"!git clone --depth 1 {REPO_URL}\n",
        f"%cd {SUBDIR}\n",
        "!ls -R src corpus data | head -40",
    ),

    md("## 2. Autenticação no Hugging Face\n",
       "\n",
       "O Llama 3.2 é um modelo *gated*: requer aceite da licença Meta e um token de ",
       "acesso (tipo *read*). O token é pedido de forma interativa e **não** fica salvo ",
       "no notebook."),
    code(
        "from getpass import getpass\n",
        "from huggingface_hub import login\n",
        "login(getpass('Cole seu Hugging Face token (read): '))",
    ),

    md("## 3. Corpus e pré-processamento\n",
       "\n",
       "O corpus tem **14 documentos técnicos** em 3 categorias (normas/certificação, ",
       "relatórios técnico-científicos e manuais de tecnologias habilitadoras), com ",
       "metadados em `corpus/metadata.json`. A extração e limpeza (remoção de ",
       "cabeçalhos/rodapés, números de página e junção de hifenização, preservando ",
       "tabelas e requisitos numerados) já foi aplicada e versionada em ",
       "`data/textos_limpos.jsonl`. A célula abaixo apenas confirma o material."),
    code(
        "import json, pathlib\n",
        "meta = json.loads(pathlib.Path('corpus/metadata.json').read_text())\n",
        "docs = [json.loads(l) for l in open('data/textos_limpos.jsonl', encoding='utf-8')]\n",
        "docs = [d for d in docs if d.get('palavras', 0) >= 500]\n",
        "print(f\"Documentos no corpus: {meta['total_documentos']} | com texto util: {len(docs)}\")\n",
        "print('Palavras limpas:', sum(d['palavras'] for d in docs))\n",
        "for d in docs:\n",
        "    print(f\"  {d['id']:4} {d['categoria']:18} {d['subcategoria']:7} {d['palavras']:>7} palavras\")",
    ),

    md("## 4. Chunking, embeddings e indexação vetorial (ChromaDB)\n",
       "\n",
       "Segmenta em chunks de ~512 tokens com 25% de sobreposição, gera embeddings com ",
       "`intfloat/multilingual-e5-large` (prefixo `passage:`) e indexa no ChromaDB ",
       "persistente. Gera o relatório de chunks exigido pelo enunciado."),
    code(
        "import sys; sys.path.insert(0, 'src')\n",
        "!python src/chunking_e_index.py\n",
        "print(open('relatorios/chunking_embeddings.md', encoding='utf-8').read())",
    ),

    md("## 5. Geração dos pares de Q&A (Etapa 3) com o modelo base\n",
       "\n",
       "Os pares de treino são gerados pelo **próprio Llama 3.2 3B**, em modo ",
       "**extrativo e grounded**: para cada passagem do corpus, o modelo extrai perguntas ",
       "cujas respostas estão no texto (temperatura baixa). Cada par passa por uma ",
       "**verificação anti-alucinação** (`grounded()` em `src/gerar_qa.py`): respostas ",
       "com números que não aparecem na passagem de origem são descartadas. Isso usa o 3B ",
       "como extrator, não como fonte de conhecimento.\n",
       "\n",
       "> Reaproveita o modelo carregado abaixo. Tem checkpoint incremental: se a sessão ",
       "cair, reexecute esta célula que ela retoma de onde parou."),
    code(
        "import torch\n",
        "from unsloth import FastLanguageModel\n",
        "\n",
        "MODELO_BASE = 'meta-llama/Llama-3.2-3B-Instruct'\n",
        "# Carrega com contexto 2048: a geracao de Q&A usa prompt longo (passagem + instrucao\n",
        "# + espaco para a resposta). O fine-tuning adiante usa max_seq_length=1024, suficiente\n",
        "# para os pares Q&A e mais economico de memoria.\n",
        "MAX_SEQ_GEN = 2048\n",
        "MAX_SEQ_TREINO = 1024\n",
        "\n",
        "model, tokenizer = FastLanguageModel.from_pretrained(\n",
        "    model_name=MODELO_BASE, max_seq_length=MAX_SEQ_GEN,\n",
        "    dtype=None, load_in_4bit=True)  # 4-bit NF4 via bitsandbytes\n",
        "print('Modelo base carregado em 4-bit (contexto', MAX_SEQ_GEN, ').')",
    ),
    code(
        "from gerar_qa import gerar_pares\n",
        "FastLanguageModel.for_inference(model)  # modo geração\n",
        "total = gerar_pares(model, tokenizer, alvo=1000)\n",
        "print('Total de pares Q&A:', total)\n",
        "print(open('relatorios/qa_geracao.md', encoding='utf-8').read())",
    ),

    md("## 6. Fine-tuning QLoRA (Etapa 5)\n",
       "\n",
       "Ajuste supervisionado (SFT) com **QLoRA** (base em 4-bit + adaptador LoRA), único ",
       "caminho viável para um modelo 3B em GPU T4. Hiperparâmetros documentados no ",
       "planejamento (Etapa 1): `r=16`, `alpha=32`, `lr=2e-4`, cosine, 2 épocas, batch ",
       "efetivo 16, `max_seq_length=1024`."),
    code(
        "FastLanguageModel.for_training(model)\n",
        "model = FastLanguageModel.get_peft_model(\n",
        "    model, r=16, lora_alpha=32, lora_dropout=0.05,\n",
        "    target_modules=['q_proj','k_proj','v_proj','o_proj',\n",
        "                    'gate_proj','up_proj','down_proj'],\n",
        "    use_gradient_checkpointing='unsloth', random_state=42)\n",
        "print('Adaptador LoRA anexado.')",
    ),
    code(
        "import json\n",
        "from datasets import Dataset\n",
        "\n",
        "pares = [json.loads(l) for l in open('data/pares_qa.jsonl', encoding='utf-8')]\n",
        "print('Pares de treino:', len(pares))\n",
        "\n",
        "SYSTEM_FT = ('Você é um assistente especialista em edifícios verdes e Net Zero de '\n",
        "             'energia e água. Responda com precisão técnica, citando requisitos, '\n",
        "             'normas e números quando aplicável.')\n",
        "\n",
        "def to_text(ex):\n",
        "    msgs = [{'role':'system','content': SYSTEM_FT},\n",
        "            {'role':'user','content': ex['pergunta']},\n",
        "            {'role':'assistant','content': ex['resposta']}]\n",
        "    return {'text': tokenizer.apply_chat_template(msgs, tokenize=False)}\n",
        "\n",
        "ds = Dataset.from_list(pares).map(to_text, remove_columns=list(pares[0].keys()))\n",
        "ds = ds.train_test_split(test_size=0.05, seed=42)\n",
        "print(ds)",
    ),
    code(
        "from trl import SFTTrainer, SFTConfig\n",
        "\n",
        "trainer = SFTTrainer(\n",
        "    model=model, tokenizer=tokenizer,\n",
        "    train_dataset=ds['train'], eval_dataset=ds['test'],\n",
        "    args=SFTConfig(\n",
        "        per_device_train_batch_size=4, gradient_accumulation_steps=4,\n",
        "        warmup_ratio=0.05, num_train_epochs=2, learning_rate=2e-4,\n",
        "        lr_scheduler_type='cosine', logging_steps=10,\n",
        "        optim='paged_adamw_8bit', weight_decay=0.01, seed=42,\n",
        "        max_seq_length=MAX_SEQ_TREINO, dataset_text_field='text',\n",
        "        output_dir='outputs', report_to='none'))\n",
        "trainer.train()",
    ),
    code(
        "# Salva o adaptador LoRA treinado (Etapa 5 - 'salvar o adaptador para uso posterior')\n",
        "model.save_pretrained('adaptador_lora')\n",
        "tokenizer.save_pretrained('adaptador_lora')\n",
        "print('Adaptador salvo em adaptador_lora/.')\n",
        "# Opcional: subir para o Drive para não perder ao desconectar\n",
        "# from google.colab import drive; drive.mount('/content/drive')\n",
        "# !cp -r adaptador_lora /content/drive/MyDrive/gs_nlp_adaptador_lora",
    ),

    md("## 7. Avaliação: modelo base vs. ajustado (Etapa 6)\n",
       "\n",
       "10 perguntas técnicas cobrindo energia, água e certificações. Para cada uma, ",
       "comparamos a resposta do **modelo base** (sem ajuste) e do **modelo ajustado**, e ",
       "calculamos **BERTScore** contra respostas de referência escritas pelo aluno ",
       "(`relatorios/perguntas_referencia.json`). A análise qualitativa e a dos casos de ",
       "falha entram no relatório crítico (Etapa 8)."),
    code(
        "import json, torch\n",
        "from gerar_qa import RAIZ  # noqa\n",
        "perg_ref = json.loads(open('relatorios/perguntas_referencia.json', encoding='utf-8').read())\n",
        "perguntas = [p['pergunta'] for p in perg_ref]\n",
        "referencias = [p['referencia'] for p in perg_ref]\n",
        "print(f'{len(perguntas)} perguntas de avaliação carregadas.')",
    ),
    code(
        "def responder(model, pergunta, max_new=256):\n",
        "    msgs=[{'role':'system','content':SYSTEM_FT},{'role':'user','content':pergunta}]\n",
        "    inp = tokenizer.apply_chat_template(msgs, add_generation_prompt=True,\n",
        "                                         return_tensors='pt').to(model.device)\n",
        "    with torch.no_grad():\n",
        "        out = model.generate(inp, max_new_tokens=max_new, do_sample=False,\n",
        "                              pad_token_id=tokenizer.eos_token_id)\n",
        "    return tokenizer.decode(out[0][inp.shape[1]:], skip_special_tokens=True).strip()\n",
        "\n",
        "# respostas do modelo AJUSTADO (adaptador ativo)\n",
        "FastLanguageModel.for_inference(model)\n",
        "resp_ajustado = [responder(model, q) for q in perguntas]\n",
        "for q, r in zip(perguntas, resp_ajustado):\n",
        "    print('Q:', q); print('A:', r[:200], '\\n')",
    ),
    code(
        "# respostas do modelo BASE (desabilita o adaptador LoRA)\n",
        "with model.disable_adapter():\n",
        "    resp_base = [responder(model, q) for q in perguntas]\n",
        "print('Respostas do modelo base geradas.')",
    ),
    code(
        "import evaluate\n",
        "bertscore = evaluate.load('bertscore')\n",
        "def media_f1(preds):\n",
        "    r = bertscore.compute(predictions=preds, references=referencias,\n",
        "                          lang='pt', model_type='bert-base-multilingual-cased')\n",
        "    return sum(r['f1'])/len(r['f1'])\n",
        "\n",
        "f1_base = media_f1(resp_base)\n",
        "f1_ajustado = media_f1(resp_ajustado)\n",
        "print(f'BERTScore F1 - base:     {f1_base:.4f}')\n",
        "print(f'BERTScore F1 - ajustado: {f1_ajustado:.4f}')\n",
        "print(f'Delta: {f1_ajustado - f1_base:+.4f}')\n",
        "\n",
        "import json\n",
        "json.dump({'f1_base':f1_base,'f1_ajustado':f1_ajustado,\n",
        "           'perguntas':perguntas,'referencias':referencias,\n",
        "           'resp_base':resp_base,'resp_ajustado':resp_ajustado},\n",
        "          open('relatorios/avaliacao_resultado.json','w', encoding='utf-8'),\n",
        "          ensure_ascii=False, indent=2)\n",
        "print('Resultado salvo em relatorios/avaliacao_resultado.json')",
    ),

    md("## 8. Chatbot (Etapa 7)\n",
       "\n",
       "Interface conversacional do modelo ajustado, **com histórico de sessão** "
       "(multi-turno): cada pergunta é respondida no contexto das anteriores. A célula "
       "abaixo é a demonstração executável no próprio Colab.\n",
       "\n",
       "> A versão com interface gráfica (Streamlit) está em `app/chatbot_streamlit.py`, "
       "versionada no repo, para execução local com o adaptador salvo. Aqui no notebook "
       "usamos a versão em célula, que cumpre o mesmo requisito (conversa + histórico) "
       "sem depender de túnel."),
    code(
        "# Chat multi-turno com o modelo AJUSTADO. Mantem o historico da conversa e o\n",
        "# repassa ao modelo a cada pergunta (memoria de sessao). Use uma celula; rode-a\n",
        "# varias vezes para conversar. Digite 'sair' para encerrar e 'limpar' para zerar.\n",
        "FastLanguageModel.for_inference(model)\n",
        "historico = []  # lista de mensagens {'role','content'} acumulada na sessao\n",
        "\n",
        "def chat(pergunta):\n",
        "    historico.append({'role': 'user', 'content': pergunta})\n",
        "    msgs = [{'role': 'system', 'content': SYSTEM_FT}] + historico\n",
        "    inp = tokenizer.apply_chat_template(msgs, add_generation_prompt=True,\n",
        "                                         return_tensors='pt').to(model.device)\n",
        "    with torch.no_grad():\n",
        "        out = model.generate(inp, max_new_tokens=300, do_sample=True,\n",
        "                              temperature=0.3, top_p=0.9,\n",
        "                              pad_token_id=tokenizer.eos_token_id)\n",
        "    resp = tokenizer.decode(out[0][inp.shape[1]:], skip_special_tokens=True).strip()\n",
        "    historico.append({'role': 'assistant', 'content': resp})\n",
        "    return resp\n",
        "\n",
        "# Demonstracao automatica (2 turnos encadeados, mostrando que ha memoria):\n",
        "print('Q1:', 'O que e uma edificacao Net Zero de energia?')\n",
        "print('A1:', chat('O que e uma edificacao Net Zero de energia?'), '\\n')\n",
        "print('Q2 (referindo-se a anterior):', 'E quanto a agua, como isso se aplica?')\n",
        "print('A2:', chat('E quanto a agua, como isso se aplica?'))",
    ),
    code(
        "# Modo interativo opcional: descomente para conversar manualmente no Colab.\n",
        "# while True:\n",
        "#     p = input('Voce: ')\n",
        "#     if p.strip().lower() == 'sair': break\n",
        "#     if p.strip().lower() == 'limpar': historico.clear(); print('[historico zerado]'); continue\n",
        "#     print('Bot:', chat(p))",
    ),

    md("---\n",
       "Adaptador salvo em `adaptador_lora/`. Avaliação em ",
       "`relatorios/avaliacao_resultado.json`. O relatório crítico (Etapa 8) analisa as ",
       "10 perguntas, o impacto do fine-tuning, as métricas, as limitações e as melhorias ",
       "propostas."),
]


def build():
    nb = {
        "cells": cells,
        "metadata": {
            "accelerator": "GPU",
            "colab": {"provenance": [], "gpuType": "T4"},
            "kernelspec": {"display_name": "Python 3", "name": "python3"},
            "language_info": {"name": "python"},
        },
        "nbformat": 4,
        "nbformat_minor": 0,
    }
    NOTEBOOK_PATH.parent.mkdir(parents=True, exist_ok=True)
    NOTEBOOK_PATH.write_text(json.dumps(nb, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Notebook gerado: {NOTEBOOK_PATH} ({len(cells)} celulas)")


if __name__ == "__main__":
    build()
