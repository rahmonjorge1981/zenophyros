function renderCabecalho(skill) {
  const tipoLabel = "tipoLabel"

  const origemLabel = "origemLabel"

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

  // NOVO: espécie
  if (preReq.especie && preReq.especie.length > 0) {
    const especiesFormatadas = preReq.especie
      .filter(Boolean)
      .join(", ");

    linhas.push(`Espécie: ${especiesFormatadas}`);
  }

  if (linhas.length === 0) {
    return "Nenhum";
  }

  return linhas.join(", ");
}