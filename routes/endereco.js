const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// RETORNA TODOS OS ENDEREÇOS
router.get('/', (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            'SELECT * FROM Endereco;',
            (error, resultado, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error }) };
                return res.status(200).send({response: resultado});
            }
        )
    })
});

// RETORNA UM ENDEREÇO ESPECIFICO
router.get('/:CodCliente', (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            'SELECT * FROM Endereco WHERE CodCliente = ?;',
            [req.params.CodCliente],
            (error, resultado, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error }) };
                return res.status(200).send({response: resultado});
            }
        )
    })
});

// ADICIONA ENDEREÇO
router.post('/:CodCliente', (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            'INSERT INTO Endereco (CEP, Logradouro, Numero, Bairro, Cidade, UF, Ponto_ref, CodCliente) VALUES (?,?,?,?,?,?,?,?)',
            [req.body.CEP, req.body.Logradouro, req.body.Numero, req.body.Bairro, req.body.Cidade, req.body.UF, req.body.Ponto_ref, req.params.CodCliente],
            (error, resultado, fields) => {
                conn.release();
                if(error){ return res.status(500).send({ error: error }) };
                res.status(202).send({
                    mensagem: 'Endereço adicionado com sucesso!',
                });
            }
        )
    })
});

// ALTERA UM ENDEREÇO
router.patch('/:CodCliente', (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            'UPDATE Endereco SET CEP = ?, Logradouro = ?, Numero = ?, Bairro = ?, Cidade = ?, UF = ?, Ponto_ref = ? WHERE CodCliente = ?',
            [req.body.CEP, req.body.Logradouro, req.body.Numero, req.body.Bairro, req.body.Cidade, req.body.UF, req.body.Ponto_ref, req.params.CodCliente],
            (error, resultado, fields) => {
                conn.release();
                if(error){ return res.status(500).send({ error: error }) };
                res.status(202).send({
                    mensagem: 'Endereço atualizado com sucesso!',
                });
            }
        )
    })
});

module.exports = router;