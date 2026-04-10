import typo from "../components/TypographySample.module.css";
import styles from "./LoadingPage.module.css";

const BG_SRC = "/bg-start.png";
const VIDEO_SRC = "/loading-video.mp4";

export type LoadingPageProps = {
  status?: string;
};

export function LoadingPage({ status }: LoadingPageProps) {
  return (
    <div className={styles.root} data-name="Loading" aria-busy="true" aria-live="polite">
      <img className={styles.texture} src={BG_SRC} alt="" />

      <div className={styles.center}>
        <div className={styles.titleGroup}>
          <img className={styles.loadingGif} src="/Loading.gif" alt="Loading" />
          <p className={`${typo.subtitleMuted} ${styles.tagline}`}>
            {status || "We're reading every dish and uncovering its story."}
          </p>
        </div>

        <div className={styles.videoShell} data-name="loading video">
          <video
            className={styles.video}
            src={VIDEO_SRC}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-label="Loading animation"
          />
        </div>
      </div>
    </div>
  );
}
