-- Execute uma única vez no banco de dados do adot.ai.
-- Pets já cadastrados começam como disponíveis.
ALTER TABLE cachorros
ADD COLUMN disponivel TINYINT(1) NOT NULL DEFAULT 1;
