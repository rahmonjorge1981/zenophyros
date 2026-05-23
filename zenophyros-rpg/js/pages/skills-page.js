const skillsList = document.getElementById("skills-list");
const searchInput = document.getElementById("search-input");

const filters = {
  class: document.getElementById("filter-class"),
  species: document.getElementById("filter-species"),
  types: document.getElementById("filter-types"),
  activation: document.getElementById("filter-activation"),
  origin: document.getElementById("filter-origin"),
};

let filteredSkills = [];

async function init() {
  await SkillDB.load();
  addModalEvents();

  filteredSkills = SkillDB.getAll();

  renderFilterOptions(filters);
  updateSkills();
  addAllEventListeners();
}

/** Atualiza a lista de skills com base nos filtros. */
function updateSkills() {
  const filtersData = {
    query: searchInput.value.toLowerCase().trim(),
    skillClass: filters.class.value,
    species: filters.species.value,
    types: filters.types.value,
    activation: filters.activation.value,
    origin: filters.origin.value,
  };

  filteredSkills = SkillDB.filter(filtersData);
  filteredSkills = SkillDB.sortByName(filteredSkills);

  renderSkills(filteredSkills);
}

/** Adiciona os EL da busca e filtros. */
function addAllEventListeners() {
  searchInput.addEventListener("input", updateSkills);

  Object.values(filters).forEach((filter) => {
    filter.addEventListener("change", updateSkills);
  });
}

init();