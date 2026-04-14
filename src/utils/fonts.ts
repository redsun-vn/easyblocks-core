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

/** Tracks which family+weight combos are already injected. */
const loadedFontWeights = new Map<string, Set<number>>();

/** Default weights to load when only family names (no weights) are provided. */
const DEFAULT_WEIGHTS = [400];

/** All weights loaded in editor mode. */
const EDITOR_WEIGHTS = [300, 400, 500, 600, 700, 800];

/**
 * Builds a Google Fonts API v1 URL.
 *
 * v1 format: `css?family=Open+Sans:300,400|Roboto:400,700`
 */
function buildGoogleFontsUrl(
  fonts: { family: string; weights: number[] }[],
): string {
  const params = fonts
    .map(({ family, weights }) => {
      return `${family.replace(/ /g, "+")}:${weights.join(",")}`;
    })
    .join("|");

  return `https://fonts.googleapis.com/css?family=${params}&display=swap`;
}

/**
 * Filters out font+weight combos that are already loaded.
 * Returns only the new combos, and marks them as loaded.
 */
function filterNewFontWeights(
  fonts: { family: string; weights: number[] }[],
): { family: string; weights: number[] }[] {
  const result: { family: string; weights: number[] }[] = [];

  for (const { family, weights } of fonts) {
    let existing = loadedFontWeights.get(family);

    const newWeights = weights.filter((w) => !existing?.has(w));

    if (newWeights.length === 0) continue;

    if (!existing) {
      existing = new Set<number>();
      loadedFontWeights.set(family, existing);
    }

    for (const w of newWeights) {
      existing.add(w);
    }

    result.push({ family, weights: newWeights });
  }

  return result;
}

type LoadGoogleFontsOptions = {
  /** Font families to load (legacy: string[], new: ExtractedFont[]). */
  fonts?: string[] | ExtractedFont[];
  /** If true, waits for fonts to actually render-ready before resolving. */
  waitFontReady?: boolean;
  /**
   * Editor mode: loads ALL font families with ALL weights (300–800).
   * Production mode (default): loads only the fonts + weights actually used.
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
 * Loads Google Fonts by injecting a `<link>` into `<head>`.
 *
 * Two modes:
 * - **Editor** (`editor: true`): loads all font families with weights 300–800.
 * - **Production** (default): loads only the fonts + weights actually used.
 */
export async function loadGoogleFonts({
  fonts,
  waitFontReady,
  editor,
}: LoadGoogleFontsOptions = {}): Promise<void> {
  if (typeof window === "undefined") return;

  let requested: { family: string; weights: number[] }[];

  if (editor) {
    // Editor: all families with full weight range 300–800.
    const families =
      fonts && fonts.length > 0 && typeof fonts[0] === "string"
        ? (fonts as string[])
        : fontFamilies;

    requested = families.map((f) => ({
      family: f,
      weights: EDITOR_WEIGHTS,
    }));
  } else if (!fonts) {
    requested = fontFamilies.map((f) => ({
      family: f,
      weights: DEFAULT_WEIGHTS,
    }));
  } else if (fonts.length > 0 && typeof fonts[0] === "string") {
    requested = (fonts as string[]).map((f) => ({
      family: f,
      weights: DEFAULT_WEIGHTS,
    }));
  } else {
    requested = fonts as ExtractedFont[];
  }

  const newFonts = filterNewFontWeights(requested);

  if (newFonts.length === 0) {
    if (waitFontReady) await document.fonts.ready;
    return;
  }

  await injectLink(buildGoogleFontsUrl(newFonts));

  if (waitFontReady) await document.fonts.ready;
}
