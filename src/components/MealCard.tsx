import { useState } from "react";
import { imgAlertTriangle, imgChevronDown, imgChevronUp } from "../assets/icons";
import { Tag } from "./Tag";
import styles from "./MealCard.module.css";

export type MealCardProps = {
  className?: string;
  originalName?: string;
  translatedName?: string;
  /** Price string from the menu (e.g. "$11.23" or "150"). Shown only when provided. */
  price?: string;
  /** Cooking method (e.g. "Stir-Fry", "Braise", "Grill", "Raw"). */
  cookVerb?: string;
  /** Diet labels this dish is compatible with (e.g. ["Vegetarian", "Dairy-free"]). */
  dietTags?: string[];
  description?: string;
  story?: string;
  ingredients?: string[];
  /** Ingredients that should show the alert variant (allergen match). */
  alertIngredients?: string[];
  defaultExpanded?: boolean;
};

export function MealCard({
  className,
  originalName = "หมูพะโล้",
  translatedName = "Braised Pork in Five-Spice",
  price,
  cookVerb,
  dietTags = [],
  description = "A Chinese-influenced Thai dish where pork is slowly braised in a soy-based five-spice broth.",
  story,
  ingredients = ["Pork", "Egg", "Five Spice Powder", "Soy Sauce", "Garlic"],
  alertIngredients = [],
  defaultExpanded = true,
}: MealCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasAlerts = alertIngredients.length > 0;

  // Case-insensitive + substring matching for alert ingredients
  const alertLower = alertIngredients.map((a) => a.toLowerCase());
  const isAlert = (ing: string): boolean => {
    const lower = ing.toLowerCase();
    return alertLower.some((a) => lower.includes(a) || a.includes(lower));
  };

  // Sort ingredients: alert ones first, then regular
  const sortedIngredients = [...ingredients].sort((a, b) => {
    const aAlert = isAlert(a) ? 0 : 1;
    const bAlert = isAlert(b) ? 0 : 1;
    return aAlert - bAlert;
  });

  return (
    <article className={`${expanded ? styles.cardExpanded : styles.card} ${className ?? ""}`}>
      <button
        type="button"
        className={styles.headerBtn}
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <div className={styles.names}>
          <div className={styles.original}>{originalName}</div>
          <div className={styles.translated}>{translatedName}</div>
        </div>
        {hasAlerts && (
          <span className={styles.alertIcon} aria-label="Contains allergens">
            <img src={imgAlertTriangle} alt="" />
          </span>
        )}
        {price && (
          <div className={styles.price}>
            <span>{price}</span>
          </div>
        )}
        <span className={styles.chevron} aria-hidden>
          <img src={expanded ? imgChevronUp : imgChevronDown} alt="" />
        </span>
      </button>

      {expanded && (
        <>
          {(dietTags.length > 0 || cookVerb) && (
            <div className={styles.tagRow}>
              {dietTags.map((diet) => (
                <Tag key={diet} variant="diet" text={diet} />
              ))}
              {cookVerb && <Tag variant="cooking" text={cookVerb} />}
            </div>
          )}
          <div className={styles.tagRow}>
            {sortedIngredients.map((ing) => (
              <Tag
                key={ing}
                variant={isAlert(ing) ? "alert" : "ingredient"}
                text={ing}
              />
            ))}
          </div>
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Description</p>
            <p className={styles.bodyText}>{description}</p>
          </div>
          {story ? (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>Story</p>
              <p className={styles.bodyText}>{story}</p>
            </div>
          ) : null}
        </>
      )}
    </article>
  );
}
