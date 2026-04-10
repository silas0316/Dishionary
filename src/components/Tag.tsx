import { imgAlertTriangle } from "../assets/icons";
import styles from "./Tag.module.css";

export type TagProps = {
  className?: string;
  variant?: "ingredient" | "alert" | "cooking" | "diet";
  /** Label text (defaults match Figma examples per variant). */
  text?: string;
};

const defaults: Record<NonNullable<TagProps["variant"]>, string> = {
  ingredient: "Pork",
  alert: "Pork",
  cooking: "Braise",
  diet: "Dairy-Free",
};

export function Tag({ className, variant = "ingredient", text }: TagProps) {
  const label = text ?? defaults[variant];

  if (variant === "alert") {
    return (
      <span className={`${styles.tag} ${styles.alert} ${className ?? ""}`}>
        <span className={styles.icon} aria-hidden>
          <img src={imgAlertTriangle} alt="" />
        </span>
        <span>{label}</span>
      </span>
    );
  }

  const mod =
    variant === "cooking" ? styles.cooking : variant === "diet" ? styles.diet : styles.ingredient;

  return (
    <span className={`${styles.tag} ${mod} ${className ?? ""}`}>{label}</span>
  );
}
