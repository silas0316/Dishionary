import typo from "../components/TypographySample.module.css";
import styles from "./LoadingPage.module.css";

const BG_SRC = `${import.meta.env.BASE_URL}bg-start.png`;
const VIDEO_SRC = `${import.meta.env.BASE_URL}loading-video.mp4`;
const LOADING_GIF = `${import.meta.env.BASE_URL}Loading.gif`;

export type LoadingPageProps = {
  status?: string;
};

export function LoadingPage({ status }: LoadingPageProps) {
  return (
    <div className={styles.root} data-name="Loading" aria-busy="true" aria-live="polite">
      <img className={styles.texture} src={BG_SRC} alt="" />

      <div className={styles.center}>
        <div className={styles.titleGroup}>
          <img className={styles.loadingGif} src={LOADING_GIF} alt="Loading" />
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
