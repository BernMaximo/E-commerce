export const COMPANY_CONFIG = {
  name: 'MXM Maintenance',
  shortName: 'MXM',
  tagline: 'Assistência Técnica Especializada em Eletrônica & Peças',
  phoneDisplay: '+55 69 99212-9777',
  whatsappRaw: '5569992129777',
  email: 'contato@mxmmaintenance.com.br',
  address: 'Rondônia, Brasil',
  businessHours: 'Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 12:00',
  defaultMessage: 'Olá, equipe da MXM Maintenance! Gostaria de solicitar um orçamento para manutenção de um equipamento eletrônico.',
  logos: {
    dark: '/images/logo-dark.png',
    white: '/images/logo-white.png',
  },
  services: [
    {
      id: 'placas',
      name: 'Placas & Microeletrônica',
      description: 'Reparo avançado em nível de componentes, curto-circuito, solda BGA/SMD e reballing.',
      icon: 'Cpu',
    },
    {
      id: 'tvs',
      name: 'TVs e Monitores',
      description: 'Manutenção em placas de fonte, placas principais, iluminação LED e substituição de componentes.',
      icon: 'Tv',
    },
    {
      id: 'notebooks',
      name: 'Notebooks e Computadores',
      description: 'Diagnóstico de placas-mãe que não ligam, recuperação de trilhas, gravação de BIOS e upgrades.',
      icon: 'Laptop',
    },
    {
      id: 'audio-fontes',
      name: 'Fontes & Equipamentos de Áudio',
      description: 'Conserto de fontes chaveadas, amplificadores, mesas de som, módulos e nobreaks.',
      icon: 'Speaker',
    },
  ],
  deviceTypes: [
    'TV / Monitor',
    'Placa-Mãe / Microeletrônica',
    'Notebook / Desktop',
    'Aparelho de Som / Módulo',
    'Fonte Chaveada / Nobreak',
    'Outro Equipamento',
  ],
};

export function getWhatsAppUrl(customMessage?: string): string {
  const message = customMessage || COMPANY_CONFIG.defaultMessage;
  return `https://wa.me/${COMPANY_CONFIG.whatsappRaw}?text=${encodeURIComponent(message)}`;
}
