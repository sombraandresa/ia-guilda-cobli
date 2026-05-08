export const STATUS_COLORS: Record<string, string> = {
  ideia: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  em_desenvolvimento: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  piloto: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  beta_privado: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  producao: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

export const URGENCY_COLORS: Record<string, string> = {
  baixa: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  media: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  alta: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  critica: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export const TYPE_ICONS: Record<string, string> = {
  automacao: "Zap",
  modelo_ml: "Brain",
  pipeline_dados: "Database",
  chatbot: "MessageSquare",
  dashboard: "BarChart3",
  integracao: "Plug",
};
