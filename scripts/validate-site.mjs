import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, normalize, relative, resolve } from "node:path";
import process from "node:process";

const root = process.cwd();
const errors = [];
const warnings = [];

const error = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

const readText = (path) => {
  const absolutePath = resolve(root, path);

  if (!existsSync(absolutePath)) {
    error(`Arquivo obrigatório ausente: ${path}`);
    return "";
  }

  return readFileSync(absolutePath, "utf8");
};

const walkFiles = (directory) => {
  if (!existsSync(directory)) return [];

  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) files.push(...walkFiles(path));
    else files.push(path);
  }

  return files;
};

const isExternal = (value) =>
  /^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(value);

const cleanReference = (value) =>
  value.trim().replace(/^['"]|['"]$/g, "").split("#")[0].split("?")[0];

const validateReference = (value, sourceFile) => {
  const reference = cleanReference(value);

  if (!reference || reference.startsWith("#") || isExternal(reference)) return;

  const sourceDirectory = resolve(root, sourceFile, "..");
  const target = reference.startsWith("/")
    ? resolve(root, `.${reference}`)
    : resolve(sourceDirectory, reference);

  const normalizedRoot = normalize(root + "/");
  const normalizedTarget = normalize(target);

  if (!normalizedTarget.startsWith(normalizedRoot)) {
    error(`Referência fora da raiz: ${value} em ${sourceFile}`);
    return;
  }

  if (!existsSync(normalizedTarget)) {
    error(`Arquivo referenciado não existe: ${value} em ${sourceFile}`);
  }
};

const validateHtml = () => {
  const file = "index.html";
  const html = readText(file);
  if (!html) return;

  const ids = [...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)]
    .map((match) => match[1]);
  const seen = new Set();

  for (const id of ids) {
    if (seen.has(id)) error(`ID duplicado no index.html: ${id}`);
    seen.add(id);
  }

  for (const id of [
    "site-gate",
    "site-gate-title",
    "site-gate-countdown",
    "site-gate-hours",
    "site-gate-minutes",
    "site-gate-seconds",
    "conteudo-principal",
    "titulo-principal",
    "fotos",
    "santos",
    "videos",
    "missao",
    "habitos",
    "mural",
    "proximo-encontro"
  ]) {
    if (!seen.has(id)) error(`Seção obrigatória ausente: #${id}`);
  }

  for (const match of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
    validateReference(match[1], file);
  }

  if (html.includes("ihs-sunburst.svg")) {
    warn("O index.html ainda referencia o símbolo antigo ihs-sunburst.svg.");
  }

  if (!html.includes('lang="pt-BR"')) {
    warn('O elemento <html> deveria usar lang="pt-BR".');
  }

  if (!/<meta\s+name=["']description["']/i.test(html)) {
    warn("O index.html não possui meta description.");
  }

  if (!/<body\b[^>]*\bdata-site-access=["']checking["']/i.test(html)) {
    error('O <body> deve iniciar com data-site-access="checking".');
  }
};

const validateCss = () => {
  const directory = resolve(root, "assets/css");

  for (const absoluteFile of walkFiles(directory)) {
    if (extname(absoluteFile).toLowerCase() !== ".css") continue;

    const sourceFile = relative(root, absoluteFile).replaceAll("\\", "/");
    const css = readFileSync(absoluteFile, "utf8");

    for (const match of css.matchAll(/url\(\s*([^)]+?)\s*\)/gi)) {
      validateReference(match[1], sourceFile);
    }
  }
};

const collectReferences = (value) => {
  if (Array.isArray(value)) {
    value.forEach(collectReferences);
    return;
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach(collectReferences);
    return;
  }

  if (typeof value === "string" && /^(?:assets\/|data\/|docs\/)/.test(value)) {
    // O conteúdo do JSON é inserido na página e seus caminhos relativos são
    // resolvidos pelo navegador a partir do index.html, não da pasta data/.
    validateReference(value, "index.html");
  }
};

const validDate = (value) =>
  typeof value === "string" && !Number.isNaN(Date.parse(value));

const validHttpUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;

  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

const validateContent = () => {
  const file = "data/content.json";
  const text = readText(file);
  if (!text) return;

  let content;

  try {
    content = JSON.parse(text);
  } catch (parseError) {
    error(`JSON inválido em ${file}: ${parseError.message}`);
    return;
  }

  for (const block of [
    "evento",
    "estadosSite",
    "mensagem",
    "galeria",
    "santos",
    "videos",
    "missoesSemana",
    "habitosFe",
    "mural",
    "proximoEncontro"
  ]) {
    if (!(block in content)) error(`Bloco obrigatório ausente: ${block}`);
  }

  if (typeof content.galeria?.liberada !== "boolean") {
    error('A flag "galeria.liberada" deve ser true ou false.');
  }

  if (
    content.galeria?.liberada === true &&
    (!Array.isArray(content.galeria?.fotos) || content.galeria.fotos.length === 0)
  ) {
    error("A galeria está liberada, mas não possui fotos.");
  }

  const siteStates = content.estadosSite;

  if (
    !siteStates ||
    typeof siteStates !== "object" ||
    Array.isArray(siteStates)
  ) {
    error('"estadosSite" deve ser um objeto JSON.');
  } else {
    if (siteStates.fusoHorario !== "America/Sao_Paulo") {
      error('"estadosSite.fusoHorario" deve ser "America/Sao_Paulo".');
    }

    for (const field of ["inicioDiaEvento", "inicioPosEvento"]) {
      if (!validDate(siteStates[field])) {
        error(`"estadosSite.${field}" não é uma data válida.`);
      }
    }

    if (
      validDate(siteStates.inicioDiaEvento) &&
      validDate(siteStates.inicioPosEvento) &&
      Date.parse(siteStates.inicioDiaEvento) >= Date.parse(siteStates.inicioPosEvento)
    ) {
      error('"estadosSite.inicioPosEvento" deve ocorrer depois de "inicioDiaEvento".');
    }

    const closedAccess = siteStates.acessoFechado;

    if (
      !closedAccess ||
      typeof closedAccess !== "object" ||
      Array.isArray(closedAccess)
    ) {
      error('"estadosSite.acessoFechado" deve ser um objeto JSON.');
    } else {
      for (const field of [
        "selo",
        "titulo",
        "texto",
        "contagemRotulo",
        "horario",
        "avisoAutomatico"
      ]) {
        if (
          typeof closedAccess[field] !== "string" ||
          !closedAccess[field].trim()
        ) {
          error(`"estadosSite.acessoFechado.${field}" precisa ser preenchido.`);
        }
      }
    }
  }

  const saints = content.santos;

  if (!Array.isArray(saints) || saints.length === 0) {
    error('"santos" deve possuir ao menos um card.');
  } else {
    const saintNames = new Set();
    const imagePositionPattern = /^(?:left|center|right|\d{1,3}%)(?:\s+(?:top|center|bottom|\d{1,3}%))?$/;

    saints.forEach((saint, index) => {
      for (const field of [
        "nome",
        "imagem",
        "textoAlternativo",
        "virtude",
        "frase",
        "resumo",
        "inspiracao"
      ]) {
        if (typeof saint?.[field] !== "string" || !saint[field].trim()) {
          error(`O santo ${index + 1} precisa do campo "${field}".`);
        }
      }

      const name = saint?.nome?.trim();

      if (name && saintNames.has(name)) {
        error(`Santo repetido: ${name}`);
      }

      if (name) {
        saintNames.add(name);
      }

      if (
        typeof saint?.posicaoImagem !== "string" ||
        !imagePositionPattern.test(saint.posicaoImagem.trim())
      ) {
        error(`A posição de imagem de "${name || `santo ${index + 1}`}" é inválida.`);
      }

      const details = saint?.detalhes;

      if (!details || typeof details !== "object" || Array.isArray(details)) {
        error(`"${name || `Santo ${index + 1}`}" precisa do bloco "detalhes".`);
        return;
      }

      for (const field of ["nascimento", "morte"]) {
        if (typeof details[field] !== "string" || !details[field].trim()) {
          error(`Os detalhes de "${name}" precisam do campo "${field}".`);
        }
      }

      const recognition = details.reconhecimento;

      if (
        !recognition ||
        typeof recognition !== "object" ||
        Array.isArray(recognition)
      ) {
        error(`Os detalhes de "${name}" precisam do bloco "reconhecimento".`);
      } else {
        for (const field of ["titulo", "data"]) {
          if (
            typeof recognition[field] !== "string" ||
            !recognition[field].trim()
          ) {
            error(`O reconhecimento de "${name}" precisa do campo "${field}".`);
          }
        }
      }

      for (const field of ["simbolos", "curiosidades"]) {
        const values = details[field];

        if (
          !Array.isArray(values) ||
          values.length === 0 ||
          values.some(
            (value) => typeof value !== "string" || !value.trim()
          )
        ) {
          error(`Os detalhes de "${name}" precisam de uma lista válida em "${field}".`);
        }
      }

      const source = details.fonte;

      if (!source || typeof source !== "object" || Array.isArray(source)) {
        error(`Os detalhes de "${name}" precisam do bloco "fonte".`);
      } else {
        if (typeof source.rotulo !== "string" || !source.rotulo.trim()) {
          error(`A fonte de "${name}" precisa do campo "rotulo".`);
        }

        if (!validHttpUrl(source.url)) {
          error(`A fonte de "${name}" precisa de uma URL HTTP(S) válida.`);
        }
      }
    });
  }

  const missions = content.missoesSemana?.dias;

  if (!Array.isArray(missions) || missions.length !== 7) {
    error('A jornada deve possuir exatamente 7 itens em "missoesSemana.dias".');
  } else {
    const ids = new Set();

    missions.forEach((mission, index) => {
      if (!mission?.id) {
        error(`A missão ${index + 1} não possui id.`);
        return;
      }

      if (ids.has(mission.id)) error(`ID de missão repetido: ${mission.id}`);
      ids.add(mission.id);

      if (!mission.titulo || !mission.descricao) {
        error(`A missão "${mission.id}" precisa de título e descrição.`);
      }
    });
  }

  const cycle = content.missoesSemana?.ciclo || {};

  if (cycle.fusoHorario !== "America/Sao_Paulo") {
    warn('O fuso da jornada deveria ser "America/Sao_Paulo".');
  }

  for (const field of ["inicioLiberacao", "dataInicial", "dataEncontroFinal"]) {
    if (!validDate(cycle[field])) {
      error(`"missoesSemana.ciclo.${field}" não é uma data válida.`);
    }
  }

  const faithHabits = content.habitosFe;

  if (
    !faithHabits ||
    typeof faithHabits !== "object" ||
    Array.isArray(faithHabits)
  ) {
    error('"habitosFe" deve ser um objeto JSON.');
  } else {
    for (const field of [
      "selo",
      "titulo",
      "descricao",
      "tituloPlano",
      "orientacao",
      "storageKey",
      "fraseFinal"
    ]) {
      if (
        typeof faithHabits[field] !== "string" ||
        !faithHabits[field].trim()
      ) {
        error(`"habitosFe.${field}" precisa ser um texto preenchido.`);
      }
    }

    if (faithHabits.limiteSelecao !== 3) {
      error('"habitosFe.limiteSelecao" deve ser igual a 3.');
    }

    const groups = faithHabits.grupos;

    if (!Array.isArray(groups) || groups.length !== 4) {
      error('"habitosFe.grupos" deve possuir exatamente quatro grupos.');
    } else {
      const groupIds = new Set();
      const habitIds = new Set();
      let habitCount = 0;
      const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

      groups.forEach((group, groupIndex) => {
        const position = groupIndex + 1;

        if (!group || typeof group !== "object" || Array.isArray(group)) {
          error(`O grupo de hábitos ${position} deve ser um objeto JSON.`);
          return;
        }

        for (const field of ["id", "titulo", "descricao"]) {
          if (typeof group[field] !== "string" || !group[field].trim()) {
            error(`O grupo de hábitos ${position} precisa do campo "${field}".`);
          }
        }

        const groupId = group.id?.trim();

        if (groupId && !idPattern.test(groupId)) {
          error(`ID de grupo de hábitos inválido: ${groupId}`);
        }

        if (groupId && groupIds.has(groupId)) {
          error(`ID de grupo de hábitos repetido: ${groupId}`);
        }

        if (groupId) groupIds.add(groupId);

        if (!Array.isArray(group.itens) || group.itens.length === 0) {
          error(`O grupo de hábitos "${groupId || position}" precisa de itens.`);
          return;
        }

        group.itens.forEach((item, itemIndex) => {
          habitCount += 1;

          if (!item || typeof item !== "object" || Array.isArray(item)) {
            error(`O hábito ${itemIndex + 1} do grupo "${groupId || position}" é inválido.`);
            return;
          }

          if (typeof item.id !== "string" || !idPattern.test(item.id.trim())) {
            error(`O hábito ${habitCount} precisa de um ID válido.`);
          } else if (habitIds.has(item.id.trim())) {
            error(`ID de hábito repetido: ${item.id.trim()}`);
          } else {
            habitIds.add(item.id.trim());
          }

          if (typeof item.texto !== "string" || !item.texto.trim()) {
            error(`O hábito ${habitCount} precisa do campo "texto".`);
          }
        });
      });

      if (habitCount !== 17) {
        error(`A seção de hábitos deve possuir exatamente 17 itens; foram encontrados ${habitCount}.`);
      }
    }

    const credit = faithHabits.credito;

    if (!credit || typeof credit !== "object" || Array.isArray(credit)) {
      error('"habitosFe.credito" deve ser um objeto JSON.');
    } else {
      for (const field of ["texto", "nome"]) {
        if (typeof credit[field] !== "string" || !credit[field].trim()) {
          error(`"habitosFe.credito.${field}" precisa ser preenchido.`);
        }
      }

      if (!validHttpUrl(credit.url)) {
        error('"habitosFe.credito.url" precisa de uma URL HTTP(S) válida.');
      }
    }
  }

  collectReferences(content);
};

const validateMural = () => {
  const file = "data/mural.json";
  const text = readText(file);
  if (!text) return;

  let mural;

  try {
    mural = JSON.parse(text);
  } catch (parseError) {
    error(`JSON inválido em ${file}: ${parseError.message}`);
    return;
  }

  if (!Array.isArray(mural.mensagens)) {
    error('"mensagens" em data/mural.json deve ser uma lista.');
    return;
  }

  mural.mensagens.forEach((item, index) => {
    const position = index + 1;

    if (!item || typeof item !== "object" || Array.isArray(item)) {
      error(`A mensagem ${position} do mural deve ser um objeto JSON.`);
      return;
    }

    if (typeof item.nome !== "string" || !item.nome.trim()) {
      error(`A mensagem ${position} do mural precisa do campo "nome".`);
    }

    if (typeof item.mensagem !== "string" || !item.mensagem.trim()) {
      error(`A mensagem ${position} do mural precisa do campo "mensagem".`);
    } else if (item.mensagem.trim().length > 400) {
      error(`A mensagem ${position} do mural ultrapassa o limite de 400 caracteres.`);
    }

    if (
      "funcao" in item &&
      (typeof item.funcao !== "string" || !item.funcao.trim())
    ) {
      error(`A função da mensagem ${position} do mural deve ser um texto preenchido.`);
    }

    for (const field of ["destaque", "publicada"]) {
      if (field in item && typeof item[field] !== "boolean") {
        error(`O campo "${field}" da mensagem ${position} deve ser true ou false.`);
      }
    }
  });
};

const validateImageSizes = () => {
  const directory = resolve(root, "assets/images");
  const extensions = new Set([
    ".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"
  ]);

  for (const absoluteFile of walkFiles(directory)) {
    if (!extensions.has(extname(absoluteFile).toLowerCase())) continue;

    const sizeMb = statSync(absoluteFile).size / 1024 / 1024;
    const file = relative(root, absoluteFile).replaceAll("\\", "/");

    if (sizeMb > 8) {
      error(`Imagem maior que 8 MB: ${file} (${sizeMb.toFixed(2)} MB)`);
    } else if (sizeMb > 2) {
      warn(`Considere otimizar: ${file} (${sizeMb.toFixed(2)} MB)`);
    }
  }
};

validateHtml();
validateCss();
validateContent();
validateMural();
validateImageSizes();

for (const message of warnings) console.warn(`AVISO: ${message}`);
for (const message of errors) console.error(`ERRO: ${message}`);

console.log("");
console.log(
  `Validação concluída com ${errors.length} erro(s) e ${warnings.length} aviso(s).`
);

if (errors.length > 0) {
  process.exitCode = 1;
} else {
  console.log("Site validado com sucesso.");
}
