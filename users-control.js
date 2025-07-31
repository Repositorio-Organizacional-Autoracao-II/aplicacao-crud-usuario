// users-control.js

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { v4: uuidv4 } = require("uuid");
const { sanitizarTexto, validarCampos } = require("./valida");

// Caminho para o arquivo onde os usuários são armazenados em formato JSONL
const filePath = path.join(__dirname, "usuarios.json");

/**
 * Adiciona um novo usuário ao final do arquivo JSONL usando append.
 * A operação é feita sem precisar carregar todo o conteúdo do arquivo em memória.
 *
 * @param {Object} usuario - Objeto com dados do novo usuário.
 * @returns {Promise<void>}
 */
function appendUsuario(usuario) {
  // Gera um ID único para o usuário
  usuario.id = uuidv4();

  // Sanitiza os campos individualmente
  usuario.nome = sanitizarTexto(usuario.nome);
  usuario.endereco = sanitizarTexto(usuario.endereco);
  usuario.email = sanitizarTexto(usuario.email);

  // Serializa e adiciona nova linha ao final do arquivo
  const linha = JSON.stringify(usuario) + "\n";
  return fs.promises.appendFile(filePath, linha, "utf-8");
}

/**
 * Lê usuários de forma paginada, sem carregar o arquivo inteiro em memória.
 * A leitura é feita linha a linha até atingir a página solicitada.
 *
 * @param {number} pagina - Número da página desejada (inicia em 1).
 * @param {number} porPagina - Quantidade de usuários por página.
 * @returns {Promise<Array<Object>>} - Lista de usuários da página.
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
      } catch {} // Ignora linhas malformadas
    }
    if (usuarios.length >= porPagina) break;
    i++;
  }

  return usuarios;
}

/**
 * Edita um usuário existente com base em seu ID.
 * O arquivo é regravado linha por linha com um novo arquivo temporário.
 *
 * @param {string} id - ID do usuário a ser editado.
 * @param {Object} novosDados - Objeto contendo os dados atualizados.
 * @returns {Promise<void>}
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
      // Copia linhas inválidas sem alteração
      tempStream.write(linha + "\n");
      continue;
    }

    if (usuario.id === id) {
      // Atualiza e sanitiza os dados do usuário
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
 * Remove um usuário do arquivo JSONL com base em seu ID.
 * A linha correspondente é ignorada ao regravar o novo arquivo.
 *
 * @param {string} id - ID do usuário a ser removido.
 * @returns {Promise<void>}
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
      // Copia linhas inválidas sem alteração
      tempStream.write(linha + "\n");
      continue;
    }

    // Copia somente se não for o usuário a ser deletado
    if (usuario.id !== id) {
      tempStream.write(JSON.stringify(usuario) + "\n");
    }
  }

  await new Promise((resolve) => tempStream.end(resolve));
  await fs.promises.rename(tempFilePath, filePath);
}

// Exporta todas as funções para uso externo
module.exports = {
  appendUsuario,
  lerUsuariosPaginado,
  editarUsuario,
  deletarUsuario,
};
