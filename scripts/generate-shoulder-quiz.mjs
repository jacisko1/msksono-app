import { readdir, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { Jimp, intToRGBA, rgbaToInt } from "jimp";

const repoRoot = process.cwd();
const publicQuizDir = path.join(repoRoot, "public", "assets", "quiz", "shoulder");
const externalQuizDir = "C:\\Users\\jakub\\Desktop\\Images\\App\\01_Joints\\01_Shoulder\\webp\\quiz";
const shoulderAssetDir = path.join(repoRoot, "public", "assets", "shoulder");

const structures = {
  deltoid: { cs: "deltový sval", en: "deltoid", pool: "muscle" },
  bicepsTendon: { cs: "šlacha dlouhé hlavy bicepsu", en: "long head biceps tendon", pool: "soft" },
  tuberculumMinus: { cs: "tuberculum minus", en: "tuberculum minus", pool: "bone" },
  tuberculumMajus: { cs: "tuberculum majus", en: "tuberculum majus", pool: "bone" },
  humerus: { cs: "humerus", en: "humerus", pool: "bone" },
  subscapularis: { cs: "m. subscapularis", en: "subscapularis", pool: "muscle" },
  lhbb: { cs: "dlouhá hlava bicepsu", en: "long head of biceps", pool: "muscle" },
  shbb: { cs: "krátká hlava bicepsu", en: "short head of biceps", pool: "muscle" },
  tendon: { cs: "šlacha", en: "tendon", pool: "soft" },
  muscle: { cs: "sval", en: "muscle", pool: "muscle" },
  bursa: { cs: "burza", en: "bursa", pool: "soft" },
  rotatorCuff: { cs: "rotátorová manžeta", en: "rotator cuff", pool: "muscle" },
  acromion: { cs: "akromion", en: "acromion", pool: "bone" },
  infraspinatus: { cs: "m. infraspinatus", en: "infraspinatus", pool: "muscle" },
  labrum: { cs: "labrum", en: "labrum", pool: "soft" },
  glenoid: { cs: "glenoid", en: "glenoid", pool: "bone" }
};

const optionPools = {
  muscle: ["deltoid", "subscapularis", "infraspinatus", "lhbb", "shbb", "muscle", "rotatorCuff"],
  bone: ["humerus", "acromion", "glenoid", "tuberculumMinus", "tuberculumMajus"],
  soft: ["bicepsTendon", "tendon", "bursa", "labrum", "rotatorCuff", "lhbb"]
};

const questionSpecs = [
  { id: "01_01_deltoid", overlayFile: "001.jpg", basicFile: "Shoulder Basic_001.jpg", answer: "deltoid", tip: [445, 170], base: [210, 160] },
  { id: "01_02_biceps_tendon", overlayFile: "001.jpg", basicFile: "Shoulder Basic_001.jpg", answer: "bicepsTendon", tip: [560, 285], base: [430, 275] },
  { id: "01_03_tuberculum_minus", overlayFile: "001.jpg", basicFile: "Shoulder Basic_001.jpg", answer: "tuberculumMinus", tip: [760, 260], base: [650, 245] },
  { id: "01_04_tuberculum_majus", overlayFile: "001.jpg", basicFile: "Shoulder Basic_001.jpg", answer: "tuberculumMajus", tip: [250, 360], base: [210, 350] },
  { id: "01_05_humerus", overlayFile: "001.jpg", basicFile: "Shoulder Basic_001.jpg", answer: "humerus", tip: [505, 500], base: [360, 465] },
  { id: "01_06_subscapularis", overlayFile: "001.jpg", basicFile: "Shoulder Basic_001.jpg", answer: "subscapularis", tip: [900, 360], base: [760, 360] },

  { id: "02_01_deltoid", overlayFile: "002.jpg", basicFile: "Shoulder Basic_002.jpg", answer: "deltoid", tip: [335, 150], base: [195, 245] },
  { id: "02_02_lhbb", overlayFile: "002.jpg", basicFile: "Shoulder Basic_002.jpg", answer: "lhbb", tip: [505, 345], base: [430, 350] },
  { id: "02_03_shbb", overlayFile: "002.jpg", basicFile: "Shoulder Basic_002.jpg", answer: "shbb", tip: [820, 300], base: [750, 305] },
  { id: "02_04_humerus", overlayFile: "002.jpg", basicFile: "Shoulder Basic_002.jpg", answer: "humerus", tip: [365, 520], base: [310, 555] },

  { id: "03_01_lhbb", overlayFile: "003.jpg", basicFile: "Shoulder Basic_003.jpg", answer: "lhbb", tip: [115, 155], base: [160, 145] },
  { id: "03_02_deltoid", overlayFile: "003.jpg", basicFile: "Shoulder Basic_003.jpg", answer: "deltoid", tip: [510, 110], base: [450, 95] },
  { id: "03_03_humerus", overlayFile: "003.jpg", basicFile: "Shoulder Basic_003.jpg", answer: "humerus", tip: [245, 430], base: [295, 455] },

  { id: "04_01_deltoid", overlayFile: "004.jpg", basicFile: "Shoulder Basic_004.jpg", answer: "deltoid", tip: [300, 145], base: [285, 130] },
  { id: "04_02_tendon", overlayFile: "004.jpg", basicFile: "Shoulder Basic_004.jpg", answer: "tendon", tip: [165, 350], base: [120, 340] },
  { id: "04_03_lhbb", overlayFile: "004.jpg", basicFile: "Shoulder Basic_004.jpg", answer: "lhbb", tip: [480, 350], base: [430, 345] },
  { id: "04_04_muscle", overlayFile: "004.jpg", basicFile: "Shoulder Basic_004.jpg", answer: "muscle", tip: [900, 345], base: [835, 340] },
  { id: "04_05_humerus", overlayFile: "004.jpg", basicFile: "Shoulder Basic_004.jpg", answer: "humerus", tip: [175, 505], base: [145, 555] },

  { id: "05_01_deltoid", overlayFile: "005.jpg", basicFile: "Shoulder Basic_005.jpg", answer: "deltoid", tip: [470, 145], base: [455, 125] },
  { id: "05_02_bursa", overlayFile: "005.jpg", basicFile: "Shoulder Basic_005.jpg", answer: "bursa", tip: [330, 300], base: [265, 285] },
  { id: "05_03_rotator_cuff", overlayFile: "005.jpg", basicFile: "Shoulder Basic_005.jpg", answer: "rotatorCuff", tip: [420, 395], base: [420, 390] },
  { id: "05_04_humerus", overlayFile: "005.jpg", basicFile: "Shoulder Basic_005.jpg", answer: "humerus", tip: [520, 560], base: [495, 535] },

  { id: "06_01_deltoid", overlayFile: "006.jpg", basicFile: "Shoulder Basic_006.jpg", answer: "deltoid", tip: [330, 170], base: [300, 155] },
  { id: "06_02_bursa", overlayFile: "006.jpg", basicFile: "Shoulder Basic_006.jpg", answer: "bursa", tip: [635, 285], base: [610, 275] },
  { id: "06_03_rotator_cuff", overlayFile: "006.jpg", basicFile: "Shoulder Basic_006.jpg", answer: "rotatorCuff", tip: [470, 365], base: [450, 360] },
  { id: "06_04_acromion", overlayFile: "006.jpg", basicFile: "Shoulder Basic_006.jpg", answer: "acromion", tip: [760, 225], base: [720, 225] },
  { id: "06_05_humerus", overlayFile: "006.jpg", basicFile: "Shoulder Basic_006.jpg", answer: "humerus", tip: [435, 535], base: [430, 520] },

  { id: "07_01_deltoid", overlayFile: "007.jpg", basicFile: "Shoulder Basic_007.jpg", answer: "deltoid", tip: [515, 150], base: [470, 145] },
  { id: "07_02_infraspinatus", overlayFile: "007.jpg", basicFile: "Shoulder Basic_007.jpg", answer: "infraspinatus", tip: [255, 370], base: [200, 370] },
  { id: "07_03_labrum", overlayFile: "007.jpg", basicFile: "Shoulder Basic_007.jpg", answer: "labrum", tip: [350, 510], base: [325, 500] },
  { id: "07_04_glenoid", overlayFile: "007.jpg", basicFile: "Shoulder Basic_007.jpg", answer: "glenoid", tip: [200, 635], base: [210, 630] },
  { id: "07_05_humerus", overlayFile: "007.jpg", basicFile: "Shoulder Basic_007.jpg", answer: "humerus", tip: [690, 560], base: [665, 535] },

  { id: "08_01_deltoid", overlayFile: "008.jpg", basicFile: "Shoulder Basic_008.jpg", answer: "deltoid", tip: [405, 170], base: [335, 180] },
  { id: "08_02_infraspinatus", overlayFile: "008.jpg", basicFile: "Shoulder Basic_008.jpg", answer: "infraspinatus", tip: [315, 335], base: [245, 340] },
  { id: "08_03_humerus", overlayFile: "008.jpg", basicFile: "Shoulder Basic_008.jpg", answer: "humerus", tip: [485, 500], base: [565, 515] }
];

const width = 1280;
const height = 720;
const arrowColor = { r: 38, g: 231, b: 255 };
const arrowShadow = { r: 0, g: 0, b: 0 };
const targetRingColor = { r: 255, g: 243, b: 86 };

async function ensureEmptyDir(dir) {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
}

function chooseOptions(answerKey) {
  const answer = structures[answerKey];
  const pool = optionPools[answer.pool].filter((item) => item !== answerKey);
  const distractors = pool.slice(0, 3);
  const optionKeys = [answerKey, ...distractors];

  for (let index = optionKeys.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [optionKeys[index], optionKeys[randomIndex]] = [optionKeys[randomIndex], optionKeys[index]];
  }

  return optionKeys;
}

function drawPixel(image, x, y, color, alpha = 1) {
  if (x < 0 || y < 0 || x >= width || y >= height) {
    return;
  }

  const current = intToRGBA(image.getPixelColor(x, y));
  const next = rgbaToInt(
    Math.round(current.r * (1 - alpha) + color.r * alpha),
    Math.round(current.g * (1 - alpha) + color.g * alpha),
    Math.round(current.b * (1 - alpha) + color.b * alpha),
    255
  );
  image.setPixelColor(next, x, y);
}

function drawCircle(image, centerX, centerY, radius, color, alpha = 1) {
  for (let y = Math.floor(centerY - radius); y <= Math.ceil(centerY + radius); y += 1) {
    for (let x = Math.floor(centerX - radius); x <= Math.ceil(centerX + radius); x += 1) {
      const distance = Math.hypot(x - centerX, y - centerY);
      if (distance <= radius) {
        drawPixel(image, x, y, color, alpha);
      }
    }
  }
}

function drawLine(image, start, end, color, thickness, alpha = 1) {
  const [x1, y1] = start;
  const [x2, y2] = end;
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));

  for (let index = 0; index <= steps; index += 1) {
    const t = steps === 0 ? 0 : index / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    drawCircle(image, x, y, thickness / 2, color, alpha);
  }
}

function drawArrowHead(image, from, to, color) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 24;
  const left = [x2 - size * Math.cos(angle - Math.PI / 6), y2 - size * Math.sin(angle - Math.PI / 6)];
  const right = [x2 - size * Math.cos(angle + Math.PI / 6), y2 - size * Math.sin(angle + Math.PI / 6)];

  drawLine(image, to, left, arrowShadow, 10, 0.55);
  drawLine(image, to, right, arrowShadow, 10, 0.55);
  drawLine(image, to, left, color, 6, 1);
  drawLine(image, to, right, color, 6, 1);
}

async function renderQuestionImage(spec) {
  const image = await Jimp.read(path.join(shoulderAssetDir, spec.basicFile));
  image.resize({ w: width, h: height });

  const start = spec.base;
  const end = spec.tip;

  drawLine(image, start, end, arrowShadow, 12, 0.55);
  drawLine(image, start, end, arrowColor, 7, 1);
  drawArrowHead(image, start, end, arrowColor);
  drawCircle(image, end[0], end[1], 12, arrowShadow, 0.55);
  drawCircle(image, end[0], end[1], 8, targetRingColor, 1);
  drawCircle(image, start[0], start[1], 11, arrowShadow, 0.55);
  drawCircle(image, start[0], start[1], 7, arrowColor, 1);

  return image;
}

async function removeExistingFiles(dir) {
  const files = await readdir(dir);
  await Promise.all(files.map((file) => rm(path.join(dir, file), { force: true })));
}

function buildManifest() {
  return {
    title: { cs: "Kvíz: Rameno", en: "Quiz: Shoulder" },
    questions: questionSpecs.map((spec) => {
      const options = chooseOptions(spec.answer);
      return {
        id: spec.id,
        image: `/assets/quiz/shoulder/${spec.id}.png`,
        revealImage: `/assets/shoulder/${encodeURIComponent(spec.overlayFile)}`,
        answer: structures[spec.answer],
        options: options.map((option) => structures[option])
      };
    })
  };
}

async function main() {
  await ensureEmptyDir(publicQuizDir);
  await ensureEmptyDir(externalQuizDir);

  for (const spec of questionSpecs) {
    const rendered = await renderQuestionImage(spec);
    await rendered.write(path.join(publicQuizDir, `${spec.id}.png`));
    await rendered.write(path.join(externalQuizDir, `${spec.id}.png`));
  }

  const manifest = JSON.stringify(buildManifest(), null, 2);
  await writeFile(path.join(publicQuizDir, "manifest.json"), manifest);
  await writeFile(path.join(externalQuizDir, "manifest.json"), manifest);

  console.log(`Generated ${questionSpecs.length} shoulder quiz images.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
