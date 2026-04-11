import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Jimp, intToRGBA, rgbaToInt } from "jimp";

const repoRoot = process.cwd();
const publicQuizDir = path.join(repoRoot, "public", "assets", "quiz", "shoulder");
const externalQuizDir = "C:\\Users\\jakub\\Desktop\\Images\\App\\01_Joints\\01_Shoulder\\webp\\quiz";
const shoulderAssetDir = path.join(repoRoot, "public", "assets", "shoulder");

const STRUCTURES = {
  deltoid: { cs: "deltový sval", en: "deltoid" },
  humerus: { cs: "humerus", en: "humerus" },
  subscapularis: { cs: "m. subscapularis", en: "subscapularis" },
  lhbb: { cs: "dlouhá hlava bicepsu", en: "long head of biceps" },
  shbb: { cs: "krátká hlava bicepsu", en: "short head of biceps" },
  tendon: { cs: "šlacha", en: "tendon" },
  muscle: { cs: "sval", en: "muscle" },
  bursa: { cs: "burza", en: "bursa" },
  rotatorCuff: { cs: "rotátorová manžeta", en: "rotator cuff" },
  acromion: { cs: "akromion", en: "acromion" },
  infraspinatus: { cs: "m. infraspinatus", en: "infraspinatus" },
  glenoid: { cs: "glenoid", en: "glenoid" }
};

const questionSpecs = [
  {
    id: "q01_deltoid",
    overlayFile: "001.jpg",
    basicFile: "Shoulder Basic_001.jpg",
    structure: "deltoid",
    seed: { x: 260, y: 160 },
    tolerance: 60,
    options: ["subscapularis", "deltoid", "infraspinatus", "rotatorCuff"]
  },
  {
    id: "q02_humerus",
    overlayFile: "001.jpg",
    basicFile: "Shoulder Basic_001.jpg",
    structure: "humerus",
    seed: { x: 430, y: 520 },
    tolerance: 48,
    options: ["glenoid", "humerus", "acromion", "bursa"]
  },
  {
    id: "q03_subscapularis",
    overlayFile: "001.jpg",
    basicFile: "Shoulder Basic_001.jpg",
    structure: "subscapularis",
    seed: { x: 845, y: 350 },
    tolerance: 42,
    options: ["subscapularis", "infraspinatus", "deltoid", "rotatorCuff"]
  },
  {
    id: "q04_lhbb",
    overlayFile: "002.jpg",
    basicFile: "Shoulder Basic_002.jpg",
    structure: "lhbb",
    seed: { x: 470, y: 350 },
    tolerance: 52,
    options: ["shbb", "subscapularis", "lhbb", "tendon"]
  },
  {
    id: "q05_shbb",
    overlayFile: "002.jpg",
    basicFile: "Shoulder Basic_002.jpg",
    structure: "shbb",
    seed: { x: 790, y: 335 },
    tolerance: 52,
    options: ["lhbb", "deltoid", "shbb", "infraspinatus"]
  },
  {
    id: "q06_tendon",
    overlayFile: "004.jpg",
    basicFile: "Shoulder Basic_004.jpg",
    structure: "tendon",
    seed: { x: 170, y: 365 },
    tolerance: 42,
    options: ["tendon", "muscle", "bursa", "rotatorCuff"]
  },
  {
    id: "q07_muscle",
    overlayFile: "004.jpg",
    basicFile: "Shoulder Basic_004.jpg",
    structure: "muscle",
    seed: { x: 840, y: 365 },
    tolerance: 42,
    options: ["tendon", "muscle", "deltoid", "infraspinatus"]
  },
  {
    id: "q08_bursa",
    overlayFile: "005.jpg",
    basicFile: "Shoulder Basic_005.jpg",
    structure: "bursa",
    seed: { x: 330, y: 290 },
    tolerance: 38,
    options: ["acromion", "bursa", "glenoid", "rotatorCuff"]
  },
  {
    id: "q09_rotator_cuff",
    overlayFile: "005.jpg",
    basicFile: "Shoulder Basic_005.jpg",
    structure: "rotatorCuff",
    seed: { x: 395, y: 352 },
    tolerance: 48,
    options: ["subscapularis", "rotatorCuff", "bursa", "lhbb"]
  },
  {
    id: "q10_acromion",
    overlayFile: "006.jpg",
    basicFile: "Shoulder Basic_006.jpg",
    structure: "acromion",
    seed: { x: 735, y: 240 },
    tolerance: 34,
    options: ["glenoid", "humerus", "acromion", "bursa"]
  },
  {
    id: "q11_infraspinatus",
    overlayFile: "007.jpg",
    basicFile: "Shoulder Basic_007.jpg",
    structure: "infraspinatus",
    seed: { x: 255, y: 360 },
    tolerance: 45,
    options: ["subscapularis", "deltoid", "rotatorCuff", "infraspinatus"]
  },
  {
    id: "q12_glenoid",
    overlayFile: "007.jpg",
    basicFile: "Shoulder Basic_007.jpg",
    structure: "glenoid",
    seed: { x: 305, y: 580 },
    tolerance: 45,
    options: ["humerus", "glenoid", "acromion", "bursa"]
  }
];

const width = 1280;
const height = 720;
const highlightColor = { r: 123, g: 63, b: 242 };
const outlineColor = { r: 255, g: 234, b: 92 };

const toIndex = (x, y) => y * width + x;

const colorDistance = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);

const withinBounds = (x, y) => x >= 0 && y >= 0 && x < width && y < height;

function collectMask(image, seed, tolerance) {
  const source = intToRGBA(image.getPixelColor(seed.x, seed.y));
  const mask = new Uint8Array(width * height);
  const queue = [{ x: seed.x, y: seed.y }];
  mask[toIndex(seed.x, seed.y)] = 1;

  for (let i = 0; i < queue.length; i += 1) {
    const { x, y } = queue[i];
    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (!withinBounds(nx, ny)) {
        continue;
      }

      const index = toIndex(nx, ny);
      if (mask[index]) {
        continue;
      }

      const candidate = intToRGBA(image.getPixelColor(nx, ny));
      if (colorDistance(candidate, source) <= tolerance) {
        mask[index] = 1;
        queue.push({ x: nx, y: ny });
      }
    }
  }

  return mask;
}

function expandMask(mask, radius = 2) {
  let current = mask;

  for (let step = 0; step < radius; step += 1) {
    const next = current.slice();

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = toIndex(x, y);
        if (current[index]) {
          continue;
        }

        if (
          current[toIndex(x + 1, y)] ||
          current[toIndex(x - 1, y)] ||
          current[toIndex(x, y + 1)] ||
          current[toIndex(x, y - 1)]
        ) {
          next[index] = 1;
        }
      }
    }

    current = next;
  }

  return current;
}

function blendChannel(base, overlay, alpha) {
  return Math.round(base * (1 - alpha) + overlay * alpha);
}

async function renderQuestionImage(spec) {
  const overlay = await Jimp.read(path.join(shoulderAssetDir, spec.overlayFile));
  const basic = await Jimp.read(path.join(shoulderAssetDir, spec.basicFile));
  basic.resize({ w: width, h: height });

  const rawMask = collectMask(overlay, spec.seed, spec.tolerance);
  const mask = expandMask(rawMask, 3);
  const output = basic.clone();

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = toIndex(x, y);
      const pixel = intToRGBA(output.getPixelColor(x, y));

      if (!mask[index]) {
        continue;
      }

      const neighbors = [
        withinBounds(x + 1, y) ? mask[toIndex(x + 1, y)] : 0,
        withinBounds(x - 1, y) ? mask[toIndex(x - 1, y)] : 0,
        withinBounds(x, y + 1) ? mask[toIndex(x, y + 1)] : 0,
        withinBounds(x, y - 1) ? mask[toIndex(x, y - 1)] : 0
      ];
      const isEdge = neighbors.some((value) => value === 0);

      const target = isEdge ? outlineColor : highlightColor;
      const alpha = isEdge ? 0.82 : 0.46;
      output.setPixelColor(
        rgbaToInt(
          blendChannel(pixel.r, target.r, alpha),
          blendChannel(pixel.g, target.g, alpha),
          blendChannel(pixel.b, target.b, alpha),
          255
        ),
        x,
        y
      );
    }
  }

  return output;
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

function buildManifest() {
  return {
    title: { cs: "Kvíz: Rameno", en: "Quiz: Shoulder" },
    questions: questionSpecs.map((spec) => ({
      id: spec.id,
      image: `/assets/quiz/shoulder/${spec.id}.png`,
      revealImage: `/assets/shoulder/${encodeURIComponent(spec.overlayFile)}`,
      answer: STRUCTURES[spec.structure],
      options: spec.options.map((option) => STRUCTURES[option])
    }))
  };
}

async function main() {
  await ensureDir(publicQuizDir);
  await ensureDir(externalQuizDir);

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
