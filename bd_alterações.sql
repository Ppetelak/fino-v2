/* Adicione uma nova coluna para a cooparticipação: */

ALTER TABLE produtos
ADD COLUMN nova_cooparticipacao ENUM('Com Coparticipação', 'Sem Coparticipação', 'Franquia', 'Coparticipação + Franquia') NOT NULL;

/* Atualize os valores da nova coluna com base na coluna existente: */

UPDATE produtos
SET nova_cooparticipacao = 'Com Coparticipação'
WHERE cooparticipacao = 'Com Cooparticipação';

UPDATE produtos
SET nova_cooparticipacao = 'Sem Coparticipação'
WHERE cooparticipacao = 'Sem Coparticipação';

/* Em seguida, remova a coluna antiga: */

ALTER TABLE produtos
DROP COLUMN cooparticipacao;

/* Por fim, renomeie a nova coluna para o nome original: */

ALTER TABLE produtos
CHANGE COLUMN nova_cooparticipacao cooparticipacao ENUM('Com Coparticipação', 'Sem Coparticipação', 'Franquia', 'Coparticipação + Franquia') NOT NULL;

/* Em caso de erro rodar esse comando para ativar atualizações em massa em tabelas sem um clausulá where como medida de segurança após rodar com valor 0 e fazer alterações recomendado mudar novamente para valor 1*/

SET SQL_SAFE_UPDATES = 0;

ALTER TABLE procedimentos
ADD COLUMN tipofranquia ENUM('', '%', 'R$');



/* ALTERAÇÕES A SEREM SREALIZADAS PRÓXIMO DEPLOY */
ALTER TABLE procedimentos
DROP FOREIGN KEY procedimentos_ibfk_1;

ALTER TABLE produtos
ADD COLUMN reducaocarencia TEXT, 
ADD COLUMN congeneres TEXT
ADD COLUMN variacao1 DECIMAL(10,5),
ADD COLUMN variacao2 DECIMAL(10,5),
ADD COLUMN variacao3 DECIMAL(10,5),
ADD COLUMN variacao4 DECIMAL(10,5),
ADD COLUMN variacao5 DECIMAL(10,5),
ADD COLUMN variacao6 DECIMAL(10,5),
ADD COLUMN variacao7 DECIMAL(10,5),
ADD COLUMN variacao8 DECIMAL(10,5),
ADD COLUMN variacao9 DECIMAL(10,5)

CREATE TABLE atualizacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_fino INT,
    tipoAtualizacao ENUM('INCLUSÃO', 'EXCLUSÃO', 'EDIÇÃO'),
    onde ENUM('PROCEDIMENTOS', 'OPERADORA', 'FINO', 'PRODUTOS', 'ENTIDADES'),
    descricao TEXT,
    responsavel VARCHAR(30),
    dataAtualizacao DATETIME
)

