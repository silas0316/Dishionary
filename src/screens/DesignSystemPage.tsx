import {
  ColorSwatches,
  Cta,
  DietFilter,
  MealCard,
  MultipleChoiceOptions,
  Tag,
  TopNavOptions,
  TypographySample,
} from "../components";
import styles from "./DesignSystemPage.module.css";

export function DesignSystemPage() {
  return (
    <div className={styles.page}>
      <section>
        <h2 className={styles.sectionTitle}>Colors</h2>
        <ColorSwatches />
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Typography</h2>
        <TypographySample />
      </section>

      <section>
        <h2 className={styles.sectionTitle}>CTA</h2>
        <div className={styles.ctaRow}>
          <Cta />
          <Cta state="pressed" />
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Tabs</h2>
        <div className={styles.navDemo}>
          <TopNavOptions variant="main" />
          <TopNavOptions variant="other" selected />
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Tags</h2>
        <div className={styles.row}>
          <Tag variant="ingredient" text="Pork" />
          <Tag variant="alert" />
          <Tag variant="cooking" />
          <Tag variant="diet" />
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Filter chips</h2>
        <div className={styles.row}>
          <MultipleChoiceOptions />
          <MultipleChoiceOptions state="red slected" />
          <MultipleChoiceOptions state="green selected" />
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Meal card</h2>
        <MealCard />
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Diet filter sheet</h2>
        <DietFilter />
      </section>
    </div>
  );
}
