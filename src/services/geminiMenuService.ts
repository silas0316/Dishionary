// ---- Provider config ----
// Default: Ollama (local). Switch to Gemini via URL: ?provider=gemini&key=YOUR_KEY

const GEMINI_DEFAULT_KEY = "AIzaSyCcJNItkPCxvxhm_maxW3Dg_Ncq-PBGJDo";
const GEMINI_MODEL = "gemini-2.5-flash";
const OLLAMA_MODEL = "gemma3:12b";
const OLLAMA_URL = "/ollama/api/chat";

type Provider = "ollama" | "gemini";

function getProvider(): Provider {
  const params = new URLSearchParams(window.location.search);
  const p = params.get("provider");
  if (p === "ollama") return "ollama";
  // Default to Gemini
  return "gemini";
}

function getGeminiKey(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("key") || GEMINI_DEFAULT_KEY;
}

function getGeminiUrl(): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${getGeminiKey()}`;
}

// ---- Instructions (from Python) ----

const instruction_1 = `You are an OCR extraction system.

Your output MUST follow a STRICT LINE FORMAT so it can be parsed by code.

TASK:
Extract all menu items from the image with HIGH RECALL.

FORMAT (STRICT):
Each line must be EXACTLY one of the following:

CATEGORY\t<category_text>
ITEM\t<name>\t<price>\t<description>\t<uncertain>

FIELD RULES:
- Always output EXACTLY 5 fields for ITEM (separated by TAB)
  - If a field is missing, use ""
- uncertain must be either true or false
- Do NOT omit any field

EXTRA RULES:
- Do NOT use brackets [] or parentheses for structure
- Do NOT merge multiple items in one line
- Do NOT translate anything
- Keep original language exactly as shown
- If unsure, still output the item and set uncertain=true

GOAL:
- Maximize recall (include as many items as possible)
- Format MUST remain strictly valid

Return ONLY the formatted lines. No explanations.`;

const instruction_2 = `You are a professional restaurant menu translator.

Your output MUST follow a STRICT LINE FORMAT so it can be parsed by code.

TASK:
For each menu item in the input, produce exactly ONE ITEM line with translated and structured information.

STRICT FORMAT:
Each output line must be EXACTLY:

ITEM\t<category_original>\t<category_english>\t<name_original>\t<name_english>\t<price>\t<cook_verb>\t<description_english>\t<uncertain>

FIELD RULES:
- Always output EXACTLY 9 fields total per line, separated by TAB
- The first field must always be ITEM
- Do NOT omit any field
- If a field is missing, use ""
- uncertain must be either true or false
- Translate dish names into natural, idiomatic English
- cook_verb must be EXACTLY one of: "", boil, simmer, fry, deep_fry, stir_fry, steam, grill, roast, braise, bake, smoke, pickle, ferment, cure, poach, blanch, saute, toast, char, raw
- Use "raw" ONLY for dishes that are intentionally served uncooked (e.g. sashimi, tartare, salads with raw vegetables as the main component, ceviche). Do NOT use "raw" for drinks, desserts, or items that simply don't involve cooking.
- Use "" (empty) for drinks, desserts, condiments, side sauces, or items where the cooking method is unknown or not applicable

Return ONLY the formatted ITEM lines. No explanations.`;

const instruction_3 = `You are a professional restaurant menu translator and menu content writer.

Your output MUST follow a STRICT LINE FORMAT so it can be parsed by code.

TASK:
For each menu item in the input, produce exactly ONE ITEM line.

STRICT FORMAT:
Each output line must be EXACTLY:

ITEM\t<name_original>\t<name_english>\t<description>\t<ingredients>\t<allergens>\t<story>\t<uncertain>

FIELD RULES:
- Always output EXACTLY 8 fields
- Do NOT omit any field
- name_original: copy exactly from input
- name_english: copy exactly from input

DESCRIPTION RULES:
- Write a short, natural menu description in English (max 20 words)

INGREDIENT RULES:
- List likely main ingredients only, use "|" to separate

ALLERGEN RULES:
- List likely common allergens only, use "|" to separate

STORY RULES:
- Optional cultural or historical background (max 30 words), use "" if unsure

Return ONLY the formatted ITEM lines.`;

// ---- Parsers (ported from Python) ----

interface ExtractedItem {
  category: string;
  name: string;
  price: string;
  description: string;
  uncertain: boolean;
}

interface TranslatedItem {
  category_original: string;
  category_english: string;
  name_original: string;
  name_english: string;
  price: string;
  cook_verb: string;
  description_english: string;
  uncertain: boolean;
}

interface EnrichedItem {
  name_original: string;
  name_english: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  story: string;
  uncertain: boolean;
}

export interface FinalMenuItem {
  name_original: string;
  name_english: string;
  category_original: string;
  category_english: string;
  price: string;
  cook_verb: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  story: string;
  uncertain: boolean;
}

function parseRound1(text: string): ExtractedItem[] {
  const items: ExtractedItem[] = [];
  let currentCategory = "";

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("CATEGORY")) {
      currentCategory = line.slice("CATEGORY".length).trim().replace(/^"|"$/g, "");
      continue;
    }

    if (line.startsWith("ITEM")) {
      const parts = raw.split("\t");
      const fields = parts.slice(1).map((p) => p.trim().replace(/^"|"$/g, ""));
      while (fields.length < 4) fields.push("");

      items.push({
        category: currentCategory,
        name: fields[0],
        price: fields[1],
        description: fields[2],
        uncertain: fields[3]?.toLowerCase() === "true",
      });
    }
  }
  return items;
}

function parseRound2(text: string): TranslatedItem[] {
  const items: TranslatedItem[] = [];

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    const parts = line.split("\t");
    if (parts.length !== 9) continue;

    const fields = parts.map((p) => p.trim().replace(/^"|"$/g, ""));
    if (fields[0] !== "ITEM") continue;

    items.push({
      category_original: fields[1],
      category_english: fields[2],
      name_original: fields[3],
      name_english: fields[4],
      price: fields[5],
      cook_verb: fields[6],
      description_english: fields[7],
      uncertain: fields[8]?.toLowerCase() === "true",
    });
  }
  return items;
}

function parseRound3(text: string): EnrichedItem[] {
  const items: EnrichedItem[] = [];

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    const parts = line.split("\t");
    if (parts.length !== 8) continue;

    const fields = parts.map((p) => p.trim().replace(/^"|"$/g, ""));
    if (fields[0] !== "ITEM") continue;

    const ingredientsRaw = fields[4];
    const allergensRaw = fields[5];

    items.push({
      name_original: fields[1],
      name_english: fields[2],
      description: fields[3],
      ingredients:
        !ingredientsRaw || ingredientsRaw === ""
          ? []
          : ingredientsRaw.split("|").map((s) => s.trim()).filter(Boolean),
      allergens:
        !allergensRaw || allergensRaw === ""
          ? []
          : allergensRaw.split("|").map((s) => s.trim()).filter(Boolean),
      story: fields[6],
      uncertain: fields[7]?.toLowerCase() === "true",
    });
  }
  return items;
}

function combineMenuData(
  translated: TranslatedItem[],
  enriched: EnrichedItem[]
): FinalMenuItem[] {
  const lookup = new Map<string, TranslatedItem>();
  for (const t of translated) {
    lookup.set(`${t.name_original}||${t.name_english}`, t);
  }

  const combined: FinalMenuItem[] = [];
  for (const e of enriched) {
    const key = `${e.name_original}||${e.name_english}`;
    const t = lookup.get(key);
    if (t) {
      combined.push({
        name_original: t.name_original,
        name_english: t.name_english,
        category_original: t.category_original,
        category_english: t.category_english,
        price: t.price,
        cook_verb: t.cook_verb,
        description: e.description,
        ingredients: e.ingredients,
        allergens: e.allergens,
        story: e.story,
        uncertain: t.uncertain || e.uncertain,
      });
    }
  }
  return combined;
}

// ---- API calls ----

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data:image/...;base64, prefix
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---- Gemini API calls ----

async function callGeminiWithImages(
  instruction: string,
  imageBase64List: { data: string; mimeType: string }[]
): Promise<string> {
  const imageParts = imageBase64List.map((img) => ({
    inline_data: {
      mime_type: img.mimeType,
      data: img.data,
    },
  }));

  const body = {
    contents: [
      {
        parts: [
          { text: instruction },
          ...imageParts,
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      topK: 20,
      maxOutputTokens: 8192,
    },
  };

  const res = await fetch(getGeminiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${err}`);
  }

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function callGeminiText(prompt: string): Promise<string> {
  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      topK: 20,
      maxOutputTokens: 8192,
    },
  };

  const res = await fetch(getGeminiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${err}`);
  }

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// ---- Ollama (local) API calls ----

async function callOllamaWithImages(
  instruction: string,
  imageBase64List: { data: string; mimeType: string }[]
): Promise<string> {
  const images = imageBase64List.map((img) => img.data);

  const body = {
    model: OLLAMA_MODEL,
    messages: [
      {
        role: "user",
        content: instruction,
        images,
      },
    ],
    stream: false,
    keep_alive: "30m",
    options: {
      temperature: 0.2,
      top_p: 0.9,
      top_k: 20,
      num_predict: 8192,
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 min

  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama error: ${res.status} ${err}`);
  }

  const json = await res.json();
  return json.message?.content ?? "";
}

async function callOllamaText(prompt: string): Promise<string> {
  const body = {
    model: OLLAMA_MODEL,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: false,
    keep_alive: "30m",
    options: {
      temperature: 0.2,
      top_p: 0.9,
      top_k: 20,
      num_predict: 8192,
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 min

  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama error: ${res.status} ${err}`);
  }

  const json = await res.json();
  return json.message?.content ?? "";
}

// ---- Unified call wrappers ----

async function callWithImages(
  instruction: string,
  imageBase64List: { data: string; mimeType: string }[]
): Promise<string> {
  if (getProvider() === "gemini") {
    return callGeminiWithImages(instruction, imageBase64List);
  }
  return callOllamaWithImages(instruction, imageBase64List);
}

async function callText(prompt: string): Promise<string> {
  if (getProvider() === "gemini") {
    return callGeminiText(prompt);
  }
  return callOllamaText(prompt);
}

// ---- Main pipeline ----

export async function analyzeMenu(
  files: File[],
  onProgress?: (step: string) => void
): Promise<FinalMenuItem[]> {
  // Step 1: OCR extraction
  onProgress?.("Reading the menu...");
  const images = await Promise.all(
    files.map(async (f) => ({
      data: await fileToBase64(f),
      mimeType: f.type || "image/jpeg",
    }))
  );

  const ocrText = await callWithImages(instruction_1, images);
  const extracted = parseRound1(ocrText);

  if (extracted.length === 0) {
    throw new Error("Could not extract any menu items from the images.");
  }

  // Step 2: Translate
  onProgress?.("Translating dishes...");
  const extractedJson = JSON.stringify(extracted, null, 2);
  const translatePrompt = `${instruction_2}\n\nHere is the extracted menu data:\n\n${extractedJson}\n\nConvert every item into the strict ITEM line format.`;
  const translateText = await callText(translatePrompt);
  const translated = parseRound2(translateText);

  // Step 3: Enrich
  onProgress?.("Uncovering stories...");
  const preparedForRound3 = translated.map((t) => ({
    name_original: t.name_original,
    name_english: t.name_english,
    description_english: t.description_english,
    cook_verb: t.cook_verb,
    uncertain: t.uncertain,
  }));
  const enrichJson = JSON.stringify(preparedForRound3, null, 2);
  const enrichPrompt = `${instruction_3}\n\nHere is the extracted menu data:\n\n${enrichJson}\n\nFor each item:\n- keep name_original exactly unchanged\n- keep name_english exactly unchanged\n- generate description, ingredients, allergens, and story\n- output exactly one ITEM line per input item\n- preserve the same item order as the input\n\nOutput ITEM lines only.`;
  const enrichText = await callText(enrichPrompt);
  const enriched = parseRound3(enrichText);

  // Combine
  onProgress?.("Finalizing results...");
  const combined = combineMenuData(translated, enriched);
  return combined;
}
