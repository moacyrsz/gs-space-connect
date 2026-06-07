#!/usr/bin/env python3
"""Gera o notebook Colab da disciplina de NLP (chatbot Edificios Verdes / Net Zero).

Mantem o conteudo em Python aqui (mais legivel para revisao e diff) e exporta o
.ipynb em formato Jupyter v4. Rodar sempre que o conteudo for alterado:

    python build_notebook.py

O notebook cobre, em ordem, as fases que o criterio de avaliacao da disciplina
exige no mesmo artefato (30%): corpus -> pre-processamento -> chunking -> embeddings
-> indexacao -> geracao de Q&A (Llama 3.2 3B) -> fine-tuning QLoRA -> avaliacao
base vs ajustado -> chatbot. As fases locais (corpus/limpeza/embeddings) sao
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
        "# Chatbot Especialista em Edificios Verdes / Net Zero de Energia e Agua\n",
        "\n",
        "**GS 2026.1 - Space Connect**  \n",
        "**Aluno:** Moacyr Cabral da Silva - RM 559263  \n",
        "**Disciplina:** Processamento de Linguagem Natural, Chatbots & Virtual Agents  \n",
        "**Atividade:** Chat Bot com LLM fine tunned  \n",
        "**Entrega:** 2026-06-09\n",
        "\n",
        "Fine-tuning **QLoRA** de `meta-llama/Llama-3.2-3B-Instruct` em um corpus tecnico ",
        "proprio sobre edificios capazes de suprir metade ou todas as suas necessidades de ",
        "agua e energia sem depender de fontes externas.\n",
        "\n",
        "**Pipeline (todas as fases neste notebook):** clonar repo -> ambiente -> corpus + ",
        "limpeza (versionados) -> chunking + embeddings + ChromaDB -> geracao de pares Q&A ",
        "com o proprio modelo base -> fine-tuning QLoRA -> avaliacao base vs ajustado -> ",
        "chatbot.\n",
        "\n",
        "> **Runtime:** Colab com GPU **T4** (Runtime -> Change runtime type -> T4 GPU).",
    ),

    md("## 0. Ambiente\n",
       "\n",
       "Verifica a GPU e instala as dependencias de fine-tuning. `unsloth` acelera o ",
       "treino de Llama em T4 e ja traz `transformers`/`peft`/`trl`/`bitsandbytes` ",
       "compativeis."),
    code("!nvidia-smi"),
    code(
        "%%capture\n",
        "# unsloth puxa versoes compativeis de transformers/peft/trl/bitsandbytes para T4\n",
        "!pip install -q \"unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git\"\n",
        "!pip install -q sentence-transformers chromadb evaluate bert_score sacrebleu rouge_score\n",
        "!pip install -q pymupdf python-dotenv",
    ),

    md("## 1. Clonar o repositorio e posicionar na pasta da disciplina\n",
       "\n",
       "O corpus (PDFs), os textos ja limpos e os scripts-fonte (`src/`) estao ",
       "versionados. Assim o notebook reexecuta as fases locais de forma reproduzivel."),
    code(
        f"!git clone --depth 1 {REPO_URL}\n",
        f"%cd {SUBDIR}\n",
        "!ls -R src corpus data | head -40",
    ),

    md("## 2. Autenticacao no Hugging Face\n",
       "\n",
       "O Llama 3.2 e um modelo *gated*: requer aceite da licenca Meta e um token de ",
       "acesso (tipo *read*). O token e pedido de forma interativa e **nao** fica salvo ",
       "no notebook."),
    code(
        "from getpass import getpass\n",
        "from huggingface_hub import login\n",
        "login(getpass('Cole seu Hugging Face token (read): '))",
    ),

    md("## 3. Corpus e pre-processamento\n",
       "\n",
       "O corpus tem **14 documentos tecnicos** em 3 categorias (normas/certificacao, ",
       "relatorios tecnico-cientificos e manuais de tecnologias habilitadoras), com ",
       "metadados em `corpus/metadata.json`. A extracao e limpeza (remocao de ",
       "cabecalhos/rodapes, numeros de pagina e juncao de hifenizacao, preservando ",
       "tabelas e requisitos numerados) ja foi aplicada e versionada em ",
       "`data/textos_limpos.jsonl`. A celula abaixo apenas confirma o material."),
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

    md("## 4. Chunking, embeddings e indexacao vetorial (ChromaDB)\n",
       "\n",
       "Segmenta em chunks de ~512 tokens com 25% de sobreposicao, gera embeddings com ",
       "`intfloat/multilingual-e5-large` (prefixo `passage:`) e indexa no ChromaDB ",
       "persistente. Gera o relatorio de chunks exigido pelo enunciado."),
    code(
        "import sys; sys.path.insert(0, 'src')\n",
        "!python src/chunking_e_index.py\n",
        "print(open('relatorios/chunking_embeddings.md', encoding='utf-8').read())",
    ),

    md("## 5. Geracao dos pares de Q&A (Etapa 3) com o modelo base\n",
       "\n",
       "Os pares de treino sao gerados pelo **proprio Llama 3.2 3B**, em modo ",
       "**extrativo e grounded**: para cada passagem do corpus, o modelo extrai perguntas ",
       "cujas respostas estao no texto (temperatura baixa). Cada par passa por uma ",
       "**verificacao anti-alucinacao** (`grounded()` em `src/gerar_qa.py`): respostas ",
       "com numeros que nao aparecem na passagem de origem sao descartadas. Isso usa o 3B ",
       "como extrator, nao como fonte de conhecimento.\n",
       "\n",
       "> Reaproveita o modelo carregado abaixo. Tem checkpoint incremental: se a sessao ",
       "cair, reexecute esta celula que ela retoma de onde parou."),
    code(
        "import torch\n",
        "from unsloth import FastLanguageModel\n",
        "\n",
        "MODELO_BASE = 'meta-llama/Llama-3.2-3B-Instruct'\n",
        "MAX_SEQ = 1024\n",
        "\n",
        "model, tokenizer = FastLanguageModel.from_pretrained(\n",
        "    model_name=MODELO_BASE, max_seq_length=MAX_SEQ,\n",
        "    dtype=None, load_in_4bit=True)  # 4-bit NF4 via bitsandbytes\n",
        "print('Modelo base carregado em 4-bit.')",
    ),
    code(
        "from gerar_qa import gerar_pares\n",
        "FastLanguageModel.for_inference(model)  # modo geracao\n",
        "total = gerar_pares(model, tokenizer, alvo=1000)\n",
        "print('Total de pares Q&A:', total)\n",
        "print(open('relatorios/qa_geracao.md', encoding='utf-8').read())",
    ),

    md("## 6. Fine-tuning QLoRA (Etapa 5)\n",
       "\n",
       "Ajuste supervisionado (SFT) com **QLoRA** (base em 4-bit + adaptador LoRA), unico ",
       "caminho viavel para um modelo 3B em GPU T4. Hiperparametros documentados no ",
       "planejamento (Etapa 1): `r=16`, `alpha=32`, `lr=2e-4`, cosine, 2 epocas, batch ",
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
        "SYSTEM_FT = ('Voce e um assistente especialista em edificios verdes e Net Zero de '\n",
        "             'energia e agua. Responda com precisao tecnica, citando requisitos, '\n",
        "             'normas e numeros quando aplicavel.')\n",
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
        "        max_seq_length=MAX_SEQ, dataset_text_field='text',\n",
        "        output_dir='outputs', report_to='none'))\n",
        "trainer.train()",
    ),
    code(
        "# Salva o adaptador LoRA treinado (Etapa 5 — 'salvar o adaptador para uso posterior')\n",
        "model.save_pretrained('adaptador_lora')\n",
        "tokenizer.save_pretrained('adaptador_lora')\n",
        "print('Adaptador salvo em adaptador_lora/.')\n",
        "# Opcional: subir para o Drive para nao perder ao desconectar\n",
        "# from google.colab import drive; drive.mount('/content/drive')\n",
        "# !cp -r adaptador_lora /content/drive/MyDrive/gs_nlp_adaptador_lora",
    ),

    md("## 7. Avaliacao: modelo base vs. ajustado (Etapa 6)\n",
       "\n",
       "10 perguntas tecnicas cobrindo energia, agua e certificacoes. Para cada uma, ",
       "comparamos a resposta do **modelo base** (sem ajuste) e do **modelo ajustado**, e ",
       "calculamos **BERTScore** contra respostas de referencia escritas pelo aluno ",
       "(`relatorios/perguntas_referencia.json`). A analise qualitativa e dos casos de ",
       "falha entra no relatorio critico (Etapa 8)."),
    code(
        "import json, torch\n",
        "from gerar_qa import RAIZ  # noqa\n",
        "perg_ref = json.loads(open('relatorios/perguntas_referencia.json', encoding='utf-8').read())\n",
        "perguntas = [p['pergunta'] for p in perg_ref]\n",
        "referencias = [p['referencia'] for p in perg_ref]\n",
        "print(f'{len(perguntas)} perguntas de avaliacao carregadas.')",
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
       "O chatbot conversacional (Streamlit + historico de sessao + RAG opcional sobre o ",
       "ChromaDB) esta em `app/chatbot_streamlit.py`, versionado no repo. Para demonstrar ",
       "no proprio Colab, suba via `streamlit` + um tunel (`cloudflared`/`pyngrok`). ",
       "Veja as instrucoes no `README.md` da pasta."),
    code(
        "# Demonstracao opcional do chatbot no Colab (ver README para o passo a passo do tunel):\n",
        "# !pip install -q streamlit pyngrok\n",
        "# !streamlit run app/chatbot_streamlit.py &>/dev/null &\n",
        "# from pyngrok import ngrok; print(ngrok.connect(8501))",
    ),

    md("---\n",
       "Adaptador salvo em `adaptador_lora/`. Avaliacao em ",
       "`relatorios/avaliacao_resultado.json`. O relatorio critico (Etapa 8) analisa as ",
       "10 perguntas, o impacto do fine-tuning, as metricas, as limitacoes e as melhorias ",
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
