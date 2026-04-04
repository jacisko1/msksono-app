import { Link } from "react-router-dom";
import { ContentPlaceholder } from "../components/ContentPlaceholder";
import { PageHeader } from "../components/PageHeader";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../data/language";
import { findNavItem, getSiblingNavigation, localize, type NavItem } from "../data/navigation";
import { PROGRESS_STORAGE_KEY, PROGRESS_UPDATED_EVENT, readProgress, writeProgress } from "../data/progress";
import styles from "./SharedPages.module.css";

interface ContentPageProps {
  path: string;
}

interface ResponsiveImageSet {
  pc: string;
  tablet: string;
  mobile: string;
}

interface ProbeSection {
  title: { cs: string; en: string };
  image: ResponsiveImageSet;
  body: { cs: string[]; en: string[] };
}

interface MovementSection {
  title: { cs: string; en: string };
  image: ResponsiveImageSet;
  body: { cs: string[]; en: string[] };
}

interface KnobologySection {
  key: string;
  title: { cs: string; en: string };
  body: { cs: string; en: string };
}

interface ShoulderUltrasoundImage {
  key: string;
  title: { cs: string; en: string };
  caption: { cs: { heading: string; bullets: string[] }; en: { heading: string; bullets: string[] } };
}

interface ProtocolStep {
  view: string;
  planes: string[];
}

interface JointProtocolImage {
  key: string;
  heading: string;
  bullets: string[];
}

interface JointProtocolCompareImage {
  key: string;
  baseImage: ResponsiveImageSet;
  overlayImage: ResponsiveImageSet;
}

interface JointContent {
  folder: string;
  introPoints: string[];
  pathologyPoints: string[];
  protocolSteps: ProtocolStep[];
  protocolImages: JointProtocolImage[];
  swipeCompareImages?: JointProtocolCompareImage[];
}

interface JointPositioningContent {
  imageBaseName: string;
  intro: { cs: string; en: string };
  positions: { cs: string[]; en: string[] };
}

interface NerveAnatomyDescription {
  cs: string;
  en: string;
}

interface NerveUltrasoundSection {
  key: string;
  title: { cs: string; en: string };
  caption: { cs: string; en: string };
}

interface NerveUltrasoundContent {
  intro: { cs: string; en: string };
  sections: NerveUltrasoundSection[];
  folder?: string;
  swipeCompareImages?: JointProtocolCompareImage[];
}

interface NerveUltrasoundInteractiveSection {
  title: { cs: string; en: string };
  caption: { cs: string; en: string };
}

interface NerveIntroContent {
  text: { cs: JSX.Element; en: JSX.Element };
  imageBaseName: string;
  alt: { cs: string; en: string };
}

interface SwipeCompareImageProps {
  baseImage: ResponsiveImageSet;
  overlayImage: ResponsiveImageSet;
  baseAlt: string;
  overlayAlt: string;
  ariaLabel: string;
  wrapClassName?: string;
  initialPosition?: number;
  showRange?: boolean;
  controlsClassName?: string;
  rangeColor?: string;
}

const ASSET_VERSION = "2026-04-04-nerve-intro-2";

const assetPath = (folder: string, file: string) =>
  `/assets/${folder.split("/").map(encodeURIComponent).join("/")}/${encodeURIComponent(file)}?v=${ASSET_VERSION}`;

const makeResponsiveImage = (folder: string, baseName: string): ResponsiveImageSet => ({
  mobile: assetPath(folder, `${baseName}_mobile.webp`),
  tablet: assetPath(folder, `${baseName}_tablet.webp`),
  pc: assetPath(folder, `${baseName}_pc.webp`)
});

const makeResponsiveImagePhone = (folder: string, baseName: string): ResponsiveImageSet => ({
  mobile: assetPath(folder, `${baseName}_phone.webp`),
  tablet: assetPath(folder, `${baseName}_tablet.webp`),
  pc: assetPath(folder, `${baseName}_pc.webp`)
});

const makeSingleImage = (folder: string, fileName: string): ResponsiveImageSet => {
  const src = assetPath(folder, fileName);
  return { mobile: src, tablet: src, pc: src };
};

const localized = <T,>(value: T) => ({ cs: value, en: value });

const ultrasoundBasicsCopy = {
  cs: [
    <>
      Zvuk je <strong>mechanické vlnění</strong>, které se šíří prostředím (například vzduchem, vodou nebo biologickými tkáněmi).
      Vzniká kmitáním částic prostředí a šíří se jako <strong>podélná vlna</strong> tvořená střídáním oblastí komprese
      a rarefakce.
    </>,
    <>
      Předpona <strong>ultra-</strong> znamená „za“ nebo „nad“. V tomto případě označuje frekvence vyšší než je horní hranice
      slyšitelnosti lidského ucha. Člověk je schopen vnímat zvuk přibližně v rozsahu <strong>20 Hz až 20 kHz</strong>. Vlnění
      s vyšší frekvencí se označuje jako ultrazvuk.
    </>,
    <>
      V medicínském zobrazování se používají výrazně vyšší frekvence, typicky přibližně <strong>2–18 MHz</strong>. Tyto frekvence
      jsou několikanásobně vyšší než frekvence slyšitelného zvuku, a proto je lidské ucho nedokáže zachytit.
    </>,
    <>
      Důležitou vlastností ultrazvuku je, že se jedná o <strong>mechanické vlnění, nikoli elektromagnetické záření</strong>.
      Ke svému šíření proto vždy potřebuje materiální prostředí. V biologických tkáních se ultrazvuk šíří relativně dobře,
      zatímco ve vzduchu velmi špatně. Z tohoto důvodu se při ultrazvukovém vyšetření používá <strong>kontaktní gel</strong>,
      který eliminuje vzduchovou vrstvu mezi sondou a kůží a umožňuje efektivní přenos ultrazvukových vln do tkání.
    </>
  ],
  en: [
    <>
      Sound is a <strong>mechanical wave</strong> that propagates through a medium (for example air, water, or biological tissues).
      It arises from the oscillation of particles in the medium and propagates as a <strong>longitudinal wave</strong> formed
      by alternating regions of compression and rarefaction.
    </>,
    <>
      The prefix <strong>ultra-</strong> means “beyond” or “above.” In this case it denotes frequencies higher than the upper
      limit of human hearing. Humans can perceive sound approximately in the range of <strong>20 Hz to 20 kHz</strong>. Waves
      with higher frequency are called ultrasound.
    </>,
    <>
      In medical imaging, much higher frequencies are used, typically about <strong>2–18 MHz</strong>. These frequencies are
      many times higher than audible sound and therefore cannot be detected by the human ear.
    </>,
    <>
      An important property of ultrasound is that it is a <strong>mechanical wave, not electromagnetic radiation</strong>.
      It therefore always needs a material medium to propagate. In biological tissues ultrasound propagates relatively well,
      whereas in air it propagates very poorly. For this reason ultrasound examinations use <strong>coupling gel</strong>, which
      eliminates the air layer between the probe and the skin and enables efficient transmission of ultrasound waves into tissues.
    </>
  ]
} as const;

const ultrasoundBasicsImage = makeResponsiveImage("Fyzikalni principy", "ultrasound");
const soundWaveImage = makeResponsiveImage("Fyzikalni principy", "wave");
const probeGripImage = makeResponsiveImage("Probes", "grips");
const echogenicityImage = makeResponsiveImage("UZ obraz", "echogenic");

const soundWaveCopy = {
  cs: [
    <>
      Zvuk je <strong>mechanické vlnění</strong>, které se šíří prostředím přenosem energie mezi částicemi látky. Na rozdíl od
      elektromagnetického záření se zvuk <strong>nemůže šířit ve vakuu</strong> – k propagaci vždy potřebuje materiální prostředí,
      například vzduch, vodu nebo biologické tkáně.
    </>,
    <>
      Z fyzikálního hlediska se jedná o <strong>podélnou vlnu</strong>. Částice prostředí se při jejím šíření nepohybují ve směru
      šíření vlny, ale pouze kmitají kolem své rovnovážné polohy. Toto kmitání vytváří střídající se oblasti komprese
      (<strong>zvýšený tlak a hustota částic</strong>) a rarefakce (<strong>snížený tlak a hustota částic</strong>), které se
      postupně šíří prostředím.
    </>,
    <>
      Zvukovou vlnu lze popsat několika základními parametry. Mezi nejdůležitější patří <strong>frekvence</strong>, která udává
      počet kmitů za sekundu, a <strong>vlnová délka</strong>, tedy vzdálenost mezi dvěma sousedními body stejné fáze vlnění
      (například mezi dvěma maximy komprese). Tyto parametry jsou vzájemně propojeny – při konstantní rychlosti šíření vyšší
      frekvence odpovídá kratší vlnové délce.
    </>,
    <>
      V ultrazvukovém zobrazování mají vlastnosti zvukové vlny <strong>zásadní význam</strong>, protože určují způsob, jakým se
      ultrazvuk šíří biologickými tkáněmi a jak interaguje s jejich rozhraními.
    </>
  ],
  en: [
    <>
      Sound is a <strong>mechanical wave</strong> that propagates through a medium by transferring energy between particles of
      matter. Unlike electromagnetic radiation, sound <strong>cannot travel in a vacuum</strong>; it always requires a material
      medium, such as air, water, or biological tissues.
    </>,
    <>
      From a physical perspective it is a <strong>longitudinal wave</strong>. The particles of the medium do not move in the
      direction of propagation but oscillate around their equilibrium position. This oscillation creates alternating regions of
      compression (<strong>increased pressure and particle density</strong>) and rarefaction (<strong>reduced pressure and
      particle density</strong>) that travel through the medium.
    </>,
    <>
      A sound wave can be described by several basic parameters. The most important are <strong>frequency</strong>, which
      indicates the number of oscillations per second, and <strong>wavelength</strong>, the distance between two neighboring
      points of the same phase of the wave (for example, between two maxima of compression). These parameters are related: at a
      constant propagation speed, higher frequency corresponds to a shorter wavelength.
    </>,
    <>
      In ultrasound imaging, the properties of the sound wave are <strong>essential</strong> because they determine how ultrasound
      propagates through biological tissues and how it interacts with tissue interfaces.
    </>
  ]
} as const;

const speedOfSoundCopy = {
  cs: [
    <>
      <strong>Rychlost zvuku</strong> závisí na vlastnostech prostředí – zejména na jeho hustotě a elasticitě. V měkkých tkáních
      lidského těla se pro klinickou praxi používá průměrná hodnota přibližně <strong>1540 m/s</strong>.
    </>,
    <>
      Rychlost zvuku je klíčová pro správný přepočet času letu odražené vlny na vzdálenost. Přístroj vždy předpokládá konstantní
      rychlost šíření v tkáních. Pokud se reálná rychlost liší, vzniká <strong>geometrická chyba</strong> – struktury se mohou
      zobrazit o něco hlouběji nebo mělčeji, než ve skutečnosti jsou.
    </>,
    <>
      Obecně platí, že <strong>rychleji se zvuk šíří v tuhých prostředích</strong> (například kost), pomaleji v měkčích a
      méně elastických tkáních. Velké rozdíly rychlosti na rozhraních přispívají k odrazům a artefaktům.
    </>,
    <>
      Pro sonografistu je proto důležité rozumět tomu, že změny rychlosti šíření ovlivňují <strong>polohu, tvar i velikost</strong>
      zobrazených struktur.
    </>
  ],
  en: [
    <>
      The <strong>speed of sound</strong> depends on the properties of the medium, especially its density and elasticity. In
      soft tissues of the human body, a practical average value of about <strong>1540 m/s</strong> is used in clinical practice.
    </>,
    <>
      Speed of sound is critical for converting the echo travel time into distance. The scanner always assumes a constant
      propagation speed in tissues. If the real speed differs, a <strong>geometric error</strong> occurs and structures may be
      displayed slightly deeper or shallower than they really are.
    </>,
    <>
      In general, sound travels <strong>faster in stiff media</strong> (for example bone) and slower in softer, less elastic
      tissues. Large differences in speed at interfaces contribute to reflections and artifacts.
    </>,
    <>
      For the sonographer, it is therefore important to understand that changes in propagation speed affect the <strong>position,
      shape, and size</strong> of imaged structures.
    </>
  ]
} as const;

const acousticImpedanceCopy = {
  cs: [
    <>
      <strong>Akustická impedance</strong> je veličina, která popisuje odpor prostředí proti šíření zvukové vlny. Závisí na hustotě
      prostředí a rychlosti zvuku v něm.
    </>,
    <>
      Rozdíl akustických impedancí mezi dvěma tkáněmi určuje, kolik energie se na rozhraní <strong>odrazí</strong> a kolik projde
      dál. Čím větší rozdíl, tím silnější odraz a jasnější echogenní linie v obraze.
    </>,
    <>
      Extrémní rozdíl je mezi měkkými tkáněmi a vzduchem – proto vzduch vytváří téměř úplný odraz a výrazně zhoršuje zobrazení.
      Z tohoto důvodu se používá <strong>gel</strong> pro odstranění vzduchové vrstvy.
    </>,
    <>
      Porozumění akustické impedanci je klíčové pro interpretaci toho, proč jsou některé rozhraní <strong>hyperechogenní</strong>
      a jiné naopak málo viditelné.
    </>
  ],
  en: [
    <>
      <strong>Acoustic impedance</strong> describes the resistance of a medium to the propagation of a sound wave. It depends on
      the density of the medium and the speed of sound within it.
    </>,
    <>
      The difference in acoustic impedance between two tissues determines how much energy is <strong>reflected</strong> and how
      much is transmitted. The greater the difference, the stronger the reflection and the brighter the echogenic line in the image.
    </>,
    <>
      An extreme difference exists between soft tissues and air, which causes near-total reflection and severely degrades imaging.
      This is why <strong>gel</strong> is used to eliminate the air layer.
    </>,
    <>
      Understanding acoustic impedance is key to interpreting why some interfaces are <strong>hyperechoic</strong> and others are
      barely visible.
    </>
  ]
} as const;

const reflectionCopy = {
  cs: [
    <>
      <strong>Odraz</strong> vzniká na rozhraní dvou prostředí s odlišnou akustickou impedancí. Část energie se vrací zpět jako
      echo, které přístroj využívá k tvorbě obrazu.
    </>,
    <>
      Intenzita odrazu závisí na rozdílu impedancí a na úhlu dopadu paprsku. Nejvíce energie se vrací při <strong>kolmém dopadu</strong>,
      proto se snažíme sondu nastavit co nejkolměji k vyšetřované struktuře.
    </>,
    <>
      Odraz je hlavní mechanizmus, díky kterému vidíme hranice tkání. Zároveň je zdrojem některých artefaktů, například
      <strong>zrcadlení</strong> nebo <strong>reverberací</strong>.
    </>,
    <>
      V praxi je důležité chápat, že slabé odrazy mohou vést k nízké echogenitě, zatímco silné odrazy vytvářejí jasné linie.
    </>
  ],
  en: [
    <>
      <strong>Reflection</strong> occurs at the interface between two media with different acoustic impedances. Part of the energy
      returns as an echo, which the scanner uses to build the image.
    </>,
    <>
      The strength of reflection depends on the impedance difference and the angle of incidence. The most energy returns with
      <strong>perpendicular incidence</strong>, which is why we aim to keep the probe as perpendicular as possible to the target.
    </>,
    <>
      Reflection is the main mechanism that makes tissue boundaries visible. It is also the source of some artifacts, such as
      <strong>mirror</strong> and <strong>reverberation</strong> artifacts.
    </>,
    <>
      In practice, it is important to understand that weak reflections can lead to low echogenicity, while strong reflections
      create bright lines.
    </>
  ]
} as const;

const refractionCopy = {
  cs: [
    <>
      <strong>Lom</strong> (refraction) nastává, když zvuková vlna přechází mezi prostředími s různou rychlostí šíření a dopadá na
      rozhraní pod úhlem. Paprsek se potom <strong>odchyluje</strong> od původního směru.
    </>,
    <>
      V ultrazvuku může lom způsobit, že se struktura zobrazí na jiném místě, než kde skutečně je. Typickým důsledkem je
      <strong>laterální posun</strong> nebo zdvojení kontur.
    </>,
    <>
      K lomům často dochází na zakřivených rozhraních, například na okrajích šlach či cév. Změnou úhlu sondy lze tento efekt
      částečně minimalizovat.
    </>,
    <>
      Porozumění lomu pomáhá správně interpretovat obraz a odlišit skutečný nález od artefaktu.
    </>
  ],
  en: [
    <>
      <strong>Refraction</strong> occurs when a sound wave crosses an interface between media with different propagation speeds
      at an oblique angle. The beam then <strong>deviates</strong> from its original direction.
    </>,
    <>
      In ultrasound, refraction can cause a structure to appear in a different position than it actually is. A typical consequence
      is <strong>lateral displacement</strong> or duplication of edges.
    </>,
    <>
      Refraction often occurs at curved interfaces, for example along the edges of tendons or vessels. Adjusting the probe angle
      can partially reduce this effect.
    </>,
    <>
      Understanding refraction helps interpret the image correctly and distinguish true findings from artifacts.
    </>
  ]
} as const;

const probeGripCopy = {
  cs: {
    intro: (
      <>
        Správné <strong>držení sondy</strong> zvyšuje stabilitu, zlepšuje kontakt s tkáněmi a snižuje únavu ruky. Níže jsou tři
        praktické typy úchopu používané v MSK sonografii.
      </>
    ),
    items: [
      <>
        <strong>Princess grip</strong> – špatný způsob držení, protože je nestabilní a snadno vede k nechtěným pohybům sondy.
        Výsledkem je nižší kontrola a horší reprodukovatelnost obrazu.
      </>,
      <>
        <strong>Normal grip</strong> – standardní vyvážený úchop. Poskytuje dobrou stabilitu i citlivost a je nejčastěji používaný
        při rutinním vyšetření.
      </>,
      <>
        <strong>Powerful grip</strong> – také špatný způsob držení, protože omezuje jemné řízení a vede k přehnanému tlaku na
        tkáně. To snižuje citlivost, zhoršuje drobné korekce a zvyšuje únavu ruky.
      </>
    ]
  },
  en: {
    intro: (
      <>
        Proper <strong>probe grip</strong> improves stability, enhances tissue contact, and reduces hand fatigue. Below are three
        practical grip types commonly used in MSK ultrasound.
      </>
    ),
    items: [
      <>
        <strong>Princess grip</strong> – a poor grip choice because it is unstable and easily causes unintended probe movement.
        This results in reduced control and poorer reproducibility.
      </>,
      <>
        <strong>Normal grip</strong> – a balanced standard grip. It provides good stability and sensitivity and is the most common
        choice for routine scanning.
      </>,
      <>
        <strong>Powerful grip</strong> – also a poor grip choice because it limits fine control and encourages excessive pressure
        on tissues. This reduces sensitivity, worsens fine adjustments, and increases hand fatigue.
      </>
    ]
  }
} as const;

const echogenicityCopy = {
  cs: [
    <>
      <strong>Echogenita</strong> popisuje, jak intenzivně tkáň odráží ultrazvuk. V obraze se projevuje jako různý stupeň jasu,
      který umožňuje rozlišit struktury a jejich vlastnosti.
    </>,
    <>
      Základní pojmy: <strong>anechogenní</strong> (bez odrazu, zcela černé – typicky tekutiny), <strong>hypoechogenní</strong>
      (tmavší než okolí), <strong>izoechogenní</strong> (stejný jas jako okolí) a <strong>hyperechogenní</strong> (světlejší než
      okolí – silné odrazy, např. fibrotické tkáně nebo kalcifikace).
    </>,
    <>
      Echogenita vždy závisí na <strong>nastavení přístroje</strong> (gain, TGC) a na úhlu dopadu paprsku. Proto je důležité
      hodnotit jas struktury v kontextu okolí a při správném nastavení.
    </>,
    <>
      V praxi se často používá i termín <strong>heterogenní</strong> echotextura, která znamená nehomogenní vzhled tkáně. To může
      svědčit pro zánět, degenerativní změny nebo smíšený obsah.
    </>
  ],
  en: [
    <>
      <strong>Echogenicity</strong> describes how strongly a tissue reflects ultrasound. On the image it appears as different
      levels of brightness, allowing structures and their properties to be distinguished.
    </>,
    <>
      Key terms: <strong>anechoic</strong> (no reflection, completely black – typically fluid), <strong>hypoechoic</strong>
      (darker than surroundings), <strong>isoechoic</strong> (same brightness as surroundings), and <strong>hyperechoic</strong>
      (brighter than surroundings – strong reflections, e.g. fibrotic tissue or calcifications).
    </>,
    <>
      Echogenicity always depends on <strong>machine settings</strong> (gain, TGC) and on the angle of insonation. It should be
      judged in context of surrounding tissues and with proper settings.
    </>,
    <>
      In practice, the term <strong>heterogeneous</strong> echotexture is also used to indicate a non-uniform appearance, which can
      suggest inflammation, degenerative change, or mixed content.
    </>
  ]
} as const;

const jointVideoBySlug = {
  rameno: {
    src: "https://www.youtube-nocookie.com/embed/TCpKWtJ9g9A",
    title: { cs: "Rameno video tutorial", en: "Shoulder video tutorial" }
  },
  loket: {
    src: "https://www.youtube-nocookie.com/embed/H27ofDhfzVk",
    title: { cs: "Loket video tutorial", en: "Elbow video tutorial" }
  },
  zapesti: {
    src: "https://www.youtube-nocookie.com/embed/Lq4cgPNbpR8",
    title: { cs: "Zápěstí video tutorial", en: "Wrist video tutorial" }
  },
  kycel: {
    src: "https://www.youtube-nocookie.com/embed/7dexOe8owkE",
    title: { cs: "Kyčel video tutorial", en: "Hip video tutorial" }
  },
  koleno: {
    src: "https://www.youtube-nocookie.com/embed/9amXVQnCin0",
    title: { cs: "Koleno video tutorial", en: "Knee video tutorial" }
  },
  kotnik: {
    src: "https://www.youtube-nocookie.com/embed/Xag8-Odb7is",
    title: { cs: "Kotník video tutorial", en: "Ankle video tutorial" }
  }
} as const;

const nerveVideoBySlug = {
  "nervus-medianus": {
    kind: "embed",
    src: "https://www.youtube-nocookie.com/embed/WmzHNPNkBx0",
    title: { cs: "Nervus medianus video tutorial", en: "Median nerve video tutorial" }
  },
  "nervus-ulnaris": {
    kind: "file",
    src: assetPath("Ulnar nerve", "Ulnar nerve.mp4"),
    title: { cs: "Nervus ulnaris video tutorial", en: "Ulnar nerve video tutorial" }
  },
  "nervus-radialis": {
    kind: "file",
    src: assetPath("Radial nerve", "Radial nerve.mp4"),
    title: { cs: "Nervus radialis video tutorial", en: "Radial nerve video tutorial" }
  }
} as const;

const elbowSwipeCompareImages: JointProtocolCompareImage[] = ["01_01", "02_02", "03_03", "04_04", "01_05", "02_06"].map((key) => ({
  key,
  baseImage: makeResponsiveImagePhone("02_Elbow/protokol", `${key}_basic`),
  overlayImage: makeResponsiveImagePhone("02_Elbow/protokol", key)
}));

const wristSwipeCompareImages: JointProtocolCompareImage[] = [
  "01_Obrzek1_v2",
  "02_Obrzek2",
  "03_Obrzek3",
  "04_Obrzek4",
  "05_Obrzek5",
  "06_Obrzek6",
  "07_Obrzek7",
  "08_Obrzek8",
  "09_Obrzek9",
  "10_Obrzek10",
  "11_Obrzek11"
].map((key) => ({
  key,
  baseImage: makeResponsiveImagePhone("03_Wrist/protokol", `${key}_basic`),
  overlayImage: makeResponsiveImagePhone("03_Wrist/protokol", key)
}));

const hipSwipeCompareImages: JointProtocolCompareImage[] = [
  "01_Obrzek1",
  "07_Obrzek3",
  "08_Obrzek4",
  "09_Obrzek5",
  "10_Obrzek6",
  "11_Obrzek7",
  "12_Obrzek8",
  "13_Obrzek9",
  "02_Obrzek10",
  "03_Obrzek11",
  "04_Obrzek12",
  "05_Obrzek13",
  "06_Obrzek2"
].map((key) => ({
  key,
  baseImage: makeResponsiveImagePhone("04_Hip/protokol", `${key}_basic`),
  overlayImage: makeResponsiveImagePhone("04_Hip/protokol", key)
}));

const kneeSwipeCompareImages: JointProtocolCompareImage[] = [
  "01_Obrzek1",
  "02_Obrzek2",
  "03_Obrzek3",
  "04_Obrzek4",
  "05_Obrzek5",
  "06_Obrzek6",
  "07_Obrzek7",
  "08_Obrzek8",
  "09_Obrzek9"
].map((key) => ({
  key,
  baseImage: makeResponsiveImagePhone("05_Knee/protokol", `${key}_basic`),
  overlayImage: makeResponsiveImagePhone("05_Knee/protokol", key)
}));

const ankleSwipeCompareImages: JointProtocolCompareImage[] = [
  "01_Obrzek1",
  "02_Obrzek2",
  "03_Obrzek3",
  "04_Obrzek4",
  "05_Obrzek5",
  "06_Obrzek6",
  "07_Obrzek7",
  "08_Obrzek8",
  "09_Obrzek9",
  "10_Obrzek10",
  "11_Obrzek11"
].map((key) => ({
  key,
  baseImage: makeResponsiveImagePhone("06_Ankle/protokol", `${key}_basic`),
  overlayImage: makeResponsiveImagePhone("06_Ankle/protokol", key)
}));

const jointContentBySlug: Record<string, JointContent> = {
  loket: {
    folder: "02_Elbow/protokol",
    swipeCompareImages: elbowSwipeCompareImages,
    introPoints: [
      "Ultrazvukové vyšetření loketního kloubu je praktická metoda pro detailní hodnocení měkkých tkání v reálném čase; při správné technice přesně hodnotí šlachy flexorového i extenzorového aparátu, vazy, nervy i burzy a umožňuje přímou korelaci nálezu s bolestí a porovnání s druhou stranou.",
      "Kvalitní vyšetření vyžaduje standardizovanou polohu pacienta, systematický postup od kostních orientačních bodů (epikondyly humeru, olecranon, hlavice radia) a skenování v podélné i příčné rovině s aktivní prací se sondou (sliding, rocking, fanning) pro minimalizaci anizotropie.",
      "Dynamické manévry (flexe/extenze, pronace/supinace) pomáhají zachytit patologii šlach, subluxaci n. ulnaris v kubitálním tunelu i poruchy stability lokte; při tekutinových kolekcích je vhodná komprese/dekomprese pro odlišení výpotku, synovitidy nebo burzitidy od pevné tkáně.",
      "Zásadní je správné nastavení přístroje (hloubka, fokus, gain) a použití vysokofrekvenční lineární sondy; systematičnost, porovnání s kontralaterální stranou a znalost artefaktů jsou klíčové pro spolehlivou interpretaci."
    ],
    pathologyPoints: [
      "Nejčastější jsou tendinopatie, parciální ruptury a entezopatie v oblasti laterálního a mediálního epikondylu (společný extenzorový/flexorový úpon), dále postižení šlachy m. triceps brachii.",
      "Časté jsou také burzitida olecrani, synovitida a kloubní výpotek v předním i zadním recesu lokte.",
      "Významné je hodnocení nervových struktur, zejména n. ulnaris v kubitálním tunelu (ztluštění, změny echogenity, dynamická subluxace).",
      "U chronických obtíží lze nalézt degenerativní změny šlach, kalcifikace, nepravidelnosti kortikalis v místech úponů a změny echotextury svalů."
    ],
    protocolSteps: [
      { view: "Ventrální pohled", planes: ["Transverzální rovina", "Sagitální rovina"] },
      { view: "Mediální pohled", planes: ["Frontální rovina"] },
      { view: "Laterální pohled", planes: ["Frontální rovina"] },
      { view: "Dorzální pohled", planes: ["Sagitální rovina"] }
    ],
    protocolImages: [
      {
        key: "01_01",
        heading: "Obrázek 1. Ventrální pohled, transverzální rovina",
        bullets: [
          "b: distální šlacha bicepsu brachii, a: arteria brachialis, m: nervus medianus, c: chrupavka. Přední příčný řez loktem s přehledem radiohumerální oblasti, neurovaskulárních struktur a chrupavky."
        ]
      },
      {
        key: "02_02",
        heading: "Obrázek 2. Ventrální pohled, sagitální rovina, radiální strana",
        bullets: [
          "c: chrupavka, f: tekutina v kloubu. Podélný řez radiohumerálním skloubením vhodný pro hodnocení tekutiny v radiální jamce a předním recesu."
        ]
      },
      {
        key: "03_03",
        heading: "Obrázek 3. Ventrální pohled, sagitální rovina, ulnární strana",
        bullets: [
          "c: chrupavka, f: tekutina v kloubu. Podélný řez humeroulnárním skloubením s hodnocením fossa coronoidea a předního synoviálního recesu."
        ]
      },
      {
        key: "04_04",
        heading: "Obrázek 4. Mediální pohled, frontální rovina",
        bullets: [
          "CFT: společná flexorová šlacha. Projekce mediální části lokte pro hodnocení úponu flexorů, MCL a nálezů typu mediální epikondylitida."
        ]
      },
      {
        key: "01_05",
        heading: "Obrázek 5. Laterální pohled, frontální rovina",
        bullets: [
          "CET: společná šlacha extenzorů. Klíčová projekce pro laterální epikondylitidu, integritu extenzorového úponu a laterálního kolaterálního vazu."
        ]
      },
      {
        key: "02_06",
        heading: "Obrázek 6. Dorzální pohled, sagitální rovina",
        bullets: [
          "f: tekutina v kloubu. Zadní podélná projekce přes olecranon a šlachu tricepsu pro hodnocení zadního recesu, výpotku a burzitidy."
        ]
      }
    ]
  },
  zapesti: {
    folder: "03_Wrist/protokol",
    swipeCompareImages: wristSwipeCompareImages,
    introPoints: [
      "Ultrazvuk zápěstí umožňuje detailní hodnocení měkkých tkání v reálném čase; při správné technice přesně hodnotí flexorové a extenzorové šlachy, vazy, nervy i synoviální pochvy.",
      "Zásadní je standardizovaná poloha pacienta a systematické skenování od kostních orientačních bodů (distální radius/ulna, karpální kosti, karpální tunel) v podélné i příčné rovině s aktivní prací se sondou pro omezení anizotropie.",
      "Dynamické vyšetření (flexe/extenze, radiální/ulnární dukce) pomáhá odhalit instabilitu šlach, patologii extenzorových kompartmentů a změny v oblasti karpálního tunelu včetně komprese n. medianus.",
      "Správné nastavení (hloubka, fokus, gain), vysokofrekvenční lineární sonda a srovnání s druhostranným zápěstím jsou klíčové pro kvalitní interpretaci."
    ],
    pathologyPoints: [
      "Nejčastější jsou tendinopatie a tenosynovitidy flexorů/extenzorů, zejména v extenzorových kompartmentech a v karpálním tunelu.",
      "Častým nálezem jsou gangliové cysty jako ohraničené anechogenní/hypoechogenní léze s posteriorním zesílením.",
      "Běžné jsou synovitida a výpotek radiokarpálního či mediokarpálního kloubu.",
      "U n. medianus v karpálním tunelu lze zachytit známky útlaku (ztluštění, změna echogenity, alterace tvaru); u chronických stavů degenerativní změny a kalcifikace."
    ],
    protocolSteps: [
      { view: "Ventrální pohled", planes: ["Transverzální rovina", "Sagitální rovina"] },
      { view: "Laterální pohled", planes: ["Transverzální rovina", "Frontální rovina"] },
      { view: "Dorzální pohled", planes: ["Transverzální rovina"] }
    ],
    protocolImages: [
      { key: "01_Obrzek1_v2", heading: "Obrázek 1. Ventrální pohled, transverzální rovina", bullets: ["fcr: flexor carpi radialis, m: n. medianus, a: a. ulnaris, u: n. ulnaris, t: flexor tendon. Projekce karpálního tunelu a Guyonova kanálu pro hodnocení komprese nervů, tenosynovitidy a ganglií."] },
      { key: "02_Obrzek2", heading: "Obrázek 2. Ventrální pohled, transverzální rovina", bullets: ["m: nervus medianus. Proximální sledování n. medianus z karpálního tunelu do distálního předloktí mezi FDS a FDP."] },
      { key: "03_Obrzek3", heading: "Obrázek 3. Ventrální pohled, sagitální rovina", bullets: ["m: nervus medianus. Podélné zobrazení fascikulární architektury n. medianus při vstupu do karpálního tunelu."] },
      { key: "04_Obrzek4", heading: "Obrázek 4. Dorzální pohled, transverzální rovina", bullets: ["ECU, EDM, EDC, EI, EPL, ECRB, ECRL, EPB, APL. Přehled extenzorových kompartmentů na úrovni distálního radia."] },
      { key: "05_Obrzek5", heading: "Obrázek 5. Dorzální pohled, transverzální rovina", bullets: ["ECRB, ECRL. Druhý extenzorový kompartment laterálně od Listerova hrbolku, vhodný pro tenosynovitidu a přetížení."] },
      { key: "06_Obrzek6", heading: "Obrázek 6. Dorzální pohled, transverzální rovina", bullets: ["EPB, APL. První extenzorový kompartment, typická projekce pro De Quervainovu tenosynovitidu."] },
      { key: "07_Obrzek7", heading: "Obrázek 7. Dorzální pohled, transverzální rovina", bullets: ["ECU: extensor carpi ulnaris. Šestý extenzorový kompartment pro hodnocení instability/subluxace ECU a tenosynovitidy."] },
      { key: "08_Obrzek8", heading: "Obrázek 8. Dorzální pohled, sagitální rovina", bullets: ["Podélná dorzální projekce přes extenzorové šlachy a radiokarpální kloub s hodnocením tekutiny, zánětu a kontinuity šlach."] },
      { key: "09_Obrzek9", heading: "Obrázek 9.", bullets: [] },
      { key: "10_Obrzek10", heading: "Obrázek 10.", bullets: [] },
      { key: "11_Obrzek11", heading: "Obrázek 11.", bullets: [] }
    ]
  },
  kycel: {
    folder: "04_Hip/protokol",
    swipeCompareImages: hipSwipeCompareImages,
    introPoints: [
      "Ultrazvuk kyčle umožňuje hodnocení měkkých tkání v reálném čase a přináší informace o kloubním pouzdru, synovii, burzách, svalech a šlachách, zejména flexorového a abduktorového aparátu.",
      "Pro kvalitní vyšetření je zásadní systematický postup od kostních orientačních bodů (hlavice/krček femuru, acetabulum, velký trochanter) a skenování v podélné i příčné rovině se správnou prací se sondou.",
      "Dynamické manévry (flexe, extenze, abdukce, addukce, rotace) pomáhají posoudit snapping fenomén, patologický pohyb šlach i iritaci burz; komprese/dekomprese napomáhá odlišení tekutiny od pevné tkáně.",
      "Nastavení přístroje (hloubka, fokus, gain) je klíčové kvůli hlubším strukturám; dle oblasti je vhodná lineární nebo konvexní sonda."
    ],
    pathologyPoints: [
      "Časté jsou kloubní výpotek a synovitida v oblasti předního recesu kyčle.",
      "Velmi časté je postižení periartikulárních struktur v oblasti velkého trochanteru, zejména tendinopatie/parciální ruptury šlach m. gluteus medius a minimus, často s trochanterickou burzitidou.",
      "Další nálezy zahrnují tendinopatii m. iliopsoas a iliopsoovou burzitidu, často s bolestí v třísle a snapping fenoménem.",
      "U chronických potíží lze nalézt entezopatie, kalcifikace, degenerativní změny šlach a změny echotextury svalů včetně atrofie."
    ],
    protocolSteps: [
      { view: "Ventrální pohled", planes: ["Transverzální rovina", "Šikmá rovina"] },
      { view: "Laterální pohled", planes: ["Transverzální rovina", "Šikmá rovina"] },
      { view: "Dorzální pohled", planes: ["Transverzální rovina", "Sagitální rovina"] }
    ],
    protocolImages: [
      { key: "01_Obrzek1", heading: "Obrázek 1. Ventrální pohled, transverzální rovina", bullets: ["T: šlacha m. rectus femoris. Zobrazení myotendinózního přechodu m. rectus femoris pod m. sartorius."] },
      { key: "07_Obrzek3", heading: "Obrázek 2. Ventrální pohled, transverzální rovina", bullets: ["T: šlacha m. rectus femoris, SIAI: spina iliaca anterior inferior. Hodnocení úponu přímé šlachy a apofyzeálních/avulzních lézí."] },
      { key: "08_Obrzek4", heading: "Obrázek 3. Ventrální pohled, šikmá rovina", bullets: ["IFL: iliofemorální vaz, A: acetabulum, L: labrum, RF: rectus femoris. Projekce femoroacetabulárního kloubu pro hodnocení labra a výpotku."] },
      { key: "09_Obrzek5", heading: "Obrázek 4. Ventrální pohled, šikmá rovina", bullets: ["IFL: iliofemorální vaz. Distálnější šikmý řez pro hodnocení předního recesu, synovitidy a pouzdra."] },
      { key: "10_Obrzek6", heading: "Obrázek 5. Laterální pohled, transverzální rovina", bullets: ["Distální referenční řez přes femur a m. vastus lateralis, vhodný pro orientaci před proximálním sledováním."] },
      { key: "11_Obrzek7", heading: "Obrázek 6. Laterální pohled, transverzální rovina", bullets: ["Proximálnější řez s přechodem tvaru kosti do trojúhelníkového znaku oblasti velkého trochanteru."] },
      { key: "12_Obrzek8", heading: "Obrázek 7. Laterální pohled, šikmá rovina", bullets: ["TFL: tensor fasciae latae, GM: gluteus minimus. Přední faseta trochanteru pro hodnocení gluteální tendinopatie."] },
      { key: "13_Obrzek9", heading: "Obrázek 8. Laterální pohled, šikmá rovina", bullets: ["Detail přední fasety trochanteru, šlach gluteálního aparátu a okolních měkkých tkání."] },
      { key: "02_Obrzek10", heading: "Obrázek 9. Dorzální pohled, transverzální rovina", bullets: ["N: nervus ischiadicus. Příčný řez se „windmill sign“ mezi hamstringy pro lokalizaci sedacího nervu."] },
      { key: "03_Obrzek11", heading: "Obrázek 10. Dorzální pohled, transverzální rovina", bullets: ["T: šlacha hamstringů. Proximální řez u tuber ischiadicum pro tendinopatii či avulzi hamstringů."] },
      { key: "04_Obrzek12", heading: "Obrázek 11. Dorzální pohled, sagitální rovina", bullets: ["Podélná projekce sedacího nervu s hodnocením kontinuity, fascikulární struktury a pohyblivosti."] },
      { key: "05_Obrzek13", heading: "Obrázek 12. Dorzální pohled, sagitální rovina", bullets: ["T: šlacha hamstringů. Podélný pohled na úpon hamstringů na tuber ischiadicum pro hodnocení ruptur a tendinopatie."] },
      { key: "06_Obrzek2", heading: "Obrázek 13.", bullets: [] }
    ]
  },
  koleno: {
    folder: "05_Knee/protokol",
    swipeCompareImages: kneeSwipeCompareImages,
    introPoints: [
      "Ultrazvuk kolene je praktická metoda pro hodnocení měkkých tkání v reálném čase, zejména extenzorového aparátu, burz, synovie a periartikulárních struktur.",
      "Kvalitní vyšetření vyžaduje systematický postup od orientačních bodů (patela, femorální kondyly, tibiální plato, tuberositas tibiae) a vyšetření v podélné i příčné rovině.",
      "Dynamické manévry (flexe/extenze) umožňují posoudit pohyb pately, stabilitu šlach i iritaci burz, komprese/dekomprese pomáhá odlišit tekutinové kolekce.",
      "Správné nastavení hloubky, fokusu a gainu je klíčové; standardně lineární sonda, u hlubších struktur dle potřeby i konvexní."
    ],
    pathologyPoints: [
      "Nejčastěji se nachází kloubní výpotek a synovitida, hlavně v suprapatelárním recesu.",
      "Běžné je postižení šlachy m. quadriceps femoris a ligamentum patellae (tendinopatie, parciální ruptury, entezopatie).",
      "Časté jsou burzitidy (prepatelární, infrapatelární, anserinní).",
      "U chronických obtíží jsou přítomny degenerativní změny šlach, kalcifikace, změny kortikalis v úponech a změny echotextury svalů."
    ],
    protocolSteps: [
      { view: "Ventrální pohled", planes: ["Transverzální rovina", "Sagitální rovina"] },
      { view: "Mediální pohled", planes: ["Frontální rovina"] },
      { view: "Laterální pohled", planes: ["Frontální rovina"] },
      { view: "Dorzální pohled", planes: ["Transverzální rovina"] }
    ],
    protocolImages: [
      { key: "01_Obrzek1", heading: "Obrázek 1. Ventrální pohled, transverzální rovina, suprapatelárně", bullets: ["v. lat: vastus lateralis, v. med: vastus medialis. Příčný řez kvadricepsem a femurem pro orientaci a hodnocení svalových poranění."] },
      { key: "02_Obrzek2", heading: "Obrázek 2. Ventrální pohled, sagitální rovina, suprapatelárně", bullets: ["spfp: suprapatelární tukové těleso, pffp: prefemorální tukové těleso, *: suprapatelární recessus. Hodnocení výpotku a synoviální proliferace."] },
      { key: "03_Obrzek3", heading: "Obrázek 3. Ventrální pohled, transverzální rovina, infrapatelárně", bullets: ["Příčný řez patelární šlachou a Hoffovým tukovým tělesem pro tendinopatii a impingement."] },
      { key: "04_Obrzek4", heading: "Obrázek 4. Ventrální pohled, sagitální rovina, infrapatelárně", bullets: ["Podélný řez ligamentum patellae od dolního pólu pately k tibii pro ruptury a entezopatii."] },
      { key: "05_Obrzek5", heading: "Obrázek 5. Mediální pohled, frontální rovina", bullets: ["MCL: mediální kolaterální vaz. Hodnocení integrity MCL, mediálního menisku a mediálního recesu."] },
      { key: "06_Obrzek6", heading: "Obrázek 6. Laterální pohled, frontální rovina", bullets: ["LCL: laterální kolaterální vaz. Klíčová projekce pro entezopatii, parciální ruptury a avulzní poranění."] },
      { key: "07_Obrzek7", heading: "Obrázek 7. Dorzální pohled, transverzální rovina", bullets: ["ST: šlacha semitendinosu. „Cherry on top“ znak pro orientaci mediálních hamstringů."] },
      { key: "08_Obrzek8", heading: "Obrázek 8. Dorzální pohled, transverzální rovina", bullets: ["SM: šlacha semimembranosu, ST: šlacha semitendinosu. Typická lokalizace Bakerovy cysty."] },
      { key: "09_Obrzek9", heading: "Obrázek 9. Dorzální pohled, transverzální rovina", bullets: ["T: nervus tibialis, P: nervus peroneus communis. Hodnocení nervů v posterolaterální oblasti kolene."] }
    ]
  },
  kotnik: {
    folder: "06_Ankle/protokol",
    swipeCompareImages: ankleSwipeCompareImages,
    introPoints: [
      "Ultrazvuk hlezna je praktická metoda pro hodnocení měkkých tkání v reálném čase; přináší informace o synovii, vazech, burzách a šlachách (Achillova, peroneální, tibiální).",
      "Pro kvalitní vyšetření je důležitý systematický postup od orientačních bodů (malleoly, talus, calcaneus, distální tibie/fibula) v podélné i příčné rovině.",
      "Dynamické manévry (dorzální/plantární flexe, inverze/everze) pomáhají hodnotit stabilitu šlach v retinákulech, stabilitu vazů a patologický pohyb šlach.",
      "Správné nastavení přístroje a porovnání s druhostranným kotníkem je zásadní pro detekci jemných změn, jako jsou parciální ruptury, tenosynovitida nebo entezopatie."
    ],
    pathologyPoints: [
      "Nejčastěji se vyskytuje výpotek a synovitida v předním recesu hlezna.",
      "Časté jsou tendinopatie a parciální ruptury Achillovy šlachy, šlach tibialis anterior/posterior a peroneálních šlach.",
      "Běžné jsou tenosynovitidy, retromaleolární tekutinové kolekce a burzitidy včetně retrocalcaneární.",
      "Ultrazvuk je přínosný i pro poranění vazů laterálního komplexu, hematomy a chronické degenerativní změny."
    ],
    protocolSteps: [
      { view: "Ventrální pohled", planes: ["Sagitální rovina", "Transverzální rovina"] },
      { view: "Mediální pohled", planes: ["Transverzální rovina"] },
      { view: "Laterální pohled", planes: ["Transverzální rovina"] },
      { view: "Dorzální pohled", planes: ["Sagitální rovina", "Transverzální rovina"] }
    ],
    protocolImages: [
      { key: "01_Obrzek1", heading: "Obrázek 1. Ventrální pohled, sagitální rovina", bullets: ["c: chrupavka, j: tekutina v kloubní dutině. Podélná přední projekce přes EHL, přední recesus a chrupavku talu."] },
      { key: "02_Obrzek2", heading: "Obrázek 2. Ventrální pohled, transverzální rovina", bullets: ["EDL, EHL, TA. Příčný řez předními extenzorovými šlachami nad talem pro hodnocení tenosynovitid a tendinopatií."] },
      { key: "03_Obrzek3", heading: "Obrázek 3. Mediální pohled, transverzální rovina", bullets: ["TP, FDL, FHL, A, V, T. Projekce tarzálního tunelu s neurovaskulárním svazkem a flexorovými šlachami."] },
      { key: "04_Obrzek4", heading: "Obrázek 4. Laterální pohled, transverzální rovina", bullets: ["ATFL: ligamentum talofibulare anterius. Klíčový pohled pro distorzi laterálního hlezna a hodnocení kontinuity ATFL."] },
      { key: "05_Obrzek5", heading: "Obrázek 5. Dorzální pohled, sagitální rovina", bullets: ["Podélná projekce Achillovy šlachy nad Kagerovým tukovým tělesem pro tendinopatii a retrocalcaneární burzitidu."] },
      { key: "06_Obrzek6", heading: "Obrázek 6. Dorzální pohled, sagitální rovina", bullets: ["Proximálnější podélná projekce m. triceps surae pro hodnocení svalové symetrie, ruptur a hematomů."] },
      { key: "07_Obrzek7", heading: "Obrázek 7. Dorzální pohled, transverzální rovina", bullets: ["TA: Achillova šlacha. Příčný řez Achillovou šlachou s hodnocením kontinuity a okolních měkkých tkání."] },
      { key: "08_Obrzek8", heading: "Obrázek 8. Dorzální pohled, transverzální rovina", bullets: ["Příčný pohled svaly triceps surae vhodný pro myotendinózní poranění, atrofii a fibrotické změny."] },
      { key: "09_Obrzek9", heading: "Obrázek 9.", bullets: [] },
      { key: "10_Obrzek10", heading: "Obrázek 10.", bullets: [] },
      { key: "11_Obrzek11", heading: "Obrázek 11.", bullets: [] }
    ]
  }
};

const jointPositioningBySlug: Record<string, JointPositioningContent> = {
  rameno: {
    imageBaseName: "rameno",
    intro: {
      cs: "Schéma ukazuje doporučenou polohu pacienta pro základní vyšetření ramene. Cílem je rychlá orientace před samotným protokolem, optimální přístup k vyšetřovaným strukturám, stabilita během skenování a dobré pohodlí pacienta.",
      en: "The chart shows recommended patient positioning for the basic shoulder examination. The goal is quick orientation before the protocol, optimal access to target structures, stable probe handling during scanning, and patient comfort throughout the exam."
    },
    positions: {
      cs: [
        "1. Základní pozice pro vyšetření ventrálního pohledu.",
        "2. Pozice k vyšetření m. subscapularis - ventrální pohled.",
        "3. Crass position - pozice k vyšetření rotátorové manžety - laterální pohled.",
        "4. Modified Crass position - pozice k vyšetření rotátorové manžety - laterální pohled.",
        "5. Pozice k vyšetření dorzálního pohledu."
      ],
      en: [
        "1. Baseline position for ventral view.",
        "2. Position for subscapularis assessment - ventral view.",
        "3. Crass position - rotator cuff assessment - lateral view.",
        "4. Modified Crass position - rotator cuff assessment - lateral view.",
        "5. Position for dorsal view."
      ]
    }
  },
  loket: {
    imageBaseName: "loket",
    intro: {
      cs: "Schéma ukazuje doporučenou polohu pacienta pro vyšetření lokte. Cílem je optimální přístup k vyšetřovaným strukturám, stabilita při vyšetření a komfort pacienta v jednotlivých projekcích.",
      en: "The chart shows recommended patient positioning for elbow ultrasound. The goal is optimal access to target structures, scan stability, and patient comfort in each view."
    },
    positions: {
      cs: [
        "Ventrální pohled (loket lehce flektován): hodnocení předního recesu, bicepsové šlachy a brachialis.",
        "Mediální pohled: vyšetření společného flexorového úponu, MCL a oblasti n. ulnaris.",
        "Laterální pohled: posouzení společného extenzorového úponu a LCL, typicky při laterální epikondylalgii.",
        "Dorzální pohled (loket flektován): zobrazení tricepsu, olecranu a zadního recesu při podezření na výpotek/burzitidu."
      ],
      en: [
        "Anterior view (slight elbow flexion): evaluates anterior recess, distal biceps tendon, and brachialis.",
        "Medial view: examines common flexor origin, MCL, and ulnar nerve region.",
        "Lateral view: assesses common extensor origin and LCL, typically for lateral epicondyle pain.",
        "Posterior view (elbow flexed): visualizes triceps, olecranon, and posterior recess for effusion/bursitis."
      ]
    }
  },
  zapesti: {
    imageBaseName: "zapesti",
    intro: {
      cs: "Schéma ukazuje doporučenou polohu pacienta při vyšetření zápěstí. Cílem je optimální přístup ke strukturám karpální oblasti, stabilita během skenování a pohodlí pacienta při ventrálních i dorzálních projekcích.",
      en: "The chart shows recommended patient positioning for wrist ultrasound. The goal is optimal access to carpal structures, stable scanning conditions, and patient comfort in volar and dorsal views."
    },
    positions: {
      cs: [
        "Ventrální transverzální poloha: orientace v karpálním tunelu a Guyonově kanálu, zejména pro medianus/ulnaris.",
        "Ventrální sagitální poloha: podélné sledování medianu a flexorových šlach.",
        "Dorzální transverzální poloha: přehled extenzorových kompartmentů a tenosynovitid.",
        "Dorzální sagitální poloha: hodnocení radiokarpálního kloubu, tekutiny a kontinuity extenzorových šlach."
      ],
      en: [
        "Volar transverse setup: orientation in carpal tunnel and Guyon's canal, especially for median/ulnar nerves.",
        "Volar sagittal setup: longitudinal tracking of median nerve and flexor tendons.",
        "Dorsal transverse setup: overview of extensor compartments and tenosynovitis.",
        "Dorsal sagittal setup: evaluates radiocarpal joint fluid and extensor tendon continuity."
      ]
    }
  },
  kycel: {
    imageBaseName: "kycel",
    intro: {
      cs: "Schéma ukazuje doporučenou polohu pacienta při vyšetření kyčle. Cílem je optimální přístup i k hlubším strukturám, dobrá stabilita vyšetření a komfort pacienta během jednotlivých projekcí.",
      en: "The chart shows recommended patient positioning for hip ultrasound. The goal is optimal access, including deeper structures, stable scanning, and patient comfort across views."
    },
    positions: {
      cs: [
        "Ventrální poloha (supinace): hodnocení předního recesu, pouzdra, labra a iliopsoatické oblasti.",
        "Laterální poloha: zobrazení velkého trochanteru, gluteálních úponů a trochanterické burzy.",
        "Dorzální poloha: sledování hamstringových úponů a průběhu n. ischiadicus.",
        "Dynamika (rotace, flexe/extenze): užitečná pro snapping fenomény a posouzení dráhy šlach."
      ],
      en: [
        "Anterior setup (supine): evaluates anterior recess, capsule, labrum, and iliopsoas region.",
        "Lateral setup: visualizes greater trochanter, gluteal insertions, and trochanteric bursa.",
        "Posterior setup: tracks hamstring insertions and sciatic nerve course.",
        "Dynamic maneuvers (rotation, flexion/extension): useful for snapping phenomena and tendon tracking."
      ]
    }
  },
  koleno: {
    imageBaseName: "koleno",
    intro: {
      cs: "Schéma ukazuje doporučenou polohu pacienta při vyšetření kolene v extenzi i flexi. Cílem je optimální přístup ke strukturám v jednotlivých oknech, stabilita vyšetření a pohodlí pacienta.",
      en: "The chart shows recommended patient positioning for knee ultrasound in extension and flexion. The goal is optimal access in each window, scan stability, and patient comfort."
    },
    positions: {
      cs: [
        "Přední poloha (extenze): kontrola quadricepsové šlachy, pately, patelární šlachy a suprapatelárního recesu.",
        "Přední poloha (flektované koleno): zlepšuje pohled na kloubní recessy a pohyb pately.",
        "Mediální/laterální poloha: hodnocení kolaterálních vazů, meniskálních okrajů a entezopatií.",
        "Dorzální poloha: vyšetření podkolenní jamky, Bakerovy cysty a průběhu tibiálního/peroneálního nervu."
      ],
      en: [
        "Anterior setup (extension): checks quadriceps tendon, patella, patellar tendon, and suprapatellar recess.",
        "Anterior setup (knee flexed): improves visualization of recesses and patellar movement.",
        "Medial/lateral setup: evaluates collateral ligaments, meniscal edges, and enthesopathy.",
        "Posterior setup: examines popliteal fossa, Baker cyst region, and tibial/peroneal nerve course."
      ]
    }
  },
  kotnik: {
    imageBaseName: "kotnik",
    intro: {
      cs: "Schéma ukazuje doporučenou polohu pacienta při vyšetření kotníku. Cílem je optimální přístup k vyšetřovaným strukturám, stabilita při dynamickém i statickém hodnocení a pohodlí pacienta.",
      en: "The chart shows recommended patient positioning for ankle ultrasound. The goal is optimal access to target structures, stable static and dynamic assessment, and patient comfort."
    },
    positions: {
      cs: [
        "Přední poloha: orientace v předním recesu hlezna a extenzorových šlachách.",
        "Mediální poloha: vyšetření tarzálního tunelu, tibialis posterior a flexorových struktur.",
        "Laterální poloha: cílené hodnocení ATFL/CFL a peroneálních šlach při distorzích.",
        "Dorzální (posteriorní) poloha: zobrazení Achillovy šlachy, Kagerova prostoru a retrokalkaneální burzy."
      ],
      en: [
        "Anterior setup: orientation in the anterior ankle recess and extensor tendons.",
        "Medial setup: examines tarsal tunnel, tibialis posterior, and flexor structures.",
        "Lateral setup: targeted ATFL/CFL and peroneal tendon assessment in sprain cases.",
        "Posterior setup: visualizes Achilles tendon, Kager fat pad, and retrocalcaneal bursa."
      ]
    }
  }
};

const nerveAnatomyImages = [
  { key: "2_axilla", title: { cs: "Axilla", en: "Axilla" } },
  { key: "1_arm", title: { cs: "Paže", en: "Arm" } },
  { key: "3_elbow", title: { cs: "Loket", en: "Elbow" } },
  { key: "4_forearm", title: { cs: "Předloktí", en: "Forearm" } },
  { key: "5_wrist", title: { cs: "Zápěstí", en: "Wrist" } }
];
const nerveAnatomyIntroCopy = {
  cs: "Příčná anatomie je klíčová pro porozumění sonografickému obrazu, protože ultrazvuk zobrazuje struktury v jednotlivých řezech. Níže projdeme pět klíčových úrovní příčného řezu, které budeme na nervu sledovat.",
  en: "Cross-sectional anatomy is essential for understanding ultrasound images because the probe visualizes structures in slices. Below we discuss five key cross-section levels that we will follow along the nerve."
};
const nerveAnatomyIntroAlt = {
  cs: "Přehled klíčových příčných řezů",
  en: "Overview of key cross sections"
};
const nerveAnatomyFigureCaptions: Record<string, { cs: string; en: string }> = {
  "2_axilla": { cs: "Řez axillou", en: "Axilla section" },
  "1_arm": { cs: "Řez paží", en: "Arm section" },
  "3_elbow": { cs: "Řez loktem", en: "Elbow section" },
  "4_forearm": { cs: "Řez předloktím", en: "Forearm section" },
  "5_wrist": { cs: "Řez zápěstím", en: "Wrist section" }
};

const nerveIntroBySlug: Record<string, NerveIntroContent> = {
  "nervus-medianus": {
    text: {
      cs: (
        <>
          Ultrazvuk <strong>n. medianus</strong> je v PMR zásadní hlavně při potížích v oblasti karpálního tunelu, předloktí a
          loketní jamky, protože umožňuje rychle ověřit <strong>změnu kalibru nervu</strong>, ztrátu fascikulární kresby i vztah
          k okolním šlachám a retinakulu. Pomáhá odlišit syndrom karpálního tunelu od proximálnější komprese, zachytit
          zánětlivé či posttraumatické změny a přesněji zacílit další rehabilitační, intervenční nebo chirurgický postup. Velkou
          výhodou je i možnost dynamického porovnání s druhostranným nervem a sledování nervu v celé délce přes rizikové úseky,
          kde se komprese nemusí projevit jen v karpálním tunelu, ale i proximálněji v oblasti pronator teres nebo lacertus fibrosus.
        </>
      ),
      en: (
        <>
          Ultrasound of the <strong>median nerve</strong> is especially important in PMR when symptoms arise around the carpal
          tunnel, forearm, or cubital fossa, because it quickly shows <strong>nerve caliber change</strong>, loss of fascicular
          pattern, and the nerve&apos;s relation to nearby tendons and retinaculum. It helps distinguish carpal tunnel syndrome
          from more proximal compression, detect inflammatory or post-traumatic changes, and better guide rehabilitation,
          injection, or surgical planning. Another major advantage is dynamic comparison with the contralateral side and continuous
          tracking of the nerve across high-risk segments, where compression may occur not only in the carpal tunnel but also more
          proximally near the pronator teres or lacertus fibrosus.
        </>
      )
    },
    imageBaseName: "median",
    alt: {
      cs: "Anatomický přehled průběhu nervus medianus",
      en: "Anatomical overview of the median nerve course"
    }
  },
  "nervus-ulnaris": {
    text: {
      cs: (
        <>
          Ultrazvuk <strong>n. ulnaris</strong> má velký význam zejména v oblasti mediálního lokte a Guyonova kanálu, kde je nerv
          často vystaven <strong>kompresi nebo dynamické iritaci</strong>. Vyšetření v reálném čase umožňuje sledovat průběh nervu
          přes kubitální tunel, posoudit ztluštění, změny echogenity, subluxaci při flexi lokte i vztah k retinakulu a FCU, a
          tím lépe rozlišit, zda jsou příznaky dány útlakem, přetížením nebo následkem úrazu. Prakticky je velmi cenné i to, že
          sonografie zobrazí nerv při pohybu, takže lze zachytit intermitentní obtíže, které nemusí být patrné při statickém
          vyšetření, a současně posoudit okolní měkké tkáně, jizvy, ganglia nebo změny po opakované mechanické zátěži.
        </>
      ),
      en: (
        <>
          Ultrasound of the <strong>ulnar nerve</strong> is highly valuable, especially at the medial elbow and in Guyon&apos;s canal,
          where the nerve is commonly affected by <strong>compression or dynamic irritation</strong>. Real-time imaging allows us
          to follow the nerve through the cubital tunnel, assess thickening, echotexture change, subluxation during elbow
          flexion, and its relationship to the retinaculum and FCU, helping separate entrapment from overload or post-traumatic
          pathology. In practice, sonography is also valuable because it visualizes the nerve during movement, making intermittent
          problems easier to detect, while simultaneously assessing surrounding soft tissues, scar tissue, ganglia, or overload-related
          structural change.
        </>
      )
    },
    imageBaseName: "ulnar",
    alt: {
      cs: "Anatomický přehled průběhu nervus ulnaris",
      en: "Anatomical overview of the ulnar nerve course"
    }
  },
  "nervus-radialis": {
    text: {
      cs: (
        <>
          Ultrazvuk <strong>n. radialis</strong> je velmi užitečný při bolestech laterálního lokte, slabosti extenzorů i po úrazech
          paže, protože přesně ukazuje průběh nervu v <strong>sulcus nervi radialis</strong>, místo dělení v loketní jamce i hlubokou
          větev pod Frohseho arkádou. Díky tomu lze lépe odhalit útlak, trakční poškození nebo jizevnaté změny a odlišit
          neuropatii radiálního nervu od samotné tendinopatie v oblasti laterálního epikondylu. Vyšetření je důležité také po
          frakturách humeru nebo při podezření na syndrom zadního interoseálního nervu, kdy ultrazvuk pomáhá určit přesnou úroveň
          postižení a vztah nervu k okolním fasciálním a svalovým strukturám.
        </>
      ),
      en: (
        <>
          Ultrasound of the <strong>radial nerve</strong> is very useful in lateral elbow pain, extensor weakness, and after arm
          trauma because it clearly shows the nerve in the <strong>radial groove</strong>, the division point in the cubital fossa,
          and the deep branch beneath the arcade of Frohse. This helps reveal entrapment, traction injury, or scarring and also
          distinguish radial neuropathy from isolated lateral epicondylar tendinopathy. It is also important after humeral fractures
          or when posterior interosseous nerve syndrome is suspected, because ultrasound helps define the exact level of involvement
          and the nerve&apos;s relationship to surrounding fascial and muscular structures.
        </>
      )
    },
    imageBaseName: "radial",
    alt: {
      cs: "Anatomický přehled průběhu nervus radialis",
      en: "Anatomical overview of the radial nerve course"
    }
  }
};

const nerveUltrasoundByNerve: Record<string, NerveUltrasoundContent> = {
  "nervus-ulnaris": {
    intro: {
      cs: "Níže jsou ultrazvukové obrazy n. ulnaris vložené ve stejném přehledném formátu jako v ostatních obrazových podkapitolách.",
      en: "Below are ultrasound images of the ulnar nerve arranged in the same visual format as the other image-based subsections."
    },
    sections: [
      "UN1",
      "UN2",
      "UN3",
      "UN4"
    ].map((key, index) => ({
      key,
      title: { cs: `Obrázek ${index + 1}`, en: `Figure ${index + 1}` },
      caption: {
        cs: `Obrázek ${index + 1}. Ultrazvukové vyšetření n. ulnaris.`,
        en: `Figure ${index + 1}. Ulnar nerve ultrasound examination.`
      }
    }))
  }
};

const radialNerveUltrasoundContent: NerveUltrasoundContent = {
  intro: {
    cs: "N\u00ed\u017ee jsou ultrazvukov\u00e9 obrazy n. radialis vlo\u017een\u00e9 ve stejn\u00e9m p\u0159ehledn\u00e9m form\u00e1tu jako v ostatn\u00edch obrazov\u00fdch podkapitol\u00e1ch.",
    en: "Below are ultrasound images of the radial nerve arranged in the same visual format as the other image-based subsections."
  },
  sections: []
};

const ulnarNerveSwipeCompareImages: JointProtocolCompareImage[] = Array.from({ length: 14 }, (_, index) => {
  const imageNumber = index + 1;
  const imageKey = `${String(imageNumber).padStart(2, "0")}_Obrzek${imageNumber}`;

  return {
    key: imageKey,
    baseImage: makeResponsiveImagePhone("Nerves/Ulnar nerve", `${imageKey}_basic`),
    overlayImage: makeResponsiveImagePhone("Nerves/Ulnar nerve", imageKey)
  };
});

const ulnarNerveUltrasoundCaptions = [
  {
    cs: "Obr\u00e1zek 1. Axilla: Nervus ulnaris ulo\u017een medi\u00e1ln\u011b a dorz\u00e1ln\u011b od arteria axillaris.",
    en: "Figure 1. Axilla: The ulnar nerve is positioned medial and dorsal to the axillary artery."
  },
  {
    cs: "Obr\u00e1zek 2. Brachium: Nervus ulnaris prob\u00edh\u00e1 medi\u00e1ln\u011b, povrchov\u011b, p\u0159ilo\u017een\u00fd k medi\u00e1ln\u00ed hlav\u011b musculus triceps brachii.",
    en: "Figure 2. Arm: The ulnar nerve runs medially and superficially, adjacent to the medial head of the triceps brachii muscle."
  },
  {
    cs: "Obr\u00e1zek 3. Brachium: Nervus ulnaris se st\u00e1\u010d\u00ed dorz\u00e1ln\u011b, perforuje medi\u00e1ln\u00ed intermuskul\u00e1rn\u00ed septum a v dist\u00e1ln\u00ed t\u0159etin\u011b pa\u017ee prob\u00edh\u00e1 pod Struthersov\u00fdm ark\u00e1dov\u00fdm pruhem.",
    en: "Figure 3. Arm: The ulnar nerve turns dorsally, perforates the medial intermuscular septum, and in the distal third of the arm passes beneath the Struthers arcade."
  },
  {
    cs: "Obr\u00e1zek 4. Cubitum: Nervus ulnaris prob\u00edh\u00e1 dorz\u00e1ln\u011b za medi\u00e1ln\u00edm epikondylem humeru.",
    en: "Figure 4. Elbow: The ulnar nerve courses dorsally behind the medial epicondyle of the humerus."
  },
  {
    cs: "Obr\u00e1zek 5. Cubitum: Kubit\u00e1ln\u00ed tunel - nervus ulnaris prob\u00edh\u00e1 pod Osborneov\u00fdm ligamentem.",
    en: "Figure 5. Elbow: Cubital tunnel - the ulnar nerve passes beneath Osborne's ligament."
  },
  {
    cs: "Obr\u00e1zek 6. Cubitum: Nervus ulnaris prob\u00edh\u00e1 pod ligamentum arcuatum.",
    en: "Figure 6. Elbow: The ulnar nerve passes beneath the arcuate ligament."
  },
  {
    cs: "Obr\u00e1zek 7. Antebrachium: Nervus ulnaris prob\u00edh\u00e1 mezi hlavami musculus flexor carpi ulnaris, d\u00e1le pod t\u00edmto svalem.",
    en: "Figure 7. Forearm: The ulnar nerve passes between the heads of the flexor carpi ulnaris muscle and then continues beneath this muscle."
  },
  {
    cs: "Obr\u00e1zek 8. Antebrachium: Nervus ulnaris prob\u00edh\u00e1 mezi musculus flexor digitorum profundus a musculus flexor digitorum superficialis; dist\u00e1ln\u011b je doprov\u00e1zen arteria ulnaris.",
    en: "Figure 8. Forearm: The ulnar nerve runs between the flexor digitorum profundus and flexor digitorum superficialis muscles; distally it is accompanied by the ulnar artery."
  },
  {
    cs: "Obr\u00e1zek 9. Carpus: Nervus ulnaris v Guyonov\u011b kan\u00e1lu.",
    en: "Figure 9. Wrist: The ulnar nerve in Guyon's canal."
  },
  {
    cs: "Obr\u00e1zek 10. Dist\u00e1ln\u00ed t\u0159etina p\u0159edlokt\u00ed: pr\u016fb\u011bh nervus ulnaris.",
    en: "Figure 10. Distal third of the forearm: Course of the ulnar nerve."
  },
  {
    cs: "Obr\u00e1zek 11. Dist\u00e1ln\u00ed t\u0159etina p\u0159edlokt\u00ed: dorz\u00e1ln\u00ed ko\u017en\u00ed v\u011btev nervus ulnaris v \u00faroovni musculus pronator quadratus, mezi musculus pronator quadratus a musculus flexor carpi ulnaris.",
    en: "Figure 11. Distal third of the forearm: The dorsal cutaneous branch of the ulnar nerve at the level of the pronator quadratus, between the pronator quadratus and flexor carpi ulnaris muscles."
  },
  {
    cs: "Obr\u00e1zek 12. Dist\u00e1ln\u00ed t\u0159etina p\u0159edlokt\u00ed: dorz\u00e1ln\u00ed ko\u017en\u00ed v\u011btev nervus ulnaris obkru\u017euje dors\u00e1ln\u011b ulnu.",
    en: "Figure 12. Distal third of the forearm: The dorsal cutaneous branch of the ulnar nerve winds dorsally around the ulna."
  },
  {
    cs: "Obr\u00e1zek 13. Carpus: Nervus ulnaris v \u00faroovni karpu v Guyonov\u011b kan\u00e1lu.",
    en: "Figure 13. Wrist: The ulnar nerve at the carpal level in Guyon's canal."
  },
  {
    cs: "Obr\u00e1zek 14. Carpus: Nervus ulnaris se d\u011bl\u00ed na povrchovou senzitivn\u00ed a hlubokou motorickou v\u011btev, kter\u00e1 vstupuje do hloubky v \u00faroovni hamulus ossis hamati.",
    en: "Figure 14. Wrist: The ulnar nerve divides into a superficial sensory branch and a deep motor branch, which dives deep at the level of the hook of the hamate."
  }
];

const ulnarNerveUltrasoundSections: NerveUltrasoundSection[] = ulnarNerveUltrasoundCaptions.map((caption, index) => {
  const imageNumber = index + 1;

  return {
    key: `${String(imageNumber).padStart(2, "0")}_Obrzek${imageNumber}`,
    title: {
      cs: `Obr\u00e1zek ${imageNumber}`,
      en: `Figure ${imageNumber}`
    },
    caption
  };
});

const radialNerveSwipeCompareImages: JointProtocolCompareImage[] = Array.from({ length: 16 }, (_, index) => {
  const baseImageNumber = index * 2 + 1;
  const overlayImageNumber = baseImageNumber + 1;
  const baseImageKey = `${String(baseImageNumber).padStart(2, "0")}_Obrzek${baseImageNumber}_v2`;
  const overlayImageKey = `${String(overlayImageNumber).padStart(2, "0")}_Obrzek${overlayImageNumber}_v2`;

  return {
    key: `${String(baseImageNumber).padStart(2, "0")}_Obrzek${baseImageNumber}`,
    baseImage: makeResponsiveImagePhone("Nerves/Radial nerve", baseImageKey),
    overlayImage: makeResponsiveImagePhone("Nerves/Radial nerve", overlayImageKey)
  };
});

const radialNerveUltrasoundCaptions = [
  {
    cs: "Obr\u00e1zek 1. Axilla: Nervus radialis je ulo\u017een dorz\u00e1ln\u011b od arteria axillaris.",
    en: "Figure 1. Axilla: The radial nerve is positioned dorsal to the axillary artery."
  },
  {
    cs: "Obr\u00e1zek 2. Brachium: Nervus radialis prob\u00edh\u00e1 mezi dlouhou a medi\u00e1ln\u00ed hlavou musculus triceps brachii.",
    en: "Figure 2. Arm: The radial nerve runs between the long and medial heads of the triceps brachii muscle."
  },
  {
    cs: "Obr\u00e1zek 3. Brachium: Nervus radialis prob\u00edh\u00e1 v sulcus nervi radialis mezi medi\u00e1ln\u00ed a later\u00e1ln\u00ed hlavou musculus triceps brachii.",
    en: "Figure 3. Arm: The radial nerve runs in the radial groove between the medial and lateral heads of the triceps brachii muscle."
  },
  {
    cs: "Obr\u00e1zek 4. Brachium: Nervus radialis proch\u00e1z\u00ed later\u00e1ln\u00edm intermuskul\u00e1rn\u00edm septem a p\u0159ech\u00e1z\u00ed ventr\u00e1ln\u011b.",
    en: "Figure 4. Arm: The radial nerve passes through the lateral intermuscular septum and moves ventrally."
  },
  {
    cs: "Obr\u00e1zek 5. Brachium: Nervus radialis je ulo\u017een mezi musculus brachioradialis a musculus biceps brachii.",
    en: "Figure 5. Arm: The radial nerve is located between the brachioradialis and biceps brachii muscles."
  },
  {
    cs: "Obr\u00e1zek 6. Cubitum: Nervus radialis prob\u00edh\u00e1 mezi musculus brachioradialis a musculus brachialis a d\u011bl\u00ed se na hlubokou a povrchovou v\u011btev.",
    en: "Figure 6. Elbow: The radial nerve runs between the brachioradialis and brachialis muscles and divides into deep and superficial branches."
  },
  {
    cs: "Obr\u00e1zek 7. Cubitum: V oblasti lokte se nervus radialis d\u011bl\u00ed mezi musculus brachioradialis a musculus brachialis na hlubokou a povrchovou v\u011btev.",
    en: "Figure 7. Elbow: At the elbow, the radial nerve divides between the brachioradialis and brachialis muscles into deep and superficial branches."
  },
  {
    cs: "Obr\u00e1zek 8. Antebrachium: Povrchov\u00e1 v\u011btev nervus radialis prob\u00edh\u00e1 pod musculus brachioradialis.",
    en: "Figure 8. Forearm: The superficial branch of the radial nerve runs beneath the brachioradialis muscle."
  },
  {
    cs: "Obr\u00e1zek 9. Antebrachium: Povrchov\u00e1 v\u011btev nervus radialis perforuje fascii mezi musculus brachioradialis a musculus extensor carpi radialis longus.",
    en: "Figure 9. Forearm: The superficial branch of the radial nerve perforates the fascia between the brachioradialis and extensor carpi radialis longus muscles."
  },
  {
    cs: "Obr\u00e1zek 10. Carpus: Povrchov\u00e1 v\u011btev nervus radialis prob\u00edh\u00e1 mezi 1. a 2. dorz\u00e1ln\u00edm kompartmentem z\u00e1p\u011bst\u00ed, vstupuje do foveola radialis, je k\u0159\u00ed\u017eena vena cephalica a zaji\u0161\u0165uje senzitivn\u00ed inervaci dorz\u00e1ln\u00ed oblasti.",
    en: "Figure 10. Wrist: The superficial branch of the radial nerve runs between the first and second dorsal wrist compartments, enters the radial fossa, is crossed by the cephalic vein, and provides sensory innervation to the dorsal region."
  },
  {
    cs: "Obr\u00e1zek 11. Cubitum: Hlubok\u00e1 v\u011btev nervus radialis prob\u00edh\u00e1 mezi musculus brachioradialis a musculus brachialis v m\u00edst\u011b d\u011blen\u00ed nervu.",
    en: "Figure 11. Elbow: The deep branch of the radial nerve runs between the brachioradialis and brachialis muscles at the site of nerve division."
  },
  {
    cs: "Obr\u00e1zek 12. Proxim\u00e1ln\u00ed \u010d\u00e1st antebrachia: Hlubok\u00e1 v\u011btev nervus radialis prob\u00edh\u00e1 pod Frohseho ark\u00e1dou.",
    en: "Figure 12. Proximal forearm: The deep branch of the radial nerve passes beneath the arcade of Frohse."
  },
  {
    cs: "Obr\u00e1zek 13. Proxim\u00e1ln\u00ed \u010d\u00e1st antebrachia: Hlubok\u00e1 v\u011btev vstupuje do supin\u00e1torov\u00e9ho kan\u00e1lu a pokra\u010duje jako nervus interosseus posterior.",
    en: "Figure 13. Proximal forearm: The deep branch enters the supinator canal and continues as the posterior interosseous nerve."
  },
  {
    cs: "Obr\u00e1zek 14. Proxim\u00e1ln\u00ed \u010d\u00e1st antebrachia: Nervus interosseus posterior vystupuje ze supin\u00e1torov\u00e9ho kan\u00e1lu.",
    en: "Figure 14. Proximal forearm: The posterior interosseous nerve emerges from the supinator canal."
  },
  {
    cs: "Obr\u00e1zek 15. St\u0159edn\u00ed \u010d\u00e1st antebrachia: Nervus interosseus posterior prob\u00edh\u00e1 mezi povrchovou a hlubokou svalovou vrstvou, d\u00e1le hluboko mezi musculus abductor pollicis longus a musculus extensor pollicis longus a dosahuje membrana interossea dist\u00e1ln\u011b k z\u00e1p\u011bst\u00ed.",
    en: "Figure 15. Mid-forearm: The posterior interosseous nerve runs between the superficial and deep muscle layers, then deep between the abductor pollicis longus and extensor pollicis longus muscles, and reaches the interosseous membrane distally toward the wrist."
  },
  {
    cs: "Obr\u00e1zek 16. Carpus: Nervus interosseus posterior kon\u010d\u00ed senzitivn\u011b v dorz\u00e1ln\u00edm pouzd\u0159e z\u00e1p\u011bst\u00ed a prob\u00edh\u00e1 pod 4. dorz\u00e1ln\u00edm kompartmentem.",
    en: "Figure 16. Wrist: The posterior interosseous nerve ends with sensory fibers in the dorsal wrist capsule and passes beneath the fourth dorsal compartment."
  }
];

const radialNerveUltrasoundSections: NerveUltrasoundSection[] = radialNerveUltrasoundCaptions.map((caption, index) => {
  const imageNumber = index + 1;
  const keyNumber = index * 2 + 1;

  return {
    key: `${String(keyNumber).padStart(2, "0")}_Obrzek${keyNumber}`,
    title: {
      cs: `Obr\u00e1zek ${imageNumber}`,
      en: `Figure ${imageNumber}`
    },
    caption
  };
});

const nerveAnatomyDescriptions: Record<string, Record<string, NerveAnatomyDescription>> = {
  "nervus-medianus": {
    "2_axilla": {
      cs: "Nervus medianus leží v axille obvykle anterolaterálně nebo přímo anteriorně vůči a. axillaris.",
      en: "In the axilla, the median nerve usually lies anterolateral or directly anterior to the axillary artery."
    },
    "1_arm": {
      cs: "V proximální části paže probíhá nerv laterálně od a. brachialis. Zhruba v polovině paže tepnu kříží z laterální na mediální stranu a distálně pokračuje mediálně od a. brachialis. Nerv leží povrchněji než tepna a je uložen mezi m. biceps brachii a m. brachialis.",
      en: "In the proximal arm, the nerve runs lateral to the brachial artery. Around mid-arm it crosses the artery from lateral to medial and continues distally medial to the brachial artery. The nerve lies more superficially than the artery and sits between the biceps brachii and brachialis muscles."
    },
    "3_elbow": {
      cs: "V oblasti loketní jamky vstupuje n. medianus mezi dvě hlavy m. pronator teres. Při průchodu loktem leží na povrchu m. brachialis a mediálně od šlachy m. biceps brachii. Tato oblast je klinicky významná jako jedno z míst možné komprese nervu (syndrom m. pronator teres).",
      en: "In the cubital fossa, the median nerve enters between the two heads of the pronator teres. At the elbow it lies on the surface of the brachialis and medial to the biceps brachii tendon. This region is clinically significant as a potential site of nerve compression (pronator teres syndrome)."
    },
    "4_forearm": {
      cs: "Po průchodu mezi hlavami m. pronator teres vydává n. medianus hlubokou motorickou větev – n. interosseus anterior. Ten sestupuje po membrana interossea mezi m. flexor digitorum profundus a m. flexor pollicis longus. Hlavní kmen n. medianus pokračuje povrchněji mezi m. flexor digitorum superficialis a m. flexor digitorum profundus. Tato vztahová anatomie je ve střední třetině předloktí velmi dobře patrná při sonografii.",
      en: "After passing between the heads of the pronator teres, the median nerve gives off the deep motor branch – the anterior interosseous nerve. It descends along the interosseous membrane between the flexor digitorum profundus and flexor pollicis longus muscles. The main trunk continues more superficially between the flexor digitorum superficialis and flexor digitorum profundus. This relational anatomy is clearly visible on ultrasound in the mid-forearm."
    },
    "5_wrist": {
      cs: "Distálně n. medianus vystupuje zpod okraje m. flexor digitorum superficialis a vstupuje do karpálního tunelu. Zde probíhá pod flexor retinaculum, typicky povrchně nad šlachami flexorů prstů. V této oblasti je nerv sonograficky snadno identifikovatelný a klinicky významný jako místo komprese při syndromu karpálního tunelu.",
      en: "Distally, the median nerve emerges from beneath the edge of the flexor digitorum superficialis and enters the carpal tunnel. Here it runs under the flexor retinaculum, typically superficial to the finger flexor tendons. In this region the nerve is easily identified on ultrasound and is clinically important as the site of compression in carpal tunnel syndrome."
    }
  },
  "nervus-ulnaris": {
    "2_axilla": {
      cs: "N. ulnaris vzniká z mediálního svazku plexus brachialis. V axile leží mediálně od a. axillaris a distálně vstupuje do mediálního kompartmentu paže.",
      en: "The ulnar nerve arises from the medial cord of the brachial plexus. In the axilla it lies medial to the axillary artery and then enters the medial arm compartment."
    },
    "1_arm": {
      cs: "V proximální části paže probíhá nerv mediálně od a. brachialis. Ve střední třetině opouští přední kompartment a proniká přes septum intermusculare mediale do zadního kompartmentu, kde sestupuje k mediálnímu epikondylu.",
      en: "In the proximal arm, the nerve runs medial to the brachial artery. In the mid-arm it leaves the anterior compartment, passes through the medial intermuscular septum into the posterior compartment, and descends toward the medial epicondyle."
    },
    "3_elbow": {
      cs: "Nerv probíhá za mediálním epikondylem humeru v kubitálním tunelu pod retinakulem. Distálně vstupuje mezi dvě hlavy m. flexor carpi ulnaris. Jde o nejčastější místo komprese – syndrom kubitálního tunelu.",
      en: "The nerve passes behind the medial epicondyle in the cubital tunnel under the retinaculum. Distally it enters between the two heads of the flexor carpi ulnaris. This is the most common compression site – cubital tunnel syndrome."
    },
    "4_forearm": {
      cs: "Na předloktí sestupuje n. ulnaris mezi m. flexor carpi ulnaris a m. flexor digitorum profundus. Proximálně vydává hluboké větve pro FCU a ulnární část FDP. Ve střední a distální třetině běží společně s a. ulnaris, obvykle mediálně od ní.",
      en: "In the forearm, the ulnar nerve descends between the flexor carpi ulnaris and flexor digitorum profundus. Proximally it gives deep branches to FCU and the ulnar part of FDP. In the mid and distal forearm it runs with the ulnar artery, usually medial to it."
    },
    "5_wrist": {
      cs: "V oblasti zápěstí probíhá n. ulnaris povrchově od flexor retinaculum a vstupuje do Guyonova kanálu, kde se dělí na povrchovou senzitivní a hlubokou motorickou větev. Komprese v této oblasti vede k syndromu Guyonova kanálu.",
      en: "At the wrist, the ulnar nerve runs superficial to the flexor retinaculum and enters Guyon’s canal, where it divides into a superficial sensory and a deep motor branch. Compression here leads to Guyon’s canal syndrome."
    }
  },
  "nervus-radialis": {
    "2_axilla": {
      cs: "N. radialis vzniká ze zadního svazku plexus brachialis. V axile leží posteriorně od a. axillaris a vstupuje do zadního kompartmentu paže.",
      en: "The radial nerve arises from the posterior cord of the brachial plexus. In the axilla it lies posterior to the axillary artery and enters the posterior arm compartment."
    },
    "1_arm": {
      cs: "Nerv vstupuje do sulcus nervi radialis na humeru, kde probíhá společně s a. profunda brachii mezi hlavami m. triceps brachii. V distální části paže proráží septum intermusculare laterale a přechází do předního kompartmentu.",
      en: "The nerve enters the radial groove of the humerus, running with the profunda brachii artery between the heads of the triceps brachii. In the distal arm it pierces the lateral intermuscular septum and moves into the anterior compartment."
    },
    "3_elbow": {
      cs: "V loketní jamce probíhá nerv mezi m. brachialis a m. brachioradialis a dělí se na povrchovou senzitivní a hlubokou motorickou větev – n. interosseus posterior.",
      en: "In the cubital fossa the nerve runs between the brachialis and brachioradialis muscles and divides into a superficial sensory branch and a deep motor branch – the posterior interosseous nerve."
    },
    "4_forearm": {
      cs: "Hluboká větev vstupuje do m. supinator pod vazivovým obloukem (Arcade of Frohse), což je nejčastější místo komprese, a distálně pokračuje jako n. interosseus posterior v zadním kompartmentu. Povrchová větev pokračuje distálně pod m. brachioradialis společně s a. radialis.",
      en: "The deep branch enters the supinator under the fibrous arch (Arcade of Frohse), the most common compression site, and continues distally as the posterior interosseous nerve in the posterior compartment. The superficial branch continues distally beneath the brachioradialis with the radial artery."
    },
    "5_wrist": {
      cs: "Povrchová větev n. radialis vystupuje mezi šlachami m. brachioradialis a m. extensor carpi radialis longus, kde se stává subkutánní, a distálně se větví pro dorzum ruky. V této oblasti může dojít ke kompresi známé jako Wartenbergův syndrom.",
      en: "The superficial radial branch emerges between the tendons of the brachioradialis and extensor carpi radialis longus, becomes subcutaneous, and then branches to the dorsum of the hand. Compression here is known as Wartenberg syndrome."
    }
  }
};

const motorInnervationByNerve: Record<string, { cs: string[]; en: string[] }> = {
  "nervus-medianus": {
    cs: [
      "Předloktí: m. pronator teres, m. flexor carpi radialis, m. palmaris longus, m. flexor digitorum superficialis.",
      "N. interosseus anterior: m. flexor pollicis longus, m. pronator quadratus, radiální polovina m. flexor digitorum profundus (prsty II–III).",
      "Ruka (thenar): m. abductor pollicis brevis, m. opponens pollicis, m. flexor pollicis brevis (caput superficiale).",
      "Ruka: mm. lumbricales I–II."
    ],
    en: [
      "Forearm: pronator teres, flexor carpi radialis, palmaris longus, flexor digitorum superficialis.",
      "Anterior interosseous nerve: flexor pollicis longus, pronator quadratus, radial half of flexor digitorum profundus (digits II–III).",
      "Hand (thenar): abductor pollicis brevis, opponens pollicis, flexor pollicis brevis (superficial head).",
      "Hand: lumbricals I–II."
    ]
  },
  "nervus-ulnaris": {
    cs: [
      "Předloktí: m. flexor carpi ulnaris, ulnární polovina m. flexor digitorum profundus (prsty IV–V).",
      "Ruka (hypothenar): m. abductor digiti minimi, m. flexor digiti minimi brevis, m. opponens digiti minimi, m. palmaris brevis.",
      "Ruka: mm. interossei palmares et dorsales, mm. lumbricales III–IV.",
      "Ruka: m. adductor pollicis, hluboká hlava m. flexor pollicis brevis."
    ],
    en: [
      "Forearm: flexor carpi ulnaris, ulnar half of flexor digitorum profundus (digits IV–V).",
      "Hand (hypothenar): abductor digiti minimi, flexor digiti minimi brevis, opponens digiti minimi, palmaris brevis.",
      "Hand: palmar and dorsal interossei, lumbricals III–IV.",
      "Hand: adductor pollicis, deep head of flexor pollicis brevis."
    ]
  },
  "nervus-radialis": {
    cs: [
      "Paže: m. triceps brachii, m. anconeus.",
      "Předloktí (n. radialis a n. interosseus posterior): m. brachioradialis, m. extensor carpi radialis longus et brevis, m. supinator.",
      "Předloktí: m. extensor digitorum, m. extensor digiti minimi, m. extensor carpi ulnaris.",
      "Předloktí: m. abductor pollicis longus, m. extensor pollicis brevis, m. extensor pollicis longus, m. extensor indicis."
    ],
    en: [
      "Arm: triceps brachii, anconeus.",
      "Forearm (radial nerve and posterior interosseous nerve): brachioradialis, extensor carpi radialis longus and brevis, supinator.",
      "Forearm: extensor digitorum, extensor digiti minimi, extensor carpi ulnaris.",
      "Forearm: abductor pollicis longus, extensor pollicis brevis, extensor pollicis longus, extensor indicis."
    ]
  },
  "nervus-femoralis": {
    cs: [
      "Kyčel a stehno: m. iliacus, m. pectineus (částečně), m. sartorius.",
      "Quadriceps femoris: m. rectus femoris, m. vastus medialis, m. vastus lateralis, m. vastus intermedius.",
      "Přidruženě: m. articularis genus."
    ],
    en: [
      "Hip and thigh: iliacus, pectineus (partial), sartorius.",
      "Quadriceps femoris: rectus femoris, vastus medialis, vastus lateralis, vastus intermedius.",
      "Associated: articularis genus."
    ]
  },
  "nervus-ischiadicus": {
    cs: [
      "Zadní skupina stehna: m. semitendinosus, m. semimembranosus, m. biceps femoris (caput longum).",
      "Ischiokrurální část m. adductor magnus.",
      "Caput breve m. biceps femoris přes n. peroneus communis."
    ],
    en: [
      "Posterior thigh: semitendinosus, semimembranosus, biceps femoris (long head).",
      "Hamstring part of adductor magnus.",
      "Short head of biceps femoris via the common peroneal division."
    ]
  },
  "nervus-tibialis": {
    cs: [
      "Bérec (zadní kompartment): m. gastrocnemius, m. soleus, m. plantaris, m. popliteus.",
      "Bérec (hluboká vrstva): m. tibialis posterior, m. flexor digitorum longus, m. flexor hallucis longus.",
      "Noha (plantární svaly přes n. plantaris medialis et lateralis): m. abductor hallucis, m. flexor digitorum brevis, m. flexor hallucis brevis, m. quadratus plantae, mm. lumbricales, mm. interossei, m. adductor hallucis, m. abductor digiti minimi, m. flexor digiti minimi brevis."
    ],
    en: [
      "Leg (posterior compartment): gastrocnemius, soleus, plantaris, popliteus.",
      "Leg (deep layer): tibialis posterior, flexor digitorum longus, flexor hallucis longus.",
      "Foot (plantar muscles via medial and lateral plantar nerves): abductor hallucis, flexor digitorum brevis, flexor hallucis brevis, quadratus plantae, lumbricals, interossei, adductor hallucis, abductor digiti minimi, flexor digiti minimi brevis."
    ]
  },
  "nervus-peroneus-communis": {
    cs: [
      "Stehno: m. biceps femoris (caput breve).",
      "Bérec (n. peroneus profundus): m. tibialis anterior, m. extensor hallucis longus, m. extensor digitorum longus, m. peroneus tertius.",
      "Bérec (n. peroneus superficialis): m. peroneus longus, m. peroneus brevis.",
      "Hřbet nohy (n. peroneus profundus): m. extensor digitorum brevis, m. extensor hallucis brevis."
    ],
    en: [
      "Thigh: biceps femoris (short head).",
      "Leg (deep peroneal nerve): tibialis anterior, extensor hallucis longus, extensor digitorum longus, fibularis tertius.",
      "Leg (superficial peroneal nerve): fibularis longus, fibularis brevis.",
      "Dorsum of foot (deep peroneal nerve): extensor digitorum brevis, extensor hallucis brevis."
    ]
  }
};

const entrapmentSitesByNerve: Record<
  string,
  {
    cs: { title: string; description: string }[];
    en: { title: string; description: string }[];
  }
> = {
  "nervus-medianus": {
    cs: [
      {
        title: "Struthersovo ligamentum",
        description: "vazivový pruh u suprakondylárního výběžku humeru, proximální útlak n. medianus."
      },
      {
        title: "Lacertus fibrosus",
        description: "aponeuróza m. biceps brachii v loketní jamce, může utlačovat nerv."
      },
      { title: "M. pronator teres", description: "průchod mezi dvěma hlavami, typické místo pronator syndromu." },
      {
        title: "Arcade of FDS",
        description: "vazivový oblouk m. flexor digitorum superficialis mezi mediálním epikondylem a radiem."
      },
      {
        title: "Gantzerův sval",
        description: "akcesorní hlava m. flexor pollicis longus, může utlačit n. interosseus anterior."
      },
      {
        title: "AINS (Kiloh‑Nevin)",
        description: "neuropatie n. interosseus anterior se slabostí flexe palce a ukazováku."
      },
      { title: "Karpální tunel", description: "průběh pod flexor retinaculum, nejčastější distální útlak." }
    ],
    en: [
      {
        title: "Struthers ligament",
        description: "fibrous band near a supracondylar process, proximal median nerve compression."
      },
      {
        title: "Lacertus fibrosus",
        description: "biceps aponeurosis in the cubital fossa, can compress the nerve."
      },
      { title: "Pronator teres", description: "passage between two heads, classic site of pronator syndrome." },
      {
        title: "FDS arcade",
        description: "fibrous arch of flexor digitorum superficialis between the medial epicondyle and radius."
      },
      {
        title: "Gantzer muscle",
        description: "accessory head of flexor pollicis longus, may compress the anterior interosseous nerve."
      },
      {
        title: "AINS (Kiloh‑Nevin)",
        description: "anterior interosseous neuropathy with weak thumb and index flexion."
      },
      { title: "Carpal tunnel", description: "course under the flexor retinaculum, most common distal compression." }
    ]
  },
  "nervus-ulnaris": {
    cs: [
      {
        title: "Mediální intermusculární septum",
        description: "průchod do zadního kompartmentu paže, možnost útlaku."
      },
      {
        title: "Struthersova arkáda",
        description: "vazivový pruh mezi mediální hlavou tricepsu a septem."
      },
      {
        title: "Osbornův ligament",
        description: "strop kubitálního tunelu za mediálním epikondylem."
      },
      {
        title: "Arcade of Osborne",
        description: "fibrotický oblouk v kubitálním tunelu, časté místo komprese."
      },
      {
        title: "Mezi dvěma hlavami m. flexor carpi ulnaris",
        description: "vstup nervu do předloktí."
      },
      {
        title: "Guyonův kanál",
        description: "komprese v zápěstí s poruchou senzitivity či motoriky ruky."
      }
    ],
    en: [
      {
        title: "Medial intermuscular septum",
        description: "passage to the posterior arm compartment, possible compression."
      },
      {
        title: "Struthers arcade",
        description: "fibrous band between the medial triceps head and the septum."
      },
      { title: "Osborne ligament", description: "roof of the cubital tunnel behind the medial epicondyle." },
      {
        title: "Arcade of Osborne",
        description: "fibrotic arch within the cubital tunnel, common compression site."
      },
      {
        title: "Between the two heads of flexor carpi ulnaris",
        description: "entry into the forearm."
      },
      { title: "Guyon canal", description: "wrist compression affecting sensory or motor function." }
    ]
  },
  "nervus-radialis": {
    cs: [
      {
        title: "Sulcus nervi radialis (spirální žlábek)",
        description: "útlak při frakturách humeru či tlaku."
      },
      {
        title: "Laterální intermusculární septum",
        description: "průchod do předního kompartmentu paže."
      },
      {
        title: "Arcade of Frohse",
        description: "vazivový oblouk supinátoru, nejčastější místo útlaku hluboké větve."
      },
      {
        title: "Supinator tunnel (radial tunnel)",
        description: "komprese hluboké větve v supinátoru."
      },
      {
        title: "Fascie m. brachioradialis a m. extensor carpi radialis longus",
        description: "útlak povrchové větve, Wartenbergův syndrom."
      },
      { title: "Křížení s v. cephalica", description: "iritace/útlak při kanylace či katétru." }
    ],
    en: [
      { title: "Radial groove", description: "compression with humeral fractures or external pressure." },
      {
        title: "Lateral intermuscular septum",
        description: "passage into the anterior arm compartment."
      },
      {
        title: "Arcade of Frohse",
        description: "fibrous arch of the supinator, most common deep-branch compression site."
      },
      {
        title: "Supinator tunnel (radial tunnel)",
        description: "compression of the deep branch within the supinator."
      },
      {
        title: "Brachioradialis and ECRL fascia",
        description: "superficial branch compression, Wartenberg syndrome."
      },
      {
        title: "Crossing with the cephalic vein",
        description: "irritation/compression during cannulation or catheter placement."
      }
    ]
  }
};

const sensoryInnervationByNerve: Record<string, { cs: string[]; en: string[] }> = {
  "nervus-medianus": {
    cs: [
      "Dlaň: radiální polovina dlaně.",
      "Prsty: palmar I–III a radiální polovina IV. prstu.",
      "Hřbet prstů: distální články I–III a radiální polovina IV. prstu."
    ],
    en: [
      "Palm: radial half of the palm.",
      "Digits: palmar I–III and radial half of digit IV.",
      "Dorsal digits: distal phalanges of I–III and radial half of digit IV."
    ]
  },
  "nervus-ulnaris": {
    cs: [
      "Dlaň: ulnární část dlaně.",
      "Prsty: palmar i dorsální V. a ulnární polovina IV. prstu.",
      "Hřbet ruky: ulnární část hřbetu ruky."
    ],
    en: [
      "Palm: ulnar part of the palm.",
      "Digits: palmar and dorsal digit V and ulnar half of digit IV.",
      "Dorsum of hand: ulnar aspect of the dorsum."
    ]
  },
  "nervus-radialis": {
    cs: [
      "Paže a předloktí: dorzální/laterální část.",
      "Hřbet ruky: radiální část hřbetu ruky.",
      "Prsty: dorzální proximální části I–III a radiální polovina IV. prstu (bez bříšek)."
    ],
    en: [
      "Arm and forearm: posterior/lateral skin.",
      "Dorsum of hand: radial aspect of the dorsum.",
      "Digits: dorsal proximal parts of I–III and radial half of digit IV (not the fingertips)."
    ]
  },
  "nervus-femoralis": {
    cs: [
      "Přední strana stehna (rr. cutanei anteriores).",
      "Mediální bérec a mediální okraj nohy přes n. saphenus."
    ],
    en: [
      "Anterior thigh (anterior cutaneous branches).",
      "Medial leg and medial foot via the saphenous nerve."
    ]
  },
  "nervus-ischiadicus": {
    cs: [
      "Přímá kožní inervace není typická.",
      "Senzitivní oblast zajišťují jeho větve: n. tibialis a n. peroneus communis (bérce a nohy)."
    ],
    en: [
      "No typical direct cutaneous territory.",
      "Sensory territory is via its divisions: tibial and common peroneal nerves (leg and foot)."
    ]
  },
  "nervus-tibialis": {
    cs: [
      "Bérec: posterolaterální část přes n. suralis (spoluúčast n. peroneus communis).",
      "Pata: rr. calcanei mediales.",
      "Planta nohy: n. plantaris medialis et lateralis (většina plosky)."
    ],
    en: [
      "Leg: posterolateral skin via sural nerve (with common peroneal contribution).",
      "Heel: medial calcaneal branches.",
      "Plantar foot: medial and lateral plantar nerves (most of the sole)."
    ]
  },
  "nervus-peroneus-communis": {
    cs: [
      "Laterální bérec: n. peroneus superficialis.",
      "Dorzum nohy: n. peroneus superficialis (většina hřbetu).",
      "První meziprstní prostor: n. peroneus profundus.",
      "Laterální okraj nohy: přes n. suralis (spoluúčast n. tibialis)."
    ],
    en: [
      "Lateral leg: superficial peroneal nerve.",
      "Dorsum of foot: superficial peroneal nerve (most of dorsum).",
      "First web space: deep peroneal nerve.",
      "Lateral foot border: via sural nerve (with tibial contribution)."
    ]
  }
};

const sensoryInnervationImages: Record<string, { baseName: string; alt: { cs: string; en: string } }> = {
  "nervus-medianus": {
    baseName: "Median_senzory",
    alt: {
      cs: "Senzitivní inervace nervus medianus",
      en: "Median nerve sensory innervation"
    }
  },
  "nervus-ulnaris": {
    baseName: "Ulnar_senzory",
    alt: {
      cs: "Senzitivní inervace nervus ulnaris",
      en: "Ulnar nerve sensory innervation"
    }
  },
  "nervus-radialis": {
    baseName: "Radial_senzory",
    alt: {
      cs: "Senzitivní inervace nervus radialis",
      en: "Radial nerve sensory innervation"
    }
  }
};

const nerveAnatomyAbbreviations: Record<string, { cs: string[]; en: string[] }> = {
  "2_axilla": {
    cs: [
      "D – m. deltoideus",
      "PM – m. pectoralis major",
      "LHBB – caput longum m. biceps brachii",
      "SHBB – caput breve m. biceps brachii",
      "CB – m. coracobrachialis",
      "mc – n. musculocutaneus",
      "M – n. medianus",
      "U – n. ulnaris",
      "R – n. radialis",
      "Tmaj – m. teres major",
      "TLa – caput laterale m. triceps brachii",
      "TLo – caput longum m. triceps brachii",
      "H – humerus"
    ],
    en: [
      "D – deltoid muscle",
      "PM – pectoralis major",
      "LHBB – long head of the biceps brachii",
      "SHBB – short head of the biceps brachii",
      "CB – coracobrachialis muscle",
      "mc – musculocutaneous nerve",
      "M – median nerve",
      "U – ulnar nerve",
      "R – radial nerve",
      "Tmaj – teres major muscle",
      "TLa – lateral head of the triceps brachii",
      "TLo – long head of the triceps brachii",
      "H – humerus"
    ]
  },
  "1_arm": {
    cs: [
      "B – m. biceps brachii",
      "Br – m. brachialis",
      "CB – m. coracobrachialis",
      "H – humerus",
      "TLa – caput laterale m. triceps brachii",
      "TM – caput mediale m. triceps brachii",
      "TLo – caput longum m. triceps brachii",
      "R – n. radialis",
      "M – n. medianus",
      "U – n. ulnaris"
    ],
    en: [
      "B – biceps brachii muscle",
      "Br – brachialis muscle",
      "CB – coracobrachialis muscle",
      "H – humerus",
      "TLa – lateral head of the triceps brachii",
      "TM – medial head of the triceps brachii",
      "TLo – long head of the triceps brachii",
      "R – radial nerve",
      "M – median nerve",
      "U – ulnar nerve"
    ]
  },
  "3_elbow": {
    cs: [
      "Br – m. brachioradialis",
      "ECRL – m. extensor carpi radialis longus",
      "ECRB – m. extensor carpi radialis brevis",
      "B – šlacha m. biceps brachii",
      "S – r. superficialis n. radialis",
      "P – r. profundus n. radialis (n. interosseus posterior)",
      "M – n. medianus",
      "PT – m. pronator teres",
      "U – n. ulnaris",
      "FCU – m. flexor carpi ulnaris",
      "A – m. anconeus"
    ],
    en: [
      "Br – brachioradialis muscle",
      "ECRL – extensor carpi radialis longus",
      "ECRB – extensor carpi radialis brevis",
      "B – biceps brachii tendon",
      "S – superficial branch of the radial nerve",
      "P – deep branch of the radial nerve (posterior interosseous nerve)",
      "M – median nerve",
      "PT – pronator teres muscle",
      "U – ulnar nerve",
      "FCU – flexor carpi ulnaris",
      "A – anconeus muscle"
    ]
  },
  "4_forearm": {
    cs: [
      "Br – m. brachioradialis",
      "ECRL – m. extensor carpi radialis longus",
      "ECRB – m. extensor carpi radialis brevis",
      "EDC – m. extensor digitorum communis",
      "EDM – m. extensor digiti minimi",
      "ECU – m. extensor carpi ulnaris",
      "AbPL – m. abductor pollicis longus",
      "EPB – m. extensor pollicis brevis",
      "EPL – m. extensor pollicis longus",
      "FCR – m. flexor carpi radialis",
      "PL – m. palmaris longus",
      "FDS – m. flexor digitorum superficialis",
      "FPL – m. flexor pollicis longus",
      "FDP – m. flexor digitorum profundus",
      "FCU – m. flexor carpi ulnaris",
      "M – n. medianus",
      "U (nerv) – n. ulnaris",
      "Rs – r. superficialis n. radialis",
      "Rp – r. profundus n. radialis (n. interosseus posterior)",
      "AIN – n. interosseus anterior",
      "R – radius",
      "U (kost) – ulna"
    ],
    en: [
      "Br – brachioradialis muscle",
      "ECRL – extensor carpi radialis longus",
      "ECRB – extensor carpi radialis brevis",
      "EDC – extensor digitorum communis",
      "EDM – extensor digiti minimi",
      "ECU – extensor carpi ulnaris",
      "AbPL – abductor pollicis longus",
      "EPB – extensor pollicis brevis",
      "EPL – extensor pollicis longus",
      "FCR – flexor carpi radialis",
      "PL – palmaris longus",
      "FDS – flexor digitorum superficialis",
      "FPL – flexor pollicis longus",
      "FDP – flexor digitorum profundus",
      "FCU – flexor carpi ulnaris",
      "M – median nerve",
      "U (nerve) – ulnar nerve",
      "Rs – superficial branch of the radial nerve",
      "Rp – deep branch of the radial nerve (posterior interosseous nerve)",
      "AIN – anterior interosseous nerve",
      "R – radius",
      "U (bone) – ulna"
    ]
  },
  "5_wrist": {
    cs: [
      "FCR – m. flexor carpi radialis",
      "M – n. medianus",
      "U – n. ulnaris",
      "P – os pisiforme",
      "H – os hamatum",
      "C – os capitatum",
      "S – os scaphoideum"
    ],
    en: [
      "FCR – flexor carpi radialis",
      "M – median nerve",
      "U – ulnar nerve",
      "P – pisiform",
      "H – hamate",
      "C – capitate",
      "S – scaphoid"
    ]
  }
};

const jointProtocolExtraBullets: Record<string, Record<string, string[]>> = {
  loket: {
    "01_01": [
      "Přední příčný řez loktem ukazuje distální epifýzu humeru s vrstvou kloubní chrupavky.",
      "V projekci jsou současně dobře patrné neurovaskulární struktury a okolní svalové skupiny."
    ],
    "02_02": [
      "Podélná radiální projekce zobrazuje radiohumerální skloubení, radiální jamku a přední recesus.",
      "Je vhodná pro detekci kloubní tekutiny a synovitických změn."
    ],
    "03_03": [
      "Podélná ulnární projekce zobrazuje humeroulnární skloubení, fossa coronoidea a přední synoviální recesus.",
      "Doplňuje ventrální hodnocení o ulnární část kloubu."
    ],
    "04_04": [
      "Sonda je vedena v dlouhé ose flexorově-pronátorové skupiny nad mediálním epikondylem.",
      "Klíčový pohled pro mediální epikondylitidu, úponové změny a hodnocení MCL."
    ],
    "01_05": [
      "Sonda sleduje extenzorový aparát v dlouhé ose od laterálního epikondylu.",
      "Projekce je zásadní pro diagnostiku laterální epikondylitidy a poranění CET."
    ],
    "02_06": [
      "Zadní podélná projekce přes olecranon a tricepsovou šlachu hodnotí zadní recesus.",
      "Vhodná pro výpotek, burzitidu i poranění šlachy m. triceps brachii."
    ]
  },
  zapesti: {
    "01_Obrzek1_v2": [
      "Klíčové orientační body tvoří os pisiforme (ulnárně) a os scaphoideum (radiálně).",
      "Projekce je zásadní pro kompresi nervů, tenosynovitidu a gangliové cysty."
    ],
    "02_Obrzek2": [
      "Nerv je sledován proximálně z karpálního tunelu do distálního předloktí mezi FDS a FDP.",
      "V této úrovni má typický fascikulární („voštinový“) vzor."
    ],
    "03_Obrzek3": [
      "Podélně je n. medianus patrný jako pruhovitá struktura s paralelními echogenními liniemi.",
      "Hodnotí se kontinuita a změny průběhu při vstupu do karpálního tunelu."
    ],
    "04_Obrzek4": [
      "Na úrovni distálního radia lze zobrazit všech šest extenzorových kompartmentů.",
      "Pohled je důležitý pro tenosynovitidy, subluxace a degenerativní změny šlach."
    ],
    "05_Obrzek5": [
      "Druhý extenzorový kompartment leží laterálně od Listerova hrbolku.",
      "Obsahuje ECRL a ECRB a je častým místem přetížení."
    ],
    "06_Obrzek6": [
      "První extenzorový kompartment obsahuje APL a EPB ve společné pochvě.",
      "Typická projekce pro De Quervainovu tenosynovitidu."
    ],
    "07_Obrzek7": [
      "Šestý extenzorový kompartment nad ulnou obsahuje šlachu ECU.",
      "Vhodné pro hodnocení tenosynovitidy, instability a subluxace ECU."
    ],
    "08_Obrzek8": [
      "Podélná dorzální projekce přes extenzorové šlachy a radiokarpální kloub.",
      "Umožní detekovat výpotek, zánět i poruchu kontinuity šlach."
    ]
  },
  kycel: {
    "01_Obrzek1": [
      "Povrchově je patrný m. sartorius, pod ním m. rectus femoris s centrální šlachou.",
      "Vhodné pro hodnocení myotendinózního přechodu a přetížení m. rectus femoris."
    ],
    "07_Obrzek3": [
      "Jde o mapování popisu obrázku 2 na další použitý snímek podle požadovaného posunu.",
      "Hodnotí se úpon přímé šlachy na SIAI a možné avulzní/apofyzeální léze."
    ],
    "08_Obrzek4": [
      "Šikmá ventrální projekce zobrazuje femoroacetabulární kloub a acetabulární labrum.",
      "Důležitá pro výpotek, degeneraci labra a impingement."
    ],
    "09_Obrzek5": [
      "Distálnější šikmý řez přes přední pouzdro a recesus kyčle.",
      "Vhodný pro synovitidu, výpotek a hodnocení iliofemorálního vazu."
    ],
    "10_Obrzek6": [
      "Distální laterální referenční řez přes m. vastus lateralis a kortikalis femuru.",
      "Slouží k orientaci před proximálním posunem k velkému trochanteru."
    ],
    "11_Obrzek7": [
      "Při proximálním posunu se tvar kosti mění na trojúhelníkový znak oblasti trochanteru.",
      "Pomáhá správně lokalizovat trochanterickou oblast."
    ],
    "12_Obrzek8": [
      "Šikmá laterální projekce na přední fasetu velkého trochanteru.",
      "Hodnotí šlachu m. gluteus minimus a změny typu tendinopatie."
    ],
    "13_Obrzek9": [
      "Detail trochanterické oblasti vhodný pro gluteální šlachy a okolní měkké tkáně.",
      "Užitečný při laterální bolesti kyčle."
    ],
    "02_Obrzek10": [
      "Příčný dorzální řez se „windmill sign“ pro lokalizaci n. ischiadicus.",
      "Nerv je hodnocen mezi hamstringy s dnem tvořeným m. adductor magnus."
    ],
    "03_Obrzek11": [
      "Proximálnější řez přes tuber ischiadicum a společný úpon hamstringů.",
      "Důležitý pro tendinopatii, parciální ruptury a avulzní poranění."
    ],
    "04_Obrzek12": [
      "Podélná projekce sedacího nervu s fascikulární strukturou mezi svaly zadního stehna.",
      "Vhodná pro kontinuity nervu a patologické změny."
    ],
    "05_Obrzek13": [
      "Podélný pohled na úpon hamstringů na tuber ischiadicum.",
      "Klíčový pro detekci tendinopatie, parciálních ruptur i kompletních avulzí."
    ]
  },
  koleno: {
    "01_Obrzek1": [
      "Příčný suprapatelární řez kvadricepsem nad femurem slouží jako orientační start vyšetření.",
      "Vhodný pro hodnocení svalové struktury a poranění."
    ],
    "02_Obrzek2": [
      "Podélný suprapatelární řez přes šlachu kvadricepsu a suprapatelární recesus.",
      "Klíčový pro výpotek, synoviální hypertrofii a zánětlivé změny."
    ],
    "03_Obrzek3": [
      "Příčný infrapatelární řez patelární šlachou a Hoffovým tukovým tělesem.",
      "Důležitý pro patelární tendinopatii a impingement tukového tělesa."
    ],
    "04_Obrzek4": [
      "Podélný infrapatelární řez ligamentum patellae mezi patelou a tibií.",
      "Vhodný pro parciální ruptury, entezopatii a úponové změny."
    ],
    "05_Obrzek5": [
      "Mediální frontální projekce hodnotí MCL, mediální meniskus a mediální recesus.",
      "Důležitá pro extruzi menisku a kapsulární změny."
    ],
    "06_Obrzek6": [
      "Laterální frontální projekce zobrazuje LCL od femuru k hlavičce fibuly.",
      "Klíčová pro poranění LCL a fibulárního úponu."
    ],
    "07_Obrzek7": [
      "Dorzální příčný řez se znakem „cherry on top“ pro orientaci semitendinosu.",
      "Usnadňuje navazující skenování mediálních hamstringů."
    ],
    "08_Obrzek8": [
      "Dorzální distální řez mezi SM a mediální hlavou gastrocnemia.",
      "Typická lokalizace Bakerovy cysty a tekutinových kolekcí."
    ],
    "09_Obrzek9": [
      "Dorzální laterální řez v oblasti fossa poplitea pro tibiální a společný peroneální nerv.",
      "Důležitý pro útlakové a traumatické neuropatie."
    ]
  },
  kotnik: {
    "01_Obrzek1": [
      "Podélná ventrální projekce přes EHL, přední recesus a chrupavku talu.",
      "Vhodná pro výpotek, synoviální hypertrofii i hodnocení chrupavky."
    ],
    "02_Obrzek2": [
      "Příčný ventrální řez zobrazuje TA, EHL a EDL nad klenbou talu.",
      "Klíčový pohled pro tenosynovitidy a tendinopatie extenzorů."
    ],
    "03_Obrzek3": [
      "Mediální příčný řez tarzálním tunelem se šlachami TP/FDL/FHL a neurovaskulárním svazkem.",
      "Důležitý pro syndrom tarzálního tunelu a patologie flexorových šlach."
    ],
    "04_Obrzek4": [
      "Laterální příčný řez přes ATFL mezi fibulou a talem.",
      "Zásadní pro distorze laterálního hlezna a hodnocení kontinuity vazu."
    ],
    "05_Obrzek5": [
      "Dorzální podélná projekce Achillovy šlachy nad Kagerovým tukovým tělesem.",
      "Hodnotí tendinopatii, ruptury a retrocalcaneární burzitidu."
    ],
    "06_Obrzek6": [
      "Proximálnější podélná projekce svalové skupiny triceps surae.",
      "Vhodná pro svalové ruptury, hematomy a asymetrii svalů."
    ],
    "07_Obrzek7": [
      "Dorzální příčný řez Achillovou šlachou.",
      "Pomáhá hodnotit šířku, echostrukturu i okolní měkké tkáně."
    ],
    "08_Obrzek8": [
      "Dorzální příčný pohled na svaly triceps surae.",
      "Vhodný pro myotendinózní poranění, chronickou atrofii a fibrózu."
    ]
  }
};

const probes: ProbeSection[] = [
  {
    title: { cs: "Vysokofrekvenční sonda", en: "High-frequency probe" },
    image: makeResponsiveImage("Probes", "hockey stick probe"),
    body: {
      cs: [
        "Varianta lineární sondy s velmi vysokou frekvencí.",
        "Pro detail povrchových struktur: drobné šlachy, vazy, nervy, kůže a malé klouby.",
        "Nevýhoda: velmi omezená hloubková penetrace."
      ],
      en: [
        "Linear-variant probe with very high frequency.",
        "Best for superficial detail in small tendons, ligaments, nerves, skin, and small joints.",
        "Limitation: very low depth penetration."
      ]
    }
  },
  {
    title: { cs: "Lineární sonda", en: "Linear probe" },
    image: makeResponsiveImage("Probes", "linear probe"),
    body: {
      cs: [
        "Nejčastější sonda v muskuloskeletální sonografii.",
        "Vysoké rozlišení v povrchových vrstvách: šlachy, vazy, nervy, svaly a kloubní pouzdra.",
        "Nevýhoda: slabší zobrazení hluboko uložených struktur."
      ],
      en: [
        "Most commonly used probe in MSK ultrasound.",
        "High superficial resolution for tendons, ligaments, nerves, muscles, and capsules.",
        "Limitation: weaker penetration of deep structures."
      ]
    }
  },
  {
    title: { cs: "Konvexní sonda", en: "Convex probe" },
    image: makeResponsiveImage("Probes", "konex probe"),
    body: {
      cs: [
        "Zakřivený tvar a širší zorné pole v hloubce.",
        "Vhodná pro hlubší oblasti, objemnější klouby a svalové skupiny.",
        "Nevýhoda: nižší rozlišení povrchových jemných struktur."
      ],
      en: [
        "Curved footprint and wider deep field of view.",
        "Useful for deeper regions, larger joints, and muscle groups.",
        "Limitation: lower superficial spatial resolution."
      ]
    }
  }
];

const movements: MovementSection[] = [
  {
    title: { cs: "Sliding (klouzání)", en: "Sliding" },
    image: makeResponsiveImage("Probe movements", "01_slide"),
    body: {
      cs: [
        "Posun sondy v dlouhé ose bez změny orientace a náklonu.",
        "Paprsek zůstává ve stejné rovině.",
        "Použití: trasování nervů, šlach, svalů a cév."
      ],
      en: [
        "Probe translation along the long axis without changing tilt or orientation.",
        "The beam stays in one plane.",
        "Used for continuous tracking of structures."
      ]
    }
  },
  {
    title: { cs: "Rocking (heel-toe)", en: "Rocking (heel-toe)" },
    image: makeResponsiveImage("Probe movements", "02_rock"),
    body: {
      cs: [
        "Naklánění na jednu a druhou hranu bez posunu po kůži.",
        "Mění úhel dopadu paprsku.",
        "Klíčové pro potlačení anizotropie šlach a vazů."
      ],
      en: [
        "Tilting on alternating probe edges without skin translation.",
        "Changes the incidence angle.",
        "Key for reducing tendon and ligament anisotropy."
      ]
    }
  },
  {
    title: { cs: "Sweeping (zametání)", en: "Sweeping" },
    image: makeResponsiveImage("Probe movements", "03_sweep"),
    body: {
      cs: [
        "Posun sondy v krátké ose kolmo k její dlouhé ose.",
        "Vzniká série sousedních řezů vyšetřované oblasti.",
        "Použití: systematické hledání patologií a porovnání symetrických oblastí."
      ],
      en: [
        "Short-axis probe translation perpendicular to the long axis.",
        "Creates adjacent slices through the region.",
        "Used for systematic pathology search."
      ]
    }
  },
  {
    title: { cs: "Fanning (vějířovitý pohyb)", en: "Fanning" },
    image: makeResponsiveImage("Probe movements", "04_fan"),
    body: {
      cs: [
        "Naklánění v krátké ose při zachování místa kontaktu s kůží.",
        "Mění úhel insonace ze strany na stranu.",
        "Pomáhá potlačit anizotropii a zvýraznit kontinuitu vláken."
      ],
      en: [
        "Short-axis tilting while keeping skin contact fixed.",
        "Changes insonation angle side to side.",
        "Helps reduce anisotropy."
      ]
    }
  },
  {
    title: { cs: "Komprese", en: "Compression" },
    image: makeResponsiveImage("Probe movements", "05_compression"),
    body: {
      cs: [
        "Řízený tlak sondou v ose Z kolmo do hloubky.",
        "Hodnocení kompresibility a odlišení tekutinových a solidních útvarů.",
        "Užitečné u burzitid, hematomů, cyst a ruptur šlach."
      ],
      en: [
        "Controlled pressure in the Z-axis.",
        "Assesses compressibility and differentiates fluid from solid findings.",
        "Useful for bursitis, hematomas, cysts, and tendon tears."
      ]
    }
  },
  {
    title: { cs: "Dekomprese", en: "Decompression" },
    image: makeResponsiveImage("Probe movements", "06_decompression"),
    body: {
      cs: [
        "Uvolnění tlaku sondy v ose Z.",
        "Důležité při hodnocení cév a Doppleru (prevence kolapsu cév).",
        "Zlepšuje detekci tekutinových kolekcí."
      ],
      en: [
        "Releasing pressure in the Z-axis.",
        "Important for vascular and Doppler assessment.",
        "Improves fluid collection detection."
      ]
    }
  },
  {
    title: { cs: "Rotace (helikoptéra)", en: "Rotation (helicopter)" },
    image: makeResponsiveImage("Probe movements", "07_helicopter"),
    body: {
      cs: [
        "Otáčení sondy kolem středu bez posunu po kůži.",
        "Plynulá změna roviny zobrazení (příčná/podélná).",
        "Sledovaná struktura zůstává ve středu obrazu."
      ],
      en: [
        "Probe rotation around its center without skin translation.",
        "Switches between transverse and longitudinal planes.",
        "Keeps the target structure centered."
      ]
    }
  },
  {
    title: { cs: "Wiper (stěrače, kružítko)", en: "Wiper" },
    image: makeResponsiveImage("Probe movements", "08_wiper"),
    body: {
      cs: [
        "Jedna hrana sondy je fixovaná, druhá opisuje oblouk.",
        "Mění úhel insonace při zachování orientačního bodu.",
        "Vhodné pro oblasti s komplexní anatomií."
      ],
      en: [
        "One probe edge stays fixed while the other moves in an arc.",
        "Changes insonation angle while preserving orientation.",
        "Useful in complex anatomy."
      ]
    }
  }
];

const knobologyItems: KnobologySection[] = [
  {
    key: "Power",
    title: { cs: "POWER", en: "POWER" },
    body: {
      cs: "Zapnutí, vypnutí nebo stand-by režim přístroje.",
      en: "Turns the system on/off or enters standby mode."
    }
  },
  {
    key: "Freeze",
    title: { cs: "FREEZE", en: "FREEZE" },
    body: {
      cs: "Zmrazí živý obraz pro analýzu, měření a dokumentaci.",
      en: "Freezes live image for analysis, measurements, and documentation."
    }
  },
  {
    key: "Probes",
    title: { cs: "PROBES", en: "PROBES" },
    body: {
      cs: "Výběr a přepínání mezi připojenými sondami.",
      en: "Selects and switches connected probes."
    }
  },
  {
    key: "Store",
    title: { cs: "STORE", en: "STORE" },
    body: {
      cs: "Uloží aktuální zmrazený obraz do paměti přístroje.",
      en: "Saves the current frozen image to system memory."
    }
  },
  {
    key: "Print",
    title: { cs: "PRINT", en: "PRINT" },
    body: {
      cs: "Okamžitý tisk snímku nebo celé obrazovky.",
      en: "Prints the current image or entire screen."
    }
  },
  {
    key: "Clip",
    title: { cs: "CLIP", en: "CLIP" },
    body: {
      cs: "Záznam krátké dynamické sekvence z živého obrazu.",
      en: "Records a short dynamic clip from live imaging."
    }
  },
  {
    key: "Gain",
    title: { cs: "GAIN", en: "GAIN" },
    body: {
      cs: "Nastavení celkového zesílení signálu (jas a kontrast).",
      en: "Adjusts overall signal amplification (brightness and contrast)."
    }
  },
  {
    key: "Focus",
    title: { cs: "FOCUS", en: "FOCUS" },
    body: {
      cs: "Nastavení ohniska do požadované hloubky.",
      en: "Sets the focal zone at the desired depth."
    }
  },
  {
    key: "Frequency",
    title: { cs: "FREQUENCY", en: "FREQUENCY" },
    body: {
      cs: "Volba frekvence: vyšší detail vs. větší hloubkový dosah.",
      en: "Frequency choice: higher detail vs deeper penetration."
    }
  },
  {
    key: "Measure",
    title: { cs: "MEASURE", en: "MEASURE" },
    body: {
      cs: "Měření vzdáleností, ploch a úhlů na zmrazeném obraze.",
      en: "Measures distances, areas, and angles on frozen image."
    }
  },
  {
    key: "Pictogram",
    title: { cs: "PICTOGRAMS", en: "PICTOGRAMS" },
    body: {
      cs: "Vkládání schématických piktogramů vyšetřované oblasti.",
      en: "Adds body/region pictograms to documentation."
    }
  },
  {
    key: "Depth",
    title: { cs: "DEPTH", en: "DEPTH" },
    body: {
      cs: "Nastavení hloubky zobrazeného pole.",
      en: "Adjusts the imaging depth."
    }
  },
  {
    key: "Zoom",
    title: { cs: "ZOOM", en: "ZOOM" },
    body: {
      cs: "Zvětšení vybrané části obrazu pro detailní posouzení.",
      en: "Magnifies selected image region for detailed assessment."
    }
  },
  {
    key: "Single screen",
    title: { cs: "SINGLE SCREEN", en: "SINGLE SCREEN" },
    body: {
      cs: "Zobrazení jednoho obrazu přes celou obrazovku.",
      en: "Shows one image on the full screen."
    }
  },
  {
    key: "Double screen",
    title: { cs: "DOUBLE SCREEN", en: "DOUBLE SCREEN" },
    body: {
      cs: "Rozdělení obrazovky na dvě zobrazovací pole.",
      en: "Splits the screen into two display panes."
    }
  },
  {
    key: "PD",
    title: { cs: "POWER DOPPLER", en: "POWER DOPPLER" },
    body: {
      cs: "Citlivé zobrazení intenzity průtoku bez informace o směru.",
      en: "Sensitive display of flow intensity without direction information."
    }
  },
  {
    key: "CD",
    title: { cs: "COLOUR DOPPLER", en: "COLOUR DOPPLER" },
    body: {
      cs: "Barevné zobrazení směru a rychlosti krevního toku.",
      en: "Color display of blood flow direction and velocity."
    }
  },
  {
    key: "SWE",
    title: { cs: "SHEAR WAVE ELASTOGRAPHY", en: "SHEAR WAVE ELASTOGRAPHY" },
    body: {
      cs: "Kvantitativní hodnocení tuhosti tkání pomocí smykových vln.",
      en: "Quantitative tissue stiffness assessment using shear waves."
    }
  },
  {
    key: "ABC",
    title: { cs: "ABC", en: "ABC" },
    body: {
      cs: "Vkládání textových poznámek přímo do obrazu.",
      en: "Inserts text annotations directly into the image."
    }
  }
];

const shoulderUltrasoundImages: ShoulderUltrasoundImage[] = [
  {
    key: "01_anterior_view_transverse_plane",
    title: { cs: "Predni pohled - transversalni rovina", en: "Anterior view - transverse plane" },
    caption: {
      cs: {
        heading: "Obrázek 1. Ventrální pohled, transverzální rovina",
        bullets: [
          "b: šlacha dlouhé hlavy bicepsu, TM: tuberculum majus, tm: tuberculum minus.",
          "TM a tm jsou hlavní palpační orientační body; mezi nimi je šlacha dlouhé hlavy bicepsu v intertuberkulárním (bicipitálním) sulku.",
          "Při zvýšeném množství tekutiny je nutné odlišit fyziologické množství od synovitidy či jiné patologie.",
          "Viditelná je i šlacha m. subscapularis a povrchová vrstva m. deltoideus jako orientační body přední části ramene."
        ]
      },
      en: { heading: "Obrázek 1. Ventrální pohled, transverzální rovina", bullets: [] }
    }
  },
  {
    key: "02_anterior_view_transverse_plane_2",
    title: { cs: "Predni pohled - transversalni rovina 2", en: "Anterior view - transverse plane 2" },
    caption: {
      cs: {
        heading: "Obrázek 2. Ventrální pohled, transverzální rovina",
        bullets: [
          "LHBB: dlouhá hlava bicepsu, SHBB: krátká hlava bicepsu.",
          "Distální posun sondy podél přední strany paže umožňuje zhodnocení svalového bříška m. biceps brachii (caput breve i caput longum).",
          "Projekce je vhodná pro posouzení struktury a symetrie svalového bříška a detekci ruptur, hematomů či atrofie."
        ]
      },
      en: { heading: "Obrázek 2. Ventrální pohled, transverzální rovina", bullets: [] }
    }
  },
  {
    key: "03_anterior_view_longitudinal_plane",
    title: { cs: "Predni pohled - longitudinalni rovina", en: "Anterior view - longitudinal plane" },
    caption: {
      cs: {
        heading: "Obrázek 3. Ventrální pohled, sagitální rovina",
        bullets: [
          "b: šlacha dlouhé hlavy bicepsu.",
          "Přední úsek ramene v podélné rovině po natočení sondy o 90°; LHBB probíhá v intertuberkulárním (bicipitálním) sulku.",
          "Šlacha má lineární fibrilární („špagetovitý“) vzor odpovídající zdravé a neporušené šlaše.",
          "Projekce je vhodná pro hodnocení kontinuity a integrity šlachy a detekci tekutiny, tenosynovitidy nebo parciálních ruptur."
        ]
      },
      en: { heading: "Obrázek 3. Ventrální pohled, sagitální rovina", bullets: [] }
    }
  },
  {
    key: "04_anterior_view_longitudinal_plane_2",
    title: { cs: "Predni pohled - longitudinalni rovina 2", en: "Anterior view - longitudinal plane 2" },
    caption: {
      cs: {
        heading: "Obrázek 4. Ventrální pohled, sagitální rovina",
        bullets: [
          "LHBB: myotendinózní junkce dlouhé hlavy bicepsu brachii.",
          "Sonda je umístěna distálněji na přední straně paže pro zobrazení myotendinózního přechodu, častého místa poranění.",
          "Šlacha přechází z jasné fibrilární struktury do hypoechogenní svalové tkáně.",
          "Oblast je významná pro identifikaci parciálních ruptur, tendinopatie nebo svalového přepětí."
        ]
      },
      en: { heading: "Obrázek 4. Ventrální pohled, sagitální rovina", bullets: [] }
    }
  },
  {
    key: "05_lateral_view_transverse_plane",
    title: { cs: "Lateralni pohled - transversalni rovina", en: "Lateral view - transverse plane" },
    caption: {
      cs: {
        heading: "Obrázek 5. Laterální pohled, transverzální rovina",
        bullets: [
          "Krátká osa šlachy rotátorové manžety („obraz pneumatiky“).",
          "Integrita šlachy se hodnotí mírným tlakem sondou: zdravá šlacha odolává kompresi a zachovává zaoblený tvar.",
          "Ruptura je měkká a snadno kompresibilní („vyfouklá pneumatika“).",
          "Je nutné zobrazit šlachu v celém průběhu, protože ruptury nebo kalcifikace mohou být fokální."
        ]
      },
      en: { heading: "Obrázek 5. Laterální pohled, transverzální rovina", bullets: [] }
    }
  },
  {
    key: "06_lateral_view_longitudinal_plane",
    title: { cs: "Lateralni pohled - longitudinalni rovina", en: "Lateral view - longitudinal plane" },
    caption: {
      cs: {
        heading: "Obrázek 6. Laterální pohled, frontální rovina",
        bullets: [
          "Akromion a velký hrbolek humeru jsou klíčové kostní orientační body.",
          "V dlouhé ose je zobrazena šlacha m. supraspinatus s tvarem „ptačího zobáku“; pro kompletní vyšetření je nutný anteroposteriorní pohyb sondy.",
          "Subakromiálně-subdeltoidní burza nad šlachou může být při zvětšení patrná (burzitida nebo jiné zánětlivé stavy).",
          "Zobrazení je zásadní pro hodnocení tendinopatie, parciálních i full-thickness ruptur a subakromiálního impingementu."
        ]
      },
      en: { heading: "Obrázek 6. Laterální pohled, frontální rovina", bullets: [] }
    }
  },
  {
    key: "07_posterior_view_transverse_plane",
    title: { cs: "Posteriorni pohled - transversalni rovina", en: "Posterior view - transverse plane" },
    caption: {
      cs: {
        heading: "Obrázek 7. Dorzální pohled, transverzální rovina",
        bullets: [
          "L: labrum glenoidale.",
          "Dorzální pohled se sondou pod hřebenem lopatky; hlavní orientační body jsou hlavice humeru a glenoid.",
          "V horní části glenoidu je trojúhelníkovitá hyperechogenní struktura odpovídající glenoidálnímu labru.",
          "Při zvýšeném množství tekutiny může být tekutina v okolí labra, detekce se zvýrazňuje při zevní rotaci."
        ]
      },
      en: { heading: "Obrázek 7. Dorzální pohled, transverzální rovina", bullets: [] }
    }
  },
  {
    key: "08_posterior_view_transverse_plane_2",
    title: { cs: "Posteriorni pohled - transversalni rovina 2", en: "Posterior view - transverse plane 2" },
    caption: {
      cs: {
        heading: "Obrázek 8. Dorzální pohled, transverzální rovina",
        bullets: [
          "Laterální posun sondy zobrazuje šlachu m. infraspinatus jako fibrilární strukturu překrývající zadní aspekt hlavice humeru.",
          "Zobrazení je důležité pro hodnocení integrity šlachy při podezření na rupturu rotátorové manžety.",
          "Při kaudálním posunu se zobrazuje šlacha m. teres minor uložená pod šlachou m. infraspinatus.",
          "Správná identifikace obou struktur je nutná pro odlišení izolovaných šlachových lézí od kombinované patologie."
        ]
      },
      en: { heading: "Obrázek 8. Dorzální pohled, transverzální rovina", bullets: [] }
    }
  }
];

const shoulderSwipeCompareImages = shoulderUltrasoundImages.map((item, index) => {
  return {
    key: item.key,
    baseImage: makeResponsiveImage("shoulder", `${item.key}_basic`),
    overlayImage: makeResponsiveImage("shoulder", item.key)
  };
});

const shoulderProtocolCopyOverrides: Record<string, { heading: string; legend: string; description: string }> = {
  "01_anterior_view_transverse_plane": {
    heading: "Obrázek 1. Ventrální pohled, transverzální rovina",
    legend: "b: šlacha dlouhé hlavy bicepsu, TM: tuberculum majus, tm: tuberculum minus.",
    description:
      "TM a tm jsou hlavní orientační body. Mezi nimi je LHBB v bicipitálním sulku, kde se často zachytí tekutina. Hodnoťte i šlachu m. subscapularis, m. deltoideus a množství tekutiny (fyziologické vs. synovitida)."
  },
  "02_anterior_view_transverse_plane_2": {
    heading: "Obrázek 2. Ventrální pohled, transverzální rovina",
    legend: "LHBB: dlouhá hlava bicepsu, SHBB: krátká hlava bicepsu.",
    description:
      "Distální posun sondy hodnotí svalové bříško m. biceps brachii (caput longum i breve). Projekce je vhodná pro posouzení symetrie, ruptur, hematomu a atrofie."
  },
  "03_anterior_view_longitudinal_plane": {
    heading: "Obrázek 3. Ventrální pohled, sagitální rovina",
    legend: "b: šlacha dlouhé hlavy bicepsu.",
    description:
      "Podélný řez (otočení sondy o 90°) ukazuje LHBB v bicipitálním sulku. Zdravá šlacha má lineární fibrilární vzhled; projekce je vhodná pro posouzení kontinuity, tenosynovitidy, tekutiny a parciálních ruptur."
  },
  "04_anterior_view_longitudinal_plane_2": {
    heading: "Obrázek 4. Ventrální pohled, sagitální rovina",
    legend: "LHBB: myotendinózní junkce dlouhé hlavy bicepsu brachii.",
    description:
      "Distálnější poloha sondy zobrazuje myotendinózní přechod, časté místo poranění. Sledujte přechod fibrilární šlachy do hypoechogenní svaloviny a známky tendinopatie, parciální ruptury nebo přetížení."
  },
  "05_lateral_view_transverse_plane": {
    heading: "Obrázek 5. Laterální pohled, transverzální rovina",
    legend: "Krátká osa šlachy rotátorové manžety („obraz pneumatiky“).",
    description:
      "Mírným tlakem hodnotíme integritu: zdravá šlacha je pevná, ruptura je měkká a kompresibilní („vyfouklá pneumatika“). Šlachu vždy sledujte v celé délce kvůli fokálním lézím a kalcifikacím."
  },
  "06_lateral_view_longitudinal_plane": {
    heading: "Obrázek 6. Laterální pohled, frontální rovina",
    legend: "Akromion, tuberculum majus a šlacha m. supraspinatus („ptačí zobák“).",
    description:
      "Pohybujte sondou anteroposteriorně pro kompletní zobrazení supraspinatu. Sledujte i SASD burzu; projekce je klíčová pro tendinopatii, parciální/full-thickness ruptury a subakromiální impingement."
  },
  "07_posterior_view_transverse_plane": {
    heading: "Obrázek 7. Dorzální pohled, transverzální rovina",
    legend: "L: labrum glenoidale.",
    description:
      "Sonda pod hřebenem lopatky: orientační body jsou hlavice humeru a glenoid. V horní části glenoidu je patrné labrum. Tekutina kolem labra je lépe detekovatelná při zevní rotaci."
  },
  "08_posterior_view_transverse_plane_2": {
    heading: "Obrázek 8. Dorzální pohled, transverzální rovina",
    legend: "Šlacha m. infraspinatus; při kaudálním posunu i šlacha m. teres minor.",
    description:
      "Laterální posun sondy hodnotí integritu infraspinatu při podezření na rupturu manžety. Kaudální posun přidá teres minor a pomáhá odlišit izolované a kombinované léze."
  }
};

const shoulderProtocolCopyOverridesCsExtended: Record<string, { heading: string; legend: string; description: string }> = {
  ...shoulderProtocolCopyOverrides,
  "01_anterior_view_transverse_plane": {
    ...shoulderProtocolCopyOverrides["01_anterior_view_transverse_plane"],
    description:
      "TM a tm jsou hlavní orientační body přední části ramene. Mezi nimi probíhá LHBB v bicipitálním sulku, kde se při výpotku často zachytí tekutina komunikující s kloubní dutinou. V této projekci zároveň hodnotíme šlachu m. subscapularis, povrchový m. deltoideus a charakter tekutiny (fyziologické množství vs. synovitida)."
  },
  "02_anterior_view_transverse_plane_2": {
    ...shoulderProtocolCopyOverrides["02_anterior_view_transverse_plane_2"],
    description:
      "Distální posun sondy podél přední strany paže zobrazí svalové bříško m. biceps brachii s oběma hlavami (LHBB i SHBB). Projekce je vhodná pro hodnocení struktury a symetrie svaloviny a pro záchyt patologických změn, jako jsou parciální či kompletní ruptury, hematomy nebo známky atrofie."
  },
  "03_anterior_view_longitudinal_plane": {
    ...shoulderProtocolCopyOverrides["03_anterior_view_longitudinal_plane"],
    description:
      "Po otočení sondy o 90° je LHBB zobrazena v dlouhé ose v bicipitálním sulku. Intaktní šlacha má lineární fibrilární („špagetovitý“) vzhled; tato rovina je ideální pro hodnocení kontinuity, tenosynovitidy, tekutinových kolekcí a parciálních ruptur při bolesti přední části ramene."
  },
  "04_anterior_view_longitudinal_plane_2": {
    ...shoulderProtocolCopyOverrides["04_anterior_view_longitudinal_plane_2"],
    description:
      "Distálnější poloha sondy zobrazuje myotendinózní přechod dlouhé hlavy bicepsu, který bývá častým místem poranění. Sledujeme přechod fibrilární šlachy do hypoechogenní svaloviny a hodnotíme známky tendinopatie, parciální ruptury nebo přetížení, zejména po akutním traumatu."
  },
  "05_lateral_view_transverse_plane": {
    ...shoulderProtocolCopyOverrides["05_lateral_view_transverse_plane"],
    description:
      "Krátká osa šlachy rotátorové manžety umožňuje tzv. „tire sign“ s kompresí sondou. Zdravá šlacha je pevná a drží tvar, zatímco ruptura je měkká a kompresibilní („vyfouklá pneumatika“). Šlachu je nutné vyšetřit v celém průběhu, protože ruptury i kalcifikace mohou být pouze fokální."
  },
  "06_lateral_view_longitudinal_plane": {
    ...shoulderProtocolCopyOverrides["06_lateral_view_longitudinal_plane"],
    description:
      "Akromion a velký hrbolek humeru tvoří klíčové kostní orientační body. Mezi nimi je v dlouhé ose šlacha m. supraspinatus („ptačí zobák“); protože je široká přibližně 4 cm, je nutný anteroposteriorní posun sondy pro kompletní vyšetření. Hodnotíme i SASD burzu a známky tendinopatie, parciálních/full-thickness ruptur a impingementu."
  },
  "07_posterior_view_transverse_plane": {
    ...shoulderProtocolCopyOverrides["07_posterior_view_transverse_plane"],
    description:
      "Dorzální projekce se sondou pod hřebenem lopatky využívá hlavici humeru a glenoid jako základní orientační body. V horní části glenoidu je patrné labrum, které přispívá ke stabilitě ramene. Při zvýšeném množství tekutiny může být kolekce kolem labra lépe detekovatelná při zevní rotaci."
  },
  "08_posterior_view_transverse_plane_2": {
    ...shoulderProtocolCopyOverrides["08_posterior_view_transverse_plane_2"],
    description:
      "Laterálním posunem sondy sledujeme šlachu m. infraspinatus nad zadním aspektem hlavice humeru, kaudálně se zobrazí i m. teres minor. Správná identifikace obou struktur je důležitá pro rozlišení izolovaných lézí od kombinované patologie zadní části rotátorové manžety."
  }
};

const shoulderProtocolCopyOverridesEn: Record<string, { heading: string; legend: string; description: string }> = {
  "01_anterior_view_transverse_plane": {
    heading: "Figure 1. Ventral view, transverse plane",
    legend: "b: long head of biceps tendon, TM: greater tubercle, tm: lesser tubercle.",
    description:
      "TM and tm are the main anterior bony landmarks. The LHBB runs between them in the bicipital groove, a common location for detectable fluid because the tendon sheath communicates with the glenohumeral joint. In this view, also assess the subscapularis tendon, superficial deltoid layer, and fluid amount (physiologic versus synovitis)."
  },
  "02_anterior_view_transverse_plane_2": {
    heading: "Figure 2. Ventral view, transverse plane",
    legend: "LHBB: long head of biceps, SHBB: short head of biceps.",
    description:
      "A distal probe shift along the anterior arm evaluates the biceps brachii muscle belly with both heads clearly visible. This view is useful for muscle symmetry assessment and for detecting pathology such as partial or complete tears, hematoma, or atrophic change."
  },
  "03_anterior_view_longitudinal_plane": {
    heading: "Figure 3. Ventral view, sagittal plane",
    legend: "b: long head of biceps tendon.",
    description:
      "After rotating the probe by 90 degrees, the LHBB is visualized in long axis within the bicipital groove. A healthy tendon has a linear fibrillar appearance; this plane is ideal for continuity assessment and for detecting fluid, tenosynovitis, and partial tears in anterior shoulder pain."
  },
  "04_anterior_view_longitudinal_plane_2": {
    heading: "Figure 4. Ventral view, sagittal plane",
    legend: "LHBB: myotendinous junction of the long head of biceps brachii.",
    description:
      "With a more distal probe position, the myotendinous transition of the long head of biceps is shown, which is a frequent injury zone. Evaluate the transition from bright fibrillar tendon to hypoechoic muscle and look for tendinopathy, partial tearing, or overload, especially after acute trauma."
  },
  "05_lateral_view_transverse_plane": {
    heading: "Figure 5. Lateral view, transverse plane",
    legend: "Short-axis rotator cuff tendon image (\"tire sign\").",
    description:
      "Short-axis imaging allows integrity testing with gentle probe compression. A healthy tendon is firm and resistant to compression, while a tear appears soft and compressible (\"flat tire\"). Sweep the tendon across its full course, because tears and calcifications can be focal."
  },
  "06_lateral_view_longitudinal_plane": {
    heading: "Figure 6. Lateral view, frontal plane",
    legend: "Acromion, greater tubercle, and supraspinatus tendon (\"bird's beak\").",
    description:
      "The acromion and greater tubercle are key bony landmarks. The supraspinatus tendon is seen in long axis between them, and because it is about 4 cm wide, an anteroposterior sweep is required for full evaluation. Also assess the SASD bursa and signs of tendinopathy, partial/full-thickness tears, and subacromial impingement."
  },
  "07_posterior_view_transverse_plane": {
    heading: "Figure 7. Dorsal view, transverse plane",
    legend: "L: glenoid labrum.",
    description:
      "In the posterior projection with the probe below the scapular spine, the humeral head and glenoid serve as main landmarks. The superior glenoid labrum appears as a triangular hyperechoic structure that contributes to joint stability. Perilabral fluid is often easier to detect during external rotation."
  },
  "08_posterior_view_transverse_plane_2": {
    heading: "Figure 8. Dorsal view, transverse plane",
    legend: "Infraspinatus tendon; with caudal shift, teres minor tendon.",
    description:
      "A lateral probe shift visualizes the infraspinatus tendon over the posterior humeral head; a caudal shift brings teres minor into view. Correct identification of both structures is important to distinguish isolated lesions from combined posterior rotator cuff pathology."
  }
};

const shoulderProtocolSteps = {
  cs: [
    {
      view: "Ventrální pohled",
      planes: ["Transverzální rovina", "Sagitální rovina"]
    },
    {
      view: "Laterální pohled",
      planes: ["Transverzální rovina", "Frontální rovina"]
    },
    {
      view: "Dorzální pohled",
      planes: ["Transverzální rovina"]
    }
  ],
  en: [
    {
      view: "Ventral view",
      planes: ["Transverse plane", "Sagittal plane"]
    },
    {
      view: "Lateral view",
      planes: ["Transverse plane", "Frontal plane"]
    },
    {
      view: "Dorsal view",
      planes: ["Transverse plane"]
    }
  ]
};

const shoulderIntroPoints = {
  cs: [
    "Ultrazvuk ramene je praktická metoda pro detailní hodnocení měkkých tkání v reálném čase.",
    "Při správné technice přesně hodnotí šlachy rotátorové manžety, dlouhou hlavu bicepsu, burzy a svaly.",
    "Výhodou je okamžitá korelace obrazu s bolestí, funkční manévry a porovnání s kontralaterální stranou.",
    "Kvalitu vyšetření podporuje standardizovaná poloha pacienta a systematický postup od kostních orientačních bodů.",
    "Skenování má probíhat v podélné i příčné rovině s aktivní prací sondou (sliding, rocking, fanning) kvůli kolmé incidenci a minimalizaci anizotropie.",
    "Nedílnou součástí je dynamické vyšetření a komprese/dekomprese při hodnocení tekutinových kolekcí.",
    "Zásadní je správné nastavení přístroje (hloubka, fokus, gain), použití vysokofrekvenční lineární sondy a průběžná úprava podle oblasti."
  ],
  en: [
    "Shoulder ultrasound is a practical real-time method for detailed evaluation of soft tissues.",
    "With proper technique, it accurately assesses rotator cuff tendons, the long head of the biceps, bursae, and muscles.",
    "Key advantages are immediate pain-image correlation, dynamic maneuvers, and comparison with the contralateral side.",
    "High-quality examination requires standardized patient positioning and a systematic approach from clear bony landmarks.",
    "Scanning should be done in both longitudinal and transverse planes with active probe handling (sliding, rocking, fanning) to reduce anisotropy.",
    "Dynamic assessment and probe compression/decompression are integral when evaluating fluid collections.",
    "Correct machine settings (depth, focus, gain), a high-frequency linear probe, and continuous optimization are essential."
  ]
};

const shoulderPathologyPoints = {
  cs: [
    "Nejčastěji se nachází postižení rotátorové manžety: tendinopatie m. supraspinatus, parciální i kompletní ruptury.",
    "Časté je postižení šlachy dlouhé hlavy bicepsu včetně tenosynovitidy, subluxace a ruptury.",
    "Velmi běžným nálezem je subakromiálně-subdeltoidní burzitida, často spolu s impingement syndromem.",
    "Další nálezy zahrnují kalcifikující tendinitidu, synovitidu, kloubní výpotek a u chronických potíží degenerativní změny, entezopatie, atrofii či tukovou infiltraci svalů."
  ],
  en: [
    "Most common findings involve rotator cuff disease: supraspinatus tendinopathy and partial or full-thickness tears.",
    "Pathology of the long head of the biceps is also frequent, including tenosynovitis, subluxation, and rupture.",
    "Subacromial-subdeltoid bursitis is very common, often combined with impingement syndrome.",
    "Other findings include calcific tendinitis, synovitis, joint effusion, and in chronic cases degenerative changes, enthesopathy, muscle atrophy, or fatty infiltration."
  ]
};

const shoulderAnatomyIntro = {
  cs: "Rameno je nejpohyblivější kloubní komplex v těle. Velký rozsah pohybu zlepšuje funkci, ale zároveň snižuje stabilitu, proto je rameno častým místem poranění. Pro ultrazvuk je zásadní orientace v kostních bodech a úponech šlach.",
  en: "The shoulder is the most mobile joint complex in the body. This range of motion supports function but reduces stability, making shoulder injury common. In ultrasound, clear orientation to bony landmarks and tendon insertions is essential."
};

const shoulderAnatomyLandmarks = {
  cs: [
    "Klíční kost - přední opora, orientace pro AC a SC skloubení.",
    "Akromion - horní kostěný strop ramene.",
    "Processus coracoideus - přední orientační bod pro biceps a subscapularis.",
    "Tuberculum majus - úpon supraspinatu, infraspinatu a teres minor.",
    "Tuberculum minus - úpon subscapularis.",
    "Sulcus intertubercularis (bicipital groove) - průběh dlouhé hlavy bicepsu.",
    "Spina scapulae - zadní orientační hrana lopatky."
  ],
  en: [
    "Clavicle - anterior support and a guide for AC and SC joints.",
    "Acromion - the superior bony roof of the shoulder.",
    "Coracoid process - anterior landmark for biceps and subscapularis scanning.",
    "Greater tuberosity - insertion site of supraspinatus, infraspinatus, and teres minor.",
    "Lesser tuberosity - insertion of subscapularis.",
    "Intertubercular (bicipital) groove - pathway of the long head of the biceps.",
    "Scapular spine - posterior orientation ridge of the scapula."
  ]
};

const shoulderAnatomyMuscles = {
  cs: {
    cuff: [
      "Subscapularis - vnitřní rotace.",
      "Supraspinatus - zahájení abdukce.",
      "Infraspinatus - zevní rotace.",
      "Teres minor - zevní rotace a addukce."
    ],
    other: [
      "Deltoideus - hlavní abdukce, podíl na flexi a extenzi podle části svalu.",
      "Dlouhá hlava bicepsu - stabilizace ramene, flexe a supinace."
    ]
  },
  en: {
    cuff: [
      "Subscapularis - internal rotation.",
      "Supraspinatus - initiates abduction.",
      "Infraspinatus - external rotation.",
      "Teres minor - external rotation and adduction."
    ],
    other: [
      "Deltoid - primary abduction with anterior/posterior fibers assisting flexion and extension.",
      "Long head of biceps - shoulder stabilization with flexion and supination support."
    ]
  }
};

const shoulderAnatomyLandmarkImage = {
  fileName: "image326.gif",
  alt: {
    cs: "Landmarky ramene",
    en: "Shoulder landmarks"
  }
} as const;

const shoulderAnatomyMuscleGallery = [
  {
    fileName: "image410.gif",
    alt: { cs: "Svaly ramene 1", en: "Shoulder muscles 1" }
  },
  {
    fileName: "image411.gif",
    alt: { cs: "Svaly ramene 2", en: "Shoulder muscles 2" }
  },
  {
    fileName: "image412.gif",
    alt: { cs: "Svaly ramene 3", en: "Shoulder muscles 3" }
  }
] as const;

const elbowAnatomyIntro = {
  cs: "Loket je stabilní kloubní komplex s menším, ale velmi funkčním rozsahem pohybu. Pro ultrazvuk je zásadní orientace mezi humerem, radiem a ulnou a znalost vztahu kloubních recesů, šlach, vazů a nervů. Přesná anatomická orientace zvyšuje kvalitu vyšetření i klinickou interpretaci nálezu.",
  en: "The elbow is a relatively stable joint complex with a moderate but highly functional range of motion. In ultrasound, clear orientation among the humerus, radius, and ulna and understanding of recesses, tendons, ligaments, and nerves are essential for accurate assessment."
};

const elbowAnatomyJoints = {
  cs: [
    "Humeroulnární kloub - hlavní kladkový kloub lokte, flexe a extenze.",
    "Humeroradiální kloub - kontakt capitulum humeri a hlavičky radia, podíl na stabilitě.",
    "Proximální radioulnární kloub - čepový kloub pro pronaci a supinaci předloktí."
  ],
  en: [
    "Humeroulnar joint - primary hinge articulation responsible for flexion and extension.",
    "Humeroradial joint - capitulum-radial head articulation contributing to stability.",
    "Proximal radioulnar joint - pivot articulation enabling pronation and supination."
  ]
};

const elbowAnatomyUltrasoundFocus = {
  cs: "V ultrazvuku se nejčastěji hodnotí společný extenzorový a flexorový úpon, distální šlacha bicepsu a tricepsu, n. medianus a kloubní recesy.",
  en: "Elbow ultrasound mainly focuses on common extensor/flexor origins, distal biceps and triceps tendons, the median nerve, and joint recesses."
};

const elbowAnatomyLandmarkLead = {
  cs: "Kostní landmarky jsou základní orientační body při skenování. Pomáhají správně vést sondu a rychle rozlišit normální anatomii od patologie.",
  en: "Bony landmarks are the key orientation points during elbow scanning and improve both probe guidance and interpretation."
};

const elbowAnatomyLandmarks = {
  cs: [
    "Mediální epikondyl - orientace pro společný flexorový úpon a n. ulnaris.",
    "Laterální epikondyl - orientace pro společný extenzorový úpon.",
    "Olecranon - hlavní bod zadního přístupu, hodnocení tricepsu a burzy.",
    "Hlavička radia - orientace pro humeroradiální a proximální radioulnární skloubení."
  ],
  en: [
    "Medial epicondyle - landmark for common flexor origin and ulnar nerve region.",
    "Lateral epicondyle - landmark for common extensor origin.",
    "Olecranon - key posterior landmark for triceps tendon and olecranon bursa.",
    "Radial head - landmark for humeroradial and proximal radioulnar articulations."
  ]
};

const elbowAnatomyMuscles = {
  cs: {
    primary: [
      "Biceps brachii - flexe lokte a supinace; v UZ klíčová distální šlacha.",
      "Brachialis - hlavní flexor lokte; důležitý při přední bolesti lokte.",
      "Triceps brachii - extenze lokte; hodnocení distální šlachy a olekranové burzy.",
      "Společný flexor-pronátorový komplex - mediální strana lokte; typická oblast mediální epikondylopatie.",
      "Společný extenzor-supinátorový komplex - laterální strana lokte; typická oblast laterální epikondylopatie."
    ],
    other: [
      "Anconeus - pomocná extenze a stabilizace lokte.",
      "Supinator - supinace předloktí; význam při podezření na útlak radiálního nervu."
    ]
  },
  en: {
    primary: [
      "Biceps brachii - elbow flexion and supination; distal tendon is a key ultrasound target.",
      "Brachialis - primary elbow flexor; relevant in anterior elbow pain.",
      "Triceps brachii - elbow extension; assessment of distal tendon and olecranon bursa.",
      "Common flexor-pronator group - medial elbow, key in medial epicondylitis.",
      "Common extensor-supinator group - lateral elbow, key in lateral epicondylitis."
    ],
    other: [
      "Anconeus - assists elbow extension and contributes to stability.",
      "Supinator - forearm supination; relevant in radial nerve entrapment workup."
    ]
  }
};

const shoulderPositioningZoomCaption = {
  cs: "Obrázek 1. Polohování pacienta při vyšetření ramenního kloubu. 1: základní pozice pro vyšetření ventrálního pohledu, 2: pozice k vyšetření m. subscapularis - ventrální pohled, 3: Crass position - pozice k vyšetření rotátorové manžety - laterální pohled, 4: modified Crass position - pozice k vyšetření rotátorové manžety - laterální pohled, 5: pozice k vyšetření dorzálního pohledu.",
  en: "Figure 1. Patient positioning for shoulder ultrasound. 1. Baseline position for ventral view, 2. Position for subscapularis assessment - ventral view, 3. Crass position - rotator cuff assessment - lateral view, 4. Modified Crass position - rotator cuff assessment - lateral view, 5. Position for dorsal view."
} as const;

const renderAnatomyListItem = (item: string) => {
  const [lead, ...rest] = item.split(" - ");
  const tail = rest.join(" - ");
  return (
    <li key={item}>
      <strong>{lead}</strong>
      {tail ? ` - ${tail}` : ""}
    </li>
  );
};

const jointIntroCopy = {
  rameno: {
    cs: (
      <>
        Ultrazvuk <strong>ramenního kloubu</strong> je v PMR velmi cenný, protože umožňuje rychle propojit klinický obraz s nálezem
        při pohybu. Nejčastěji se zaměřujeme na <strong>šlachy rotátorové manžety</strong> (supraspinatus, infraspinatus, subscapularis), šlachu
        <strong>dlouhé hlavy bicepsu</strong>, <strong>subakromiálně-subdeltoidní burzu</strong> a zadní recesus glenohumerálního kloubu. Právě tyto struktury bývají
        nejčastějším zdrojem bolesti při abdukci, práci nad hlavou a při rotačních pohybech. Výhodou je dynamické vyšetření, které
        pomáhá rozlišit <strong>impingement</strong>, <strong>tendinopatii</strong>, parciální či kompletní ruptury a zánětlivé změny burzy nebo synovie.
      </>
    ),
    en: (
      <>
        Shoulder ultrasound is especially useful for assessing the <strong>rotator cuff, long head of the biceps, and SASD bursa</strong>,
        which are the main sources of pain during elevation and overhead activity. The exam should follow ventral, lateral, and dorsal
        views and include <strong>dynamic maneuvers during abduction and rotation</strong> to detect impingement, tenosynovitis,
        and partial tears.
      </>
    )
  },
  loket: {
    cs: (
      <>
        Ultrazvuk <strong>loketního kloubu</strong> je ideální pro cílené hodnocení přetěžovaných struktur v oblasti mediálního a
        laterálního epikondylu, <strong>společného flexorového a extenzorového úponu</strong>, kolaterálních vazů, distálních šlach bicepsu a
        tricepsu i průběhu n. ulnaris v kubitálním tunelu. V praxi je velmi přínosný při bolesti při úchopu, extenzi zápěstí,
        flexi lokte nebo při paresteziích v ulnární oblasti. Umožňuje odlišit epikondylopatii, parciální ruptury, synovitidu,
        kloubní výpotek, burzitidu i <strong>kompresní neuropatii</strong> a zároveň porovnat nález s druhostranným loktem.
      </>
    ),
    en: (
      <>
        In the elbow, ultrasound is most informative at the <strong>epicondyles, flexor/extensor tendon origins, collateral ligaments,
        and ulnar nerve</strong>. It is particularly useful in pain with gripping, wrist extension, or elbow flexion, helping distinguish
        tendinopathy, partial tearing, synovitis, and cubital tunnel nerve compression.
      </>
    )
  },
  zapesti: {
    cs: (
      <>
        Ultrazvuk <strong>zápěstního kloubu</strong> je velmi užitečný při bolestech po přetížení i po úrazu, protože umožňuje přesně
        zhodnotit šlachové kompartmenty, retinakula, radiokarpální oblast i karpální tunel. V klinické praxi se nejčastěji zaměřujeme
        na <strong>flexorové a extenzorové šlachy</strong>, synovii a <strong>n. medianus</strong>, zejména při podezření na tenosynovitidu, ganglion nebo syndrom
        karpálního tunelu. Výhodou je možnost <strong>dynamického vyšetření</strong> a přímé korelace nálezu s bolestí při pohybu prstů a zápěstí.
      </>
    ),
    en: (
      <>
        At the wrist, ultrasound focuses on the <strong>flexor and extensor tendons, retinacula, synovium, and carpal tunnel region</strong>.
        It is useful in both overuse and post-traumatic pain, showing tenosynovitis, ganglion cysts, small-joint synovitis, and median
        nerve changes in suspected carpal tunnel syndrome.
      </>
    )
  },
  kycel: {
    cs: (
      <>
        Ultrazvuk <strong>kyčelního kloubu</strong> má v PMR důležité místo hlavně při bolestech třísla a laterální strany kyčle, kde
        pomáhá rychle odlišit intraartikulární a periartikulární příčiny potíží. Prakticky se zaměřujeme na přední recesus s možným
        výpotkem, iliopsoas, přímý sval stehenní, <strong>adduktorový a abduktorový aparát</strong> včetně trochanterických burz. Vyšetření tak dobře
        rozlišuje <strong>synovitidu a kloubní výpotek</strong> od tendinopatií gluteálních šlach, burzitid nebo entezopatií v trochanterické oblasti.
      </>
    ),
    en: (
      <>
        For the hip, ultrasound is most useful at the <strong>anterior recess, flexor tendons, adductors, and abductor complex</strong>,
        including the trochanteric bursae. It helps separate intra-articular effusion from periarticular pain generators, especially
        in groin and lateral hip pain.
      </>
    )
  },
  koleno: {
    cs: (
      <>
        Ultrazvuk <strong>kolenního kloubu</strong> je velmi efektivní metoda pro rychlé zhodnocení přední, mediální i laterální bolesti
        kolene. Standardně hodnotíme <strong>suprapatelární recesus</strong>, kvadricepsovou a patelární šlachu, kolaterální vazy a periartikulární
        burzy, případně i podkolenní oblast s Bakerovou cystou. Přínosem je rychlá detekce výpotku a synovitidy a zároveň upřesnění,
        zda jsou potíže dány <strong>tendinopatií, entezopatií, bursitidou</strong> nebo vazivovým postižením.
      </>
    ),
    en: (
      <>
        Knee ultrasound is highly effective for evaluating the <strong>suprapatellar recess, quadriceps and patellar tendons, collateral
        ligaments, and periarticular bursae</strong>. It rapidly confirms effusion or synovitis and supports focused assessment of
        enthesopathy and tendinopathy in anterior, medial, or lateral knee pain.
      </>
    )
  },
  kotnik: {
    cs: (
      <>
        Ultrazvuk <strong>hlezenního kloubu (kotníku)</strong> je zásadní zejména po distorzích a při chronické nestabilitě, protože
        umožňuje dynamicky zhodnotit vazivové i šlachové struktury. V praxi se vyšetřuje <strong>laterální vazivový komplex (ATFL, CFL)</strong>,
        mediální deltový vaz, peroneální šlachy, tibialis posterior a přední recesus hlezna. Metoda pomáhá odlišit parciální ruptury
        vazů, tendinopatie, <strong>subluxace šlach</strong>, synovitidu i kloubní výpotek a přesněji zacílit další léčebný postup.
      </>
    ),
    en: (
      <>
        In the ankle, ultrasound is best suited for the <strong>lateral ligament complex, medial ligaments, peroneal and tibial tendons,
        and the anterior ankle recess</strong>. Dynamic scanning is especially valuable after sprain injuries to assess ligament stability,
        tendon subluxation, and associated effusion or synovitis.
      </>
    )
  }
} as const;

const jointIntroImageBySlug = {
  rameno: { fileName: "01_Shoulder.png", alt: { cs: "Anatomie ramene", en: "Shoulder anatomy" } },
  loket: { fileName: "02_Elbow.png", alt: { cs: "Anatomie lokte", en: "Elbow anatomy" } },
  zapesti: { fileName: "03_Wrist.png", alt: { cs: "Anatomie zápěstí", en: "Wrist anatomy" } },
  kycel: { fileName: "04_Hip.png", alt: { cs: "Anatomie kyčle", en: "Hip anatomy" } },
  koleno: { fileName: "05_Knee.png", alt: { cs: "Anatomie kolene", en: "Knee anatomy" } },
  kotnik: { fileName: "06_Ankle.png", alt: { cs: "Anatomie kotníku", en: "Ankle anatomy" } }
} as const;

function ResponsiveImage({
  image,
  alt,
  wrapClassName,
  enableMobileZoom,
  caption
}: {
  image: ResponsiveImageSet;
  alt: string;
  wrapClassName?: string;
  enableMobileZoom?: boolean;
  caption?: string;
}) {
  const wrapClass = wrapClassName ? `${styles.inlineImageWrap} ${wrapClassName}` : styles.inlineImageWrap;
  const [isZoomed, setIsZoomed] = useState(false);

  const handleOpen = () => {
    if (!enableMobileZoom) {
      return;
    }
    setIsZoomed(true);
  };

  const handleClose = () => {
    setIsZoomed(false);
  };

  const picture = (
    <picture className={wrapClass}>
      <source media="(max-width: 640px)" srcSet={image.mobile} />
      <source media="(max-width: 1024px)" srcSet={image.tablet} />
      <img className={styles.inlineImage} src={image.pc} alt={alt} loading="lazy" decoding="async" />
    </picture>
  );

  return (
    <>
      {enableMobileZoom ? (
        <button type="button" className={styles.imageZoomButton} onClick={handleOpen} aria-label={alt}>
          {picture}
        </button>
      ) : (
        picture
      )}
      {isZoomed ? (
        <div className={styles.imageZoomOverlay} role="dialog" aria-modal="true" onClick={handleClose}>
          <div className={styles.imageZoomContent}>
            <button type="button" className={styles.imageZoomClose} onClick={handleClose} aria-label="Close">
              ×
            </button>
            <img
              className={styles.imageZoomImage}
              src={image.pc}
              alt={alt}
              loading="lazy"
              decoding="async"
              onClick={(event) => event.stopPropagation()}
            />
            {caption ? (
              <p className={styles.imageZoomCaption} onClick={(event) => event.stopPropagation()}>
                {caption}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

function ResponsivePicture({ image, alt, className }: { image: ResponsiveImageSet; alt: string; className?: string }) {
  return (
    <picture>
      <source media="(max-width: 640px)" srcSet={image.mobile} />
      <source media="(max-width: 1024px)" srcSet={image.tablet} />
      <img className={className ?? styles.inlineImage} src={image.pc} alt={alt} loading="lazy" decoding="async" draggable={false} />
    </picture>
  );
}

function SwipeCompareImage({
  baseImage,
  overlayImage,
  baseAlt,
  overlayAlt,
  ariaLabel,
  wrapClassName,
  initialPosition = 60,
  showRange = false,
  controlsClassName,
  rangeColor = "#d2be00"
}: SwipeCompareImageProps) {
  const [swipePosition, setSwipePosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const compareRef = useRef<HTMLDivElement | null>(null);

  const updateSwipePosition = (clientX: number) => {
    const container = compareRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    if (rect.width <= 0) {
      return;
    }

    const nextPosition = ((clientX - rect.left) / rect.width) * 100;
    setSwipePosition(Math.min(100, Math.max(0, nextPosition)));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    event.preventDefault();
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    updateSwipePosition(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) {
      return;
    }

    updateSwipePosition(event.clientX);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleLostPointerCapture = () => {
    setIsDragging(false);
  };

  return (
    <>
      <div
        ref={compareRef}
        className={wrapClassName ?? styles.ulnarSwipeCompareWrap}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={handleLostPointerCapture}
        aria-label={ariaLabel}
      >
        <div className={styles.ulnarSwipeImageBase}>
          <ResponsivePicture image={baseImage} alt={baseAlt} className={styles.inlineImage} />
        </div>
        <div className={styles.ulnarSwipeReveal} style={{ clipPath: `inset(0 0 0 ${swipePosition}%)` }}>
          <ResponsivePicture image={overlayImage} alt={overlayAlt} className={styles.inlineImage} />
        </div>
        <div className={styles.ulnarSwipeDivider} style={{ left: `${swipePosition}%` }}>
          <span className={styles.ulnarSwipeHandle} />
        </div>
      </div>
      {showRange ? (
        <div className={controlsClassName ?? styles.ulnarSwipeControls}>
          <input
            type="range"
            min="0"
            max="100"
            value={swipePosition}
            onChange={(event) => setSwipePosition(Number(event.target.value))}
            className={styles.ulnarSwipeRange}
            style={
              {
                "--ulnar-swipe-position": `${swipePosition}%`,
                "--ulnar-swipe-fill": rangeColor,
                "--ulnar-swipe-track": `color-mix(in srgb, ${rangeColor} 16%, white)`
              } as CSSProperties
            }
            aria-label={ariaLabel}
          />
        </div>
      ) : null}
    </>
  );
}

export default function ContentPage({ path }: ContentPageProps) {
  const { lang, t } = useLanguage();
  const node = findNavItem(path);
  const [doneByPath, setDoneByPath] = useState<Record<string, boolean>>({});
  const [activeShoulderMuscleImageIndex, setActiveShoulderMuscleImageIndex] = useState<number | null>(null);
  const [activeUlnarCompareIndex, setActiveUlnarCompareIndex] = useState(0);
  const [ulnarSwipePosition, setUlnarSwipePosition] = useState(60);
  const [isUlnarSwipeDragging, setIsUlnarSwipeDragging] = useState(false);
  const ulnarFigureTouchStartX = useRef<number | null>(null);
  const ulnarSwipeCompareRef = useRef<HTMLDivElement | null>(null);
  const normalizedPath = path.length > 1 ? path.replace(/\/+$/, "") : path;
  const jointVideoMatch = path.match(/^\/klouby\/(rameno|loket|zapesti|kycel|koleno|kotnik)\/video-tutorial$/);
  const jointVideo = jointVideoMatch ? jointVideoBySlug[jointVideoMatch[1] as keyof typeof jointVideoBySlug] : undefined;
  const isBicepsVideo = path === "/svaly/biceps-brachii/video-tutorial";
  const nerveVideoMatch = path.match(/^\/periferni-nervy\/(nervus-medianus|nervus-ulnaris|nervus-radialis)\/video-tutorial$/);
  const nerveVideo = nerveVideoMatch ? nerveVideoBySlug[nerveVideoMatch[1] as keyof typeof nerveVideoBySlug] : undefined;
  const nerveIntroMatch = path.match(
    /^\/periferni-nervy\/(nervus-medianus|nervus-ulnaris|nervus-radialis|nervus-femoralis|nervus-ischiadicus|nervus-tibialis|nervus-peroneus-communis)\/uvod$/
  );
  const nervePositioningMatch = path.match(
    /^\/periferni-nervy\/(nervus-medianus|nervus-ulnaris|nervus-radialis|nervus-femoralis|nervus-ischiadicus|nervus-tibialis|nervus-peroneus-communis)\/polohovani$/
  );
  const nerveAnatomyMatch = path.match(
    /^\/periferni-nervy\/(nervus-medianus|nervus-ulnaris|nervus-radialis)\/anatomicky-prubeh$/
  );
  const nerveUltrasoundMatch = normalizedPath.match(
    /^\/periferni-nervy\/(nervus-medianus|nervus-ulnaris|nervus-radialis|nervus-femoralis|nervus-ischiadicus|nervus-tibialis|nervus-peroneus-communis)\/ultrazvukove-vysetreni$/
  );
  const entrapmentSitesMatch = path.match(
    /^\/periferni-nervy\/(nervus-medianus|nervus-ulnaris|nervus-radialis)\/mista-utlaku$/
  );
  const motorInnervationMatch = path.match(
    /^\/periferni-nervy\/(nervus-medianus|nervus-ulnaris|nervus-radialis|nervus-femoralis|nervus-ischiadicus|nervus-tibialis|nervus-peroneus-communis)\/motoricka-inervace$/
  );
  const sensoryInnervationMatch = path.match(
    /^\/periferni-nervy\/(nervus-medianus|nervus-ulnaris|nervus-radialis|nervus-femoralis|nervus-ischiadicus|nervus-tibialis|nervus-peroneus-communis)\/senzitivni-inervace$/
  );
  const nerveIntroKey = nerveIntroMatch?.[1];
  const nerveIntroContent = nerveIntroKey ? nerveIntroBySlug[nerveIntroKey] : undefined;
  const nerveKey = nerveAnatomyMatch?.[1];
  const nerveAnatomyCopy = nerveKey ? nerveAnatomyDescriptions[nerveKey] : undefined;
  const nerveUltrasoundKey = nerveUltrasoundMatch?.[1];
  const nerveUltrasoundContent =
    nerveUltrasoundKey === "nervus-radialis"
      ? radialNerveUltrasoundContent
      : nerveUltrasoundKey
        ? nerveUltrasoundByNerve[nerveUltrasoundKey]
        : undefined;
  const resolvedNerveUltrasoundContent =
    nerveUltrasoundKey === "nervus-ulnaris" && nerveUltrasoundContent
      ? {
          ...nerveUltrasoundContent,
          folder: "Nerves/Ulnar nerve",
          sections: ulnarNerveUltrasoundSections,
          swipeCompareImages: ulnarNerveSwipeCompareImages
        }
      : nerveUltrasoundKey === "nervus-radialis" && nerveUltrasoundContent
        ? {
            ...nerveUltrasoundContent,
            folder: "Nerves/Radial nerve",
            sections: radialNerveUltrasoundSections,
            swipeCompareImages: radialNerveSwipeCompareImages
          }
      : nerveUltrasoundContent;
  const ulnarInteractiveSections: NerveUltrasoundInteractiveSection[] =
    nerveUltrasoundKey === "nervus-ulnaris"
      ? [
          {
            title: { cs: "Obrázek 1", en: "Figure 1" },
            caption: { cs: "Obrázek 1. Listování mezi obrázkem 2 a 3.", en: "Figure 1. Swipe-through between figure 2 and 3." }
          },
          {
            title: { cs: "Obrázek 2", en: "Figure 2" },
            caption: {
              cs: "Obrázek 2. Porovnání obrázku 2 a 3 posunutím prstu po dělící linii.",
              en: "Figure 2. Comparison of figure 2 and 3 by dragging along the divider."
            }
          }
        ]
      : [];
  const ulnarSwipeImages =
    nerveUltrasoundKey === "nervus-ulnaris"
      ? [makeResponsiveImagePhone("Ulnar nerve", "UN2"), makeResponsiveImagePhone("Ulnar nerve", "UN3")]
      : [];
  const entrapmentSitesKey = entrapmentSitesMatch?.[1];
  const entrapmentSites = entrapmentSitesKey ? entrapmentSitesByNerve[entrapmentSitesKey] : undefined;
  const motorInnervationKey = motorInnervationMatch?.[1];
  const motorInnervation = motorInnervationKey ? motorInnervationByNerve[motorInnervationKey] : undefined;
  const sensoryInnervationKey = sensoryInnervationMatch?.[1];
  const sensoryInnervation = sensoryInnervationKey ? sensoryInnervationByNerve[sensoryInnervationKey] : undefined;
  const sensoryInnervationImage = sensoryInnervationKey ? sensoryInnervationImages[sensoryInnervationKey] : undefined;
  const isShoulderUltrasoundPage = normalizedPath === "/klouby/rameno/vysetrovaci-protokol";
  const isShoulderIntroPage = normalizedPath === "/klouby/rameno/uvod";
  const isShoulderAnatomyPage = normalizedPath === "/klouby/rameno/anatomie";
  const isElbowAnatomyPage = normalizedPath === "/klouby/loket/anatomie";
  const jointPositioningMatch = normalizedPath.match(/^\/klouby\/(rameno|loket|zapesti|kycel|koleno|kotnik)\/polohovani$/);
  const jointIntroMatch = normalizedPath.match(/^\/klouby\/(rameno|loket|zapesti|kycel|koleno|kotnik)\/uvod$/);
  const jointProtocolMatch = normalizedPath.match(/^\/klouby\/(loket|zapesti|kycel|koleno|kotnik)\/vysetrovaci-protokol$/);
  const jointPositioningKey = jointPositioningMatch?.[1];
  const jointPositioning = jointPositioningKey ? jointPositioningBySlug[jointPositioningKey] : undefined;
  const jointKey = jointProtocolMatch?.[1] ?? jointIntroMatch?.[1];
  const jointContent = jointKey ? jointContentBySlug[jointKey] : undefined;
  const jointIntroKey = jointIntroMatch?.[1] as keyof typeof jointIntroImageBySlug | undefined;
  const jointIntroImage = jointIntroKey ? jointIntroImageBySlug[jointIntroKey] : undefined;
  const jointIntroContent = jointIntroKey ? jointIntroCopy[jointIntroKey] : undefined;
  const isProbesPage = path === "/basics/ultrazvukove-sondy/typy-sond";
  const isProbeMovementsPage = path === "/basics/ultrazvukove-sondy/pohyby-sondou";
  const isProbeGripPage = path === "/basics/ultrazvukove-sondy/drzeni-sondy";
  const isKnobologyPage = path === "/basics/knobologie";
  const isUltrasoundBasicsPage = path === "/basics/fyzikalni-principy/ultrazvuk";
  const isSoundWavePage = path === "/basics/fyzikalni-principy/zvukova-vlna";
  const isSpeedOfSoundPage = path === "/basics/fyzikalni-principy/rychlost-zvuku";
  const isAcousticImpedancePage = path === "/basics/fyzikalni-principy/akusticka-impedance";
  const isReflectionPage = path === "/basics/fyzikalni-principy/odraz";
  const isRefractionPage = path === "/basics/fyzikalni-principy/lom";
  const isEchogenicityPage = path === "/basics/ultrazvukovy-obraz/echogenita";
  const activeShoulderMuscleImage =
    activeShoulderMuscleImageIndex !== null ? shoulderAnatomyMuscleGallery[activeShoulderMuscleImageIndex] : null;

  const handleUlnarFigureTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    ulnarFigureTouchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleUlnarFigureTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = ulnarFigureTouchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    ulnarFigureTouchStartX.current = null;

    if (startX === null || endX === undefined) {
      return;
    }

    const deltaX = endX - startX;
    if (Math.abs(deltaX) < 40) {
      return;
    }

    setActiveUlnarCompareIndex(deltaX < 0 ? 1 : 0);
  };

  const updateUlnarSwipePosition = (clientX: number) => {
    const container = ulnarSwipeCompareRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    if (rect.width <= 0) {
      return;
    }

    const nextPosition = ((clientX - rect.left) / rect.width) * 100;
    setUlnarSwipePosition(Math.min(100, Math.max(0, nextPosition)));
  };

  const handleUlnarSwipePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    event.preventDefault();
    setIsUlnarSwipeDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    updateUlnarSwipePosition(event.clientX);
  };

  const handleUlnarSwipePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isUlnarSwipeDragging) {
      return;
    }

    updateUlnarSwipePosition(event.clientX);
  };

  const handleUlnarSwipePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsUlnarSwipeDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleUlnarSwipeLostPointerCapture = () => {
    setIsUlnarSwipeDragging(false);
  };

  useEffect(() => {
    const syncProgress = () => setDoneByPath(readProgress());
    syncProgress();

    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === PROGRESS_STORAGE_KEY) {
        syncProgress();
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(PROGRESS_UPDATED_EVENT, syncProgress);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(PROGRESS_UPDATED_EVENT, syncProgress);
    };
  }, []);

  if (!node) {
    return <ContentPlaceholder title={t("pageNotFound")} />;
  }

  const { previous, next, parent } = getSiblingNavigation(path);
  const parentFromPath = useMemo(() => {
    const segments = path.split("/").filter(Boolean);
    if (segments.length <= 1) {
      return undefined;
    }
    const parentPath = `/${segments.slice(0, -1).join("/")}`;
    return findNavItem(parentPath);
  }, [path]);
  const progressParent = parent ?? parentFromPath;
  const progressPercent = useMemo(() => {
    if (!progressParent?.children?.length) {
      return null;
    }
    const total = progressParent.children.length;
    const done = progressParent.children.filter((item) => Boolean(doneByPath[item.path])).length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [progressParent, doneByPath]);
  const progressBar =
    progressPercent === null ? null : (
      <div
        className={styles.sectionProgressRow}
        aria-label={`${progressPercent}%`}
        style={{ "--section-progress-color": node.color } as CSSProperties}
      >
        <div className={styles.sectionProgressTrack}>
          <div className={styles.sectionProgressFill} style={{ width: `${progressPercent}%` }} />
        </div>
        <strong className={styles.sectionProgressPercent}>{progressPercent}%</strong>
      </div>
    );
  const markCurrentDone = () => {
    const current = readProgress();
    if (!current[path]) {
      writeProgress({ ...current, [path]: true });
    }
  };
  const previousTarget = previous ?? parent;
  const nextTarget = next ?? parent;
  const previousLabel = previous ? t("previousChapter") : t("upLevel");
  const nextLabel = next ? t("nextChapter") : t("upLevel");
  const chapterNav = (
    <nav className={styles.chapterNav} aria-label={t("chapterNavAria")}>
      {previousTarget ? (
        <Link to={previousTarget.path} className={`${styles.chapterLink} ${styles.chapterPrev}`} onClick={markCurrentDone}>
          <span className={styles.chapterArrow} aria-hidden="true">
            ‹
          </span>
          <span className={styles.chapterText}>
            <span className={styles.chapterLabel}>{previousLabel}</span>
            <span className={styles.chapterTitle}>{localize(previousTarget.title, lang)}</span>
          </span>
        </Link>
      ) : (
        <span className={`${styles.chapterLink} ${styles.chapterDisabled}`} aria-disabled="true">
          <span className={styles.chapterArrow} aria-hidden="true">
            ‹
          </span>
          <span className={styles.chapterText}>
            <span className={styles.chapterLabel}>{t("previousChapter")}</span>
          </span>
        </span>
      )}
      {nextTarget ? (
        <Link to={nextTarget.path} className={`${styles.chapterLink} ${styles.chapterNext}`} onClick={markCurrentDone}>
          <span className={styles.chapterText}>
            <span className={styles.chapterLabel}>{nextLabel}</span>
            <span className={styles.chapterTitle}>{localize(nextTarget.title, lang)}</span>
          </span>
          <span className={styles.chapterArrow} aria-hidden="true">
            ›
          </span>
        </Link>
      ) : (
        <span className={`${styles.chapterLink} ${styles.chapterDisabled}`} aria-disabled="true">
          <span className={styles.chapterText}>
            <span className={styles.chapterLabel}>{t("nextChapter")}</span>
          </span>
          <span className={styles.chapterArrow} aria-hidden="true">
            ›
          </span>
        </span>
      )}
    </nav>
  );

  if (jointVideo) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.videoBox}>
          <div className={styles.videoWrap}>
            <iframe
              src={jointVideo.src}
              title={jointVideo.title[lang]}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (isBicepsVideo) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.videoBox}>
          <div className={styles.videoWrap}>
            <iframe
              src="https://www.youtube-nocookie.com/embed/eDbn7YuYfUo"
              title={lang === "cs" ? "Biceps brachii video tutorial" : "Biceps brachii video tutorial"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (nerveVideo) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.videoBox}>
          <div className={styles.videoWrap}>
            {nerveVideo.kind === "embed" ? (
              <iframe
                src={nerveVideo.src}
                title={nerveVideo.title[lang]}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <video controls preload="metadata" playsInline>
                <source src={nerveVideo.src} type="video/mp4" />
              </video>
            )}
          </div>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (nerveIntroMatch && nerveIntroContent) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          <article className={styles.nerveIntroLayout}>
            <div className={styles.nerveIntroText}>
              <p>{nerveIntroContent.text[lang]}</p>
            </div>
            <div className={styles.nerveIntroMedia}>
              <ResponsiveImage
                image={makeSingleImage("Nerves/Anatomy", `${nerveIntroContent.imageBaseName}_pc.webp`)}
                alt={nerveIntroContent.alt[lang]}
                wrapClassName={`${styles.shoulderUltrasoundImageWrap} ${styles.probeGripRoundedWrap} ${styles.nerveIntroImageWrap}`}
                enableMobileZoom
                caption={nerveIntroContent.alt[lang]}
              />
            </div>
          </article>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (nerveIntroMatch || nervePositioningMatch) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          <p>
            {lang === "cs"
              ? "Tato část je zatím připravena jako prázdná a obsah bude doplněn."
              : "This section is currently a placeholder and content will be added soon."}
          </p>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (nerveAnatomyMatch) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          <div className={styles.nerveAnatomyIntroLayout}>
            <p>{nerveAnatomyIntroCopy[lang]}</p>
            <ResponsiveImage
              image={makeResponsiveImagePhone("CS", "cross_sections")}
              alt={nerveAnatomyIntroAlt[lang]}
              wrapClassName={`${styles.shoulderUltrasoundImageWrap} ${styles.nerveImageWrap} ${styles.nerveAnatomyIntroImageWrap}`}
              enableMobileZoom
            />
          </div>
          <div className={`${styles.knobologyGrid} ${styles.shoulderUltrasoundGrid} ${styles.nerveAnatomyStack}`}>
            {nerveAnatomyImages.map((item, index) => {
              const abbreviationSet = nerveAnatomyAbbreviations[item.key]?.[lang];
              const abbreviationLine = abbreviationSet ? abbreviationSet.join(", ") : undefined;
              const figureCaptionData = nerveAnatomyFigureCaptions[item.key];
              const figureCaption = figureCaptionData
                ? lang === "cs"
                  ? `Obrázek ${index + 1}: ${figureCaptionData.cs}`
                  : `Figure ${index + 1}: ${figureCaptionData.en}`
                : undefined;
              const figureCaptionWithPeriod = figureCaption ? `${figureCaption.replace(/[.]\s*$/, "")}.` : undefined;
              const combinedCaptionLine = [figureCaptionWithPeriod, abbreviationLine].filter(Boolean).join(" ");
              const zoomCaption = combinedCaptionLine;

              return (
                <article
                  key={item.key}
                  className={`${styles.knobologyCard} ${styles.shoulderUltrasoundCard} ${styles.nerveSectionCard} ${styles.nerveAnatomyCard}`}
                >
                  <div className={`${styles.articleBody} ${styles.nerveAnatomyTextBlock}`}>
                    <h3>{item.title[lang]}</h3>
                    {nerveAnatomyCopy?.[item.key] ? <p>{nerveAnatomyCopy[item.key][lang]}</p> : null}
                    {combinedCaptionLine ? (
                      <p className={`${styles.figureCaption} ${styles.nerveAnatomyCaptionDesktop}`}>
                        {figureCaptionWithPeriod ? <strong>{figureCaptionWithPeriod}</strong> : null}
                        {abbreviationLine ? ` ${abbreviationLine}` : ""}
                      </p>
                    ) : null}
                  </div>
                  <ResponsiveImage
                    image={makeResponsiveImagePhone("CS", item.key)}
                    alt={item.title[lang]}
                    wrapClassName={`${styles.shoulderUltrasoundImageWrap} ${styles.nerveImageWrap} ${styles.nerveAnatomyImageWrap}`}
                    enableMobileZoom
                    caption={zoomCaption}
                  />
                  {combinedCaptionLine ? (
                    <p className={`${styles.figureCaption} ${styles.nerveAnatomyCaptionMobile}`}>
                      {figureCaptionWithPeriod ? <strong>{figureCaptionWithPeriod}</strong> : null}
                      {abbreviationLine ? ` ${abbreviationLine}` : ""}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (entrapmentSitesMatch && entrapmentSites) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          <ol className={styles.compactList}>
            {entrapmentSites[lang].map((item) => (
              <li key={`${item.title}-${item.description}`}>
                <strong>{item.title}</strong> – {item.description}
              </li>
            ))}
          </ol>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (nerveUltrasoundMatch) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          {resolvedNerveUltrasoundContent ? (
            <>
              <p>{resolvedNerveUltrasoundContent.intro[lang]}</p>
              <div className={`${styles.knobologyGrid} ${styles.shoulderUltrasoundGrid} ${styles.protocolImageGrid}`}>
                {resolvedNerveUltrasoundContent.sections.map((item) => {
                  const compareImages = resolvedNerveUltrasoundContent.swipeCompareImages?.find((imageSet) => imageSet.key === item.key);
                  const imageAlt = item.caption[lang];
                  const captionSeparatorIndex = item.caption[lang].indexOf(":");
                  const captionHeading =
                    captionSeparatorIndex >= 0 ? item.caption[lang].slice(0, captionSeparatorIndex + 1) : item.caption[lang];
                  const captionBody =
                    captionSeparatorIndex >= 0 ? item.caption[lang].slice(captionSeparatorIndex + 1).trim() : "";

                  return (
                    <article key={item.key} className={`${styles.knobologyCard} ${styles.shoulderUltrasoundCard} ${styles.nerveSectionCard}`}>
                      {compareImages ? (
                        <SwipeCompareImage
                          baseImage={compareImages.baseImage}
                          overlayImage={compareImages.overlayImage}
                          baseAlt={imageAlt}
                          overlayAlt={imageAlt}
                          ariaLabel={item.caption[lang]}
                          wrapClassName={`${styles.shoulderUltrasoundImageWrap} ${styles.ulnarSwipeCompareWrap} ${styles.shoulderSwipeCompareWrap}`}
                          showRange
                          controlsClassName={styles.shoulderSwipeControls}
                          rangeColor={node.color}
                        />
                      ) : resolvedNerveUltrasoundContent.folder ? (
                        <ResponsiveImage
                          image={makeResponsiveImagePhone(resolvedNerveUltrasoundContent.folder, item.key)}
                          alt={imageAlt}
                          wrapClassName={styles.shoulderUltrasoundImageWrap}
                        />
                      ) : null}
                      <div className={styles.articleBody}>
                        <p className={styles.figureCaption}>
                          <strong>{captionHeading}</strong>
                          {captionBody ? <span className={styles.figureCaptionBody}> {captionBody}</span> : ""}
                        </p>
                      </div>
                    </article>
                  );
                })}
                {false && ulnarInteractiveSections[0] && ulnarSwipeImages.length === 2 ? (
                  <article className={`${styles.knobologyCard} ${styles.shoulderUltrasoundCard} ${styles.nerveSectionCard}`}>
                    <div className={styles.articleBody}>
                      <h3>{ulnarInteractiveSections[0].title[lang]}</h3>
                    </div>
                    <div
                      className={`${styles.shoulderUltrasoundImageWrap} ${styles.nerveImageWrap} ${styles.ulnarInteractiveWrap}`}
                      onTouchStart={handleUlnarFigureTouchStart}
                      onTouchEnd={handleUlnarFigureTouchEnd}
                    >
                      <ResponsivePicture
                        image={ulnarSwipeImages[activeUlnarCompareIndex]}
                        alt={ulnarInteractiveSections[0].caption[lang]}
                        className={styles.inlineImage}
                      />
                    </div>
                    <div className={styles.ulnarToggleRow}>
                      <button
                        type="button"
                        className={`${styles.ulnarToggleButton} ${activeUlnarCompareIndex === 0 ? styles.ulnarToggleButtonActive : ""}`}
                        onClick={() => setActiveUlnarCompareIndex(0)}
                      >
                        {lang === "cs" ? "Obrázek 2" : "Figure 2"}
                      </button>
                      <button
                        type="button"
                        className={`${styles.ulnarToggleButton} ${activeUlnarCompareIndex === 1 ? styles.ulnarToggleButtonActive : ""}`}
                        onClick={() => setActiveUlnarCompareIndex(1)}
                      >
                        {lang === "cs" ? "Obrázek 3" : "Figure 3"}
                      </button>
                    </div>
                    <p className={styles.ulnarSwipeHint}>
                      {lang === "cs" ? "Přejeď prstem doleva nebo doprava." : "Swipe left or right."}
                    </p>
                    <p className={styles.figureCaption}>
                      <strong>{ulnarInteractiveSections[0].caption[lang]}</strong>
                    </p>
                  </article>
                ) : null}
                {false && ulnarInteractiveSections[1] && ulnarSwipeImages.length === 2 ? (
                  <article className={`${styles.knobologyCard} ${styles.shoulderUltrasoundCard} ${styles.nerveSectionCard}`}>
                    <div
                      ref={ulnarSwipeCompareRef}
                      className={`${styles.shoulderUltrasoundImageWrap} ${styles.nerveImageWrap} ${styles.ulnarSwipeCompareWrap}`}
                      onPointerDown={handleUlnarSwipePointerDown}
                      onPointerMove={handleUlnarSwipePointerMove}
                      onPointerUp={handleUlnarSwipePointerUp}
                      onPointerCancel={handleUlnarSwipePointerUp}
                      onLostPointerCapture={handleUlnarSwipeLostPointerCapture}
                    >
                      <div className={styles.ulnarSwipeImageBase}>
                        <ResponsivePicture
                          image={ulnarSwipeImages[0]}
                          alt={lang === "cs" ? "Obrázek 2" : "Figure 2"}
                          className={styles.inlineImage}
                        />
                      </div>
                      <div className={styles.ulnarSwipeReveal} style={{ clipPath: `inset(0 0 0 ${ulnarSwipePosition}%)` }}>
                        <ResponsivePicture
                          image={ulnarSwipeImages[1]}
                          alt={lang === "cs" ? "Obrázek 3" : "Figure 3"}
                          className={styles.inlineImage}
                        />
                      </div>
                      <div className={styles.ulnarSwipeDivider} style={{ left: `${ulnarSwipePosition}%` }}>
                        <span className={styles.ulnarSwipeHandle} />
                      </div>
                    </div>
                    <div className={`${styles.nerveImageWrap} ${styles.ulnarSwipeControls}`}>
                      <div className={styles.ulnarSwipeLabels}>
                        <span>{lang === "cs" ? "Obrázek 2" : "Figure 2"}</span>
                        <span>{lang === "cs" ? "Obrázek 3" : "Figure 3"}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={ulnarSwipePosition}
                        onChange={(event) => setUlnarSwipePosition(Number(event.target.value))}
                        className={styles.ulnarSwipeRange}
                        style={{ "--ulnar-swipe-position": `${ulnarSwipePosition}%` } as CSSProperties}
                        aria-label={ulnarInteractiveSections[1].caption[lang]}
                      />
                      <p className={styles.ulnarSwipeHint}>
                        {lang === "cs"
                          ? "Táhni za středovou značku se šipkami doprava a doleva."
                          : "Drag the center handle with arrows left and right."}
                      </p>
                    </div>
                    <p className={styles.figureCaption}>
                      <strong>{ulnarInteractiveSections[1].caption[lang].replace(/^Figure\s+\d+\.\s*/, "").replace(/^Obr.*?\.\s*/, "")}</strong>
                    </p>
                  </article>
                ) : null}
              </div>
            </>
          ) : (
            <p>
              {lang === "cs"
                ? "Tato část je zatím připravena jako prázdná a obsah bude doplněn."
                : "This section is currently a placeholder and content will be added soon."}
            </p>
          )}
        </section>
        {chapterNav}
      </section>
    );
  }

  if (motorInnervationMatch && motorInnervation) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          <ul className={styles.compactList}>
            {motorInnervation[lang].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (sensoryInnervationMatch && sensoryInnervation) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          <ul className={styles.compactList}>
            {sensoryInnervation[lang].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {sensoryInnervationImage ? (
            <ResponsiveImage
              image={makeResponsiveImagePhone("Sensory inervation", sensoryInnervationImage.baseName)}
              alt={sensoryInnervationImage.alt[lang]}
              wrapClassName={`${styles.shoulderUltrasoundImageWrap} ${styles.nerveImageWrap}`}
              enableMobileZoom
            />
          ) : null}
        </section>
        {chapterNav}
      </section>
    );
  }

  if (isProbesPage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          <p>
            {lang === "cs"
              ? "V muskuloskeletální sonografii se používají tři základní typy sond: lineární, konvexní a vysokofrekvenční. Volba sondy přímo ovlivňuje kvalitu obrazu i správnou interpretaci nálezu."
              : "In musculoskeletal ultrasound, three core probe types are used: linear, convex, and high-frequency. Probe choice directly affects image quality and interpretation."}
          </p>
          <div className={styles.articleGrid}>
            {probes.map((probe) => (
              <article key={probe.title.en} className={styles.articleCard}>
                <ResponsiveImage image={probe.image} alt={probe.title[lang]} wrapClassName={styles.probeImageWrap} />
                <div className={styles.articleBody}>
                  <h3>{probe.title[lang]}</h3>
                  <ul className={styles.compactList}>
                    {probe.body[lang].map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (isProbeMovementsPage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          <div className={styles.articleGrid}>
            {movements.map((movement) => (
              <article key={movement.title.en} className={styles.articleCard}>
                <ResponsiveImage image={movement.image} alt={movement.title[lang]} />
                <div className={styles.articleBody}>
                  <h3>{movement.title[lang]}</h3>
                  <ul className={styles.compactList}>
                    {movement.body[lang].map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (isProbeGripPage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          <p>{probeGripCopy[lang].intro}</p>
          <ResponsiveImage
            image={probeGripImage}
            alt={lang === "cs" ? "Typy držení sondy" : "Probe grip types"}
            wrapClassName={`${styles.shoulderUltrasoundImageWrap} ${styles.nerveImageWrap} ${styles.probeGripRoundedWrap}`}
            enableMobileZoom
          />
          <ul className={styles.compactList}>
            {probeGripCopy[lang].items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (isKnobologyPage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          <p>
            {lang === "cs"
              ? "Správná knobologie je základ kvalitního obrazu."
              : "Proper knobology is essential for image quality. Each card includes a brief practical note on when and why to use the setting."}
          </p>
          <div className={styles.knobologyGrid}>
            {knobologyItems.map((item) => (
              <article key={item.key} className={styles.knobologyCard}>
                <ResponsiveImage
                  image={makeResponsiveImage("Knobology", item.key)}
                  alt={item.title[lang]}
                  wrapClassName={styles.knobologyImageWrap}
                />
                <div className={styles.articleBody}>
                  <h3>{item.title[lang]}</h3>
                  <p>{item.body[lang]}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (isUltrasoundBasicsPage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          <p>{ultrasoundBasicsCopy[lang][0]}</p>
          <p>{ultrasoundBasicsCopy[lang][1]}</p>
          <p>{ultrasoundBasicsCopy[lang][2]}</p>
          <ResponsiveImage
            image={ultrasoundBasicsImage}
            alt={lang === "cs" ? "Ultrazvuk v medicínském zobrazování" : "Ultrasound in medical imaging"}
            enableMobileZoom
            caption={lang === "cs" ? "Obrázek 1: Ultrazvuk v medicínském zobrazování." : "Figure 1: Ultrasound in medical imaging."}
            wrapClassName={styles.shoulderUltrasoundImageWrap}
          />
          <p>{ultrasoundBasicsCopy[lang][3]}</p>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (isSoundWavePage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          <p>{soundWaveCopy[lang][0]}</p>
          <p>{soundWaveCopy[lang][1]}</p>
          <ResponsiveImage
            image={soundWaveImage}
            alt={lang === "cs" ? "Schéma podélné zvukové vlny" : "Longitudinal sound wave diagram"}
            enableMobileZoom
            caption={lang === "cs" ? "Obrázek 2: Podélná zvuková vlna – komprese a rarefakce." : "Figure 2: Longitudinal sound wave – compression and rarefaction."}
            wrapClassName={styles.shoulderUltrasoundImageWrap}
          />
          <p>{soundWaveCopy[lang][2]}</p>
          <p>{soundWaveCopy[lang][3]}</p>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (isSpeedOfSoundPage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          {speedOfSoundCopy[lang].map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>
        {chapterNav}
      </section>
    );
  }

  if (isAcousticImpedancePage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          {acousticImpedanceCopy[lang].map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>
        {chapterNav}
      </section>
    );
  }

  if (isReflectionPage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          {reflectionCopy[lang].map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>
        {chapterNav}
      </section>
    );
  }

  if (isRefractionPage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          {refractionCopy[lang].map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>
        {chapterNav}
      </section>
    );
  }

  if (isEchogenicityPage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          <p>{echogenicityCopy[lang][0]}</p>
          <p>{echogenicityCopy[lang][1]}</p>
          <ResponsiveImage
            image={echogenicityImage}
            alt={lang === "cs" ? "Echogenita – srovnání jasových úrovní" : "Echogenicity – comparison of brightness levels"}
            wrapClassName={styles.shoulderUltrasoundImageWrap}
            enableMobileZoom
            caption={lang === "cs" ? "Obrázek: Základní úrovně echogenity." : "Figure: Basic echogenicity levels."}
          />
          <p>{echogenicityCopy[lang][2]}</p>
          <p>{echogenicityCopy[lang][3]}</p>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (jointPositioningMatch && jointPositioning) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          <p>{jointPositioning.intro[lang]}</p>
          <ResponsiveImage
            image={makeResponsiveImagePhone("Positioning", jointPositioning.imageBaseName)}
            alt={
              lang === "cs"
                ? `Polohování pacienta: ${localize(node.title, lang)}`
                : `Patient positioning: ${localize(node.title, lang)}`
            }
            wrapClassName={styles.shoulderUltrasoundImageWrap}
            enableMobileZoom
            caption={
              jointPositioning.imageBaseName === "rameno"
                ? shoulderPositioningZoomCaption[lang]
                : lang === "cs"
                  ? `Polohování pacienta - ${localize(node.title, lang)}`
                  : `Patient positioning - ${localize(node.title, lang)}`
            }
          />
          <h2>{lang === "cs" ? "Pozice a jejich využití" : "Positions and their use"}</h2>
          <ul className={styles.compactList}>
            {jointPositioning.positions[lang].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (isShoulderUltrasoundPage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          <h2>{lang === "cs" ? "Vyšetřovací protokol" : "Examination protocol"}</h2>
          <ul className={styles.protocolViewList}>
            {shoulderProtocolSteps[lang].map((step, index) => (
              <li key={step.view}>
                <strong>{`${index + 1}. ${step.view}`}</strong>
                <ol type="A" className={styles.protocolPlaneList}>
                  {step.planes.map((plane) => (
                    <li key={plane}>{plane}</li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
          <div className={`${styles.knobologyGrid} ${styles.shoulderUltrasoundGrid} ${styles.protocolImageGrid}`}>
            {shoulderUltrasoundImages.map((item) => (
              <article key={item.key} className={`${styles.knobologyCard} ${styles.shoulderUltrasoundCard} ${styles.shoulderProtocolCard}`}>
                {(() => {
                  const override =
                    lang === "cs" ? shoulderProtocolCopyOverridesCsExtended[item.key] : shoulderProtocolCopyOverridesEn[item.key];
                  const compareImages = shoulderSwipeCompareImages.find((imageSet) => imageSet.key === item.key);
                  const heading = override?.heading ?? item.caption[lang].heading;
                  const legend = override?.legend ?? item.caption[lang].bullets[0] ?? "";
                  const description = override?.description ?? item.caption[lang].bullets.slice(1).join(" ");
                  const headingWithPeriod = heading ? `${heading.replace(/[.]\s*$/, "")}.` : "";
                  const zoomCaption = [headingWithPeriod, legend].filter(Boolean).join(" ");

                  return (
                    <>
                      {compareImages ? (
                        <SwipeCompareImage
                          baseImage={compareImages.baseImage}
                          overlayImage={compareImages.overlayImage}
                          baseAlt={item.title[lang]}
                          overlayAlt={item.title[lang]}
                          ariaLabel={zoomCaption || item.title[lang]}
                          wrapClassName={`${styles.shoulderUltrasoundImageWrap} ${styles.ulnarSwipeCompareWrap} ${styles.shoulderSwipeCompareWrap}`}
                          showRange
                          controlsClassName={styles.shoulderSwipeControls}
                          rangeColor={node.color}
                        />
                      ) : (
                        <ResponsiveImage
                          image={makeResponsiveImage("shoulder", item.key)}
                          alt={item.title[lang]}
                          wrapClassName={styles.shoulderUltrasoundImageWrap}
                          enableMobileZoom
                          caption={zoomCaption}
                        />
                      )}
                      <div className={styles.articleBody}>
                        {heading || legend ? (
                          <p className={styles.figureCaption}>
                            {headingWithPeriod ? <strong>{headingWithPeriod}</strong> : null}
                            {legend ? ` ${legend}` : ""}
                          </p>
                        ) : null}
                        {heading || legend ? (description ? <div className={styles.figureTextSpacer} aria-hidden="true" /> : null) : null}
                        {description ? <p className={styles.shoulderProtocolText}>{description}</p> : null}
                      </div>
                    </>
                  );
                })()}
              </article>
            ))}
          </div>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (jointProtocolMatch && jointContent) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          <h2>{localized("Vyšetřovací protokol")[lang]}</h2>
          <ul className={styles.protocolViewList}>
            {jointContent.protocolSteps.map((step, index) => (
              <li key={step.view}>
                <strong>{`${index + 1}. ${step.view}`}</strong>
                <ol type="A" className={styles.protocolPlaneList}>
                  {step.planes.map((plane) => (
                    <li key={plane}>{plane}</li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
          <div className={`${styles.knobologyGrid} ${styles.shoulderUltrasoundGrid} ${styles.protocolImageGrid}`}>
            {jointContent.protocolImages.map((item) => (
              <article key={item.key} className={`${styles.knobologyCard} ${styles.shoulderUltrasoundCard}`}>
                {(() => {
                  const compareImages = jointContent.swipeCompareImages?.find((imageSet) => imageSet.key === item.key);
                  const imageAlt = `${localize(node.title, lang)} ${item.key}`;

                  return compareImages ? (
                    <SwipeCompareImage
                      baseImage={compareImages.baseImage}
                      overlayImage={compareImages.overlayImage}
                      baseAlt={imageAlt}
                      overlayAlt={imageAlt}
                      ariaLabel={item.heading}
                      wrapClassName={`${styles.shoulderUltrasoundImageWrap} ${styles.ulnarSwipeCompareWrap} ${styles.shoulderSwipeCompareWrap}`}
                      showRange
                      controlsClassName={styles.shoulderSwipeControls}
                      rangeColor={node.color}
                    />
                  ) : (
                    <ResponsiveImage
                      image={makeResponsiveImagePhone(jointContent.folder, item.key)}
                      alt={imageAlt}
                      wrapClassName={styles.shoulderUltrasoundImageWrap}
                    />
                  );
                })()}
                <div className={styles.articleBody}>
                  <h3>{item.heading}</h3>
                  <ul className={styles.compactList}>
                    {[...item.bullets, ...(jointProtocolExtraBullets[jointProtocolMatch[1]]?.[item.key] ?? [])].map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (jointIntroMatch && jointIntroImage && jointIntroContent) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          <p>{jointIntroContent[lang]}</p>
          <ResponsiveImage
            image={makeSingleImage("Anatomy", jointIntroImage.fileName)}
            alt={jointIntroImage.alt[lang]}
            wrapClassName={`${styles.shoulderUltrasoundImageWrap} ${styles.jointIntroImageWrap}`}
            enableMobileZoom
            caption={jointIntroImage.alt[lang]}
          />
        </section>
        {chapterNav}
      </section>
    );
  }

  if (isShoulderIntroPage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        <section className={styles.articleBox}>
          <h2>{lang === "cs" ? "Úvod" : "Introduction"}</h2>
          <ul className={styles.compactList}>
            {shoulderIntroPoints[lang].map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <h2>{lang === "cs" ? "Nejčastější patologie" : "Most common pathologies"}</h2>
          <ul className={styles.compactList}>
            {shoulderPathologyPoints[lang].map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
        {chapterNav}
      </section>
    );
  }

  if (isShoulderAnatomyPage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={`${styles.articleBox} ${styles.anatomyLayout}`}>
          <p className={styles.anatomyLead}>{shoulderAnatomyIntro[lang]}</p>
          <section className={styles.anatomyCard}>
            <h2>{lang === "cs" ? "Landmarky" : "Landmarks"}</h2>
            <ul className={styles.compactList}>
              {shoulderAnatomyLandmarks[lang].map((item) => (
                renderAnatomyListItem(item)
              ))}
            </ul>
            <ResponsiveImage
              image={makeSingleImage("Anatomy/Shoulder", shoulderAnatomyLandmarkImage.fileName)}
              alt={shoulderAnatomyLandmarkImage.alt[lang]}
              wrapClassName={`${styles.shoulderUltrasoundImageWrap} ${styles.anatomyImageWrap}`}
              enableMobileZoom
            />
          </section>
          <section className={styles.anatomyCard}>
            <h2>{lang === "cs" ? "Svaly" : "Muscles"}</h2>
            <h3 className={styles.anatomySubheading}>{lang === "cs" ? "Rotátorová manžeta" : "Rotator cuff"}</h3>
            <ul className={styles.compactList}>
              {shoulderAnatomyMuscles[lang].cuff.map((item) => (
                renderAnatomyListItem(item)
              ))}
            </ul>
            <h3 className={styles.anatomySubheading}>{lang === "cs" ? "Další důležité svaly" : "Other key muscles"}</h3>
            <ul className={styles.compactList}>
              {shoulderAnatomyMuscles[lang].other.map((item) => (
                renderAnatomyListItem(item)
              ))}
            </ul>
            <div
              className={`${styles.swipeGallery} ${styles.anatomyGallery}`}
              aria-label={lang === "cs" ? "Galerie svalů ramene" : "Shoulder muscle gallery"}
            >
              {shoulderAnatomyMuscleGallery.map((item, index) => (
                <article key={item.fileName} className={styles.swipeGalleryItem}>
                  <button
                    type="button"
                    className={styles.imageZoomButton}
                    onClick={() => setActiveShoulderMuscleImageIndex(index)}
                    aria-label={item.alt[lang]}
                  >
                    <picture className={`${styles.inlineImageWrap} ${styles.shoulderUltrasoundImageWrap} ${styles.anatomyGalleryImageWrap}`}>
                      <img
                        className={styles.inlineImage}
                        src={makeSingleImage("Anatomy/Shoulder", item.fileName).pc}
                        alt={item.alt[lang]}
                        loading="lazy"
                        decoding="async"
                      />
                    </picture>
                  </button>
                </article>
              ))}
            </div>
          </section>
        </section>
        {activeShoulderMuscleImage ? (
          <div className={styles.imageZoomOverlay} role="dialog" aria-modal="true" onClick={() => setActiveShoulderMuscleImageIndex(null)}>
            <div className={styles.imageZoomContent}>
              <button
                type="button"
                className={styles.imageZoomClose}
                onClick={() => setActiveShoulderMuscleImageIndex(null)}
                aria-label="Close"
              >
                ×
              </button>
              <button
                type="button"
                className={`${styles.imageZoomNav} ${styles.imageZoomPrev}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveShoulderMuscleImageIndex((prev) =>
                    prev === null ? 0 : (prev - 1 + shoulderAnatomyMuscleGallery.length) % shoulderAnatomyMuscleGallery.length
                  );
                }}
                aria-label={lang === "cs" ? "Předchozí obrázek" : "Previous image"}
              >
                ‹
              </button>
              <img
                className={styles.imageZoomImage}
                src={makeSingleImage("Anatomy/Shoulder", activeShoulderMuscleImage.fileName).pc}
                alt={activeShoulderMuscleImage.alt[lang]}
                loading="lazy"
                decoding="async"
                onClick={(event) => event.stopPropagation()}
              />
              <button
                type="button"
                className={`${styles.imageZoomNav} ${styles.imageZoomNext}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveShoulderMuscleImageIndex((prev) =>
                    prev === null ? 0 : (prev + 1) % shoulderAnatomyMuscleGallery.length
                  );
                }}
                aria-label={lang === "cs" ? "Další obrázek" : "Next image"}
              >
                ›
              </button>
              <p className={styles.imageZoomCaption} onClick={(event) => event.stopPropagation()}>
                {activeShoulderMuscleImage.alt[lang]} ({(activeShoulderMuscleImageIndex ?? 0) + 1}/{shoulderAnatomyMuscleGallery.length})
              </p>
            </div>
          </div>
        ) : null}
        {chapterNav}
      </section>
    );
  }

  if (isElbowAnatomyPage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={`${styles.articleBox} ${styles.anatomyLayout}`}>
          <p className={styles.anatomyLead}>{elbowAnatomyIntro[lang]}</p>
          <section className={styles.anatomyCard}>
            <h2>{lang === "cs" ? "Anatomický přehled" : "Anatomical overview"}</h2>
            <h3 className={styles.anatomySubheading}>{lang === "cs" ? "Relevantní klouby loketního komplexu" : "Relevant joints of the elbow complex"}</h3>
            <ul className={styles.compactList}>
              {elbowAnatomyJoints[lang].map((item) => (
                renderAnatomyListItem(item)
              ))}
            </ul>
            <p>{elbowAnatomyUltrasoundFocus[lang]}</p>
          </section>
          <section className={styles.anatomyCard}>
            <h2>{lang === "cs" ? "Kostní landmarky" : "Bony landmarks"}</h2>
            <p>{elbowAnatomyLandmarkLead[lang]}</p>
            <ul className={styles.compactList}>
              {elbowAnatomyLandmarks[lang].map((item) => (
                renderAnatomyListItem(item)
              ))}
            </ul>
          </section>
          <section className={styles.anatomyCard}>
            <h2>{lang === "cs" ? "Svaly" : "Muscles"}</h2>
            <h3 className={styles.anatomySubheading}>{lang === "cs" ? "Hlavní svalové skupiny" : "Key muscle groups"}</h3>
            <ul className={styles.compactList}>
              {elbowAnatomyMuscles[lang].primary.map((item) => (
                renderAnatomyListItem(item)
              ))}
            </ul>
            <h3 className={styles.anatomySubheading}>{lang === "cs" ? "Další důležité svaly" : "Other important muscles"}</h3>
            <ul className={styles.compactList}>
              {elbowAnatomyMuscles[lang].other.map((item) => (
                renderAnatomyListItem(item)
              ))}
            </ul>
          </section>
        </section>
        {chapterNav}
      </section>
    );
  }

  return (
    <section className={styles.stack}>
      <PageHeader title={localize(node.title, lang)} color={node.color} />
      {progressBar}
      <section className={styles.emptyBox} />
      {chapterNav}
    </section>
  );
}
