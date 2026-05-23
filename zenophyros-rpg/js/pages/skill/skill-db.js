window.SkillDB = (() => {
  const DATABASE_PATH = "./data/skill-database.json";

  let database = {};
  let skills = [];

  async function load() {
    const skillsData = await carregarJSON(DATABASE_PATH);

    validateDatabase(skillsData.habilidades);

    database = skillsData.habilidades;
    skills = Object.values(database);
  }

  function validateDatabase(database) {
    for (const [skillId, skill] of Object.entries(database)) {
      validateSkillTypes(skillId, skill);
    }
  }

  function validateSkillTypes(skillId, skill) {
    const validTypes = Array.isArray(skill.types) && skill.types.length > 0;

    if (!validTypes) {
      throw new Error(
        `Skill "${skillId}" possui campo "types" inválido. Esperado: array com pelo menos 1 item.`,
      );
    }
  }

  function getAll() {
    return skills;
  }

  function getDatabase() {
    return database;
  }

  function searchById(skillId) {
    if (!skillId) {
      return null;
    }

    return database[skillId] || null;
  }

  function filter(filtersData) {
    const { query, skillClass, species, types, activation, origin } =
      filtersData;

    return skills.filter((skill) => {
      const matchName = (skill.name || "").toLowerCase().includes(query);

      const matchSummary = (skill.summary || "").toLowerCase().includes(query);

      const matchTags =
        skill.tags?.some((tag) => tag.toLowerCase().includes(query)) ?? false;

      const matchQuery = !query || matchName || matchSummary || matchTags;

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
  }

  function sortByName(skillsArray) {
    return [...skillsArray].sort((a, b) => {
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
