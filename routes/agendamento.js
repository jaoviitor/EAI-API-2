const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

//RETORNA OS AGENDAMENTOS CONFIRMADOS
router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            `SELECT 
                agendamento.*, 
                endereco.id AS endereco_id,
                cliente.id AS cliente_id,
                endereco.logradouro,
                endereco.numero,
                endereco.complemento,
                endereco.bairro,
                endereco.cep,
                endereco.municipio,
                endereco.uf,
                endereco.area,
                cliente.nome,
                cliente.cpf_cnpj,
                cliente.telefone
            FROM 
                agendamento 
            JOIN 
                endereco ON agendamento.endereco_id = endereco.id 
            JOIN 
                cliente ON endereco.cliente_id = cliente.id 
            WHERE 
                agendamento.situacao = 'Pago'
            AND 
                agendamento.CodFuncionario IS NULL;`,
            (error, resultado, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error }) };
                return res.status(200).send({response: resultado});
            }
        )
    })
});


//RETORNA OS AGENDAMENTOS EM ABERTO
router.get('/aberto/:id', (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            `SELECT 
            agendamento.*, 
            endereco.id AS endereco_id,
            cliente.id AS cliente_id,
            endereco.logradouro,
            endereco.numero,
            endereco.complemento,
            endereco.bairro,
            endereco.cep,
            endereco.municipio,
            endereco.uf,
            endereco.area,
            cliente.nome,
            cliente.cpf_cnpj,
            cliente.telefone
        FROM 
            agendamento 
        JOIN 
            endereco ON agendamento.endereco_id = endereco.id 
        JOIN 
            cliente ON endereco.cliente_id = cliente.id 
        WHERE 
            agendamento.situacao = 'Em aberto'
        AND 
            agendamento.CodFuncionario IS NOT NULL
        AND 
            agendamento.CodEmpresa = ?;
        `,
        [req.params.id],
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

// ATRIBUIR UM FUNCIONÁRIO EM UM AGENDAMENTO
router.put('/atribuir/:CodAgendamento', (req, res, next) => {
    const CodAgendamento = req.params.CodAgendamento;
    const CodFuncionario = req.body.CodFuncionario;
    const CodEmpresa = req.body.CodEmpresa;
    const situacao = 'Em aberto';
    
    mysql.getConnection((error, conn) => {
      if (error) {
        return res.status(500).send({ error: error });
      };
      
      conn.query(
        'UPDATE agendamento SET CodFuncionario = ?, CodEmpresa = ?, situacao = ? WHERE id = ?',
        [CodFuncionario, CodEmpresa, situacao, CodAgendamento],
        (error, resultado, fields) => {
          conn.release();
          if (error) {
            return res.status(500).send({ error: error });
          };
          
          return res.status(200).send({ response: resultado });
        }
      )
    })
  });

module.exports = router;