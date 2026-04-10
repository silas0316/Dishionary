import styles from "./TopNavOptions.module.css";

export type TopNavOptionsProps = {
  className?: string;
  count?: string;
  label?: string;
  variant?: "main" | "other";
  /** When variant is "other", show bottom accent bar (selected tab). */
  selected?: boolean;
  onClick?: () => void;
};

export function TopNavOptions({
  className,
  count = "10",
  label = "All",
  variant = "main",
  selected = false,
  onClick,
}: TopNavOptionsProps) {
  const isMain = variant === "main";
  const cls = isMain
    ? styles.main
    : selected
      ? styles.otherActive
      : styles.other;

  return (
    <button type="button" className={`${styles.row} ${cls} ${className ?? ""}`} onClick={onClick}>
      <span>{label}</span>
      <span>{count}</span>
    </button>
  );
}
