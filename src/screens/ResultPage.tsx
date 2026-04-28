import { useCallback, useMemo, useState } from "react";
import { imgArrowLeftSm } from "../assets/icons";
import { DietFilter } from "../components/DietFilter";
import { MealCard } from "../components/MealCard";
import { TopNavOptions } from "../components/TopNavOptions";
import type { FinalMenuItem } from "../services/geminiMenuService";
import styles from "./ResultPage.module.css";

const BG_SRC = `${import.meta.env.BASE_URL}bg-start.png`;

/* ------------------------------------------------------------------ */
/*  Allergen keyword mapping                                          */
/*  Maps Landing-page allergen labels -> keywords to search in        */
/*  ingredient names and Gemini-returned allergen strings.             */
/* ------------------------------------------------------------------ */
const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  "Milk": ["milk", "dairy", "cheese", "butter", "yogurt", "cream", "whey", "casein", "ghee"],
  "Egg": ["egg"],
  "Peanut": ["peanut"],
  "Soy": ["soy", "soy sauce", "tofu", "edamame", "miso", "tempeh"],
  "Nuts (almonds, walnuts, cashews, etc.)": ["nut", "almond", "walnut", "cashew", "pistachio", "pecan", "hazelnut", "macadamia"],
  "Wheat": ["wheat", "flour", "bread", "gluten", "pasta", "noodle", "batter"],
  "Fish": ["fish", "anchovy", "sardine", "tuna", "salmon", "cod", "fish sauce"],
  "Sesame": ["sesame"],
  "Shellfish (shrimp, crab, lobster)": ["shellfish", "shrimp", "crab", "lobster", "prawn", "crawfish", "crayfish", "clam", "mussel", "oyster", "scallop", "squid"],
};

/** Check if a text contains any of the keywords (case-insensitive). */
function textMatchesAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

/* ------------------------------------------------------------------ */
/*  Diet compatibility rules (local, no API calls)                    */
/*  Each diet maps to ingredient keywords that EXCLUDE a dish.        */
/* ------------------------------------------------------------------ */
const MEAT_KEYWORDS = ["beef", "pork", "chicken", "lamb", "duck", "turkey", "veal", "bacon", "ham", "sausage", "salami", "venison", "goat", "mutton", "poultry", "meat"];
const FISH_KEYWORDS = ["fish", "anchovy", "sardine", "tuna", "salmon", "cod", "fish sauce", "shrimp", "prawn", "crab", "lobster", "shellfish", "squid", "clam", "mussel", "oyster", "scallop", "crawfish", "crayfish", "seafood"];
const DAIRY_KEYWORDS = ["milk", "dairy", "cheese", "butter", "yogurt", "cream", "whey", "casein", "ghee"];
const EGG_KEYWORDS = ["egg"];
const HONEY_KEYWORDS = ["honey"];
const GLUTEN_KEYWORDS = ["wheat", "flour", "bread", "pasta", "gluten", "barley", "rye", "soy sauce", "noodle", "batter"];

const DIET_RULES: Record<string, string[]> = {
  "Vegan": [...MEAT_KEYWORDS, ...FISH_KEYWORDS, ...DAIRY_KEYWORDS, ...EGG_KEYWORDS, ...HONEY_KEYWORDS],
  "Vegetarian": [...MEAT_KEYWORDS, ...FISH_KEYWORDS],
  "Pescatarian": [...MEAT_KEYWORDS],
  "Dairy-free": [...DAIRY_KEYWORDS],
  "Gluten-free": [...GLUTEN_KEYWORDS],
  "No beef": ["beef", "cow", "veal", "ox"],
  "No fish": [...FISH_KEYWORDS],
  "No chicken": ["chicken", "poultry", "hen"],
  "No pork": ["pork", "pig", "bacon", "ham", "sausage", "lard"],
  "No lamb": ["lamb", "mutton", "sheep"],
};

/** Check if a dish's ingredients contain any excluded keyword. */
function ingredientsContainAny(ingredients: string[], excludedKeywords: string[]): boolean {
  const joined = ingredients.map((s) => s.toLowerCase()).join(" ");
  return excludedKeywords.some((kw) => joined.includes(kw));
}

/** Returns true if a meal should be HIDDEN by the given diet filters. */
function mealExcludedByDiet(meal: FinalMenuItem, activeFilters: Set<string>): boolean {
  if (activeFilters.size === 0) return false;
  const allIngredients = [...meal.ingredients, ...meal.allergens];
  for (const filter of activeFilters) {
    const excluded = DIET_RULES[filter];
    if (!excluded) continue;
    if (ingredientsContainAny(allIngredients, excluded)) return true;
  }
  return false;
}

/**
 * Compute which diet labels a dish is compatible with (local check).
 * A dish is compatible with a diet if NONE of its ingredients match
 * that diet's excluded keywords.
 * Also includes "No X" labels when the dish doesn't contain that protein.
 */
function computeDietTags(ingredients: string[], allergens: string[], activeFilters: Set<string>): string[] {
  const allIngredients = [...ingredients, ...allergens];
  const tags: string[] = [];

  // Positive diet labels
  const DIET_LABELS = ["Vegan", "Vegetarian", "Pescatarian", "Dairy-free", "Gluten-free"];
  for (const diet of DIET_LABELS) {
    const excluded = DIET_RULES[diet];
    if (!excluded) continue;
    if (!ingredientsContainAny(allIngredients, excluded)) {
      tags.push(diet);
    }
  }

  // "No X" labels — only show when the user has that specific filter active
  const NO_LABELS = ["No beef", "No chicken", "No pork", "No lamb", "No fish"];
  for (const label of NO_LABELS) {
    if (!activeFilters.has(label)) continue;
    const excluded = DIET_RULES[label];
    if (!excluded) continue;
    if (!ingredientsContainAny(allIngredients, excluded)) {
      tags.push(label);
    }
  }

  return tags;
}

/**
 * Normalize the cook_verb from the API into a readable label.
 * Returns empty string if no cooking method — the tag won't be shown.
 */
function normalizeCookVerb(verb: string): string {
  if (!verb || verb.trim() === "" || verb === "-" || verb === "N/A" || verb.toLowerCase() === "none") {
    return "";
  }
  // Capitalize first letter of each word
  return verb
    .split(/[\s_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/* ------------------------------------------------------------------ */

export type ResultPageProps = {
  onBack?: () => void;
  menuItems?: FinalMenuItem[];
  userAllergens?: string[];
};

export function ResultPage({ onBack, menuItems = [], userAllergens = [] }: ResultPageProps) {
  const [activeCat, setActiveCat] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dietFilters, setDietFilters] = useState<Set<string>>(() => new Set());

  const handleDietChange = useCallback((selected: Set<string>) => {
    setDietFilters(new Set(selected));
  }, []);

  // Expand allergen labels into flat keyword sets for matching
  const allergenKeywords = useMemo(() => {
    const kws: string[] = [];
    for (const allergen of userAllergens) {
      const mapped = ALLERGEN_KEYWORDS[allergen];
      if (mapped) {
        kws.push(...mapped);
      } else {
        kws.push(allergen.toLowerCase());
      }
    }
    return kws;
  }, [userAllergens]);

  // Filter menu items by active diet filters
  const filteredItems = useMemo(() => {
    if (dietFilters.size === 0) return menuItems;
    return menuItems.filter((item) => !mealExcludedByDiet(item, dietFilters));
  }, [menuItems, dietFilters]);

  // Build categories from filtered data
  const categories = useMemo(() => {
    const catMap = new Map<string, FinalMenuItem[]>();
    for (const item of filteredItems) {
      const cat = item.category_english || "Other";
      if (!catMap.has(cat)) catMap.set(cat, []);
      catMap.get(cat)!.push(item);
    }
    const all = { label: "All", meals: filteredItems };
    const rest = Array.from(catMap.entries()).map(([label, meals]) => ({ label, meals }));
    return [all, ...rest];
  }, [filteredItems]);

  const category = categories[activeCat] ?? categories[0];

  return (
    <div className={styles.root} data-name="Result">
      <img className={styles.texture} src={BG_SRC} alt="" />

      <div className={styles.stickyHeader}>
        <div className={styles.infoBar}>
          <button type="button" className={styles.backBtn} onClick={onBack} aria-label="Go back">
            <img src={imgArrowLeftSm} alt="" />
          </button>
          <span className={styles.dateTitle}>
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>

        <div className={styles.topNav} role="tablist" aria-label="Meal categories">
          {categories.map((cat, i) => (
            <TopNavOptions
              key={cat.label}
              label={cat.label}
              count={String(cat.meals.length)}
              variant={i === activeCat ? "main" : "other"}
              selected={i === activeCat}
              onClick={() => setActiveCat(i)}
            />
          ))}
        </div>
      </div>

      <div className={styles.mealList}>
        {category.meals.map((meal, i) => {
          // --- Allergen matching ---
          const alertIngredientNames: string[] = [];
          if (allergenKeywords.length > 0) {
            for (const ing of meal.ingredients) {
              if (textMatchesAny(ing, allergenKeywords)) {
                alertIngredientNames.push(ing);
              }
            }
            for (const allergen of meal.allergens) {
              if (textMatchesAny(allergen, allergenKeywords)) {
                for (const ing of meal.ingredients) {
                  if (
                    textMatchesAny(ing, [allergen.toLowerCase()]) &&
                    !alertIngredientNames.includes(ing)
                  ) {
                    alertIngredientNames.push(ing);
                  }
                }
                if (!alertIngredientNames.some((n) => textMatchesAny(n, [allergen.toLowerCase()]))) {
                  if (!alertIngredientNames.includes(allergen)) {
                    alertIngredientNames.push(allergen);
                  }
                }
              }
            }
          }
          const hasAllergenMatch = alertIngredientNames.length > 0 ||
            (allergenKeywords.length > 0 && meal.allergens.some((a) => textMatchesAny(a, allergenKeywords)));

          // --- Local diet compatibility ---
          const dietTags = computeDietTags(meal.ingredients, meal.allergens, dietFilters);

          // --- Cook verb ---
          const cookVerb = normalizeCookVerb(meal.cook_verb);

          return (
            <MealCard
              key={`${category.label}-${i}`}
              originalName={meal.name_original}
              translatedName={meal.name_english}
              price={meal.price || undefined}
              cookVerb={cookVerb}
              dietTags={dietTags}
              description={meal.description}
              story={meal.story}
              ingredients={meal.ingredients}
              alertIngredients={hasAllergenMatch ? (alertIngredientNames.length > 0 ? alertIngredientNames : ["allergen"]) : undefined}
              defaultExpanded={false}
            />
          );
        })}
      </div>

      <div
        className={`${styles.backdrop} ${filterOpen ? styles.backdropVisible : ""}`}
        onClick={() => setFilterOpen(false)}
      />

      <div
        className={`${styles.dietFilterWrap} ${filterOpen ? styles.dietFilterExpanded : styles.dietFilterCollapsed}`}
        onClick={() => setFilterOpen((prev) => !prev)}
      >
        <DietFilter onChange={handleDietChange} />
      </div>
    </div>
  );
}
