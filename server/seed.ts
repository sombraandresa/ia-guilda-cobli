import { db } from "./db";
import { projects, trainings, teams, DEFAULT_TEAMS } from "@shared/schema";

const seedProjects = [
  {
    title: "Classificador de Chamados CS",
    status: "em_andamento",
    type: "modelo_ml",
    tags: ["NLP", "classificacao", "suporte"],
    team: "CS",
    owner: "Marina Costa",
    summary: "Modelo de ML que classifica automaticamente chamados de suporte por categoria e prioridade usando NLP.",
    problem: "Time de CS gasta 40% do tempo classificando chamados manualmente, causando atraso no atendimento e erros de roteamento.",
    solution: "Treinamos um modelo BERT fine-tuned com historico de 50k chamados para classificar automaticamente em 12 categorias com 94% de acuracia.",
    dataDependencies: "Base de chamados Zendesk, historico de classificacoes manuais, taxonomia de categorias CS.",
    risks: "Drift do modelo com novas categorias de produto. Necessidade de retreinamento trimestral.",
    metrics: "Acuracia: 94%, Tempo medio de classificacao: 0.3s vs 2min manual, Reducao de roteamento errado: 67%.",
    links: { doc: "https://docs.google.com/doc/classificador-cs", repo: "https://github.com/cobli/classificador-cs", n8n: "https://n8n.cobli.co/workflow/12" },
  },
  {
    title: "Pipeline de Dados Telemetria",
    status: "concluido",
    type: "pipeline_dados",
    tags: ["ETL", "telemetria", "BigQuery"],
    team: "Engenharia",
    owner: "Rafael Mendes",
    summary: "Pipeline automatizado que processa dados de telemetria de veiculos em tempo real para analytics e alertas.",
    problem: "Dados de telemetria chegavam com atraso de 6h e muitos erros de parsing, impedindo alertas em tempo real.",
    solution: "Arquitetura com Pub/Sub + Dataflow para processamento streaming, validacao em tempo real e carga no BigQuery.",
    dataDependencies: "API de telemetria dos dispositivos, BigQuery, Pub/Sub GCP.",
    risks: "Custo de processamento pode escalar com aumento da frota. Limitacao de 10k mensagens/s no Pub/Sub.",
    metrics: "Latencia: 6h para 30s, Erros de parsing: 15% para 0.3%, Disponibilidade: 99.9%.",
    links: { doc: "https://docs.google.com/doc/pipeline-telemetria", repo: "https://github.com/cobli/pipeline-telemetria", dashboard: "https://datastudio.google.com/cobli-telemetria" },
  },
  {
    title: "Chatbot Interno de Onboarding",
    status: "em_andamento",
    type: "chatbot",
    tags: ["LLM", "RAG", "onboarding", "RH"],
    team: "Produto",
    owner: "Juliana Ferreira",
    summary: "Chatbot baseado em RAG que responde duvidas de novos colaboradores sobre processos, ferramentas e cultura.",
    problem: "Novos colaboradores levam 3 semanas para se familiarizar com processos internos. RH gasta 8h/semana respondendo perguntas repetitivas.",
    solution: "Chatbot com GPT-4 + RAG indexando wiki interna, handbook e FAQs. Interface no Slack para acesso facil.",
    dataDependencies: "Wiki Notion, handbook PDF, base de FAQs do RH, historico de perguntas Slack.",
    risks: "Alucinacoes do modelo em topicos sensiveis (beneficios, salario). Necessidade de moderacao humana.",
    metrics: "Perguntas respondidas automaticamente: 78%, Satisfacao do usuario: 4.2/5, Reducao de carga RH: 60%.",
    links: { doc: "https://docs.google.com/doc/chatbot-onboarding", repo: "https://github.com/cobli/chatbot-onboarding", n8n: "https://n8n.cobli.co/workflow/25" },
  },
  {
    title: "Automacao de Relatorios Financeiros",
    status: "concluido",
    type: "automacao",
    tags: ["n8n", "financeiro", "relatorios"],
    team: "Financeiro",
    owner: "Carlos Andrade",
    summary: "Workflow n8n que gera e distribui relatorios financeiros automaticamente toda segunda-feira.",
    problem: "Analista financeiro gastava 6h toda segunda compilando dados de 5 fontes diferentes para gerar relatorios semanais.",
    solution: "Workflow n8n que puxa dados de ERP, Stripe, Hubspot, BigQuery e Google Sheets, gera PDF e envia por email/Slack.",
    dataDependencies: "API do ERP (SAP), API Stripe, Hubspot, BigQuery dataset financeiro, Google Sheets templates.",
    risks: "Mudancas nas APIs podem quebrar o workflow. Dados financeiros sensiveis transitando entre servicos.",
    metrics: "Tempo de geracao: 6h para 12min, Erros manuais eliminados, Economia: 24h/mes do analista.",
    links: { n8n: "https://n8n.cobli.co/workflow/8", dashboard: "https://datastudio.google.com/cobli-financeiro" },
  },
  {
    title: "Detector de Anomalias na Frota",
    status: "planejado",
    type: "modelo_ml",
    tags: ["anomalia", "IoT", "frota", "manutencao"],
    team: "Data Science",
    owner: "Ana Beatriz Silva",
    summary: "Modelo preditivo que detecta comportamento anomalo de veiculos para antecipar falhas mecanicas.",
    problem: "Falhas mecanicas inesperadas causam paradas de 48h em media e custos de R$5k por evento. 30% poderiam ser prevenidas.",
    solution: "Isolation Forest + Autoencoder treinado com dados de telemetria para detectar padroes anomalos 72h antes da falha.",
    dataDependencies: "Dados de telemetria em tempo real, historico de manutencoes, catalogo de pecas e custos.",
    risks: "Falsos positivos podem causar manutencoes desnecessarias. Modelo depende de qualidade dos sensores IoT.",
    metrics: "Meta: detectar 70% das falhas com 72h de antecedencia, reduzir custo de manutencao em 25%.",
    links: { doc: "https://docs.google.com/doc/detector-anomalias" },
  },
  {
    title: "Dashboard de Performance Comercial",
    status: "em_andamento",
    type: "dashboard",
    tags: ["metabase", "vendas", "KPIs"],
    team: "Growth",
    owner: "Pedro Oliveira",
    summary: "Dashboard interativo com KPIs de vendas, conversao e previsao de receita usando Metabase + dbt.",
    problem: "Diretoria pedia relatorios ad-hoc toda semana. Dados estavam fragmentados em 4 ferramentas diferentes.",
    solution: "Modelagem dbt unificando Hubspot, Stripe, e CRM interno. Dashboard Metabase com filtros dinamicos e drill-down.",
    dataDependencies: "Hubspot API, Stripe API, CRM interno PostgreSQL, modelos dbt no BigQuery.",
    risks: "Dados de CRM tem qualidade inconsistente. Metabase pode ter problemas de performance com queries complexas.",
    metrics: "Tempo para gerar relatorio: 4h para 0, Adocao pela diretoria: 100%, Queries ad-hoc reduzidas em 80%.",
    links: { doc: "https://docs.google.com/doc/dashboard-comercial", dashboard: "https://metabase.cobli.co/dashboard/42" },
  },
  {
    title: "Integracao Jira-Slack para Alertas",
    status: "pausado",
    type: "integracao",
    tags: ["Jira", "Slack", "alertas", "n8n"],
    team: "Engenharia",
    owner: "Lucas Rocha",
    summary: "Integracao que envia notificacoes inteligentes no Slack baseadas em mudancas de status e SLAs do Jira.",
    problem: "Engenheiros perdem atualizacoes criticas de tickets e violam SLAs porque nao monitoram o Jira constantemente.",
    solution: "Webhook Jira → n8n com regras de filtro inteligentes → notificacao contextualizada no canal Slack apropriado.",
    dataDependencies: "API Jira, Slack API, mapeamento de equipes/canais, regras de SLA.",
    risks: "Volume de notificacoes pode causar 'alert fatigue'. Webhook do Jira pode perder eventos.",
    metrics: "Violacoes de SLA reduzidas em 45%, Tempo de resposta a tickets criticos: 2h para 30min.",
    links: { n8n: "https://n8n.cobli.co/workflow/15", repo: "https://github.com/cobli/jira-slack-alerts" },
  },
];

const seedTrainings = [
  {
    title: "n8n - Automacao de Workflows",
    description: "Aprenda a criar workflows de automacao sem codigo usando n8n. Cobre desde triggers basicos ate integracao com APIs externas e logica condicional.",
    link: "https://docs.n8n.io/courses/",
    category: "ferramenta",
  },
  {
    title: "Google AI Studio - Prototipagem com Gemini",
    description: "Tutorial oficial do Google AI Studio para testar e prototipar prompts com modelos Gemini. Ideal para quem quer explorar capacidades de LLM rapidamente.",
    link: "https://aistudio.google.com/",
    category: "plataforma",
  },
  {
    title: "Prompt Engineering Guide",
    description: "Guia completo de tecnicas de prompt engineering: few-shot, chain-of-thought, ReAct, e boas praticas para obter melhores resultados com LLMs.",
    link: "https://www.promptingguide.ai/",
    category: "conceito",
  },
  {
    title: "LangChain - Framework para Apps com LLM",
    description: "Introducao ao LangChain para construir aplicacoes com LLMs, incluindo RAG, agentes, chains e integracao com bases de dados vetoriais.",
    link: "https://python.langchain.com/docs/get_started/introduction",
    category: "framework",
  },
  {
    title: "Hugging Face - Modelos e Datasets",
    description: "Plataforma para descobrir, treinar e deployar modelos de ML. Inclui milhares de modelos pre-treinados e datasets para NLP, visao computacional e mais.",
    link: "https://huggingface.co/learn",
    category: "plataforma",
  },
  {
    title: "dbt - Transformacao de Dados",
    description: "Aprenda dbt para transformar dados no seu data warehouse. Cobre modelos, testes, documentacao e boas praticas de analytics engineering.",
    link: "https://courses.getdbt.com/",
    category: "ferramenta",
  },
  {
    title: "RAG - Retrieval Augmented Generation",
    description: "Conceitos e implementacao de RAG para combinar busca em documentos com geracao de texto via LLMs, reduzindo alucinacoes e melhorando acuracia.",
    link: "https://www.pinecone.io/learn/retrieval-augmented-generation/",
    category: "conceito",
  },
  {
    title: "MLflow - Gestao de Experimentos ML",
    description: "Ferramenta open-source para tracking de experimentos, empacotamento de modelos e deploy. Essencial para reproducibilidade em projetos de ML.",
    link: "https://mlflow.org/docs/latest/tutorials-and-examples/index.html",
    category: "ferramenta",
  },
];

export async function seedDatabase() {
  const existingTeams = await db.select({ id: teams.id }).from(teams).limit(1);
  if (existingTeams.length === 0) {
    console.log("Seeding database with default teams...");
    for (const name of DEFAULT_TEAMS) {
      await db.insert(teams).values({ name });
    }
    console.log(`Seeded ${DEFAULT_TEAMS.length} teams.`);
  }

  const existingProjects = await db.select({ id: projects.id }).from(projects).limit(1);
  if (existingProjects.length === 0) {
    console.log("Seeding database with sample projects...");
    for (const project of seedProjects) {
      await db.insert(projects).values(project);
    }
    console.log(`Seeded ${seedProjects.length} projects.`);
  }

  const existingTrainings = await db.select({ id: trainings.id }).from(trainings).limit(1);
  if (existingTrainings.length === 0) {
    console.log("Seeding database with sample trainings...");
    for (const training of seedTrainings) {
      await db.insert(trainings).values(training);
    }
    console.log(`Seeded ${seedTrainings.length} trainings.`);
  }
}
