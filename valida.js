/**
 * Limpa e sanitiza o texto recebido, removendo espaços desnecessários,
 * convertendo para minúsculas e excluindo caracteres potencialmente perigosos.
 * Útil para proteger contra entradas malformadas, mesmo sem usar banco de dados.
 *
 * @param {string} texto - Texto a ser sanitizado.
 * @returns {string} - Texto limpo e seguro.
 */

function sanitizarTexto(texto = "") {
  const textoLimpo = texto
    .trim()
    .toLowerCase()
    .replace(/["'?=:\n\r]/g, "") // Remove aspas, interrogação, igual, dois-pontos e quebras de linha
    .trim();

  
  //Lista de palavras proibidas para evitar sql injection

  const palavrasProibidas = [
    "select", "update", "delete", "order by",
    "from", "where", "create", "table", "database"
  ];

  //Verifica se há palavras proibidas
  const contemProibida = palavrasProibidas.some(palavra => {

    //expressão regular (REGEX) para procurar a palavra

    /* 
      \\b : garante a palavra isolada -> "select" (V) ; "selectnome" (X)
      i   : garante busca insensível a maiúscullas/minúsculas
    */
    const regex = new RegExp(`\\b${palavra}\\b`, "i"); 
    return regex.test(textoLimpo);
  });

  if (contemProibida) {
    throw new Error("Por favor, não tente fazer SQL Injection. É feio");
  }

  return textoLimpo;
}

/**
 * Valida os campos obrigatórios de um usuário.
 * Garante que nome, idade, endereço e email estejam no formato correto.
 *
 * @param {Object} campos - Objeto com os campos: nome, idade, endereco, email.
 * @returns {boolean} - true se todos os campos forem válidos, senão false.
 */
function validarCampos({ nome, idade, endereco, email }) {
  return (
    typeof nome === "string" && nome.length >= 2 &&
    typeof endereco === "string" && endereco.length >= 2 &&
    typeof email === "string" && email.includes("@") &&
    !isNaN(parseInt(idade)) && idade >= 0 && idade <= 120
  );
}

module.exports = { sanitizarTexto, validarCampos };
