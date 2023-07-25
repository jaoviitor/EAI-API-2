const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

router.post('/:id', (req, res, next) => {

    const situacao = 'Pago';
    mysql.getConnection((error, conn) =>{
        conn.query('UPDATE agendamento SET situacao = ? WHERE  id = ?',
        [situacao, req.params.id],
        (error, resultado, field) =>{
            conn.release();

            if(error){
                res.status(500).send({ error: error, response: null });
            }
            res.status(201).send({ mensagem: 'Agendamento enviado!', CodAgendamento: resultado.insertId })
        }
        )

    })
});

module.exports = router;