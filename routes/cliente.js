const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const login = require('../middleware/login');


// RETORNA TODOS OS CLIENTES
router.get('/', (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            'SELECT * FROM Cliente;',
            (error, resultado, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error }) };
                return res.status(200).send({response: resultado});
            }
        )
    })
});

// RETORNA UM CLIENTE ESPECIFICO
router.get('/:CodCliente', (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            'SELECT * FROM Cliente WHERE CodCliente = ?;',
            [req.params.CodCliente],
            (error, resultado, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error }) };
                return res.status(200).send({response: resultado});
            }
        )
    })
});

// CADASTRA UM CLIENTE NOVO
router.post('/cadastro', (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query('SELECT * FROM Cliente WHERE Email = ?', [req.body.Email], (error, results) =>{
            if(error) { return res.status(500).send({ error: error })}
            if(results.length > 0) {
                res.status(409).send({ mensagem: 'Cliente já cadastrado' })
            } else{
                bcrypt.hash(req.body.Senha, 10, (errBcrypt, hash) =>{
                    if (errBcrypt) { return res.status(500).send({ error: errBcrypt }) }
                    conn.query(`INSERT INTO Cliente (Nome, CPForCNPJ, Email, Telefone, Senha) VALUES (?,?,?,?,?)`,
                    [req.body.Nome, req.body.CPForCNPJ, req.body.Email, req.body.Telefone, hash],
                    (error, results) =>{
                        conn.release();
                        if (error) { return res.status(500).send({ error: error })}
                        res.status(201).send({
                            mensagem: 'Cliente cadastrado com sucesso!'
                        })
                    })
                })
            }
        })
    })
});

// LOGIN DO CLIENTE
router.post('/login', (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        const query = 'SELECT * FROM Cliente WHERE Email = ?';
        conn.query(query, [req.body.Email], (error, results, fields) => {
            conn.release();
            if (error) { return res.status(500).send({ error: error }) };
            if (results.length < 1) {
                return res.status(401).send({ mensagem: 'Falha na autenticação' });
            }
            bcrypt.compare(req.body.Senha, results[0].Senha, (err, result) => {
                if (err) {
                    return res.status(401).send({ mensagem: 'Falha na autenticação' });
                }
                if (result) {
                    const token = jwt.sign({
                        CodCliente: results[0].CodCliente,
                        Nome: results[0].Nome,
                        Email: results[0].Email
                    }, process.env.JWT_KEY,
                    {
                        expiresIn: "1h"
                    });
                    return res.status(200).send({ 
                        mensagem: 'Autenticado com sucesso',
                        token: token
                    });
                }
                return res.status(401).send({ mensagem: 'Falha na autenticação' });
            });
        });
    });
});


// ALTERA AS INFORMAÇÕES DE UM CLIENTE
router.patch('/:CodCliente', login, (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            'UPDATE Cliente SET Nome = ?, Email = ?, Telefone = ?, Senha = ? WHERE CodCliente = ?',
            [req.body.Nome, req.body.Email, req.body.Telefone, req.body.Senha, req.params.CodCliente],
            (error, resultado, fields) => {
                conn.release();
                if(error){ return res.status(500).send({ error: error }) };
                res.status(202).send({
                    mensagem: 'Cliente atualizado com sucesso!',
                });
            }
        )
    })
});

// DELETA UM CLIENTE
router.delete('/:CodCliente', (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(`DELETE FROM Cliente WHERE CodCliente = ?`,
                [req.body.CodCliente],
                (error, results) =>{
                    conn.release();
                    if (error) { return res.status(500).send({ error: error })}
                    res.status(202).send({
                        mensagem: 'Cliente removido com sucesso!'
                    })
                })
    })
});

module.exports = router;
