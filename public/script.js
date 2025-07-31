let usuarios = []; // Armazena os usuários carregados
let paginaAtual = 1;
const usuariosPorPagina = 20;

let ordemAtual = { campo: "nome", crescente: true };
let totalUsuarios = 0; // Novo: guarda o total vindo do backend

// -----------------------------------------------------------------------------
// Função para carregar usuários do servidor, paginando pela API
// -----------------------------------------------------------------------------
async function carregarUsuarios() {
  try {
    const resposta = await fetch(
      `http://localhost:3000/list-users?pagina=${paginaAtual}&porPagina=${usuariosPorPagina}`
    );
    if (!resposta.ok) throw new Error("Erro ao carregar usuários");

    const dados = await resposta.json();
    usuarios = dados.usuarios || [];
    totalUsuarios = dados.total || 0; // Novo: guarda o total de usuários

    atualizarPaginacao();
  } catch (error) {
    alert("Erro ao carregar usuários: " + error.message);
  }
}

// -----------------------------------------------------------------------------
// Comparação de strings ignorando acentos e case
// -----------------------------------------------------------------------------
function comparaStrings(a, b, fullCompare = true) {
  const sa = a.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const sb = b.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const len = fullCompare ? Math.max(sa.length, sb.length) : 3;

  for (let i = 0; i < len; i++) {
    const c1 = sa.charCodeAt(i) || 0;
    const c2 = sb.charCodeAt(i) || 0;
    if (c1 < c2) return -1;
    if (c1 > c2) return 1;
  }
  return 0;
}

// -----------------------------------------------------------------------------
// Bubble sort para ordenar o array de usuários
// -----------------------------------------------------------------------------
function bubbleSort(arr, key, crescente = true) {
  const tipo = typeof arr[0]?.[key];
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      let a = arr[j][key];
      let b = arr[j + 1][key];
      let comp = tipo === "string" ? comparaStrings(a, b) : a - b;

      if ((crescente && comp > 0) || (!crescente && comp < 0)) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
}

// -----------------------------------------------------------------------------
// Ordena a tabela ao clicar nos cabeçalhos
// -----------------------------------------------------------------------------
function ordenarTabela(campo) {
  ordemAtual =
    ordemAtual.campo === campo
      ? { campo, crescente: !ordemAtual.crescente }
      : { campo, crescente: true };

  bubbleSort(usuarios, ordemAtual.campo, ordemAtual.crescente);
  atualizarPaginacao();
}

// -----------------------------------------------------------------------------
// Atualiza dados na tabela baseado na página atual
// -----------------------------------------------------------------------------
function atualizarPaginacao() {
  const totalPaginas = Math.ceil(totalUsuarios / usuariosPorPagina);

  document.getElementById("paginaAtual").innerText = paginaAtual;
  document.getElementById("totalPaginas").innerText = totalPaginas;

  renderizarTabela(usuarios);
}

// -----------------------------------------------------------------------------
// Botão para página anterior
// -----------------------------------------------------------------------------
function paginaAnterior() {
  if (paginaAtual > 1) {
    paginaAtual--;
    carregarUsuarios();
  }
}

// -----------------------------------------------------------------------------
// Botão para próxima página
// -----------------------------------------------------------------------------
function proximaPagina() {
  const totalPaginas = Math.ceil(totalUsuarios / usuariosPorPagina);
  if (paginaAtual < totalPaginas) {
    paginaAtual++;
    carregarUsuarios();
  }
}

// -----------------------------------------------------------------------------
// Renderiza a tabela de usuários
// -----------------------------------------------------------------------------
function renderizarTabela(data) {
  const tbody = document.querySelector("#tabelaUsuarios tbody");
  tbody.innerHTML = "";

  data.forEach((u) => {
    tbody.innerHTML += `
      <tr>
        <td>${u.nome}</td>
        <td>${u.idade}</td>
        <td>${u.endereco}</td>
        <td>${u.email}</td>
        <td>${u.id}</td>
        <td>
          <button class="edit" onclick="prepararEdicao('${u.id}')">✏️</button>
          <button class="delete" onclick="removerUsuarioDireto('${u.id}')">🗑️</button>
        </td>
      </tr>`;
  });
}

// -----------------------------------------------------------------------------
// Executa quando a página carrega
// -----------------------------------------------------------------------------
window.onload = carregarUsuarios;

// -----------------------------------------------------------------------------
// Prepara os dados do usuário para edição
// -----------------------------------------------------------------------------
function prepararEdicao(id) {
  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario) return;

  document.getElementById("editId").value = usuario.id;
  document.getElementById("editNome").value = usuario.nome;
  document.getElementById("editIdade").value = usuario.idade;
  document.getElementById("editEndereco").value = usuario.endereco;
  document.getElementById("editEmail").value = usuario.email;

  mostrarFormularioEditar();
}

function mostrarFormularioEditar() {
  document.getElementById("formEditar").style.display = "block";
}

function esconderFormularioEditar() {
  document.getElementById("formEditar").style.display = "none";
}

// -----------------------------------------------------------------------------
// Salva edição do usuário
// -----------------------------------------------------------------------------
async function salvarEdicao() {
  const id = document.getElementById("editId").value;
  const dadosAtualizados = {
    nome: document.getElementById("editNome").value,
    idade: parseInt(document.getElementById("editIdade").value),
    endereco: document.getElementById("editEndereco").value,
    email: document.getElementById("editEmail").value,
  };

  if (!id) {
    alert("Informe o ID do usuário para atualizar.");
    return;
  }

  try {
    const resposta = await fetch(`http://localhost:3000/atualizar-usuario/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosAtualizados),
    });

    if (!resposta.ok) {
      const erro = await resposta.json();
      alert("Erro ao atualizar usuário: " + (erro.message || resposta.statusText));
      return;
    }

    const resultado = await resposta.json();
    alert(resultado.message);
  } catch (err) {
    alert("Erro de conexão: " + err.message);
    return;
  }

  esconderFormularioEditar();
  carregarUsuarios();
}

// -----------------------------------------------------------------------------
// Remove usuário
// -----------------------------------------------------------------------------
async function removerUsuarioDireto(id) {
  const confirmacao = confirm("Tem certeza que deseja remover este usuário?");
  if (!confirmacao) return;

  try {
    const resposta = await fetch(`http://localhost:3000/remover-usuario/${id}`, {
      method: "DELETE",
    });

    if (!resposta.ok) {
      const erro = await resposta.json();
      alert("Erro ao remover usuário: " + (erro.message || resposta.statusText));
      return;
    }

    const resultado = await resposta.json();
    alert(resultado.message);
  } catch (err) {
    alert("Erro de conexão: " + err.message);
    return;
  }

  carregarUsuarios();
}

// -----------------------------------------------------------------------------
// Torna funções acessíveis no HTML
// -----------------------------------------------------------------------------
window.prepararEdicao = prepararEdicao;
window.salvarEdicao = salvarEdicao;
window.removerUsuarioDireto = removerUsuarioDireto;
window.mostrarFormularioEditar = mostrarFormularioEditar;
window.esconderFormularioEditar = esconderFormularioEditar;
window.ordenarTabela = ordenarTabela;
window.paginaAnterior = paginaAnterior;
window.proximaPagina = proximaPagina;