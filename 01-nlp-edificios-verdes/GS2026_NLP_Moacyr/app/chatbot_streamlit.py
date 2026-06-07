#!/usr/bin/env python3
"""Etapa 7 — Chatbot conversacional do assistente de Edificios Verdes / Net Zero.

Interface Streamlit que carrega o modelo Llama 3.2 3B ajustado (base + adaptador
LoRA treinado na Etapa 5) e responde perguntas tecnicas sobre edificios verdes e
Net Zero de energia e agua.

Requisitos atendidos:
  - mantem o historico da conversa dentro da sessao (st.session_state);
  - aceita perguntas em linguagem natural e responde de forma clara e estruturada;
  - RAG OPCIONAL (chave na barra lateral): recupera trechos do corpus no ChromaDB
    e os injeta como contexto, complementando o conhecimento do fine-tuning.

Execucao:
  - Local (apos copiar o adaptador para ADAPTADOR_DIR):  streamlit run app/chatbot_streamlit.py
  - Colab: subir com streamlit + tunel (cloudflared/pyngrok) — ver README.

Robustez: se o adaptador nao for encontrado, usa o modelo base e avisa na UI, para
a interface nunca ficar inutilizavel durante uma demonstracao.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

import streamlit as st

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "src"))

MODELO_BASE = "meta-llama/Llama-3.2-3B-Instruct"
ADAPTADOR_DIR = RAIZ / "adaptador_lora"
SYSTEM = ("Você é um assistente especialista em edifícios verdes e Net Zero de "
          "energia e água. Responda com precisão técnica, citando requisitos, normas "
          "e números quando aplicável. Se a pergunta fugir do domínio, diga isso.")

st.set_page_config(page_title="Assistente Edificios Verdes / Net Zero", page_icon="🏢")


@st.cache_resource(show_spinner="Carregando modelo (primeira vez demora)…")
def carregar_modelo():
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer

    token = os.environ.get("HF_TOKEN")
    tok = AutoTokenizer.from_pretrained(MODELO_BASE, token=token)
    base = AutoModelForCausalLM.from_pretrained(
        MODELO_BASE, token=token, device_map="auto",
        torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32)
    usou_adaptador = False
    if ADAPTADOR_DIR.exists():
        try:
            from peft import PeftModel
            base = PeftModel.from_pretrained(base, str(ADAPTADOR_DIR))
            usou_adaptador = True
        except Exception as e:
            st.warning(f"Adaptador encontrado mas nao carregou ({e}). Usando base.")
    base.eval()
    return tok, base, usou_adaptador


@st.cache_resource(show_spinner="Carregando indice RAG…")
def carregar_retriever():
    import retriever
    if not retriever.disponivel():
        return None
    try:
        return retriever.Retriever()
    except Exception:
        return None


def gerar_resposta(tok, model, mensagens, contexto: str | None) -> str:
    import torch
    msgs = [{"role": "system", "content": SYSTEM}]
    if contexto:
        msgs.append({"role": "system",
                     "content": "Contexto recuperado do corpus tecnico:\n" + contexto})
    msgs += mensagens
    inp = tok.apply_chat_template(msgs, add_generation_prompt=True,
                                  return_tensors="pt").to(model.device)
    with torch.no_grad():
        out = model.generate(inp, max_new_tokens=400, do_sample=True,
                             temperature=0.3, top_p=0.9,
                             pad_token_id=tok.eos_token_id)
    return tok.decode(out[0][inp.shape[1]:], skip_special_tokens=True).strip()


# ---------------- UI ----------------
st.title("🏢 Assistente de Edificios Verdes / Net Zero")
st.caption("GS 2026.1 — NLP — Moacyr Cabral da Silva (RM 559263). "
           "Llama 3.2 3B ajustado por QLoRA em corpus tecnico de energia e agua.")

with st.sidebar:
    st.header("Configuracao")
    usar_rag = st.toggle("Usar RAG (contexto do corpus)", value=False,
                         help="Recupera trechos do ChromaDB para complementar o "
                              "conhecimento incorporado pelo fine-tuning.")
    if st.button("Limpar conversa"):
        st.session_state.mensagens = []
        st.rerun()

tok, model, usou_adaptador = carregar_modelo()
st.sidebar.success("Modelo ajustado (LoRA) carregado." if usou_adaptador
                   else "Adaptador ausente — usando modelo base.")
retr = carregar_retriever() if usar_rag else None
if usar_rag and retr is None:
    st.sidebar.info("Indice RAG indisponivel (rode a Etapa 4). Respondendo sem RAG.")

if "mensagens" not in st.session_state:
    st.session_state.mensagens = []

for m in st.session_state.mensagens:
    with st.chat_message(m["role"]):
        st.markdown(m["content"])

if pergunta := st.chat_input("Pergunte sobre eficiencia energetica, agua, LEED, NBR…"):
    st.session_state.mensagens.append({"role": "user", "content": pergunta})
    with st.chat_message("user"):
        st.markdown(pergunta)
    with st.chat_message("assistant"):
        contexto = retr.contexto(pergunta) if retr else None
        with st.spinner("Pensando…"):
            resposta = gerar_resposta(tok, model, st.session_state.mensagens, contexto)
        st.markdown(resposta)
        if contexto:
            with st.expander("Trechos recuperados (RAG)"):
                st.text(contexto[:2000])
    st.session_state.mensagens.append({"role": "assistant", "content": resposta})
