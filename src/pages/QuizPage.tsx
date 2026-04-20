import { type ChangeEvent, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useLanguage } from "../data/language";
import styles from "./QuizPage.module.css";

interface LocalizedText {
  cs: string;
  en: string;
}

interface StandardQuizQuestion {
  id: string;
  image: string;
  revealImage: string;
  answer: LocalizedText;
  options: LocalizedText[];
}

interface StandardQuizManifest {
  title: LocalizedText;
  questions: StandardQuizQuestion[];
}

interface StandardAnswerState {
  questionId: string;
  selected: string;
  correct: string;
  revealImage: string;
}

type QuizMode = "menu" | "standard" | "author";
type AuthorView = "library" | "editor" | "play";
type ShapeType = "rectangle" | "circle" | "polygon";

interface Point {
  x: number;
  y: number;
}

interface CustomQuizArea {
  id: string;
  type: ShapeType;
  label: string;
  explanation: string;
  overlayImage?: string;
  overlayImageName?: string;
  points: Point[];
}

interface CustomQuiz {
  id: string;
  title: string;
  imageSrc: string;
  imageName: string;
  imageWidth: number;
  imageHeight: number;
  createdAt: string;
  updatedAt: string;
  areas: CustomQuizArea[];
}

interface CustomQuizDraft {
  id: string | null;
  title: string;
  imageSrc: string;
  imageName: string;
  imageWidth: number;
  imageHeight: number;
  areas: CustomQuizArea[];
}

interface PendingAreaDraft {
  type: ShapeType;
  points: Point[];
  label: string;
  explanation: string;
  overlayImage?: string;
  overlayImageName?: string;
}

interface DragDraft {
  type: "rectangle" | "circle";
  start: Point;
  current: Point;
}

interface PlayAnswer {
  areaId: string;
  selectedAreaId: string;
  correct: boolean;
}

const STANDARD_MANIFEST_URL = "/assets/quiz/shoulder/manifest.json";
const CUSTOM_QUIZZES_STORAGE_KEY = "msksono-custom-quizzes";

function shuffle<T>(items: T[]) {
  const array = [...items];

  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }

  return array;
}

function createEmptyDraft(): CustomQuizDraft {
  return {
    id: null,
    title: "",
    imageSrc: "",
    imageName: "",
    imageWidth: 0,
    imageHeight: 0,
    areas: []
  };
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneQuiz<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function readCustomQuizzes(): CustomQuiz[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CUSTOM_QUIZZES_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CustomQuiz[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCustomQuizzes(quizzes: CustomQuiz[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CUSTOM_QUIZZES_STORAGE_KEY, JSON.stringify(quizzes));
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function getPointFromPointer(event: ReactPointerEvent<HTMLElement>, element: HTMLElement): Point {
  const rect = element.getBoundingClientRect();
  const x = clamp((event.clientX - rect.left) / rect.width);
  const y = clamp((event.clientY - rect.top) / rect.height);
  return { x, y };
}

function distance(first: Point, second: Point) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function pointToSvg(point: Point, width: number, height: number) {
  return {
    x: point.x * width,
    y: point.y * height
  };
}

function getRectanglePoints(start: Point, end: Point): Point[] {
  const left = Math.min(start.x, end.x);
  const right = Math.max(start.x, end.x);
  const top = Math.min(start.y, end.y);
  const bottom = Math.max(start.y, end.y);

  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom }
  ];
}

function getCircleRadius(area: CustomQuizArea | PendingAreaDraft) {
  if (area.points.length < 2) {
    return 0;
  }

  return distance(area.points[0], area.points[1]);
}

function isPointInsidePolygon(point: Point, polygon: Point[]) {
  let inside = false;

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const current = polygon[index];
    const before = polygon[previous];

    const intersects =
      current.y > point.y !== before.y > point.y &&
      point.x < ((before.x - current.x) * (point.y - current.y)) / ((before.y - current.y) || Number.EPSILON) + current.x;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function isPointInsideArea(point: Point, area: CustomQuizArea) {
  if (area.type === "circle") {
    return distance(point, area.points[0]) <= getCircleRadius(area);
  }

  const polygon = area.type === "rectangle" ? getRectanglePoints(area.points[0], area.points[1]) : area.points;
  return isPointInsidePolygon(point, polygon);
}

function areaToSvgPoints(area: CustomQuizArea | PendingAreaDraft, width: number, height: number) {
  const polygon = area.type === "rectangle" ? getRectanglePoints(area.points[0], area.points[1]) : area.points;
  return polygon.map((point) => {
    const svgPoint = pointToSvg(point, width, height);
    return `${svgPoint.x},${svgPoint.y}`;
  }).join(" ");
}

function formatDate(value: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("File could not be read."));
    reader.readAsDataURL(file);
  });
}

function loadImageDimensions(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Image dimensions could not be loaded."));
    image.src = src;
  });
}

export default function QuizPage() {
  const { lang } = useLanguage();
  const locale = lang === "cs" ? "cs-CZ" : "en-US";
  const editorCanvasRef = useRef<HTMLDivElement | null>(null);
  const playCanvasRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<QuizMode>("menu");
  const [authorView, setAuthorView] = useState<AuthorView>("library");

  const [manifest, setManifest] = useState<StandardQuizManifest | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [questions, setQuestions] = useState<StandardQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<StandardAnswerState[]>([]);
  const [finished, setFinished] = useState(false);

  const [customQuizzes, setCustomQuizzes] = useState<CustomQuiz[]>([]);
  const [editorDraft, setEditorDraft] = useState<CustomQuizDraft>(createEmptyDraft());
  const [currentTool, setCurrentTool] = useState<ShapeType>("rectangle");
  const [dragDraft, setDragDraft] = useState<DragDraft | null>(null);
  const [polygonDraft, setPolygonDraft] = useState<Point[]>([]);
  const [pendingArea, setPendingArea] = useState<PendingAreaDraft | null>(null);

  const [playQuiz, setPlayQuiz] = useState<CustomQuiz | null>(null);
  const [playQuestions, setPlayQuestions] = useState<CustomQuizArea[]>([]);
  const [playIndex, setPlayIndex] = useState(0);
  const [playAnswers, setPlayAnswers] = useState<PlayAnswer[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [playFinished, setPlayFinished] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch(STANDARD_MANIFEST_URL);
        const data = (await response.json()) as StandardQuizManifest;

        if (!cancelled) {
          setManifest(data);
        }
      } catch {
        if (!cancelled) {
          setManifest(null);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const sync = () => setCustomQuizzes(readCustomQuizzes());
    sync();

    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === CUSTOM_QUIZZES_STORAGE_KEY) {
        sync();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const startNewTest = () => {
    if (!manifest) {
      return;
    }

    setMode("standard");
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

  const openAuthorLibrary = () => {
    setMode("author");
    setAuthorView("library");
    setPlayQuiz(null);
    setPlayQuestions([]);
    setPlayAnswers([]);
    setPlayFinished(false);
    setSelectedAreaId(null);
  };

  const startNewAuthorQuiz = () => {
    setMode("author");
    setAuthorView("editor");
    setEditorDraft(createEmptyDraft());
    setCurrentTool("rectangle");
    setDragDraft(null);
    setPolygonDraft([]);
    setPendingArea(null);
  };

  const saveCustomQuizzesAndSync = (nextQuizzes: CustomQuiz[]) => {
    writeCustomQuizzes(nextQuizzes);
    setCustomQuizzes(nextQuizzes);
  };

  const openQuizInEditor = (quiz: CustomQuiz) => {
    setMode("author");
    setAuthorView("editor");
    setEditorDraft({
      id: quiz.id,
      title: quiz.title,
      imageSrc: quiz.imageSrc,
      imageName: quiz.imageName,
      imageWidth: quiz.imageWidth,
      imageHeight: quiz.imageHeight,
      areas: cloneQuiz(quiz.areas)
    });
    setCurrentTool("rectangle");
    setDragDraft(null);
    setPolygonDraft([]);
    setPendingArea(null);
  };

  const deleteCustomQuiz = (quizId: string) => {
    const nextQuizzes = customQuizzes.filter((quiz) => quiz.id !== quizId);
    saveCustomQuizzesAndSync(nextQuizzes);

    if (playQuiz?.id === quizId) {
      setPlayQuiz(null);
      setPlayQuestions([]);
      setPlayAnswers([]);
      setPlayFinished(false);
      setAuthorView("library");
    }
  };

  const startPlayQuiz = (quiz: CustomQuiz) => {
    setMode("author");
    setAuthorView("play");
    setPlayQuiz(cloneQuiz(quiz));
    setPlayQuestions(shuffle(quiz.areas));
    setPlayIndex(0);
    setPlayAnswers([]);
    setSelectedAreaId(null);
    setPlayFinished(false);
  };

  const currentPlayArea = playQuestions[playIndex];
  const playAnswered = selectedAreaId !== null;
  const playCorrectCount = useMemo(() => playAnswers.filter((item) => item.correct).length, [playAnswers]);

  const handleBaseImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const imageSrc = await fileToDataUrl(file);
    const dimensions = await loadImageDimensions(imageSrc);

    setEditorDraft((prev) => ({
      ...prev,
      imageSrc,
      imageName: file.name,
      imageWidth: dimensions.width,
      imageHeight: dimensions.height,
      areas: []
    }));

    setDragDraft(null);
    setPolygonDraft([]);
    setPendingArea(null);
    event.target.value = "";
  };

  const handlePendingOverlayUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const overlayImage = await fileToDataUrl(file);
    setPendingArea((prev) =>
      prev
        ? {
            ...prev,
            overlayImage,
            overlayImageName: file.name
          }
        : prev
    );
    event.target.value = "";
  };

  const beginRectangleOrCircle = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!editorCanvasRef.current || pendingArea || !editorDraft.imageSrc) {
      return;
    }

    if (currentTool === "polygon") {
      return;
    }

    const point = getPointFromPointer(event, editorCanvasRef.current);
    setDragDraft({ type: currentTool, start: point, current: point });
  };

  const updateRectangleOrCircle = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!editorCanvasRef.current || !dragDraft) {
      return;
    }

    const point = getPointFromPointer(event, editorCanvasRef.current);
    setDragDraft((prev) => (prev ? { ...prev, current: point } : prev));
  };

  const finishRectangleOrCircle = () => {
    if (!dragDraft) {
      return;
    }

    if (distance(dragDraft.start, dragDraft.current) < 0.01) {
      setDragDraft(null);
      return;
    }

    setPendingArea({
      type: dragDraft.type,
      points: [dragDraft.start, dragDraft.current],
      label: "",
      explanation: ""
    });
    setDragDraft(null);
  };

  const addPolygonPoint = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!editorCanvasRef.current || currentTool !== "polygon" || pendingArea || !editorDraft.imageSrc) {
      return;
    }

    const point = getPointFromPointer(event, editorCanvasRef.current);
    setPolygonDraft((prev) => [...prev, point]);
  };

  const finalizePolygonDraft = () => {
    if (polygonDraft.length < 3) {
      return;
    }

    setPendingArea({
      type: "polygon",
      points: polygonDraft,
      label: "",
      explanation: ""
    });
    setPolygonDraft([]);
  };

  const cancelShapeDraft = () => {
    setDragDraft(null);
    setPolygonDraft([]);
    setPendingArea(null);
  };

  const savePendingArea = () => {
    if (!pendingArea || !pendingArea.label.trim()) {
      return;
    }

    const nextArea: CustomQuizArea = {
      id: createId("area"),
      type: pendingArea.type,
      points: pendingArea.points,
      label: pendingArea.label.trim(),
      explanation: pendingArea.explanation.trim(),
      overlayImage: pendingArea.overlayImage,
      overlayImageName: pendingArea.overlayImageName
    };

    setEditorDraft((prev) => ({
      ...prev,
      areas: [...prev.areas, nextArea]
    }));
    setPendingArea(null);
  };

  const removeArea = (areaId: string) => {
    setEditorDraft((prev) => ({
      ...prev,
      areas: prev.areas.filter((area) => area.id !== areaId)
    }));
  };

  const saveAuthorQuiz = () => {
    const title = editorDraft.title.trim();
    if (!title || !editorDraft.imageSrc || editorDraft.areas.length === 0) {
      return;
    }

    const timestamp = new Date().toISOString();
    const nextQuiz: CustomQuiz = {
      id: editorDraft.id ?? createId("quiz"),
      title,
      imageSrc: editorDraft.imageSrc,
      imageName: editorDraft.imageName || "uploaded-image",
      imageWidth: editorDraft.imageWidth,
      imageHeight: editorDraft.imageHeight,
      createdAt: customQuizzes.find((quiz) => quiz.id === editorDraft.id)?.createdAt ?? timestamp,
      updatedAt: timestamp,
      areas: cloneQuiz(editorDraft.areas)
    };

    const existingIndex = customQuizzes.findIndex((quiz) => quiz.id === nextQuiz.id);
    const nextQuizzes = [...customQuizzes];

    if (existingIndex >= 0) {
      nextQuizzes[existingIndex] = nextQuiz;
    } else {
      nextQuizzes.unshift(nextQuiz);
    }

    saveCustomQuizzesAndSync(nextQuizzes);
    setEditorDraft({
      id: nextQuiz.id,
      title: nextQuiz.title,
      imageSrc: nextQuiz.imageSrc,
      imageName: nextQuiz.imageName,
      imageWidth: nextQuiz.imageWidth,
      imageHeight: nextQuiz.imageHeight,
      areas: cloneQuiz(nextQuiz.areas)
    });
    setAuthorView("library");
  };

  const submitPlayAnswer = (areaId: string) => {
    if (!currentPlayArea || !playCanvasRef.current || playAnswered) {
      return;
    }

    setSelectedAreaId(areaId);
    setPlayAnswers((prev) => [
      ...prev,
      {
        areaId: currentPlayArea.id,
        selectedAreaId: areaId,
        correct: areaId === currentPlayArea.id
      }
    ]);
  };

  const handlePlayCanvasClick = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!playCanvasRef.current || !currentPlayArea || playAnswered || !playQuiz) {
      return;
    }

    const point = getPointFromPointer(event, playCanvasRef.current);
    const clickedArea = playQuiz.areas.find((area) => isPointInsideArea(point, area));

    if (clickedArea) {
      submitPlayAnswer(clickedArea.id);
    }
  };

  const nextPlayStep = () => {
    if (!playAnswered) {
      return;
    }

    if (playIndex === playQuestions.length - 1) {
      setPlayFinished(true);
      return;
    }

    setPlayIndex((prev) => prev + 1);
    setSelectedAreaId(null);
  };

  const renderAreaShape = (
    area: CustomQuizArea | PendingAreaDraft,
    key: string,
    width: number,
    height: number,
    className: string,
    labelClassName?: string
  ) => {
    if (area.type === "circle") {
      const center = pointToSvg(area.points[0], width, height);
      const radius = getCircleRadius(area) * Math.min(width, height);
      return (
        <g key={key}>
          <circle className={className} cx={center.x} cy={center.y} r={radius} />
          {labelClassName && "label" in area && area.label ? (
            <text className={labelClassName} x={center.x} y={center.y - radius - 10}>
              {area.label}
            </text>
          ) : null}
        </g>
      );
    }

    const points = areaToSvgPoints(area, width, height);
    return (
      <g key={key}>
        <polygon className={className} points={points} />
        {labelClassName && "label" in area && area.label && area.points.length > 0 ? (
          <text
            className={labelClassName}
            x={pointToSvg(area.points[0], width, height).x}
            y={pointToSvg(area.points[0], width, height).y - 10}
          >
            {area.label}
          </text>
        ) : null}
      </g>
    );
  };

  const draftPreview: PendingAreaDraft | null = useMemo(() => {
    if (pendingArea) {
      return pendingArea;
    }

    if (dragDraft) {
      return {
        type: dragDraft.type,
        points: [dragDraft.start, dragDraft.current],
        label: "",
        explanation: ""
      };
    }

    if (polygonDraft.length > 0) {
      return {
        type: "polygon",
        points: polygonDraft,
        label: "",
        explanation: ""
      };
    }

    return null;
  }, [dragDraft, pendingArea, polygonDraft]);

  return (
    <section className={styles.wrap}>
      <PageHeader title={lang === "cs" ? "Kvíz" : "Quiz"} color="#7b3ff2" />

      {mode === "menu" ? (
        <div className={styles.menuGrid}>
          <article className={`${styles.card} ${styles.modeCard}`}>
            <p className={styles.eyebrow}>{lang === "cs" ? "Studijní režim" : "Study mode"}</p>
            <h2 className={styles.heading}>{lang === "cs" ? "Hotový kvíz: rameno" : "Ready-made quiz: shoulder"}</h2>
            <p className={styles.copy}>
              {lang === "cs"
                ? "Původní vícevýběrový kvíz zůstává zachovaný. Náhodně vybere 10 otázek a po odpovědi ukáže overlay s popisky."
                : "The original multiple-choice quiz stays available. It picks 10 random questions and shows the labeled overlay after each answer."}
            </p>
            <button type="button" className={styles.startButton} onClick={startNewTest} disabled={!manifest}>
              {lang === "cs" ? "Spustit shoulder kvíz" : "Start shoulder quiz"}
            </button>
          </article>

          <article className={`${styles.card} ${styles.modeCard}`}>
            <p className={styles.eyebrow}>{lang === "cs" ? "Autor" : "Author"}</p>
            <h2 className={styles.heading}>{lang === "cs" ? "Vytvořit vlastní obrázkový kvíz" : "Create your own image quiz"}</h2>
            <p className={styles.copy}>
              {lang === "cs"
                ? "Nahraj obrázek, ručně vyznač klikací oblasti jako obdélník, kruh nebo polygon, ulož je s názvem a později stejný kvíz znovu otevři nebo přehraj."
                : "Upload an image, manually mark clickable regions as rectangles, circles, or polygons, save them with labels, and reopen or play the quiz later."}
            </p>
            <div className={styles.inlineActions}>
              <button type="button" className={styles.startButton} onClick={openAuthorLibrary}>
                {lang === "cs" ? "Otevřít author režim" : "Open author mode"}
              </button>
              <button type="button" className={styles.ghostButton} onClick={startNewAuthorQuiz}>
                {lang === "cs" ? "Nový kvíz" : "New quiz"}
              </button>
            </div>
          </article>
        </div>
      ) : null}

      {mode === "standard" ? (
        !hasStarted ? (
          <article className={`${styles.card} ${styles.startCard}`}>
            <div className={styles.topBar}>
              <button type="button" className={styles.backButton} onClick={() => setMode("menu")}>
                {lang === "cs" ? "Zpět na výběr" : "Back to menu"}
              </button>
            </div>
            <p className={styles.eyebrow}>{manifest?.title[lang] ?? (lang === "cs" ? "Načítání..." : "Loading...")}</p>
            <h2 className={styles.heading}>
              {lang === "cs" ? "Poznávání struktur z UZ obrazů" : "Identify structures from ultrasound images"}
            </h2>
            <p className={styles.copy}>
              {lang === "cs"
                ? "Kvíz obsahuje 10 náhodně vybraných otázek. V každé otázce šipka ukazuje na jednu strukturu a po odpovědi se zobrazí původní overlay."
                : "The quiz contains 10 randomly selected questions. In each question the arrow points to one structure and the original overlay is shown after answering."}
            </p>
            <button type="button" className={styles.startButton} onClick={startNewTest} disabled={!manifest}>
              {lang === "cs" ? "Zahájit kvíz" : "Start quiz"}
            </button>
          </article>
        ) : !finished ? (
          <article className={styles.card}>
            <div className={styles.topBar}>
              <button type="button" className={styles.backButton} onClick={() => setMode("menu")}>
                {lang === "cs" ? "Zpět na výběr" : "Back to menu"}
              </button>
            </div>

            <div className={styles.head}>
              <div>
                <p className={styles.eyebrow}>{manifest?.title[lang] ?? (lang === "cs" ? "Načítání..." : "Loading...")}</p>
                <h2 className={styles.heading}>
                  {lang === "cs" ? "Poznej označenou strukturu" : "Identify the marked structure"}
                </h2>
              </div>
              <strong className={styles.progress}>
                {questions.length ? (lang === "cs" ? `Otázka ${currentIndex + 1}/10` : `Question ${currentIndex + 1}/10`) : ""}
              </strong>
            </div>

            <p className={styles.copy}>
              {lang === "cs"
                ? "Na každém obrázku šipka ukazuje na jednu strukturu. Po zodpovězení se zobrazí původní overlay."
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
                            ? "Správně"
                            : "Correct"
                          : lang === "cs"
                            ? `Nesprávně. Správná odpověď: ${correctAnswer}.`
                            : `Incorrect. Correct answer: ${correctAnswer}.`}
                      </strong>
                    ) : (
                      <span>{lang === "cs" ? "Vyber jednu možnost A-D." : "Choose one option A-D."}</span>
                    )}
                  </div>

                  <button type="button" className={styles.nextButton} onClick={nextStep} disabled={!answered}>
                    {isLastQuestion ? (lang === "cs" ? "Vyhodnotit test" : "Finish test") : lang === "cs" ? "Další otázka" : "Next question"}
                  </button>
                </div>
              </>
            ) : null}
          </article>
        ) : (
          <article className={styles.card}>
            <div className={styles.topBar}>
              <button type="button" className={styles.backButton} onClick={() => setMode("menu")}>
                {lang === "cs" ? "Zpět na výběr" : "Back to menu"}
              </button>
            </div>

            <div className={styles.summaryHead}>
              <p className={styles.eyebrow}>{manifest?.title[lang]}</p>
              <h2 className={styles.heading}>{lang === "cs" ? "Vyhodnocení testu" : "Test results"}</h2>
              <p className={styles.score}>
                {lang === "cs" ? `Skóre ${correctCount} / ${answers.length}` : `Score ${correctCount} / ${answers.length}`}
              </p>
            </div>

            <div className={styles.summaryList}>
              {answers.map((item, index) => (
                <article key={item.questionId} className={styles.reviewCard}>
                  <img className={styles.reviewImage} src={item.revealImage} alt={item.correct} />
                  <div className={styles.reviewBody}>
                    <strong>{lang === "cs" ? `Otázka ${index + 1}` : `Question ${index + 1}`}</strong>
                    <span className={item.selected === item.correct ? styles.feedbackCorrect : styles.feedbackWrong}>
                      {item.selected === item.correct
                        ? lang === "cs"
                          ? `Správně: ${item.correct}`
                          : `Correct: ${item.correct}`
                        : lang === "cs"
                          ? `Tvoje odpověď: ${item.selected} | Správně: ${item.correct}`
                          : `Your answer: ${item.selected} | Correct: ${item.correct}`}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <button type="button" className={styles.nextButton} onClick={startNewTest}>
              {lang === "cs" ? "Spustit nový test" : "Start new test"}
            </button>
          </article>
        )
      ) : null}

      {mode === "author" && authorView === "library" ? (
        <article className={styles.card}>
          <div className={styles.topBar}>
            <button type="button" className={styles.backButton} onClick={() => setMode("menu")}>
              {lang === "cs" ? "Zpět na výběr" : "Back to menu"}
            </button>
            <button type="button" className={styles.startButton} onClick={startNewAuthorQuiz}>
              {lang === "cs" ? "Nový autorský kvíz" : "New author quiz"}
            </button>
          </div>

          <div className={styles.head}>
            <div>
              <p className={styles.eyebrow}>{lang === "cs" ? "Author mode" : "Author mode"}</p>
              <h2 className={styles.heading}>{lang === "cs" ? "Uložené obrázkové kvízy" : "Saved image quizzes"}</h2>
            </div>
            <strong className={styles.progress}>
              {lang === "cs" ? `${customQuizzes.length} uložených` : `${customQuizzes.length} saved`}
            </strong>
          </div>

          <p className={styles.copy}>
            {lang === "cs"
              ? "Každý uložený kvíz můžeš znovu otevřít v editoru nebo rovnou přehrát jako klikací test nad stejným obrázkem."
              : "Each saved quiz can be reopened in the editor or played immediately as a clickable image test."}
          </p>

          {customQuizzes.length === 0 ? (
            <div className={styles.emptyState}>
              <strong>{lang === "cs" ? "Zatím tu není žádný autorský kvíz." : "There are no author quizzes yet."}</strong>
              <span>
                {lang === "cs"
                  ? "Začni novým kvízem, nahraj obrázek a ulož první oblasti."
                  : "Start a new quiz, upload an image, and save your first regions."}
              </span>
            </div>
          ) : (
            <div className={styles.libraryList}>
              {customQuizzes.map((quiz) => (
                <article key={quiz.id} className={styles.libraryCard}>
                  <img className={styles.libraryThumb} src={quiz.imageSrc} alt={quiz.title} />
                  <div className={styles.libraryBody}>
                    <strong>{quiz.title}</strong>
                    <span>
                      {lang === "cs"
                        ? `${quiz.areas.length} oblastí | upraveno ${formatDate(quiz.updatedAt, locale)}`
                        : `${quiz.areas.length} regions | updated ${formatDate(quiz.updatedAt, locale)}`}
                    </span>
                    <span className={styles.mutedText}>{quiz.imageName}</span>
                  </div>
                  <div className={styles.libraryActions}>
                    <button type="button" className={styles.ghostButton} onClick={() => openQuizInEditor(quiz)}>
                      {lang === "cs" ? "Otevřít" : "Open"}
                    </button>
                    <button type="button" className={styles.ghostButton} onClick={() => startPlayQuiz(quiz)}>
                      {lang === "cs" ? "Přehrát" : "Play"}
                    </button>
                    <button type="button" className={styles.dangerButton} onClick={() => deleteCustomQuiz(quiz.id)}>
                      {lang === "cs" ? "Smazat" : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      ) : null}

      {mode === "author" && authorView === "editor" ? (
        <article className={styles.card}>
          <div className={styles.topBar}>
            <button type="button" className={styles.backButton} onClick={openAuthorLibrary}>
              {lang === "cs" ? "Zpět do knihovny" : "Back to library"}
            </button>
            <button
              type="button"
              className={styles.startButton}
              onClick={saveAuthorQuiz}
              disabled={!editorDraft.title.trim() || !editorDraft.imageSrc || editorDraft.areas.length === 0}
            >
              {lang === "cs" ? "Uložit kvíz" : "Save quiz"}
            </button>
          </div>

          <div className={styles.head}>
            <div>
              <p className={styles.eyebrow}>{lang === "cs" ? "Author editor" : "Author editor"}</p>
              <h2 className={styles.heading}>{lang === "cs" ? "Editor oblastí nad obrázkem" : "Image region editor"}</h2>
            </div>
            <strong className={styles.progress}>
              {lang === "cs" ? `${editorDraft.areas.length} oblastí` : `${editorDraft.areas.length} regions`}
            </strong>
          </div>

          <div className={styles.editorGrid}>
            <div className={styles.editorPanel}>
              <label className={styles.field}>
                <span>{lang === "cs" ? "Název kvízu" : "Quiz title"}</span>
                <input
                  className={styles.input}
                  type="text"
                  value={editorDraft.title}
                  onChange={(event) => setEditorDraft((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder={lang === "cs" ? "Např. Rameno - příčný řez" : "Example: Shoulder - transverse view"}
                />
              </label>

              <label className={styles.field}>
                <span>{lang === "cs" ? "Základní obrázek" : "Base image"}</span>
                <input className={styles.inputFile} type="file" accept="image/*" onChange={handleBaseImageUpload} />
              </label>

              <div className={styles.infoBox}>
                <strong>{lang === "cs" ? "Workflow" : "Workflow"}</strong>
                <span>
                  {lang === "cs"
                    ? "1. Nahraj obrázek. 2. Zvol nástroj. 3. Nakresli oblast. 4. Vyplň název a volitelný popis/overlay. 5. Ulož kvíz."
                    : "1. Upload an image. 2. Pick a tool. 3. Draw a region. 4. Add label and optional explanation/overlay. 5. Save the quiz."}
                </span>
              </div>

              <div className={styles.toolRow}>
                {(["rectangle", "circle", "polygon"] as ShapeType[]).map((tool) => (
                  <button
                    key={tool}
                    type="button"
                    className={`${styles.toolButton} ${currentTool === tool ? styles.toolButtonActive : ""}`}
                    onClick={() => {
                      setCurrentTool(tool);
                      setDragDraft(null);
                      setPolygonDraft([]);
                    }}
                    disabled={!editorDraft.imageSrc || Boolean(pendingArea)}
                  >
                    {tool === "rectangle"
                      ? lang === "cs"
                        ? "Obdélník"
                        : "Rectangle"
                      : tool === "circle"
                        ? lang === "cs"
                          ? "Kruh"
                          : "Circle"
                        : lang === "cs"
                          ? "Polygon"
                          : "Polygon"}
                  </button>
                ))}
              </div>

              {currentTool === "polygon" && polygonDraft.length > 0 ? (
                <div className={styles.inlineActions}>
                  <button type="button" className={styles.ghostButton} onClick={finalizePolygonDraft} disabled={polygonDraft.length < 3}>
                    {lang === "cs" ? "Dokončit polygon" : "Finish polygon"}
                  </button>
                  <button type="button" className={styles.ghostButton} onClick={cancelShapeDraft}>
                    {lang === "cs" ? "Zrušit kreslení" : "Cancel drawing"}
                  </button>
                </div>
              ) : null}

              {pendingArea ? (
                <div className={styles.pendingCard}>
                  <strong>{lang === "cs" ? "Nová oblast" : "New region"}</strong>
                  <label className={styles.field}>
                    <span>{lang === "cs" ? "Název struktury" : "Structure label"}</span>
                    <input
                      className={styles.input}
                      type="text"
                      value={pendingArea.label}
                      onChange={(event) => setPendingArea((prev) => (prev ? { ...prev, label: event.target.value } : prev))}
                      placeholder={lang === "cs" ? "Např. šlacha bicepsu" : "Example: biceps tendon"}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>{lang === "cs" ? "Volitelné vysvětlení" : "Optional explanation"}</span>
                    <textarea
                      className={styles.textarea}
                      value={pendingArea.explanation}
                      onChange={(event) => setPendingArea((prev) => (prev ? { ...prev, explanation: event.target.value } : prev))}
                      placeholder={lang === "cs" ? "Zobrazí se po zodpovězení v přehrávači." : "Shown after answering in play mode."}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>{lang === "cs" ? "Volitelný overlay obrázek" : "Optional overlay image"}</span>
                    <input className={styles.inputFile} type="file" accept="image/*" onChange={handlePendingOverlayUpload} />
                  </label>
                  {pendingArea.overlayImageName ? <span className={styles.mutedText}>{pendingArea.overlayImageName}</span> : null}
                  <div className={styles.inlineActions}>
                    <button type="button" className={styles.startButton} onClick={savePendingArea} disabled={!pendingArea.label.trim()}>
                      {lang === "cs" ? "Uložit oblast" : "Save region"}
                    </button>
                    <button type="button" className={styles.ghostButton} onClick={cancelShapeDraft}>
                      {lang === "cs" ? "Zahodit oblast" : "Discard region"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className={styles.editorCanvasColumn}>
              {editorDraft.imageSrc ? (
                <div>
                  <div
                    ref={editorCanvasRef}
                    className={styles.canvasFrame}
                    onPointerDown={beginRectangleOrCircle}
                    onPointerMove={updateRectangleOrCircle}
                    onPointerUp={finishRectangleOrCircle}
                    onPointerLeave={finishRectangleOrCircle}
                    onClick={addPolygonPoint}
                  >
                    <img className={styles.canvasImage} src={editorDraft.imageSrc} alt={editorDraft.title || "Quiz image"} />
                    <svg
                      className={styles.canvasOverlay}
                      viewBox={`0 0 ${editorDraft.imageWidth || 1000} ${editorDraft.imageHeight || 1000}`}
                      preserveAspectRatio="none"
                    >
                      {editorDraft.areas.map((area) =>
                        renderAreaShape(area, area.id, editorDraft.imageWidth || 1000, editorDraft.imageHeight || 1000, styles.savedRegion, styles.regionLabel)
                      )}
                      {draftPreview
                        ? renderAreaShape(
                            draftPreview,
                            "draft-preview",
                            editorDraft.imageWidth || 1000,
                            editorDraft.imageHeight || 1000,
                            styles.pendingRegion
                          )
                        : null}
                    </svg>
                  </div>
                  <p className={styles.canvasHint}>
                    {currentTool === "polygon"
                      ? lang === "cs"
                        ? "Polygon: klikej po obvodu oblasti a potom ho dokonči tlačítkem."
                        : "Polygon: click around the region boundary and finish it with the button."
                      : lang === "cs"
                        ? "Obdélník nebo kruh: klikni a táhni přes oblast, kterou chceš uložit."
                        : "Rectangle or circle: click and drag over the region you want to save."}
                  </p>
                </div>
              ) : (
                <div className={styles.emptyCanvas}>
                  <strong>{lang === "cs" ? "Nejdřív nahraj obrázek." : "Upload an image first."}</strong>
                  <span>
                    {lang === "cs"
                      ? "Po nahrání se otevře kreslicí vrstva pro klikací oblasti."
                      : "After upload, the drawing layer for clickable regions will appear."}
                  </span>
                </div>
              )}

              <div className={styles.areaList}>
                {editorDraft.areas.map((area, index) => (
                  <article key={area.id} className={styles.areaCard}>
                    <div className={styles.areaCardHead}>
                      <strong>{lang === "cs" ? `Oblast ${index + 1}` : `Region ${index + 1}`}</strong>
                      <button type="button" className={styles.dangerButton} onClick={() => removeArea(area.id)}>
                        {lang === "cs" ? "Odstranit" : "Remove"}
                      </button>
                    </div>
                    <span>{area.label}</span>
                    {area.explanation ? <p className={styles.copy}>{area.explanation}</p> : null}
                    <span className={styles.mutedText}>
                      {area.type === "rectangle"
                        ? lang === "cs"
                          ? "Tvar: obdélník"
                          : "Shape: rectangle"
                        : area.type === "circle"
                          ? lang === "cs"
                            ? "Tvar: kruh"
                            : "Shape: circle"
                          : lang === "cs"
                            ? "Tvar: polygon"
                            : "Shape: polygon"}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </article>
      ) : null}

      {mode === "author" && authorView === "play" && playQuiz ? (
        <article className={styles.card}>
          <div className={styles.topBar}>
            <button type="button" className={styles.backButton} onClick={openAuthorLibrary}>
              {lang === "cs" ? "Zpět do knihovny" : "Back to library"}
            </button>
            <button type="button" className={styles.ghostButton} onClick={() => openQuizInEditor(playQuiz)}>
              {lang === "cs" ? "Otevřít v editoru" : "Open in editor"}
            </button>
          </div>

          {!playFinished ? (
            <>
              <div className={styles.head}>
                <div>
                  <p className={styles.eyebrow}>{playQuiz.title}</p>
                  <h2 className={styles.heading}>
                    {lang === "cs" ? `Klikni na: ${currentPlayArea?.label ?? ""}` : `Click on: ${currentPlayArea?.label ?? ""}`}
                  </h2>
                </div>
                <strong className={styles.progress}>
                  {lang === "cs"
                    ? `Otázka ${playIndex + 1}/${playQuestions.length}`
                    : `Question ${playIndex + 1}/${playQuestions.length}`}
                </strong>
              </div>

              <div className={styles.playGrid}>
                <div>
                  <div ref={playCanvasRef} className={styles.canvasFrame} onClick={handlePlayCanvasClick}>
                    <img className={styles.canvasImage} src={playQuiz.imageSrc} alt={playQuiz.title} />
                    <svg
                      className={styles.canvasOverlay}
                      viewBox={`0 0 ${playQuiz.imageWidth || 1000} ${playQuiz.imageHeight || 1000}`}
                      preserveAspectRatio="none"
                    >
                      {playQuiz.areas.map((area) => {
                        const isCorrect = currentPlayArea?.id === area.id;
                        const isSelected = selectedAreaId === area.id;
                        const shapeClass = !playAnswered
                          ? styles.playRegion
                          : isCorrect
                            ? styles.playRegionCorrect
                            : isSelected
                              ? styles.playRegionWrong
                              : styles.playRegionMuted;

                        return renderAreaShape(area, area.id, playQuiz.imageWidth || 1000, playQuiz.imageHeight || 1000, shapeClass);
                      })}
                    </svg>
                  </div>
                  <p className={styles.canvasHint}>
                    {lang === "cs"
                      ? "Klikni do některé uložené oblasti v obrázku."
                      : "Click inside one of the saved regions in the image."}
                  </p>
                </div>

                <aside className={styles.sidePanel}>
                  <div className={styles.infoBox}>
                    <strong>{lang === "cs" ? "Instrukce" : "Instructions"}</strong>
                    <span>
                      {lang === "cs"
                        ? "Otázka zobrazuje název struktury. Tvým úkolem je kliknout na správně uloženou oblast."
                        : "The prompt shows the structure label. Your job is to click the matching saved region."}
                    </span>
                  </div>

                  <div className={styles.pendingCard}>
                    <strong>{lang === "cs" ? "Výsledek" : "Result"}</strong>
                    {!playAnswered ? (
                      <span>{lang === "cs" ? "Zatím není vybraná žádná oblast." : "No region selected yet."}</span>
                    ) : selectedAreaId === currentPlayArea?.id ? (
                      <span className={styles.feedbackCorrect}>{lang === "cs" ? "Správně." : "Correct."}</span>
                    ) : (
                      <span className={styles.feedbackWrong}>
                        {lang === "cs"
                          ? `Nesprávně. Správná oblast je ${currentPlayArea?.label}.`
                          : `Incorrect. The correct region is ${currentPlayArea?.label}.`}
                      </span>
                    )}
                    {playAnswered && currentPlayArea?.explanation ? <p className={styles.copy}>{currentPlayArea.explanation}</p> : null}
                    {playAnswered && currentPlayArea?.overlayImage ? (
                      <img className={styles.overlayPreview} src={currentPlayArea.overlayImage} alt={currentPlayArea.label} />
                    ) : null}
                  </div>

                  <button type="button" className={styles.nextButton} onClick={nextPlayStep} disabled={!playAnswered}>
                    {playIndex === playQuestions.length - 1
                      ? lang === "cs"
                        ? "Vyhodnotit"
                        : "Finish"
                      : lang === "cs"
                        ? "Další otázka"
                        : "Next question"}
                  </button>
                </aside>
              </div>
            </>
          ) : (
            <>
              <div className={styles.summaryHead}>
                <p className={styles.eyebrow}>{playQuiz.title}</p>
                <h2 className={styles.heading}>{lang === "cs" ? "Výsledek autorského kvízu" : "Author quiz results"}</h2>
                <p className={styles.score}>
                  {lang === "cs" ? `Skóre ${playCorrectCount} / ${playAnswers.length}` : `Score ${playCorrectCount} / ${playAnswers.length}`}
                </p>
              </div>
              <div className={styles.summaryList}>
                {playQuestions.map((area, index) => {
                  const answer = playAnswers.find((item) => item.areaId === area.id);
                  return (
                    <article key={area.id} className={styles.areaCard}>
                      <strong>{lang === "cs" ? `Otázka ${index + 1}: ${area.label}` : `Question ${index + 1}: ${area.label}`}</strong>
                      <span className={answer?.correct ? styles.feedbackCorrect : styles.feedbackWrong}>
                        {answer?.correct
                          ? lang === "cs"
                            ? "Správně"
                            : "Correct"
                          : lang === "cs"
                            ? "Nesprávně"
                            : "Incorrect"}
                      </span>
                      {area.explanation ? <p className={styles.copy}>{area.explanation}</p> : null}
                    </article>
                  );
                })}
              </div>
              <div className={styles.inlineActions}>
                <button type="button" className={styles.nextButton} onClick={() => startPlayQuiz(playQuiz)}>
                  {lang === "cs" ? "Spustit znovu" : "Play again"}
                </button>
                <button type="button" className={styles.ghostButton} onClick={() => openQuizInEditor(playQuiz)}>
                  {lang === "cs" ? "Upravit kvíz" : "Edit quiz"}
                </button>
              </div>
            </>
          )}
        </article>
      ) : null}
    </section>
  );
}
