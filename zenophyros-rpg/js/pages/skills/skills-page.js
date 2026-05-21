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
    both: { label: "Ambos" },
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
    martial_magic: { label: "Magia Marcial" },
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
  // console.log(skills);

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
    const matchSpecies =
      !species || skill.requirements?.species?.includes(species);
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

function abrirModalSkill(skill, botaoOrigem = 0) {
  botaoSkillAtual = botaoOrigem;

  const skillModal = document.getElementById("skill-modal");

  if (!skillModal) {
    console.error("Modal de skill não encontrado no HTML.");
    return;
  }

  fillModalBody(skill);

  //modalBody.innerHTML = renderModal(skill);

  skillModal.classList.remove("hidden");
}

function fillModalBody(skill) {
  // Skill Name
  document.getElementById("skill-name").textContent = skill.name;

  // Skill Species (optional)
  const speciesBadge = document.getElementById("species-badge");
  const species = skill.requirements?.species;
  speciesBadge.hidden = !species;
  speciesBadge.textContent =
    getLabelFromEnum(SKILL_ENUMS.species, skill.requirements?.species) || "";

  // Skill Class (optional)
  const classBadge = document.getElementById("class-badge");
  const skillClass = skill.class;
  classBadge.hidden = !skillClass;
  classBadge.textContent =
    getLabelFromEnum(SKILL_ENUMS.class, skill.class) || "";

  // Skill Activation
  document.getElementById("activation-badge").textContent = getLabelFromEnum(
    SKILL_ENUMS.activation,
    skill.activation,
  );

  // Skill Origin
  document.getElementById("origin-tag").textContent = getLabelFromEnum(
    SKILL_ENUMS.origin,
    skill.origin,
  );

  // Skill School (optional)
  const schoolBadge = document.getElementById("school-tag");
  const school = skill.school;
  schoolBadge.hidden = !school;
  schoolBadge.textContent = getLabelFromEnum(SKILL_ENUMS.school, school) || "";

  // Skill Summary
  document.getElementById("skill-summary").textContent = skill.summary;

  // Skill Requirements (optional)
  const r = skill.requirements;
  const hasRequirements =
    r && (r.species || r.attributes || r.niveis || r.habilidades);
  document.getElementById("requirements-section").hidden = !hasRequirements;
  document.getElementById("skill-requirements").textContent = hasRequirements
    ? formatRequirements(r)
    : "";

  // Skill Description
  document.getElementById("skill-desc").textContent = skill.desc;

  // Skill Critical (optional)
  const critical = skill.critical;
  document.getElementById("critical-section").hidden = !critical;
  document.getElementById("skill-critical").textContent = critical || "";

  // Skill Cost (optional)
  const cost = skill.cost;
  const hasCost = cost && (c.life || c.mana || c.energy || c.itens);
  document.getElementById("cost-section").hidden = !hasCost;
  document.getElementById("skill-cost").textContent = hasCost
    ? formatCost(cost)
    : "";

  // Skill ID
  document.getElementById("skill-id").textContent = skill.id;
}

// Transforma o objeto 'requirements' em uma string csv.
function formatRequirements(reqs) {
  if (!reqs) {
    console.log("No requirements object to format.");
    return null;
  }

  const linhas = [];

  if (reqs.species && reqs.species.length > 0) {
    linhas.push(getLabelFromEnum(SKILL_ENUMS.species, reqs.species));
  }

  if (reqs.attributes) {
    Object.entries(reqs.attributes).forEach(([atributo, valor]) => {
      linhas.push(`${atributo.toUpperCase()} ${valor}`);
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

function formatCost(custo) {
  if (!custo) {
    console.log("No cost object to format.");
    return null;
  }

  const linhas = [];

  if (custo.mana !== "" && custo.mana !== undefined && custo.mana !== null) {
    linhas.push(`Mana ${custo.mana}`);
  }

  if (custo.vida !== "" && custo.vida !== undefined && custo.vida !== null) {
    linhas.push(`Vida ${custo.vida}`);
  }

  if (
    custo.energia !== "" &&
    custo.energia !== undefined &&
    custo.energia !== null
  ) {
    linhas.push(`Energia ${custo.energia}`);
  }

  if (linhas.length === 0) {
    return "Nenhum";
  }

  return linhas.join(", ");
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
  const speciesLabel = getLabelFromEnum(
    SKILL_ENUMS.species,
    skill.requirements?.species,
  );
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
