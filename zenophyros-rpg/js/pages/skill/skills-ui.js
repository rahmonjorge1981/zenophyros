/** ------------------------------ RENDERS THE FILTERS ------------------------------ */

/** Preenche as <option> de cada <select> dinamicamente com base no SKILL_ENUMS */
function renderFilterOptions(filters) {
  appendOptions(filters.activation, SKILL_ENUMS.activation);
  appendOptions(filters.origin, SKILL_ENUMS.origin);
  appendOptions(filters.class, SKILL_ENUMS.class);
  appendOptions(filters.species, SKILL_ENUMS.species);
  appendOptions(filters.types, SKILL_ENUMS.type);
}

/** Populates the <option>s of a <select> based on a enumObject. */
function appendOptions(selectElement, enumObject) {
  if (enumObject == null) {
    console.error(
      "appendOptions: erro porque 'enumObject' veio null ou undefined.",
      { selectElement, enumObject },
    );
    return;
  }
  Object.entries(enumObject).forEach(([id, item]) => {
    const option = document.createElement("option");

    option.value = id;
    option.textContent = item.label;

    selectElement.appendChild(option);
  });
}

/** ------------------------------ RENDERS THE LIST OF CARDS ------------------------------ */

/** Render the skill List */
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

/** Render a skill card. */
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
        ${renderBadgeList(skill.types, SKILL_ENUMS.type)}
      </div>

      <p class="skill-summary"> ${skill.summary} </p>

      <div class="skill-tags">
        ${skill.origin ? `<span class="skill-tag"> ${originLabel} </span>` : ""}
        ${skill.school ? `<span class="skill-tag"> ${schoolLabel} </span>` : ""}
      </div>
    `;

  card.addEventListener("click", () => openModal(skill));

  return card;
}

/** ------------------------------ HANDLES OPEN/CLOSE OF THE MODAL ------------------------------ */

/** Opens the modal of an item on the list. */
function openModal(skill, botaoOrigem = 0) {
  botaoSkillAtual = botaoOrigem;

  const skillModal = document.getElementById("skill-modal");

  if (!skillModal) {
    console.error("Modal de skill não encontrado no HTML.");
    return;
  }

  fillModalBody(skill);

  skillModal.classList.remove("hidden");
}

/** Adds the close event of the modal */
function addModalEvents() {
  const skillModal = document.getElementById("skill-modal");
  const closeButton = document.getElementById("close-modal");

  if (!skillModal || !closeButton) {
    console.log("Skill Modal or Close Button not found")
    return;
  }

  closeButton.addEventListener("click", () => {
    closeModal();
  });

  skillModal.addEventListener("click", (event) => {
    if (event.target === skillModal) {
      closeModal();
    }
  });
}

/** Closes the modal. */
function closeModal() {
  const skillModal = document.getElementById("skill-modal");

  if (!skillModal) {
    console.log("No skill modal found.");
    return;
  }

  skillModal.classList.add("hidden");
}

/** ------------------------------ RENDERS THE MODAL OF AN ITEM ------------------------------ */

/** Function that builds the modal of an item based on its content */
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
  const hasCost = cost && (cost.life || cost.mana || cost.energy || cost.itens);
  document.getElementById("cost-section").hidden = !hasCost;
  document.getElementById("skill-cost").textContent = hasCost
    ? formatCost(cost)
    : "";

  // Skill Types
  const typesContainer = document.getElementById("skill-types");
  const types = skill.types || [];

  typesContainer.hidden = types.length === 0;
  typesContainer.innerHTML = types
    .map(
      (type) => `
      <span class="skill-badge">
        ${getLabelFromEnum(SKILL_ENUMS.type, type) || type}
      </span>
    `,
    )
    .join("");

  // Skill ID
  document.getElementById("skill-id").textContent = skill.id;
}

/** Helper function for the renderModal. */
function formatCost(custo) {
  if (!custo) {
    console.log("No cost object to format.");
    return null;
  }

  const linhas = [];

  if (custo.mana !== "" && custo.mana !== undefined && custo.mana !== null) {
    linhas.push(`Mana ${custo.mana}`);
  }

  if (custo.life !== "" && custo.life !== undefined && custo.life !== null) {
    linhas.push(`Vida ${custo.life}`);
  }

  if (
    custo.energy !== "" &&
    custo.energy !== undefined &&
    custo.energy !== null
  ) {
    linhas.push(`Energia ${custo.energy}`);
  }

  if (linhas.length === 0) {
    return "Nenhum";
  }

  return linhas.join(", ");
}

/** Helper function for the renderModal. */
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
