-- Rode UMA vez no banco busca_especializada (já existente), depois de atualizar o código.
-- Para bancos novos, copie estas mudanças para schema.mysql.sql.

ALTER TABLE usuarios
  ADD COLUMN firebase_uid VARCHAR(128) NULL UNIQUE AFTER senha_hash;

-- Quem entra só pelo Firebase não tem senha_hash nem matrícula, então a regra antiga
-- (senha OU matrícula) precisa aceitar também o firebase_uid.
ALTER TABLE usuarios DROP CHECK usuarios_chk_1;
ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_chk_credencial
  CHECK (senha_hash IS NOT NULL OR matricula IS NOT NULL OR firebase_uid IS NOT NULL);
