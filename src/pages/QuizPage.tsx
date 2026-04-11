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

interface AnswerState {
  questionId: string;
  selected: string;
  correct: string;
  revealImage: string;
}

function shuffle<T>(items: T[]) {
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
  const [hasStarted, setHasStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [finished, setFinished] = useState(false);

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

  const startNewTest = () => {
    if (!manifest) {
      return;
    }

    setHasStarted(true);
    setQuestions(shuffle(manifest.questions).slice(0, 10));
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setFinished(false);
  };

  const question = questions[currentIndex];
  const correctAnswer = question?.answer[lang] ?? "";
  const answered = selectedOption !== null;
  const isLastQuestion = currentIndex === questions.length - 1;
  const currentAnswer = answers.find((item) => item.questionId === question?.id);
  const correctCount = useMemo(() => answers.filter((item) => item.selected === item.correct).length, [answers]);

  const submitAnswer = (option: string) => {
    if (!question || answered) {
      return;
    }

    setSelectedOption(option);
    setAnswers((prev) => [
      ...prev,
      {
        questionId: question.id,
        selected: option,
        correct: correctAnswer,
        revealImage: question.revealImage
      }
    ]);
  };

  const nextStep = () => {
    if (!answered) {
      return;
    }

    if (isLastQuestion) {
      setFinished(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
  };

  return (
    <section className={styles.wrap}>
      <PageHeader title={lang === "cs" ? "Kviz" : "Quiz"} color="#7b3ff2" />

      {!hasStarted ? (
        <article className={`${styles.card} ${styles.startCard}`}>
          <p className={styles.eyebrow}>{manifest?.title[lang] ?? (lang === "cs" ? "Nacitani..." : "Loading...")}</p>
          <h2 className={styles.heading}>
            {lang === "cs" ? "Poznavani struktur z UZ obrazu" : "Identify structures from ultrasound images"}
          </h2>
          <p className={styles.copy}>
            {lang === "cs"
              ? "Kviz obsahuje 10 nahodne vybranych otazek. V kazde otazce sipka ukazuje na jednu strukturu a po odpovedi se zobrazi puvodni overlay."
              : "The quiz contains 10 randomly selected questions. In each question the arrow points to one structure and the original overlay is shown after answering."}
          </p>
          <button type="button" className={styles.startButton} onClick={startNewTest} disabled={!manifest}>
            {lang === "cs" ? "Zahajit kviz" : "Start quiz"}
          </button>
        </article>
      ) : !finished ? (
        <article className={styles.card}>
          <div className={styles.head}>
            <div>
              <p className={styles.eyebrow}>{manifest?.title[lang] ?? (lang === "cs" ? "Nacitani..." : "Loading...")}</p>
              <h2 className={styles.heading}>
                {lang === "cs" ? "Poznej oznacenou strukturu" : "Identify the marked structure"}
              </h2>
            </div>
            <strong className={styles.progress}>
              {questions.length ? (lang === "cs" ? `Otazka ${currentIndex + 1}/10` : `Question ${currentIndex + 1}/10`) : ""}
            </strong>
          </div>

          <p className={styles.copy}>
            {lang === "cs"
              ? "Na kazdem obrazku sipka ukazuje na jednu strukturu. Po zodpovezeni se zobrazi puvodni overlay."
              : "In each image the arrow points to a single structure. After answering, the original labeled overlay is shown."}
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
                {question.options.map((option, index) => {
                  const optionText = option[lang];
                  const isSelected = selectedOption === optionText;
                  const isCorrect = optionText === correctAnswer;
                  const stateClass = !answered
                    ? ""
                    : isCorrect
                      ? styles.optionCorrect
                      : isSelected
                        ? styles.optionWrong
                        : styles.optionIdle;

                  return (
                    <button
                      key={`${question.id}-${optionText}`}
                      type="button"
                      className={`${styles.option} ${stateClass}`.trim()}
                      onClick={() => submitAnswer(optionText)}
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
                    <strong
                      className={
                        currentAnswer?.selected === currentAnswer?.correct ? styles.feedbackCorrect : styles.feedbackWrong
                      }
                    >
                      {currentAnswer?.selected === currentAnswer?.correct
                        ? lang === "cs"
                          ? "Spravne"
                          : "Correct"
                        : lang === "cs"
                          ? `Nespravne. Spravna odpoved: ${correctAnswer}.`
                          : `Incorrect. Correct answer: ${correctAnswer}.`}
                    </strong>
                  ) : (
                    <span>{lang === "cs" ? "Vyber jednu moznost A-D." : "Choose one option A-D."}</span>
                  )}
                </div>

                <button type="button" className={styles.nextButton} onClick={nextStep} disabled={!answered}>
                  {isLastQuestion ? (lang === "cs" ? "Vyhodnotit test" : "Finish test") : lang === "cs" ? "Dalsi otazka" : "Next question"}
                </button>
              </div>
            </>
          ) : null}
        </article>
      ) : (
        <article className={styles.card}>
          <div className={styles.summaryHead}>
            <p className={styles.eyebrow}>{manifest?.title[lang]}</p>
            <h2 className={styles.heading}>{lang === "cs" ? "Vyhodnoceni testu" : "Test results"}</h2>
            <p className={styles.score}>
              {lang === "cs" ? `Skore ${correctCount} / ${answers.length}` : `Score ${correctCount} / ${answers.length}`}
            </p>
          </div>

          <div className={styles.summaryList}>
            {answers.map((item, index) => (
              <article key={item.questionId} className={styles.reviewCard}>
                <img className={styles.reviewImage} src={item.revealImage} alt={item.correct} />
                <div className={styles.reviewBody}>
                  <strong>{lang === "cs" ? `Otazka ${index + 1}` : `Question ${index + 1}`}</strong>
                  <span className={item.selected === item.correct ? styles.feedbackCorrect : styles.feedbackWrong}>
                    {item.selected === item.correct
                      ? lang === "cs"
                        ? `Spravne: ${item.correct}`
                        : `Correct: ${item.correct}`
                      : lang === "cs"
                        ? `Tvoje odpoved: ${item.selected} | Spravne: ${item.correct}`
                        : `Your answer: ${item.selected} | Correct: ${item.correct}`}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <button type="button" className={styles.nextButton} onClick={startNewTest}>
            {lang === "cs" ? "Spustit novy test" : "Start new test"}
          </button>
        </article>
      )}
    </section>
  );
}
