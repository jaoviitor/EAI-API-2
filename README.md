<h1 align="center">API EAI</h1>
<p align="center"><i>Repositório para versionamento e desenvolvimento do projeto de API para apps da eAí</i></p>

<p align="center">
  <img src="https://cdn.discordapp.com/attachments/1030689922681688175/1143231958650998834/florid-repository-graph.gif" />
</p>

##  Sobre o projeto

Este projeto é uma API Restful que integra 3 aplicações, fazendo cadastros, realizando autenticações e alterando status de usuários.

Essa API foi desenvolvida com o propósito de oferecer uma plataforma completa e eficiente para realizar toda a jornada de diversos tipos de usuário, desde a criação de uma conta, até a finalização de um agendamento, execução e feedback. Ela é composta por um conjunto de endpoints que foram criados internamente, bem como por integrações com APIs externas. Essa combinação de funcionalidades permite que nossa aplicação ofereça uma experiência completa para os nossos usuários.



### Tecnologias
<p display="inline-block">
  <img width="48" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="node-logo"/>
  <img width="48" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-plain.svg" alt="js-logo"/>
</p>
                                                                                                  
### Ferramentas de desenvolvimento

<p display="inline-block">
  <img width="48" src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/2048px-Visual_Studio_Code_1.35_icon.svg.png" alt="vscode-logo"/>
</p>

## Running
```node server.js```

## Endpoints Internos
**Retorna os agendamentos confirmados**
```GET /api/v1/agendamento```

**Retorna os agendamentos em aberto**
```GET /api/v1/agendamento/aberto/:id```

**Altera o status do agendamento**
```POST /api/v1/agendamento/:id```

**Atribui um funcionário de em agendamento**
```PUT /api/v1/agendamento/atribuir/:CodAgendamento```
