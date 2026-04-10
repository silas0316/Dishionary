import styles from "./MultipleChoiceOptions.module.css";

export type MultipleChoiceOptionsProps = {
  className?: string;
  label?: string;
  /** Matches Figma typo "red slected". */
  state?: "default" | "red slected" | "green selected";
  onClick?: (e: React.MouseEvent) => void;
};

export function MultipleChoiceOptions({
  className,
  label = "Dairy-free",
  state = "default",
  onClick,
}: MultipleChoiceOptionsProps) {
  const mod =
    state === "red slected"
      ? styles.redSelected
      : state === "green selected"
        ? styles.greenSelected
        : "";

  const isPressed = state === "red slected" || state === "green selected";

  return (
    <button
      type="button"
      className={`${styles.chip} ${mod} ${className ?? ""}`}
      onClick={onClick}
      aria-pressed={isPressed}
    >
      {label}
    </button>
  );
}
