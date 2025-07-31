// server.js

const express = require("express");
const cors = require("cors");
const path = require("path");
const { router } = require("./routes"); // Importa as rotas organizadas

const app = express();

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

// Middlewares básicos
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Usa o router para todas as rotas definidas no routes.js
app.use(router);

// Inicializa o servidor
app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
});
