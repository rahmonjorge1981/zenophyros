const itemsList = document.getElementById("items-list");
const searchInput = document.getElementById("search-input");

const filters = {
  types: document.getElementById("filter-types"),
  class: document.getElementById("filter-class"),
};

let filteredItems = [];

async function init() {
  await ItemDB.load();
  addModalEvents();

  filteredItems = ItemDB.getAll();

  renderFilterOptions(filters);
  updateItems();
  addAllEventListeners();
}

/** Atualiza a lista de items com base nos filtros. */
function updateItems() {
  const filtersData = {
    query: searchInput.value.toLowerCase().trim(),
    itemClass: filters.class.value,
    types: filters.types.value,
  };

  filteredItems = ItemDB.filter(filtersData);
  filteredItems = ItemDB.sortByName(filteredItems);

  renderItems(filteredItems);
}

/** Adiciona os EL da busca e filtros. */
function addAllEventListeners() {
  searchInput.addEventListener("input", updateItems);

  Object.values(filters).forEach((filter) => {
    filter.addEventListener("change", updateItems);
  });
}

init();