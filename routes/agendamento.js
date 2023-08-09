const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

//RETORNA OS AGENDAMENTOS CONFIRMADOS
router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            `SELECT * FROM agendamento JOIN endereco ON agendamento.endereco_id = endereco.id JOIN cliente ON endereco.cliente_id = cliente.id WHERE agendamento.situacao = 'Pago';`,
            (error, resultado, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error }) };
                return res.status(200).send({response: resultado});
            }
        )
    })
});

//ALTERA O STATUS DO AGENDAMENTO
router.post('/:id', (req, res, next) => {

    const situacao = 'Pago';
    mysql.getConnection((error, conn) =>{
        conn.query('UPDATE agendamento SET situacao = ?, valor = ?  WHERE  id = ?',
        [situacao, req.body.valor, req.params.id],
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