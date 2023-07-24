const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

//RETORNA OS AGENDAMENTOS
router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            'SELECT * FROM Agendamento WHERE CodFuncionario IS NULL;',
            (error, resultado, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error }) };
                return res.status(200).send({response: resultado});
            }
        )
    })
});

// RETORNA OS AGENDAMENTOS DE UM FUNCIONÁRIO
router.get('/:CodFuncionario', (req, res, next) => {
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            'SELECT * FROM Agendamento WHERE CodFuncionario = ?;',
            [req.params.CodFuncionario],
            (error, resultado, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error }) };
                return res.status(200).send({response: resultado});
            }
        )
    })
});

//INSERE UM NOVO AGENDAMENTO
router.post('/', (req, res, next) => {

    mysql.getConnection((error, conn) =>{
        conn.query('INSERT INTO Agendamento (LocalServico, DataServico, HoraServico, MedidasLocal, Valor, InfoAdicionais, Nome, CPF, FormasPagamento, CEP, Logradouro, Numero, Bairro, PontoDeRef) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [req.body.LocalServico, req.body.DataServico, req.body.HoraServico, req.body.MedidasLocal, req.body.Valor, req.body.InfoAdicionais, req.body.Nome, req.body.CPF, req.body.FormasPagamento, req.body.CEP, req.body.Logradouro, req.body.Numero, req.body.Bairro, req.body.PontoDeRef],
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

//RETORNA OS DADOS DE UM AGENDAMENTO
router.get('/:CodAgendamento', (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        if(error){ return res.status(500).send({ error: error }) };
        conn.query(
            'SELECT * FROM Agendamento WHERE CodAgendamento = ?;',
            [req.params.CodAgendamento],
            (error, resultado, fields) =>{
                conn.release();
                if(error){ return res.status(500).send({ error: error }) };
                return res.status(200).send({response: resultado});
            }
        )
    })
});

// ATRIBUIR UM FUNCIONÁRIO EM UM AGENDAMENTO
router.put('/atribuir/:CodAgendamento', (req, res, next) => {
    const CodAgendamento = req.params.CodAgendamento;
    const CodFuncionario = req.body.CodFuncionario;
    
    mysql.getConnection((error, conn) => {
      if (error) {
        return res.status(500).send({ error: error });
      };
      
      conn.query(
        'UPDATE Agendamento SET CodFuncionario = ? WHERE CodAgendamento = ?',
        [CodFuncionario, CodAgendamento],
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


//EXCLUI UM AGENDAMENTO
router.delete('/', (req, res, next) => {
    res.status(201).send({
        mensagem: 'Pedido excluído'
    });
});

module.exports = router;