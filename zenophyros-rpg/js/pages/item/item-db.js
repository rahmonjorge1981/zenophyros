window.ItemDB = (() => {
  const DATABASE_PATH = "./data/item-database.json";

  let database = {};
  let items = [];

  async function load() {
    const itemsData = await carregarJSON(DATABASE_PATH);

    validateDatabase(itemsData.items);

    database = itemsData.items;
    items = Object.values(database);
  }

  function validateDatabase(database) {
    const errors = [];

    for (const [itemId, item] of Object.entries(database)) {
      validateItemTypes(itemId, item, errors);
    }

    if (errors.length > 0) {
      throw new Error(`Database validation failed:\n\n${errors.join("\n")}`);
    }

    console.log(
      `Database validation successful. Items: ${Object.keys(database).length}`,
    );
    console.log(database);
  }

  function validateItemTypes(itemId, item, errors) {
    const validTypes = Array.isArray(item.types) && item.types.length > 0;

    if (!validTypes) {
      errors.push(`Item "${itemId}" has an invalid "types" field.`);
      return;
    }

    for (const type of item.types) {
      const isValidType = type in ITEM_ENUMS.type;

      if (!isValidType) {
        errors.push(`Item "${itemId}" has an invalid type: "${type}".`);
      }
    }
  }

  function getAll() {
    return items;
  }

  function getDatabase() {
    return database;
  }

  function searchById(itemId) {
    if (!itemId) {
      return null;
    }

    return database[itemId] || null;
  }

  function filter(filtersData) {}

  function sortByName(itemsArray) {
    return [...itemsArray].sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }

  return {
    load,
    getAll,
    getDatabase,
    searchById,
    filter,
    sortByName,
  };
})();
