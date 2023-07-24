const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const rotaEmpresa = require('./routes/empresa');
const rotaFuncionario = require('./routes/funcionario');
const rotaAgendamento = require('./routes/agendamento');
const rotaCliente = require('./routes/cliente');
const rotaEndereco = require('./routes/endereco');
const rotaEmail = require('./routes/Email');
const rotaPlano = require('./routes/planos');

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false})); // apenas dados simples
app.use(bodyParser.json()); // json de entrada no body

app.use((req, res, next) =>{
    res.header('Access-Control-Allow-Origin', '*'); // só permite o acesso da API por esse servidor
    res.header('Access-Control-Allow-Header', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if(req.method === 'OPTIONS'){
        res.header('Acess-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).send({});
    }
    next();
})

app.use('/plano', rotaPlano);
app.use('/empresa', rotaEmpresa);
app.use('/funcionario', rotaFuncionario);
app.use('/agendamento', rotaAgendamento);
app.use('/cliente', rotaCliente);
app.use('/endereco', rotaEndereco);
app.use('/email', rotaEmail);

//TRATAMENTO PARA QUANDO NÃO FOR ENCONTRADO UMA ROTA
app.use((req, res, next) =>{
    const erro = new Error('Não encontrado');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) =>{
    res.status(error.status || 500);
    return res.send({
        erro: {
            mensagem: error.message
        }
    });
});

module.exports = app;