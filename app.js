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

/* CONFIGURAÇÕES DOS PACOTES */

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.json())
app.use('/css', express.static('css'))
app.use('/js', express.static('js'))
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
  host: 'localhost',
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
    next();
  } else {
    res.redirect('/');
  }
};

/* REGISTRO de erros da aplicação */
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(), // Adiciona um timestamp com a hora atual
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log.json' })
  ]
});

app.post('/login-verifica', (req, res) => {
  const { username, password } = req.body;
  console.log(username, password)

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Erro ao consultar o banco de dados:', err);
      return res.status(500).json({ error: 'Erro ao processar a solicitação' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const user = results[0];

    if (user.senha !== password) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    // Autenticação bem-sucedida, enviar uma resposta de sucesso
    req.session.usuario = user;
    //res.status(200).json({ message: 'Autenticação bem-sucedida' });
    res.redirect('/operadoras')
  });
});

app.get('/', (req, res) => {
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


app.get('/criarpdf', async (request, response) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  /* var dominio = window.location.host;
  var protocolo = window.location.protocol; */
  var link = 'http://localhost:3050/renderizar';

  await page.goto(link, {
    waitUntil: "networkidle0"
  })

  // Extrair o conteúdo da tag <main>
  const mainContent = await page.evaluate(() => {
    const mainElement = document.querySelector('main');
    return mainElement.innerHTML;
  });

  // Extrair o link CSS
  const cssLink = await page.evaluate(() => {
    const cssElement = document.querySelector('link[rel="stylesheet"]');
    return cssElement.href;
  });

  // Carregar o arquivo CSS na página do Puppeteer
  await page.goto(cssLink, {
    waitUntil: "networkidle0"
  });

  // Inserir o conteúdo da tag <main> na página
  await page.setContent(`<html><head><link rel="stylesheet" href="${cssLink}"></head><body>${mainContent}</body></html>`);

  const pdf = await page.pdf({
    printBackground: true,
    format: "A4",
    margin: {
      top: "20px",
      bottom: "20px",
      left: "20px",
      right: "20px"
    }
  })

  await browser.close()
  response.contentType("application/pdf")
  return response.send(pdf)
})

app.get('/operadoras', verificaAutenticacao, (req, res) => {
  let operadoras, contatos;

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
      res.render('operadoras', { operadoras: operadoras, contatos: contatos });
    })
    .catch((error) => {
      console.error('Erro ao buscar dados:', error);
      res.status(500).send('Erro interno do servidor');
    });
});



app.post('/cadastrar-operadora', verificaAutenticacao, (req, res) => {
  const { formData } = req.body;
  const { contatos } = req.body;

  const sqlOperadora = 'INSERT INTO operadora (razaosocial, cnpj, nomefantasia, codans, endereco, numeroendereco, complemento, cep, cidade, uf, website, telatendimento, telouvidoria, emailouvidoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const sqlContatos = 'INSERT INTO contatos (id_operadora, nome, email, telefone, cargo) VALUES (?, ?, ?, ?, ?)';

  db.query(sqlOperadora, [formData.razaosocial, formData.cnpj, formData.nomefantasia, formData.codans, formData.endereco, formData.numeroendereco, formData.complemento, formData.cep, formData.cidade, formData.uf, formData.website, formData.telatendimento, formData.telouvidoria, formData.emailouvidoria], (error, result) => {
    if (error) {
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

app.post('/dados-recebidos', verificaAutenticacao, (req, res) => {
  const { formData, contatos } = req.body;

  console.log(formData, contatos)
  // Renderize uma página ou retorne os dados como JSON, dependendo da sua preferência
  res.send('Dados recebidos com sucesso');
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
    res.render('entidades', { entidades: results });
  })
})

app.post('/cadastrar-entidade', verificaAutenticacao, (req, res) => {
  const { nome, descricao, publico, documentos, taxa } = req.body;
  const sql = 'INSERT INTO entidades (nome, descricao, publico, documentos, taxa) VALUES (?, ?, ?, ?, ?)'
  db.query(sql, [nome, descricao, publico, documentos, taxa], (error, result) => {
    if (error) {
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
      res.render('produtos', { operadoras: operadoras });
    })
    .catch((error) => {
      console.error('Erro ao buscar dados:', error);
      res.status(500).send('Erro interno do servidor');
    })
})

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
      res.render('procedimentos', { operadoras: operadoras });
    })
    .catch((error) => {
      console.error('Erro ao buscar dados:', error);
      res.status(500).send('Erro interno do servidor');
    })
})

app.post('/cadastrar-procedimento', (req, res) => {
  const { procedimentoData } = req.body;

  const sqlProcedimento = 'INSERT INTO procedimentos (id_produto, descricao, valorcop, limitecop, franquiacop, limitecarenciadias, tipofranquia) VALUES (?, ?, ?, ?, ?, ?, ?)'
  db.query(sqlProcedimento, [procedimentoData.idOperadora, procedimentoData.descricao, procedimentoData.copay, procedimentoData.limitecopay, procedimentoData.franquiacopay, procedimentoData.limitecarencia,  procedimentoData.tipofranquia], (error, result) => {
    if(error) {
      console.error("Erro ao cadastrar procedimento:", error)
      res.cookie('alertError', 'Erro ao cadastrar Procedimento', {maxAge: 3000});
      res.status(500).json({ message: 'Erro ao cadastrar Procedimento'});
    }
    res.cookie('alertSuccess', 'Procedimento Cadastrado com sucesso', { maxAge: 3000 });
    res.status(200).json({ message: 'Novo Procedimento criado com sucesso' });
  })
})

app.post('/editar-procedimento/:id', (req, res) => {
  const procedimento = req.body.procedimentos
  const idProcedimento = req.params.id

  console.log(procedimento)

  const sqlProcedimentoUpdate = 'UPDATE procedimentos SET descricao=?, valorcop=?, limitecop=?, franquiacop=?, limitecarenciadias=?, tipofranquia=? WHERE id=?'

  db.query(sqlProcedimentoUpdate, [procedimento.descricao, procedimento.copay, procedimento.limitecop, procedimento.franquiacopay, procedimento.limitecarencia, procedimento.tipofranquia, idProcedimento], (err, result) => {
    if(err){
      console.error("Erro ao editar procedimento:", err)
      res.cookie('alertError', 'Erro ao editar Procedimento', {maxAge: 3000});
      res.status(500).json({ message: 'Erro ao editar Procedimento'});
    }
    res.cookie('alertSuccess', 'Procedimento editado com sucesso', { maxAge: 3000 });
    res.status(200).json({ message: 'Procedimento editado com sucesso' });
  })
})

app.get('/procedimentos/:id', async (req, res) => {
  const idOperadora = req.params.id;

  try {
    const operadoraPromise = util.promisify(db.query).bind(db);
    const produtosPromise = util.promisify(db.query).bind(db);

    const operadora = await operadoraPromise('SELECT * FROM operadora WHERE id = ?', [idOperadora]);
    const procedimentos = await produtosPromise('SELECT * FROM procedimentos WHERE id_produto = ?', [idOperadora]);

    res.render('procedimento', { operadora: operadora[0], procedimentos: procedimentos });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.post('/cadastrar-produto', verificaAutenticacao, (req, res) => {
  const { formData } = req.body;
  const { procedimentos } = req.body;

  const sqlProduto = 'INSERT INTO produtos (nomedoplano, ans, contratacao, cobertura, abrangencia, cooparticipacao, acomodacao, areadeabrangencia, condicoesconjuges, condicoesfilhos, condicoesnetos, condicoespais, condicoesoutros, documentosconjuges, documentosfilhos, documentosnetos, documentospais, documentosoutros, fx1, fx2, fx3, fx4, fx5, fx6, fx7, fx8, fx9, fx10, fx1comercial, fx2comercial, fx3comercial, fx4comercial, fx5comercial, fx6comercial, fx7comercial, fx8comercial, fx9comercial, fx10comercial, observacoes, valorSpread, id_operadora) VALUES (?, ?, ?, ? , ?,?, ?, ?, ? , ?,?, ?, ?, ? , ?,?, ?, ?, ? , ?,?, ?, ?, ? , ?,?, ?, ?, ? , ?, ?, ?, ?, ? , ?,?, ?, ?, ? , ?, ?)';
  const sqlProcedimento = 'INSERT INTO procedimentos (id_produto, descricao, valorcop, limitecop, franquiacop, limitecarenciadias, condicoesreducaocarencia, condicoescongeneres, tipofranquia) VALUES (?,?,?,?,?,?,?,?,?)';

  db.query(sqlProduto, [formData.nomedoplano, formData.ansplano, formData.contratoplano, formData.coberturaplano, formData.abrangenciaplano, formData.cooparticipacao, formData.acomodacao, formData.areaabrangencia, formData.condicoesconjuges, formData.condicoesfilhos, formData.condicoesnetos, formData.condicoespais, formData.condicoesoutros, formData.documentosconjuges, formData.documentosfilhos, formData.documentosnetos, formData.documentospais, formData.documentosoutros, formData.fx1, formData.fx2, formData.fx3, formData.fx4, formData.fx5, formData.fx6, formData.fx7, formData.fx8, formData.fx9, formData.fx10, formData.fxComercial1, formData.fxComercial2, formData.fxComercial3, formData.fxComercial4, formData.fxComercial5, formData.fxComercial6, formData.fxComercial7, formData.fxComercial8, formData.fxComercial9, formData.fxComercial10, formData.planoobs, formData.valorSpread, formData.idOperadora], (error, result) => {
    if (error) {
      console.error('Erro ao cadastrar produto:', error);
      res.cookie('alertError', 'Erro ao cadastrar Produto, verifique e tente novamente', { maxAge: 3000 });
      res.status(500).json({ message: 'Erro interno do servidor' });
    }

    const idProduto = result.insertId;

    if (Array.isArray(procedimentos)) {
      procedimentos.forEach((procedimento) => {
        db.query(sqlProcedimento, [idProduto, procedimento.descricao, procedimento.copay, procedimento.limitecopay, procedimento.franquiacopay, procedimento.limitecarencia, procedimento.reducaocarencia, procedimento.congenere, procedimento.tipofranquia], (error, result) => {
          if (error) {
            console.error('Erro ao cadastrar procedimento', error);
          }
        });
      });
    }

    res.cookie('alertSuccess', 'Produto Cadastrado com sucesso', { maxAge: 3000 });
    res.status(200).json({ message: 'Novo Produto criado com sucesso' });
  });
});

app.get('/produtos/:id', verificaAutenticacao, async (req, res) => {
  const idOperadora = req.params.id;

  try {
    const operadoraPromise = util.promisify(db.query).bind(db);
    const produtosPromise = util.promisify(db.query).bind(db);
    const procedimentosPromise = util.promisify(db.query).bind(db);

    const operadora = await operadoraPromise('SELECT * FROM operadora WHERE id = ?', [idOperadora]);
    const produtos = await produtosPromise('SELECT * FROM produtos WHERE id_operadora = ?', [idOperadora]);
    const procedimentos = await procedimentosPromise('SELECT * FROM procedimentos');

    res.render('produto', { operadora: operadora[0], produtos: produtos, procedimentos: procedimentos });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.post('/editar-produto/:id', verificaAutenticacao, async (req, res) => {
  const idProduto = req.params.id;
  const formData = req.body.formData;
  const procedimentos = req.body.procedimentos;

  const sqlProdutoUpdate =
    'UPDATE produtos SET nomedoplano=?, ans=?, contratacao=?, cobertura=?, abrangencia=?, cooparticipacao=?, acomodacao=?, areadeabrangencia=?, condicoesconjuges=?, condicoesfilhos=?, condicoesnetos=?, condicoespais=?, condicoesoutros=?, documentosconjuges=?, documentosfilhos=?, documentosnetos=?, documentospais=?, documentosoutros=?, fx1=?, fx2=?, fx3=?, fx4=?, fx5=?, fx6=?, fx7=?, fx8=?, fx9=?, fx10=?, fx1comercial=?, fx2comercial=?, fx3comercial=?, fx4comercial=?, fx5comercial=?, fx6comercial=?, fx7comercial=?, fx8comercial=?, fx9comercial=?, fx10comercial=?, observacoes=? WHERE id=? AND id_operadora=?';

  const sqlProcedimentoInsert =
    `INSERT INTO procedimentos (id_produto, descricao, valorcop, limitecop, franquiacop, limitecarenciadias, condicoesreducaocarencia, condicoescongeneres, tipofranquia) VALUES (?,?,?,?,?,?,?,?,?)`;

  const sqlProcedimentoDelete =
    'DELETE FROM procedimentos WHERE id_produto=?';

  const queryPromise = util.promisify(db.query).bind(db);

  try {
    // Excluir todos os procedimentos vinculados a esse produto
    await queryPromise(sqlProcedimentoDelete, [idProduto]);

    // Atualizar os dados do produto no banco de dados
    await queryPromise(
      sqlProdutoUpdate,
      [
        formData.nomedoplano, formData.ansplano, formData.contratoplano, formData.coberturaplano, formData.abrangenciaplano, formData.cooparticipacao, formData.acomodacao, formData.areaabrangencia, formData.condicoesconjuges, formData.condicoesfilhos, formData.condicoesnetos, formData.condicoespais, formData.condicoesoutros, formData.documentosconjuges, formData.documentosfilhos, formData.documentosnetos, formData.documentospais, formData.documentosoutros, formData.fx1, formData.fx2, formData.fx3, formData.fx4, formData.fx5, formData.fx6, formData.fx7, formData.fx8, formData.fx9, formData.fx10, formData.fxComercial1, formData.fxComercial2, formData.fxComercial3, formData.fxComercial4, formData.fxComercial5, formData.fxComercial6, formData.fxComercial7, formData.fxComercial8, formData.fxComercial9, formData.fxComercial10, formData.planoobs, idProduto, formData.idOperadora
      ]
    );

    // Verificar se existem contatos para adicionar
    if (Array.isArray(procedimentos)) {
      for (const procedimento of procedimentos) {
        await queryPromise(
          sqlProcedimentoInsert,
          [
            idProduto, procedimento.descricao, procedimento.copay, procedimento.limitecopay, procedimento.franquiacopay, procedimento.limitecarencia, procedimento.reducaocarencia, procedimento.congenere, procedimento.tipofranquia
          ]
        );
      }
    }

    res.cookie('alertSuccess', 'Produto atualizado com sucesso', { maxAge: 3000 });
    res.status(200).json({ message: 'Produto atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar Produto:', error);
    res.cookie('alertError', 'Erro ao atualizar Produto, verifique e tente novamente', { maxAge: 3000 });
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.delete('/excluir-produto/:id', verificaAutenticacao, (req, res) => {
  const idProduto = req.params.id;

  // Verifique se o produto está associado a procedimentos
  const sqlProcedimentos = 'SELECT * FROM procedimentos WHERE id_produto = ?';
  db.query(sqlProcedimentos, [idProduto], (errorProcedimentos, resultProcedimentos) => {
    if (errorProcedimentos) {
      console.error('Erro ao verificar procedimentos associados ao produto:', errorProcedimentos);
      res.status(500).json({ message: 'Erro interno do servidor' });
    } else if (resultProcedimentos.length > 0) {
      // Se o produto estiver associado a procedimentos, exclua-os primeiro
      const sqlExcluirProcedimentos = 'DELETE FROM procedimentos WHERE id_produto = ?';
      db.query(sqlExcluirProcedimentos, [idProduto], (errorExcluirProcedimentos, resultExcluirProcedimentos) => {
        if (errorExcluirProcedimentos) {
          console.error('Erro ao excluir procedimentos do produto:', errorExcluirProcedimentos);
          res.status(500).json({ message: 'Erro interno do servidor' });
        } else {
          // Se os procedimentos forem excluídos com sucesso, exclua o produto
          const sqlExcluirProduto = 'DELETE FROM produtos WHERE id = ?';
          db.query(sqlExcluirProduto, [idProduto], (errorExcluirProduto, resultExcluirProduto) => {
            if (errorExcluirProduto) {
              console.error('Erro ao excluir o produto:', errorExcluirProduto);
              res.status(500).json({ message: 'Erro interno do servidor' });
            } else {
              res.cookie('alertSuccess', 'Produto excluído com sucesso', { maxAge: 3000 })
              res.status(200).json({ message: 'Produto excluído com sucesso' });
            }
          });
        }
      });
    } else {
      // Se o produto não estiver associado a procedimentos, exclua-o diretamente
      const sqlExcluirProduto = 'DELETE FROM produtos WHERE id = ?';
      db.query(sqlExcluirProduto, [idProduto], (errorExcluirProduto, resultExcluirProduto) => {
        if (errorExcluirProduto) {
          console.error('Erro ao excluir o produto:', errorExcluirProduto);
          res.status(500).json({ message: 'Erro interno do servidor' });
        } else {
          res.cookie('alertSuccess', 'Produto excluído com sucesso', { maxAge: 3000 })
          res.status(200).json({ message: 'Produto excluído com sucesso' });
        }
      });
    }
  });
});

app.get('/finos', verificaAutenticacao, (req, res) => {
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
            res.render('finos', { finos: finos, operadoras: operadoras, vigencias: vigencias, entidades: entidades, entidadesform: entidades_formularios })
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
  const sqlProcedimentos = 'SELECT * FROM procedimentos WHERE id_produto=?';

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

    res.render('finoIndividual',
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

app.get('/finojson/:id', async (req, res) => {
  const idFino = req.params.id;

  const sqlFino = 'SELECT * FROM formularios WHERE id=?';
  const sqlVigencias = 'SELECT * FROM vigencias WHERE id_fino=?';
  const sqlOperadora = 'SELECT * FROM operadora WHERE id=?';
  const sqlProdutos = 'SELECT * FROM produtos WHERE id_operadora=?';
  const sqlContatos = 'SELECT * FROM contatos WHERE id_operadora=?';
  const sqlEntidades = 'SELECT e.* FROM entidades e INNER JOIN formularios_entidades fe ON e.id = fe.entidade_id WHERE fe.formulario_id=?';
  const sqlProcedimentos = 'SELECT * FROM procedimentos WHERE id_produto=?';
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

app.post('/editar-fino/:id', async (req, res) => {
  const idFino = req.params.id;
  const formData = req.body.formData;
  const entidades = req.body.entidades;
  const vigencias = req.body.vigencias;

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

    res.cookie('alertSuccess', 'Fino atualizado com sucesso', { maxAge: 3000 });
    res.status(200).json({ message: 'Fino atualizado com sucesso' });
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

app.get('/gerar', (req, res) => {
  res.render('gerar-fino')
})

app.listen(3050, () => {
  console.log('Aplicação rodando na porta 3050');
});
