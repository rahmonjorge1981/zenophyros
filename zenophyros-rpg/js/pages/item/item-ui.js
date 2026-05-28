/** ------------------------------ RENDERS THE FILTERS ------------------------------ */

/** Preenche as <option> de cada <select> dinamicamente com base no ITEM_ENUMS */
function renderFilterOptions(filters) {
  appendOptions(filters.types, ITEM_ENUMS.type);
}

/** Populates the <option>s of a <select> based on a enumObject. <--------- EXTRACT THIS TO UTILS.JS LATER */
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

/** Render the item List */
function renderItems(itemsArray) {
  itemsList.innerHTML = "";

  const visibleItems = itemsArray.filter((item) => !item.metadata?.hidden);

  document.getElementById("items-count").textContent =
    `Itens: ${visibleItems.length}`;

  visibleItems
    .filter((item) => !item.metadata?.hidden)
    .forEach((item) => {
      itemsList.appendChild(renderItemCard(item));
    });
}

/** Render a item card. */
function renderItemCard(item) {

  const classLabel = getLabelFromEnum(ITEM_ENUMS.class, item.class);

  const card = document.createElement("article");

  card.className = "item-card";

  card.innerHTML = `
      <div class="item-top">
        <h2 class="item-name"> ${item.name} </h2>
      </div>

      <div class="item-meta">
        ${renderBadgeList(item.types, ITEM_ENUMS.type)}
        ${item.class ? `<span class="item-badge"> ${classLabel} </span>` : ""}
      </div>
    `;

  card.addEventListener("click", () => openModal(item));

  return card;
}

/** Helper para o renderItemCard. Cria vários <span "item-tag"> com base em uma lista 'items' e um 'enumMap'.
 *  -> Usa a a lista de strings 'items' para buscar as labels em 'enumMap'.
 */
function renderBadgeList(items, enumMap) {
  if (!items?.length) return "";

  return items
    .map((item) => {
      const label = getLabelFromEnum(enumMap, item);

      return `<span class="item-badge"> ${label} </span>`;
    })
    .join("");
}

/** ------------------------------ HANDLES OPEN/CLOSE OF THE MODAL ------------------------------ */

/** Opens the modal of an item on the list. */
function openModal(item, botaoOrigem = 0) {
  botaoItemAtual = botaoOrigem;

  const itemModal = document.getElementById("item-modal");

  if (!itemModal) {
    console.error("Modal de item não encontrado no HTML.");
    return;
  }

  renderModal(item);

  itemModal.classList.remove("hidden");
}

/** Adds the close event of the modal */
function addModalEvents() {
  const itemModal = document.getElementById("item-modal");
  const closeButton = document.getElementById("close-modal");

  if (!itemModal || !closeButton) {
    console.log("Item Modal or Close Button not found");
    return;
  }

  closeButton.addEventListener("click", () => {
    closeModal();
  });

  itemModal.addEventListener("click", (event) => {
    if (event.target === itemModal) {
      closeModal();
    }
  });
}

/** Closes the modal. */
function closeModal() {
  const itemModal = document.getElementById("item-modal");

  if (!itemModal) {
    console.log("No item modal found.");
    return;
  }

  itemModal.classList.add("hidden");
}

/** ------------------------------ RENDERS THE MODAL OF AN ITEM ------------------------------ */

/** Function that builds the modal of an item based on its content */
function renderModal(item) {
  // Item Name
  document.getElementById("item-name").textContent = item.name;

  // Estimated Value
  document.getElementById("item-value").textContent = item.estimatedValue;
}

/** Helper function for the renderModal. */
function formatRequirements(reqs) {}
