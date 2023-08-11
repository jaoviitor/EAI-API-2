const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const login = require('../middleware/login');
const gerarToken = require('../functions/keyGenerator');
const nodemailer = require('nodemailer');
const { token } = require('morgan');
const path = require('path');

//RETORNA AS EMPRESAS CADASTRADAS
router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            'SELECT * FROM Empresa;',
            (error, resultado, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error }) };
                return res.status(200).send({response: resultado});
            }
        )
    })
    
});

//CADASTRA UMA NOVA EMPRESA NO BANCO
router.post('/cadastro', (req, res, next) => {
    const tamanhoToken = 6;
    const token = gerarToken(tamanhoToken);
    const linkAtivacao = `https://eai-api-complementar.onrender.com/empresa/ativacao/${token}`
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query('SELECT * FROM Empresa WHERE Email = ?', [req.body.Email], (error, results) =>{
            if(error) { return res.status(500).send({ error: error })}
            if(results.length > 0) {
                res.status(409).send({ mensagem: 'Empresa já cadastrada' })
            } else{
                bcrypt.hash(req.body.Senha, 10, (errBcrypt, hash) =>{
                    if (errBcrypt) { return res.status(500).send({ error: errBcrypt }) }
                    conn.query(`INSERT INTO Empresa (Situacao, CNPJ, Nome_empresarial, Nome_fantasia, Porte, CEP, Logradouro, Numero, Complemento, Bairro, Municipio, UF, Telefone, Email, Senha, tokenVerificacao) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                    [req.body.Situacao, req.body.CNPJ, req.body.Nome_empresarial, req.body.Nome_fantasia, req.body.Porte, req.body.CEP, req.body.Logradouro, req.body.Numero, req.body.Complemento, req.body.Bairro, req.body.Municipio, req.body.UF, req.body.Telefone, req.body.Email, hash, token],
                    (error, results) =>{
                        conn.release();
                        if (error) { return res.status(500).send({ error: error })}
                        const transporter = nodemailer.createTransport({
                            host: process.env.HOST_MAIL,
                            port: process.env.HOST_PORT,
                            auth: {
                                user: process.env.HOST_USER,
                                pass: process.env.HOST_PASS
                            }
                        });
                        const sender = {
                            name: 'Contato',
                            email: 'sender.eai@outlook.com'
                        }
                        const receiver = {
                            email: `${req.body.Email}`
                        }
                        const mailContent = {
                            subject: 'Verifique sua conta',
                            text: `Valide sua conta acessando o link: ${linkAtivacao}`,
                            html: `<!DOCTYPE html>
                            <html lang="pt-br">
                            
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Document</title>
                                <style>
                                    @import url('https://fonts.googleapis.com/css2?family=Baloo+2&display=swap');
                            
                                    body {
                                        margin: 0;
                                        padding: 0;
                                        font-family: Arial, sans-serif;
                                        background-color: #f5f5f5;
                                    }
                            
                                    .container {
                                        max-width: 600px;
                                        margin: 0 auto;
                                        background-color: #ffffff;
                                        border-radius: 5px;
                                        padding: 20px;
                                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                    }
                            
                                    .header {
                                        text-align: center;
                                        padding: 20px 0;
                                        background-color: #F34E15;
                                        color: #ffffff;
                                        border-radius: 5px 5px 0 0;
                                    }
                            
                                    .logo {
                                        display: block;
                                        margin: 0 auto;
                                        max-width: 200px;
                                    }
                            
                                    .welcome-message {
                                        font-family: 'Baloo 2', cursive;
                                        text-align: center;
                                        padding: 20px 0;
                                    }
                            
                                    .validation-text {
                                        text-align: center;
                                        padding: 20px 0;
                                        background-color: #f2f2f2;
                                    }
                            
                                    .validate-button-container {
                                        text-align: center;
                                        padding-top: 20px;
                                    }
                            
                                    .validate-button {
                                        display: inline-block;
                                        background-color: #F34E15;
                                        color: #ffffff;
                                        padding: 10px 20px;
                                        text-decoration: none;
                                        border-radius: 5px;
                                    }
                            
                                    #validateLink {
                                        cursor: pointer;
                                    }
                            
                                    .button {
                                        --bg: #000;
                                        --hover-bg: #F34E15;
                                        --hover-text: #000;
                                        color: #fff;
                                        border: 1px solid var(--bg);
                                        border-radius: 4px;
                                        padding: 0.8em 2em;
                                        background: var(--bg);
                                        transition: 0.2s;
                                    }
                                </style>
                            </head>
                            
                            <body>
                                <div class="container">
                                    <!-- Área de Bem-Vindo -->
                                    <div class="header">
                                        <img class="logo"
                                            src="https://cdn.discordapp.com/attachments/1030689922681688175/1137001336328683520/image.png"
                                            alt="Logo da Minha Empresa">
                                    </div>
                                    <div class="welcome-message">
                                        <h1>Bem-vindo ao e.Aí Conecta</h1>
                                    </div>
                            
                                    <!-- Área de Validação da Conta -->
                                    <div class="validation-text">
                                        <p>Para validar a sua conta, clique no botão abaixo:</p>
                                    </div>
                                    <div class="validate-button-container">
                                        <button class="button" id="validateLink">
                                            Valide
                                            Agora
                                        </button>
                                    </div>
                                </div>
                                <script>
                                    document.getElementById('validateLink').addEventListener('click', function (event) {
                                        event.preventDefault();
                                        fetch(https: //eaiconecta.onrender.com/empresa/ativacao/${token}, {
                                            method: 'GET'
                                        })
                                    .then(response => {
                                        // Aqui você pode lidar com a resposta, se necessário
                                        console.log('Requisição GET bem-sucedida:', response);
                                    })
                                    .catch(error => {
                                        // Lidar com erros, se houver
                                        console.error('Erro na requisição GET:', error);
                                    });
                                    });
                                </script>
                            </body>
                            
                            </html>`
                        }
                        async function sendMail(transporter, sender, receiver, mailContent){
                            const mail = await transporter.sendMail({
                                from: `"${sender.name}" ${sender.email}`,
                                to: `${receiver.email}`,
                                subject: `${mailContent.subject}`,
                                text: `${mailContent.text}`,
                                html: `${mailContent.html}`
                            });
                            console.log('Email enviado: ', mail.messageId);
                            console.log('URL do Ethereal: ', nodemailer.getTestMessageUrl(mail));
                        }
                        async function mail(){
                            try{
                                await sendMail(transporter, sender, receiver, mailContent);
                                res.status(201).send({
                                    mensagem: 'Operação realizada com sucesso!'
                                })
                            } catch(error){
                                return res.status(500).send({ error: error })
                            }
                        }
                        mail();
                    })
                })
            }
        })
    })
});



router.post('/login', (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        if (error) { return res.status(500).send({ error: error }) }
        const query = `SELECT * FROM Empresa WHERE Email = ?`;
        conn.query(query,[req.body.Email], (error, results, fields) =>{
            conn.release();
            if (error) { return res.status(500).send({ error: error }) }
            if (results.length < 1){ //conferindo se o email está no banco
                return res.status(401).send({ mensagem: 'Falha na autenticação' });
            }
            bcrypt.compare(req.body.Senha, results[0].Senha, (err, result) =>{ //comparando a senha com o hash
                if (err){
                    return res.status(401).send({ mensagem: 'Falha na autenticação' });
                }
                //adicionar select nome da empresa
                if (result){ //gerando o token
                    const token = jwt.sign({
                        CodEmpresa: results[0].CodEmpresa,
                        email: results[0].Email
                    }, 
                    process.env.JWT_KEY,
                    {
                        expiresIn: "1h"
                    })
                    return res.status(200).send({
                        mensagem: 'Autenticado com sucesso',
						CodEmpresa: results[0].CodEmpresa,
						Nome_fantasia: results[0].Nome_fantasia,
                        verificacaoContrato: results[0].verificacaoContrato,
                        Verificacao: results[0].Verificacao,
                        token: token
                    });
                }
                return res.status(401).send({ mensagem: 'Falha na autenticação' });
            })
        })
    })
})

router.get('/ativacao/:token', (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            'SELECT * FROM Empresa WHERE tokenVerificacao = ?;',
            [req.params.token],
            (error, resultado, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error }) };
                if (resultado.length < 1){ //conferindo se o email está no banco
                    return res.status(401).send({ mensagem: 'Falha na autenticação' });
                }
                conn.query(
                    'UPDATE Empresa SET verificacao = 1 WHERE tokenVerificacao = ?',
                    [req.params.token],
                    (error, result) =>{
                        conn.release();
                        if(error){ return res.status(500).send({ error: error }) };
                    })
                const filePath = path.join(__dirname, '../views/sucesso_ativacao.html');
                return res.sendFile(filePath);
            }
        )
    })
});

//criar variácel com o id da empresa logada para fazer o get, pode pegar do token

//RETORNA OS DADOS DE UMA EMPRESA 
router.get('/:CodEmpresa', (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            'SELECT * FROM Empresa WHERE CodEmpresa = ?;',
            [req.params.CodEmpresa],
            (error, resultado, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error }) };
                return res.status(200).send({response: resultado});
            }
        )
    })
});
//ALTERA
router.patch('/', (req, res, next) => {
    res.status(201).send({
        mensagem: 'Usando o PATCH'
    });
});
//EXCLUI
router.delete('/', (req, res, next) => {
    res.status(201).send({
        mensagem: 'Usando o DELETE'
    });
});

module.exports = router;
