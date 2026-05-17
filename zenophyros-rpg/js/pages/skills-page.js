const skillsList = document.getElementById("skills-list");

const searchInput = document.getElementById("search-input");

const filterTipo = document.getElementById("filter-tipo");

const filterOrigem = document.getElementById("filter-origem");

const sortSelect = document.getElementById("sort-select");

const enums = {
  tiposHabilidade: {
    // exemplo
    ataque: { label: "Ataque" },
    defesa: { label: "Defesa" }
  },
  origensHabilidade: {
    // exemplo
    fisica: { label: "Física" },
    magica: { label: "Mágica" }
  }
};

let skills = [];

let filteredSkills = [];

async function init() {
  await carregarSkills();

  configurarModalSkill();

  skills = Object.values(window.skillDatabase);

  filteredSkills = [...skills];

  preencherFiltros();
  aplicarOrdenacao();
  renderSkills(filteredSkills);
  configurarEventos();
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
    const origemLabel = enums.origensHabilidade[skill.origem]?.label ?? skill.origem;

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

init();
