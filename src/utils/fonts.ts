import type { ExtractedFont } from "./extractFonts";

interface IFont {
  id: string;
  value: string;
  label: string;
}

export const defaultFontFamily = "Roboto";
export const defaultFontSize = 16;
export const defaultFontWeight = 400;
export const defaultLineHeight = 1.4;

export const fontFamilies = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Inter",
  "Oswald",
  "Raleway",
  "Noto Sans",
  "Roboto Condensed",
  "Nunito",
  "Work Sans",
  "Rubik",
  "Mukta",
  "Ubuntu",
  "Quicksand",
  "Hind",
  "Fira Sans",
  "Barlow",
  "Cabin",
  "Prompt",
  "Heebo",
  "Source Sans 3",
  "Titillium Web",
  "Muli",
  "Manrope",
  "Josefin Sans",
  "Karla",
  "DM Sans",
  "PT Sans",
  "Tajawal",
  "Public Sans",
  "Catamaran",
  "Urbanist",
  "Outfit",
  "Lexend",
  "Signika",
  "Asap",
  "Sarabun",
  "Red Hat Display",
  "Exo 2",
  "Sen",
  "Epilogue",
  "Jost",
  "IBM Plex Sans",
  "Varela Round",
  "Mulish",
  "Spartan",
  "Krub",
  "Questrial",
  "Barlow Condensed",
  "Overpass",
  "Alata",
  "Kanit",
  "Noto Serif",
  "Merriweather",
  "Playfair Display",
  "Lora",
  "Cormorant Garamond",
  "EB Garamond",
  "PT Serif",
  "Libre Baskerville",
  "DM Serif Display",
  "Crimson Text",
  "Bitter",
  "Spectral",
  "Cormorant",
  "Zilla Slab",
  "Nanum Myeongjo",
  "Tinos",
  "Cardo",
  "Domine",
  "Arvo",
  "Vollkorn",
  "Bree Serif",
  "Alegreya",
  "Noticia Text",
  "Libre Caslon Text",
  "Faustina",
  "Mate",
  "Lusitana",
  "Arapey",
  "Fira Sans Condensed",
  "Space Grotesk",
  "Sofia Sans",
  "Niramit",
  "Be Vietnam Pro",
  "Eczar",
  "Quattrocento",
  "Rokkitt",
  "Cormorant Infant",
  "Slabo 27px",
  "Ultra",
  "Rozha One",
  "Old Standard TT",
  "Baskervville",
  "Play",
  "Mada",
  "Rajdhani",
  "Cabinet Grotesk",
  "Archivo",
  "Anton",
  "Bebas Neue",
  "Abril Fatface",
  "Alfa Slab One",
  "Righteous",
  "Lobster",
  "Pacifico",
  "Caveat",
  "Dancing Script",
  "Great Vibes",
  "Satisfy",
  "Shadows Into Light",
  "Cookie",
  "Gloria Hallelujah",
  "Indie Flower",
  "Courgette",
  "Amatic SC",
  "Fredoka",
  "Baloo 2",
  "Chewy",
  "Luckiest Guy",
  "Permanent Marker",
  "Architects Daughter",
  "Rock Salt",
  "Handlee",
  "Kaushan Script",
  "Patrick Hand",
  "Carter One",
  "Sigmar",
  "Rye",
  "Black Ops One",
  "Bungee",
  "Press Start 2P",
  "Space Mono",
  "Fira Code",
  "Roboto Mono",
  "JetBrains Mono",
  "Inconsolata",
  "Share Tech Mono",
  "Major Mono Display",
  "Source Code Pro",
  "Audiowide",
  "Syncopate",
  "Unica One",
  "Orbitron",
  "Chakra Petch",
  "Expletus Sans",
  "Staatliches",
  "Poiret One",
  "Aldrich",
  "Gruppo",
  "Viga",
  "Suez One",
  "Frank Ruhl Libre",
  "Cambo",
  "Marcellus",
  "Cinzel",
  "Judson",
  "Gelasio",
  "Abhaya Libre",
  "Cormorant SC",
  "Crimson Pro",
  "Noto Serif Display",
  "Sanchez",
  "DM Serif Text",
  "Fjord One",
  "Suranna",
  "Kreon",
  "Cormorant Upright",
  "Gloock",
  "Julius Sans One",
  "Assistant",
  "Encode Sans",
  "Nanum Gothic",
  "Maven Pro",
  "Overpass Mono",
  "Albert Sans",
  "Palanquin",
  "Chivo",
  "Arimo",
  "Exo",
  "Molengo",
  "Abel",
  "Teko",
  "Saira",
  "Jura",
  "Kumbh Sans",
  "Hepta Slab",
  "Azeret Mono",
  "League Spartan",
  "Rufina",
  "Crete Round",
  "Amiri",
  "Spectral SC",
  "Petrona",
  "Neuton",
  "Coustard",
  "Vidaloka",
  "Bellefair",
  "Antic Slab",
  "Copse",
  "DM Mono",
  "Anonymous Pro",
  "Oxygen Mono",
  "Courier Prime",
  "IBM Plex Mono",
  "Zilla Slab Highlight",
  "Shrikhand",
  "Bungee Shade",
  "Fugaz One",
  "Monoton",
  "Rammetto One",
  "Cinzel Decorative",
  "Fascinate Inline",
  "Racing Sans One",
  "Lilita One",
  "Potta One",
  "Tourney",
  "Cherry Swash",
  "Creepster",
  "Butcherman",
  "Ewert",
  "Bowlby One SC",
  "Galindo",
  "Knewave",
  "Fredoka One",
  "Ranchers",
  "Codystar",
  "VT323",
  "Cutive Mono",
  "IBM Plex Serif",
  "Philosopher",
];

export function getFontFamilies(): IFont[] {
  return fontFamilies.sort().map((font: string) => {
    return {
      id: font,
      value: font,
      label: font,
    };
  });
}

export function getFontWeights(): IFont[] {
  return [
    // { id: "100", value: "100", label: "Thin (100)" },
    // { id: "200", value: "200", label: "Extra Light (200)" },
    { id: "300", value: "300", label: "Light (300)" },
    { id: "400", value: "400", label: "Normal (400)" },
    { id: "500", value: "500", label: "Medium (500)" },
    { id: "600", value: "600", label: "Semi Bold (600)" },
    { id: "700", value: "700", label: "Bold (700)" },
    { id: "800", value: "800", label: "Extra Bold (800)" },
    // { id: "900", value: "900", label: "Black (900)" },
  ];
}

export function getLineHeights(): IFont[] {
  return [
    { id: "1", value: "1", label: "1" },
    { id: "1.1", value: "1.1", label: "1.1" },
    { id: "1.2", value: "1.2", label: "1.2" },
    { id: "1.3", value: "1.3", label: "1.3" },
    { id: "1.4", value: "1.4", label: "1.4" },
    { id: "1.4258", value: "1.4258", label: "1.4258" },
    { id: "1.5", value: "1.5", label: "1.5" },
    { id: "1.6", value: "1.6", label: "1.6" },
    { id: "1.7", value: "1.7", label: "1.7" },
    { id: "1.8", value: "1.8", label: "1.8" },
    { id: "2", value: "2", label: "2" },
  ];
}

const generateFontSizes = (from: number, to: number) => {
  if (typeof from !== "number" || typeof to !== "number" || from > to) {
    return [];
  }

  if (from === to) {
    return [
      {
        id: String(from.toString()),
        label: String(from.toString()),
        value: `${from.toString()}px`,
      },
    ];
  }

  let rs = [];

  for (let index = from; index <= to; index++) {
    rs.push({
      id: String(index.toString()),
      label: String(index.toString()),
      value: `${index.toString()}px`,
    });
  }

  return rs;
};

export function getFontSizes(): IFont[] {
  return generateFontSizes(1, 100)
    .filter(
      (s) => typeof s.value === "string" && s.value.match(/\d+(\.\d+)?px\b/),
    )
    .map((s) => ({
      id: parseFloat(s.value as string).toString(),
      value: parseFloat(s.value as string).toString(),
      label: s.label ?? "",
    }));
}

// ---------------------------------------------------------------------------
// loadGoogleFonts
// ---------------------------------------------------------------------------

/** Internal request shape — regular weights + italic weights per family. */
type FontRequest = { family: string; weights: number[]; italics: number[] };

/** Tracks which family+weight combos are already injected, per axis. */
const loadedFontWeights = new Map<
  string,
  { regular: Set<number>; italic: Set<number> }
>();

/** Default weights to load when only family names (no weights) are provided. */
const DEFAULT_WEIGHTS = [400];

/** All weights loaded in editor mode (applied to both regular and italic axes). */
const EDITOR_WEIGHTS = [300, 400, 500, 600, 700, 800];

/**
 * Per-`<link>` URL budget. Google Fonts v1 + Chrome GET start failing well
 * before 8KB; 3500 chars keeps requests reliably deliverable.
 */
const URL_MAX_CHARS = 3500;

const FONTS_BASE_URL = "https://fonts.googleapis.com/css";
const FONTS_URL_SUFFIX = "&display=swap";

/** Serializes one family entry to its v1 token, e.g. `Open+Sans:400,400italic`. */
function serializeFamily({ family, weights, italics }: FontRequest): string {
  const tokens = [
    ...weights.map((w) => String(w)),
    ...italics.map((w) => `${w}italic`),
  ];
  return `${family.replace(/ /g, "+")}:${tokens.join(",")}`;
}

/**
 * Builds a Google Fonts API v1 URL.
 *
 * v1 format: `css?family=Open+Sans:400,700,400italic,700italic|Roboto:400`
 */
function buildGoogleFontsUrl(fonts: FontRequest[]): string {
  const params = fonts.map(serializeFamily).join("|");
  return `${FONTS_BASE_URL}?family=${params}${FONTS_URL_SUFFIX}`;
}

/**
 * Splits requested families into batches such that each batch's URL stays
 * under {@link URL_MAX_CHARS}. Greedy packing — preserves family order.
 */
function chunkRequests(fonts: FontRequest[]): FontRequest[][] {
  const baseLen =
    FONTS_BASE_URL.length + "?family=".length + FONTS_URL_SUFFIX.length;
  const chunks: FontRequest[][] = [];
  let current: FontRequest[] = [];
  let currentLen = baseLen;

  for (const font of fonts) {
    const token = serializeFamily(font);
    // +1 for the `|` separator between families (omitted on first entry of chunk).
    const addLen = token.length + (current.length > 0 ? 1 : 0);

    if (current.length > 0 && currentLen + addLen > URL_MAX_CHARS) {
      chunks.push(current);
      current = [];
      currentLen = baseLen;
    }

    current.push(font);
    currentLen += current.length === 1 ? token.length : addLen;
  }

  if (current.length > 0) chunks.push(current);
  return chunks;
}

/**
 * Filters out font+weight combos that are already loaded.
 * Regular and italic axes filtered independently. Returns only the new combos
 * per axis, and marks them as loaded.
 */
function filterNewFontWeights(fonts: FontRequest[]): FontRequest[] {
  const result: FontRequest[] = [];

  for (const { family, weights, italics } of fonts) {
    let entry = loadedFontWeights.get(family);

    const newRegular = weights.filter((w) => !entry?.regular.has(w));
    const newItalic = italics.filter((w) => !entry?.italic.has(w));

    if (newRegular.length === 0 && newItalic.length === 0) continue;

    if (!entry) {
      entry = { regular: new Set<number>(), italic: new Set<number>() };
      loadedFontWeights.set(family, entry);
    }

    for (const w of newRegular) entry.regular.add(w);
    for (const w of newItalic) entry.italic.add(w);

    result.push({ family, weights: newRegular, italics: newItalic });
  }

  return result;
}

type LoadGoogleFontsOptions = {
  /** Font families to load (legacy: string[], new: ExtractedFont[]). */
  fonts?: string[] | ExtractedFont[];
  /** If true, waits for fonts to actually render-ready before resolving. */
  waitFontReady?: boolean;
  /**
   * Editor mode: loads ALL font families with weights 300–800 on both
   * regular and italic axes.
   * Production mode (default): loads only the fonts + variants used.
   */
  editor?: boolean;
};

/**
 * Injects a `<link>` stylesheet and waits for it to load.
 */
function injectLink(url: string): Promise<void> {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;

  return new Promise<void>((resolve, reject) => {
    link.onload = () => resolve();
    link.onerror = () =>
      reject(new Error(`Failed to load Google Fonts: ${url}`));
    document.head.appendChild(link);
  });
}

/**
 * Loads Google Fonts by injecting one or more `<link>` tags into `<head>`.
 *
 * Two modes:
 * - **Editor** (`editor: true`): preloads all 233 families × weights 300–800
 *   × regular + italic axes. URL is split into chunks to stay under browser
 *   and Google Fonts URL length limits.
 * - **Production** (default): loads only the variants actually present in
 *   the document. Italic variants come from `ExtractedFont.italics`.
 */
export async function loadGoogleFonts({
  fonts,
  waitFontReady,
  editor,
}: LoadGoogleFontsOptions = {}): Promise<void> {
  if (typeof window === "undefined") return;

  let requested: FontRequest[];

  if (editor) {
    // Editor: all families with full weight range 300–800 for regular AND italic.
    const families =
      fonts && fonts.length > 0 && typeof fonts[0] === "string"
        ? (fonts as string[])
        : fontFamilies;

    requested = families.map((f) => ({
      family: f,
      weights: EDITOR_WEIGHTS,
      italics: EDITOR_WEIGHTS,
    }));
  } else if (!fonts) {
    requested = fontFamilies.map((f) => ({
      family: f,
      weights: DEFAULT_WEIGHTS,
      italics: DEFAULT_WEIGHTS,
    }));
  } else if (fonts.length > 0 && typeof fonts[0] === "string") {
    requested = (fonts as string[]).map((f) => ({
      family: f,
      weights: DEFAULT_WEIGHTS,
      italics: DEFAULT_WEIGHTS,
    }));
  } else {
    // ExtractedFont[] — defensive default for italics if consumer omits it.
    requested = (fonts as ExtractedFont[]).map((f) => ({
      family: f.family,
      weights: f.weights,
      italics: f.italics.length ? f.italics : f.weights,
    }));
  }

  const newFonts = filterNewFontWeights(requested);

  if (newFonts.length === 0) {
    if (waitFontReady) await document.fonts.ready;
    return;
  }

  const chunks = chunkRequests(newFonts);
  await Promise.all(chunks.map((c) => injectLink(buildGoogleFontsUrl(c))));

  if (waitFontReady) await document.fonts.ready;
}

let globalFonts: ExtractedFont[] = [];

export const setGlobalFonts = (fonts: ExtractedFont[]): ExtractedFont[] =>
  (globalFonts = fonts);
export const getGlobalFonts = (): ExtractedFont[] => globalFonts;
