CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomedoplano VARCHAR(100) NOT NULL,
    ans VARCHAR(20) NOT NULL,
    contratacao ENUM('Individual ou Familiar', 'Coletivo empresarial', 'Coletivo por adesão') NOT NULL,
    cobertura ENUM('Ambulatorial', 'Ambulatorial + Hospitalar COM obstetrícia', 'Ambulatorial + Hospitalar COM obstetrícia + Odontológico', 'Ambulatorial + Hospitalar SEM obstetrícia', 'Ambulatorial + Hospitalar SEM obstetrícia + Odontológico', 'Ambulatorial + Odontológico', 'Hospitalar COM obstetrícia', 'Hospitalar COM obstetrícia + Odontológico', 'Hospitalar SEM obstetrícia', 'Hospitalar SEM obstetrícia + Odontológico', 'Odontológico'),
    abrangencia ENUM('Nacional', 'Grupo de estados', 'Estadual', 'Grupo de Municípios', 'Municipal'),
    cooparticipacao ENUM('Com Cooparticipação', 'Sem Cooparticipação'),
    acomodacao ENUM('Enfermaria', 'Apartamento'),
    areadeabrangencia VARCHAR(500),
    condicoesconjuges VARCHAR(200),
    condicoesfilhos VARCHAR(200),
    condicoesnetos VARCHAR(200),
    condicoespais VARCHAR(200),
    condicoesoutros VARCHAR(200),
    documentosconjuges VARCHAR(200),
    documentosfilhos VARCHAR(200),
    documentosnetos VARCHAR(200),
    documentospais VARCHAR(200),
    documentosoutros VARCHAR(200),
    fx1 DECIMAL(10, 2) NOT NULL,
    fx2 DECIMAL(10, 2) NOT NULL,
    fx3 DECIMAL(10, 2) NOT NULL,
    fx4 DECIMAL(10, 2) NOT NULL,
    fx5 DECIMAL(10, 2) NOT NULL,
    fx6 DECIMAL(10, 2) NOT NULL,
    fx7 DECIMAL(10, 2) NOT NULL,
    fx8 DECIMAL(10, 2) NOT NULL,
    fx9 DECIMAL(10, 2) NOT NULL,
    fx10 DECIMAL(10, 2) NOT NULL,
    fx1comercial DECIMAL(10, 2) NOT NULL,
    fx2comercial DECIMAL(10, 2) NOT NULL,
    fx3comercial DECIMAL(10, 2) NOT NULL,
    fx4comercial DECIMAL(10, 2) NOT NULL,
    fx5comercial DECIMAL(10, 2) NOT NULL,
    fx6comercial DECIMAL(10, 2) NOT NULL,
    fx7comercial DECIMAL(10, 2) NOT NULL,
    fx8comercial DECIMAL(10, 2) NOT NULL,
    fx9comercial DECIMAL(10, 2) NOT NULL,
    fx10comercial DECIMAL(10, 2) NOT NULL,
    observacoes VARCHAR(500),
    id_operadora INT,
    FOREIGN KEY (id_operadora) REFERENCES operadora(id)
)

CREATE TABLE operadora (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_fino INT,
    razaosocial VARCHAR(255),
    cnpj VARCHAR(18),
    nomefantasia VARCHAR(255),
    codans VARCHAR(10),
    endereco VARCHAR(255),
    numeroendereco VARCHAR(10),
    complemento VARCHAR(100),
    cep VARCHAR(10),
    cidade VARCHAR(100),
    uf VARCHAR(2),
    enredewebe VARCHAR(255),
    telatendimento VARCHAR(15),
    telouvidoria VARCHAR(15),
)

CREATE TABLE contatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_operadora INT,
    nome VARCHAR(100),
    email VARCHAR(100),
    telefone VARCHAR(30),
    cargo VARCHAR(30),
    FOREIGN KEY (id_operadora) REFERENCES operadora(id)
)

CREATE TABLE procedimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT,
    descricao VARCHAR(100),
    valorcop VARCHAR(20),
    limitecop VARCHAR(20),
    franquiacop VARCHAR(20),
    limitecarenciadias VARCHAR(20),
    condicoesreducaocarencia VARCHAR(50),
    condicoescongeneres VARCHAR(50),
    FOREIGN KEY (id_produto) REFERENCES produtos(id)

)

CREATE TABLE formularios(
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_operadora INT, 
    datacriacao DATE, 
    dataatualizacao DATE
    administradora ENUM('Classe Administradora', 'Compar', 'Mount Hermon'),
    origem ENUM('Estipulante', 'Subestipulante'),
    enviopropostas ENUM('Preenchimento direto no portal da operadora', 'Envio por e-mail'),
    layoutpropostas ENUM('Padrão da Operadora', 'Sugerido pela Administradora'),
    analisedoc ENUM('Sim', 'Não'),
    aniversariocontrato VARCHAR(10)

)

CREATE TABLE vigencias(
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_fino INT,
    iniciodavigencia VARCHAR(2),
    movimentacao VARCHAR(2),
    datafaturamento VARCHAR(2),
    FOREIGN KEY (id_fino) REFERENCES formularios(id)
)

CREATE TABLE entidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(30),
    descricao VARCHAR(40),
    publico VARCHAR(60),
    documentos VARCHAR (100),
    taxa DECIMAL(10, 2) NOT NULL,
)