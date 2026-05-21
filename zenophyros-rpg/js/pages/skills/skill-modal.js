function renderModal(skill) {
  const classLabel = getLabelFromEnum(SKILL_ENUMS.class, skill.class);
  const originLabel = getLabelFromEnum(SKILL_ENUMS.origin, skill.origin);
  const schoolLabel = getLabelFromEnum(SKILL_ENUMS.school, skill.school);
  const activationLabel = getLabelFromEnum(
    SKILL_ENUMS.activation,
    skill.activation,
  );
  const speciesLabel = getLabelFromEnum(
    SKILL_ENUMS.species,
    skill.requirements?.species,
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

    ${renderSummary(skill)}
    ${renderRequirements(skill)}
    ${renderEffectDesc(skill)}
    ${renderCusto(skill)}
    ${renderTypes(skill)}

    ${renderId(skill)}
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
