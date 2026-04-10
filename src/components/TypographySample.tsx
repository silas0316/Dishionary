import styles from "./TypographySample.module.css";

/** Reference block for design-system text styles (matches Figma type ramp). */
export function TypographySample() {
  return (
    <div className={styles.stack}>
      <p className={styles.title}>Title</p>
      <p className={styles.cardTitle}>Card Title</p>
      <p className={styles.mealTitle}>Meal Title</p>
      <p className={styles.subtitle}>Subtitle</p>
      <p className={styles.body}>Body</p>
      <p className={styles.cta}>CTA</p>
      <p className={styles.tag}>Tag</p>
      <p className={styles.explanation}>Explanation</p>
    </div>
  );
}
