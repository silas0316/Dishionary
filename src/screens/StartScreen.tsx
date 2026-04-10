import typo from "../components/TypographySample.module.css";
import styles from "./StartScreen.module.css";

const BG_SRC = "/bg-start.png";

export type StartScreenProps = {
  onContinue?: () => void;
};

export function StartScreen({ onContinue }: StartScreenProps) {
  return (
    <div className={styles.root} data-name="Start screen" onClick={onContinue} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onContinue?.(); }}>
      <img className={styles.texture} src={BG_SRC} alt="" />
      <div className={styles.content} data-name="Title + Subtitle">
        <h1 className={typo.titleBrand}>Dishionary</h1>
        <p className={typo.subtitleMuted}>Understand the meals from all around the world</p>
      </div>
    </div>
  );
}
