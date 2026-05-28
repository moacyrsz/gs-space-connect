"""Execução local da lógica do Colab_SpaceTrain_Energy.ipynb.

Reproduz exatamente as células do notebook fornecido pela disciplina, sem
alterar o dataset nem os parâmetros dos três jobs obrigatórios. Saída
serve como evidência de execução para o relatório.
"""

import numpy as np
import pandas as pd

ARQUIVO = "dataset_spacetrain_energia_5h.csv"

dados = pd.read_csv(ARQUIVO)
print(dados.head().to_string())
print("Total de linhas:", len(dados))
print("Colunas:", list(dados.columns))
print("Quantidade de registros com risco crítico:", int(dados["risco_critico"].sum()))
print()

jobs = {
    "A - Edge espacial simples": {
        "features": ["temperatura_equipamento_c", "radiacao_relativa"],
        "epocas": 8,
        "contexto": "sensor local com poucas variáveis",
    },
    "B - Operação Terra-espaço": {
        "features": [
            "temperatura_equipamento_c",
            "radiacao_relativa",
            "perda_comunicacao_pct",
            "atraso_sinal_ms",
        ],
        "epocas": 15,
        "contexto": "operação com telemetria e comunicação",
    },
    "C - Escala ampliada": {
        "features": [
            "temperatura_equipamento_c",
            "radiacao_relativa",
            "perda_comunicacao_pct",
            "variacao_energia_pct",
            "atraso_sinal_ms",
            "indice_poeira",
        ],
        "epocas": 25,
        "contexto": "cenário com mais sensores e maior repetição",
    },
}


def sigmoid(z):
    z = np.clip(z, -40, 40)
    return 1 / (1 + np.exp(-z))


def treinar_rede_simples(df, features, target="risco_critico", epocas=10, taxa_aprendizado=0.08):
    X = df[features].values.astype(float)
    y = df[target].values.astype(float)

    rng = np.random.default_rng(123)
    indices = np.arange(len(df))
    rng.shuffle(indices)
    tamanho_treino = int(0.7 * len(df))
    idx_treino = indices[:tamanho_treino]
    idx_teste = indices[tamanho_treino:]

    X_treino, y_treino = X[idx_treino], y[idx_treino]
    X_teste, y_teste = X[idx_teste], y[idx_teste]

    media = X_treino.mean(axis=0)
    desvio = X_treino.std(axis=0)
    desvio[desvio == 0] = 1
    X_treino = (X_treino - media) / desvio
    X_teste = (X_teste - media) / desvio

    n_features = X_treino.shape[1]
    pesos = np.zeros(n_features)
    bias = 0.0

    RAM = 0
    Registradores = 0
    ULA = 0
    forwards = 0
    atualizacoes = 0

    for _ in range(epocas):
        for xi, yi in zip(X_treino, y_treino):
            RAM += n_features
            RAM += n_features
            RAM += 1
            Registradores += 2 * n_features + 2
            ULA += n_features
            ULA += max(n_features - 1, 1)
            ULA += 1
            ULA += 4

            z = np.dot(xi, pesos) + bias
            prob = sigmoid(z)
            forwards += 1

            RAM += 1
            Registradores += n_features + 4
            ULA += 1
            erro = prob - yi

            grad_pesos = erro * xi
            grad_bias = erro
            ULA += 2 * n_features + 2
            RAM += n_features + 1

            pesos -= taxa_aprendizado * grad_pesos
            bias -= taxa_aprendizado * grad_bias
            atualizacoes += 1

    probabilidades = sigmoid(np.dot(X_teste, pesos) + bias)
    predicoes = (probabilidades >= 0.5).astype(int)
    acuracia = (predicoes == y_teste).mean()

    energia_pJ = 640 * RAM + 5 * Registradores + 10 * ULA

    return {
        "n_amostras_treino": len(X_treino),
        "n_amostras_teste": len(X_teste),
        "n_features": n_features,
        "epocas": epocas,
        "forwards": forwards,
        "atualizacoes": atualizacoes,
        "RAM": RAM,
        "Registradores": Registradores,
        "ULA": ULA,
        "energia_treino_pJ": energia_pJ,
        "energia_treino_J": energia_pJ * 1e-12,
        "acuracia_teste": acuracia,
    }


def classificar_infraestrutura(energia_pJ):
    if energia_pJ <= 1e10:
        return "Máquina local"
    if energia_pJ <= 1e12:
        return "Workstation/GPU"
    if energia_pJ <= 1e14:
        return "Cluster"
    return "Supercomputador ou revisão arquitetural/neuromórfica"


resultados = []
for nome_job, config in jobs.items():
    saida = treinar_rede_simples(dados, features=config["features"], epocas=config["epocas"])
    saida["job"] = nome_job
    saida["contexto"] = config["contexto"]
    resultados.append(saida)

resultado_jobs = pd.DataFrame(resultados)[
    [
        "job",
        "contexto",
        "n_amostras_treino",
        "n_features",
        "epocas",
        "forwards",
        "atualizacoes",
        "RAM",
        "Registradores",
        "ULA",
        "energia_treino_pJ",
        "energia_treino_J",
        "acuracia_teste",
    ]
]
print("TABELA 1 - Resultado dos jobs")
print(resultado_jobs.to_string(index=False))
print()

escalas = [
    {"escala": "Protótipo didático", "amostras": 10_000, "epocas": 20},
    {"escala": "Operação regional", "amostras": 200_000, "epocas": 50},
    {"escala": "Constelação global", "amostras": 10_000_000, "epocas": 100},
    {"escala": "Missão massiva", "amostras": 100_000_000, "epocas": 200},
]

projecoes = []
for _, linha in resultado_jobs.iterrows():
    energia_por_amostra_epoca = linha["energia_treino_pJ"] / (linha["n_amostras_treino"] * linha["epocas"])
    for escala in escalas:
        energia_estimada = energia_por_amostra_epoca * escala["amostras"] * escala["epocas"]
        projecoes.append(
            {
                "job": linha["job"],
                "escala": escala["escala"],
                "amostras": escala["amostras"],
                "epocas": escala["epocas"],
                "energia_estimada_pJ": energia_estimada,
                "energia_estimada_J": energia_estimada * 1e-12,
                "decisao_infraestrutura": classificar_infraestrutura(energia_estimada),
            }
        )

resultado_escala = pd.DataFrame(projecoes)
print("TABELA 2 - Projeção de escala")
print(resultado_escala.to_string(index=False))
print()

print("RESUMO PARA O RELATÓRIO")
print("=" * 60)
for _, linha in resultado_jobs.iterrows():
    print(
        f"{linha['job']}: features={linha['n_features']}, épocas={linha['epocas']},"
        f" RAM={linha['RAM']}, Registradores={linha['Registradores']}, ULA={linha['ULA']},"
        f" energia={linha['energia_treino_pJ']:.0f} pJ, acurácia={linha['acuracia_teste']:.3f}"
    )
print()
print("Projeção de infraestrutura:")
for _, linha in resultado_escala.iterrows():
    print(
        f"{linha['job']} | {linha['escala']} | energia={linha['energia_estimada_pJ']:.2e} pJ"
        f" | {linha['decisao_infraestrutura']}"
    )

resultado_jobs.to_csv("resultado_jobs.csv", index=False)
resultado_escala.to_csv("resultado_escala.csv", index=False)
