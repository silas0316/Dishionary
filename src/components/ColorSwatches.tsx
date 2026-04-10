import styles from "./ColorSwatches.module.css";

const SWATCHES: { name: string; color: string }[] = [
  { name: "Red dark", color: "var(--color-red-dark)" },
  { name: "Red main", color: "var(--color-red-main)" },
  { name: "Red light", color: "var(--color-red-light)" },
  { name: "Red tint", color: "var(--color-red-tint)" },
  { name: "Green dark", color: "var(--color-green-dark)" },
  { name: "Green main", color: "var(--color-green-main)" },
  { name: "Green light", color: "var(--color-green-light)" },
  { name: "Green tint", color: "var(--color-green-tint)" },
  { name: "Black", color: "var(--color-black-main)" },
  { name: "Black 500", color: "var(--color-black-500)" },
  { name: "Black 300", color: "var(--color-black-300)" },
  { name: "Black 100", color: "var(--color-black-100)" },
  { name: "Black 50", color: "var(--color-black-50)" },
  { name: "White", color: "var(--color-white)" },
  { name: "White 80%", color: "var(--color-white-80)" },
  { name: "White 65%", color: "var(--color-white-65)" },
];

export function ColorSwatches() {
  return (
    <div className={styles.grid}>
      {SWATCHES.map(({ name, color }) => (
        <div key={name} className={styles.cell}>
          <div className={styles.swatch} style={{ background: color }} title={name} />
          <span className={styles.label}>{name}</span>
        </div>
      ))}
    </div>
  );
}
