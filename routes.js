// routes.js

const express = require("express");
const path = require("path");
const router = express.Router();
const {
  appendUsuario,
  lerUsuariosPaginado,
  contarTotalUsuarios,
  editarUsuario,
  deletarUsuario,
} = require("./users-control");
const { sanitizarTexto, validarCampos } = require("./valida");

// Serve página inicial (index.html)
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/**
 * Lista usuários paginados e retorna também o total de usuários.
 */
router.get("/list-users", async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const porPagina = parseInt(req.query.porPagina) || 20;

    const usuarios = await lerUsuariosPaginado(pagina, porPagina);
    const total = await contarTotalUsuarios();

    res.json({ ok: true, pagina, porPagina, total, usuarios });
  } catch (err) {
    res.status(500).json({ error: "Erro ao ler usuários" });
  }
});

/**
 * Cadastra um novo usuário usando append.
 */
router.post("/cadastrar-usuario", async (req, res) => {
  try {
    const usuario = {
      nome: sanitizarTexto(req.body.nome),
      idade: parseInt(req.body.idade),
      endereco: sanitizarTexto(req.body.endereco),
      email: sanitizarTexto(req.body.email),
    };

    if (!validarCampos(usuario)) {
      return res.status(400).json({ ok: false, error: "Dados inválidos" });
    }

    await appendUsuario(usuario);
    res.status(201).json({ ok: true, message: "Usuário cadastrado", usuario });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Erro ao salvar usuário" });
  }
});

/**
 * Atualiza usuário por ID.
 */
router.put("/atualizar-usuario/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const novosDados = {
      nome: sanitizarTexto(req.body.nome),
      idade: parseInt(req.body.idade),
      endereco: sanitizarTexto(req.body.endereco),
      email: sanitizarTexto(req.body.email),
    };

    if (!validarCampos(novosDados)) {
      return res.status(400).json({ ok: false, error: "Dados inválidos" });
    }

    await editarUsuario(id, novosDados);
    res.json({ ok: true, message: "Usuário atualizado" });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Erro ao atualizar usuário" });
  }
});

/**
 * Remove usuário por ID.
 */
router.delete("/remover-usuario/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await deletarUsuario(id);
    res.json({ ok: true, message: "Usuário removido" });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Erro ao remover usuário" });
  }
});

module.exports = { router };