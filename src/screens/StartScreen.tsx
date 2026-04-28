import { useState } from "react";
import typo from "../components/TypographySample.module.css";
import styles from "./StartScreen.module.css";

const BG_SRC = `${import.meta.env.BASE_URL}bg-start.png`;

export type StartScreenProps = {
  initialKey?: string;
  onStart?: (apiKey: string) => void;
};

export function StartScreen({ initialKey = "", onStart }: StartScreenProps) {
  const [key, setKey] = useState(initialKey);

  const handleStart = () => {
    const trimmed = key.trim();
    if (!trimmed) return;
    onStart?.(trimmed);
  };

  return (
    <div className={styles.root} data-name="Start screen">
      <img className={styles.texture} src={BG_SRC} alt="" />
      <div className={styles.content} data-name="Title + Subtitle">
        <h1 className={typo.titleBrand}>Dishionary</h1>
        <p className={typo.subtitleMuted}>Understand the meals from all around the world</p>
      </div>
      <div className={styles.inputWrap}>
        <div className={styles.inputField}>
          <textarea
            className={styles.input}
            placeholder="Please paste your Gemini API key over here"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
          <button
            type="button"
            className={styles.cta}
            onClick={handleStart}
            disabled={!key.trim()}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
