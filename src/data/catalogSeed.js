/* Conteúdo inicial do catálogo; scripts/seed-firebase.js carrega estes dados no Firestore. */

export const ALL_INTERESTS = [
  'Inteligência Artificial',
  'Engenharia de Software',
  'Biotecnologia',
  'Direito Constitucional',
  'Medicina',
  'Robótica'
];

export const POPULAR_TAGS = [
  'Direito Constitucional',
  'Inteligência Artificial',
  'Engenharia de Software',
  'Medicina'
];

export const QUICK_RESOURCES = [
  {
    id: 'acervo',
    title: 'Acervo da Biblioteca',
    description: 'Consulte livros físicos, e-books e revistas científicas disponíveis na Biblioteca Unifor.',
    action: 'Acessar acervo',
    icon: 'book',
    query: 'Biblioteca'
  },
  {
    id: 'trabalhos',
    title: 'Trabalhos Acadêmicos',
    description: 'Repositório de TCCs, dissertações de mestrado e teses de doutorado publicadas.',
    action: 'Explorar repositório',
    icon: 'file',
    query: 'TCC'
  },
  {
    id: 'monitoria',
    title: 'Programas de Monitoria',
    description: 'Encontre horários e monitores das disciplinas do seu curso de graduação.',
    action: 'Ver monitores',
    icon: 'users',
    query: 'Engenharia de Software'
  },
  {
    id: 'ic',
    title: 'Iniciação Científica',
    description: 'Projetos de pesquisa ativos com editais abertos para bolsas voluntárias ou remuneradas.',
    action: 'Ver editais',
    icon: 'award',
    query: 'Iniciação'
  }
];

export const EVENTS = [
  { day: '18', month: 'OUT', title: 'Mundo Unifor 2024', place: 'Teatro Celina Queiroz', tag: 'Científico' },
  { day: '22', month: 'OUT', title: 'Encontros Científicos', place: 'Blocos de Pós-Graduação', tag: 'Pesquisa' },
  { day: '05', month: 'NOV', title: 'Exposição Espaço Cultural', place: 'Espaço Cultural Unifor', tag: 'Cultura' },
  { day: '12', month: 'NOV', title: 'Feira de Carreiras & Estágios', place: 'Centro de Convivência', tag: 'Carreira' }
];

export const DOCUMENTS = [
  {
    id: 1,
    title: 'Aprendizado profundo aplicado à classificação de imagens médicas',
    type: 'Artigo de IC',
    author: 'Profa. Ana Ribeiro',
    year: 2024,
    area: 'Inteligência Artificial',
    source: 'Iniciação Científica'
  },
  {
    id: 2,
    title: 'Padrões de arquitetura em sistemas acadêmicos de grande porte',
    type: 'TCC',
    author: 'Gabriel Silva',
    year: 2023,
    area: 'Engenharia de Software',
    source: 'Repositório de Trabalhos'
  },
  {
    id: 3,
    title: 'Controle de constitucionalidade e direitos fundamentais',
    type: 'Dissertação',
    author: 'Prof. Carlos Mendes',
    year: 2022,
    area: 'Direito Constitucional',
    source: 'Pós-graduação'
  },
  {
    id: 4,
    title: 'Protocolos de triagem em unidades de emergência',
    type: 'Artigo',
    author: 'Dra. Helena Costa',
    year: 2024,
    area: 'Medicina',
    source: 'Acervo da Biblioteca'
  },
  {
    id: 5,
    title: 'Robótica educacional em cursos de engenharia',
    type: 'Projeto',
    author: 'Prof. João Amaral',
    year: 2025,
    area: 'Robótica',
    source: 'Editais de pesquisa'
  },
  {
    id: 7,
    title: 'Horários de monitoria de Algoritmos e Estruturas de Dados',
    type: 'Monitoria',
    author: 'Monitoria CCT',
    year: 2025,
    area: 'Engenharia de Software',
    source: 'Programas de Monitoria'
  },
  {
    id: 6,
    title: 'Marcadores moleculares em biotecnologia aplicada',
    type: 'Tese',
    author: 'Profa. Lúcia Fernandes',
    year: 2021,
    area: 'Biotecnologia',
    source: 'Repositório de Trabalhos'
  }
];
