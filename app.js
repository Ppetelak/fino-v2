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
    console.log( username, password)
  
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
      res.redirect('/inicio')
    });
});

app.get('/', (req, res) => {
    res.render('login');
})

app.get('/inicio', (req, res) => {
    res.render('formulario');
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

app.post('/add-registro', (request, response) => {

    const dadosGETComerciaisJsonString = request.body.comerciais;
    const dadosGETOperadoraJsonString = request.body.operadora;
    const dadosGETPlanosJsonString = request.body.planos;
    const dadosGETEntidadesJsonString = request.body.entidades;
    const dadosGETVigenciasJsonString = request.body.vigencias;
    const dadosGETContatosJsonString = request.body.contatos;
    const dadosGETGeraisJsonString = request.body.gerais;
    const dadosGETProcedimentosJsonString = request.body.procedimentos
    try {
        const dadosGETPlanos = JSON.parse(dadosGETPlanosJsonString);
        dadosPlanos = dadosGETPlanos
    } catch (error) {
        logger.error('Foi mas deu Erro ao fazer o parsing do JSON: Planos', error);
    }
    try {
        const dadosGETEntidades = JSON.parse(dadosGETEntidadesJsonString);
        dadosEntidades = dadosGETEntidades
    } catch (error) {
        logger.error('Foi mas deu Erro ao fazer o parsing do JSON: Entidades', error);
    }
    try {
        const dadosGETVigencias = JSON.parse(dadosGETVigenciasJsonString)
        dadosVigencias = dadosGETVigencias
    } catch (error) {
        logger.error('Foi mas deu Erro ao fazer o parsing do JSON: Vigências', error);
    }
    try {
        const dadosGETContato = JSON.parse(dadosGETContatosJsonString)
        dadosContatos = dadosGETContato
    } catch (error) {
        logger.error('Foi mas deu Erro ao fazer o parsing do JSON: Contato', error);
    }
    try {
        const dadosGETOperadora = JSON.parse(dadosGETOperadoraJsonString)
        dadosOperadora = dadosGETOperadora
    } catch (error) {
        logger.error('Foi mas deu Erro ao fazer o parsing do JSON: Operadora', error)
    }
    try {
        const dadosGETGerais = JSON.parse(dadosGETGeraisJsonString)
        dadosGerais = dadosGETGerais
    } catch (error) {
        logger.error('Foi mas deu Erro ao fazer o parsing do JSON: Gerais', error)
    }
    try {
        const dadosGETComerciais = JSON.parse(dadosGETComerciaisJsonString)
        dadosComerciais = dadosGETComerciais
    } catch (error) {
        logger.error('Foi mas deu Erro ao fazer o parsing do JSON: Comerciais', error)
    }
    try {
        const dadosGETProcedimentos = JSON.parse(dadosGETProcedimentosJsonString)
        dadosProcedimentos = dadosGETProcedimentos
    } catch (error) {
        logger.error('Foi mas deu Erro ao fazer o parsing do JSON: Procedimentos', error)
    }
    return response.redirect('/renderizar')
})

app.get('/renderizar', (request, response) => {
    const filePath = path.join(__dirname, '/src/verificacao.ejs')
    ejs.renderFile(filePath, { dadosOperadora, dadosPlanos, dadosEntidades, dadosContatos, dadosVigencias, dadosGerais, dadosComerciais, dadosProcedimentos }, (err, data) => {
        if (err) {
            return response.send('Erro na leitura do arquivo')
        }
        return response.send(data)
    })
})

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

app.get('/operadoras', (req, res) => {
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

app.post('/cadastrar-operadora', (req, res) => {
  const { formData } = req.body;
  const { contatos } = req.body;

  const sqlOperadora = 'INSERT INTO operadora (razaosocial, cnpj, nomefantasia, codans, endereco, numeroendereco, complemento, cep, cidade, uf, website, telatendimento, telouvidoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const sqlContatos = 'INSERT INTO contatos (id_operadora, nome, email, telefone, cargo) VALUES (?, ?, ?, ?, ?)';

  db.query(sqlOperadora, [formData.razaosocial, formData.cnpj, formData.nomefantasia, formData.codans, formData.endereco, formData.numeroendereco, formData.complemento, formData.cep, formData.cidade, formData.uf, formData.website, formData.telatendimento, formData.telouvidoria], (error, result) => {
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

app.post('/dados-recebidos', (req, res) => {
  const { formData, contatos } = req.body;

  console.log(formData, contatos)
  // Renderize uma página ou retorne os dados como JSON, dependendo da sua preferência
  res.send('Dados recebidos com sucesso');
});

app.post('/editar-operadora/:id', async (req, res) => {
  const idOperadora = req.params.id;
  const formData = req.body.formData;
  const contatos = req.body.contatos;

  const sqlOperadoraUpdate =
    'UPDATE operadora SET razaosocial=?, cnpj=?, nomefantasia=?, codans=?, endereco=?, numeroendereco=?, complemento=?, cep=?, cidade=?, uf=?, website=?, telatendimento=?, telouvidoria=? WHERE id=?';

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

app.delete('/excluir-operadora/:id', (req, res) => {
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
                        res.cookie('alertSuccess', 'Operadora excluída com sucesso', {maxAge: 3000})
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

app.get('/entidades', (req,res) =>{
  db.query('SELECT * FROM entidades', (error, results) => {
    if(error) throw error;
    res.render('entidades', { entidades: results});
  })
})

app.post('/cadastrar-entidade', (req, res) => {
  const { nome, descricao, publico, documentos, taxa} = req.body;
  const sql = 'INSERT INTO entidades (nome, descricao, publico, documentos, taxa) VALUES (?, ?, ?, ?, ?)'
  db.query(sql, [nome, descricao, publico, documentos, taxa], (error, result) => {
      if(error) {
          console.error('Erro ao cadastrar entidade:', error);
          res.cookie('alertError', 'Erro ao cadastrar Entidade, verifique e tente novamente', { maxAge:3000});
          res.status(500).json({ message: 'Erro interno do servidor' });
      }
      res.cookie('alertSuccess', 'Entidade criada com Sucesso', { maxAge: 3000});
      res.status(200).json({ message: 'Nova entidade criada com sucesso' });
  })
});

app.post('/editar-entidade/:id', (req, res) => {
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

app.delete('/excluir-entidade/:id', (req, res) => {
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
            res.cookie('alertSuccess', 'Entidade excluída com sucesso', {maxAge: 3000})
            res.status(200).json({ message: 'Entidade excluída com sucesso' });
          }
        });
      }
    }
  });
});

app.get('/produtos', (req, res) => {
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

app.get('/produtos/:id', async (req, res) => {
  const idOperadora = req.params.id;

  const sql = 'SELECT * FROM produtos WHERE id_operadora = ?';

  try {
      const queryPromise = util.promisify(db.query).bind(db);
      const produtos = await queryPromise(sql, [idOperadora]);

      res.render('produto', { produtos: produtos });
  } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      res.status(500).send('Erro interno do servidor');
  }
});

app.get('/gerar', (req, res) =>{
    res.render('gerar-fino')
})

app.listen(3050, () => {
  console.log('Aplicação rodando na porta 3050');
});
