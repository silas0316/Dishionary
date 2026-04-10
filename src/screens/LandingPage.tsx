import { useCallback, useId, useRef, useState } from "react";
import { imgCamera01, imgClose, imgUpload03 } from "../assets/landingAssets";
import { Cta } from "../components/Cta";
import { MultipleChoiceOptions } from "../components/MultipleChoiceOptions";
import typo from "../components/TypographySample.module.css";
import styles from "./LandingPage.module.css";

const BG_SRC = "/bg-start.png";

const ALLERGENS = [
  "Milk",
  "Egg",
  "Peanut",
  "Soy",
  "Nuts (almonds, walnuts, cashews, etc.)",
  "Wheat",
  "Fish",
  "Sesame",
  "Shellfish (shrimp, crab, lobster)",
] as const;

const MAX_PHOTOS = 5;

/** Read a File as a data-URL (more reliable than blob URLs on iOS). */
function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export type LandingPageProps = {
  /** Called after user taps "Translate the Menu" with collected files and allergens. */
  onTranslate?: (files: File[], allergens: string[]) => void;
};

export function LandingPage({ onTranslate }: LandingPageProps) {
  const [selectedAllergens, setSelectedAllergens] = useState<Set<string>>(() => new Set());
  const [photos, setPhotos] = useState<{ url: string; file: File }[]>([]);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const toggleAllergen = useCallback((name: string) => {
    setSelectedAllergens((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const addFiles = useCallback(async (files: FileList | null) => {
    if (!files?.length) return;
    const fileArr = Array.from(files);
    for (const file of fileArr) {
      // On iOS, camera-captured photos can have an empty file.type.
      if (file.type && !file.type.startsWith("image/")) continue;
      const dataUrl = await readAsDataURL(file);
      setPhotos((prev) => {
        if (prev.length >= MAX_PHOTOS) return prev;
        return [...prev, { url: dataUrl, file }];
      });
    }
  }, []);

  const onCameraChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(e.target.files);
      e.target.value = "";
    },
    [addFiles],
  );

  const onUploadChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(e.target.files);
      e.target.value = "";
    },
    [addFiles],
  );

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleTranslate = useCallback(() => {
    if (photos.length === 0) {
      window.alert("Please add at least one photo of the menu.");
      return;
    }
    const allergenList = [...selectedAllergens].sort();
    const files = photos.map((p) => p.file);
    console.info("[Dishionary] Translate", {
      allergens: allergenList,
      photoCount: files.length,
    });
    if (onTranslate) {
      onTranslate(files, allergenList);
    }
  }, [onTranslate, photos, selectedAllergens]);

  return (
    <div className={styles.root} data-name="Homepage">
      <img className={styles.texture} src={BG_SRC} alt="" />

      {/* File inputs at root level so allergen re-renders don't recreate them (iOS Safari fix) */}
      <input
        ref={cameraInputRef}
        className={styles.hiddenInput}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onCameraChange}
      />
      <input
        ref={uploadInputRef}
        className={styles.hiddenInput}
        type="file"
        accept="image/*"
        multiple
        onChange={onUploadChange}
      />

      <div className={styles.scroll}>
        <section className={styles.panel} aria-labelledby={`${id}-step1`}>
          <p id={`${id}-step1`} className={`${typo.subtitleMuted} ${styles.stepLabel}`}>
            Step 1
          </p>
          <div className={styles.titleBlock}>
            <h2 className={typo.cardTitleMuted}>Tell us your allergens</h2>
            <p className={typo.explanationMuted}>We'll flag meals that contain them.</p>
          </div>
          <div className={styles.chipGrid} role="group" aria-label="Allergens">
            {ALLERGENS.map((label) => (
              <MultipleChoiceOptions
                key={label}
                label={label}
                state={selectedAllergens.has(label) ? "red slected" : "default"}
                onClick={() => toggleAllergen(label)}
              />
            ))}
          </div>
        </section>

        <hr className={styles.divider} />

        <section className={styles.panelStep2} aria-labelledby={`${id}-step2`}>
          <p id={`${id}-step2`} className={`${typo.subtitleMuted} ${styles.stepLabel}`}>
            Step 2
          </p>
          <div className={styles.titleBlock}>
            <h2 className={typo.cardTitle}>Add the image of the menu</h2>
            <p className={typo.explanationMuted}>Up to 5 photos</p>
          </div>

          <div className={styles.photoRow}>
            <button
              type="button"
              className={styles.photoAction}
              onClick={() => cameraInputRef.current?.click()}
            >
              <span className={styles.iconWrapRed}>
                <img className={styles.iconImg} src={imgCamera01} alt="" />
              </span>
              <span className={styles.photoLabel}>Take Photo</span>
            </button>
            <button
              type="button"
              className={`${styles.photoAction} ${styles.photoActionUpload}`}
              onClick={() => uploadInputRef.current?.click()}
            >
              <span className={styles.iconWrapGreen}>
                <img className={styles.iconImg} src={imgUpload03} alt="" />
              </span>
              <span className={styles.photoLabel}>Upload Image</span>
            </button>
          </div>

          <div className={styles.photosStrip}>
            {photos.map((photo, i) => (
              <div key={i} className={styles.thumbWrap}>
                <img className={styles.thumb} src={photo.url} alt="" />
                <button
                  type="button"
                  className={styles.removeBtn}
                  aria-label={`Remove photo ${i + 1}`}
                  onClick={() => removePhoto(i)}
                >
                  <img src={imgClose} alt="" />
                </button>
              </div>
            ))}
            <span className={styles.photoCount}>
              {photos.length} / {MAX_PHOTOS} photos
            </span>
          </div>

          <Cta className={styles.ctaFull} text="Translate the Menu" onClick={handleTranslate} />
        </section>
      </div>
    </div>
  );
}
