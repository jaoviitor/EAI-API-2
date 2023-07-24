const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

router.post('/', (req, res, next) => {

    mysql.getConnection((error, conn) =>{
        conn.query('INSERT INTO planos (endereco_id, data, hora, confirmacao, situacao, quantidade_meses, frequencia) VALUES (?,?,?,?,?,?,?)',
        [req.body.endereco_id, req.body.data, req.body.hora, req.body.confirmacao, req.body.situacao, req.body.quantidade_meses, req.body.frequencia],
        (error, resultado, field) =>{
            conn.release();

            if(error){
                res.status(500).send({ error: error, response: null });
            }
            res.status(201).send({ mensagem: 'Plano enviado!', Id: resultado.insertId })
        }
        )

    })
});