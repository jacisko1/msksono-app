import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useLanguage } from "../data/language";
import styles from "./QuizPage.module.css";

interface LocalizedText {
  cs: string;
  en: string;
}

interface QuizQuestion {
  id: string;
  image: string;
  revealImage: string;
  answer: LocalizedText;
  options: LocalizedText[];
}

interface QuizManifest {
  title: LocalizedText;
  questions: QuizQuestion[];
}

function shuffleOptions<T>(items: T[]) {
  const array = [...items];

  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }

  return array;
}

export default function QuizPage() {
  const { lang } = useLanguage();
  const [manifest, setManifest] = useState<QuizManifest | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<LocalizedText[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const response = await fetch("/assets/quiz/shoulder/manifest.json");
      const data = (await response.json()) as QuizManifest;

      if (!cancelled) {
        setManifest(data);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const question = manifest?.questions[activeIndex];
  const correctAnswer = question?.answer[lang] ?? "";
  const answered = selectedOption !== null;
  const isCorrect = answered && selectedOption === correctAnswer;

  useEffect(() => {
    if (!question) {
      return;
    }

    setShuffledOptions(shuffleOptions(question.options));
    setSelectedOption(null);
  }, [question?.id]);

  const progressLabel = useMemo(() => {
    if (!manifest) {
      return "";
    }

    return lang === "cs"
      ? `Otázka ${activeIndex + 1} z ${manifest.questions.length}`
      : `Question ${activeIndex + 1} of ${manifest.questions.length}`;
  }, [activeIndex, lang, manifest]);

  const nextQuestion = () => {
    if (!manifest?.questions.length) {
      return;
    }

    let nextIndex = activeIndex;

    if (manifest.questions.length > 1) {
      while (nextIndex === activeIndex) {
        nextIndex = Math.floor(Math.random() * manifest.questions.length);
      }
    }

    setActiveIndex(nextIndex);
  };

  return (
    <section className={styles.wrap}>
      <PageHeader title={lang === "cs" ? "Kvíz" : "Quiz"} color="#7b3ff2" />

      <article className={styles.card}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>{manifest?.title[lang] ?? (lang === "cs" ? "Načítání..." : "Loading...")}</p>
            <h2 className={styles.heading}>
              {lang === "cs" ? "Poznej označenou strukturu" : "Identify the highlighted structure"}
            </h2>
          </div>
          {manifest ? <strong className={styles.progress}>{progressLabel}</strong> : null}
        </div>

        <p className={styles.copy}>
          {lang === "cs"
            ? "Na obrázku je zvýrazněna jedna struktura. Vyber správnou možnost. Po odpovědi se zobrazí celý overlay s popisky."
            : "One structure is highlighted in the image. Choose the correct option. After answering, the full labeled overlay is shown."}
        </p>

        {question ? (
          <>
            <div className={styles.imageFrame}>
              <img
                className={styles.image}
                src={answered ? question.revealImage : question.image}
                alt={answered ? (lang === "cs" ? "Overlay s popisky" : "Labeled overlay") : correctAnswer}
              />
            </div>

            <div className={styles.options}>
              {shuffledOptions.map((option, index) => {
                const optionText = option[lang];
                const isSelected = selectedOption === optionText;
                const isAnswer = answered && optionText === correctAnswer;
                const stateClass = !answered
                  ? ""
                  : isAnswer
                    ? styles.optionCorrect
                    : isSelected
                      ? styles.optionWrong
                      : styles.optionIdle;

                return (
                  <button
                    key={`${question.id}-${optionText}`}
                    type="button"
                    className={`${styles.option} ${stateClass}`.trim()}
                    onClick={() => {
                      if (!answered) {
                        setSelectedOption(optionText);
                      }
                    }}
                    disabled={answered}
                  >
                    <span className={styles.optionKey}>{String.fromCharCode(65 + index)}</span>
                    <span>{optionText}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.footer}>
              <div className={styles.feedback}>
                {answered ? (
                  <strong className={isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}>
                    {isCorrect
                      ? lang === "cs"
                        ? "Správně"
                        : "Correct"
                      : lang === "cs"
                        ? `Nesprávně. Správná odpověď je ${correctAnswer}.`
                        : `Incorrect. The correct answer is ${correctAnswer}.`}
                  </strong>
                ) : (
                  <span>{lang === "cs" ? "Vyber jednu z možností A-D." : "Choose one of the A-D options."}</span>
                )}
              </div>

              <button type="button" className={styles.nextButton} onClick={nextQuestion} disabled={!manifest}>
                {lang === "cs" ? "Další otázka" : "Next question"}
              </button>
            </div>
          </>
        ) : null}
      </article>
    </section>
  );
}
