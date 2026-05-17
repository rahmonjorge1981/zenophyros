/**
 * Sistema reutilizável de habilidades.
 */

const DATABASE_PATH = "./data/skills-database.json"

window.skillDatabase = {};
window.enumsDatabase = {};

let botaoSkillAtual = null;

/**
 * Carrega banco de habilidades.
 */
async function carregarSkills() {
  window.enumsDatabase =
    await carregarJSON("./data/config/enums.json");

  const skillsData =
    await carregarJSON(DATABASE_PATH);

  window.skillDatabase = skillsData.habilidades;
}

/**
 * Busca habilidade pelo ID.
 */
function buscarSkillPorId(skillId) {
  if (!skillId) {
    return null;
  }

  return window.skillDatabase[skillId] || null;
}

function configurarModalSkill() {

  const skillModal =
    document.getElementById("skill-modal");

  const closeButton = document.getElementById("close-modal");

  if (!skillModal || !closeButton) {
    return;
  }

  closeButton.addEventListener("click", () => {
    fecharModalSkill();
  });

  // Fecha clicando fora
  skillModal.addEventListener("click", (event) => {
    if (event.target === skillModal) {
      fecharModalSkill();
    }
  });
}

const btnRemoverSkill = document.getElementById("btn-remover-skill");

btnRemoverSkill.addEventListener("click", () => {

  if (!botaoSkillAtual) {
    return;
  }

  const confirmar =
    confirm("Remover habilidade?");

  if (!confirmar) {
    return;
  }

  const index =
    Array.from(
      document.querySelectorAll(".botao-habilidade")
    ).indexOf(botaoSkillAtual);

  botaoSkillAtual.dataset.skillId = "";

  botaoSkillAtual.textContent = "(vazio)";

  salvarLocal();
  fecharModalSkill();

});

/**
 * Abre popup/modal da habilidade.
 */
function abrirModalSkill(skill, botaoOrigem = 0) {

  botaoSkillAtual = botaoOrigem;

  const skillModal =
    document.getElementById("skill-modal");

  const modalBody =
    document.getElementById("modal-body");

  if (!skillModal || !modalBody) {
    console.error(
      "Modal de skill não encontrado no HTML.",
    );

    return;
  }

  modalBody.innerHTML = `
    ${renderCabecalho(skill)}
    ${renderDescricao(skill)}
    ${renderPreRequisitos(skill)}
    ${renderEfeito(skill)}
    ${renderRolagens(skill)}
    ${renderAlcance(skill)}
    ${renderArea(skill)}
    ${renderCusto(skill)}
    ${renderTags(skill)}
    ${renderId(skill)}
  `;

  skillModal.classList.remove("hidden");
}

function fecharModalSkill() {

  const skillModal =
    document.getElementById("skill-modal");

  if (!skillModal) {
    return;
  }

  skillModal.classList.add("hidden");
}