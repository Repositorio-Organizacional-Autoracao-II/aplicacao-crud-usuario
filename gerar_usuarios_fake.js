// gerar_usuarios_fake.js
const fs = require("fs");
const { faker } = require("@faker-js/faker");
const { v4: uuidv4 } = require("uuid");
const TOTAL_USUARIOS = 10000;
const ARQUIVO = "usuarios.json";

function gerarUsuario() {
  return {
    id: uuidv4(),
    nome: faker.person.fullName(),
    idade: faker.number.int({ min: 18, max: 90 }),
    endereco: faker.location.streetAddress(),
    email: faker.internet.email(),
  };
}

function gerarEGravarUsuarios() {
  console.log(`🛠️ Gerando ${TOTAL_USUARIOS} usuários em formato JSONL...`);
  const stream = fs.createWriteStream(ARQUIVO, { flags: "w" });

  for (let i = 0; i < TOTAL_USUARIOS; i++) {
    const usuario = gerarUsuario();
    stream.write(JSON.stringify(usuario) + "\n");
  }

  stream.end(() => {
    console.log(`✅ Arquivo "${ARQUIVO}" gerado com sucesso em JSONL!`);
  });
}

gerarEGravarUsuarios();
