const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        cb(null, new Date().toISOString() + file.originalname);
    }
})
const upload = multer({ storage: storage });

//CADASTRA UM NOVO FUNCIONÁRIO DA EMPRESA NO BANCO
router.post('/cadastro', upload.single('imagem_funcionario'), (req, res, next) => {
    console.log(req.file);
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query('SELECT * FROM Funcionario WHERE Email = ?', [req.body.Email], (error, results) =>{
            if(error) { return res.status(500).send({ error: error })}
            if(results.length > 0) {
                res.status(409).send({ mensagem: 'Funcionário já cadastrado' })
            } else{
                conn.query('SELECT * FROM Funcionario WHERE Telefone = ?', [req.body.Telefone], (error, results) => {
                    if(error) { return res.status(500).send({ error: error })}
                    if(results.length > 0){
                        res.status(409).send({ mensagem: 'Telefone já cadastrado' })
                    } else{
                        bcrypt.hash(req.body.Senha, 10, (errBcrypt, hash) =>{
                            if (errBcrypt) { return res.status(500).send({ error: errBcrypt }) }
                            conn.query(`INSERT INTO Funcionario (Situacao, Nome, RG, CPF, Telefone, Sexo, Email, CodEmpresa, Senha) VALUES (?,?,?,?,?,?,?,?,?)`,
                            [req.body.Situacao,req.body.Nome, req.body.RG, req.body.CPF, req.body.Telefone, req.body.Sexo, req.body.Email, req.body.CodEmpresa, hash],
                            (error, results) =>{
                                conn.release();
                                if (error) { return res.status(500).send({ error: error })}
                                res.status(201).send({
                                    mensagem: 'Funcionário cadastrado com sucesso!'
                                })
                            })
                        })
                    }
                })
            }
        })
    })
});

//LOGIN DO FUNCIONÁRIO
router.post('/login', (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        if (error) { return res.status(500).send({ error: error }) }
        const query = `SELECT * FROM Funcionario WHERE Telefone = ?`;
        conn.query(query,[req.body.Telefone], (error, results, fields) =>{
            conn.release();
            if (error) { return res.status(500).send({ error: error }) }
            if (results.length < 1){ //conferindo se o telefone está no banco
                return res.status(401).send({ mensagem: 'Falha na autenticação' });
            }
            bcrypt.compare(req.body.Senha, results[0].Senha, (err, result) =>{ //comparando a senha com o hash
                if (err){
                    return res.status(401).send({ mensagem: 'Falha na autenticação' });
                }
                if (result){ //gerando o token
                    const token = jwt.sign({
                        CodFuncionario: results[0].CodFuncionario,
                        telefone: results[0].Telefone
                    }, 
                    process.env.JWT_KEY,
                    {
                        expiresIn: "1h" //tempo de expiração do token
                    })
                    return res.status(200).send({
                        mensagem: 'Autenticado com sucesso',
                        token: token
                    });
                }
                return res.status(401).send({ mensagem: 'Falha na autenticação' });
            })
        })
    })
});

//RETORNA OS FUNCIONÁRIO CADASTRADOS
router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            'SELECT * FROM Funcionario;',
            (error, resultado, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error }) };
                return res.status(200).send({response: resultado});
            }
        )
    })
    
});

//RETORNA OS DADOS DE UM FUNCIONÁRIO
router.get('/:CodFuncionario', (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            'SELECT * FROM Funcionario WHERE CodFuncionario = ?;',
            [req.params.CodFuncionario],
            (error, resultado, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error }) };
                return res.status(200).send({response: resultado});
            }
        )
    })
});

//RETORNA OS DADOS DOS FUNCIONÁRIOS DA MESMA EMPRESA
router.get('/codigo/:CodEmpresa', (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            'SELECT * FROM Funcionario WHERE CodEmpresa = ?;',
            [req.params.CodEmpresa],
            (error, resultado, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error }) };
                return res.status(200).send({response: resultado});
            }
        )
    })
});

module.exports = router;
