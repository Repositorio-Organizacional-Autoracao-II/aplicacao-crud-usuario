// users-control.js

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { v4: uuidv4 } = require("uuid");
const { sanitizarTexto, validarCampos } = require("./valida");

// Caminho do arquivo de usuários no formato JSONL
const filePath = path.join(__dirname, "usuarios.json");

/**
 * Adiciona um novo usuário ao final do arquivo (append)
 * sem precisar carregar todo o arquivo na memória.
 */
function appendUsuario(usuario) {
  usuario.id = uuidv4();
  usuario.nome = sanitizarTexto(usuario.nome);
  usuario.endereco = sanitizarTexto(usuario.endereco);
  usuario.email = sanitizarTexto(usuario.email);

  const linha = JSON.stringify(usuario) + "\n";
  return fs.promises.appendFile(filePath, linha, "utf-8");
}

/**
 * Lê usuários por página (modo paginado) sem carregar tudo na memória.
 */
async function lerUsuariosPaginado(pagina = 1, porPagina = 10) {
  const inicio = (pagina - 1) * porPagina;
  const usuarios = [];

  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: stream });

  let i = 0;
  for await (const linha of rl) {
    if (i >= inicio && usuarios.length < porPagina) {
      try {
        usuarios.push(JSON.parse(linha));
      } catch {}
    }
    if (usuarios.length >= porPagina) break;
    i++;
  }

  return usuarios;
}

/**
 * Conta o total de linhas (usuários) no arquivo JSONL.
 * Usado para saber o total de páginas no frontend.
 */
async function contarTotalUsuarios() {
  let total = 0;

  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: stream });

  for await (const linha of rl) {
    if (linha.trim()) total++;
  }

  return total;
}

/**
 * Edita um usuário regravando o arquivo linha por linha (arquivo temporário).
 */
async function editarUsuario(id, novosDados) {
  const tempFilePath = filePath + ".tmp";

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  const tempStream = fs.createWriteStream(tempFilePath, { flags: "w" });

  for await (const linha of rl) {
    let usuario;
    try {
      usuario = JSON.parse(linha);
    } catch {
      tempStream.write(linha + "\n");
      continue;
    }

    if (usuario.id === id) {
      const atualizado = {
        ...usuario,
        ...novosDados,
        nome: sanitizarTexto(novosDados.nome),
        endereco: sanitizarTexto(novosDados.endereco),
        email: sanitizarTexto(novosDados.email),
      };
      tempStream.write(JSON.stringify(atualizado) + "\n");
    } else {
      tempStream.write(linha + "\n");
    }
  }

  await new Promise((resolve) => tempStream.end(resolve));
  await fs.promises.rename(tempFilePath, filePath);
}

/**
 * Remove um usuário ignorando a linha correspondente ao regravar o arquivo.
 */
async function deletarUsuario(id) {
  const tempFilePath = filePath + ".tmp";

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  const tempStream = fs.createWriteStream(tempFilePath, { flags: "w" });

  for await (const linha of rl) {
    let usuario;
    try {
      usuario = JSON.parse(linha);
    } catch {
      tempStream.write(linha + "\n");
      continue;
    }

    if (usuario.id !== id) {
      tempStream.write(JSON.stringify(usuario) + "\n");
    }
  }

  await new Promise((resolve) => tempStream.end(resolve));
  await fs.promises.rename(tempFilePath, filePath);
}

module.exports = {
  appendUsuario,
  lerUsuariosPaginado,
  contarTotalUsuarios,
  editarUsuario,
  deletarUsuario,
};