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
    "conteudo-principal",
    "titulo-principal",
    "fotos",
    "santos",
    "videos",
    "missao",
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

  if (!Array.isArray(content.mural?.mensagens)) {
    error('"mural.mensagens" deve ser uma lista.');
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

  collectReferences(content);
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
