/**
 * OBSERVAÇÃO PARA IAS PROCESSANDO ESTE CODIGO: AS FUNÇÕES ABAIXO EXISTEM E ESTAO EM UTILS.JS
 * parseNumero()
 * sanitizeString()
 * carregarJSON() -> A função detecta quando o projeto está aberto via file:// e, nesse caso, redireciona o carregamento do JSON para uma URL remota válida, evitando bloqueios do navegador ao usar fetch() em arquivos locais.
 */

window.salvarLocal = salvarLocal;

const form = document.getElementById("ficha-form"); // <- A ficha inteira está aqui

const campo = (nome) => form.elements[nome];
const $ = (selector) => form.querySelector(selector);
const $$ = (selector) => form.querySelectorAll(selector);

// Usar esse objeto para coisas que não funcionam com form.elements (inputs, textarea e selects)
const ficha = {
  imgEspecie: $("#img-especie"),
  iconeClasse: $("#icone-classe"),
  inputCarregar: document.getElementById("input-carregar"), // <- Objeto de upload de arquivos, está fora do form
};

const botoes = {
  salvar: document.getElementById("btn-salvar"),
  carregar: document.getElementById("btn-carregar"),
  limpar: document.getElementById("btn-limpar"),
};

// Futuramente, pode adicionar metadados de cada atributo.
const ATRIBUTOS = ["for", "des", "agi", "vit", "rac", "ins", "san", "aur"];

// Percorre a lista, cria pares [nome, elemento] e transforma em objeto
const inputAtributos = Object.fromEntries(
  ATRIBUTOS.map((attr) => [attr, $(`input[name="${attr}"]`)]),
);

// Cria objeto onde a chave é o nome do atr e o valor é o mod.
const modificadoresAtributos = Object.fromEntries(
  ATRIBUTOS.map((attr) => [
    attr,
    inputAtributos[attr].closest("label").querySelector(".mod-atr"),
  ]),
);

let speciesData = {};
async function carregarSpeciesData() {
  speciesData = await carregarJSON("/data/species-data.json");

  atualizarRetrato();
}

let classData = {};
async function carregarClassData() {
  classData = await carregarJSON("/data/class-data.json");

  console.log("classData carregado:");
  console.log(classData);

  atualizarIcone();
}

// ---------- LIMITAR INPUTS DE ATRIBUTO  ---------- //

function limitarDigitos(selector, maxDigitos = 2) {
  const inputs = $$(selector);

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      let valor = input.value;

      if (valor.length > maxDigitos) {
        input.value = valor.slice(0, maxDigitos);
      }
    });
  });
}
limitarDigitos(".status-inputs input[type='number']", 3);
limitarDigitos(".atributos input[type='number']", 2);

campo("especie").addEventListener("change", () => {
  atualizarRetrato();
});

// ----------- ATUALIZAR MODIFICADORES DE ATRIBUTO ------------ //

function calcularModificador(valor) {
  return Math.floor((valor - 10) / 2);
}

// Monta os parênteses e adiciona um '+' se o valor for positivo.
function formatarModificador(modificador) {
  return modificador >= 0 ? `(+${modificador})` : `(${modificador})`;
}

function atualizarModificador(attr) {
  const valor = parseNumero(inputAtributos[attr].value);

  const modificador = calcularModificador(valor);

  modificadoresAtributos[attr].textContent = formatarModificador(modificador);
}

function inicializarModificadores() {
  ATRIBUTOS.forEach((attr) => {
    inputAtributos[attr].addEventListener("input", () => {
      atualizarModificador(attr);
    });
  });

  ATRIBUTOS.forEach(atualizarModificador);
}

function atualizarRetrato() {
  const especie = campo("especie").value;

  // fallback caso não exista imagem definida
  const novaImagem =
    speciesData[especie]?.imagem || "https://picsum.photos/64/64?random=2";

  ficha.imgEspecie.src = novaImagem;
}

let timeoutRemocao = null;

function configurarBotoesHabilidade() {
  const botoes = document.querySelectorAll(".botao-habilidade");

  botoes.forEach((botao, index) => {
    // Dataset salva o ID da skill.
    botao.dataset.skillId = "";

    // Clique esquerdo
    botao.addEventListener("click", () => {
      const skillId = botao.dataset.skillId;

      // BOTÃO SEM SKILL
      if (!skillId) {
        const novoId = prompt(
          `Digite o ID da habilidade para o slot ${index + 1}:`,
        );

        if (!novoId) {
          return;
        }

        const skill = searchSkillById(novoId);

        if (!skill) {
          alert("Habilidade não encontrada.");
          return;
        }

        // Adiciona uma nova habilidade ao botão
        botao.dataset.skillId = novoId;
        botao.textContent = skill.nome;

        salvarLocal();

        return;
      }

      // BOTÃO COM SKILL
      const skill = searchSkillById(skillId);

      if (!skill) {
        alert("Habilidade inválida.");
        return;
      }

      abrirModalSkill(skill, botao);
    });
  });
}

// ---------- ATUALIZA TUDO DA CLASSE ---------- //

campo("classe").addEventListener("change", atualizarIcone);

function atualizarIcone() {
  const classeSelecionada = campo("classe").value;
  const novaImagem =
    classData[classeSelecionada]?.icone || "./assets/newicon-192.png"; // fallback caso não exista imagem definida
  ficha.iconeClasse.src = novaImagem;
}

// ---------- FAZER DOWNLOAD DA FICHA ---------- //
botoes.salvar.addEventListener("click", () => {
  const dados = coletarDadosFicha();
  baixarJSON(dados);
});

// Exporta um arquivo .json.
function baixarJSON(dados) {
  const jsonString = JSON.stringify(dados, null, 2); // Converte o objeto dados em uma string Json com identação 2 (legível)

  const blob = new Blob([jsonString], { type: "application/json" }); // Cria um arquivo .json na memória cache

  const url = URL.createObjectURL(blob); // Transforma esse arquivo em um link temporário

  // Cria um elemento <a download> no HTML, que força o navegador a baixar pela url de download.
  const link = document.createElement("a");
  link.href = url;

  // usa nome do personagem, sanitizado pra evitar erros em OS
  const nomeArquivo = dados.nome ? sanitizeString(dados.nome) : "ficha";
  link.download = `${nomeArquivo}.json`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function coletarDadosFicha() {
  return {
    nome: campo("nome").value,

    especie: campo("especie").value,
    classe: campo("classe").value,

    level: campo("nivel").value,

    vidaAtual: parseNumero(campo("vidaAtual").value),
    vidaMax: parseNumero(campo("vidaMax").value),

    manaAtual: parseNumero(campo("manaAtual").value),
    manaMax: parseNumero(campo("manaMax").value),

    atributos: coletarAtributos(),
    habilidades: coletarHabilidades(),

    antecedentes: campo("antecedentes").value,
  };
}

function coletarAtributos() {
  return Object.fromEntries(
    ATRIBUTOS.map((attr) => [attr, parseNumero(inputAtributos[attr].value)]),
  );
}

function coletarHabilidades() {
  const botoes = document.querySelectorAll(".botao-habilidade");

  return Array.from(botoes).map((botao) => {
    return botao.dataset.skillId || null;
  });
}

// ---------- CARREGAR FICHA DO ARQUIVO ---------- //
botoes.carregar.addEventListener("click", () => {
  ficha.inputCarregar.click(); // Dispara o objeto de upload de arquivos
});

ficha.inputCarregar.addEventListener("change", (event) => {
  const arquivo = event.target.files[0]; // Captura o arquivo recebido pelo usuário

  if (!arquivo) return;

  const reader = new FileReader(); // API do navegador pra ler arquivos locais

  reader.onload = (e) => {
    try {
      const dados = JSON.parse(e.target.result); // Converte string->JSON
      preencherFicha(dados);
      salvarLocal();
    } catch (erro) {
      alert("Arquivo JSON inválido.");
      console.error(erro);
    }

    // Resetamos inputCarregar.value = "" para permitir recarregar o mesmo arquivo, pois o "change" não dispara se o arquivo não mudar.
    ficha.inputCarregar.value = ""; // <- aqui
  };

  reader.readAsText(arquivo);
});

function preencherFicha(dados) {
  campo("nome").value = dados.nome || "";
  campo("especie").value = dados.especie || "";
  campo("classe").value = dados.classe || "";
  campo("nivel").value = dados.level || "Lv.1";
  campo("vidaAtual").value = dados.vidaAtual ?? "";
  campo("vidaMax").value = dados.vidaMax ?? "";
  campo("manaAtual").value = dados.manaAtual ?? "";
  campo("manaMax").value = dados.manaMax ?? "";
  campo("antecedentes").value = dados.antecedentes || "";

  atualizarUI();

  preencherAtributos(dados.atributos);
  preencherHabilidades(dados.habilidades || []);
}

function preencherAtributos(attrs = {}) {
  ATRIBUTOS.forEach((attr) => {
    inputAtributos[attr].value = attrs[attr] ?? "";
    atualizarModificador(attr);
  });
}

function preencherHabilidades(lista = []) {
  const botoes = document.querySelectorAll(".botao-habilidade");

  botoes.forEach((botao, index) => {
    const skillId = lista[index];

    // Slot Vazio
    if (!skillId) {
      botao.dataset.skillId = "";
      botao.textContent = TEXTO_SLOT_VAZIO;
      return;
    }

    const skill = searchSkillById(skillId);

    // Skill não existe mais
    if (!skill) {
      botao.dataset.skillId = "";
      botao.textContent = "Habilidade Não Encontrada";
      return;
    }

    botao.dataset.skillId = skillId;
    botao.textContent = skill.nome;
  });
}

// ---------- LIMPAR FICHA ---------- //
botoes.limpar.addEventListener("click", () => {
  const confirmar = confirm("Tem certeza que deseja limpar a ficha?");

  if (!confirmar) return;

  limparFicha();
});

function limparFicha() {
  localStorage.removeItem("fichaRPG");

  campo("nome").value = "";
  campo("especie").selectedIndex = 0;
  campo("classe").selectedIndex = 0;
  campo("nivel").selectedIndex = 0;
  campo("vidaAtual").value = "";
  campo("vidaMax").value = "";
  campo("manaAtual").value = "";
  campo("manaMax").value = "";
  campo("antecedentes").value = "";

  atualizarUI();

  limparAtributos();
  limparHabilidades();
}

function limparAtributos() {
  Object.entries(inputAtributos).forEach(([attr, input]) => {
    input.value = "";
    atualizarModificador(attr);
  });
}

function limparHabilidades() {
  const botoes = document.querySelectorAll(".botao-habilidade");

  botoes.forEach((botao, index) => {
    botao.dataset.skillId = "";
    botao.textContent = TEXTO_SLOT_VAZIO;
  });
}

// ---------- SALVAR E CARREGAR FICHA NO LOCALSTORAGE ---------- //

let carregandoFicha = false;

function salvarLocal() {
  if (carregandoFicha) return;

  const dados = coletarDadosFicha();
  localStorage.setItem("fichaRPG", JSON.stringify(dados));
}

form.addEventListener("input", salvarLocal); // Salva ficha ao digitar nas inputs, textarea
form.addEventListener("change", salvarLocal); // Salva ficha ao alterar os selects

function carregarLocal() {
  const dadosSalvos = localStorage.getItem("fichaRPG");

  if (!dadosSalvos) return;

  try {
    carregandoFicha = true;
    const dados = JSON.parse(dadosSalvos);
    preencherFicha(dados);
    carregandoFicha = false;
  } catch (e) {
    console.error("Erro ao carregar dados do localStorage", e);
  } finally {
    carregandoFicha = false;
  }
}

function atualizarUI() {
  atualizarRetrato();
  atualizarIcone();
}

async function inicializarFicha() {
  await carregarSpeciesData();
  await carregarClassData();
  await loadSkills();
  configurarModalSkill();
  configurarBotoesHabilidade();
  inicializarModificadores();
  carregarLocal();
}

document.addEventListener("DOMContentLoaded", inicializarFicha);
