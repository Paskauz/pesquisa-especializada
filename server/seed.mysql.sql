-- Dados do antigo mockData.js. Rode depois do schema.mysql.sql.
USE busca_especializada;

INSERT INTO centros (sigla, nome) VALUES ('CCT', 'Centro de Ciências Tecnológicas');
INSERT INTO cursos (nome, centro_id)
  VALUES ('Ciência da Computação', (SELECT id FROM centros WHERE sigla = 'CCT'));

INSERT INTO areas (nome) VALUES
  ('Inteligência Artificial'), ('Engenharia de Software'), ('Biotecnologia'),
  ('Direito Constitucional'), ('Medicina'), ('Robótica');

INSERT INTO tipos_documento (nome) VALUES
  ('Artigo de IC'), ('TCC'), ('Dissertação'), ('Artigo'), ('Projeto'), ('Monitoria'), ('Tese');

INSERT INTO fontes (nome) VALUES
  ('Iniciação Científica'), ('Repositório de Trabalhos'), ('Pós-graduação'),
  ('Acervo da Biblioteca'), ('Editais de pesquisa'), ('Programas de Monitoria');

-- Usuário demo: gabriel@edu.unifor.br / 123456 (hash bcrypt)
INSERT INTO usuarios (nome, email, senha_hash, matricula, curso_id) VALUES
  ('Gabriel Silva', 'gabriel@edu.unifor.br',
   '$2b$10$i3DQ6NOLCpmszE/ctMcOBekI/lJh1kMZKiKdbpsJhSf5QFes7ln/i', '2110482',
   (SELECT id FROM cursos WHERE nome = 'Ciência da Computação'));

INSERT INTO autores (nome, usuario_id) VALUES
  ('Profa. Ana Ribeiro', NULL),
  ('Gabriel Silva', (SELECT id FROM usuarios WHERE email = 'gabriel@edu.unifor.br')),
  ('Prof. Carlos Mendes', NULL), ('Dra. Helena Costa', NULL),
  ('Prof. João Amaral', NULL), ('Monitoria CCT', NULL), ('Profa. Lúcia Fernandes', NULL);

-- Documentos entram antes dos interesses do usuário para o seed não gerar alertas.
INSERT INTO documentos (titulo, tipo_id, fonte_id, area_id, ano) VALUES
  ('Aprendizado profundo aplicado à classificação de imagens médicas',
    (SELECT id FROM tipos_documento WHERE nome = 'Artigo de IC'),
    (SELECT id FROM fontes WHERE nome = 'Iniciação Científica'),
    (SELECT id FROM areas WHERE nome = 'Inteligência Artificial'), 2024),
  ('Padrões de arquitetura em sistemas acadêmicos de grande porte',
    (SELECT id FROM tipos_documento WHERE nome = 'TCC'),
    (SELECT id FROM fontes WHERE nome = 'Repositório de Trabalhos'),
    (SELECT id FROM areas WHERE nome = 'Engenharia de Software'), 2023),
  ('Controle de constitucionalidade e direitos fundamentais',
    (SELECT id FROM tipos_documento WHERE nome = 'Dissertação'),
    (SELECT id FROM fontes WHERE nome = 'Pós-graduação'),
    (SELECT id FROM areas WHERE nome = 'Direito Constitucional'), 2022),
  ('Protocolos de triagem em unidades de emergência',
    (SELECT id FROM tipos_documento WHERE nome = 'Artigo'),
    (SELECT id FROM fontes WHERE nome = 'Acervo da Biblioteca'),
    (SELECT id FROM areas WHERE nome = 'Medicina'), 2024),
  ('Robótica educacional em cursos de engenharia',
    (SELECT id FROM tipos_documento WHERE nome = 'Projeto'),
    (SELECT id FROM fontes WHERE nome = 'Editais de pesquisa'),
    (SELECT id FROM areas WHERE nome = 'Robótica'), 2025),
  ('Horários de monitoria de Algoritmos e Estruturas de Dados',
    (SELECT id FROM tipos_documento WHERE nome = 'Monitoria'),
    (SELECT id FROM fontes WHERE nome = 'Programas de Monitoria'),
    (SELECT id FROM areas WHERE nome = 'Engenharia de Software'), 2025),
  ('Marcadores moleculares em biotecnologia aplicada',
    (SELECT id FROM tipos_documento WHERE nome = 'Tese'),
    (SELECT id FROM fontes WHERE nome = 'Repositório de Trabalhos'),
    (SELECT id FROM areas WHERE nome = 'Biotecnologia'), 2021);

INSERT INTO documento_autores (documento_id, autor_id)
SELECT d.id, a.id FROM (
  SELECT 'Aprendizado profundo aplicado à classificação de imagens médicas' AS titulo, 'Profa. Ana Ribeiro' AS autor
  UNION ALL SELECT 'Padrões de arquitetura em sistemas acadêmicos de grande porte', 'Gabriel Silva'
  UNION ALL SELECT 'Controle de constitucionalidade e direitos fundamentais', 'Prof. Carlos Mendes'
  UNION ALL SELECT 'Protocolos de triagem em unidades de emergência', 'Dra. Helena Costa'
  UNION ALL SELECT 'Robótica educacional em cursos de engenharia', 'Prof. João Amaral'
  UNION ALL SELECT 'Horários de monitoria de Algoritmos e Estruturas de Dados', 'Monitoria CCT'
  UNION ALL SELECT 'Marcadores moleculares em biotecnologia aplicada', 'Profa. Lúcia Fernandes'
) v
JOIN documentos d ON d.titulo = v.titulo
JOIN autores a ON a.nome = v.autor;

INSERT INTO usuario_areas (usuario_id, area_id)
SELECT u.id, a.id FROM usuarios u, areas a
WHERE u.email = 'gabriel@edu.unifor.br' AND a.nome IN ('Inteligência Artificial', 'Engenharia de Software');

INSERT INTO recursos_rapidos (slug, titulo, descricao, acao_label, icone, filtro_fonte_id, ordem) VALUES
  ('acervo', 'Acervo da Biblioteca',
   'Consulte livros físicos, e-books e revistas científicas disponíveis na Biblioteca Unifor.',
   'Acessar acervo', 'book', (SELECT id FROM fontes WHERE nome = 'Acervo da Biblioteca'), 1),
  ('trabalhos', 'Trabalhos Acadêmicos',
   'Repositório de TCCs, dissertações de mestrado e teses de doutorado publicadas.',
   'Explorar repositório', 'file', (SELECT id FROM fontes WHERE nome = 'Repositório de Trabalhos'), 2),
  ('monitoria', 'Programas de Monitoria',
   'Encontre horários e monitores das disciplinas do seu curso de graduação.',
   'Ver monitores', 'users', (SELECT id FROM fontes WHERE nome = 'Programas de Monitoria'), 3),
  ('ic', 'Iniciação Científica',
   'Projetos de pesquisa ativos com editais abertos para bolsas voluntárias ou remuneradas.',
   'Ver editais', 'award', (SELECT id FROM fontes WHERE nome = 'Iniciação Científica'), 4);

INSERT INTO categorias_evento (nome) VALUES ('Científico'), ('Pesquisa'), ('Cultura'), ('Carreira');

-- Datas relativas a hoje só para a agenda da demo não ficar vazia (o mock não tinha ano coerente).
INSERT INTO eventos (titulo, local, categoria_id, inicia_em) VALUES
  ('Mundo Unifor 2024', 'Teatro Celina Queiroz',
    (SELECT id FROM categorias_evento WHERE nome = 'Científico'), DATE_ADD(CURDATE(), INTERVAL 3 DAY)),
  ('Encontros Científicos', 'Blocos de Pós-Graduação',
    (SELECT id FROM categorias_evento WHERE nome = 'Pesquisa'), DATE_ADD(CURDATE(), INTERVAL 7 DAY)),
  ('Exposição Espaço Cultural', 'Espaço Cultural Unifor',
    (SELECT id FROM categorias_evento WHERE nome = 'Cultura'), DATE_ADD(CURDATE(), INTERVAL 21 DAY)),
  ('Feira de Carreiras & Estágios', 'Centro de Convivência',
    (SELECT id FROM categorias_evento WHERE nome = 'Carreira'), DATE_ADD(CURDATE(), INTERVAL 28 DAY));

INSERT INTO historico_buscas (termo, qtd_resultados) VALUES
  ('Inteligência Artificial',1),('Inteligência Artificial',1),('Inteligência Artificial',1),
  ('Inteligência Artificial',1),('Inteligência Artificial',1),
  ('Direito Constitucional',1),('Direito Constitucional',1),('Direito Constitucional',1),('Direito Constitucional',1),
  ('Engenharia de Software',1),('Engenharia de Software',1),('Engenharia de Software',1),
  ('Medicina',1),('Medicina',1);

INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem)
SELECT id, 'sistema', 'Bem-vindo à Busca especializada',
       'Escolha suas áreas de interesse no perfil para receber alertas de novos documentos.'
FROM usuarios WHERE email = 'gabriel@edu.unifor.br';
