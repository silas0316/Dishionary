import { useCallback, useEffect, useState } from "react";
import { MultipleChoiceOptions } from "./MultipleChoiceOptions";
import styles from "./DietFilter.module.css";

const DEFAULT_OPTIONS = [
  "Vegan",
  "Vegetarian",
  "Pescatarian",
  "Dairy-free",
  "Gluten-free",
  "No beef",
  "No fish",
  "No chicken",
  "No pork",
  "No lamb",
];

export type DietFilterProps = {
  className?: string;
  options?: string[];
  /** Called whenever the set of active filters changes. */
  onChange?: (selected: Set<string>) => void;
};

export function DietFilter({ className, options = DEFAULT_OPTIONS, onChange }: DietFilterProps) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const toggle = useCallback((label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  // Notify parent whenever selection changes
  useEffect(() => {
    onChange?.(selected);
  }, [selected, onChange]);

  return (
    <section className={`${styles.sheet} ${className ?? ""}`} aria-label="Diet filter">
      <div className={styles.handle} aria-hidden />
      <h2 className={styles.title}>Diet Filter</h2>
      <div className={styles.grid}>
        {options.map((label) => (
          <MultipleChoiceOptions
            key={label}
            label={label}
            state={selected.has(label) ? "green selected" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              toggle(label);
            }}
          />
        ))}
      </div>
    </section>
  );
}
