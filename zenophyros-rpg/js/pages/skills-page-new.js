const skillsList = document.getElementById("skills-list");
const searchInput = document.getElementById("search-input");

let filteredSkills = [];

async function init() {
  await SkillsDB.load();

  addModalEvents();

  filteredSkills = SkillsDB.getAll();

  renderFilterOptions();

  updateSkills();

  addAllEventListeners();
}

function updateSkills() {
  const filtersData = {
    query: searchInput.value.toLowerCase().trim(),
    skillClass: filters.class.value,
    species: filters.species.value,
    types: filters.types.value,
    activation: filters.activation.value,
    origin: filters.origin.value,
  };

  filteredSkills = SkillsDB.filter(filtersData);

  filteredSkills = SkillsDB.sortByName(filteredSkills);

  renderSkills(filteredSkills);
}

function addAllEventListeners() {
  searchInput.addEventListener("input", updateSkills);

  Object.values(filters).forEach((filter) => {
    filter.addEventListener("change", updateSkills);
  });
}

init();