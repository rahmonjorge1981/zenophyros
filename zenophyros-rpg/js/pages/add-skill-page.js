const output = document.getElementById("output");
const generateButton = document.getElementById("generate-button");
const copyButton = document.getElementById("copy-button");

let enums = {};


function validateSkill() {
  
}

/* =========================
   INIT / BOOTSTRAP
========================= */

async function init() {
  enums = await carregarJSON("./data/config/enums.json");

  preencherSelect("tipo", enums.tiposHabilidade);
  preencherSelect("origem", enums.origensHabilidade);
}

/* =========================
   HELPERS UI
========================= */

function preencherSelect(id, dados) {
  const select = document.getElementById(id);

  Object.entries(dados).forEach(([key, value]) => {
    const option = document.createElement("option");

    option.value = key;
    option.textContent = value.label;

    select.appendChild(option);
  });
}

/* =========================
   CORE LOGIC - SKILL GENERATION
========================= */

function gerarSkill() {
  const areaTipo = document.getElementById("area-tipo").value;

  let area = {
    tipo: areaTipo,
  };

  if (areaTipo === "QUADRADO") {
    area.largura = parseInt(document.getElementById("area-largura").value);
    area.altura = parseInt(document.getElementById("area-altura").value);
  }

  if (areaTipo === "RETANGULO") {
    area.largura = parseInt(document.getElementById("area-largura").value);
    area.altura = parseInt(document.getElementById("area-altura").value);
  }

  if (areaTipo === "CONE") {
    area.comprimento = parseInt(document.getElementById("area-cone").value);
  }

  const skill = {
    id: document.getElementById("id").value,
    nome: document.getElementById("nome").value,
    nivel: parseInt(document.getElementById("nivel").value),

    tipo: document.getElementById("tipo").value,
    origem: document.getElementById("origem").value,
    escola: document.getElementById("escola").value,
    descricao: document.getElementById("descricao").value,

    preRequisitos: {
      atributos: {
        for: parseInt(document.getElementById("req-for").value),
        des: parseInt(document.getElementById("req-des").value),
        agi: parseInt(document.getElementById("req-agi").value),
        vit: parseInt(document.getElementById("req-vit").value),
        rac: parseInt(document.getElementById("req-rac").value),
        ins: parseInt(document.getElementById("req-ins").value),
        san: parseInt(document.getElementById("req-san").value),
        aur: parseInt(document.getElementById("req-aur").value),
      },

      habilidades: [],

      niveis: {
        personagem: parseInt(document.getElementById("req-personagem").value),
      },

      especie: document
        .getElementById("req-especie")
        .value.split(",")
        .map((especie) => especie.trim().toUpperCase())
        .filter(Boolean),
    },

    efeito: {
      texto: document.getElementById("efeito-texto").value,

      rolagens: [
        {
          tipo: document.getElementById("rolagem-tipo").value,
          formula: document.getElementById("formula").value,
        },
      ],

      alcance: {
        tipo: document.getElementById("alcance-tipo").value,
        distancia: parseInt(document.getElementById("alcance-distancia").value),
      },

      area,
      duracao: 0,
    },

    custo: {
      mana: parseInt(document.getElementById("mana").value),
      vida: parseInt(document.getElementById("vida").value),
      energia: parseInt(document.getElementById("energia").value),
    },

    tags: document
      .getElementById("tags")
      .value.split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),

    metadata: {
      versao: 1,
      beta: true,
      oculta: false,
    },
  };

  if (!skill.id.trim()) {
    alert("O ID da habilidade é obrigatório.");
    return;
  }

  output.value = `"${skill.id}": ${JSON.stringify(skill, null, 2)}`;
}

/* =========================
   EVENTS
========================= */

generateButton.addEventListener("click", gerarSkill);

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(output.value);
});

/* =========================
   BOOT
========================= */

init();