window.skillDatabase = {};

const skillsList = document.getElementById("skills-list");
const searchInput = document.getElementById("search-input");
const filterType = document.getElementById("filter-type");
const filterOrigin = document.getElementById("filter-origin");
const sortSelect = document.getElementById("sort-select");

const enums = {
  skillActivationType: {
    passive: { label: "Passiva" },
    active: { label: "Ativa" },
    reactive: { label: "Reativa "}
  },
  skillOrigin: {
    magic: { label: "Magia" },
    technique: { label: "Técnica" },
    prayer: {label: "Prece"}
  },
};

let skills = [];

let filteredSkills = [];

const DATABASE_PATH = "./data/skills-database.json";

let botaoSkillAtual = null;

/**
 * Carrega banco de habilidades.
 */
async function loadSkills() {
  const skillsData = await carregarJSON(DATABASE_PATH);
  window.skillDatabase = skillsData.habilidades;
}

/**
 * Busca habilidade pelo ID.
 */
function searchSkillById(skillId) {
  if (!skillId) {
    return null;
  }

  return window.skillDatabase[skillId] || null;
}

/**
 * INIT
 */
async function init() {
  console.log("INIT RODANDO");
  await loadSkills();

  configurarModalSkill();

  skills = Object.values(window.skillDatabase);

  filteredSkills = [...skills];

  fillFilters();
  applySort();
  renderSkills(filteredSkills);
  configurarEventos();

  console.log("skillsData:", window.skillDatabase);
  console.log("skills array:", skills);
}

/**
 * Preenche os filtros de acordo com os ENUMS.
 */
function fillFilters() {

  Object.entries(enums.skillActivationType).forEach(([id, activationType]) => {
    const option = document.createElement("option");

    option.value = id;

    option.textContent = activationType.label;

    filterType.appendChild(option);
  });

  Object.entries(enums.skillOrigin).forEach(([id, origin]) => {
    const option = document.createElement("option");

    option.value = id;

    option.textContent = origin.label;

    filterOrigin.appendChild(option);
  });
}

function applyFilters() {
  const termo = searchInput.value.toLowerCase().trim();

  const tipo = filterType.value;

  const origem = filterOrigin.value;

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

  applySort();

  renderSkills(filteredSkills);
}

function applySort() {
  filteredSkills.sort((a, b) => {
    return a.nome.localeCompare(b.nome);
  });
}

/**
 * RENDER LISTA
 */
function renderSkills(lista) {
  skillsList.innerHTML = "";

  document.getElementById("skills-count").textContent =
    `Habilidades: ${lista.length}`;

  lista.forEach((skill) => {
    const tipoLabel = enums.skillActivationType[skill.tipo]?.label ?? skill.tipo;
    const origemLabel =
      enums.skillOrigin[skill.origem]?.label ?? skill.origem;

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

/**
 * EVENTOS
 */
function configurarEventos() {
  searchInput.addEventListener("input", applyFilters);

  filterType.addEventListener("change", applyFilters);

  filterOrigin.addEventListener("change", applyFilters);

  sortSelect.addEventListener("change", applyFilters);
}

/**
 * MODAL CONFIG
 */
function configurarModalSkill() {
  const skillModal = document.getElementById("skill-modal");

  const closeButton = document.getElementById("close-modal");

  if (!skillModal || !closeButton) {
    return;
  }

  closeButton.addEventListener("click", () => {
    fecharModalSkill();
  });

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
 * MODAL OPEN/CLOSE
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

/**
 * MODAL RENDER HELPERS
 */
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

/**
 * FORMATADORES
 */
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
