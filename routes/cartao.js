const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

//CADASTRA UM CARTÃO
router.post('/cadastro', (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(`INSERT INTO cartao (cliente_id, token, id_asaas) VALUES (?, ?, ?)`,
        [req.body.cliente_id, req.body.token, req.body.id_asaas],
        (error, results) =>{
            conn.release();
            if (error) { return res.status(500).send({ error: error })}
            res.status(201).send({ mensagem: 'Cartão enviado!', Id: results.insertId })
        })
    })
});