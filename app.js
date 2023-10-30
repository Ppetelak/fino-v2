const express = require('express')
const ejs = require('ejs')
const path = require('path')
const mysql = require('mysql2')
const session = require('express-session');
const app = express()
const crypto = require('crypto');
const winston = require('winston')
const pdfGerador = require('html-pdf')
const puppeteer = require('puppeteer')
const bodyParser = require('body-parser')
const util = require('util')
const cookie = require('cookie-parser')
const { url } = require('inspector')
const ExcelJS = require('exceljs');

/* CONFIGURAÇÕES DOS PACOTES */


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.json())
app.use('/css', express.static('css', { maxAge: 0 }))
app.use('/js', express.static('js', { maxAge: 0 }))
app.use('/logo-adm', express.static('logo-adm'))
app.use('/img-privadas', express.static('img-privadas'));
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'));
app.use('/bootstrap-icons', express.static('node_modules/bootstrap-icons'));


/* CRIPTOGRAFIA DE ACESSO */

const generateSecretKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

const secretKey = generateSecretKey();

/*ABERTURA DE SESSÃO */

app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: false
}));

/*CONEXÃO COM BANCO DE DADOS */

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'pmp078917',
  database: 'fino',
  port: '3306'
});

/* const db = mysql.createConnection({
  host: 'https://187.45.182.250',
  user: 'finoUser',
  password: 'Kl6zu075*',
  database: 'fino',
  port: '3306'
}); */

db.connect((error) => {
  if (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  } else {
    console.log('Conexão bem-sucedida ao banco de dados');
  }
});

/* VERIFICA SE USUÁRIO ESTÁ LOGADO */

const verificaAutenticacao = (req, res, next) => {
  if (req.session && req.session.usuario) {
    res.locals.user = req.session.usuario;
    next();
  } else {
    req.session.originalUrl = req.originalUrl;
    res.redirect('/login');
  }
};

app.post('/login-verifica', (req, res) => {
  const { username, password } = req.body;
  console.log(username, password)

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Erro ao consultar o banco de dados:', err);
      //return res.status(500).json({ error: 'Erro ao processar a solicitação' });
      return res.render('login', { error: 'Erro no servidor contate o suporte' });
    }

    if (results.length === 0) {
      //return res.status(401).json({ error: 'Usuário não encontrado' });
      return res.render('login', { error: 'Usuário não encontrado' });
    }

    const user = results[0];

    if (user.senha !== password) {
      //return res.status(401).json({ error: 'Senha incorreta' });
      return res.render('login', { error: 'Senha incorreta' });
    }

    const originalUrl = req.session.originalUrl
    req.session.usuario = user;
    res.redirect(originalUrl);
  });
});

app.get('/login', (req, res) => {
  res.render('login');
})

app.get('/logout', (req, res) => {
  // Remover as informações de autenticação da sessão
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao encerrar a sessão:', err);
    }
    // Redirecionar o usuário para a página de login ou para outra página desejada
    res.redirect('/');
  });
});


/* QUERIES PARA ATUALIZAR TIMELINE DO FINO */

const sqlFinoEditar = 'INSERT INTO atualizacoes (id_fino, tipoAtualizacao, onde, descricao, responsavel, dataAtualizacao) VALUES (?, "EDIÇÃO", "FINO", "Atualização de informações no formulário", ?, ?)';

const sqlAdicaoProduto = 'INSERT INTO atualizacoes (id_fino, tipoAtualizacao, onde, descricao, responsavel, dataAtualizacao) VALUES (?, "INCLUSÃO", "PRODUTOS", "Adicionado um produto ao formulário", ?, ?)';

const sqlEdicaoProduto = 'INSERT INTO atualizacoes (id_fino, tipoAtualizacao, onde, descricao, responsavel, dataAtualizacao) VALUES (?, "EDIÇÃO", "PRODUTOS", ?, ?, ?)';

const sqlExclusaoProduto = 'INSERT INTO atualizacoes (id_fino, tipoAtualizacao, onde, descricao, responsavel, dataAtualizacao) VALUES (?, "EXCLUSÃO", "PRODUTOS", ?, ?, ?)';

const sqlInclusaoProcedimento = 'INSERT INTO atualizacoes (id_fino, tipoAtualizacao, onde, descricao, responsavel, dataAtualizacao) VALUES (?, "INCLUSÃO", "PROCEDIMENTOS", ?, ?, ?)'

const sqlExclusaoProcedimento = 'INSERT INTO atualizacoes (id_fino, tipoAtualizacao, onde, descricao, responsavel, dataAtualizacao) VALUES (?, "EXCLUSÃO", "PROCEDIMENTOS", ?, ?, ?)'

/* REGISTRO de erros da aplicação */
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
  ),
  transports: [
      new winston.transports.File({
          filename: path.join('erros', 'error.log.json'),
      }),
  ],
});

app.get('/operadoras', verificaAutenticacao, (req, res) => {
  let operadoras, contatos;

  const fetchOperadoras = new Promise((resolve, reject) => {
    db.query('SELECT * FROM operadora', (error, results) => {
      if (error) {
        reject(error);
        logger.error({
          message: 'Erro ao selecionar operadoras:',
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
      });
      } else {
        operadoras = results;
        resolve();
      }
    });
  });

  const fetchContatos = new Promise((resolve, reject) => {
    db.query('SELECT * FROM contatos', (error, results) => {
      if (error) {
        reject(error);
      } else {
        contatos = results;
        resolve();
      }
    });
  });

  Promise.all([fetchOperadoras, fetchContatos])
    .then(() => {
      res.render('operadoras', { operadoras: operadoras, contatos: contatos, rotaAtual: 'operadoras' });
    })
    .catch((error) => {
      console.error('Erro ao buscar dados:', error);
      res.status(500).send('Erro interno do servidor');
    });
});

const verificaExistenciaOperadora = (idOperadora, callback) => {
  const sqlVerificaOperadora = `
    SELECT 
        CASE 
            WHEN EXISTS (SELECT 1 FROM formularios WHERE id_operadora = ?) THEN 1
            ELSE 0
        END AS resultado,
        (SELECT id FROM formularios WHERE id_operadora = ? LIMIT 1) AS id_formulario;
  `;

  db.query(sqlVerificaOperadora, [idOperadora, idOperadora], (err, results) => {
    if (err) {
      console.error('Erro na consulta SQL', err);
      logger.error({
        message: 'Erro ao consultar existencia de fino vinculado a operadora:',
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
    });
      callback(err, null);
      return;
    }

    const existeOperadora = results[0].resultado === 1;
    const idFormulario = existeOperadora ? results[0].id_formulario : null;

    callback(null, { existeOperadora, idFormulario });
  });
};

app.get('/conta', verificaAutenticacao, (req, res) => {
  res.render('conta', {rotaAtual: 'conta'});
})

app.post('/alterarSenha/:userId', verificaAutenticacao, (req, res) => {
  const userId = req.params.userId
  const novaSenha = req.body.novaSenha

  const sqlUser = 'UPDATE users SET senha = ? WHERE id = ?';
  db.query(sqlUser, [novaSenha, userId], (err, result) => {
    if(err) {
      console.error('Erro ao editar sua senha:', err);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.status(200).json({ message: 'Alteração de senha com sucesso' });
  })
})

app.post('/cadastrar-operadora', verificaAutenticacao, (req, res) => {
  const { formData } = req.body;
  const { contatos } = req.body;

  const sqlOperadora = 'INSERT INTO operadora (razaosocial, cnpj, nomefantasia, codans, endereco, numeroendereco, complemento, cep, cidade, uf, website, telatendimento, telouvidoria, emailouvidoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const sqlContatos = 'INSERT INTO contatos (id_operadora, nome, email, telefone, cargo) VALUES (?, ?, ?, ?, ?)';

  db.query(sqlOperadora, [formData.razaosocial, formData.cnpj, formData.nomefantasia, formData.codans, formData.endereco, formData.numeroendereco, formData.complemento, formData.cep, formData.cidade, formData.uf, formData.website, formData.telatendimento, formData.telouvidoria, formData.emailouvidoria], (error, result) => {
    if (error) {
      logger.error({
        message: 'Erro ao cadastrar operadora:',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
      console.error('Erro ao cadastrar operadora:', error);
      res.cookie('alertError', 'Erro ao cadastrar Operadora, verifique e tente novamente', { maxAge: 3000 });
      res.status(500).json({ message: 'Erro interno do servidor' });
    }

    const idOperadora = result.insertId;

    // Verificar se contatos é um array antes de executar o loop
    if (Array.isArray(contatos)) {
      contatos.forEach((contato) => {
        db.query(sqlContatos, [idOperadora, contato.nome_contato, contato.email_contato, contato.telefone_contato, contato.cargo_contato], (error, result) => {
          if (error) {
            console.error('Erro ao cadastrar contato:', error);
          }
        });
      });
    }

    res.cookie('alertSuccess', 'Operadora criada com Sucesso', { maxAge: 3000 });
    res.status(200).json({ message: 'Nova operadora criada com sucesso' });
  });
});

app.post('/editar-operadora/:id', verificaAutenticacao, async (req, res) => {
  const idOperadora = req.params.id;
  const formData = req.body.formData;
  const contatos = req.body.contatos;

  const sqlOperadoraUpdate =
    'UPDATE operadora SET razaosocial=?, cnpj=?, nomefantasia=?, codans=?, endereco=?, numeroendereco=?, complemento=?, cep=?, cidade=?, uf=?, website=?, telatendimento=?, telouvidoria=?, emailouvidoria=? WHERE id=?';

  const sqlContatoInsert =
    `INSERT INTO contatos (nome, email, telefone, cargo, id_operadora) VALUES (?, ?, ?, ?, ?)`;

  const sqlContatoDelete =
    'DELETE FROM contatos WHERE id_operadora=?';

  const queryPromise = util.promisify(db.query).bind(db);

  try {
    // Excluir todos os contatos vinculados ao id_operadora
    await queryPromise(sqlContatoDelete, [idOperadora]);

    // Atualizar os dados da operadora no banco de dados
    await queryPromise(
      sqlOperadoraUpdate,
      [
        formData.razaosocial,
        formData.cnpj,
        formData.nomefantasia,
        formData.codans,
        formData.endereco,
        formData.numeroendereco,
        formData.complemento,
        formData.cep,
        formData.cidade,
        formData.uf,
        formData.website,
        formData.telatendimento,
        formData.telouvidoria,
        formData.emailouvidoria,
        idOperadora,
      ]
    );

    // Verificar se existem contatos para adicionar
    if (Array.isArray(contatos)) {
      for (const contato of contatos) {
        await queryPromise(
          sqlContatoInsert,
          [
            contato.nome_contato,
            contato.email_contato,
            contato.telefone_contato,
            contato.cargo_contato,
            idOperadora,
          ]
        );
      }
    }

    res.cookie('alertSuccess', 'Operadora atualizada com sucesso', { maxAge: 3000 });
    res.status(200).json({ message: 'Operadora atualizada com sucesso' });
  } catch (error) {
    logger.error({
      message: 'Erro ao atualizar operadora:',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
  });
    console.error('Erro ao atualizar operadora:', error);
    res.cookie('alertError', 'Erro ao atualizar Operadora, verifique e tente novamente', { maxAge: 3000 });
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.delete('/excluir-operadora/:id', verificaAutenticacao, (req, res) => {
  const idOperadora = req.params.id;

  // Verifique se a operadora está associada a produtos
  const sqlProdutos = 'SELECT * FROM produtos WHERE id_operadora = ?';
  db.query(sqlProdutos, [idOperadora], (errorProdutos, resultProdutos) => {
    if (errorProdutos) {
      console.error('Erro ao verificar produtos associados à operadora:', errorProdutos);
      res.status(500).json({ message: 'Erro interno do servidor' });
    } else if (resultProdutos.length > 0) {
      res.status(400).json({ message: 'Existem produtos vinculados a essa operadora' });
    } else {
      // Verifique se a operadora está associada a formulários
      const sqlFormularios = 'SELECT * FROM formularios WHERE id_operadora = ?';
      db.query(sqlFormularios, [idOperadora], (errorFormularios, resultFormularios) => {
        if (errorFormularios) {
          console.error('Erro ao verificar formulários associados à operadora:', errorFormularios);
          res.status(500).json({ message: 'Erro interno do servidor' });
        } else if (resultFormularios.length > 0) {
          res.status(400).json({ message: 'Existem formulários vinculados a essa operadora' });
        } else {
          // Se não estiver associada a produtos ou formulários, prossiga com a exclusão
          const sqlExcluirOperadora = 'DELETE FROM operadora WHERE id = ?';
          const sqlExcluirContatos = 'DELETE FROM contatos WHERE id_operadora = ?';

          db.beginTransaction((transactionError) => {
            if (transactionError) {
              console.error('Erro ao iniciar a transação:', transactionError);
              res.status(500).json({ message: 'Erro interno do servidor' });
              return;
            }

            db.query(sqlExcluirContatos, [idOperadora], (errorExcluirContatos, resultExcluirContatos) => {
              if (errorExcluirContatos) {
                console.error('Erro ao excluir contatos da operadora:', errorExcluirContatos);
                db.rollback(() => {
                  res.status(500).json({ message: 'Erro interno do servidor' });
                });
              } else {
                db.query(sqlExcluirOperadora, [idOperadora], (errorExcluirOperadora, resultExcluirOperadora) => {
                  if (errorExcluirOperadora) {
                    console.error('Erro ao excluir a operadora:', errorExcluirOperadora);
                    db.rollback(() => {
                      res.status(500).json({ message: 'Erro interno do servidor' });
                    });
                  } else {
                    db.commit((commitError) => {
                      if (commitError) {
                        logger.error({
                          message: 'Erro ao excluir operadora:',
                          error: error.message,
                          stack: error.stack,
                          timestamp: new Date().toISOString()
                      });
                        console.error('Erro ao finalizar a transação:', commitError);
                        db.rollback(() => {
                          res.status(500).json({ message: 'Erro interno do servidor' });
                        });
                      } else {
                        res.cookie('alertSuccess', 'Operadora excluída com sucesso', { maxAge: 3000 })
                        res.status(200).json({ message: 'Operadora excluída com sucesso' });
                      }
                    });
                  }
                });
              }
            });
          });
        }
      });
    }
  });
});

app.get('/entidades', verificaAutenticacao, (req, res) => {
  db.query('SELECT * FROM entidades', (error, results) => {
    if (error) throw error;
    res.render('entidades', { entidades: results, rotaAtual: 'entidades'  });
  })
})

app.post('/cadastrar-entidade', verificaAutenticacao, (req, res) => {
  const { nome, descricao, publico, documentos, taxa } = req.body;
  const sql = 'INSERT INTO entidades (nome, descricao, publico, documentos, taxa) VALUES (?, ?, ?, ?, ?)'
  db.query(sql, [nome, descricao, publico, documentos, taxa], (error, result) => {
    if (error) {
      logger.error({
        message: 'Erro ao cadastrar entidade:',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
      console.error('Erro ao cadastrar entidade:', error);
      res.cookie('alertError', 'Erro ao cadastrar Entidade, verifique e tente novamente', { maxAge: 3000 });
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.cookie('alertSuccess', 'Entidade criada com Sucesso', { maxAge: 3000 });
    res.status(200).json({ message: 'Nova entidade criada com sucesso' });
  })
});

app.post('/editar-entidade/:id', verificaAutenticacao, (req, res) => {
  const idEntidade = req.params.id;
  const {
    nome,
    descricao,
    publico,
    documentos,
    taxa,
  } = req.body;

  const sql =
    'UPDATE entidades SET nome=?, descricao=?, publico=?, documentos=?, taxa=? WHERE id=?';

  db.query(
    sql,
    [
      nome,
      descricao,
      publico,
      documentos,
      taxa,
      idEntidade,
    ],
    (error, result) => {
      if (error) {
        logger.error({
          message: 'Erro ao editar entidade:',
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
      });
        console.error('Erro ao atualizar operadora:', error);
        res.cookie('alertError', 'Erro ao atualizar Entidade, verifique e tente novamente', {
          maxAge: 3000,
        });
        res.status(500).json({ message: 'Erro interno do servidor' });
      } else {
        res.cookie('alertSuccess', 'Entidade atualizada com Sucesso', { maxAge: 3000 });
        res.status(200).json({ message: 'Entidade atualizada com sucesso' });
      }
    }
  );
});

app.delete('/excluir-entidade/:id', verificaAutenticacao, (req, res) => {
  const idEntidade = req.params.id;

  // Verifique se existem registros na tabela "formularios_entidades" vinculados a esta entidade
  const sqlCheckRelacionamento = 'SELECT COUNT(*) AS count FROM formularios_entidades WHERE entidade_id = ?';

  db.query(sqlCheckRelacionamento, [idEntidade], (error, result) => {
    if (error) {
      console.error('Erro ao verificar relacionamentos:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    } else {
      const countRelacionamentos = result[0].count;

      if (countRelacionamentos > 0) {
        // Se houver relacionamentos, não é possível excluir a entidade
        res.status(400).json({ message: 'Não é possível excluir a entidade, pois existem formulários vinculados a ela' });
      } else {
        // Se não houver relacionamentos, é seguro excluir a entidade
        const sqlExcluirEntidade = 'DELETE FROM entidades WHERE id = ?';

        db.query(sqlExcluirEntidade, [idEntidade], (error, result) => {
          if (error) {
            logger.error({
              message: 'Erro ao excluir entidade:',
              error: error.message,
              stack: error.stack,
              timestamp: new Date().toISOString()
            });
            console.error('Erro ao excluir a entidade:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
          } else {
            res.cookie('alertSuccess', 'Entidade excluída com sucesso', { maxAge: 3000 })
            res.status(200).json({ message: 'Entidade excluída com sucesso' });
          }
        });
      }
    }
  });
});

app.get('/procedimentos', verificaAutenticacao, (req, res) => {
  let operadoras;

  const fetchOperadoras = new Promise((resolve, reject) => {
    db.query('SELECT * FROM operadora', (error, results) => {
      if (error) {
        reject(error);
      } else {
        operadoras = results;
        resolve();
      }
    });
  });

  fetchOperadoras
    .then(() => {
      res.render('procedimentos', { operadoras: operadoras, rotaAtual: 'procedimentos' });
    })
    .catch((error) => {
      console.error('Erro ao buscar dados:', error);
      res.status(500).send('Erro interno do servidor');
    })
})

app.post('/cadastrar-procedimento', verificaAutenticacao, (req, res) => {
  const { procedimentoData } = req.body;
  const dataAgora = new Date();
  const usuarioLogado = req.session.usuario.nome
  const idOperadora = procedimentoData.idOperadora;

  const sqlProcedimento = 'INSERT INTO procedimentos (id_operadora, descricao, valorcop, limitecop, franquiacop, limitecarenciadias, tipofranquia) VALUES (?, ?, ?, ?, ?, ?, ?)'
  db.query(sqlProcedimento, [idOperadora, procedimentoData.descricao, procedimentoData.copay, procedimentoData.limitecopay, procedimentoData.franquiacopay, procedimentoData.limitecarencia, procedimentoData.tipofranquia], (error, result) => {
    if(error) {
      logger.error({
        message: 'Erro ao cadastrar novo procedimento:',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      console.error("Erro ao cadastrar procedimento:", error)
      res.cookie('alertError', 'Erro ao cadastrar Procedimento', {maxAge: 3000});
      res.status(500).json({ message: 'Erro ao cadastrar Procedimento'});
    }
    const idInserido = result.insertId;
    const sqlSelectDescricao = 'SELECT descricao FROM procedimentos WHERE id = ?';
    db.query(sqlSelectDescricao, [idInserido], (err, result) =>{
      if(err){
        console.error('Erro ao buscar nome do procedimento inserido')
      }
      const nomeProcedimento = `Novo procedimento: ${result[0].descricao}`;
      verificaExistenciaOperadora(idOperadora, (err, resultadoVerificacao) => {
        if (err) {
          console.error('Erro ao verificar existência da operadora', err);
          res.status(500).json({ error: 'Erro ao verificar existência da operadora' });
          return;
        }
  
        if (!resultadoVerificacao) {
          console.error('Resultado de verificação não recebido');
          res.status(500).json({ error: 'Resultado de verificação não recebido' });
          return;
        }
  
        const { existeOperadora, idFormulario } = resultadoVerificacao;
  
        if (existeOperadora) {
          db.query(sqlInclusaoProcedimento, [idFormulario, nomeProcedimento, usuarioLogado, dataAgora], (err, result) => {
            if (err) {
              console.error('Erro ao inserir atualização na timeline', err);
            }
          });
        }
      })
    });
    res.cookie('alertSuccess', 'Procedimento Cadastrado com sucesso', { maxAge: 3000 });
    res.status(200).json({ message: 'Novo Procedimento criado com sucesso' });
  })
})

app.post('/editar-procedimento/:id', verificaAutenticacao, (req, res) => {
  const procedimento = req.body.procedimentos
  const idProcedimento = req.params.id

  console.log(procedimento)

  const sqlProcedimentoUpdate = 'UPDATE procedimentos SET descricao=?, valorcop=?, limitecop=?, franquiacop=?, limitecarenciadias=?, tipofranquia=? WHERE id=?'

  db.query(sqlProcedimentoUpdate, [procedimento.descricao, procedimento.copay, procedimento.limitecopay, procedimento.franquiacopay, procedimento.limitecarencia, procedimento.tipofranquia, idProcedimento], (err, result) => {
    if(err){
      logger.error({
        message: 'Erro ao editar procedimento:',
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
      console.error("Erro ao editar procedimento:", err)
      res.cookie('alertError', 'Erro ao editar Procedimento', {maxAge: 3000});
      res.status(500).json({ message: 'Erro ao editar Procedimento'});
    }
    res.cookie('alertSuccess', 'Procedimento editado com sucesso', { maxAge: 3000 });
    res.status(200).json({ message: 'Procedimento editado com sucesso' });
  })
})

app.get('/procedimentos/:id', verificaAutenticacao, async (req, res) => {
  const idOperadora = req.params.id;

  try {
    const operadoraPromise = util.promisify(db.query).bind(db);
    const produtosPromise = util.promisify(db.query).bind(db);

    const operadora = await operadoraPromise('SELECT * FROM operadora WHERE id = ?', [idOperadora]);
    const procedimentos = await produtosPromise('SELECT * FROM procedimentos WHERE id_operadora = ?', [idOperadora]);

    res.render('procedimento', { operadora: operadora[0], procedimentos: procedimentos, rotaAtual: 'procedimentos' });
  } catch (error) {
    logger.error({
      message: 'Erro ao atualizar produto:',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    console.error('Erro ao buscar produtos:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.delete('/excluir-procedimento/:id', verificaAutenticacao, async (req, res) => {
  const idProcedimento = req.params.id;
  const sqlSelectProcedimento = 'SELECT * FROM procedimentos WHERE id = ?';
  const sqlExcluirProcedimento = 'DELETE FROM procedimentos WHERE id = ?';
  const sqlExcluirRelProProc = 'DELETE FROM procedimentos_produtos WHERE id_procedimento = ?';
  const dataAgora = new Date();
  const usuarioLogado = req.session.usuario.nome;
  const promisse = util.promisify(db.query).bind(db);

  try {
    // Consulta o procedimento para obter informações necessárias
    const [procedimentoResult] = await promisse(sqlSelectProcedimento, [idProcedimento]);

    if (!procedimentoResult || procedimentoResult.length === 0) {
      res.status(404).json({ message: 'Procedimento não encontrado' });
      return;
    }

    const idOperadora = procedimentoResult[0]?.id_operadora;
    const nomeProcedimento = `Procedimento: ${procedimentoResult[0]?.descricao}`;

    // Verifica se o procedimento está vinculado a algum produto
    const vinculosResult = await promisse('SELECT COUNT(*) AS total FROM procedimentos_produtos WHERE id_procedimento = ?', [idProcedimento]);

    const totalVinculos = vinculosResult[0]?.total || 0;

    if (totalVinculos > 0) {
      // Existem produtos vinculados, não exclui o procedimento
      res.cookie('alertError', 'Existem produtos vinculados a este procedimento. Remova os vínculos antes de excluir o procedimento.', { maxAge: 3000 });
      res.status(400).json({ message: 'Existem produtos vinculados a este procedimento. Remova os vínculos antes de excluir o procedimento.' });
      return;
    }

    // Verifica a existência da operadora
    const resultadoVerificacao = await new Promise((resolve, reject) => {
      verificaExistenciaOperadora(idOperadora, (err, resultado) => {
        if (err) {
          reject(err);
        } else {
          resolve(resultado);
        }
      });
    });

    // Exclui os relacionamentos
    await promisse(sqlExcluirRelProProc, [idProcedimento]);

    // Exclui o procedimento
    await promisse(sqlExcluirProcedimento, [idProcedimento]);

    // Se existe operadora, insere na timeline
    if (resultadoVerificacao) {
      const { existeOperadora, idFormulario } = resultadoVerificacao;

      if (existeOperadora) {
        await promisse(sqlExclusaoProcedimento, [idFormulario, nomeProcedimento, usuarioLogado, dataAgora]);
      }
    }

    res.cookie('alertSuccess', 'Procedimento excluído com sucesso', { maxAge: 3000 });
    res.status(200).json({ message: 'Procedimento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir procedimento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.get('/produtos', verificaAutenticacao, (req, res) => {
  let operadoras;

  const fetchOperadoras = new Promise((resolve, reject) => {
    db.query('SELECT * FROM operadora', (error, results) => {
      if (error) {
        reject(error);
      } else {
        operadoras = results;
        resolve();
      }
    });
  });

  fetchOperadoras
    .then(() => {
      res.render('produtos', { operadoras: operadoras, rotaAtual: 'produtos' });
    })
    .catch((error) => {
      console.error('Erro ao buscar dados:', error);
      res.status(500).send('Erro interno do servidor');
    })
})

app.post('/cadastrar-produto', verificaAutenticacao, (req, res) => {
  const { formData } = req.body;
  const { procedimentos } = req.body;

  const sqlProcedimentos = 'INSERT INTO procedimentos_produtos (id_procedimento, id_produto, id_operadora) VALUES (?, ?, ?)';

  const sqlProduto = 'INSERT INTO produtos (nomedoplano, ans, contratacao, cobertura, abrangencia, cooparticipacao, acomodacao, areadeabrangencia, condicoesconjuges, condicoesfilhos, condicoesnetos, condicoespais, condicoesoutros, documentosconjuges, documentosfilhos, documentosnetos, documentospais, documentosoutros, fx1, fx2, fx3, fx4, fx5, fx6, fx7, fx8, fx9, fx10, fx1comercial, fx2comercial, fx3comercial, fx4comercial, fx5comercial, fx6comercial, fx7comercial, fx8comercial, fx9comercial, fx10comercial, observacoes, valorSpread, id_operadora, reducaocarencia, congeneres, variacao1, variacao2, variacao3, variacao4, variacao5, variacao6, variacao7, variacao8, variacao9 ) VALUES (?, ?, ?, ? , ?,?, ?, ?, ? , ?,?, ?, ?, ? , ?,?, ?, ?, ? , ?,?, ?, ?, ? , ?,?, ?, ?, ? , ?, ?, ?, ?, ? , ?,?, ?, ?, ? , ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  db.query(sqlProduto, [formData.nomedoplano, formData.ansplano, formData.contratoplano, formData.coberturaplano, formData.abrangenciaplano, formData.cooparticipacao, formData.acomodacao, formData.areaabrangencia, formData.condicoesconjuges, formData.condicoesfilhos, formData.condicoesnetos, formData.condicoespais, formData.condicoesoutros, formData.documentosconjuges, formData.documentosfilhos, formData.documentosnetos, formData.documentospais, formData.documentosoutros, formData.fx1, formData.fx2, formData.fx3, formData.fx4, formData.fx5, formData.fx6, formData.fx7, formData.fx8, formData.fx9, formData.fx10, formData.fxComercial1, formData.fxComercial2, formData.fxComercial3, formData.fxComercial4, formData.fxComercial5, formData.fxComercial6, formData.fxComercial7, formData.fxComercial8, formData.fxComercial9, formData.fxComercial10, formData.planoobs, formData.valorSpread, formData.idOperadora, formData.reducaocarencia, formData.congenere, formData.variacao1, formData.variacao2, formData.variacao3, formData.variacao4, formData.variacao5, formData.variacao6, formData.variacao7, formData.variacao8, formData.variacao9], (error, result) => {
    if (error) {
      logger.error({
        message: 'Erro ao cadastrar produto:',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      console.error('Erro ao cadastrar produto:', error);
      res.cookie('alertError', 'Erro ao cadastrar Produto, verifique e tente novamente', { maxAge: 3000 });
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
    const idProduto = result.insertId;

    if (Array.isArray(procedimentos) && procedimentos.length > 0) {
      let erroVinculacao = false; // Variável para rastrear erros durante o loop

      for (const procedimento of procedimentos) {
        db.query(sqlProcedimentos, [procedimento.idProcedimento, idProduto, procedimento.idOperadora], (err, result) => {
          if (err) {
            logger.error({
              message: 'Erro ao vincular os procedimentos às operadoras e aos produtos:',
              error: err.message,
              stack: err.stack,
              timestamp: new Date().toISOString()
            });
            console.error('Erro ao vincular os procedimentos aos produtos e operadoras');
            erroVinculacao = true; // Defina a variável de erro para verdadeira se houver um erro
          }
        });
      }

      // Envie a resposta somente após a conclusão do loop
      if (erroVinculacao) {
        res.cookie('alertError', 'Erro ao cadastrar Produto, verifique e tente novamente', { maxAge: 3000 });
        res.status(500).json({ message: 'Erro interno do servidor' });
      } else {
        res.cookie('alertSuccess', 'Produto Cadastrado com sucesso', { maxAge: 3000 });
        res.status(200).json({ message: 'Novo Produto criado com sucesso' });
      }
    } else {
      // Se não houver procedimentos para vincular, envie a resposta de sucesso diretamente
      res.cookie('alertSuccess', 'Produto Cadastrado com sucesso', { maxAge: 3000 });
      res.status(200).json({ message: 'Novo Produto criado com sucesso' });
    }
  });
});


app.get('/produtos/:id', verificaAutenticacao, async (req, res) => {
  const idOperadora = req.params.id;

  try {
    const queryPromise = util.promisify(db.query).bind(db);

    const operadora = await queryPromise('SELECT * FROM operadora WHERE id = ?', [idOperadora]);
    const produtos = await queryPromise('SELECT * FROM produtos WHERE id_operadora = ?', [idOperadora]);
    const procedimentos = await queryPromise('SELECT * FROM procedimentos WHERE id_operadora = ? ', [idOperadora]);
    const procedimentosAssociados = await queryPromise('SELECT * FROM procedimentos_produtos WHERE id_operadora = ?', [idOperadora]);

    // Preparar um objeto mapeando os procedimentos associados a cada produto
    const procedimentosPorProduto = {};
    produtos.forEach(produto => {
      procedimentosPorProduto[produto.id] = procedimentosAssociados.filter(associado => associado.id_produto === produto.id);
    });

    res.render('produto', {
      operadora: operadora[0],
      produtos: produtos,
      procedimentos: procedimentos,
      procedimentosPorProduto: procedimentosPorProduto, // Passar o objeto para a página EJS
      rotaAtual: 'produtos'
    });
  } catch (error) {
    logger.error({
      message: 'Erro ao atualizar produto:',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    console.error('Erro ao buscar produtos:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.post('/editar-produto/:id', verificaAutenticacao, async (req, res) => {
  const idProduto = req.params.id;
  const formData = req.body.formData;
  const selectedProcedimentos = req.body.procedimentos;
  const dataAgora = new Date();
  const usuarioLogado = req.session.usuario.nome

  const sqlSelectProduto = 'SELECT *FROM produtos WHERE id=?'

  const sqlProdutoUpdate =
    'UPDATE produtos SET nomedoplano=?, ans=?, contratacao=?, cobertura=?, abrangencia=?, cooparticipacao=?, acomodacao=?, areadeabrangencia=?, condicoesconjuges=?, condicoesfilhos=?, condicoesnetos=?, condicoespais=?, condicoesoutros=?, documentosconjuges=?, documentosfilhos=?, documentosnetos=?, documentospais=?, documentosoutros=?, fx1=?, fx2=?, fx3=?, fx4=?, fx5=?, fx6=?, fx7=?, fx8=?, fx9=?, fx10=?, fx1comercial=?, fx2comercial=?, fx3comercial=?, fx4comercial=?, fx5comercial=?, fx6comercial=?, fx7comercial=?, fx8comercial=?, fx9comercial=?, fx10comercial=?, observacoes=?, reducaocarencia=?, congeneres=?, variacao1=?, variacao2=?, variacao3=?, variacao4=?, variacao5=?, variacao6=?, variacao7=?, variacao8=?, variacao9=? WHERE id=? AND id_operadora=?';

  const queryPromise = util.promisify(db.query).bind(db);
  try {

    const resultProduto = await queryPromise(sqlSelectProduto, [idProduto]);

    if (resultProduto.length === 0) {
      console.error('Produto não encontrado');
      res.status(404).json({ error: 'Produto não encontrado' });
      return;
    }

    const idOperadora = resultProduto[0].id_operadora;
    const nomeProduto = `Produto: ${resultProduto[0].nomedoplano}`

    // Atualizar os dados do produto no banco de dados
    const resultUpdate = await queryPromise(
      sqlProdutoUpdate,
      [
        formData.nomedoplano, formData.ansplano, formData.contratoplano, formData.coberturaplano, formData.abrangenciaplano, formData.cooparticipacao, formData.acomodacao, formData.areaabrangencia, formData.condicoesconjuges, formData.condicoesfilhos, formData.condicoesnetos, formData.condicoespais, formData.condicoesoutros, formData.documentosconjuges, formData.documentosfilhos, formData.documentosnetos, formData.documentospais, formData.documentosoutros, formData.fx1, formData.fx2, formData.fx3, formData.fx4, formData.fx5, formData.fx6, formData.fx7, formData.fx8, formData.fx9, formData.fx10, formData.fxComercial1, formData.fxComercial2, formData.fxComercial3, formData.fxComercial4, formData.fxComercial5, formData.fxComercial6, formData.fxComercial7, formData.fxComercial8, formData.fxComercial9, formData.fxComercial10, formData.planoobs, formData.reducaocarencia, formData.congenere, formData.variacao1, formData.variacao2, formData.variacao3, formData.variacao4, formData.variacao5, formData.variacao6, formData.variacao7, formData.variacao8, formData.variacao9, idProduto, formData.idOperadora
      ], 
    );

    const sqlProcedimentosAtuais = 'SELECT id_procedimento FROM procedimentos_produtos WHERE id_produto = ? AND id_operadora = ?';
    const procedimentosAtuais = await queryPromise(sqlProcedimentosAtuais, [idProduto, formData.idOperadora]);
    const procedimentosAtuaisIds = procedimentosAtuais.map(row => row.id_procedimento);

    const procedimentosFrontendIds = selectedProcedimentos.map(procedimento => procedimento.idProcedimento);

    // Remova os procedimentos ausentes
    const procedimentosRemover = procedimentosAtuaisIds.filter(id => !procedimentosFrontendIds.includes(id));
    if (procedimentosRemover.length > 0) {
        const sqlRemoverProcedimentos = 'DELETE FROM procedimentos_produtos WHERE id_produto = ? AND id_operadora = ? AND id_procedimento IN (?)';
        await queryPromise(sqlRemoverProcedimentos, [idProduto, formData.idOperadora, procedimentosRemover]);
    }

    // Adicione novos procedimentos
    const procedimentosAdicionar = procedimentosFrontendIds.filter(id => !procedimentosAtuaisIds.includes(id));
    if (procedimentosAdicionar.length > 0) {
        const sqlAdicionarProcedimentos = 'INSERT INTO procedimentos_produtos (id_produto, id_operadora, id_procedimento) VALUES ?';
        const valuesAdicionar = procedimentosAdicionar.map(id => [idProduto, formData.idOperadora, id]);
        await queryPromise(sqlAdicionarProcedimentos, [valuesAdicionar]);
    }
    
    if (resultUpdate.affectedRows === 0) {
      console.error('Produto não atualizado');
      res.status(500).json({ error: 'Erro ao atualizar Produto' });
      return;
    }

    verificaExistenciaOperadora(idOperadora, (err, resultadoVerificacao) => {
      if (err) {
        console.error('Erro ao verificar existência da operadora', err);
        res.status(500).json({ error: 'Erro ao verificar existência da operadora' });
        return;
      }

      if (!resultadoVerificacao) {
        console.error('Resultado de verificação não recebido');
        res.status(500).json({ error: 'Resultado de verificação não recebido' });
        return;
      }

      const { existeOperadora, idFormulario } = resultadoVerificacao;

      if (existeOperadora) {
        db.query(sqlEdicaoProduto, [idFormulario, nomeProduto, usuarioLogado, dataAgora], (err, result) => {
          if (err) {
            console.error('Erro ao inserir atualização na timeline', err);
          }
        });
      }
    })
    res.cookie('alertSuccess', 'Produto atualizado com sucesso', { maxAge: 3000 });
    res.status(200).json({ message: 'Produto atualizado com sucesso' });
  } catch (error) {
    logger.error({
      message: 'Erro ao atualizar produto:',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    console.error('Erro ao atualizar Produto:', error);
    res.cookie('alertError', 'Erro ao atualizar Produto, verifique e tente novamente', { maxAge: 3000 });
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.delete('/excluir-produto/:id', verificaAutenticacao, (req, res) => {
  const idProduto = req.params.id;
  const sqlSelectProduto = 'SELECT * FROM produtos WHERE id =?';
  const sqlExcluirProduto = 'DELETE FROM produtos WHERE id = ?';
  const sqlExcluirRelProdutoProcedimento = 'DELETE FROM procedimentos_produtos WHERE id_produto = ?';
  const dataAgora = new Date();
  const usuarioLogado = req.session.usuario.nome;

  db.query(sqlSelectProduto, [idProduto], (err, result) => {
    if (err) {
      console.error('Erro ao consultar produto', err);
      res.status(500).json({ message: 'Erro interno do servidor' });
      return;
    }

    const idOperadora = result[0].id_operadora;
    const nomeProduto = `Produto: ${result[0].nomedoplano}`;

    verificaExistenciaOperadora(idOperadora, (err, resultadoVerificacao) => {
      if (err) {
        console.error('Erro ao verificar existência da operadora', err);
        res.status(500).json({ error: 'Erro ao verificar existência da operadora' });
        return;
      }

      if (!resultadoVerificacao) {
        console.error('Resultado de verificação não recebido');
        res.status(500).json({ error: 'Resultado de verificação não recebido' });
        return;
      }

      const { existeOperadora, idFormulario } = resultadoVerificacao;

      if (existeOperadora) {
        db.query(sqlExcluirRelProdutoProcedimento, [idProduto], (err, result) => {
          if (err) {
            console.error('Erro ao excluir vínculos de produto com procedimentos:', err);
            res.status(500).json({ message: 'Erro interno do servidor' });
            return;
          }

          db.query(sqlExcluirProduto, [idProduto], (errorExcluirProduto, resultExcluirProduto) => {
            if (errorExcluirProduto) {
              console.error('Erro ao excluir o produto:', errorExcluirProduto);
              res.status(500).json({ message: 'Erro interno do servidor' });
              return;
            }

            // Executar o SQL de exclusão do produto (sqlExclusaoProduto)
            db.query(sqlExclusaoProduto, [idFormulario, nomeProduto, usuarioLogado, dataAgora], (errExclusaoProduto, resultExclusaoProduto) => {
              if (errExclusaoProduto) {
                console.error('Erro ao executar SQL de exclusão do produto:', errExclusaoProduto);
                res.status(500).json({ message: 'Erro interno do servidor' });
                return;
              }

              res.cookie('alertSuccess', 'Produto excluído com sucesso', { maxAge: 3000 });
              res.status(200).json({ message: 'Produto excluído com sucesso' });
            });
          });
        });
      }
    });
  });
});

app.post('/duplicar-produto/:id', verificaAutenticacao, (req, res) => {
  const idProduto = req.params.id
  const dataAgora = new Date();
  const usuarioLogado = req.session.usuario.nome

  const sqlSelecionarProduto = 'SELECT * FROM produtos WHERE id = ?'
  const sqlInserirProduto = 'INSERT INTO produtos (nomedoplano, ans, contratacao, cobertura, abrangencia, cooparticipacao, acomodacao, areadeabrangencia, condicoesconjuges, condicoesfilhos, condicoesnetos, condicoespais, condicoesoutros, documentosconjuges, documentosfilhos, documentosnetos, documentospais, documentosoutros, fx1, fx2, fx3, fx4, fx5, fx6, fx7, fx8, fx9, fx10, fx1comercial, fx2comercial, fx3comercial, fx4comercial, fx5comercial, fx6comercial, fx7comercial, fx8comercial, fx9comercial, fx10comercial, observacoes, valorSpread, id_operadora, reducaocarencia, congeneres, variacao1, variacao2, variacao3, variacao4, variacao5, variacao6, variacao7, variacao8, variacao9) VALUES (?, ?, ?, ? , ?,?, ?, ?, ? , ?,?, ?, ?, ? , ?,?, ?, ?, ? , ?,?, ?, ?, ? , ?,?, ?, ?, ? , ?, ?, ?, ?, ? , ?,?, ?, ?, ? , ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sqlSelecionarProduto, [idProduto], (err, result) => {
    if(err){
      console.error('Erro ao buscar produto com a ID passada')
    }
    const idOperadora = result[0].id_operadora;

    verificaExistenciaOperadora(idOperadora, (err, resultadoVerificacao) => {
      if (err) {
        console.error('Erro ao verificar existência da operadora', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
        return;
      }

      const { existeOperadora, idFormulario } = resultadoVerificacao;

      if (existeOperadora) {
        db.query(sqlAdicaoProduto, [idFormulario, usuarioLogado, dataAgora], (err, result) => {
          if (err) {
            console.error('Erro ao adicionar atualização ao formulário vinculado a operadora em que está vinculado esse produto', err);
          }
        });
      }
    })
    const p = result[0]
    db.query(sqlInserirProduto, [p.nomedoplano + ' - COPIA', p.ans, p.contratacao, p.cobertura, p.abrangencia, p.cooparticipacao, p.acomodacao, p.areadeabrangencia, p.condicoesconjuges, p.condicoesfilhos, p.condicoesnetos, p.condicoespais, p.condicoesoutros, p.documentosconjuges, p.documentosfilhos, p.documentosnetos, p.documentospais, p.documentosoutros, p.fx1, p.fx2, p.fx3, p.fx4, p.fx5, p.fx6, p.fx7, p.fx8, p.fx9, p.fx10, p.fx1comercial, p.fx2comercial, p.fx3comercial, p.fx4comercial, p.fx5comercial, p.fx6comercial, p.fx7comercial, p.fx8comercial, p.fx9comercial, p.fx10comercial, p.observacoes, p.valorSpread, p.id_operadora, p.reducaocarencia, p.congeneres,  p.variacao1, p.variacao2, p.variacao3, p.variacao4, p.variacao5, p.variacao6, p.variacao7, p.variacao8, p.variacao9], (err, result) => {
      if(err){
        logger.error({
          message: 'Erro ao duplicar produto:',
          error: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString()
      });
        console.error('Erro ao DUPLICAR produto:', err);
        res.cookie('alertError', 'Erro ao DUPLICAR Produto', { maxAge: 3000 });
        res.status(500).json({ message: 'Erro interno do servidor' });
      }
      res.cookie('alertSuccess', 'Produto DUPLICADO com sucesso, lembre-se de editar suas informações', { maxAge: 3000 });
      res.status(200).json({ message: 'Produto DUPLICADO com sucesso' });

    })
  })
})

app.get('/', verificaAutenticacao, (req, res) => {
  const sqlFinos = 'SELECT *FROM formularios';
  const sqlOperadora = 'SELECT *FROM operadora';
  const sqlVigencias = 'SELECT *FROM vigencias'
  const sqlEntidades = 'SELECT *FROM entidades'
  const sqlEntidades_formularios = 'SELECT *FROM formularios_entidades'
  let entidades_formularios = [];
  let finos = [];
  let operadoras = [];
  let vigencias = [];
  let entidades = [];
  db.query(sqlFinos, (err, BDfinos) => {
    if (err) {
      console.error('Erro na busca dos formulários no BD', err)
    }
    finos = BDfinos;
    db.query(sqlOperadora, (err, BDoperadoras) => {
      if (err) {
        console.error('Erro na busca das Operadoras no BD', err)
      }
      operadoras = BDoperadoras;
      db.query(sqlVigencias, (err, BDvigencias) => {
        if (err) {
          console.error('Erro na busca das vigências no BD', err)
        }
        vigencias = BDvigencias;
        db.query(sqlEntidades, (err, BDentidades) => {
          if (err) {
            console.error("Erro na busca das Entidades", err)
          }
          entidades = BDentidades
          db.query(sqlEntidades_formularios, (err, BDentidades_formularios) => {
            if (err) {
              console.error("Erro ao buscar a relação de entidades e formularios", err)
            }
            entidades_formularios = BDentidades_formularios;
            res.render('finos', { finos: finos, operadoras: operadoras, vigencias: vigencias, entidades: entidades, entidadesform: entidades_formularios, rotaAtual: 'finos' })
          })
        })
      })
    })
  })
});

app.get('/fino/:id', async (req, res) => {
  const idFino = req.params.id;

  const sqlFino = 'SELECT * FROM formularios WHERE id=?';
  const sqlVigencias = 'SELECT * FROM vigencias WHERE id_fino=?';
  const sqlOperadora = 'SELECT * FROM operadora WHERE id=?';
  const sqlProdutos = 'SELECT * FROM produtos WHERE id_operadora=?';
  const sqlContatos = 'SELECT * FROM contatos WHERE id_operadora=?';
  const sqlEntidades = 'SELECT e.* FROM entidades e INNER JOIN formularios_entidades fe ON e.id = fe.entidade_id WHERE fe.formulario_id=?';
  const sqlProcedimentos = 'SELECT * FROM procedimentos WHERE id_operadora=?';
  const sqlAtualizacoes = 'SELECT * FROM atualizacoes WHERE id_fino=?';
  const sqlRelProdProc = 'SELECT * FROM procedimentos_produtos WHERE id_operadora = ?'

  const queryPromise = util.promisify(db.query).bind(db);

  try {
    const [finoResult] = await queryPromise(sqlFino, [idFino]);

    if (!finoResult) {
      return res.status(404).json({ message: 'Fino não encontrado' });
    }

    const vigenciasResult = await queryPromise(sqlVigencias, [idFino]);
    const atualizacoesResult = await queryPromise(sqlAtualizacoes, [idFino]);
    const [operadoraResult] = await queryPromise(sqlOperadora, [finoResult.id_operadora]);
    const produtosResult = await queryPromise(sqlProdutos, [finoResult.id_operadora]);
    const contatosResult = await queryPromise(sqlContatos, [finoResult.id_operadora]);
    const entidadesResult = await queryPromise(sqlEntidades, [idFino]);
    const procedimentoResult = await queryPromise(sqlProcedimentos, [finoResult.id_operadora])
    const procedimentosAssociados = await queryPromise(sqlRelProdProc, [finoResult.id_operadora]);

    const procedimentosPorProduto = {};
    produtosResult.forEach(produto => {
      procedimentosPorProduto[produto.id] = procedimentosAssociados.filter(associado => associado.id_produto === produto.id);
    });


    res.render('finoIndividual',
      {
        fino: finoResult,
        vigencias: vigenciasResult,
        operadora: operadoraResult,
        produtos: produtosResult,
        procedimentos: procedimentoResult,
        contatos: contatosResult,
        entidades: entidadesResult,
        atualizacoes: atualizacoesResult,
        procedimentosPorProduto: procedimentosPorProduto
      })
  } catch (error) {
    logger.error({
      message: 'Erro ao buscar informações para renderizar o fino:',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    console.error('Erro ao buscar informações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.get('/buscar-ultimo-procedimento/:idOperadora', (req, res) => {
  const idOperadora = req.params.idOperadora;

  const query = `
      SELECT *
      FROM procedimentos
      WHERE id_operadora = ?
      ORDER BY id DESC
      LIMIT 1;
  `;

  db.query(query, [idOperadora], (error, result) => {
      if (error) {
          console.error('Erro ao buscar último procedimento:', error);
          res.status(500).json({ error: 'Erro interno do servidor' });
      } else {
          const ultimoProcedimento = result[0];
          res.json(ultimoProcedimento);
      }
  });
});

app.get('/fino-restrito/:id', verificaAutenticacao, async (req, res) => {
  const idFino = req.params.id;

  const sqlFino = 'SELECT * FROM formularios WHERE id=?';
  const sqlVigencias = 'SELECT * FROM vigencias WHERE id_fino=?';
  const sqlOperadora = 'SELECT * FROM operadora WHERE id=?';
  const sqlProdutos = 'SELECT * FROM produtos WHERE id_operadora=?';
  const sqlContatos = 'SELECT * FROM contatos WHERE id_operadora=?';
  const sqlEntidades = 'SELECT e.* FROM entidades e INNER JOIN formularios_entidades fe ON e.id = fe.entidade_id WHERE fe.formulario_id=?';
  const sqlProcedimentos = 'SELECT * FROM procedimentos WHERE id_operadora=?';
  const sqlAtualizacoes = 'SELECT * FROM atualizacoes WHERE id_fino=?';

  const queryPromise = util.promisify(db.query).bind(db);

  try {
    const [finoResult] = await queryPromise(sqlFino, [idFino]);

    if (!finoResult) {
      return res.status(404).json({ message: 'Fino não encontrado' });
    }

    const vigenciasResult = await queryPromise(sqlVigencias, [idFino]);
    const atualizacoesResult = await queryPromise(sqlAtualizacoes, [idFino]);
    const [operadoraResult] = await queryPromise(sqlOperadora, [finoResult.id_operadora]);
    const produtosResult = await queryPromise(sqlProdutos, [finoResult.id_operadora]);
    const contatosResult = await queryPromise(sqlContatos, [finoResult.id_operadora]);
    const entidadesResult = await queryPromise(sqlEntidades, [idFino]);
    const procedimentoResult = await queryPromise(sqlProcedimentos, [finoResult.id_operadora])



    res.render('finoRestrito',
      {
        fino: finoResult,
        vigencias: vigenciasResult,
        operadora: operadoraResult,
        produtos: produtosResult,
        procedimentos: procedimentoResult,
        contatos: contatosResult,
        entidades: entidadesResult,
        atualizacoes: atualizacoesResult
      })
  } catch (error) {
    logger.error({
      message: 'Erro ao renderizar fino restrito:',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    console.error('Erro ao buscar informações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
})

app.get('/finojson/:id', async (req, res) => {
  const idFino = req.params.id;

  const sqlFino = 'SELECT * FROM formularios WHERE id=?';
  const sqlVigencias = 'SELECT * FROM vigencias WHERE id_fino=?';
  const sqlOperadora = 'SELECT * FROM operadora WHERE id=?';
  const sqlProdutos = 'SELECT * FROM produtos WHERE id_operadora=?';
  const sqlContatos = 'SELECT * FROM contatos WHERE id_operadora=?';
  const sqlEntidades = 'SELECT e.* FROM entidades e INNER JOIN formularios_entidades fe ON e.id = fe.entidade_id WHERE fe.formulario_id=?';
  const sqlProcedimentos = 'SELECT * FROM procedimentos WHERE id_operadora=?';
  const queryPromise = util.promisify(db.query).bind(db);

  try {
    const [finoResult] = await queryPromise(sqlFino, [idFino]);

    if (!finoResult) {
      return res.status(404).json({ message: 'Fino não encontrado' });
    }

    const vigenciasResult = await queryPromise(sqlVigencias, [idFino]);
    const [operadoraResult] = await queryPromise(sqlOperadora, [finoResult.id_operadora]);
    const produtosResult = await queryPromise(sqlProdutos, [finoResult.id_operadora]);
    const contatosResult = await queryPromise(sqlContatos, [finoResult.id_operadora]);
    const entidadesResult = await queryPromise(sqlEntidades, [idFino]);

    const produtoIds = produtosResult.map(produto => produto.id);

    const procedimentosPorProduto = {};

    for (const produtoId of produtoIds) {
      const procedimentosProduto = await queryPromise(sqlProcedimentos, [produtoId]);
      procedimentosPorProduto[produtoId] = procedimentosProduto;
    }

    res.send(
      {
        fino: finoResult,
        vigencias: vigenciasResult,
        operadora: operadoraResult,
        produtos: produtosResult,
        procedimentos: procedimentosPorProduto,
        contatos: contatosResult,
        entidades: entidadesResult
      })
  } catch (error) {
    console.error('Erro ao buscar informações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.post('/editar-fino/:id', verificaAutenticacao, async (req, res) => {
  const idFino = req.params.id;
  const formData = req.body.formData;
  const entidades = req.body.entidades;
  const vigencias = req.body.vigencias;
  const dataAgora = new Date();
  const usuarioLogado = req.session.usuario.nome

  const partesData = formData.dataAtual.split('/');
  const dataFormatada = `${partesData[2]}-${partesData[1]}-${partesData[0]}`;

  const sqlFinoUpdate = 'UPDATE formularios SET id_operadora=?, dataatualizacao=?, administradora=?, enviopropostas=?, layoutpropostas=?, aniversariocontrato=?, negcomissao=?, comissaovalor=?, negagenciamento=?, agenciamentovalor=?, negobs=?, docoperadora=?, assOperadora=?, assAdministradora=?, logoOperadora=?, manualmarca=?, modelodeclaracao=?, obsFino=?, modalidade=?  WHERE id=?';

  const sqlEntidadesInsert = 'INSERT INTO formularios_entidades (formulario_id, entidade_id) VALUES (?, ?)';

  const sqlVigenciasInsert = 'INSERT INTO vigencias (id_fino, iniciodavigencia, movimentacao, datafaturamento) VALUES (?, ?, ?, ?)';

  const sqlDeleteEntidades = 'DELETE FROM formularios_entidades WHERE formulario_id=?';
  const sqlDeleteVigencias = 'DELETE FROM vigencias WHERE id_fino=?';

  const queryPromisse = util.promisify(db.query).bind(db);

  try {
    await queryPromisse(sqlDeleteEntidades, [idFino]);
    await queryPromisse(sqlDeleteVigencias, [idFino]);

    await queryPromisse(
      sqlFinoUpdate,
      [
        formData.operadora, dataFormatada, formData.administradora, formData.enviopropostas, formData.layoutpropostas, formData.aniversariocontrato, formData.negcomissao, formData.comissaovalor, formData.negagenciamento, formData.agenciamentovalor, formData.negobs, formData.docoperadora, formData.assOperadora, formData.assAdm, formData.logoOperadora, formData.manualmarca, formData.modelodeclaracao, formData.obsFino, formData.modalidade, idFino
      ]
    );

    if (Array.isArray(vigencias)) {
      for (const vigencia of vigencias) {
        await queryPromisse(
          sqlVigenciasInsert,
          [
            idFino,
            vigencia.iniciodavigencia,
            vigencia.movimentacao,
            vigencia.datafaturamento
          ]
        )
      }
    }

    if (Array.isArray(entidades)) {
      for (const entidade of entidades) {
        await queryPromisse(
          sqlEntidadesInsert,
          [
            idFino,
            entidade.idEntidade
          ]
        )
      }
    }
    db.query(sqlFinoEditar, [idFino, usuarioLogado , dataAgora], (err, result) => {
      if(err){
        logger.error({
          message: 'Erro ao atualizar fino:',
          error: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString()
        });
        console.error('Erro ao informar atualização', err)
      }
      res.cookie('alertSuccess', 'Fino atualizado com sucesso', { maxAge: 3000 });
      res.status(200).json({ message: 'Fino atualizado com sucesso' });
    })
  } catch (error) {
    console.error('Erro ao atualizar fino:', error);
    res.cookie('alertError', 'Erro ao atualizar fino, verifique e tente novamente', { maxAge: 3000 });
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.delete('/excluir-fino/:id', (req, res) => {
  const idFino = req.params.id;

  const sqlDeleteFino = 'DELETE FROM formularios WHERE id = ?'
  const sqlDeleteEntidadesRelacionadas = 'DELETE FROM formularios_entidades WHERE formulario_id=?'
  const sqlDeleteVigencias = 'DELETE FROM vigencias WHERE id_fino=?'

  db.query(sqlDeleteVigencias, [idFino], (erro, result) => {
    if (erro) {
      console.error('Erro ao deletar vigências ateladas ao formulário', erro)
    }
    db.query(sqlDeleteEntidadesRelacionadas, [idFino], (erro, result) => {
      if (erro) {
        console.error('Erro ao excluir o relacionamento com as entidades', erro)
      }
      db.query(sqlDeleteFino, [idFino], (erro, result) => {
        if (erro) {
          logger.error({
            message: 'Erro ao excluir o fino:',
            error: erro.message,
            stack: erro.stack,
            timestamp: new Date().toISOString()
          });
          console.error('Erro ao excluir formulário', erro)
          res.status(500).json({ message: 'Erro ao excluir formulário' });
        } else {
          res.cookie('alertSuccess', 'Fino excluído com sucesso', { maxAge: 3000 })
          res.status(200).json({ message: 'Fino excluído com sucesso' });
        }
      })
    })
  })
})

app.post('/cadastrar-fino', (req, res) => {
  const { formData } = req.body;
  const { vigencias } = req.body;
  const { entidades } = req.body;

  const partesData = formData.dataAtual.split('/');
  const dataFormatada = `${partesData[2]}-${partesData[1]}-${partesData[0]}`;

  const sqlFino = 'INSERT INTO formularios (id_operadora, datacriacao, administradora, enviopropostas, layoutpropostas, aniversariocontrato, negcomissao, comissaovalor, negagenciamento, agenciamentovalor, negobs, docoperadora, assOperadora, assAdministradora, logoOperadora, manualmarca, modelodeclaracao, obsFino) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  const sqlVigencia = 'INSERT INTO vigencias (id_fino, iniciodavigencia, movimentacao, datafaturamento) VALUES (?, ?, ?, ?)';

  const sqlEntidades = 'INSERT INTO formularios_entidades (formulario_id, entidade_id) VALUES (?, ?)'


  db.query(sqlFino, [formData.operadora, dataFormatada, formData.administradora, formData.enviopropostas, formData.layoutpropostas, formData.aniversariocontrato, formData.negcomissao, formData.comissaovalor, formData.negagenciamento, formData.agenciamentovalor, formData.negobs, formData.docoperadora, formData.assOperadora, formData.assAdm, formData.logoOperadora, formData.manualmarca, formData.modelodeclaracao, formData.obsFino], (error, result) => {
    if (error) {
      logger.error({
        message: 'Erro ao cadastrar fino:',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      console.error(`Error ao cadastrar o Fino`, error);
      res.cookie('alertError', 'Erro ao cadastrar Fino, verifique e tente novamente', { maxage: 3000 });
      res.status(500).json({ message: 'Erro interno do servidor' });
    }

    const idFino = result.insertId;

    if (Array.isArray(vigencias)) {
      vigencias.forEach((vigencia) => {
        db.query(sqlVigencia, [idFino, vigencia.iniciodavigencia, vigencia.movimentacao, vigencia.datafaturamento], (error, result) => {
          if (error) {
            console.error('Erro ao cadastrar vigencias', error);
          }
          if (Array.isArray(entidades)) {
            entidades.forEach((entidade) => {
              db.query(sqlEntidades, [idFino, entidade.idEntidade], (error, result) => {
                if (error) {
                  console.error('Erro ao relacionar entidades', error);
                }
              })
            })
          }
        });
      })
    }
  });
  res.cookie('alertSuccess', 'Fino cadastrado com Sucesso', { maxAge: 3000 });
  res.status(200).json({ message: 'Novo Fino criado com sucesso' })
});

app.get('/gerar-excel/:id/:nomefantasia/:adm', verificaAutenticacao, (req, res) => {
  const idOperadora = req.params.id;
  const nomeFantasia = req.params.nomefantasia;
  const adm = req.params.adm;
  const sqlSelectPlanos = 'SELECT * FROM produtos WHERE id_operadora = ?';

  db.query(sqlSelectPlanos, [idOperadora], (err, result) => {
    if (err) {
      console.error('Erro ao buscar os produtos vinculados', err);
      return res.status(500).send('Erro ao gerar o arquivo Excel');
    }

    const produtos = result;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    worksheet.addRow(['COD. GRUPO', 'COD.PLANO', 'ID FX ETÁRIA', 'NOME FX ETÁRIA', 'PREÇO NET', 'PREÇO COBRANÇA']);
    produtos.forEach(function (produto) {
      worksheet.addRow(['em branco', produto.nomedoplano, 1, '00 a 18 Anos', produto.fx1, produto.fx1comercial]);
      worksheet.addRow(['em branco', produto.nomedoplano, 2, '19 a 23 Anos', produto.fx2, produto.fx2comercial]);
      worksheet.addRow(['em branco', produto.nomedoplano, 3, '24 a 28 Anos', produto.fx3, produto.fx3comercial]);
      worksheet.addRow(['em branco', produto.nomedoplano, 4, '29 a 33 Anos', produto.fx4, produto.fx4comercial]);
      worksheet.addRow(['em branco', produto.nomedoplano, 5, '34 a 38 Anos', produto.fx5, produto.fx5comercial]);
      worksheet.addRow(['em branco', produto.nomedoplano, 6, '39 a 43 Anos', produto.fx6, produto.fx6comercial]);
      worksheet.addRow(['em branco', produto.nomedoplano, 7, '44 a 48 Anos', produto.fx7, produto.fx7comercial]);
      worksheet.addRow(['em branco', produto.nomedoplano, 8, '49 a 53 Anos', produto.fx8, produto.fx8comercial]);
      worksheet.addRow(['em branco', produto.nomedoplano, 9, '54 a 58 Anos', produto.fx9, produto.fx9comercial]);
      worksheet.addRow(['em branco', produto.nomedoplano, 10, 'Mais de 59 Anos', produto.fx10, produto.fx10comercial]);
    });

    // Configurar cabeçalhos para download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Tabela DS Operadora_${nomeFantasia} ${adm}.xlsx`);

    // Enviar o arquivo ao cliente
    workbook.xlsx.write(res)
      .then(() => {
        console.log('Arquivo Excel enviado com sucesso!');
      })
      .catch((err) => {
        logger.error({
          message: 'Erro ao gerar Excel modelo Digital Saúde:',
          error: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString()
        });
        console.error('Erro ao enviar o arquivo Excel:', err);
        res.status(500).send('Erro ao gerar o arquivo Excel');
      });
  });
});

app.get('/gerar-excel-interno/:id/:nomefantasia/:adm', verificaAutenticacao, (req, res) => {
  const idOperadora = req.params.id;
  const nomeFantasia = req.params.nomefantasia;
  const adm = req.params.adm;
  const sqlSelectPlanos = 'SELECT * FROM produtos WHERE id_operadora = ?';

  db.query(sqlSelectPlanos, [idOperadora], (err, result) => {
    if (err) {
      console.error('Erro ao buscar os produtos vinculados', err);
      return res.status(500).send('Erro ao gerar o arquivo Excel');
    }

    const produtos = result;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    produtos.forEach(function (produto) {
      worksheet.addRow(['Operadora', nomeFantasia])
      worksheet.addRow(['Valor Spread', produto.valorSpread])
      worksheet.addRow(['Nome Plano', produto.nomedoplano])
      worksheet.addRow(['ANS', produto.ans])
      worksheet.addRow(['Acomodação', produto.acomodacao])
      worksheet.addRow(['Fator Moderador', produto.cooparticipacao])
      worksheet.addRow([''])
      worksheet.addRow(['Faixa Etária', 'Valor NET', 'Valor Venda', 'Variação'])
      worksheet.addRow(['00 a 18 Anos', produto.fx1, produto.fx1comercial, 0])
      worksheet.addRow(['19 a 23 Anos', produto.fx2, produto.fx2comercial, produto.variacao1])
      worksheet.addRow(['24 a 28 anos', produto.fx3, produto.fx3comercial, produto.variacao2])
      worksheet.addRow(['29 a 33 anos	', produto.fx4, produto.fx4comercial, produto.variacao3])
      worksheet.addRow(['34 a 38 anos', produto.fx5, produto.fx5comercial, produto.variacao4])
      worksheet.addRow(['39 a 43 anos', produto.fx6, produto.fx6comercial, produto.variacao5])
      worksheet.addRow(['44 a 48 anos	', produto.fx7, produto.fx7comercial, produto.variacao6])
      worksheet.addRow(['49 a 53 anos', produto.fx8, produto.fx8comercial, produto.variacao7])
      worksheet.addRow(['54 a 58 anos', produto.fx9, produto.fx9comercial, produto.variacao8])
      worksheet.addRow(['59+', produto.fx10, produto.fx10comercial, produto.variacao9])
      worksheet.addRow([''])
      worksheet.addRow([''])
      worksheet.addRow([''])

    });

    // Configurar cabeçalhos para download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Tabela ${adm} Operadora_${nomeFantasia}.xlsx`);

    // Enviar o arquivo ao cliente
    workbook.xlsx.write(res)
      .then(() => {
        console.log('Arquivo Excel enviado com sucesso!');
      })
      .catch((err) => {
        logger.error({
          message: 'Erro ao gerar Excel modelo interno:',
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
        console.error('Erro ao enviar o arquivo Excel:', err);
        res.status(500).send('Erro ao gerar o arquivo Excel');
      });
  });
});

app.use((req, res, next) => {
  res.status(404).render('404');
});

app.listen(3050, () => {
  console.log('Aplicação rodando na porta 3050');
});
