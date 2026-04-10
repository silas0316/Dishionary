import { useCallback, useRef, useState } from "react";
import { LandingPage } from "./screens/LandingPage";
import { LoadingPage } from "./screens/LoadingPage";
import { ResultPage } from "./screens/ResultPage";
import { StartScreen } from "./screens/StartScreen";
import { analyzeMenu, type FinalMenuItem } from "./services/geminiMenuService";
import styles from "./App.module.css";

type AppScreen = "start" | "landing" | "loading" | "result";

export default function App() {
  const [appScreen, setAppScreen] = useState<AppScreen>("start");
  const [menuResult, setMenuResult] = useState<FinalMenuItem[]>([]);
  const [loadingStatus, setLoadingStatus] = useState("Loading...");
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const filesRef = useRef<File[]>([]);

  const handleTranslate = useCallback((files: File[], allergens: string[]) => {
    filesRef.current = files;
    setSelectedAllergens(allergens);
    setAppScreen("loading");

    analyzeMenu(files, (step) => setLoadingStatus(step))
      .then((result) => {
        setMenuResult(result);
        setAppScreen("result");
      })
      .catch((err) => {
        console.error("Menu analysis failed:", err);
        alert(`Analysis failed: ${err.message}`);
        setAppScreen("landing");
      });
  }, []);

  return (
    <div className={styles.shell}>
      <main className={styles.scroll}>
        {appScreen === "start" ? (
          <StartScreen onContinue={() => setAppScreen("landing")} />
        ) : appScreen === "loading" ? (
          <LoadingPage status={loadingStatus} />
        ) : appScreen === "result" ? (
          <ResultPage
            onBack={() => setAppScreen("landing")}
            menuItems={menuResult}
            userAllergens={selectedAllergens}
          />
        ) : (
          <LandingPage onTranslate={handleTranslate} />
        )}
      </main>
    </div>
  );
}
