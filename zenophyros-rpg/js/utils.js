window.APP_CONFIG = {
  version: "0.10.0-alpha",
  name: "Zenophyros",
};

window.DEBUG_MODE = false;

const REMOTE_BASE_URL = "https://zenophyros.netlify.app";

/**
 * Utils.js
 */
const TEXTO_SLOT_VAZIO = "(vazio)";

const DEBUG_LOGS = false;

// Carrega um arquivo .json para o código.
async function carregarJSON(caminho) {
  // CHECK IF RUNNING ON FILE OR SERVER

  const isLocalFile = window.location.protocol === "file:";

  const caminhoNormalizado = caminho.replace(/^\.\//, "/");

  const url = isLocalFile ? `${REMOTE_BASE_URL}${caminhoNormalizado}` : caminho;

  // ---------- DEBUG INFO ---------- //
  if (DEBUG_LOGS) {
    console.group(`📦 carregarJSON()`);

    console.log("Modo local (file://):", isLocalFile);

    if (isLocalFile) {
      console.log("Origem detectada:", "filesystem local");

      console.log("Usando fallback remoto:");
    } else {
      console.log("Origem detectada:", "servidor web");

      console.log("Usando caminho relativo/local:");
    }

    console.log("Caminho solicitado:", caminho);

    console.log("URL final:", url);
  }

  // TRIES TO LOAD JSON
  try {
    if (DEBUG_LOGS) {
      console.log(`Carregando JSON: ${url}`);
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    return await response.json();
  } catch (erro) {
    console.error(`Erro ao carregar JSON: ${url}`, erro);

    return null;
  }
}

function parseNumero(valor) {
  if (valor === "" || valor === null || valor === undefined) {
    return "";
  }

  const numero = Number(valor);

  if (isNaN(numero)) {
    return "";
  }

  return numero;
}

function sanitizeString(texto) {
  return texto.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function getLabelFromEnum(enumGroup, value) {
  if (window.DEBUG_MODE && !enumGroup || typeof enumGroup !== "object") {
    console.error("enumGroup recebido:", enumGroup);
    console.error("value recebido:", value);

    throw new TypeError(
      "getLabelFromEnum: enumGroup deve ser um objeto válido"
    );
  }

  if (!value) {
    console.log("This value is null.");
  }

  return enumGroup[value]?.label ?? value;
}