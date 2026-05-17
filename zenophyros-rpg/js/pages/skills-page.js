window.skillDatabase = {};

const skillsList = document.getElementById("skills-list");

const searchInput = document.getElementById("search-input");

const filterTipo = document.getElementById("filter-tipo");

const filterOrigem = document.getElementById("filter-origem");

const sortSelect = document.getElementById("sort-select");

const enums = {
  tiposHabilidade: {
    // exemplo
    ataque: { label: "Ataque" },
    defesa: { label: "Defesa" },
  },
  origensHabilidade: {
    // exemplo
    fisica: { label: "Física" },
    magica: { label: "Mágica" },
  },
};

let skills = [];

let filteredSkills = [];

async function init() {
  console.log("INIT RODANDO");
  await carregarSkills();

  configurarModalSkill();

  skills = Object.values(window.skillDatabase);

  filteredSkills = [...skills];

  preencherFiltros();
  aplicarOrdenacao();
  renderSkills(filteredSkills);
  configurarEventos();

  console.log("skillsData:", window.skillDatabase);
  console.log("skills array:", skills);
}

function preencherFiltros() {
  Object.entries(enums.tiposHabilidade).forEach(([id, tipo]) => {
    const option = document.createElement("option");

    option.value = id;

    option.textContent = tipo.label;

    filterTipo.appendChild(option);
  });

  Object.entries(enums.origensHabilidade).forEach(([id, origem]) => {
    const option = document.createElement("option");

    option.value = id;

    option.textContent = origem.label;

    filterOrigem.appendChild(option);
  });
}

function renderSkills(lista) {
  skillsList.innerHTML = "";

  document.getElementById("skills-count").textContent =
    `Habilidades: ${lista.length}`;

  lista.forEach((skill) => {
    const tipoLabel = enums.tiposHabilidade[skill.tipo]?.label ?? skill.tipo;
    const origemLabel =
      enums.origensHabilidade[skill.origem]?.label ?? skill.origem;

    const card = document.createElement("article");

    card.className = "skill-card";

    card.innerHTML = `
      <div class="skill-top">

        <h2 class="skill-name">
          ${skill.nome}
        </h2>

      </div>

      <div class="skill-meta">

        <span class="skill-badge">
          ${tipoLabel}
        </span>

        <span class="skill-badge">
          ${origemLabel}
        </span>

      </div>

      <p class="skill-description">
        ${skill.descricao}
      </p>

      <div class="skill-tags">
        ${skill.tags
          .map(
            (tag) => `
          <span class="skill-tag">
            ${tag}
          </span>
        `,
          )
          .join("")}
      </div>
    `;

    skillsList.appendChild(card);

    card.addEventListener("click", () => abrirModalSkill(skill));
  });
}

function aplicarFiltros() {
  const termo = searchInput.value.toLowerCase().trim();

  const tipo = filterTipo.value;

  const origem = filterOrigem.value;

  filteredSkills = skills.filter((skill) => {
    const matchNome = skill.nome.toLowerCase().includes(termo);

    const matchDescricao = skill.descricao.toLowerCase().includes(termo);

    const matchTags = skill.tags.some((tag) =>
      tag.toLowerCase().includes(termo),
    );

    const matchBusca = !termo || matchNome || matchDescricao || matchTags;

    const matchTipo = !tipo || skill.tipo === tipo;

    const matchOrigem = !origem || skill.origem === origem;

    return matchBusca && matchTipo && matchOrigem;
  });

  aplicarOrdenacao();

  renderSkills(filteredSkills);
}

function aplicarOrdenacao() {
  filteredSkills.sort((a, b) => {
    return a.nome.localeCompare(b.nome);
  });
}

function configurarEventos() {
  searchInput.addEventListener("input", aplicarFiltros);

  filterTipo.addEventListener("change", aplicarFiltros);

  filterOrigem.addEventListener("change", aplicarFiltros);

  sortSelect.addEventListener("change", aplicarFiltros);
}

const DATABASE_PATH = "./data/skills-database.json";

let botaoSkillAtual = null;

/**
 * Carrega banco de habilidades.
 */
async function carregarSkills() {
  const skillsData = await carregarJSON(DATABASE_PATH);
  window.skillDatabase = skillsData.habilidades;
}

/**
 * Busca habilidade pelo ID.
 */
function buscarSkillPorId(skillId) {
  if (!skillId) {
    return null;
  }

  return window.skillDatabase[skillId] || null;
}

function configurarModalSkill() {
  const skillModal = document.getElementById("skill-modal");

  const closeButton = document.getElementById("close-modal");

  if (!skillModal || !closeButton) {
    return;
  }

  closeButton.addEventListener("click", () => {
    fecharModalSkill();
  });

  // Fecha clicando fora
  skillModal.addEventListener("click", (event) => {
    if (event.target === skillModal) {
      fecharModalSkill();
    }
  });
}

// Este botão só existe em character-sheet-page.html. Dá problema em skills-page.html.
const btnRemoverSkill = document.getElementById("btn-remover-skill");

if (btnRemoverSkill) {
  btnRemoverSkill.addEventListener("click", () => {
    if (!botaoSkillAtual) {
      return;
    }

    const confirmar = confirm("Remover habilidade?");

    if (!confirmar) {
      return;
    }

    const index = Array.from(
      document.querySelectorAll(".botao-habilidade"),
    ).indexOf(botaoSkillAtual);

    botaoSkillAtual.dataset.skillId = "";

    botaoSkillAtual.textContent = "(vazio)";

    salvarLocal();
    fecharModalSkill();
  });
}

/**
 * Abre popup/modal da habilidade.
 */
function abrirModalSkill(skill, botaoOrigem = 0) {
  botaoSkillAtual = botaoOrigem;

  const skillModal = document.getElementById("skill-modal");

  const modalBody = document.getElementById("modal-body");

  if (!skillModal || !modalBody) {
    console.error("Modal de skill não encontrado no HTML.");

    return;
  }

  modalBody.innerHTML = `
    ${renderCabecalho(skill)}
    ${renderDescricao(skill)}
    ${renderPreRequisitos(skill)}
    ${renderEfeito(skill)}
    ${renderRolagens(skill)}
    ${renderAlcance(skill)}
    ${renderArea(skill)}
    ${renderCusto(skill)}
    ${renderTags(skill)}
    ${renderId(skill)}
  `;

  skillModal.classList.remove("hidden");
}

function fecharModalSkill() {
  const skillModal = document.getElementById("skill-modal");

  if (!skillModal) {
    return;
  }

  skillModal.classList.add("hidden");
}

function renderCabecalho(skill) {
  const tipoLabel = "tipoLabel";

  const origemLabel = "origemLabel";

  return `
    <h2>
      ${skill.nome}
    </h2>

    <div class="modal-badges">

      <span class="skill-badge">
        ${tipoLabel}
      </span>

      <span class="skill-badge">
        ${origemLabel}
      </span>

      <span class="skill-badge">
        ${skill.escola}
      </span>

    </div>
  `;
}

function renderDescricao(skill) {
  return `
    <div class="modal-section">

      <h3>Descrição</h3>

      <p>
        ${skill.descricao}
      </p>

    </div>
  `;
}

function renderPreRequisitos(skill) {
  return `
    <div class="modal-section">

      <h3>Pré-Requisitos</h3>

      <div class="modal-box">
        ${formatarPreRequisitos(skill.preRequisitos)}
      </div>

    </div>
  `;
}

function renderEfeito(skill) {
  return `
    <div class="modal-section">

      <h3>Efeito</h3>

      <p>
        ${skill.efeito.texto}
      </p>

    </div>
  `;
}

function renderRolagens(skill) {
  const rolagensValidas = (skill.efeito.rolagens || []).filter(
    (rolagem) => rolagem.tipo?.trim() || rolagem.formula?.trim(),
  );

  if (rolagensValidas.length === 0) {
    return "";
  }

  return `
    <div class="modal-section">

      <h3>Rolagens</h3>

      ${rolagensValidas
        .map(
          (rolagem) => `

        <div class="modal-box">

          <span class="modal-label">
            ${rolagem.tipo}
          </span>

          <p>
            ${rolagem.formula}
          </p>

        </div>

      `,
        )
        .join("")}

    </div>
  `;
}

function renderAlcance(skill) {
  const alcance = skill.efeito.alcance;

  if (!alcance) {
    return "";
  }

  const tipo = (alcance.tipo || "").trim();

  const possuiAlcance = tipo && tipo !== "NENHUM";

  if (!possuiAlcance) {
    return "";
  }

  const mostrarDistancia = Number(alcance.distancia) > 0;

  return `
    <div class="modal-section">

      <h3>Alcance</h3>

      <div class="modal-grid">

        <div class="modal-box">

          <span class="modal-label">
            Tipo
          </span>

          <p>
            ${alcance.tipo}
          </p>

        </div>

        ${
          mostrarDistancia
            ? `
          <div class="modal-box">

            <span class="modal-label">
              Distância
            </span>

            <p>
              ${alcance.distancia}
            </p>

          </div>
        `
            : ""
        }

      </div>

    </div>
  `;
}

function renderArea(skill) {
  const area = skill.efeito.area;

  if (!area) {
    return "";
  }

  const tipo = (area.tipo || "").trim();

  const possuiArea = tipo && tipo !== "NENHUMA";

  if (!possuiArea) {
    return "";
  }

  return `
    <div class="modal-section">

      <h3>Área</h3>

      <div class="modal-box">
        ${formatarArea(area)}
      </div>

    </div>
  `;
}

function renderCusto(skill) {
  const custo = skill.custo || {};

  const campos = [];

  if (custo.mana !== "" && custo.mana !== undefined && custo.mana !== null) {
    campos.push(`
      <div class="modal-box">
        Mana: ${custo.mana}
      </div>
    `);
  }

  if (custo.vida !== "" && custo.vida !== undefined && custo.vida !== null) {
    campos.push(`
      <div class="modal-box">
        Vida: ${custo.vida}
      </div>
    `);
  }

  if (
    custo.energia !== "" &&
    custo.energia !== undefined &&
    custo.energia !== null
  ) {
    campos.push(`
      <div class="modal-box">
        Energia: ${custo.energia}
      </div>
    `);
  }

  if (campos.length === 0) {
    return "";
  }

  return `
    <div class="modal-section">

      <h3>Custo</h3>

      <div class="modal-grid">
        ${campos.join("")}
      </div>

    </div>
  `;
}

function renderTags(skill) {
  if (!skill.tags?.length) {
    return "";
  }

  return `
    <div class="modal-section">

      <h3>Tags</h3>

      <div class="modal-badges">

        ${skill.tags
          .map(
            (tag) => `
          <span class="skill-tag">
            ${tag}
          </span>
        `,
          )
          .join("")}

      </div>

    </div>
  `;
}

function renderId(skill) {
  if (!skill.id) {
    return "";
  }

  return `
    <div class="modal-id">

      ID:
      <code>
        ${skill.id}
      </code>

    </div>
  `;
}

function formatarArea(area) {
  switch (area.tipo) {
    case "ALVO_UNICO":
      return "Alvo Único";

    case "QUADRADO":
      return `
        Quadrado
        (${area.largura}x${area.altura})
      `;

    case "RETANGULO":
      return `
        Retângulo
        (${area.largura}x${area.altura})
      `;

    case "CONE":
      return `
        Cone
        (${area.comprimento} níveis)
      `;

    default:
      return "Desconhecida";
  }
}

function formatarPreRequisitos(preReq) {
  const linhas = [];

  if (preReq.atributos) {
    Object.entries(preReq.atributos).forEach(([atributo, valor]) => {
      if (valor > 0) {
        linhas.push(`${atributo.toUpperCase()} ${valor}`);
      }
    });
  }

  if (preReq.niveis && preReq.niveis.personagem) {
    linhas.push(`Nível ${preReq.niveis.personagem}`);
  }

  if (preReq.habilidades && preReq.habilidades.length > 0) {
    linhas.push(...preReq.habilidades);
  }

  if (preReq.especie && preReq.especie.length > 0) {
    const especiesFormatadas = preReq.especie.filter(Boolean).join(", ");

    linhas.push(`Espécie: ${especiesFormatadas}`);
  }

  if (linhas.length === 0) {
    return "Nenhum";
  }

  return linhas.join(", ");
}

init();