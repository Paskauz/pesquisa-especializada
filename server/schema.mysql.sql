-- =====================================================================
-- Busca especializada (Unifor) — schema MySQL 8.0.16+
-- A collation utf8mb4_0900_ai_ci ignora maiúsculas e acentos:
-- "inteligencia" encontra "Inteligência" sem nenhuma função extra.
-- (MariaDB não tem essa collation; use MySQL 8.)
-- =====================================================================
CREATE DATABASE IF NOT EXISTS busca_especializada
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE busca_especializada;

SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW  IF EXISTS termos_populares;
DROP TABLE IF EXISTS notificacoes, historico_buscas, eventos, categorias_evento,
  recursos_rapidos, documento_autores, documentos, autores, fontes, tipos_documento,
  usuario_areas, areas, tokens_redefinicao_senha, sessoes, preferencias_usuario,
  usuarios, cursos, centros;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------- Usuários e acesso ----------
CREATE TABLE centros (
  id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sigla VARCHAR(20)  NOT NULL UNIQUE,
  nome  VARCHAR(150) NOT NULL
);

CREATE TABLE cursos (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome      VARCHAR(150) NOT NULL,
  centro_id INT UNSIGNED NULL,
  UNIQUE KEY uq_curso (nome, centro_id),
  FOREIGN KEY (centro_id) REFERENCES centros(id)
);

CREATE TABLE usuarios (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome          VARCHAR(150) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  senha_hash    VARCHAR(100) NULL,
  matricula     VARCHAR(30)  NULL UNIQUE,
  curso_id      INT UNSIGNED NULL,
  situacao      ENUM('ativo','inativo','trancado','formado') NOT NULL DEFAULT 'ativo',
  foto_url      VARCHAR(500) NULL,
  criado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_id) REFERENCES cursos(id),
  CHECK (senha_hash IS NOT NULL OR matricula IS NOT NULL)
);

CREATE TABLE preferencias_usuario (
  usuario_id         BIGINT UNSIGNED PRIMARY KEY,
  notif_email        TINYINT(1) NOT NULL DEFAULT 1,
  notif_alertas_docs TINYINT(1) NOT NULL DEFAULT 1,
  atualizado_em      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Toda conta nova ganha as preferências padrão (trigger de 1 comando: não precisa de DELIMITER).
CREATE TRIGGER trg_usuarios_preferencias AFTER INSERT ON usuarios
FOR EACH ROW INSERT INTO preferencias_usuario (usuario_id) VALUES (NEW.id);

CREATE TABLE sessoes (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id  BIGINT UNSIGNED NOT NULL,
  token_hash  CHAR(64) NOT NULL UNIQUE,          -- SHA-256 do token do cookie
  user_agent  VARCHAR(300) NULL,
  criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expira_em   DATETIME NOT NULL,
  revogada_em DATETIME NULL,
  INDEX idx_sessoes_usuario (usuario_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE tokens_redefinicao_senha (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  criado_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expira_em  DATETIME NOT NULL,
  usado_em   DATETIME NULL,
  INDEX idx_tokens_usuario (usuario_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ---------- Acervo ----------
CREATE TABLE areas (
  id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE usuario_areas (
  usuario_id BIGINT UNSIGNED NOT NULL,
  area_id    INT UNSIGNED NOT NULL,
  PRIMARY KEY (usuario_id, area_id),
  INDEX idx_usuario_areas_area (area_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (area_id)    REFERENCES areas(id)    ON DELETE CASCADE
);

CREATE TABLE tipos_documento (
  id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE fontes (
  id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE autores (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome       VARCHAR(150) NOT NULL,
  usuario_id BIGINT UNSIGNED NULL UNIQUE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE documentos (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo        VARCHAR(300) NOT NULL,
  tipo_id       INT UNSIGNED NOT NULL,
  fonte_id      INT UNSIGNED NOT NULL,
  area_id       INT UNSIGNED NOT NULL,
  ano           SMALLINT UNSIGNED NOT NULL,
  resumo        TEXT NULL,
  arquivo_url   VARCHAR(500) NULL,
  publicado     TINYINT(1) NOT NULL DEFAULT 1,
  criado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_documentos_area (area_id),
  INDEX idx_documentos_tipo (tipo_id),
  INDEX idx_documentos_fonte (fonte_id),
  INDEX idx_documentos_ano (ano),
  FULLTEXT KEY ft_documentos (titulo, resumo),
  FOREIGN KEY (tipo_id)  REFERENCES tipos_documento(id),
  FOREIGN KEY (fonte_id) REFERENCES fontes(id),
  FOREIGN KEY (area_id)  REFERENCES areas(id),
  CHECK (ano BETWEEN 1900 AND 2100)
);

CREATE TABLE documento_autores (
  documento_id INT UNSIGNED NOT NULL,
  autor_id     INT UNSIGNED NOT NULL,
  ordem        SMALLINT NOT NULL DEFAULT 1,
  PRIMARY KEY (documento_id, autor_id),
  INDEX idx_doc_autores_autor (autor_id),
  FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE,
  FOREIGN KEY (autor_id)     REFERENCES autores(id)
);

-- ---------- Conteúdo da home ----------
CREATE TABLE recursos_rapidos (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug            VARCHAR(40)  NOT NULL UNIQUE,
  titulo          VARCHAR(120) NOT NULL,
  descricao       VARCHAR(300) NOT NULL,
  acao_label      VARCHAR(60)  NOT NULL,
  icone           VARCHAR(20)  NOT NULL,
  filtro_fonte_id INT UNSIGNED NULL,
  filtro_tipo_id  INT UNSIGNED NULL,
  ordem           SMALLINT NOT NULL DEFAULT 0,
  ativo           TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (filtro_fonte_id) REFERENCES fontes(id),
  FOREIGN KEY (filtro_tipo_id)  REFERENCES tipos_documento(id)
);

CREATE TABLE categorias_evento (
  id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE eventos (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo       VARCHAR(200) NOT NULL,
  local        VARCHAR(200) NOT NULL,
  categoria_id INT UNSIGNED NOT NULL,
  inicia_em    DATETIME NOT NULL,
  ativo        TINYINT(1) NOT NULL DEFAULT 1,
  INDEX idx_eventos_inicio (inicia_em),
  FOREIGN KEY (categoria_id) REFERENCES categorias_evento(id)
);

-- ---------- Uso ----------
CREATE TABLE historico_buscas (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id     BIGINT UNSIGNED NULL,
  termo          VARCHAR(200) NOT NULL,
  qtd_resultados INT NOT NULL DEFAULT 0,
  criado_em      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_historico_usuario (usuario_id, criado_em),
  INDEX idx_historico_recentes (criado_em),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Substitui POPULAR_TAGS (a collation _ai_ci já agrupa "medicina"/"Medicina").
CREATE VIEW termos_populares AS
SELECT MIN(TRIM(termo)) AS termo, COUNT(*) AS buscas
FROM historico_buscas
WHERE criado_em >= NOW() - INTERVAL 30 DAY AND qtd_resultados > 0
GROUP BY TRIM(termo)
ORDER BY buscas DESC
LIMIT 10;

CREATE TABLE notificacoes (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id       BIGINT UNSIGNED NOT NULL,
  tipo             ENUM('novo_documento','sistema') NOT NULL,
  titulo           VARCHAR(200) NOT NULL,
  mensagem         VARCHAR(500) NULL,
  documento_id     INT UNSIGNED NULL,
  lida_em          DATETIME NULL,
  enviada_email_em DATETIME NULL,
  criado_em        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_usuario (usuario_id, lida_em, criado_em),
  FOREIGN KEY (usuario_id)   REFERENCES usuarios(id)   ON DELETE CASCADE,
  FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE
);

-- Alerta de novo documento para quem segue a área e deixou os alertas ligados.
CREATE TRIGGER trg_documentos_alerta_insert AFTER INSERT ON documentos
FOR EACH ROW
  INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, documento_id)
  SELECT ua.usuario_id, 'novo_documento', CONCAT('Novo documento em ', a.nome), NEW.titulo, NEW.id
  FROM usuario_areas ua
  JOIN preferencias_usuario p ON p.usuario_id = ua.usuario_id
  JOIN areas a ON a.id = ua.area_id
  WHERE NEW.publicado = 1 AND ua.area_id = NEW.area_id AND p.notif_alertas_docs = 1;

CREATE TRIGGER trg_documentos_alerta_publicacao AFTER UPDATE ON documentos
FOR EACH ROW
  INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, documento_id)
  SELECT ua.usuario_id, 'novo_documento', CONCAT('Novo documento em ', a.nome), NEW.titulo, NEW.id
  FROM usuario_areas ua
  JOIN preferencias_usuario p ON p.usuario_id = ua.usuario_id
  JOIN areas a ON a.id = ua.area_id
  WHERE OLD.publicado = 0 AND NEW.publicado = 1
    AND ua.area_id = NEW.area_id AND p.notif_alertas_docs = 1;
