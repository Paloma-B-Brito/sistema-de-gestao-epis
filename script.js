const MODAL_ENTRADA_ID = "modalEntrada";
const MODAL_ENTREGA_ID = "modalEntrega";
const MODAL_BUSCA_ID = "modalBusca";

// 1. SAIR DO SISTEMA (MENU "SAIR")

// Remove o usuário logado do armazenamento local e redireciona para a página de login.
function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}

// 2. CARREGAMENTO DE PÁGINAS (SPA SIMPLES)

function carregarPagina(pagina) {
  const conteudo = document.getElementById("conteudo");

  // Caso o usuário clique em "Dashboard", recarrega o próprio index.
  if (pagina === "dashboard") {
    fetch("index.html")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao recarregar o Dashboard.");
        return res.text();
      })
      .then((html) => {
        // Cria um DOM temporário e extrai o conteúdo do <main>
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const novoConteudo = doc.querySelector("main").innerHTML;
        conteudo.innerHTML = novoConteudo;
      })
      .catch((err) => {
        conteudo.innerHTML = `<p class="text-red-600">${err.message}</p>`;
        console.error(err);
      });
    return;
  }

  // Para outras páginas, busca o arquivo dentro da pasta /paginas
  fetch(`paginas/${pagina}.html`)
    .then((res) => {
      if (!res.ok) throw new Error(`Página não encontrada: ${pagina}`);
      return res.text();
    })
    .then((html) => {
      conteudo.innerHTML = html;
    })
    .catch((err) => {
      conteudo.innerHTML = `<p class="text-red-600">${err.message}</p>`;
      console.error(err);
    });
}

// 3. FUNÇÕES GENÉRICAS DE MODAL (ABRIR, FECHAR E CLICAR FORA)

// O modal faz um "zoom suave" ao abrir.
function abrirModalGenerico(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return console.error(`Modal com ID '${modalId}' não encontrado.`);

  // O elemento com a classe 'transform' é geralmente o conteúdo do modal
  const caixa = modal.querySelector(".transform");

  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.add("opacity-100");  // efeito de fade-in do fundo
    if (caixa) {
      caixa.classList.remove("scale-95"); // cresce levemente
      caixa.classList.add("scale-100");
    }
  }, 10);
}

// O modal faz um "zoom suave" ao fechar.
function fecharModalGenerico(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return console.error(`Modal com ID '${modalId}' não encontrado.`);

  const caixa = modal.querySelector(".transform");

  modal.classList.remove("opacity-100");
  if (caixa) {
    caixa.classList.remove("scale-100");
    caixa.classList.add("scale-95");    // volta a encolher antes de sumir
  }

  // espera a animação terminar (300ms) pra esconder
  setTimeout(() => modal.classList.add("hidden"), 300);
}

// Função para fechar qualquer modal ao clicar no fundo (fora do conteúdo)
function fecharModalAoClicarFora(e, modalId) {
  const modal = document.getElementById(modalId);
  if (e.target === modal) fecharModalGenerico(modalId);
}

// Define as funções de controle de modal no escopo global para serem chamadas nos botões HTML
// As funções originais foram substituídas por chamadas às genéricas
window.abrirFormulario = () => abrirModalGenerico(MODAL_ENTRADA_ID);
window.fecharFormulario = () => fecharModalGenerico(MODAL_ENTRADA_ID);

window.abrirModalEntrega = () => abrirModalGenerico(MODAL_ENTREGA_ID);
window.fecharModalEntrega = () => fecharModalGenerico(MODAL_ENTREGA_ID);

window.abrirModalBusca = () => abrirModalGenerico(MODAL_BUSCA_ID);
window.fecharModalBusca = () => fecharModalGenerico(MODAL_BUSCA_ID);

// Configura os eventos de clique fora para cada modal
window.addEventListener("click", (e) => fecharModalAoClicarFora(e, MODAL_ENTRADA_ID));
window.addEventListener("click", (e) => fecharModalAoClicarFora(e, MODAL_ENTREGA_ID));
window.addEventListener("click", (e) => fecharModalAoClicarFora(e, MODAL_BUSCA_ID));

// 4. SALVAR ENTRADA NA TABELA (Efeito Visual)

// Coleta os dados digitados no formulário e adiciona uma nova linha na tabela do estoque.
window.salvarEntrada = function () {
  // Captura os valores digitados
  const item = document.getElementById("item").value.trim();
  const quantidade = document.getElementById("quantidade").value.trim();
  const validade = document.getElementById("validade").value.trim();

  // Verifica se todos os campos foram preenchidos
  if (!item || !quantidade || !validade) {
    mostrarToast("Por favor, preencha todos os campos!", "yellow");
    return;
  }

  // FUNÇÃO AUXILIAR NECESSÁRIA: Formata a data (assumindo que 'formatarDataValidade' existe)
  // Se você não tem essa função, pode usar a data no formato ISO mesmo ou implementá-la.
  const dataFormatada = typeof formatarDataValidade === 'function' ? formatarDataValidade(validade) : validade;

  // Cria uma nova linha (<tr>)
  const tr = document.createElement("tr");
  tr.classList.add("hover:bg-gray-50", "transition");

  // Monta as células (<td>) da nova linha
  tr.innerHTML = `
  <td class="p-3">${item}</td>
  <td class="p-3">3M</td>
  <td class="p-3">${quantidade}</td>
  <td class="p-3">${dataFormatada}</td>
  <td class="p-3 text-green-600 font-semibold">OK</td>
 `;

  // Adiciona a linha dentro do <tbody> da tabela principal
  const tbody = document.querySelector("#tabela-estoque-dashboard tbody");
  if (!tbody) {
    console.error("❌ Não encontrei #tabela-estoque-dashboard tbody");
    mostrarToast("Erro interno: tabela não encontrada.", "red");
    return;
  }
  tbody.appendChild(tr);

  // Limpa os campos e fecha o formulário
  document.getElementById("entradaForm").reset();
  window.fecharFormulario(); // Chama a função que agora usa o genérico

  // Efeito de destaque (pisca em verde)
  tr.classList.add("bg-green-100");
  setTimeout(() => tr.classList.remove("bg-green-100"), 1000);

  // Mensagem de sucesso
  mostrarToast("Entrada registrada com sucesso!", "green");
};


// 5. SALVAR ENTREGA/BAIXA

// Coleta os dados do formulário de entrega e processa.
function salvarEntrega() {
  const item = document.getElementById("itemEntrega").value.trim();
  const data = document.getElementById("validadeEntrega").value.trim();
  const qtd = document.getElementById("quantidadeEntrega").value.trim();
  const funcionario = document.getElementById("funcionarioEntrega").value.trim();

  // Verifica se todos os campos estão preenchidos
  if (!item || !data || !qtd || !funcionario) {
    mostrarToast("Por favor, preencha todos os campos da entrega.", "yellow");
    return;
  }

  // Validação de texto (somente letras)
  if (!/^[A-Za-zÀ-ÿ\s]+$/.test(funcionario)) {
    mostrarToast("O nome do funcionário deve conter apenas letras.", "yellow");
    return;
  }

  // Exibe mensagem de sucesso
  mostrarToast(
    `Entrega registrada: ${qtd}x ${item} para ${funcionario}`,
    "blue"
  );

  // Limpa e fecha o modal
  document.getElementById("entregaForm").reset();
  fecharModalGenerico(MODAL_ENTREGA_ID); // Usa a função genérica
}

// 6. MODAL DE BUSCA DE CA/EPI

// Função para buscar EPI (com simulação de animação)
function buscarEPI() {
  const termo = document.getElementById("buscaInput").value.trim();
  const resultadoDiv = document.getElementById("resultadoBusca");
  const conteudo = document.getElementById("resultadoConteudo");
  const botaoTexto = document.getElementById("textoBusca");
  const botaoIcone = document.getElementById("iconeBusca");

  if (!termo) {
    mostrarToast("Digite algo para buscar.", "yellow");
    return;
  }

  // 🔄 Muda o botão para "carregando"
  botaoTexto.textContent = "Buscando...";
  botaoIcone.innerHTML = `<svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path>
 </svg>`;

  // Simulação de tempo de busca
  setTimeout(() => {
    // "Banco de dados" fake
    let resultadosFake = [
      { nome: "Capacete de Segurança", ca: "12345", status: "Ativo" },
      { nome: "Luva Nitrílica", ca: "67890", status: "Vencido" },
      { nome: "Óculos de Proteção", ca: "11223", status: "Em uso" },
    ];

    const resultado = resultadosFake.find(
      (r) =>
        r.nome.toLowerCase().includes(termo.toLowerCase()) ||
        r.ca === termo
    );

    if (resultado) {
      conteudo.innerHTML = `
    <p><strong>Item:</strong> ${resultado.nome}</p>
    <p><strong>CA:</strong> ${resultado.ca}</p>
    <p><strong>Status:</strong> 
     <span class="${resultado.status === "Vencido"
          ? "text-red-600"
          : "text-green-600"} font-semibold">
      ${resultado.status}
     </span>
    </p>
   `;
      resultadoDiv.classList.remove("hidden");
      mostrarToast("EPI encontrado!", "green");
    } else {
      conteudo.innerHTML = `<p class="text-red-600 font-semibold">Nenhum resultado encontrado.</p>`;
      resultadoDiv.classList.remove("hidden");
      mostrarToast("EPI não encontrado.", "red");
    }

    // 🔁 Volta o botão ao normal
    botaoTexto.textContent = "Buscar";
    botaoIcone.textContent = "🔍";
  }, 1500); // 1,5 segundos de "carregamento"
}

// 7. TOAST (MENSAGEM DE SUCESSO ESTILIZADA)

// Mostra uma notificação temporária no canto superior direito.
// Cores: green (sucesso), yellow (aviso), red (erro), blue (info).
function mostrarToast(mensagem, cor = "green") {
  const toast = document.getElementById("toast");
  if (!toast) return console.error("Elemento 'toast' não encontrado.");

  toast.textContent = mensagem;

  // Define o estilo e a cor dinamicamente (usando a cor como tailwind class prefix)
  // Nota: A classe `bg-${cor}-600` deve estar na lista de classes permitidas do Tailwind para funcionar corretamente.
  toast.className = `fixed top-5 right-5 bg-${cor}-600 text-white px-4 py-2 rounded-md shadow-lg opacity-0 transition-opacity duration-500 z-50`;

  // Mostra o toast com fade-in
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("opacity-100"), 10);

  // Esconde automaticamente após 3 segundos
  setTimeout(() => {
    toast.classList.remove("opacity-100");
    setTimeout(() => toast.classList.add("hidden"), 500);
  }, 3000);
}

// 8. VALIDAÇÃO DE INPUTS

// Impede números onde só deve haver texto (baseado no atributo data-tipo="texto")
document.addEventListener("input", function (e) {
  if (e.target.dataset.tipo === "texto") {
    // Expressão regular que aceita letras (incluindo acentuadas), espaços e nada mais
    const regexApenasLetras = /[^A-Za-zÀ-ÿ\s]/g;
    if (regexApenasLetras.test(e.target.value)) {
      e.target.value = e.target.value.replace(regexApenasLetras, "");
    }
  }
});