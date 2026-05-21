const skillsList = document.getElementById("skills-list");
const searchInput = document.getElementById("search-input");

const filters = {
  class: document.getElementById("filter-class"),
  species: document.getElementById("filter-species"),
  types: document.getElementById("filter-types"),
  activation: document.getElementById("filter-activation"),
  origin: document.getElementById("filter-origin"),
};

const SKILL_ENUMS = {
  class: {
    warrior: { label: "Guerreiro" },
    archer: { label: "Arqueiro" },
    wizard: { label: "Mago" },
    assassin: { label: "Assassino" },
    monk: { label: "Monge" },
    cleric: { label: "Clérigo" },
    ninja: { label: "Ninja" },
  },
  species: {
    human: { label: "Humano" },
    elf: { label: "Elfo" },
    celenite: { label: "Celenita" },
    ullum: { label: "Ullum" },
    abazon: { label: "Abazon" },
  },
  activation: {
    passive: { label: "Passiva" },
    active: { label: "Ativa" },
    reactive: { label: "Reativa " },
  },
  context: {
    in_combat: { label: "Em Combate" },
    out_of_combat: { label: "Fora de Combate" },
    both: { label: "Ambos" }
  },
  types: {
    damage: { label: "Dano" },
    buff: { label: "Aprimoramento" },
    control: { label: "Controle" },
    summon: { label: "Invocação" },
    fate: { label: "Destino" },
    progression: { label: "Progressão" },
    effect: { label: "Efeito" },
  },
  origin: {
    magic: { label: "Magia" },
    technique: { label: "Técnica" },
    prayer: { label: "Prece" },
    innate: { label: "Inata" },
  },
  school: {

  },
};

const DATABASE_PATH = "./data/skill-database.json";

window.skillDatabase = {};

let skills = [];
let filteredSkills = [];
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

async function init() {
  console.log("skills-page.js -> init() running");
  await loadSkills();

  addModalEvents();

  skills = Object.values(window.skillDatabase);
  console.log(skills);

  if (!filters.class) {
    console.log("No filter objects found");
    return;
  }

  filteredSkills = [...skills];

  renderFilterOptions();

  applySort();
  renderSkills(filteredSkills);
  addAllEventListeners();
}

/**
 * Modal Events
 */
function addModalEvents() {
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

/**
 * Aplica os filtros na lista de habilidades.
 */
function applyFilters() {
  const query = searchInput.value.toLowerCase().trim();
  const skillClass = filters.class.value;
  const species = filters.species.value;
  const types = filters.types.value;
  const activation = filters.activation.value;
  const origin = filters.origin.value;

  filteredSkills = skills.filter((skill) => {
    // CHECKS QUERY
    const matchName = (skill.name || "").toLowerCase().includes(query);
    const matchSummary = (skill.summary || "").toLowerCase().includes(query);

    const matchTags =
      skill.tags?.some((tag) => tag.toLowerCase().includes(query)) ?? false;

    const matchQuery = !query || matchName || matchSummary || matchTags; // !query -> true if query is empty

    // CHECKS FILTERS
    const matchClass = !skillClass || skill.class === skillClass;
    const matchSpecies = !species || skill.requirements?.species.includes(species);
    const matchActivation = !activation || skill.activation === activation;
    const matchOrigin = !origin || skill.origin === origin;
    const matchTypes = !types || skill.types?.includes(types);

    return (
      matchQuery &&
      matchClass &&
      matchSpecies &&
      matchActivation &&
      matchOrigin &&
      matchTypes
    );
  });

  applySort();
  renderSkills(filteredSkills);
}

function applySort() {
  filteredSkills.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
}

function addAllEventListeners() {
  searchInput.addEventListener("input", applyFilters);

  Object.values(filters).forEach((filter) => {
    filter.addEventListener("change", applyFilters);
  });
}

// Este botão só existe em character-sheet-page.html. Dá problema em skills-page.html.
const removeSkillBtn = document.getElementById("btn-remover-skill");

if (removeSkillBtn) {
  removeSkillBtn.addEventListener("click", () => {
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

  modalBody.innerHTML = renderModal(skill);

  skillModal.classList.remove("hidden");
}

function fecharModalSkill() {
  const skillModal = document.getElementById("skill-modal");

  if (!skillModal) {
    return;
  }

  skillModal.classList.add("hidden");
}

/** -------------------------------------------------- MAIN RENDERS --------------------------------------------------*/

/** Preenche as <option> de cada <select> dinamicamente com base no SKILL_ENUMS */
function renderFilterOptions() {
  appendOptions(filters.activation, SKILL_ENUMS.activation);
  appendOptions(filters.origin, SKILL_ENUMS.origin);
  appendOptions(filters.class, SKILL_ENUMS.class);
  appendOptions(filters.species, SKILL_ENUMS.species);
  appendOptions(filters.types, SKILL_ENUMS.types);
}

/** RENDERIZAR LISTA DE SKILLS */
function renderSkills(skillsArray) {
  skillsList.innerHTML = "";

  const visibleSkills = skillsArray.filter((skill) => !skill.metadata?.hidden);

  document.getElementById("skills-count").textContent =
    `Habilidades: ${visibleSkills.length}`;

  visibleSkills
    .filter((skill) => !skill.metadata.hidden)
    .forEach((skill) => {
      skillsList.appendChild(renderSkillCard(skill));
    });
}

function renderSkillCard(skill) {
  const classLabel = getLabelFromEnum(SKILL_ENUMS.class, skill.class);
  const speciesLabel = getLabelFromEnum(SKILL_ENUMS.species, skill.requirements?.species);
  const originLabel = getLabelFromEnum(SKILL_ENUMS.origin, skill.origin);
  const schoolLabel = getLabelFromEnum(SKILL_ENUMS.school, skill.school);
  const activationLabel = getLabelFromEnum(
    SKILL_ENUMS.activation,
    skill.activation,
  );

  const card = document.createElement("article");

  card.className = "skill-card";

  card.innerHTML = `
      <div class="skill-top">
        <h2 class="skill-name"> ${skill.name} </h2>
      </div>

      <div class="skill-meta">
        ${skill.requirements?.species ? `<span class="skill-badge"> ${speciesLabel} </span>` : ""}
        ${skill.class ? `<span class="skill-badge"> ${classLabel} </span>` : ""}
        ${skill.activation ? `<span class="skill-badge"> ${activationLabel} </span>` : ""}
        ${renderBadgeList(skill.types, SKILL_ENUMS.types)}
      </div>

      <p class="skill-summary"> ${skill.summary} </p>

      <div class="skill-tags">
        ${skill.origin ? `<span class="skill-tag"> ${originLabel} </span>` : ""}
        ${skill.school ? `<span class="skill-tag"> ${schoolLabel} </span>` : ""}
      </div>
    `;

  card.addEventListener("click", () => abrirModalSkill(skill));

  return card;
}

function renderModal(skill) {
  return `
    ${renderHeader(skill)}

    ${renderSummary(skill)}
    ${renderRequirements(skill)}
    ${renderEffectDesc(skill)}
    ${renderCusto(skill)}
    ${renderTypes(skill)}

    ${renderId(skill)}
  `;
}

function renderHeader(skill) {
  const classLabel = getLabelFromEnum(SKILL_ENUMS.class, skill.class);
  const speciesLabel = getLabelFromEnum(SKILL_ENUMS.species, skill.requirements?.species);
  const originLabel = getLabelFromEnum(SKILL_ENUMS.origin, skill.origin);
  const schoolLabel = getLabelFromEnum(SKILL_ENUMS.school, skill.school);
  const activationLabel = getLabelFromEnum(
    SKILL_ENUMS.activation,
    skill.activation,
  );

  return `
    <h2> ${skill.name} </h2>

    <div class="modal-badges">
      ${skill.requirements?.species ? `<span class="skill-badge">${speciesLabel}</span>` : ""}
      ${skill.class ? `<span class="skill-badge">${classLabel}</span>` : ""}
      ${skill.activation ? `<span class="skill-badge">${activationLabel}</span>` : ""}
      

      ${skill.origin ? `<span class="skill-tag">${originLabel}</span>` : ""}
      ${skill.school ? `<span class="skill-tag">${schoolLabel}</span>` : ""}
    </div>
  `;
}

function renderTypes(skill) {
  return `
    <div class="modal-section">
      <h3>Tipos</h3>

      <div class="modal-badges">
        ${renderBadgeList(skill.types, SKILL_ENUMS.types)}
      </div>
    </div>
  `;
}

/** Helper para o renderHeader. Cria vários <span "skill-tag"> com base em uma lista 'items' e um 'enumMap'.
 *  -> Usa a a lista de strings 'items' para buscar as labels em 'enumMap'.
 */
function renderBadgeList(items, enumMap) {
  if (!items?.length) return "";

  return items
    .map((item) => {
      const label = getLabelFromEnum(enumMap, item);

      return `<span class="skill-badge"> ${label} </span>`;
    })
    .join("");
}

function renderSummary(skill) {
  return `
    <div class="modal-section">
      <h3>Resumo</h3>
      <p> ${skill.summary} </p>
    </div>
  `;
}

function renderRequirements(skill) {
  if (!skill.requirements) {
    return "";
  }
  return `
    <div class="modal-section">
      <h3>Pré-Requisitos</h3>
      <div class="modal-box"> ${formatRequirements(skill.requirements)} </div>
    </div>
  `;
}

function renderEffectDesc(skill) {
  return `
    <div class="modal-section">
      <h3>Efeito</h3>
      <p>${skill.desc}</p>
    </div>

    ${
      skill.critical
        ? `
      <div class="modal-section">
        <h3>Crítico</h3>
        <p>${skill.critical}</p>
      </div>
    `
        : ""
    }
  `;
}

function renderRolagens(skill) {
  const rolagensValidas = (skill.mechanics.rolagens || []).filter(
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
  const alcance = skill.mechanics.alcance;

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
  const area = skill.mechanics.area;

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
        ${formatArea(area)}
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
      ID: <code>${skill.id}</code>
    </div>
  `;
}

function formatArea(area) {
  if (!area) {
    return;
  }

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

function formatRequirements(reqs) {
  if (!reqs) {
    return;
  }

  console.log(reqs);

  const linhas = [];

  if (reqs.attributes) {
    Object.entries(reqs.attributes).forEach(([atributo, valor]) => {
      if (valor > 0) {
        linhas.push(`${atributo.toUpperCase()} ${valor}`);
      }
    });
  }

  if (reqs.niveis && reqs.niveis.personagem) {
    linhas.push(`Nível ${reqs.niveis.personagem}`);
  }

  if (reqs.habilidades && reqs.habilidades.length > 0) {
    linhas.push(...reqs.habilidades);
  }

  if (linhas.length === 0) {
    return "Nenhum";
  }

  return linhas.join(", ");
}

/** ---------------------------------------- HELPERS FOR THE RENDERS ----------------------------------------*/

/** Populates the <option>s of a <select> based on a enumObject. */
function appendOptions(selectElement, enumObject) {
  Object.entries(enumObject).forEach(([id, item]) => {
    const option = document.createElement("option");

    option.value = id;
    option.textContent = item.label;

    selectElement.appendChild(option);
  });
}

init();
