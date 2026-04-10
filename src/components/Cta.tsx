import styles from "./Cta.module.css";

export type CtaProps = {
  className?: string;
  state?: "default" | "pressed";
  text?: string;
  type?: "button" | "submit";
  onClick?: () => void;
};

export function Cta({
  className,
  state = "default",
  text = "Translate the Menu",
  type = "button",
  onClick,
}: CtaProps) {
  return (
    <button
      type={type}
      className={`${styles.cta} ${state === "pressed" ? styles.pressed : styles.default} ${className ?? ""}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
