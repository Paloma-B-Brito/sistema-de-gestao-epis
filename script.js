// =============================================
// 🧩 SAIR DO SISTEMA (MENU "SAIR")
// =============================================
// Remove o usuário logado do armazenamento local
// e redireciona para a página de login.
function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}

// =============================================
// 🌐 CARREGAMENTO DE PÁGINAS (SPA SIMPLES)
// =============================================
// Essa função permite navegar entre páginas HTML
// sem recarregar o site inteiro (conceito de SPA).
function carregarPagina(pagina) {
  const conteudo = document.getElementById("conteudo");

  // 🏠 Caso o usuário clique em "Dashboard", recarrega o próprio index.
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

  // 📄 Para outras páginas, busca o arquivo dentro da pasta /paginas
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

// =============================================
// 🪟 ABRIR E FECHAR FORMULÁRIO (MODAL COM ANIMAÇÃO)
// =============================================
// Agora o modal faz um "zoom suave" ao abrir e fechar.
window.abrirFormulario = function () {
  const modal = document.getElementById("formularioModal");
  const caixa = modal.querySelector(".transform");

  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.add("opacity-100");   // efeito de fade-in do fundo
    caixa.classList.remove("scale-95");   // cresce levemente
    caixa.classList.add("scale-100");
  }, 10);
};

window.fecharFormulario = function () {
  const modal = document.getElementById("formularioModal");
  const caixa = modal.querySelector(".transform");

  modal.classList.remove("opacity-100");
  caixa.classList.remove("scale-100");
  caixa.classList.add("scale-95");        // volta a encolher antes de sumir

  // espera a animação terminar (300ms) pra esconder
  setTimeout(() => modal.classList.add("hidden"), 300);
};

// ✨ Fecha o modal quando o usuário clica fora da caixa branca.
window.addEventListener("click", (e) => {
  const modal = document.getElementById("formularioModal");
  if (e.target === modal) fecharFormulario();
});

// =============================================
// 🧾 SALVAR ENTRADA NA TABELA
// =============================================
// Coleta os dados digitados no formulário e adiciona uma nova
// linha na tabela do estoque, com efeito visual e mensagem de sucesso.
window.salvarEntrada = function () {
  // 🔍 Captura os valores digitados
  const item = document.getElementById("item").value.trim();
  const quantidade = document.getElementById("quantidade").value.trim();
  const validade = document.getElementById("validade").value.trim();

  // ⚠️ Verifica se todos os campos foram preenchidos
  if (!item || !quantidade || !validade) {
    mostrarToast("Por favor, preencha todos os campos!", "yellow");
    return;
  }

  // 🧱 Cria uma nova linha (<tr>)
  const tr = document.createElement("tr");
  tr.classList.add("hover:bg-gray-50", "transition");

  // 🧩 Monta as células (<td>) da nova linha
  tr.innerHTML = `
    <td class="p-3">${item}</td>
    <td class="p-3">3M</td>
    <td class="p-3">${quantidade}</td>
    <td class="p-3">${validade}</td>
    <td class="p-3 text-green-600 font-semibold">OK</td>
  `;

  // 🔗 Adiciona a linha dentro do <tbody> da tabela principal
  const tbody = document.querySelector("#tabela-estoque-dashboard tbody");
  if (!tbody) {
    console.error("❌ Não encontrei #tabela-estoque-dashboard tbody");
    mostrarToast("Erro interno: tabela não encontrada.", "red");
    return;
  }
  tbody.appendChild(tr);

  // 🧹 Limpa os campos e fecha o formulário
  document.getElementById("entradaForm").reset();
  window.fecharFormulario();

  // ✨ Efeito de destaque (pisca em verde)
  tr.classList.add("bg-green-100");
  setTimeout(() => tr.classList.remove("bg-green-100"), 1000);

  // ✅ Mensagem de sucesso
  mostrarToast("Entrada registrada com sucesso!", "green");
};

// =============================================
// 🟢 TOAST (MENSAGEM DE SUCESSO ESTILIZADA)
// =============================================
// Mostra uma notificação temporária no canto superior direito.
// Cores: green (sucesso), yellow (aviso), red (erro).
function mostrarToast(mensagem, cor = "green") {
  const toast = document.getElementById("toast");
  toast.textContent = mensagem;

  // 🔧 Define o estilo e a cor dinamicamente
  toast.className = `fixed top-5 right-5 bg-${cor}-600 text-white px-4 py-2 rounded-md shadow-lg opacity-0 transition-opacity duration-500 z-50`;

  // ✨ Mostra o toast com fade-in
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("opacity-100"), 10);

  // ⏳ Esconde automaticamente após 3 segundos
  setTimeout(() => {
    toast.classList.remove("opacity-100");
    setTimeout(() => toast.classList.add("hidden"), 500);
  }, 3000);
}
