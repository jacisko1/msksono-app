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

interface NerveUltrasoundInteractiveSection {
  title: { cs: string; en: string };
  caption: { cs: string; en: string };
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

const ASSET_VERSION = "2026-03-30-2";

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
      Zvuk je <strong>mechanickĂ© vlnÄ›nĂ­</strong>, kterĂ© se ĹˇĂ­Ĺ™Ă­ prostĹ™edĂ­m (napĹ™Ă­klad vzduchem, vodou nebo biologickĂ˝mi tkĂˇnÄ›mi).
      VznikĂˇ kmitĂˇnĂ­m ÄŤĂˇstic prostĹ™edĂ­ a ĹˇĂ­Ĺ™Ă­ se jako <strong>podĂ©lnĂˇ vlna</strong> tvoĹ™enĂˇ stĹ™Ă­dĂˇnĂ­m oblastĂ­ komprese
      a rarefakce.
    </>,
    <>
      PĹ™edpona <strong>ultra-</strong> znamenĂˇ â€žzaâ€ś nebo â€žnadâ€ś. V tomto pĹ™Ă­padÄ› oznaÄŤuje frekvence vyĹˇĹˇĂ­ neĹľ je hornĂ­ hranice
      slyĹˇitelnosti lidskĂ©ho ucha. ÄŚlovÄ›k je schopen vnĂ­mat zvuk pĹ™ibliĹľnÄ› v rozsahu <strong>20 Hz aĹľ 20 kHz</strong>. VlnÄ›nĂ­
      s vyĹˇĹˇĂ­ frekvencĂ­ se oznaÄŤuje jako ultrazvuk.
    </>,
    <>
      V medicĂ­nskĂ©m zobrazovĂˇnĂ­ se pouĹľĂ­vajĂ­ vĂ˝raznÄ› vyĹˇĹˇĂ­ frekvence, typicky pĹ™ibliĹľnÄ› <strong>2â€“18 MHz</strong>. Tyto frekvence
      jsou nÄ›kolikanĂˇsobnÄ› vyĹˇĹˇĂ­ neĹľ frekvence slyĹˇitelnĂ©ho zvuku, a proto je lidskĂ© ucho nedokĂˇĹľe zachytit.
    </>,
    <>
      DĹŻleĹľitou vlastnostĂ­ ultrazvuku je, Ĺľe se jednĂˇ o <strong>mechanickĂ© vlnÄ›nĂ­, nikoli elektromagnetickĂ© zĂˇĹ™enĂ­</strong>.
      Ke svĂ©mu ĹˇĂ­Ĺ™enĂ­ proto vĹľdy potĹ™ebuje materiĂˇlnĂ­ prostĹ™edĂ­. V biologickĂ˝ch tkĂˇnĂ­ch se ultrazvuk ĹˇĂ­Ĺ™Ă­ relativnÄ› dobĹ™e,
      zatĂ­mco ve vzduchu velmi ĹˇpatnÄ›. Z tohoto dĹŻvodu se pĹ™i ultrazvukovĂ©m vyĹˇetĹ™enĂ­ pouĹľĂ­vĂˇ <strong>kontaktnĂ­ gel</strong>,
      kterĂ˝ eliminuje vzduchovou vrstvu mezi sondou a kĹŻĹľĂ­ a umoĹľĹuje efektivnĂ­ pĹ™enos ultrazvukovĂ˝ch vln do tkĂˇnĂ­.
    </>
  ],
  en: [
    <>
      Sound is a <strong>mechanical wave</strong> that propagates through a medium (for example air, water, or biological tissues).
      It arises from the oscillation of particles in the medium and propagates as a <strong>longitudinal wave</strong> formed
      by alternating regions of compression and rarefaction.
    </>,
    <>
      The prefix <strong>ultra-</strong> means â€śbeyondâ€ť or â€śabove.â€ť In this case it denotes frequencies higher than the upper
      limit of human hearing. Humans can perceive sound approximately in the range of <strong>20 Hz to 20 kHz</strong>. Waves
      with higher frequency are called ultrasound.
    </>,
    <>
      In medical imaging, much higher frequencies are used, typically about <strong>2â€“18 MHz</strong>. These frequencies are
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
      Zvuk je <strong>mechanickĂ© vlnÄ›nĂ­</strong>, kterĂ© se ĹˇĂ­Ĺ™Ă­ prostĹ™edĂ­m pĹ™enosem energie mezi ÄŤĂˇsticemi lĂˇtky. Na rozdĂ­l od
      elektromagnetickĂ©ho zĂˇĹ™enĂ­ se zvuk <strong>nemĹŻĹľe ĹˇĂ­Ĺ™it ve vakuu</strong> â€“ k propagaci vĹľdy potĹ™ebuje materiĂˇlnĂ­ prostĹ™edĂ­,
      napĹ™Ă­klad vzduch, vodu nebo biologickĂ© tkĂˇnÄ›.
    </>,
    <>
      Z fyzikĂˇlnĂ­ho hlediska se jednĂˇ o <strong>podĂ©lnou vlnu</strong>. ÄŚĂˇstice prostĹ™edĂ­ se pĹ™i jejĂ­m ĹˇĂ­Ĺ™enĂ­ nepohybujĂ­ ve smÄ›ru
      ĹˇĂ­Ĺ™enĂ­ vlny, ale pouze kmitajĂ­ kolem svĂ© rovnovĂˇĹľnĂ© polohy. Toto kmitĂˇnĂ­ vytvĂˇĹ™Ă­ stĹ™Ă­dajĂ­cĂ­ se oblasti komprese
      (<strong>zvĂ˝ĹˇenĂ˝ tlak a hustota ÄŤĂˇstic</strong>) a rarefakce (<strong>snĂ­ĹľenĂ˝ tlak a hustota ÄŤĂˇstic</strong>), kterĂ© se
      postupnÄ› ĹˇĂ­Ĺ™Ă­ prostĹ™edĂ­m.
    </>,
    <>
      Zvukovou vlnu lze popsat nÄ›kolika zĂˇkladnĂ­mi parametry. Mezi nejdĹŻleĹľitÄ›jĹˇĂ­ patĹ™Ă­ <strong>frekvence</strong>, kterĂˇ udĂˇvĂˇ
      poÄŤet kmitĹŻ za sekundu, a <strong>vlnovĂˇ dĂ©lka</strong>, tedy vzdĂˇlenost mezi dvÄ›ma sousednĂ­mi body stejnĂ© fĂˇze vlnÄ›nĂ­
      (napĹ™Ă­klad mezi dvÄ›ma maximy komprese). Tyto parametry jsou vzĂˇjemnÄ› propojeny â€“ pĹ™i konstantnĂ­ rychlosti ĹˇĂ­Ĺ™enĂ­ vyĹˇĹˇĂ­
      frekvence odpovĂ­dĂˇ kratĹˇĂ­ vlnovĂ© dĂ©lce.
    </>,
    <>
      V ultrazvukovĂ©m zobrazovĂˇnĂ­ majĂ­ vlastnosti zvukovĂ© vlny <strong>zĂˇsadnĂ­ vĂ˝znam</strong>, protoĹľe urÄŤujĂ­ zpĹŻsob, jakĂ˝m se
      ultrazvuk ĹˇĂ­Ĺ™Ă­ biologickĂ˝mi tkĂˇnÄ›mi a jak interaguje s jejich rozhranĂ­mi.
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
      <strong>Rychlost zvuku</strong> zĂˇvisĂ­ na vlastnostech prostĹ™edĂ­ â€“ zejmĂ©na na jeho hustotÄ› a elasticitÄ›. V mÄ›kkĂ˝ch tkĂˇnĂ­ch
      lidskĂ©ho tÄ›la se pro klinickou praxi pouĹľĂ­vĂˇ prĹŻmÄ›rnĂˇ hodnota pĹ™ibliĹľnÄ› <strong>1540 m/s</strong>.
    </>,
    <>
      Rychlost zvuku je klĂ­ÄŤovĂˇ pro sprĂˇvnĂ˝ pĹ™epoÄŤet ÄŤasu letu odraĹľenĂ© vlny na vzdĂˇlenost. PĹ™Ă­stroj vĹľdy pĹ™edpoklĂˇdĂˇ konstantnĂ­
      rychlost ĹˇĂ­Ĺ™enĂ­ v tkĂˇnĂ­ch. Pokud se reĂˇlnĂˇ rychlost liĹˇĂ­, vznikĂˇ <strong>geometrickĂˇ chyba</strong> â€“ struktury se mohou
      zobrazit o nÄ›co hloubÄ›ji nebo mÄ›lÄŤeji, neĹľ ve skuteÄŤnosti jsou.
    </>,
    <>
      ObecnÄ› platĂ­, Ĺľe <strong>rychleji se zvuk ĹˇĂ­Ĺ™Ă­ v tuhĂ˝ch prostĹ™edĂ­ch</strong> (napĹ™Ă­klad kost), pomaleji v mÄ›kÄŤĂ­ch a
      mĂ©nÄ› elastickĂ˝ch tkĂˇnĂ­ch. VelkĂ© rozdĂ­ly rychlosti na rozhranĂ­ch pĹ™ispĂ­vajĂ­ k odrazĹŻm a artefaktĹŻm.
    </>,
    <>
      Pro sonografistu je proto dĹŻleĹľitĂ© rozumÄ›t tomu, Ĺľe zmÄ›ny rychlosti ĹˇĂ­Ĺ™enĂ­ ovlivĹujĂ­ <strong>polohu, tvar i velikost</strong>
      zobrazenĂ˝ch struktur.
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
      <strong>AkustickĂˇ impedance</strong> je veliÄŤina, kterĂˇ popisuje odpor prostĹ™edĂ­ proti ĹˇĂ­Ĺ™enĂ­ zvukovĂ© vlny. ZĂˇvisĂ­ na hustotÄ›
      prostĹ™edĂ­ a rychlosti zvuku v nÄ›m.
    </>,
    <>
      RozdĂ­l akustickĂ˝ch impedancĂ­ mezi dvÄ›ma tkĂˇnÄ›mi urÄŤuje, kolik energie se na rozhranĂ­ <strong>odrazĂ­</strong> a kolik projde
      dĂˇl. ÄŚĂ­m vÄ›tĹˇĂ­ rozdĂ­l, tĂ­m silnÄ›jĹˇĂ­ odraz a jasnÄ›jĹˇĂ­ echogennĂ­ linie v obraze.
    </>,
    <>
      ExtrĂ©mnĂ­ rozdĂ­l je mezi mÄ›kkĂ˝mi tkĂˇnÄ›mi a vzduchem â€“ proto vzduch vytvĂˇĹ™Ă­ tĂ©mÄ›Ĺ™ ĂşplnĂ˝ odraz a vĂ˝raznÄ› zhorĹˇuje zobrazenĂ­.
      Z tohoto dĹŻvodu se pouĹľĂ­vĂˇ <strong>gel</strong> pro odstranÄ›nĂ­ vzduchovĂ© vrstvy.
    </>,
    <>
      PorozumÄ›nĂ­ akustickĂ© impedanci je klĂ­ÄŤovĂ© pro interpretaci toho, proÄŤ jsou nÄ›kterĂ© rozhranĂ­ <strong>hyperechogennĂ­</strong>
      a jinĂ© naopak mĂˇlo viditelnĂ©.
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
      <strong>Odraz</strong> vznikĂˇ na rozhranĂ­ dvou prostĹ™edĂ­ s odliĹˇnou akustickou impedancĂ­. ÄŚĂˇst energie se vracĂ­ zpÄ›t jako
      echo, kterĂ© pĹ™Ă­stroj vyuĹľĂ­vĂˇ k tvorbÄ› obrazu.
    </>,
    <>
      Intenzita odrazu zĂˇvisĂ­ na rozdĂ­lu impedancĂ­ a na Ăşhlu dopadu paprsku. NejvĂ­ce energie se vracĂ­ pĹ™i <strong>kolmĂ©m dopadu</strong>,
      proto se snaĹľĂ­me sondu nastavit co nejkolmÄ›ji k vyĹˇetĹ™ovanĂ© struktuĹ™e.
    </>,
    <>
      Odraz je hlavnĂ­ mechanizmus, dĂ­ky kterĂ©mu vidĂ­me hranice tkĂˇnĂ­. ZĂˇroveĹ je zdrojem nÄ›kterĂ˝ch artefaktĹŻ, napĹ™Ă­klad
      <strong>zrcadlenĂ­</strong> nebo <strong>reverberacĂ­</strong>.
    </>,
    <>
      V praxi je dĹŻleĹľitĂ© chĂˇpat, Ĺľe slabĂ© odrazy mohou vĂ©st k nĂ­zkĂ© echogenitÄ›, zatĂ­mco silnĂ© odrazy vytvĂˇĹ™ejĂ­ jasnĂ© linie.
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
      <strong>Lom</strong> (refraction) nastĂˇvĂˇ, kdyĹľ zvukovĂˇ vlna pĹ™echĂˇzĂ­ mezi prostĹ™edĂ­mi s rĹŻznou rychlostĂ­ ĹˇĂ­Ĺ™enĂ­ a dopadĂˇ na
      rozhranĂ­ pod Ăşhlem. Paprsek se potom <strong>odchyluje</strong> od pĹŻvodnĂ­ho smÄ›ru.
    </>,
    <>
      V ultrazvuku mĹŻĹľe lom zpĹŻsobit, Ĺľe se struktura zobrazĂ­ na jinĂ©m mĂ­stÄ›, neĹľ kde skuteÄŤnÄ› je. TypickĂ˝m dĹŻsledkem je
      <strong>laterĂˇlnĂ­ posun</strong> nebo zdvojenĂ­ kontur.
    </>,
    <>
      K lomĹŻm ÄŤasto dochĂˇzĂ­ na zakĹ™ivenĂ˝ch rozhranĂ­ch, napĹ™Ă­klad na okrajĂ­ch Ĺˇlach ÄŤi cĂ©v. ZmÄ›nou Ăşhlu sondy lze tento efekt
      ÄŤĂˇsteÄŤnÄ› minimalizovat.
    </>,
    <>
      PorozumÄ›nĂ­ lomu pomĂˇhĂˇ sprĂˇvnÄ› interpretovat obraz a odliĹˇit skuteÄŤnĂ˝ nĂˇlez od artefaktu.
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
        SprĂˇvnĂ© <strong>drĹľenĂ­ sondy</strong> zvyĹˇuje stabilitu, zlepĹˇuje kontakt s tkĂˇnÄ›mi a sniĹľuje Ăşnavu ruky. NĂ­Ĺľe jsou tĹ™i
        praktickĂ© typy Ăşchopu pouĹľĂ­vanĂ© v MSK sonografii.
      </>
    ),
    items: [
      <>
        <strong>Princess grip</strong> â€“ ĹˇpatnĂ˝ zpĹŻsob drĹľenĂ­, protoĹľe je nestabilnĂ­ a snadno vede k nechtÄ›nĂ˝m pohybĹŻm sondy.
        VĂ˝sledkem je niĹľĹˇĂ­ kontrola a horĹˇĂ­ reprodukovatelnost obrazu.
      </>,
      <>
        <strong>Normal grip</strong> â€“ standardnĂ­ vyvĂˇĹľenĂ˝ Ăşchop. Poskytuje dobrou stabilitu i citlivost a je nejÄŤastÄ›ji pouĹľĂ­vanĂ˝
        pĹ™i rutinnĂ­m vyĹˇetĹ™enĂ­.
      </>,
      <>
        <strong>Powerful grip</strong> â€“ takĂ© ĹˇpatnĂ˝ zpĹŻsob drĹľenĂ­, protoĹľe omezuje jemnĂ© Ĺ™Ă­zenĂ­ a vede k pĹ™ehnanĂ©mu tlaku na
        tkĂˇnÄ›. To sniĹľuje citlivost, zhorĹˇuje drobnĂ© korekce a zvyĹˇuje Ăşnavu ruky.
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
        <strong>Princess grip</strong> â€“ a poor grip choice because it is unstable and easily causes unintended probe movement.
        This results in reduced control and poorer reproducibility.
      </>,
      <>
        <strong>Normal grip</strong> â€“ a balanced standard grip. It provides good stability and sensitivity and is the most common
        choice for routine scanning.
      </>,
      <>
        <strong>Powerful grip</strong> â€“ also a poor grip choice because it limits fine control and encourages excessive pressure
        on tissues. This reduces sensitivity, worsens fine adjustments, and increases hand fatigue.
      </>
    ]
  }
} as const;

const echogenicityCopy = {
  cs: [
    <>
      <strong>Echogenita</strong> popisuje, jak intenzivnÄ› tkĂˇĹ odrĂˇĹľĂ­ ultrazvuk. V obraze se projevuje jako rĹŻznĂ˝ stupeĹ jasu,
      kterĂ˝ umoĹľĹuje rozliĹˇit struktury a jejich vlastnosti.
    </>,
    <>
      ZĂˇkladnĂ­ pojmy: <strong>anechogennĂ­</strong> (bez odrazu, zcela ÄŤernĂ© â€“ typicky tekutiny), <strong>hypoechogennĂ­</strong>
      (tmavĹˇĂ­ neĹľ okolĂ­), <strong>izoechogennĂ­</strong> (stejnĂ˝ jas jako okolĂ­) a <strong>hyperechogennĂ­</strong> (svÄ›tlejĹˇĂ­ neĹľ
      okolĂ­ â€“ silnĂ© odrazy, napĹ™. fibrotickĂ© tkĂˇnÄ› nebo kalcifikace).
    </>,
    <>
      Echogenita vĹľdy zĂˇvisĂ­ na <strong>nastavenĂ­ pĹ™Ă­stroje</strong> (gain, TGC) a na Ăşhlu dopadu paprsku. Proto je dĹŻleĹľitĂ©
      hodnotit jas struktury v kontextu okolĂ­ a pĹ™i sprĂˇvnĂ©m nastavenĂ­.
    </>,
    <>
      V praxi se ÄŤasto pouĹľĂ­vĂˇ i termĂ­n <strong>heterogennĂ­</strong> echotextura, kterĂˇ znamenĂˇ nehomogennĂ­ vzhled tkĂˇnÄ›. To mĹŻĹľe
      svÄ›dÄŤit pro zĂˇnÄ›t, degenerativnĂ­ zmÄ›ny nebo smĂ­ĹˇenĂ˝ obsah.
    </>
  ],
  en: [
    <>
      <strong>Echogenicity</strong> describes how strongly a tissue reflects ultrasound. On the image it appears as different
      levels of brightness, allowing structures and their properties to be distinguished.
    </>,
    <>
      Key terms: <strong>anechoic</strong> (no reflection, completely black â€“ typically fluid), <strong>hypoechoic</strong>
      (darker than surroundings), <strong>isoechoic</strong> (same brightness as surroundings), and <strong>hyperechoic</strong>
      (brighter than surroundings â€“ strong reflections, e.g. fibrotic tissue or calcifications).
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
    title: { cs: "ZĂˇpÄ›stĂ­ video tutorial", en: "Wrist video tutorial" }
  },
  kycel: {
    src: "https://www.youtube-nocookie.com/embed/7dexOe8owkE",
    title: { cs: "KyÄŤel video tutorial", en: "Hip video tutorial" }
  },
  koleno: {
    src: "https://www.youtube-nocookie.com/embed/9amXVQnCin0",
    title: { cs: "Koleno video tutorial", en: "Knee video tutorial" }
  },
  kotnik: {
    src: "https://www.youtube-nocookie.com/embed/Xag8-Odb7is",
    title: { cs: "KotnĂ­k video tutorial", en: "Ankle video tutorial" }
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
      "UltrazvukovĂ© vyĹˇetĹ™enĂ­ loketnĂ­ho kloubu je praktickĂˇ metoda pro detailnĂ­ hodnocenĂ­ mÄ›kkĂ˝ch tkĂˇnĂ­ v reĂˇlnĂ©m ÄŤase; pĹ™i sprĂˇvnĂ© technice pĹ™esnÄ› hodnotĂ­ Ĺˇlachy flexorovĂ©ho i extenzorovĂ©ho aparĂˇtu, vazy, nervy i burzy a umoĹľĹuje pĹ™Ă­mou korelaci nĂˇlezu s bolestĂ­ a porovnĂˇnĂ­ s druhou stranou.",
      "KvalitnĂ­ vyĹˇetĹ™enĂ­ vyĹľaduje standardizovanou polohu pacienta, systematickĂ˝ postup od kostnĂ­ch orientaÄŤnĂ­ch bodĹŻ (epikondyly humeru, olecranon, hlavice radia) a skenovĂˇnĂ­ v podĂ©lnĂ© i pĹ™Ă­ÄŤnĂ© rovinÄ› s aktivnĂ­ pracĂ­ se sondou (sliding, rocking, fanning) pro minimalizaci anizotropie.",
      "DynamickĂ© manĂ©vry (flexe/extenze, pronace/supinace) pomĂˇhajĂ­ zachytit patologii Ĺˇlach, subluxaci n. ulnaris v kubitĂˇlnĂ­m tunelu i poruchy stability lokte; pĹ™i tekutinovĂ˝ch kolekcĂ­ch je vhodnĂˇ komprese/dekomprese pro odliĹˇenĂ­ vĂ˝potku, synovitidy nebo burzitidy od pevnĂ© tkĂˇnÄ›.",
      "ZĂˇsadnĂ­ je sprĂˇvnĂ© nastavenĂ­ pĹ™Ă­stroje (hloubka, fokus, gain) a pouĹľitĂ­ vysokofrekvenÄŤnĂ­ lineĂˇrnĂ­ sondy; systematiÄŤnost, porovnĂˇnĂ­ s kontralaterĂˇlnĂ­ stranou a znalost artefaktĹŻ jsou klĂ­ÄŤovĂ© pro spolehlivou interpretaci."
    ],
    pathologyPoints: [
      "NejÄŤastÄ›jĹˇĂ­ jsou tendinopatie, parciĂˇlnĂ­ ruptury a entezopatie v oblasti laterĂˇlnĂ­ho a mediĂˇlnĂ­ho epikondylu (spoleÄŤnĂ˝ extenzorovĂ˝/flexorovĂ˝ Ăşpon), dĂˇle postiĹľenĂ­ Ĺˇlachy m. triceps brachii.",
      "ÄŚastĂ© jsou takĂ© burzitida olecrani, synovitida a kloubnĂ­ vĂ˝potek v pĹ™ednĂ­m i zadnĂ­m recesu lokte.",
      "VĂ˝znamnĂ© je hodnocenĂ­ nervovĂ˝ch struktur, zejmĂ©na n. ulnaris v kubitĂˇlnĂ­m tunelu (ztluĹˇtÄ›nĂ­, zmÄ›ny echogenity, dynamickĂˇ subluxace).",
      "U chronickĂ˝ch obtĂ­ĹľĂ­ lze nalĂ©zt degenerativnĂ­ zmÄ›ny Ĺˇlach, kalcifikace, nepravidelnosti kortikalis v mĂ­stech ĂşponĹŻ a zmÄ›ny echotextury svalĹŻ."
    ],
    protocolSteps: [
      { view: "VentrĂˇlnĂ­ pohled", planes: ["TransverzĂˇlnĂ­ rovina", "SagitĂˇlnĂ­ rovina"] },
      { view: "MediĂˇlnĂ­ pohled", planes: ["FrontĂˇlnĂ­ rovina"] },
      { view: "LaterĂˇlnĂ­ pohled", planes: ["FrontĂˇlnĂ­ rovina"] },
      { view: "DorzĂˇlnĂ­ pohled", planes: ["SagitĂˇlnĂ­ rovina"] }
    ],
    protocolImages: [
      {
        key: "01_01",
        heading: "ObrĂˇzek 1. VentrĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina",
        bullets: [
          "b: distĂˇlnĂ­ Ĺˇlacha bicepsu brachii, a: arteria brachialis, m: nervus medianus, c: chrupavka. PĹ™ednĂ­ pĹ™Ă­ÄŤnĂ˝ Ĺ™ez loktem s pĹ™ehledem radiohumerĂˇlnĂ­ oblasti, neurovaskulĂˇrnĂ­ch struktur a chrupavky."
        ]
      },
      {
        key: "02_02",
        heading: "ObrĂˇzek 2. VentrĂˇlnĂ­ pohled, sagitĂˇlnĂ­ rovina, radiĂˇlnĂ­ strana",
        bullets: [
          "c: chrupavka, f: tekutina v kloubu. PodĂ©lnĂ˝ Ĺ™ez radiohumerĂˇlnĂ­m skloubenĂ­m vhodnĂ˝ pro hodnocenĂ­ tekutiny v radiĂˇlnĂ­ jamce a pĹ™ednĂ­m recesu."
        ]
      },
      {
        key: "03_03",
        heading: "ObrĂˇzek 3. VentrĂˇlnĂ­ pohled, sagitĂˇlnĂ­ rovina, ulnĂˇrnĂ­ strana",
        bullets: [
          "c: chrupavka, f: tekutina v kloubu. PodĂ©lnĂ˝ Ĺ™ez humeroulnĂˇrnĂ­m skloubenĂ­m s hodnocenĂ­m fossa coronoidea a pĹ™ednĂ­ho synoviĂˇlnĂ­ho recesu."
        ]
      },
      {
        key: "04_04",
        heading: "ObrĂˇzek 4. MediĂˇlnĂ­ pohled, frontĂˇlnĂ­ rovina",
        bullets: [
          "CFT: spoleÄŤnĂˇ flexorovĂˇ Ĺˇlacha. Projekce mediĂˇlnĂ­ ÄŤĂˇsti lokte pro hodnocenĂ­ Ăşponu flexorĹŻ, MCL a nĂˇlezĹŻ typu mediĂˇlnĂ­ epikondylitida."
        ]
      },
      {
        key: "01_05",
        heading: "ObrĂˇzek 5. LaterĂˇlnĂ­ pohled, frontĂˇlnĂ­ rovina",
        bullets: [
          "CET: spoleÄŤnĂˇ Ĺˇlacha extenzorĹŻ. KlĂ­ÄŤovĂˇ projekce pro laterĂˇlnĂ­ epikondylitidu, integritu extenzorovĂ©ho Ăşponu a laterĂˇlnĂ­ho kolaterĂˇlnĂ­ho vazu."
        ]
      },
      {
        key: "02_06",
        heading: "ObrĂˇzek 6. DorzĂˇlnĂ­ pohled, sagitĂˇlnĂ­ rovina",
        bullets: [
          "f: tekutina v kloubu. ZadnĂ­ podĂ©lnĂˇ projekce pĹ™es olecranon a Ĺˇlachu tricepsu pro hodnocenĂ­ zadnĂ­ho recesu, vĂ˝potku a burzitidy."
        ]
      }
    ]
  },
  zapesti: {
    folder: "03_Wrist/protokol",
    swipeCompareImages: wristSwipeCompareImages,
    introPoints: [
      "Ultrazvuk zĂˇpÄ›stĂ­ umoĹľĹuje detailnĂ­ hodnocenĂ­ mÄ›kkĂ˝ch tkĂˇnĂ­ v reĂˇlnĂ©m ÄŤase; pĹ™i sprĂˇvnĂ© technice pĹ™esnÄ› hodnotĂ­ flexorovĂ© a extenzorovĂ© Ĺˇlachy, vazy, nervy i synoviĂˇlnĂ­ pochvy.",
      "ZĂˇsadnĂ­ je standardizovanĂˇ poloha pacienta a systematickĂ© skenovĂˇnĂ­ od kostnĂ­ch orientaÄŤnĂ­ch bodĹŻ (distĂˇlnĂ­ radius/ulna, karpĂˇlnĂ­ kosti, karpĂˇlnĂ­ tunel) v podĂ©lnĂ© i pĹ™Ă­ÄŤnĂ© rovinÄ› s aktivnĂ­ pracĂ­ se sondou pro omezenĂ­ anizotropie.",
      "DynamickĂ© vyĹˇetĹ™enĂ­ (flexe/extenze, radiĂˇlnĂ­/ulnĂˇrnĂ­ dukce) pomĂˇhĂˇ odhalit instabilitu Ĺˇlach, patologii extenzorovĂ˝ch kompartmentĹŻ a zmÄ›ny v oblasti karpĂˇlnĂ­ho tunelu vÄŤetnÄ› komprese n. medianus.",
      "SprĂˇvnĂ© nastavenĂ­ (hloubka, fokus, gain), vysokofrekvenÄŤnĂ­ lineĂˇrnĂ­ sonda a srovnĂˇnĂ­ s druhostrannĂ˝m zĂˇpÄ›stĂ­m jsou klĂ­ÄŤovĂ© pro kvalitnĂ­ interpretaci."
    ],
    pathologyPoints: [
      "NejÄŤastÄ›jĹˇĂ­ jsou tendinopatie a tenosynovitidy flexorĹŻ/extenzorĹŻ, zejmĂ©na v extenzorovĂ˝ch kompartmentech a v karpĂˇlnĂ­m tunelu.",
      "ÄŚastĂ˝m nĂˇlezem jsou gangliovĂ© cysty jako ohraniÄŤenĂ© anechogennĂ­/hypoechogennĂ­ lĂ©ze s posteriornĂ­m zesĂ­lenĂ­m.",
      "BÄ›ĹľnĂ© jsou synovitida a vĂ˝potek radiokarpĂˇlnĂ­ho ÄŤi mediokarpĂˇlnĂ­ho kloubu.",
      "U n. medianus v karpĂˇlnĂ­m tunelu lze zachytit znĂˇmky Ăştlaku (ztluĹˇtÄ›nĂ­, zmÄ›na echogenity, alterace tvaru); u chronickĂ˝ch stavĹŻ degenerativnĂ­ zmÄ›ny a kalcifikace."
    ],
    protocolSteps: [
      { view: "VentrĂˇlnĂ­ pohled", planes: ["TransverzĂˇlnĂ­ rovina", "SagitĂˇlnĂ­ rovina"] },
      { view: "LaterĂˇlnĂ­ pohled", planes: ["TransverzĂˇlnĂ­ rovina", "FrontĂˇlnĂ­ rovina"] },
      { view: "DorzĂˇlnĂ­ pohled", planes: ["TransverzĂˇlnĂ­ rovina"] }
    ],
    protocolImages: [
      { key: "01_Obrzek1_v2", heading: "ObrĂˇzek 1. VentrĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["fcr: flexor carpi radialis, m: n. medianus, a: a. ulnaris, u: n. ulnaris, t: flexor tendon. Projekce karpĂˇlnĂ­ho tunelu a Guyonova kanĂˇlu pro hodnocenĂ­ komprese nervĹŻ, tenosynovitidy a gangliĂ­."] },
      { key: "02_Obrzek2", heading: "ObrĂˇzek 2. VentrĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["m: nervus medianus. ProximĂˇlnĂ­ sledovĂˇnĂ­ n. medianus z karpĂˇlnĂ­ho tunelu do distĂˇlnĂ­ho pĹ™edloktĂ­ mezi FDS a FDP."] },
      { key: "03_Obrzek3", heading: "ObrĂˇzek 3. VentrĂˇlnĂ­ pohled, sagitĂˇlnĂ­ rovina", bullets: ["m: nervus medianus. PodĂ©lnĂ© zobrazenĂ­ fascikulĂˇrnĂ­ architektury n. medianus pĹ™i vstupu do karpĂˇlnĂ­ho tunelu."] },
      { key: "04_Obrzek4", heading: "ObrĂˇzek 4. DorzĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["ECU, EDM, EDC, EI, EPL, ECRB, ECRL, EPB, APL. PĹ™ehled extenzorovĂ˝ch kompartmentĹŻ na Ăşrovni distĂˇlnĂ­ho radia."] },
      { key: "05_Obrzek5", heading: "ObrĂˇzek 5. DorzĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["ECRB, ECRL. DruhĂ˝ extenzorovĂ˝ kompartment laterĂˇlnÄ› od Listerova hrbolku, vhodnĂ˝ pro tenosynovitidu a pĹ™etĂ­ĹľenĂ­."] },
      { key: "06_Obrzek6", heading: "ObrĂˇzek 6. DorzĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["EPB, APL. PrvnĂ­ extenzorovĂ˝ kompartment, typickĂˇ projekce pro De Quervainovu tenosynovitidu."] },
      { key: "07_Obrzek7", heading: "ObrĂˇzek 7. DorzĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["ECU: extensor carpi ulnaris. Ĺ estĂ˝ extenzorovĂ˝ kompartment pro hodnocenĂ­ instability/subluxace ECU a tenosynovitidy."] },
      { key: "08_Obrzek8", heading: "ObrĂˇzek 8. DorzĂˇlnĂ­ pohled, sagitĂˇlnĂ­ rovina", bullets: ["PodĂ©lnĂˇ dorzĂˇlnĂ­ projekce pĹ™es extenzorovĂ© Ĺˇlachy a radiokarpĂˇlnĂ­ kloub s hodnocenĂ­m tekutiny, zĂˇnÄ›tu a kontinuity Ĺˇlach."] },
      { key: "09_Obrzek9", heading: "ObrĂˇzek 9.", bullets: [] },
      { key: "10_Obrzek10", heading: "ObrĂˇzek 10.", bullets: [] },
      { key: "11_Obrzek11", heading: "ObrĂˇzek 11.", bullets: [] }
    ]
  },
  kycel: {
    folder: "04_Hip/protokol",
    swipeCompareImages: hipSwipeCompareImages,
    introPoints: [
      "Ultrazvuk kyÄŤle umoĹľĹuje hodnocenĂ­ mÄ›kkĂ˝ch tkĂˇnĂ­ v reĂˇlnĂ©m ÄŤase a pĹ™inĂˇĹˇĂ­ informace o kloubnĂ­m pouzdru, synovii, burzĂˇch, svalech a ĹˇlachĂˇch, zejmĂ©na flexorovĂ©ho a abduktorovĂ©ho aparĂˇtu.",
      "Pro kvalitnĂ­ vyĹˇetĹ™enĂ­ je zĂˇsadnĂ­ systematickĂ˝ postup od kostnĂ­ch orientaÄŤnĂ­ch bodĹŻ (hlavice/krÄŤek femuru, acetabulum, velkĂ˝ trochanter) a skenovĂˇnĂ­ v podĂ©lnĂ© i pĹ™Ă­ÄŤnĂ© rovinÄ› se sprĂˇvnou pracĂ­ se sondou.",
      "DynamickĂ© manĂ©vry (flexe, extenze, abdukce, addukce, rotace) pomĂˇhajĂ­ posoudit snapping fenomĂ©n, patologickĂ˝ pohyb Ĺˇlach i iritaci burz; komprese/dekomprese napomĂˇhĂˇ odliĹˇenĂ­ tekutiny od pevnĂ© tkĂˇnÄ›.",
      "NastavenĂ­ pĹ™Ă­stroje (hloubka, fokus, gain) je klĂ­ÄŤovĂ© kvĹŻli hlubĹˇĂ­m strukturĂˇm; dle oblasti je vhodnĂˇ lineĂˇrnĂ­ nebo konvexnĂ­ sonda."
    ],
    pathologyPoints: [
      "ÄŚastĂ© jsou kloubnĂ­ vĂ˝potek a synovitida v oblasti pĹ™ednĂ­ho recesu kyÄŤle.",
      "Velmi ÄŤastĂ© je postiĹľenĂ­ periartikulĂˇrnĂ­ch struktur v oblasti velkĂ©ho trochanteru, zejmĂ©na tendinopatie/parciĂˇlnĂ­ ruptury Ĺˇlach m. gluteus medius a minimus, ÄŤasto s trochanterickou burzitidou.",
      "DalĹˇĂ­ nĂˇlezy zahrnujĂ­ tendinopatii m. iliopsoas a iliopsoovou burzitidu, ÄŤasto s bolestĂ­ v tĹ™Ă­sle a snapping fenomĂ©nem.",
      "U chronickĂ˝ch potĂ­ĹľĂ­ lze nalĂ©zt entezopatie, kalcifikace, degenerativnĂ­ zmÄ›ny Ĺˇlach a zmÄ›ny echotextury svalĹŻ vÄŤetnÄ› atrofie."
    ],
    protocolSteps: [
      { view: "VentrĂˇlnĂ­ pohled", planes: ["TransverzĂˇlnĂ­ rovina", "Ĺ ikmĂˇ rovina"] },
      { view: "LaterĂˇlnĂ­ pohled", planes: ["TransverzĂˇlnĂ­ rovina", "Ĺ ikmĂˇ rovina"] },
      { view: "DorzĂˇlnĂ­ pohled", planes: ["TransverzĂˇlnĂ­ rovina", "SagitĂˇlnĂ­ rovina"] }
    ],
    protocolImages: [
      { key: "01_Obrzek1", heading: "ObrĂˇzek 1. VentrĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["T: Ĺˇlacha m. rectus femoris. ZobrazenĂ­ myotendinĂłznĂ­ho pĹ™echodu m. rectus femoris pod m. sartorius."] },
      { key: "07_Obrzek3", heading: "ObrĂˇzek 2. VentrĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["T: Ĺˇlacha m. rectus femoris, SIAI: spina iliaca anterior inferior. HodnocenĂ­ Ăşponu pĹ™Ă­mĂ© Ĺˇlachy a apofyzeĂˇlnĂ­ch/avulznĂ­ch lĂ©zĂ­."] },
      { key: "08_Obrzek4", heading: "ObrĂˇzek 3. VentrĂˇlnĂ­ pohled, ĹˇikmĂˇ rovina", bullets: ["IFL: iliofemorĂˇlnĂ­ vaz, A: acetabulum, L: labrum, RF: rectus femoris. Projekce femoroacetabulĂˇrnĂ­ho kloubu pro hodnocenĂ­ labra a vĂ˝potku."] },
      { key: "09_Obrzek5", heading: "ObrĂˇzek 4. VentrĂˇlnĂ­ pohled, ĹˇikmĂˇ rovina", bullets: ["IFL: iliofemorĂˇlnĂ­ vaz. DistĂˇlnÄ›jĹˇĂ­ ĹˇikmĂ˝ Ĺ™ez pro hodnocenĂ­ pĹ™ednĂ­ho recesu, synovitidy a pouzdra."] },
      { key: "10_Obrzek6", heading: "ObrĂˇzek 5. LaterĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["DistĂˇlnĂ­ referenÄŤnĂ­ Ĺ™ez pĹ™es femur a m. vastus lateralis, vhodnĂ˝ pro orientaci pĹ™ed proximĂˇlnĂ­m sledovĂˇnĂ­m."] },
      { key: "11_Obrzek7", heading: "ObrĂˇzek 6. LaterĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["ProximĂˇlnÄ›jĹˇĂ­ Ĺ™ez s pĹ™echodem tvaru kosti do trojĂşhelnĂ­kovĂ©ho znaku oblasti velkĂ©ho trochanteru."] },
      { key: "12_Obrzek8", heading: "ObrĂˇzek 7. LaterĂˇlnĂ­ pohled, ĹˇikmĂˇ rovina", bullets: ["TFL: tensor fasciae latae, GM: gluteus minimus. PĹ™ednĂ­ faseta trochanteru pro hodnocenĂ­ gluteĂˇlnĂ­ tendinopatie."] },
      { key: "13_Obrzek9", heading: "ObrĂˇzek 8. LaterĂˇlnĂ­ pohled, ĹˇikmĂˇ rovina", bullets: ["Detail pĹ™ednĂ­ fasety trochanteru, Ĺˇlach gluteĂˇlnĂ­ho aparĂˇtu a okolnĂ­ch mÄ›kkĂ˝ch tkĂˇnĂ­."] },
      { key: "02_Obrzek10", heading: "ObrĂˇzek 9. DorzĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["N: nervus ischiadicus. PĹ™Ă­ÄŤnĂ˝ Ĺ™ez se â€žwindmill signâ€ś mezi hamstringy pro lokalizaci sedacĂ­ho nervu."] },
      { key: "03_Obrzek11", heading: "ObrĂˇzek 10. DorzĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["T: Ĺˇlacha hamstringĹŻ. ProximĂˇlnĂ­ Ĺ™ez u tuber ischiadicum pro tendinopatii ÄŤi avulzi hamstringĹŻ."] },
      { key: "04_Obrzek12", heading: "ObrĂˇzek 11. DorzĂˇlnĂ­ pohled, sagitĂˇlnĂ­ rovina", bullets: ["PodĂ©lnĂˇ projekce sedacĂ­ho nervu s hodnocenĂ­m kontinuity, fascikulĂˇrnĂ­ struktury a pohyblivosti."] },
      { key: "05_Obrzek13", heading: "ObrĂˇzek 12. DorzĂˇlnĂ­ pohled, sagitĂˇlnĂ­ rovina", bullets: ["T: Ĺˇlacha hamstringĹŻ. PodĂ©lnĂ˝ pohled na Ăşpon hamstringĹŻ na tuber ischiadicum pro hodnocenĂ­ ruptur a tendinopatie."] },
      { key: "06_Obrzek2", heading: "ObrĂˇzek 13.", bullets: [] }
    ]
  },
  koleno: {
    folder: "05_Knee/protokol",
    swipeCompareImages: kneeSwipeCompareImages,
    introPoints: [
      "Ultrazvuk kolene je praktickĂˇ metoda pro hodnocenĂ­ mÄ›kkĂ˝ch tkĂˇnĂ­ v reĂˇlnĂ©m ÄŤase, zejmĂ©na extenzorovĂ©ho aparĂˇtu, burz, synovie a periartikulĂˇrnĂ­ch struktur.",
      "KvalitnĂ­ vyĹˇetĹ™enĂ­ vyĹľaduje systematickĂ˝ postup od orientaÄŤnĂ­ch bodĹŻ (patela, femorĂˇlnĂ­ kondyly, tibiĂˇlnĂ­ plato, tuberositas tibiae) a vyĹˇetĹ™enĂ­ v podĂ©lnĂ© i pĹ™Ă­ÄŤnĂ© rovinÄ›.",
      "DynamickĂ© manĂ©vry (flexe/extenze) umoĹľĹujĂ­ posoudit pohyb pately, stabilitu Ĺˇlach i iritaci burz, komprese/dekomprese pomĂˇhĂˇ odliĹˇit tekutinovĂ© kolekce.",
      "SprĂˇvnĂ© nastavenĂ­ hloubky, fokusu a gainu je klĂ­ÄŤovĂ©; standardnÄ› lineĂˇrnĂ­ sonda, u hlubĹˇĂ­ch struktur dle potĹ™eby i konvexnĂ­."
    ],
    pathologyPoints: [
      "NejÄŤastÄ›ji se nachĂˇzĂ­ kloubnĂ­ vĂ˝potek a synovitida, hlavnÄ› v suprapatelĂˇrnĂ­m recesu.",
      "BÄ›ĹľnĂ© je postiĹľenĂ­ Ĺˇlachy m. quadriceps femoris a ligamentum patellae (tendinopatie, parciĂˇlnĂ­ ruptury, entezopatie).",
      "ÄŚastĂ© jsou burzitidy (prepatelĂˇrnĂ­, infrapatelĂˇrnĂ­, anserinnĂ­).",
      "U chronickĂ˝ch obtĂ­ĹľĂ­ jsou pĹ™Ă­tomny degenerativnĂ­ zmÄ›ny Ĺˇlach, kalcifikace, zmÄ›ny kortikalis v Ăşponech a zmÄ›ny echotextury svalĹŻ."
    ],
    protocolSteps: [
      { view: "VentrĂˇlnĂ­ pohled", planes: ["TransverzĂˇlnĂ­ rovina", "SagitĂˇlnĂ­ rovina"] },
      { view: "MediĂˇlnĂ­ pohled", planes: ["FrontĂˇlnĂ­ rovina"] },
      { view: "LaterĂˇlnĂ­ pohled", planes: ["FrontĂˇlnĂ­ rovina"] },
      { view: "DorzĂˇlnĂ­ pohled", planes: ["TransverzĂˇlnĂ­ rovina"] }
    ],
    protocolImages: [
      { key: "01_Obrzek1", heading: "ObrĂˇzek 1. VentrĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina, suprapatelĂˇrnÄ›", bullets: ["v. lat: vastus lateralis, v. med: vastus medialis. PĹ™Ă­ÄŤnĂ˝ Ĺ™ez kvadricepsem a femurem pro orientaci a hodnocenĂ­ svalovĂ˝ch poranÄ›nĂ­."] },
      { key: "02_Obrzek2", heading: "ObrĂˇzek 2. VentrĂˇlnĂ­ pohled, sagitĂˇlnĂ­ rovina, suprapatelĂˇrnÄ›", bullets: ["spfp: suprapatelĂˇrnĂ­ tukovĂ© tÄ›leso, pffp: prefemorĂˇlnĂ­ tukovĂ© tÄ›leso, *: suprapatelĂˇrnĂ­ recessus. HodnocenĂ­ vĂ˝potku a synoviĂˇlnĂ­ proliferace."] },
      { key: "03_Obrzek3", heading: "ObrĂˇzek 3. VentrĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina, infrapatelĂˇrnÄ›", bullets: ["PĹ™Ă­ÄŤnĂ˝ Ĺ™ez patelĂˇrnĂ­ Ĺˇlachou a HoffovĂ˝m tukovĂ˝m tÄ›lesem pro tendinopatii a impingement."] },
      { key: "04_Obrzek4", heading: "ObrĂˇzek 4. VentrĂˇlnĂ­ pohled, sagitĂˇlnĂ­ rovina, infrapatelĂˇrnÄ›", bullets: ["PodĂ©lnĂ˝ Ĺ™ez ligamentum patellae od dolnĂ­ho pĂłlu pately k tibii pro ruptury a entezopatii."] },
      { key: "05_Obrzek5", heading: "ObrĂˇzek 5. MediĂˇlnĂ­ pohled, frontĂˇlnĂ­ rovina", bullets: ["MCL: mediĂˇlnĂ­ kolaterĂˇlnĂ­ vaz. HodnocenĂ­ integrity MCL, mediĂˇlnĂ­ho menisku a mediĂˇlnĂ­ho recesu."] },
      { key: "06_Obrzek6", heading: "ObrĂˇzek 6. LaterĂˇlnĂ­ pohled, frontĂˇlnĂ­ rovina", bullets: ["LCL: laterĂˇlnĂ­ kolaterĂˇlnĂ­ vaz. KlĂ­ÄŤovĂˇ projekce pro entezopatii, parciĂˇlnĂ­ ruptury a avulznĂ­ poranÄ›nĂ­."] },
      { key: "07_Obrzek7", heading: "ObrĂˇzek 7. DorzĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["ST: Ĺˇlacha semitendinosu. â€žCherry on topâ€ś znak pro orientaci mediĂˇlnĂ­ch hamstringĹŻ."] },
      { key: "08_Obrzek8", heading: "ObrĂˇzek 8. DorzĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["SM: Ĺˇlacha semimembranosu, ST: Ĺˇlacha semitendinosu. TypickĂˇ lokalizace Bakerovy cysty."] },
      { key: "09_Obrzek9", heading: "ObrĂˇzek 9. DorzĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["T: nervus tibialis, P: nervus peroneus communis. HodnocenĂ­ nervĹŻ v posterolaterĂˇlnĂ­ oblasti kolene."] }
    ]
  },
  kotnik: {
    folder: "06_Ankle/protokol",
    swipeCompareImages: ankleSwipeCompareImages,
    introPoints: [
      "Ultrazvuk hlezna je praktickĂˇ metoda pro hodnocenĂ­ mÄ›kkĂ˝ch tkĂˇnĂ­ v reĂˇlnĂ©m ÄŤase; pĹ™inĂˇĹˇĂ­ informace o synovii, vazech, burzĂˇch a ĹˇlachĂˇch (Achillova, peroneĂˇlnĂ­, tibiĂˇlnĂ­).",
      "Pro kvalitnĂ­ vyĹˇetĹ™enĂ­ je dĹŻleĹľitĂ˝ systematickĂ˝ postup od orientaÄŤnĂ­ch bodĹŻ (malleoly, talus, calcaneus, distĂˇlnĂ­ tibie/fibula) v podĂ©lnĂ© i pĹ™Ă­ÄŤnĂ© rovinÄ›.",
      "DynamickĂ© manĂ©vry (dorzĂˇlnĂ­/plantĂˇrnĂ­ flexe, inverze/everze) pomĂˇhajĂ­ hodnotit stabilitu Ĺˇlach v retinĂˇkulech, stabilitu vazĹŻ a patologickĂ˝ pohyb Ĺˇlach.",
      "SprĂˇvnĂ© nastavenĂ­ pĹ™Ă­stroje a porovnĂˇnĂ­ s druhostrannĂ˝m kotnĂ­kem je zĂˇsadnĂ­ pro detekci jemnĂ˝ch zmÄ›n, jako jsou parciĂˇlnĂ­ ruptury, tenosynovitida nebo entezopatie."
    ],
    pathologyPoints: [
      "NejÄŤastÄ›ji se vyskytuje vĂ˝potek a synovitida v pĹ™ednĂ­m recesu hlezna.",
      "ÄŚastĂ© jsou tendinopatie a parciĂˇlnĂ­ ruptury Achillovy Ĺˇlachy, Ĺˇlach tibialis anterior/posterior a peroneĂˇlnĂ­ch Ĺˇlach.",
      "BÄ›ĹľnĂ© jsou tenosynovitidy, retromaleolĂˇrnĂ­ tekutinovĂ© kolekce a burzitidy vÄŤetnÄ› retrocalcaneĂˇrnĂ­.",
      "Ultrazvuk je pĹ™Ă­nosnĂ˝ i pro poranÄ›nĂ­ vazĹŻ laterĂˇlnĂ­ho komplexu, hematomy a chronickĂ© degenerativnĂ­ zmÄ›ny."
    ],
    protocolSteps: [
      { view: "VentrĂˇlnĂ­ pohled", planes: ["SagitĂˇlnĂ­ rovina", "TransverzĂˇlnĂ­ rovina"] },
      { view: "MediĂˇlnĂ­ pohled", planes: ["TransverzĂˇlnĂ­ rovina"] },
      { view: "LaterĂˇlnĂ­ pohled", planes: ["TransverzĂˇlnĂ­ rovina"] },
      { view: "DorzĂˇlnĂ­ pohled", planes: ["SagitĂˇlnĂ­ rovina", "TransverzĂˇlnĂ­ rovina"] }
    ],
    protocolImages: [
      { key: "01_Obrzek1", heading: "ObrĂˇzek 1. VentrĂˇlnĂ­ pohled, sagitĂˇlnĂ­ rovina", bullets: ["c: chrupavka, j: tekutina v kloubnĂ­ dutinÄ›. PodĂ©lnĂˇ pĹ™ednĂ­ projekce pĹ™es EHL, pĹ™ednĂ­ recesus a chrupavku talu."] },
      { key: "02_Obrzek2", heading: "ObrĂˇzek 2. VentrĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["EDL, EHL, TA. PĹ™Ă­ÄŤnĂ˝ Ĺ™ez pĹ™ednĂ­mi extenzorovĂ˝mi Ĺˇlachami nad talem pro hodnocenĂ­ tenosynovitid a tendinopatiĂ­."] },
      { key: "03_Obrzek3", heading: "ObrĂˇzek 3. MediĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["TP, FDL, FHL, A, V, T. Projekce tarzĂˇlnĂ­ho tunelu s neurovaskulĂˇrnĂ­m svazkem a flexorovĂ˝mi Ĺˇlachami."] },
      { key: "04_Obrzek4", heading: "ObrĂˇzek 4. LaterĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["ATFL: ligamentum talofibulare anterius. KlĂ­ÄŤovĂ˝ pohled pro distorzi laterĂˇlnĂ­ho hlezna a hodnocenĂ­ kontinuity ATFL."] },
      { key: "05_Obrzek5", heading: "ObrĂˇzek 5. DorzĂˇlnĂ­ pohled, sagitĂˇlnĂ­ rovina", bullets: ["PodĂ©lnĂˇ projekce Achillovy Ĺˇlachy nad KagerovĂ˝m tukovĂ˝m tÄ›lesem pro tendinopatii a retrocalcaneĂˇrnĂ­ burzitidu."] },
      { key: "06_Obrzek6", heading: "ObrĂˇzek 6. DorzĂˇlnĂ­ pohled, sagitĂˇlnĂ­ rovina", bullets: ["ProximĂˇlnÄ›jĹˇĂ­ podĂ©lnĂˇ projekce m. triceps surae pro hodnocenĂ­ svalovĂ© symetrie, ruptur a hematomĹŻ."] },
      { key: "07_Obrzek7", heading: "ObrĂˇzek 7. DorzĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["TA: Achillova Ĺˇlacha. PĹ™Ă­ÄŤnĂ˝ Ĺ™ez Achillovou Ĺˇlachou s hodnocenĂ­m kontinuity a okolnĂ­ch mÄ›kkĂ˝ch tkĂˇnĂ­."] },
      { key: "08_Obrzek8", heading: "ObrĂˇzek 8. DorzĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: ["PĹ™Ă­ÄŤnĂ˝ pohled svaly triceps surae vhodnĂ˝ pro myotendinĂłznĂ­ poranÄ›nĂ­, atrofii a fibrotickĂ© zmÄ›ny."] },
      { key: "09_Obrzek9", heading: "ObrĂˇzek 9.", bullets: [] },
      { key: "10_Obrzek10", heading: "ObrĂˇzek 10.", bullets: [] },
      { key: "11_Obrzek11", heading: "ObrĂˇzek 11.", bullets: [] }
    ]
  }
};

const jointPositioningBySlug: Record<string, JointPositioningContent> = {
  rameno: {
    imageBaseName: "rameno",
    intro: {
      cs: "SchĂ©ma ukazuje doporuÄŤenou polohu pacienta pro zĂˇkladnĂ­ vyĹˇetĹ™enĂ­ ramene. CĂ­lem je rychlĂˇ orientace pĹ™ed samotnĂ˝m protokolem, optimĂˇlnĂ­ pĹ™Ă­stup k vyĹˇetĹ™ovanĂ˝m strukturĂˇm, stabilita bÄ›hem skenovĂˇnĂ­ a dobrĂ© pohodlĂ­ pacienta.",
      en: "The chart shows recommended patient positioning for the basic shoulder examination. The goal is quick orientation before the protocol, optimal access to target structures, stable probe handling during scanning, and patient comfort throughout the exam."
    },
    positions: {
      cs: [
        "1. ZĂˇkladnĂ­ pozice pro vyĹˇetĹ™enĂ­ ventrĂˇlnĂ­ho pohledu.",
        "2. Pozice k vyĹˇetĹ™enĂ­ m. subscapularis - ventrĂˇlnĂ­ pohled.",
        "3. Crass position - pozice k vyĹˇetĹ™enĂ­ rotĂˇtorovĂ© manĹľety - laterĂˇlnĂ­ pohled.",
        "4. Modified Crass position - pozice k vyĹˇetĹ™enĂ­ rotĂˇtorovĂ© manĹľety - laterĂˇlnĂ­ pohled.",
        "5. Pozice k vyĹˇetĹ™enĂ­ dorzĂˇlnĂ­ho pohledu."
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
      cs: "SchĂ©ma ukazuje doporuÄŤenou polohu pacienta pro vyĹˇetĹ™enĂ­ lokte. CĂ­lem je optimĂˇlnĂ­ pĹ™Ă­stup k vyĹˇetĹ™ovanĂ˝m strukturĂˇm, stabilita pĹ™i vyĹˇetĹ™enĂ­ a komfort pacienta v jednotlivĂ˝ch projekcĂ­ch.",
      en: "The chart shows recommended patient positioning for elbow ultrasound. The goal is optimal access to target structures, scan stability, and patient comfort in each view."
    },
    positions: {
      cs: [
        "VentrĂˇlnĂ­ pohled (loket lehce flektovĂˇn): hodnocenĂ­ pĹ™ednĂ­ho recesu, bicepsovĂ© Ĺˇlachy a brachialis.",
        "MediĂˇlnĂ­ pohled: vyĹˇetĹ™enĂ­ spoleÄŤnĂ©ho flexorovĂ©ho Ăşponu, MCL a oblasti n. ulnaris.",
        "LaterĂˇlnĂ­ pohled: posouzenĂ­ spoleÄŤnĂ©ho extenzorovĂ©ho Ăşponu a LCL, typicky pĹ™i laterĂˇlnĂ­ epikondylalgii.",
        "DorzĂˇlnĂ­ pohled (loket flektovĂˇn): zobrazenĂ­ tricepsu, olecranu a zadnĂ­ho recesu pĹ™i podezĹ™enĂ­ na vĂ˝potek/burzitidu."
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
      cs: "SchĂ©ma ukazuje doporuÄŤenou polohu pacienta pĹ™i vyĹˇetĹ™enĂ­ zĂˇpÄ›stĂ­. CĂ­lem je optimĂˇlnĂ­ pĹ™Ă­stup ke strukturĂˇm karpĂˇlnĂ­ oblasti, stabilita bÄ›hem skenovĂˇnĂ­ a pohodlĂ­ pacienta pĹ™i ventrĂˇlnĂ­ch i dorzĂˇlnĂ­ch projekcĂ­ch.",
      en: "The chart shows recommended patient positioning for wrist ultrasound. The goal is optimal access to carpal structures, stable scanning conditions, and patient comfort in volar and dorsal views."
    },
    positions: {
      cs: [
        "VentrĂˇlnĂ­ transverzĂˇlnĂ­ poloha: orientace v karpĂˇlnĂ­m tunelu a GuyonovÄ› kanĂˇlu, zejmĂ©na pro medianus/ulnaris.",
        "VentrĂˇlnĂ­ sagitĂˇlnĂ­ poloha: podĂ©lnĂ© sledovĂˇnĂ­ medianu a flexorovĂ˝ch Ĺˇlach.",
        "DorzĂˇlnĂ­ transverzĂˇlnĂ­ poloha: pĹ™ehled extenzorovĂ˝ch kompartmentĹŻ a tenosynovitid.",
        "DorzĂˇlnĂ­ sagitĂˇlnĂ­ poloha: hodnocenĂ­ radiokarpĂˇlnĂ­ho kloubu, tekutiny a kontinuity extenzorovĂ˝ch Ĺˇlach."
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
      cs: "SchĂ©ma ukazuje doporuÄŤenou polohu pacienta pĹ™i vyĹˇetĹ™enĂ­ kyÄŤle. CĂ­lem je optimĂˇlnĂ­ pĹ™Ă­stup i k hlubĹˇĂ­m strukturĂˇm, dobrĂˇ stabilita vyĹˇetĹ™enĂ­ a komfort pacienta bÄ›hem jednotlivĂ˝ch projekcĂ­.",
      en: "The chart shows recommended patient positioning for hip ultrasound. The goal is optimal access, including deeper structures, stable scanning, and patient comfort across views."
    },
    positions: {
      cs: [
        "VentrĂˇlnĂ­ poloha (supinace): hodnocenĂ­ pĹ™ednĂ­ho recesu, pouzdra, labra a iliopsoatickĂ© oblasti.",
        "LaterĂˇlnĂ­ poloha: zobrazenĂ­ velkĂ©ho trochanteru, gluteĂˇlnĂ­ch ĂşponĹŻ a trochanterickĂ© burzy.",
        "DorzĂˇlnĂ­ poloha: sledovĂˇnĂ­ hamstringovĂ˝ch ĂşponĹŻ a prĹŻbÄ›hu n. ischiadicus.",
        "Dynamika (rotace, flexe/extenze): uĹľiteÄŤnĂˇ pro snapping fenomĂ©ny a posouzenĂ­ drĂˇhy Ĺˇlach."
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
      cs: "SchĂ©ma ukazuje doporuÄŤenou polohu pacienta pĹ™i vyĹˇetĹ™enĂ­ kolene v extenzi i flexi. CĂ­lem je optimĂˇlnĂ­ pĹ™Ă­stup ke strukturĂˇm v jednotlivĂ˝ch oknech, stabilita vyĹˇetĹ™enĂ­ a pohodlĂ­ pacienta.",
      en: "The chart shows recommended patient positioning for knee ultrasound in extension and flexion. The goal is optimal access in each window, scan stability, and patient comfort."
    },
    positions: {
      cs: [
        "PĹ™ednĂ­ poloha (extenze): kontrola quadricepsovĂ© Ĺˇlachy, pately, patelĂˇrnĂ­ Ĺˇlachy a suprapatelĂˇrnĂ­ho recesu.",
        "PĹ™ednĂ­ poloha (flektovanĂ© koleno): zlepĹˇuje pohled na kloubnĂ­ recessy a pohyb pately.",
        "MediĂˇlnĂ­/laterĂˇlnĂ­ poloha: hodnocenĂ­ kolaterĂˇlnĂ­ch vazĹŻ, meniskĂˇlnĂ­ch okrajĹŻ a entezopatiĂ­.",
        "DorzĂˇlnĂ­ poloha: vyĹˇetĹ™enĂ­ podkolennĂ­ jamky, Bakerovy cysty a prĹŻbÄ›hu tibiĂˇlnĂ­ho/peroneĂˇlnĂ­ho nervu."
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
      cs: "SchĂ©ma ukazuje doporuÄŤenou polohu pacienta pĹ™i vyĹˇetĹ™enĂ­ kotnĂ­ku. CĂ­lem je optimĂˇlnĂ­ pĹ™Ă­stup k vyĹˇetĹ™ovanĂ˝m strukturĂˇm, stabilita pĹ™i dynamickĂ©m i statickĂ©m hodnocenĂ­ a pohodlĂ­ pacienta.",
      en: "The chart shows recommended patient positioning for ankle ultrasound. The goal is optimal access to target structures, stable static and dynamic assessment, and patient comfort."
    },
    positions: {
      cs: [
        "PĹ™ednĂ­ poloha: orientace v pĹ™ednĂ­m recesu hlezna a extenzorovĂ˝ch ĹˇlachĂˇch.",
        "MediĂˇlnĂ­ poloha: vyĹˇetĹ™enĂ­ tarzĂˇlnĂ­ho tunelu, tibialis posterior a flexorovĂ˝ch struktur.",
        "LaterĂˇlnĂ­ poloha: cĂ­lenĂ© hodnocenĂ­ ATFL/CFL a peroneĂˇlnĂ­ch Ĺˇlach pĹ™i distorzĂ­ch.",
        "DorzĂˇlnĂ­ (posteriornĂ­) poloha: zobrazenĂ­ Achillovy Ĺˇlachy, Kagerova prostoru a retrokalkaneĂˇlnĂ­ burzy."
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
  { key: "1_arm", title: { cs: "PaĹľe", en: "Arm" } },
  { key: "3_elbow", title: { cs: "Loket", en: "Elbow" } },
  { key: "4_forearm", title: { cs: "PĹ™edloktĂ­", en: "Forearm" } },
  { key: "5_wrist", title: { cs: "ZĂˇpÄ›stĂ­", en: "Wrist" } }
];
const nerveAnatomyIntroCopy = {
  cs: "PĹ™Ă­ÄŤnĂˇ anatomie je klĂ­ÄŤovĂˇ pro porozumÄ›nĂ­ sonografickĂ©mu obrazu, protoĹľe ultrazvuk zobrazuje struktury v jednotlivĂ˝ch Ĺ™ezech. NĂ­Ĺľe projdeme pÄ›t klĂ­ÄŤovĂ˝ch ĂşrovnĂ­ pĹ™Ă­ÄŤnĂ©ho Ĺ™ezu, kterĂ© budeme na nervu sledovat.",
  en: "Cross-sectional anatomy is essential for understanding ultrasound images because the probe visualizes structures in slices. Below we discuss five key cross-section levels that we will follow along the nerve."
};
const nerveAnatomyIntroAlt = {
  cs: "PĹ™ehled klĂ­ÄŤovĂ˝ch pĹ™Ă­ÄŤnĂ˝ch Ĺ™ezĹŻ",
  en: "Overview of key cross sections"
};
const nerveAnatomyFigureCaptions: Record<string, { cs: string; en: string }> = {
  "2_axilla": { cs: "Ĺez axillou", en: "Axilla section" },
  "1_arm": { cs: "Ĺez paĹľĂ­", en: "Arm section" },
  "3_elbow": { cs: "Ĺez loktem", en: "Elbow section" },
  "4_forearm": { cs: "Ĺez pĹ™edloktĂ­m", en: "Forearm section" },
  "5_wrist": { cs: "Ĺez zĂˇpÄ›stĂ­m", en: "Wrist section" }
};

const nerveUltrasoundByNerve: Record<
  string,
  {
    intro: { cs: string; en: string };
    folder?: string;
    sections: NerveUltrasoundSection[];
    swipeCompareImages?: JointProtocolCompareImage[];
  }
> = {
  "nervus-ulnaris": {
    intro: {
      cs: "NĂ­Ĺľe jsou ultrazvukovĂ© obrazy n. ulnaris vloĹľenĂ© ve stejnĂ©m pĹ™ehlednĂ©m formĂˇtu jako v ostatnĂ­ch obrazovĂ˝ch podkapitolĂˇch.",
      en: "Below are ultrasound images of the ulnar nerve arranged in the same visual format as the other image-based subsections."
    },
    sections: [
      "UN1",
      "UN2",
      "UN3",
      "UN4"
    ].map((key, index) => ({
      key,
      title: { cs: `ObrĂˇzek ${index + 1}`, en: `Figure ${index + 1}` },
      caption: {
        cs: `ObrĂˇzek ${index + 1}. UltrazvukovĂ© vyĹˇetĹ™enĂ­ n. ulnaris.`,
        en: `Figure ${index + 1}. Ulnar nerve ultrasound examination.`
      }
    }))
  }
};

const ulnarNerveSwipeCompareImages: JointProtocolCompareImage[] = Array.from({ length: 14 }, (_, index) => {
  const figureNumber = index + 1;
  const key = `${String(figureNumber).padStart(2, "0")}_Obrzek${figureNumber}`;
  return {
    key,
    baseImage: makeResponsiveImagePhone("Nerves/Ulnar nerve", `${key}_basic`),
    overlayImage: makeResponsiveImagePhone("Nerves/Ulnar nerve", key)
  };
});

const ulnarNerveUltrasoundSections: NerveUltrasoundSection[] = Array.from({ length: 14 }, (_, index) => {
  const figureNumber = index + 1;
  const key = `${String(figureNumber).padStart(2, "0")}_Obrzek${figureNumber}`;
  return {
    key,
    title: { cs: `Obrázek ${figureNumber}`, en: `Figure ${figureNumber}` },
    caption: {
      cs: `Obrázek ${figureNumber}. Ultrazvukové vyšetření n. ulnaris.`,
      en: `Figure ${figureNumber}. Ulnar nerve ultrasound examination.`
    }
  };
});

const nerveAnatomyDescriptions: Record<string, Record<string, NerveAnatomyDescription>> = {
  "nervus-medianus": {
    "2_axilla": {
      cs: "Nervus medianus leĹľĂ­ v axille obvykle anterolaterĂˇlnÄ› nebo pĹ™Ă­mo anteriornÄ› vĹŻÄŤi a. axillaris.",
      en: "In the axilla, the median nerve usually lies anterolateral or directly anterior to the axillary artery."
    },
    "1_arm": {
      cs: "V proximĂˇlnĂ­ ÄŤĂˇsti paĹľe probĂ­hĂˇ nerv laterĂˇlnÄ› od a. brachialis. Zhruba v polovinÄ› paĹľe tepnu kĹ™Ă­ĹľĂ­ z laterĂˇlnĂ­ na mediĂˇlnĂ­ stranu a distĂˇlnÄ› pokraÄŤuje mediĂˇlnÄ› od a. brachialis. Nerv leĹľĂ­ povrchnÄ›ji neĹľ tepna a je uloĹľen mezi m. biceps brachii a m. brachialis.",
      en: "In the proximal arm, the nerve runs lateral to the brachial artery. Around mid-arm it crosses the artery from lateral to medial and continues distally medial to the brachial artery. The nerve lies more superficially than the artery and sits between the biceps brachii and brachialis muscles."
    },
    "3_elbow": {
      cs: "V oblasti loketnĂ­ jamky vstupuje n. medianus mezi dvÄ› hlavy m. pronator teres. PĹ™i prĹŻchodu loktem leĹľĂ­ na povrchu m. brachialis a mediĂˇlnÄ› od Ĺˇlachy m. biceps brachii. Tato oblast je klinicky vĂ˝znamnĂˇ jako jedno z mĂ­st moĹľnĂ© komprese nervu (syndrom m. pronator teres).",
      en: "In the cubital fossa, the median nerve enters between the two heads of the pronator teres. At the elbow it lies on the surface of the brachialis and medial to the biceps brachii tendon. This region is clinically significant as a potential site of nerve compression (pronator teres syndrome)."
    },
    "4_forearm": {
      cs: "Po prĹŻchodu mezi hlavami m. pronator teres vydĂˇvĂˇ n. medianus hlubokou motorickou vÄ›tev â€“ n. interosseus anterior. Ten sestupuje po membrana interossea mezi m. flexor digitorum profundus a m. flexor pollicis longus. HlavnĂ­ kmen n. medianus pokraÄŤuje povrchnÄ›ji mezi m. flexor digitorum superficialis a m. flexor digitorum profundus. Tato vztahovĂˇ anatomie je ve stĹ™ednĂ­ tĹ™etinÄ› pĹ™edloktĂ­ velmi dobĹ™e patrnĂˇ pĹ™i sonografii.",
      en: "After passing between the heads of the pronator teres, the median nerve gives off the deep motor branch â€“ the anterior interosseous nerve. It descends along the interosseous membrane between the flexor digitorum profundus and flexor pollicis longus muscles. The main trunk continues more superficially between the flexor digitorum superficialis and flexor digitorum profundus. This relational anatomy is clearly visible on ultrasound in the mid-forearm."
    },
    "5_wrist": {
      cs: "DistĂˇlnÄ› n. medianus vystupuje zpod okraje m. flexor digitorum superficialis a vstupuje do karpĂˇlnĂ­ho tunelu. Zde probĂ­hĂˇ pod flexor retinaculum, typicky povrchnÄ› nad Ĺˇlachami flexorĹŻ prstĹŻ. V tĂ©to oblasti je nerv sonograficky snadno identifikovatelnĂ˝ a klinicky vĂ˝znamnĂ˝ jako mĂ­sto komprese pĹ™i syndromu karpĂˇlnĂ­ho tunelu.",
      en: "Distally, the median nerve emerges from beneath the edge of the flexor digitorum superficialis and enters the carpal tunnel. Here it runs under the flexor retinaculum, typically superficial to the finger flexor tendons. In this region the nerve is easily identified on ultrasound and is clinically important as the site of compression in carpal tunnel syndrome."
    }
  },
  "nervus-ulnaris": {
    "2_axilla": {
      cs: "N. ulnaris vznikĂˇ z mediĂˇlnĂ­ho svazku plexus brachialis. V axile leĹľĂ­ mediĂˇlnÄ› od a. axillaris a distĂˇlnÄ› vstupuje do mediĂˇlnĂ­ho kompartmentu paĹľe.",
      en: "The ulnar nerve arises from the medial cord of the brachial plexus. In the axilla it lies medial to the axillary artery and then enters the medial arm compartment."
    },
    "1_arm": {
      cs: "V proximĂˇlnĂ­ ÄŤĂˇsti paĹľe probĂ­hĂˇ nerv mediĂˇlnÄ› od a. brachialis. Ve stĹ™ednĂ­ tĹ™etinÄ› opouĹˇtĂ­ pĹ™ednĂ­ kompartment a pronikĂˇ pĹ™es septum intermusculare mediale do zadnĂ­ho kompartmentu, kde sestupuje k mediĂˇlnĂ­mu epikondylu.",
      en: "In the proximal arm, the nerve runs medial to the brachial artery. In the mid-arm it leaves the anterior compartment, passes through the medial intermuscular septum into the posterior compartment, and descends toward the medial epicondyle."
    },
    "3_elbow": {
      cs: "Nerv probĂ­hĂˇ za mediĂˇlnĂ­m epikondylem humeru v kubitĂˇlnĂ­m tunelu pod retinakulem. DistĂˇlnÄ› vstupuje mezi dvÄ› hlavy m. flexor carpi ulnaris. Jde o nejÄŤastÄ›jĹˇĂ­ mĂ­sto komprese â€“ syndrom kubitĂˇlnĂ­ho tunelu.",
      en: "The nerve passes behind the medial epicondyle in the cubital tunnel under the retinaculum. Distally it enters between the two heads of the flexor carpi ulnaris. This is the most common compression site â€“ cubital tunnel syndrome."
    },
    "4_forearm": {
      cs: "Na pĹ™edloktĂ­ sestupuje n. ulnaris mezi m. flexor carpi ulnaris a m. flexor digitorum profundus. ProximĂˇlnÄ› vydĂˇvĂˇ hlubokĂ© vÄ›tve pro FCU a ulnĂˇrnĂ­ ÄŤĂˇst FDP. Ve stĹ™ednĂ­ a distĂˇlnĂ­ tĹ™etinÄ› bÄ›ĹľĂ­ spoleÄŤnÄ› s a. ulnaris, obvykle mediĂˇlnÄ› od nĂ­.",
      en: "In the forearm, the ulnar nerve descends between the flexor carpi ulnaris and flexor digitorum profundus. Proximally it gives deep branches to FCU and the ulnar part of FDP. In the mid and distal forearm it runs with the ulnar artery, usually medial to it."
    },
    "5_wrist": {
      cs: "V oblasti zĂˇpÄ›stĂ­ probĂ­hĂˇ n. ulnaris povrchovÄ› od flexor retinaculum a vstupuje do Guyonova kanĂˇlu, kde se dÄ›lĂ­ na povrchovou senzitivnĂ­ a hlubokou motorickou vÄ›tev. Komprese v tĂ©to oblasti vede k syndromu Guyonova kanĂˇlu.",
      en: "At the wrist, the ulnar nerve runs superficial to the flexor retinaculum and enters Guyonâ€™s canal, where it divides into a superficial sensory and a deep motor branch. Compression here leads to Guyonâ€™s canal syndrome."
    }
  },
  "nervus-radialis": {
    "2_axilla": {
      cs: "N. radialis vznikĂˇ ze zadnĂ­ho svazku plexus brachialis. V axile leĹľĂ­ posteriornÄ› od a. axillaris a vstupuje do zadnĂ­ho kompartmentu paĹľe.",
      en: "The radial nerve arises from the posterior cord of the brachial plexus. In the axilla it lies posterior to the axillary artery and enters the posterior arm compartment."
    },
    "1_arm": {
      cs: "Nerv vstupuje do sulcus nervi radialis na humeru, kde probĂ­hĂˇ spoleÄŤnÄ› s a. profunda brachii mezi hlavami m. triceps brachii. V distĂˇlnĂ­ ÄŤĂˇsti paĹľe prorĂˇĹľĂ­ septum intermusculare laterale a pĹ™echĂˇzĂ­ do pĹ™ednĂ­ho kompartmentu.",
      en: "The nerve enters the radial groove of the humerus, running with the profunda brachii artery between the heads of the triceps brachii. In the distal arm it pierces the lateral intermuscular septum and moves into the anterior compartment."
    },
    "3_elbow": {
      cs: "V loketnĂ­ jamce probĂ­hĂˇ nerv mezi m. brachialis a m. brachioradialis a dÄ›lĂ­ se na povrchovou senzitivnĂ­ a hlubokou motorickou vÄ›tev â€“ n. interosseus posterior.",
      en: "In the cubital fossa the nerve runs between the brachialis and brachioradialis muscles and divides into a superficial sensory branch and a deep motor branch â€“ the posterior interosseous nerve."
    },
    "4_forearm": {
      cs: "HlubokĂˇ vÄ›tev vstupuje do m. supinator pod vazivovĂ˝m obloukem (Arcade of Frohse), coĹľ je nejÄŤastÄ›jĹˇĂ­ mĂ­sto komprese, a distĂˇlnÄ› pokraÄŤuje jako n. interosseus posterior v zadnĂ­m kompartmentu. PovrchovĂˇ vÄ›tev pokraÄŤuje distĂˇlnÄ› pod m. brachioradialis spoleÄŤnÄ› s a. radialis.",
      en: "The deep branch enters the supinator under the fibrous arch (Arcade of Frohse), the most common compression site, and continues distally as the posterior interosseous nerve in the posterior compartment. The superficial branch continues distally beneath the brachioradialis with the radial artery."
    },
    "5_wrist": {
      cs: "PovrchovĂˇ vÄ›tev n. radialis vystupuje mezi Ĺˇlachami m. brachioradialis a m. extensor carpi radialis longus, kde se stĂˇvĂˇ subkutĂˇnnĂ­, a distĂˇlnÄ› se vÄ›tvĂ­ pro dorzum ruky. V tĂ©to oblasti mĹŻĹľe dojĂ­t ke kompresi znĂˇmĂ© jako WartenbergĹŻv syndrom.",
      en: "The superficial radial branch emerges between the tendons of the brachioradialis and extensor carpi radialis longus, becomes subcutaneous, and then branches to the dorsum of the hand. Compression here is known as Wartenberg syndrome."
    }
  }
};

const motorInnervationByNerve: Record<string, { cs: string[]; en: string[] }> = {
  "nervus-medianus": {
    cs: [
      "PĹ™edloktĂ­: m. pronator teres, m. flexor carpi radialis, m. palmaris longus, m. flexor digitorum superficialis.",
      "N. interosseus anterior: m. flexor pollicis longus, m. pronator quadratus, radiĂˇlnĂ­ polovina m. flexor digitorum profundus (prsty IIâ€“III).",
      "Ruka (thenar): m. abductor pollicis brevis, m. opponens pollicis, m. flexor pollicis brevis (caput superficiale).",
      "Ruka: mm. lumbricales Iâ€“II."
    ],
    en: [
      "Forearm: pronator teres, flexor carpi radialis, palmaris longus, flexor digitorum superficialis.",
      "Anterior interosseous nerve: flexor pollicis longus, pronator quadratus, radial half of flexor digitorum profundus (digits IIâ€“III).",
      "Hand (thenar): abductor pollicis brevis, opponens pollicis, flexor pollicis brevis (superficial head).",
      "Hand: lumbricals Iâ€“II."
    ]
  },
  "nervus-ulnaris": {
    cs: [
      "PĹ™edloktĂ­: m. flexor carpi ulnaris, ulnĂˇrnĂ­ polovina m. flexor digitorum profundus (prsty IVâ€“V).",
      "Ruka (hypothenar): m. abductor digiti minimi, m. flexor digiti minimi brevis, m. opponens digiti minimi, m. palmaris brevis.",
      "Ruka: mm. interossei palmares et dorsales, mm. lumbricales IIIâ€“IV.",
      "Ruka: m. adductor pollicis, hlubokĂˇ hlava m. flexor pollicis brevis."
    ],
    en: [
      "Forearm: flexor carpi ulnaris, ulnar half of flexor digitorum profundus (digits IVâ€“V).",
      "Hand (hypothenar): abductor digiti minimi, flexor digiti minimi brevis, opponens digiti minimi, palmaris brevis.",
      "Hand: palmar and dorsal interossei, lumbricals IIIâ€“IV.",
      "Hand: adductor pollicis, deep head of flexor pollicis brevis."
    ]
  },
  "nervus-radialis": {
    cs: [
      "PaĹľe: m. triceps brachii, m. anconeus.",
      "PĹ™edloktĂ­ (n. radialis a n. interosseus posterior): m. brachioradialis, m. extensor carpi radialis longus et brevis, m. supinator.",
      "PĹ™edloktĂ­: m. extensor digitorum, m. extensor digiti minimi, m. extensor carpi ulnaris.",
      "PĹ™edloktĂ­: m. abductor pollicis longus, m. extensor pollicis brevis, m. extensor pollicis longus, m. extensor indicis."
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
      "KyÄŤel a stehno: m. iliacus, m. pectineus (ÄŤĂˇsteÄŤnÄ›), m. sartorius.",
      "Quadriceps femoris: m. rectus femoris, m. vastus medialis, m. vastus lateralis, m. vastus intermedius.",
      "PĹ™idruĹľenÄ›: m. articularis genus."
    ],
    en: [
      "Hip and thigh: iliacus, pectineus (partial), sartorius.",
      "Quadriceps femoris: rectus femoris, vastus medialis, vastus lateralis, vastus intermedius.",
      "Associated: articularis genus."
    ]
  },
  "nervus-ischiadicus": {
    cs: [
      "ZadnĂ­ skupina stehna: m. semitendinosus, m. semimembranosus, m. biceps femoris (caput longum).",
      "IschiokrurĂˇlnĂ­ ÄŤĂˇst m. adductor magnus.",
      "Caput breve m. biceps femoris pĹ™es n. peroneus communis."
    ],
    en: [
      "Posterior thigh: semitendinosus, semimembranosus, biceps femoris (long head).",
      "Hamstring part of adductor magnus.",
      "Short head of biceps femoris via the common peroneal division."
    ]
  },
  "nervus-tibialis": {
    cs: [
      "BĂ©rec (zadnĂ­ kompartment): m. gastrocnemius, m. soleus, m. plantaris, m. popliteus.",
      "BĂ©rec (hlubokĂˇ vrstva): m. tibialis posterior, m. flexor digitorum longus, m. flexor hallucis longus.",
      "Noha (plantĂˇrnĂ­ svaly pĹ™es n. plantaris medialis et lateralis): m. abductor hallucis, m. flexor digitorum brevis, m. flexor hallucis brevis, m. quadratus plantae, mm. lumbricales, mm. interossei, m. adductor hallucis, m. abductor digiti minimi, m. flexor digiti minimi brevis."
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
      "BĂ©rec (n. peroneus profundus): m. tibialis anterior, m. extensor hallucis longus, m. extensor digitorum longus, m. peroneus tertius.",
      "BĂ©rec (n. peroneus superficialis): m. peroneus longus, m. peroneus brevis.",
      "HĹ™bet nohy (n. peroneus profundus): m. extensor digitorum brevis, m. extensor hallucis brevis."
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
        description: "vazivovĂ˝ pruh u suprakondylĂˇrnĂ­ho vĂ˝bÄ›Ĺľku humeru, proximĂˇlnĂ­ Ăştlak n. medianus."
      },
      {
        title: "Lacertus fibrosus",
        description: "aponeurĂłza m. biceps brachii v loketnĂ­ jamce, mĹŻĹľe utlaÄŤovat nerv."
      },
      { title: "M. pronator teres", description: "prĹŻchod mezi dvÄ›ma hlavami, typickĂ© mĂ­sto pronator syndromu." },
      {
        title: "Arcade of FDS",
        description: "vazivovĂ˝ oblouk m. flexor digitorum superficialis mezi mediĂˇlnĂ­m epikondylem a radiem."
      },
      {
        title: "GantzerĹŻv sval",
        description: "akcesornĂ­ hlava m. flexor pollicis longus, mĹŻĹľe utlaÄŤit n. interosseus anterior."
      },
      {
        title: "AINS (Kilohâ€‘Nevin)",
        description: "neuropatie n. interosseus anterior se slabostĂ­ flexe palce a ukazovĂˇku."
      },
      { title: "KarpĂˇlnĂ­ tunel", description: "prĹŻbÄ›h pod flexor retinaculum, nejÄŤastÄ›jĹˇĂ­ distĂˇlnĂ­ Ăştlak." }
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
        title: "AINS (Kilohâ€‘Nevin)",
        description: "anterior interosseous neuropathy with weak thumb and index flexion."
      },
      { title: "Carpal tunnel", description: "course under the flexor retinaculum, most common distal compression." }
    ]
  },
  "nervus-ulnaris": {
    cs: [
      {
        title: "MediĂˇlnĂ­ intermusculĂˇrnĂ­ septum",
        description: "prĹŻchod do zadnĂ­ho kompartmentu paĹľe, moĹľnost Ăştlaku."
      },
      {
        title: "Struthersova arkĂˇda",
        description: "vazivovĂ˝ pruh mezi mediĂˇlnĂ­ hlavou tricepsu a septem."
      },
      {
        title: "OsbornĹŻv ligament",
        description: "strop kubitĂˇlnĂ­ho tunelu za mediĂˇlnĂ­m epikondylem."
      },
      {
        title: "Arcade of Osborne",
        description: "fibrotickĂ˝ oblouk v kubitĂˇlnĂ­m tunelu, ÄŤastĂ© mĂ­sto komprese."
      },
      {
        title: "Mezi dvÄ›ma hlavami m. flexor carpi ulnaris",
        description: "vstup nervu do pĹ™edloktĂ­."
      },
      {
        title: "GuyonĹŻv kanĂˇl",
        description: "komprese v zĂˇpÄ›stĂ­ s poruchou senzitivity ÄŤi motoriky ruky."
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
        title: "Sulcus nervi radialis (spirĂˇlnĂ­ ĹľlĂˇbek)",
        description: "Ăştlak pĹ™i frakturĂˇch humeru ÄŤi tlaku."
      },
      {
        title: "LaterĂˇlnĂ­ intermusculĂˇrnĂ­ septum",
        description: "prĹŻchod do pĹ™ednĂ­ho kompartmentu paĹľe."
      },
      {
        title: "Arcade of Frohse",
        description: "vazivovĂ˝ oblouk supinĂˇtoru, nejÄŤastÄ›jĹˇĂ­ mĂ­sto Ăştlaku hlubokĂ© vÄ›tve."
      },
      {
        title: "Supinator tunnel (radial tunnel)",
        description: "komprese hlubokĂ© vÄ›tve v supinĂˇtoru."
      },
      {
        title: "Fascie m. brachioradialis a m. extensor carpi radialis longus",
        description: "Ăştlak povrchovĂ© vÄ›tve, WartenbergĹŻv syndrom."
      },
      { title: "KĹ™Ă­ĹľenĂ­ s v. cephalica", description: "iritace/Ăştlak pĹ™i kanylace ÄŤi katĂ©tru." }
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
      "DlaĹ: radiĂˇlnĂ­ polovina dlanÄ›.",
      "Prsty: palmar Iâ€“III a radiĂˇlnĂ­ polovina IV. prstu.",
      "HĹ™bet prstĹŻ: distĂˇlnĂ­ ÄŤlĂˇnky Iâ€“III a radiĂˇlnĂ­ polovina IV. prstu."
    ],
    en: [
      "Palm: radial half of the palm.",
      "Digits: palmar Iâ€“III and radial half of digit IV.",
      "Dorsal digits: distal phalanges of Iâ€“III and radial half of digit IV."
    ]
  },
  "nervus-ulnaris": {
    cs: [
      "DlaĹ: ulnĂˇrnĂ­ ÄŤĂˇst dlanÄ›.",
      "Prsty: palmar i dorsĂˇlnĂ­ V. a ulnĂˇrnĂ­ polovina IV. prstu.",
      "HĹ™bet ruky: ulnĂˇrnĂ­ ÄŤĂˇst hĹ™betu ruky."
    ],
    en: [
      "Palm: ulnar part of the palm.",
      "Digits: palmar and dorsal digit V and ulnar half of digit IV.",
      "Dorsum of hand: ulnar aspect of the dorsum."
    ]
  },
  "nervus-radialis": {
    cs: [
      "PaĹľe a pĹ™edloktĂ­: dorzĂˇlnĂ­/laterĂˇlnĂ­ ÄŤĂˇst.",
      "HĹ™bet ruky: radiĂˇlnĂ­ ÄŤĂˇst hĹ™betu ruky.",
      "Prsty: dorzĂˇlnĂ­ proximĂˇlnĂ­ ÄŤĂˇsti Iâ€“III a radiĂˇlnĂ­ polovina IV. prstu (bez bĹ™Ă­Ĺˇek)."
    ],
    en: [
      "Arm and forearm: posterior/lateral skin.",
      "Dorsum of hand: radial aspect of the dorsum.",
      "Digits: dorsal proximal parts of Iâ€“III and radial half of digit IV (not the fingertips)."
    ]
  },
  "nervus-femoralis": {
    cs: [
      "PĹ™ednĂ­ strana stehna (rr. cutanei anteriores).",
      "MediĂˇlnĂ­ bĂ©rec a mediĂˇlnĂ­ okraj nohy pĹ™es n. saphenus."
    ],
    en: [
      "Anterior thigh (anterior cutaneous branches).",
      "Medial leg and medial foot via the saphenous nerve."
    ]
  },
  "nervus-ischiadicus": {
    cs: [
      "PĹ™Ă­mĂˇ koĹľnĂ­ inervace nenĂ­ typickĂˇ.",
      "SenzitivnĂ­ oblast zajiĹˇĹĄujĂ­ jeho vÄ›tve: n. tibialis a n. peroneus communis (bĂ©rce a nohy)."
    ],
    en: [
      "No typical direct cutaneous territory.",
      "Sensory territory is via its divisions: tibial and common peroneal nerves (leg and foot)."
    ]
  },
  "nervus-tibialis": {
    cs: [
      "BĂ©rec: posterolaterĂˇlnĂ­ ÄŤĂˇst pĹ™es n. suralis (spoluĂşÄŤast n. peroneus communis).",
      "Pata: rr. calcanei mediales.",
      "Planta nohy: n. plantaris medialis et lateralis (vÄ›tĹˇina plosky)."
    ],
    en: [
      "Leg: posterolateral skin via sural nerve (with common peroneal contribution).",
      "Heel: medial calcaneal branches.",
      "Plantar foot: medial and lateral plantar nerves (most of the sole)."
    ]
  },
  "nervus-peroneus-communis": {
    cs: [
      "LaterĂˇlnĂ­ bĂ©rec: n. peroneus superficialis.",
      "Dorzum nohy: n. peroneus superficialis (vÄ›tĹˇina hĹ™betu).",
      "PrvnĂ­ meziprstnĂ­ prostor: n. peroneus profundus.",
      "LaterĂˇlnĂ­ okraj nohy: pĹ™es n. suralis (spoluĂşÄŤast n. tibialis)."
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
      cs: "SenzitivnĂ­ inervace nervus medianus",
      en: "Median nerve sensory innervation"
    }
  },
  "nervus-ulnaris": {
    baseName: "Ulnar_senzory",
    alt: {
      cs: "SenzitivnĂ­ inervace nervus ulnaris",
      en: "Ulnar nerve sensory innervation"
    }
  },
  "nervus-radialis": {
    baseName: "Radial_senzory",
    alt: {
      cs: "SenzitivnĂ­ inervace nervus radialis",
      en: "Radial nerve sensory innervation"
    }
  }
};

const nerveAnatomyAbbreviations: Record<string, { cs: string[]; en: string[] }> = {
  "2_axilla": {
    cs: [
      "D â€“ m. deltoideus",
      "PM â€“ m. pectoralis major",
      "LHBB â€“ caput longum m. biceps brachii",
      "SHBB â€“ caput breve m. biceps brachii",
      "CB â€“ m. coracobrachialis",
      "mc â€“ n. musculocutaneus",
      "M â€“ n. medianus",
      "U â€“ n. ulnaris",
      "R â€“ n. radialis",
      "Tmaj â€“ m. teres major",
      "TLa â€“ caput laterale m. triceps brachii",
      "TLo â€“ caput longum m. triceps brachii",
      "H â€“ humerus"
    ],
    en: [
      "D â€“ deltoid muscle",
      "PM â€“ pectoralis major",
      "LHBB â€“ long head of the biceps brachii",
      "SHBB â€“ short head of the biceps brachii",
      "CB â€“ coracobrachialis muscle",
      "mc â€“ musculocutaneous nerve",
      "M â€“ median nerve",
      "U â€“ ulnar nerve",
      "R â€“ radial nerve",
      "Tmaj â€“ teres major muscle",
      "TLa â€“ lateral head of the triceps brachii",
      "TLo â€“ long head of the triceps brachii",
      "H â€“ humerus"
    ]
  },
  "1_arm": {
    cs: [
      "B â€“ m. biceps brachii",
      "Br â€“ m. brachialis",
      "CB â€“ m. coracobrachialis",
      "H â€“ humerus",
      "TLa â€“ caput laterale m. triceps brachii",
      "TM â€“ caput mediale m. triceps brachii",
      "TLo â€“ caput longum m. triceps brachii",
      "R â€“ n. radialis",
      "M â€“ n. medianus",
      "U â€“ n. ulnaris"
    ],
    en: [
      "B â€“ biceps brachii muscle",
      "Br â€“ brachialis muscle",
      "CB â€“ coracobrachialis muscle",
      "H â€“ humerus",
      "TLa â€“ lateral head of the triceps brachii",
      "TM â€“ medial head of the triceps brachii",
      "TLo â€“ long head of the triceps brachii",
      "R â€“ radial nerve",
      "M â€“ median nerve",
      "U â€“ ulnar nerve"
    ]
  },
  "3_elbow": {
    cs: [
      "Br â€“ m. brachioradialis",
      "ECRL â€“ m. extensor carpi radialis longus",
      "ECRB â€“ m. extensor carpi radialis brevis",
      "B â€“ Ĺˇlacha m. biceps brachii",
      "S â€“ r. superficialis n. radialis",
      "P â€“ r. profundus n. radialis (n. interosseus posterior)",
      "M â€“ n. medianus",
      "PT â€“ m. pronator teres",
      "U â€“ n. ulnaris",
      "FCU â€“ m. flexor carpi ulnaris",
      "A â€“ m. anconeus"
    ],
    en: [
      "Br â€“ brachioradialis muscle",
      "ECRL â€“ extensor carpi radialis longus",
      "ECRB â€“ extensor carpi radialis brevis",
      "B â€“ biceps brachii tendon",
      "S â€“ superficial branch of the radial nerve",
      "P â€“ deep branch of the radial nerve (posterior interosseous nerve)",
      "M â€“ median nerve",
      "PT â€“ pronator teres muscle",
      "U â€“ ulnar nerve",
      "FCU â€“ flexor carpi ulnaris",
      "A â€“ anconeus muscle"
    ]
  },
  "4_forearm": {
    cs: [
      "Br â€“ m. brachioradialis",
      "ECRL â€“ m. extensor carpi radialis longus",
      "ECRB â€“ m. extensor carpi radialis brevis",
      "EDC â€“ m. extensor digitorum communis",
      "EDM â€“ m. extensor digiti minimi",
      "ECU â€“ m. extensor carpi ulnaris",
      "AbPL â€“ m. abductor pollicis longus",
      "EPB â€“ m. extensor pollicis brevis",
      "EPL â€“ m. extensor pollicis longus",
      "FCR â€“ m. flexor carpi radialis",
      "PL â€“ m. palmaris longus",
      "FDS â€“ m. flexor digitorum superficialis",
      "FPL â€“ m. flexor pollicis longus",
      "FDP â€“ m. flexor digitorum profundus",
      "FCU â€“ m. flexor carpi ulnaris",
      "M â€“ n. medianus",
      "U (nerv) â€“ n. ulnaris",
      "Rs â€“ r. superficialis n. radialis",
      "Rp â€“ r. profundus n. radialis (n. interosseus posterior)",
      "AIN â€“ n. interosseus anterior",
      "R â€“ radius",
      "U (kost) â€“ ulna"
    ],
    en: [
      "Br â€“ brachioradialis muscle",
      "ECRL â€“ extensor carpi radialis longus",
      "ECRB â€“ extensor carpi radialis brevis",
      "EDC â€“ extensor digitorum communis",
      "EDM â€“ extensor digiti minimi",
      "ECU â€“ extensor carpi ulnaris",
      "AbPL â€“ abductor pollicis longus",
      "EPB â€“ extensor pollicis brevis",
      "EPL â€“ extensor pollicis longus",
      "FCR â€“ flexor carpi radialis",
      "PL â€“ palmaris longus",
      "FDS â€“ flexor digitorum superficialis",
      "FPL â€“ flexor pollicis longus",
      "FDP â€“ flexor digitorum profundus",
      "FCU â€“ flexor carpi ulnaris",
      "M â€“ median nerve",
      "U (nerve) â€“ ulnar nerve",
      "Rs â€“ superficial branch of the radial nerve",
      "Rp â€“ deep branch of the radial nerve (posterior interosseous nerve)",
      "AIN â€“ anterior interosseous nerve",
      "R â€“ radius",
      "U (bone) â€“ ulna"
    ]
  },
  "5_wrist": {
    cs: [
      "FCR â€“ m. flexor carpi radialis",
      "M â€“ n. medianus",
      "U â€“ n. ulnaris",
      "P â€“ os pisiforme",
      "H â€“ os hamatum",
      "C â€“ os capitatum",
      "S â€“ os scaphoideum"
    ],
    en: [
      "FCR â€“ flexor carpi radialis",
      "M â€“ median nerve",
      "U â€“ ulnar nerve",
      "P â€“ pisiform",
      "H â€“ hamate",
      "C â€“ capitate",
      "S â€“ scaphoid"
    ]
  }
};

const jointProtocolExtraBullets: Record<string, Record<string, string[]>> = {
  loket: {
    "01_01": [
      "PĹ™ednĂ­ pĹ™Ă­ÄŤnĂ˝ Ĺ™ez loktem ukazuje distĂˇlnĂ­ epifĂ˝zu humeru s vrstvou kloubnĂ­ chrupavky.",
      "V projekci jsou souÄŤasnÄ› dobĹ™e patrnĂ© neurovaskulĂˇrnĂ­ struktury a okolnĂ­ svalovĂ© skupiny."
    ],
    "02_02": [
      "PodĂ©lnĂˇ radiĂˇlnĂ­ projekce zobrazuje radiohumerĂˇlnĂ­ skloubenĂ­, radiĂˇlnĂ­ jamku a pĹ™ednĂ­ recesus.",
      "Je vhodnĂˇ pro detekci kloubnĂ­ tekutiny a synovitickĂ˝ch zmÄ›n."
    ],
    "03_03": [
      "PodĂ©lnĂˇ ulnĂˇrnĂ­ projekce zobrazuje humeroulnĂˇrnĂ­ skloubenĂ­, fossa coronoidea a pĹ™ednĂ­ synoviĂˇlnĂ­ recesus.",
      "DoplĹuje ventrĂˇlnĂ­ hodnocenĂ­ o ulnĂˇrnĂ­ ÄŤĂˇst kloubu."
    ],
    "04_04": [
      "Sonda je vedena v dlouhĂ© ose flexorovÄ›-pronĂˇtorovĂ© skupiny nad mediĂˇlnĂ­m epikondylem.",
      "KlĂ­ÄŤovĂ˝ pohled pro mediĂˇlnĂ­ epikondylitidu, ĂşponovĂ© zmÄ›ny a hodnocenĂ­ MCL."
    ],
    "01_05": [
      "Sonda sleduje extenzorovĂ˝ aparĂˇt v dlouhĂ© ose od laterĂˇlnĂ­ho epikondylu.",
      "Projekce je zĂˇsadnĂ­ pro diagnostiku laterĂˇlnĂ­ epikondylitidy a poranÄ›nĂ­ CET."
    ],
    "02_06": [
      "ZadnĂ­ podĂ©lnĂˇ projekce pĹ™es olecranon a tricepsovou Ĺˇlachu hodnotĂ­ zadnĂ­ recesus.",
      "VhodnĂˇ pro vĂ˝potek, burzitidu i poranÄ›nĂ­ Ĺˇlachy m. triceps brachii."
    ]
  },
  zapesti: {
    "01_Obrzek1_v2": [
      "KlĂ­ÄŤovĂ© orientaÄŤnĂ­ body tvoĹ™Ă­ os pisiforme (ulnĂˇrnÄ›) a os scaphoideum (radiĂˇlnÄ›).",
      "Projekce je zĂˇsadnĂ­ pro kompresi nervĹŻ, tenosynovitidu a gangliovĂ© cysty."
    ],
    "02_Obrzek2": [
      "Nerv je sledovĂˇn proximĂˇlnÄ› z karpĂˇlnĂ­ho tunelu do distĂˇlnĂ­ho pĹ™edloktĂ­ mezi FDS a FDP.",
      "V tĂ©to Ăşrovni mĂˇ typickĂ˝ fascikulĂˇrnĂ­ (â€žvoĹˇtinovĂ˝â€ś) vzor."
    ],
    "03_Obrzek3": [
      "PodĂ©lnÄ› je n. medianus patrnĂ˝ jako pruhovitĂˇ struktura s paralelnĂ­mi echogennĂ­mi liniemi.",
      "HodnotĂ­ se kontinuita a zmÄ›ny prĹŻbÄ›hu pĹ™i vstupu do karpĂˇlnĂ­ho tunelu."
    ],
    "04_Obrzek4": [
      "Na Ăşrovni distĂˇlnĂ­ho radia lze zobrazit vĹˇech Ĺˇest extenzorovĂ˝ch kompartmentĹŻ.",
      "Pohled je dĹŻleĹľitĂ˝ pro tenosynovitidy, subluxace a degenerativnĂ­ zmÄ›ny Ĺˇlach."
    ],
    "05_Obrzek5": [
      "DruhĂ˝ extenzorovĂ˝ kompartment leĹľĂ­ laterĂˇlnÄ› od Listerova hrbolku.",
      "Obsahuje ECRL a ECRB a je ÄŤastĂ˝m mĂ­stem pĹ™etĂ­ĹľenĂ­."
    ],
    "06_Obrzek6": [
      "PrvnĂ­ extenzorovĂ˝ kompartment obsahuje APL a EPB ve spoleÄŤnĂ© pochvÄ›.",
      "TypickĂˇ projekce pro De Quervainovu tenosynovitidu."
    ],
    "07_Obrzek7": [
      "Ĺ estĂ˝ extenzorovĂ˝ kompartment nad ulnou obsahuje Ĺˇlachu ECU.",
      "VhodnĂ© pro hodnocenĂ­ tenosynovitidy, instability a subluxace ECU."
    ],
    "08_Obrzek8": [
      "PodĂ©lnĂˇ dorzĂˇlnĂ­ projekce pĹ™es extenzorovĂ© Ĺˇlachy a radiokarpĂˇlnĂ­ kloub.",
      "UmoĹľnĂ­ detekovat vĂ˝potek, zĂˇnÄ›t i poruchu kontinuity Ĺˇlach."
    ]
  },
  kycel: {
    "01_Obrzek1": [
      "PovrchovÄ› je patrnĂ˝ m. sartorius, pod nĂ­m m. rectus femoris s centrĂˇlnĂ­ Ĺˇlachou.",
      "VhodnĂ© pro hodnocenĂ­ myotendinĂłznĂ­ho pĹ™echodu a pĹ™etĂ­ĹľenĂ­ m. rectus femoris."
    ],
    "07_Obrzek3": [
      "Jde o mapovĂˇnĂ­ popisu obrĂˇzku 2 na dalĹˇĂ­ pouĹľitĂ˝ snĂ­mek podle poĹľadovanĂ©ho posunu.",
      "HodnotĂ­ se Ăşpon pĹ™Ă­mĂ© Ĺˇlachy na SIAI a moĹľnĂ© avulznĂ­/apofyzeĂˇlnĂ­ lĂ©ze."
    ],
    "08_Obrzek4": [
      "Ĺ ikmĂˇ ventrĂˇlnĂ­ projekce zobrazuje femoroacetabulĂˇrnĂ­ kloub a acetabulĂˇrnĂ­ labrum.",
      "DĹŻleĹľitĂˇ pro vĂ˝potek, degeneraci labra a impingement."
    ],
    "09_Obrzek5": [
      "DistĂˇlnÄ›jĹˇĂ­ ĹˇikmĂ˝ Ĺ™ez pĹ™es pĹ™ednĂ­ pouzdro a recesus kyÄŤle.",
      "VhodnĂ˝ pro synovitidu, vĂ˝potek a hodnocenĂ­ iliofemorĂˇlnĂ­ho vazu."
    ],
    "10_Obrzek6": [
      "DistĂˇlnĂ­ laterĂˇlnĂ­ referenÄŤnĂ­ Ĺ™ez pĹ™es m. vastus lateralis a kortikalis femuru.",
      "SlouĹľĂ­ k orientaci pĹ™ed proximĂˇlnĂ­m posunem k velkĂ©mu trochanteru."
    ],
    "11_Obrzek7": [
      "PĹ™i proximĂˇlnĂ­m posunu se tvar kosti mÄ›nĂ­ na trojĂşhelnĂ­kovĂ˝ znak oblasti trochanteru.",
      "PomĂˇhĂˇ sprĂˇvnÄ› lokalizovat trochanterickou oblast."
    ],
    "12_Obrzek8": [
      "Ĺ ikmĂˇ laterĂˇlnĂ­ projekce na pĹ™ednĂ­ fasetu velkĂ©ho trochanteru.",
      "HodnotĂ­ Ĺˇlachu m. gluteus minimus a zmÄ›ny typu tendinopatie."
    ],
    "13_Obrzek9": [
      "Detail trochanterickĂ© oblasti vhodnĂ˝ pro gluteĂˇlnĂ­ Ĺˇlachy a okolnĂ­ mÄ›kkĂ© tkĂˇnÄ›.",
      "UĹľiteÄŤnĂ˝ pĹ™i laterĂˇlnĂ­ bolesti kyÄŤle."
    ],
    "02_Obrzek10": [
      "PĹ™Ă­ÄŤnĂ˝ dorzĂˇlnĂ­ Ĺ™ez se â€žwindmill signâ€ś pro lokalizaci n. ischiadicus.",
      "Nerv je hodnocen mezi hamstringy s dnem tvoĹ™enĂ˝m m. adductor magnus."
    ],
    "03_Obrzek11": [
      "ProximĂˇlnÄ›jĹˇĂ­ Ĺ™ez pĹ™es tuber ischiadicum a spoleÄŤnĂ˝ Ăşpon hamstringĹŻ.",
      "DĹŻleĹľitĂ˝ pro tendinopatii, parciĂˇlnĂ­ ruptury a avulznĂ­ poranÄ›nĂ­."
    ],
    "04_Obrzek12": [
      "PodĂ©lnĂˇ projekce sedacĂ­ho nervu s fascikulĂˇrnĂ­ strukturou mezi svaly zadnĂ­ho stehna.",
      "VhodnĂˇ pro kontinuity nervu a patologickĂ© zmÄ›ny."
    ],
    "05_Obrzek13": [
      "PodĂ©lnĂ˝ pohled na Ăşpon hamstringĹŻ na tuber ischiadicum.",
      "KlĂ­ÄŤovĂ˝ pro detekci tendinopatie, parciĂˇlnĂ­ch ruptur i kompletnĂ­ch avulzĂ­."
    ]
  },
  koleno: {
    "01_Obrzek1": [
      "PĹ™Ă­ÄŤnĂ˝ suprapatelĂˇrnĂ­ Ĺ™ez kvadricepsem nad femurem slouĹľĂ­ jako orientaÄŤnĂ­ start vyĹˇetĹ™enĂ­.",
      "VhodnĂ˝ pro hodnocenĂ­ svalovĂ© struktury a poranÄ›nĂ­."
    ],
    "02_Obrzek2": [
      "PodĂ©lnĂ˝ suprapatelĂˇrnĂ­ Ĺ™ez pĹ™es Ĺˇlachu kvadricepsu a suprapatelĂˇrnĂ­ recesus.",
      "KlĂ­ÄŤovĂ˝ pro vĂ˝potek, synoviĂˇlnĂ­ hypertrofii a zĂˇnÄ›tlivĂ© zmÄ›ny."
    ],
    "03_Obrzek3": [
      "PĹ™Ă­ÄŤnĂ˝ infrapatelĂˇrnĂ­ Ĺ™ez patelĂˇrnĂ­ Ĺˇlachou a HoffovĂ˝m tukovĂ˝m tÄ›lesem.",
      "DĹŻleĹľitĂ˝ pro patelĂˇrnĂ­ tendinopatii a impingement tukovĂ©ho tÄ›lesa."
    ],
    "04_Obrzek4": [
      "PodĂ©lnĂ˝ infrapatelĂˇrnĂ­ Ĺ™ez ligamentum patellae mezi patelou a tibiĂ­.",
      "VhodnĂ˝ pro parciĂˇlnĂ­ ruptury, entezopatii a ĂşponovĂ© zmÄ›ny."
    ],
    "05_Obrzek5": [
      "MediĂˇlnĂ­ frontĂˇlnĂ­ projekce hodnotĂ­ MCL, mediĂˇlnĂ­ meniskus a mediĂˇlnĂ­ recesus.",
      "DĹŻleĹľitĂˇ pro extruzi menisku a kapsulĂˇrnĂ­ zmÄ›ny."
    ],
    "06_Obrzek6": [
      "LaterĂˇlnĂ­ frontĂˇlnĂ­ projekce zobrazuje LCL od femuru k hlaviÄŤce fibuly.",
      "KlĂ­ÄŤovĂˇ pro poranÄ›nĂ­ LCL a fibulĂˇrnĂ­ho Ăşponu."
    ],
    "07_Obrzek7": [
      "DorzĂˇlnĂ­ pĹ™Ă­ÄŤnĂ˝ Ĺ™ez se znakem â€žcherry on topâ€ś pro orientaci semitendinosu.",
      "UsnadĹuje navazujĂ­cĂ­ skenovĂˇnĂ­ mediĂˇlnĂ­ch hamstringĹŻ."
    ],
    "08_Obrzek8": [
      "DorzĂˇlnĂ­ distĂˇlnĂ­ Ĺ™ez mezi SM a mediĂˇlnĂ­ hlavou gastrocnemia.",
      "TypickĂˇ lokalizace Bakerovy cysty a tekutinovĂ˝ch kolekcĂ­."
    ],
    "09_Obrzek9": [
      "DorzĂˇlnĂ­ laterĂˇlnĂ­ Ĺ™ez v oblasti fossa poplitea pro tibiĂˇlnĂ­ a spoleÄŤnĂ˝ peroneĂˇlnĂ­ nerv.",
      "DĹŻleĹľitĂ˝ pro ĂştlakovĂ© a traumatickĂ© neuropatie."
    ]
  },
  kotnik: {
    "01_Obrzek1": [
      "PodĂ©lnĂˇ ventrĂˇlnĂ­ projekce pĹ™es EHL, pĹ™ednĂ­ recesus a chrupavku talu.",
      "VhodnĂˇ pro vĂ˝potek, synoviĂˇlnĂ­ hypertrofii i hodnocenĂ­ chrupavky."
    ],
    "02_Obrzek2": [
      "PĹ™Ă­ÄŤnĂ˝ ventrĂˇlnĂ­ Ĺ™ez zobrazuje TA, EHL a EDL nad klenbou talu.",
      "KlĂ­ÄŤovĂ˝ pohled pro tenosynovitidy a tendinopatie extenzorĹŻ."
    ],
    "03_Obrzek3": [
      "MediĂˇlnĂ­ pĹ™Ă­ÄŤnĂ˝ Ĺ™ez tarzĂˇlnĂ­m tunelem se Ĺˇlachami TP/FDL/FHL a neurovaskulĂˇrnĂ­m svazkem.",
      "DĹŻleĹľitĂ˝ pro syndrom tarzĂˇlnĂ­ho tunelu a patologie flexorovĂ˝ch Ĺˇlach."
    ],
    "04_Obrzek4": [
      "LaterĂˇlnĂ­ pĹ™Ă­ÄŤnĂ˝ Ĺ™ez pĹ™es ATFL mezi fibulou a talem.",
      "ZĂˇsadnĂ­ pro distorze laterĂˇlnĂ­ho hlezna a hodnocenĂ­ kontinuity vazu."
    ],
    "05_Obrzek5": [
      "DorzĂˇlnĂ­ podĂ©lnĂˇ projekce Achillovy Ĺˇlachy nad KagerovĂ˝m tukovĂ˝m tÄ›lesem.",
      "HodnotĂ­ tendinopatii, ruptury a retrocalcaneĂˇrnĂ­ burzitidu."
    ],
    "06_Obrzek6": [
      "ProximĂˇlnÄ›jĹˇĂ­ podĂ©lnĂˇ projekce svalovĂ© skupiny triceps surae.",
      "VhodnĂˇ pro svalovĂ© ruptury, hematomy a asymetrii svalĹŻ."
    ],
    "07_Obrzek7": [
      "DorzĂˇlnĂ­ pĹ™Ă­ÄŤnĂ˝ Ĺ™ez Achillovou Ĺˇlachou.",
      "PomĂˇhĂˇ hodnotit ĹˇĂ­Ĺ™ku, echostrukturu i okolnĂ­ mÄ›kkĂ© tkĂˇnÄ›."
    ],
    "08_Obrzek8": [
      "DorzĂˇlnĂ­ pĹ™Ă­ÄŤnĂ˝ pohled na svaly triceps surae.",
      "VhodnĂ˝ pro myotendinĂłznĂ­ poranÄ›nĂ­, chronickou atrofii a fibrĂłzu."
    ]
  }
};

const probes: ProbeSection[] = [
  {
    title: { cs: "VysokofrekvenÄŤnĂ­ sonda", en: "High-frequency probe" },
    image: makeResponsiveImage("Probes", "hockey stick probe"),
    body: {
      cs: [
        "Varianta lineĂˇrnĂ­ sondy s velmi vysokou frekvencĂ­.",
        "Pro detail povrchovĂ˝ch struktur: drobnĂ© Ĺˇlachy, vazy, nervy, kĹŻĹľe a malĂ© klouby.",
        "NevĂ˝hoda: velmi omezenĂˇ hloubkovĂˇ penetrace."
      ],
      en: [
        "Linear-variant probe with very high frequency.",
        "Best for superficial detail in small tendons, ligaments, nerves, skin, and small joints.",
        "Limitation: very low depth penetration."
      ]
    }
  },
  {
    title: { cs: "LineĂˇrnĂ­ sonda", en: "Linear probe" },
    image: makeResponsiveImage("Probes", "linear probe"),
    body: {
      cs: [
        "NejÄŤastÄ›jĹˇĂ­ sonda v muskuloskeletĂˇlnĂ­ sonografii.",
        "VysokĂ© rozliĹˇenĂ­ v povrchovĂ˝ch vrstvĂˇch: Ĺˇlachy, vazy, nervy, svaly a kloubnĂ­ pouzdra.",
        "NevĂ˝hoda: slabĹˇĂ­ zobrazenĂ­ hluboko uloĹľenĂ˝ch struktur."
      ],
      en: [
        "Most commonly used probe in MSK ultrasound.",
        "High superficial resolution for tendons, ligaments, nerves, muscles, and capsules.",
        "Limitation: weaker penetration of deep structures."
      ]
    }
  },
  {
    title: { cs: "KonvexnĂ­ sonda", en: "Convex probe" },
    image: makeResponsiveImage("Probes", "konex probe"),
    body: {
      cs: [
        "ZakĹ™ivenĂ˝ tvar a ĹˇirĹˇĂ­ zornĂ© pole v hloubce.",
        "VhodnĂˇ pro hlubĹˇĂ­ oblasti, objemnÄ›jĹˇĂ­ klouby a svalovĂ© skupiny.",
        "NevĂ˝hoda: niĹľĹˇĂ­ rozliĹˇenĂ­ povrchovĂ˝ch jemnĂ˝ch struktur."
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
    title: { cs: "Sliding (klouzĂˇnĂ­)", en: "Sliding" },
    image: makeResponsiveImage("Probe movements", "01_slide"),
    body: {
      cs: [
        "Posun sondy v dlouhĂ© ose bez zmÄ›ny orientace a nĂˇklonu.",
        "Paprsek zĹŻstĂˇvĂˇ ve stejnĂ© rovinÄ›.",
        "PouĹľitĂ­: trasovĂˇnĂ­ nervĹŻ, Ĺˇlach, svalĹŻ a cĂ©v."
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
        "NaklĂˇnÄ›nĂ­ na jednu a druhou hranu bez posunu po kĹŻĹľi.",
        "MÄ›nĂ­ Ăşhel dopadu paprsku.",
        "KlĂ­ÄŤovĂ© pro potlaÄŤenĂ­ anizotropie Ĺˇlach a vazĹŻ."
      ],
      en: [
        "Tilting on alternating probe edges without skin translation.",
        "Changes the incidence angle.",
        "Key for reducing tendon and ligament anisotropy."
      ]
    }
  },
  {
    title: { cs: "Sweeping (zametĂˇnĂ­)", en: "Sweeping" },
    image: makeResponsiveImage("Probe movements", "03_sweep"),
    body: {
      cs: [
        "Posun sondy v krĂˇtkĂ© ose kolmo k jejĂ­ dlouhĂ© ose.",
        "VznikĂˇ sĂ©rie sousednĂ­ch Ĺ™ezĹŻ vyĹˇetĹ™ovanĂ© oblasti.",
        "PouĹľitĂ­: systematickĂ© hledĂˇnĂ­ patologiĂ­ a porovnĂˇnĂ­ symetrickĂ˝ch oblastĂ­."
      ],
      en: [
        "Short-axis probe translation perpendicular to the long axis.",
        "Creates adjacent slices through the region.",
        "Used for systematic pathology search."
      ]
    }
  },
  {
    title: { cs: "Fanning (vÄ›jĂ­Ĺ™ovitĂ˝ pohyb)", en: "Fanning" },
    image: makeResponsiveImage("Probe movements", "04_fan"),
    body: {
      cs: [
        "NaklĂˇnÄ›nĂ­ v krĂˇtkĂ© ose pĹ™i zachovĂˇnĂ­ mĂ­sta kontaktu s kĹŻĹľĂ­.",
        "MÄ›nĂ­ Ăşhel insonace ze strany na stranu.",
        "PomĂˇhĂˇ potlaÄŤit anizotropii a zvĂ˝raznit kontinuitu vlĂˇken."
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
        "ĹĂ­zenĂ˝ tlak sondou v ose Z kolmo do hloubky.",
        "HodnocenĂ­ kompresibility a odliĹˇenĂ­ tekutinovĂ˝ch a solidnĂ­ch ĂştvarĹŻ.",
        "UĹľiteÄŤnĂ© u burzitid, hematomĹŻ, cyst a ruptur Ĺˇlach."
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
        "UvolnÄ›nĂ­ tlaku sondy v ose Z.",
        "DĹŻleĹľitĂ© pĹ™i hodnocenĂ­ cĂ©v a Doppleru (prevence kolapsu cĂ©v).",
        "ZlepĹˇuje detekci tekutinovĂ˝ch kolekcĂ­."
      ],
      en: [
        "Releasing pressure in the Z-axis.",
        "Important for vascular and Doppler assessment.",
        "Improves fluid collection detection."
      ]
    }
  },
  {
    title: { cs: "Rotace (helikoptĂ©ra)", en: "Rotation (helicopter)" },
    image: makeResponsiveImage("Probe movements", "07_helicopter"),
    body: {
      cs: [
        "OtĂˇÄŤenĂ­ sondy kolem stĹ™edu bez posunu po kĹŻĹľi.",
        "PlynulĂˇ zmÄ›na roviny zobrazenĂ­ (pĹ™Ă­ÄŤnĂˇ/podĂ©lnĂˇ).",
        "SledovanĂˇ struktura zĹŻstĂˇvĂˇ ve stĹ™edu obrazu."
      ],
      en: [
        "Probe rotation around its center without skin translation.",
        "Switches between transverse and longitudinal planes.",
        "Keeps the target structure centered."
      ]
    }
  },
  {
    title: { cs: "Wiper (stÄ›raÄŤe, kruĹľĂ­tko)", en: "Wiper" },
    image: makeResponsiveImage("Probe movements", "08_wiper"),
    body: {
      cs: [
        "Jedna hrana sondy je fixovanĂˇ, druhĂˇ opisuje oblouk.",
        "MÄ›nĂ­ Ăşhel insonace pĹ™i zachovĂˇnĂ­ orientaÄŤnĂ­ho bodu.",
        "VhodnĂ© pro oblasti s komplexnĂ­ anatomiĂ­."
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
      cs: "ZapnutĂ­, vypnutĂ­ nebo stand-by reĹľim pĹ™Ă­stroje.",
      en: "Turns the system on/off or enters standby mode."
    }
  },
  {
    key: "Freeze",
    title: { cs: "FREEZE", en: "FREEZE" },
    body: {
      cs: "ZmrazĂ­ ĹľivĂ˝ obraz pro analĂ˝zu, mÄ›Ĺ™enĂ­ a dokumentaci.",
      en: "Freezes live image for analysis, measurements, and documentation."
    }
  },
  {
    key: "Probes",
    title: { cs: "PROBES", en: "PROBES" },
    body: {
      cs: "VĂ˝bÄ›r a pĹ™epĂ­nĂˇnĂ­ mezi pĹ™ipojenĂ˝mi sondami.",
      en: "Selects and switches connected probes."
    }
  },
  {
    key: "Store",
    title: { cs: "STORE", en: "STORE" },
    body: {
      cs: "UloĹľĂ­ aktuĂˇlnĂ­ zmrazenĂ˝ obraz do pamÄ›ti pĹ™Ă­stroje.",
      en: "Saves the current frozen image to system memory."
    }
  },
  {
    key: "Print",
    title: { cs: "PRINT", en: "PRINT" },
    body: {
      cs: "OkamĹľitĂ˝ tisk snĂ­mku nebo celĂ© obrazovky.",
      en: "Prints the current image or entire screen."
    }
  },
  {
    key: "Clip",
    title: { cs: "CLIP", en: "CLIP" },
    body: {
      cs: "ZĂˇznam krĂˇtkĂ© dynamickĂ© sekvence z ĹľivĂ©ho obrazu.",
      en: "Records a short dynamic clip from live imaging."
    }
  },
  {
    key: "Gain",
    title: { cs: "GAIN", en: "GAIN" },
    body: {
      cs: "NastavenĂ­ celkovĂ©ho zesĂ­lenĂ­ signĂˇlu (jas a kontrast).",
      en: "Adjusts overall signal amplification (brightness and contrast)."
    }
  },
  {
    key: "Focus",
    title: { cs: "FOCUS", en: "FOCUS" },
    body: {
      cs: "NastavenĂ­ ohniska do poĹľadovanĂ© hloubky.",
      en: "Sets the focal zone at the desired depth."
    }
  },
  {
    key: "Frequency",
    title: { cs: "FREQUENCY", en: "FREQUENCY" },
    body: {
      cs: "Volba frekvence: vyĹˇĹˇĂ­ detail vs. vÄ›tĹˇĂ­ hloubkovĂ˝ dosah.",
      en: "Frequency choice: higher detail vs deeper penetration."
    }
  },
  {
    key: "Measure",
    title: { cs: "MEASURE", en: "MEASURE" },
    body: {
      cs: "MÄ›Ĺ™enĂ­ vzdĂˇlenostĂ­, ploch a ĂşhlĹŻ na zmrazenĂ©m obraze.",
      en: "Measures distances, areas, and angles on frozen image."
    }
  },
  {
    key: "Pictogram",
    title: { cs: "PICTOGRAMS", en: "PICTOGRAMS" },
    body: {
      cs: "VklĂˇdĂˇnĂ­ schĂ©matickĂ˝ch piktogramĹŻ vyĹˇetĹ™ovanĂ© oblasti.",
      en: "Adds body/region pictograms to documentation."
    }
  },
  {
    key: "Depth",
    title: { cs: "DEPTH", en: "DEPTH" },
    body: {
      cs: "NastavenĂ­ hloubky zobrazenĂ©ho pole.",
      en: "Adjusts the imaging depth."
    }
  },
  {
    key: "Zoom",
    title: { cs: "ZOOM", en: "ZOOM" },
    body: {
      cs: "ZvÄ›tĹˇenĂ­ vybranĂ© ÄŤĂˇsti obrazu pro detailnĂ­ posouzenĂ­.",
      en: "Magnifies selected image region for detailed assessment."
    }
  },
  {
    key: "Single screen",
    title: { cs: "SINGLE SCREEN", en: "SINGLE SCREEN" },
    body: {
      cs: "ZobrazenĂ­ jednoho obrazu pĹ™es celou obrazovku.",
      en: "Shows one image on the full screen."
    }
  },
  {
    key: "Double screen",
    title: { cs: "DOUBLE SCREEN", en: "DOUBLE SCREEN" },
    body: {
      cs: "RozdÄ›lenĂ­ obrazovky na dvÄ› zobrazovacĂ­ pole.",
      en: "Splits the screen into two display panes."
    }
  },
  {
    key: "PD",
    title: { cs: "POWER DOPPLER", en: "POWER DOPPLER" },
    body: {
      cs: "CitlivĂ© zobrazenĂ­ intenzity prĹŻtoku bez informace o smÄ›ru.",
      en: "Sensitive display of flow intensity without direction information."
    }
  },
  {
    key: "CD",
    title: { cs: "COLOUR DOPPLER", en: "COLOUR DOPPLER" },
    body: {
      cs: "BarevnĂ© zobrazenĂ­ smÄ›ru a rychlosti krevnĂ­ho toku.",
      en: "Color display of blood flow direction and velocity."
    }
  },
  {
    key: "SWE",
    title: { cs: "SHEAR WAVE ELASTOGRAPHY", en: "SHEAR WAVE ELASTOGRAPHY" },
    body: {
      cs: "KvantitativnĂ­ hodnocenĂ­ tuhosti tkĂˇnĂ­ pomocĂ­ smykovĂ˝ch vln.",
      en: "Quantitative tissue stiffness assessment using shear waves."
    }
  },
  {
    key: "ABC",
    title: { cs: "ABC", en: "ABC" },
    body: {
      cs: "VklĂˇdĂˇnĂ­ textovĂ˝ch poznĂˇmek pĹ™Ă­mo do obrazu.",
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
        heading: "ObrĂˇzek 1. VentrĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina",
        bullets: [
          "b: Ĺˇlacha dlouhĂ© hlavy bicepsu, TM: tuberculum majus, tm: tuberculum minus.",
          "TM a tm jsou hlavnĂ­ palpaÄŤnĂ­ orientaÄŤnĂ­ body; mezi nimi je Ĺˇlacha dlouhĂ© hlavy bicepsu v intertuberkulĂˇrnĂ­m (bicipitĂˇlnĂ­m) sulku.",
          "PĹ™i zvĂ˝ĹˇenĂ©m mnoĹľstvĂ­ tekutiny je nutnĂ© odliĹˇit fyziologickĂ© mnoĹľstvĂ­ od synovitidy ÄŤi jinĂ© patologie.",
          "ViditelnĂˇ je i Ĺˇlacha m. subscapularis a povrchovĂˇ vrstva m. deltoideus jako orientaÄŤnĂ­ body pĹ™ednĂ­ ÄŤĂˇsti ramene."
        ]
      },
      en: { heading: "ObrĂˇzek 1. VentrĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: [] }
    }
  },
  {
    key: "02_anterior_view_transverse_plane_2",
    title: { cs: "Predni pohled - transversalni rovina 2", en: "Anterior view - transverse plane 2" },
    caption: {
      cs: {
        heading: "ObrĂˇzek 2. VentrĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina",
        bullets: [
          "LHBB: dlouhĂˇ hlava bicepsu, SHBB: krĂˇtkĂˇ hlava bicepsu.",
          "DistĂˇlnĂ­ posun sondy podĂ©l pĹ™ednĂ­ strany paĹľe umoĹľĹuje zhodnocenĂ­ svalovĂ©ho bĹ™Ă­Ĺˇka m. biceps brachii (caput breve i caput longum).",
          "Projekce je vhodnĂˇ pro posouzenĂ­ struktury a symetrie svalovĂ©ho bĹ™Ă­Ĺˇka a detekci ruptur, hematomĹŻ ÄŤi atrofie."
        ]
      },
      en: { heading: "ObrĂˇzek 2. VentrĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: [] }
    }
  },
  {
    key: "03_anterior_view_longitudinal_plane",
    title: { cs: "Predni pohled - longitudinalni rovina", en: "Anterior view - longitudinal plane" },
    caption: {
      cs: {
        heading: "ObrĂˇzek 3. VentrĂˇlnĂ­ pohled, sagitĂˇlnĂ­ rovina",
        bullets: [
          "b: Ĺˇlacha dlouhĂ© hlavy bicepsu.",
          "PĹ™ednĂ­ Ăşsek ramene v podĂ©lnĂ© rovinÄ› po natoÄŤenĂ­ sondy o 90Â°; LHBB probĂ­hĂˇ v intertuberkulĂˇrnĂ­m (bicipitĂˇlnĂ­m) sulku.",
          "Ĺ lacha mĂˇ lineĂˇrnĂ­ fibrilĂˇrnĂ­ (â€žĹˇpagetovitĂ˝â€ś) vzor odpovĂ­dajĂ­cĂ­ zdravĂ© a neporuĹˇenĂ© ĹˇlaĹˇe.",
          "Projekce je vhodnĂˇ pro hodnocenĂ­ kontinuity a integrity Ĺˇlachy a detekci tekutiny, tenosynovitidy nebo parciĂˇlnĂ­ch ruptur."
        ]
      },
      en: { heading: "ObrĂˇzek 3. VentrĂˇlnĂ­ pohled, sagitĂˇlnĂ­ rovina", bullets: [] }
    }
  },
  {
    key: "04_anterior_view_longitudinal_plane_2",
    title: { cs: "Predni pohled - longitudinalni rovina 2", en: "Anterior view - longitudinal plane 2" },
    caption: {
      cs: {
        heading: "ObrĂˇzek 4. VentrĂˇlnĂ­ pohled, sagitĂˇlnĂ­ rovina",
        bullets: [
          "LHBB: myotendinĂłznĂ­ junkce dlouhĂ© hlavy bicepsu brachii.",
          "Sonda je umĂ­stÄ›na distĂˇlnÄ›ji na pĹ™ednĂ­ stranÄ› paĹľe pro zobrazenĂ­ myotendinĂłznĂ­ho pĹ™echodu, ÄŤastĂ©ho mĂ­sta poranÄ›nĂ­.",
          "Ĺ lacha pĹ™echĂˇzĂ­ z jasnĂ© fibrilĂˇrnĂ­ struktury do hypoechogennĂ­ svalovĂ© tkĂˇnÄ›.",
          "Oblast je vĂ˝znamnĂˇ pro identifikaci parciĂˇlnĂ­ch ruptur, tendinopatie nebo svalovĂ©ho pĹ™epÄ›tĂ­."
        ]
      },
      en: { heading: "ObrĂˇzek 4. VentrĂˇlnĂ­ pohled, sagitĂˇlnĂ­ rovina", bullets: [] }
    }
  },
  {
    key: "05_lateral_view_transverse_plane",
    title: { cs: "Lateralni pohled - transversalni rovina", en: "Lateral view - transverse plane" },
    caption: {
      cs: {
        heading: "ObrĂˇzek 5. LaterĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina",
        bullets: [
          "KrĂˇtkĂˇ osa Ĺˇlachy rotĂˇtorovĂ© manĹľety (â€žobraz pneumatikyâ€ś).",
          "Integrita Ĺˇlachy se hodnotĂ­ mĂ­rnĂ˝m tlakem sondou: zdravĂˇ Ĺˇlacha odolĂˇvĂˇ kompresi a zachovĂˇvĂˇ zaoblenĂ˝ tvar.",
          "Ruptura je mÄ›kkĂˇ a snadno kompresibilnĂ­ (â€žvyfouklĂˇ pneumatikaâ€ś).",
          "Je nutnĂ© zobrazit Ĺˇlachu v celĂ©m prĹŻbÄ›hu, protoĹľe ruptury nebo kalcifikace mohou bĂ˝t fokĂˇlnĂ­."
        ]
      },
      en: { heading: "ObrĂˇzek 5. LaterĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: [] }
    }
  },
  {
    key: "06_lateral_view_longitudinal_plane",
    title: { cs: "Lateralni pohled - longitudinalni rovina", en: "Lateral view - longitudinal plane" },
    caption: {
      cs: {
        heading: "ObrĂˇzek 6. LaterĂˇlnĂ­ pohled, frontĂˇlnĂ­ rovina",
        bullets: [
          "Akromion a velkĂ˝ hrbolek humeru jsou klĂ­ÄŤovĂ© kostnĂ­ orientaÄŤnĂ­ body.",
          "V dlouhĂ© ose je zobrazena Ĺˇlacha m. supraspinatus s tvarem â€žptaÄŤĂ­ho zobĂˇkuâ€ś; pro kompletnĂ­ vyĹˇetĹ™enĂ­ je nutnĂ˝ anteroposteriornĂ­ pohyb sondy.",
          "SubakromiĂˇlnÄ›-subdeltoidnĂ­ burza nad Ĺˇlachou mĹŻĹľe bĂ˝t pĹ™i zvÄ›tĹˇenĂ­ patrnĂˇ (burzitida nebo jinĂ© zĂˇnÄ›tlivĂ© stavy).",
          "ZobrazenĂ­ je zĂˇsadnĂ­ pro hodnocenĂ­ tendinopatie, parciĂˇlnĂ­ch i full-thickness ruptur a subakromiĂˇlnĂ­ho impingementu."
        ]
      },
      en: { heading: "ObrĂˇzek 6. LaterĂˇlnĂ­ pohled, frontĂˇlnĂ­ rovina", bullets: [] }
    }
  },
  {
    key: "07_posterior_view_transverse_plane",
    title: { cs: "Posteriorni pohled - transversalni rovina", en: "Posterior view - transverse plane" },
    caption: {
      cs: {
        heading: "ObrĂˇzek 7. DorzĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina",
        bullets: [
          "L: labrum glenoidale.",
          "DorzĂˇlnĂ­ pohled se sondou pod hĹ™ebenem lopatky; hlavnĂ­ orientaÄŤnĂ­ body jsou hlavice humeru a glenoid.",
          "V hornĂ­ ÄŤĂˇsti glenoidu je trojĂşhelnĂ­kovitĂˇ hyperechogennĂ­ struktura odpovĂ­dajĂ­cĂ­ glenoidĂˇlnĂ­mu labru.",
          "PĹ™i zvĂ˝ĹˇenĂ©m mnoĹľstvĂ­ tekutiny mĹŻĹľe bĂ˝t tekutina v okolĂ­ labra, detekce se zvĂ˝razĹuje pĹ™i zevnĂ­ rotaci."
        ]
      },
      en: { heading: "ObrĂˇzek 7. DorzĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: [] }
    }
  },
  {
    key: "08_posterior_view_transverse_plane_2",
    title: { cs: "Posteriorni pohled - transversalni rovina 2", en: "Posterior view - transverse plane 2" },
    caption: {
      cs: {
        heading: "ObrĂˇzek 8. DorzĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina",
        bullets: [
          "LaterĂˇlnĂ­ posun sondy zobrazuje Ĺˇlachu m. infraspinatus jako fibrilĂˇrnĂ­ strukturu pĹ™ekrĂ˝vajĂ­cĂ­ zadnĂ­ aspekt hlavice humeru.",
          "ZobrazenĂ­ je dĹŻleĹľitĂ© pro hodnocenĂ­ integrity Ĺˇlachy pĹ™i podezĹ™enĂ­ na rupturu rotĂˇtorovĂ© manĹľety.",
          "PĹ™i kaudĂˇlnĂ­m posunu se zobrazuje Ĺˇlacha m. teres minor uloĹľenĂˇ pod Ĺˇlachou m. infraspinatus.",
          "SprĂˇvnĂˇ identifikace obou struktur je nutnĂˇ pro odliĹˇenĂ­ izolovanĂ˝ch ĹˇlachovĂ˝ch lĂ©zĂ­ od kombinovanĂ© patologie."
        ]
      },
      en: { heading: "ObrĂˇzek 8. DorzĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina", bullets: [] }
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
    heading: "ObrĂˇzek 1. VentrĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina",
    legend: "b: Ĺˇlacha dlouhĂ© hlavy bicepsu, TM: tuberculum majus, tm: tuberculum minus.",
    description:
      "TM a tm jsou hlavnĂ­ orientaÄŤnĂ­ body. Mezi nimi je LHBB v bicipitĂˇlnĂ­m sulku, kde se ÄŤasto zachytĂ­ tekutina. HodnoĹĄte i Ĺˇlachu m. subscapularis, m. deltoideus a mnoĹľstvĂ­ tekutiny (fyziologickĂ© vs. synovitida)."
  },
  "02_anterior_view_transverse_plane_2": {
    heading: "ObrĂˇzek 2. VentrĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina",
    legend: "LHBB: dlouhĂˇ hlava bicepsu, SHBB: krĂˇtkĂˇ hlava bicepsu.",
    description:
      "DistĂˇlnĂ­ posun sondy hodnotĂ­ svalovĂ© bĹ™Ă­Ĺˇko m. biceps brachii (caput longum i breve). Projekce je vhodnĂˇ pro posouzenĂ­ symetrie, ruptur, hematomu a atrofie."
  },
  "03_anterior_view_longitudinal_plane": {
    heading: "ObrĂˇzek 3. VentrĂˇlnĂ­ pohled, sagitĂˇlnĂ­ rovina",
    legend: "b: Ĺˇlacha dlouhĂ© hlavy bicepsu.",
    description:
      "PodĂ©lnĂ˝ Ĺ™ez (otoÄŤenĂ­ sondy o 90Â°) ukazuje LHBB v bicipitĂˇlnĂ­m sulku. ZdravĂˇ Ĺˇlacha mĂˇ lineĂˇrnĂ­ fibrilĂˇrnĂ­ vzhled; projekce je vhodnĂˇ pro posouzenĂ­ kontinuity, tenosynovitidy, tekutiny a parciĂˇlnĂ­ch ruptur."
  },
  "04_anterior_view_longitudinal_plane_2": {
    heading: "ObrĂˇzek 4. VentrĂˇlnĂ­ pohled, sagitĂˇlnĂ­ rovina",
    legend: "LHBB: myotendinĂłznĂ­ junkce dlouhĂ© hlavy bicepsu brachii.",
    description:
      "DistĂˇlnÄ›jĹˇĂ­ poloha sondy zobrazuje myotendinĂłznĂ­ pĹ™echod, ÄŤastĂ© mĂ­sto poranÄ›nĂ­. Sledujte pĹ™echod fibrilĂˇrnĂ­ Ĺˇlachy do hypoechogennĂ­ svaloviny a znĂˇmky tendinopatie, parciĂˇlnĂ­ ruptury nebo pĹ™etĂ­ĹľenĂ­."
  },
  "05_lateral_view_transverse_plane": {
    heading: "ObrĂˇzek 5. LaterĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina",
    legend: "KrĂˇtkĂˇ osa Ĺˇlachy rotĂˇtorovĂ© manĹľety (â€žobraz pneumatikyâ€ś).",
    description:
      "MĂ­rnĂ˝m tlakem hodnotĂ­me integritu: zdravĂˇ Ĺˇlacha je pevnĂˇ, ruptura je mÄ›kkĂˇ a kompresibilnĂ­ (â€žvyfouklĂˇ pneumatikaâ€ś). Ĺ lachu vĹľdy sledujte v celĂ© dĂ©lce kvĹŻli fokĂˇlnĂ­m lĂ©zĂ­m a kalcifikacĂ­m."
  },
  "06_lateral_view_longitudinal_plane": {
    heading: "ObrĂˇzek 6. LaterĂˇlnĂ­ pohled, frontĂˇlnĂ­ rovina",
    legend: "Akromion, tuberculum majus a Ĺˇlacha m. supraspinatus (â€žptaÄŤĂ­ zobĂˇkâ€ś).",
    description:
      "Pohybujte sondou anteroposteriornÄ› pro kompletnĂ­ zobrazenĂ­ supraspinatu. Sledujte i SASD burzu; projekce je klĂ­ÄŤovĂˇ pro tendinopatii, parciĂˇlnĂ­/full-thickness ruptury a subakromiĂˇlnĂ­ impingement."
  },
  "07_posterior_view_transverse_plane": {
    heading: "ObrĂˇzek 7. DorzĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina",
    legend: "L: labrum glenoidale.",
    description:
      "Sonda pod hĹ™ebenem lopatky: orientaÄŤnĂ­ body jsou hlavice humeru a glenoid. V hornĂ­ ÄŤĂˇsti glenoidu je patrnĂ© labrum. Tekutina kolem labra je lĂ©pe detekovatelnĂˇ pĹ™i zevnĂ­ rotaci."
  },
  "08_posterior_view_transverse_plane_2": {
    heading: "ObrĂˇzek 8. DorzĂˇlnĂ­ pohled, transverzĂˇlnĂ­ rovina",
    legend: "Ĺ lacha m. infraspinatus; pĹ™i kaudĂˇlnĂ­m posunu i Ĺˇlacha m. teres minor.",
    description:
      "LaterĂˇlnĂ­ posun sondy hodnotĂ­ integritu infraspinatu pĹ™i podezĹ™enĂ­ na rupturu manĹľety. KaudĂˇlnĂ­ posun pĹ™idĂˇ teres minor a pomĂˇhĂˇ odliĹˇit izolovanĂ© a kombinovanĂ© lĂ©ze."
  }
};

const shoulderProtocolCopyOverridesCsExtended: Record<string, { heading: string; legend: string; description: string }> = {
  ...shoulderProtocolCopyOverrides,
  "01_anterior_view_transverse_plane": {
    ...shoulderProtocolCopyOverrides["01_anterior_view_transverse_plane"],
    description:
      "TM a tm jsou hlavnĂ­ orientaÄŤnĂ­ body pĹ™ednĂ­ ÄŤĂˇsti ramene. Mezi nimi probĂ­hĂˇ LHBB v bicipitĂˇlnĂ­m sulku, kde se pĹ™i vĂ˝potku ÄŤasto zachytĂ­ tekutina komunikujĂ­cĂ­ s kloubnĂ­ dutinou. V tĂ©to projekci zĂˇroveĹ hodnotĂ­me Ĺˇlachu m. subscapularis, povrchovĂ˝ m. deltoideus a charakter tekutiny (fyziologickĂ© mnoĹľstvĂ­ vs. synovitida)."
  },
  "02_anterior_view_transverse_plane_2": {
    ...shoulderProtocolCopyOverrides["02_anterior_view_transverse_plane_2"],
    description:
      "DistĂˇlnĂ­ posun sondy podĂ©l pĹ™ednĂ­ strany paĹľe zobrazĂ­ svalovĂ© bĹ™Ă­Ĺˇko m. biceps brachii s obÄ›ma hlavami (LHBB i SHBB). Projekce je vhodnĂˇ pro hodnocenĂ­ struktury a symetrie svaloviny a pro zĂˇchyt patologickĂ˝ch zmÄ›n, jako jsou parciĂˇlnĂ­ ÄŤi kompletnĂ­ ruptury, hematomy nebo znĂˇmky atrofie."
  },
  "03_anterior_view_longitudinal_plane": {
    ...shoulderProtocolCopyOverrides["03_anterior_view_longitudinal_plane"],
    description:
      "Po otoÄŤenĂ­ sondy o 90Â° je LHBB zobrazena v dlouhĂ© ose v bicipitĂˇlnĂ­m sulku. IntaktnĂ­ Ĺˇlacha mĂˇ lineĂˇrnĂ­ fibrilĂˇrnĂ­ (â€žĹˇpagetovitĂ˝â€ś) vzhled; tato rovina je ideĂˇlnĂ­ pro hodnocenĂ­ kontinuity, tenosynovitidy, tekutinovĂ˝ch kolekcĂ­ a parciĂˇlnĂ­ch ruptur pĹ™i bolesti pĹ™ednĂ­ ÄŤĂˇsti ramene."
  },
  "04_anterior_view_longitudinal_plane_2": {
    ...shoulderProtocolCopyOverrides["04_anterior_view_longitudinal_plane_2"],
    description:
      "DistĂˇlnÄ›jĹˇĂ­ poloha sondy zobrazuje myotendinĂłznĂ­ pĹ™echod dlouhĂ© hlavy bicepsu, kterĂ˝ bĂ˝vĂˇ ÄŤastĂ˝m mĂ­stem poranÄ›nĂ­. Sledujeme pĹ™echod fibrilĂˇrnĂ­ Ĺˇlachy do hypoechogennĂ­ svaloviny a hodnotĂ­me znĂˇmky tendinopatie, parciĂˇlnĂ­ ruptury nebo pĹ™etĂ­ĹľenĂ­, zejmĂ©na po akutnĂ­m traumatu."
  },
  "05_lateral_view_transverse_plane": {
    ...shoulderProtocolCopyOverrides["05_lateral_view_transverse_plane"],
    description:
      "KrĂˇtkĂˇ osa Ĺˇlachy rotĂˇtorovĂ© manĹľety umoĹľĹuje tzv. â€žtire signâ€ś s kompresĂ­ sondou. ZdravĂˇ Ĺˇlacha je pevnĂˇ a drĹľĂ­ tvar, zatĂ­mco ruptura je mÄ›kkĂˇ a kompresibilnĂ­ (â€žvyfouklĂˇ pneumatikaâ€ś). Ĺ lachu je nutnĂ© vyĹˇetĹ™it v celĂ©m prĹŻbÄ›hu, protoĹľe ruptury i kalcifikace mohou bĂ˝t pouze fokĂˇlnĂ­."
  },
  "06_lateral_view_longitudinal_plane": {
    ...shoulderProtocolCopyOverrides["06_lateral_view_longitudinal_plane"],
    description:
      "Akromion a velkĂ˝ hrbolek humeru tvoĹ™Ă­ klĂ­ÄŤovĂ© kostnĂ­ orientaÄŤnĂ­ body. Mezi nimi je v dlouhĂ© ose Ĺˇlacha m. supraspinatus (â€žptaÄŤĂ­ zobĂˇkâ€ś); protoĹľe je ĹˇirokĂˇ pĹ™ibliĹľnÄ› 4 cm, je nutnĂ˝ anteroposteriornĂ­ posun sondy pro kompletnĂ­ vyĹˇetĹ™enĂ­. HodnotĂ­me i SASD burzu a znĂˇmky tendinopatie, parciĂˇlnĂ­ch/full-thickness ruptur a impingementu."
  },
  "07_posterior_view_transverse_plane": {
    ...shoulderProtocolCopyOverrides["07_posterior_view_transverse_plane"],
    description:
      "DorzĂˇlnĂ­ projekce se sondou pod hĹ™ebenem lopatky vyuĹľĂ­vĂˇ hlavici humeru a glenoid jako zĂˇkladnĂ­ orientaÄŤnĂ­ body. V hornĂ­ ÄŤĂˇsti glenoidu je patrnĂ© labrum, kterĂ© pĹ™ispĂ­vĂˇ ke stabilitÄ› ramene. PĹ™i zvĂ˝ĹˇenĂ©m mnoĹľstvĂ­ tekutiny mĹŻĹľe bĂ˝t kolekce kolem labra lĂ©pe detekovatelnĂˇ pĹ™i zevnĂ­ rotaci."
  },
  "08_posterior_view_transverse_plane_2": {
    ...shoulderProtocolCopyOverrides["08_posterior_view_transverse_plane_2"],
    description:
      "LaterĂˇlnĂ­m posunem sondy sledujeme Ĺˇlachu m. infraspinatus nad zadnĂ­m aspektem hlavice humeru, kaudĂˇlnÄ› se zobrazĂ­ i m. teres minor. SprĂˇvnĂˇ identifikace obou struktur je dĹŻleĹľitĂˇ pro rozliĹˇenĂ­ izolovanĂ˝ch lĂ©zĂ­ od kombinovanĂ© patologie zadnĂ­ ÄŤĂˇsti rotĂˇtorovĂ© manĹľety."
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
      view: "VentrĂˇlnĂ­ pohled",
      planes: ["TransverzĂˇlnĂ­ rovina", "SagitĂˇlnĂ­ rovina"]
    },
    {
      view: "LaterĂˇlnĂ­ pohled",
      planes: ["TransverzĂˇlnĂ­ rovina", "FrontĂˇlnĂ­ rovina"]
    },
    {
      view: "DorzĂˇlnĂ­ pohled",
      planes: ["TransverzĂˇlnĂ­ rovina"]
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
    "Ultrazvuk ramene je praktickĂˇ metoda pro detailnĂ­ hodnocenĂ­ mÄ›kkĂ˝ch tkĂˇnĂ­ v reĂˇlnĂ©m ÄŤase.",
    "PĹ™i sprĂˇvnĂ© technice pĹ™esnÄ› hodnotĂ­ Ĺˇlachy rotĂˇtorovĂ© manĹľety, dlouhou hlavu bicepsu, burzy a svaly.",
    "VĂ˝hodou je okamĹľitĂˇ korelace obrazu s bolestĂ­, funkÄŤnĂ­ manĂ©vry a porovnĂˇnĂ­ s kontralaterĂˇlnĂ­ stranou.",
    "Kvalitu vyĹˇetĹ™enĂ­ podporuje standardizovanĂˇ poloha pacienta a systematickĂ˝ postup od kostnĂ­ch orientaÄŤnĂ­ch bodĹŻ.",
    "SkenovĂˇnĂ­ mĂˇ probĂ­hat v podĂ©lnĂ© i pĹ™Ă­ÄŤnĂ© rovinÄ› s aktivnĂ­ pracĂ­ sondou (sliding, rocking, fanning) kvĹŻli kolmĂ© incidenci a minimalizaci anizotropie.",
    "NedĂ­lnou souÄŤĂˇstĂ­ je dynamickĂ© vyĹˇetĹ™enĂ­ a komprese/dekomprese pĹ™i hodnocenĂ­ tekutinovĂ˝ch kolekcĂ­.",
    "ZĂˇsadnĂ­ je sprĂˇvnĂ© nastavenĂ­ pĹ™Ă­stroje (hloubka, fokus, gain), pouĹľitĂ­ vysokofrekvenÄŤnĂ­ lineĂˇrnĂ­ sondy a prĹŻbÄ›ĹľnĂˇ Ăşprava podle oblasti."
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
    "NejÄŤastÄ›ji se nachĂˇzĂ­ postiĹľenĂ­ rotĂˇtorovĂ© manĹľety: tendinopatie m. supraspinatus, parciĂˇlnĂ­ i kompletnĂ­ ruptury.",
    "ÄŚastĂ© je postiĹľenĂ­ Ĺˇlachy dlouhĂ© hlavy bicepsu vÄŤetnÄ› tenosynovitidy, subluxace a ruptury.",
    "Velmi bÄ›ĹľnĂ˝m nĂˇlezem je subakromiĂˇlnÄ›-subdeltoidnĂ­ burzitida, ÄŤasto spolu s impingement syndromem.",
    "DalĹˇĂ­ nĂˇlezy zahrnujĂ­ kalcifikujĂ­cĂ­ tendinitidu, synovitidu, kloubnĂ­ vĂ˝potek a u chronickĂ˝ch potĂ­ĹľĂ­ degenerativnĂ­ zmÄ›ny, entezopatie, atrofii ÄŤi tukovou infiltraci svalĹŻ."
  ],
  en: [
    "Most common findings involve rotator cuff disease: supraspinatus tendinopathy and partial or full-thickness tears.",
    "Pathology of the long head of the biceps is also frequent, including tenosynovitis, subluxation, and rupture.",
    "Subacromial-subdeltoid bursitis is very common, often combined with impingement syndrome.",
    "Other findings include calcific tendinitis, synovitis, joint effusion, and in chronic cases degenerative changes, enthesopathy, muscle atrophy, or fatty infiltration."
  ]
};

const shoulderAnatomyIntro = {
  cs: "Rameno je nejpohyblivÄ›jĹˇĂ­ kloubnĂ­ komplex v tÄ›le. VelkĂ˝ rozsah pohybu zlepĹˇuje funkci, ale zĂˇroveĹ sniĹľuje stabilitu, proto je rameno ÄŤastĂ˝m mĂ­stem poranÄ›nĂ­. Pro ultrazvuk je zĂˇsadnĂ­ orientace v kostnĂ­ch bodech a Ăşponech Ĺˇlach.",
  en: "The shoulder is the most mobile joint complex in the body. This range of motion supports function but reduces stability, making shoulder injury common. In ultrasound, clear orientation to bony landmarks and tendon insertions is essential."
};

const shoulderAnatomyLandmarks = {
  cs: [
    "KlĂ­ÄŤnĂ­ kost - pĹ™ednĂ­ opora, orientace pro AC a SC skloubenĂ­.",
    "Akromion - hornĂ­ kostÄ›nĂ˝ strop ramene.",
    "Processus coracoideus - pĹ™ednĂ­ orientaÄŤnĂ­ bod pro biceps a subscapularis.",
    "Tuberculum majus - Ăşpon supraspinatu, infraspinatu a teres minor.",
    "Tuberculum minus - Ăşpon subscapularis.",
    "Sulcus intertubercularis (bicipital groove) - prĹŻbÄ›h dlouhĂ© hlavy bicepsu.",
    "Spina scapulae - zadnĂ­ orientaÄŤnĂ­ hrana lopatky."
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
      "Subscapularis - vnitĹ™nĂ­ rotace.",
      "Supraspinatus - zahĂˇjenĂ­ abdukce.",
      "Infraspinatus - zevnĂ­ rotace.",
      "Teres minor - zevnĂ­ rotace a addukce."
    ],
    other: [
      "Deltoideus - hlavnĂ­ abdukce, podĂ­l na flexi a extenzi podle ÄŤĂˇsti svalu.",
      "DlouhĂˇ hlava bicepsu - stabilizace ramene, flexe a supinace."
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
  cs: "Loket je stabilnĂ­ kloubnĂ­ komplex s menĹˇĂ­m, ale velmi funkÄŤnĂ­m rozsahem pohybu. Pro ultrazvuk je zĂˇsadnĂ­ orientace mezi humerem, radiem a ulnou a znalost vztahu kloubnĂ­ch recesĹŻ, Ĺˇlach, vazĹŻ a nervĹŻ. PĹ™esnĂˇ anatomickĂˇ orientace zvyĹˇuje kvalitu vyĹˇetĹ™enĂ­ i klinickou interpretaci nĂˇlezu.",
  en: "The elbow is a relatively stable joint complex with a moderate but highly functional range of motion. In ultrasound, clear orientation among the humerus, radius, and ulna and understanding of recesses, tendons, ligaments, and nerves are essential for accurate assessment."
};

const elbowAnatomyJoints = {
  cs: [
    "HumeroulnĂˇrnĂ­ kloub - hlavnĂ­ kladkovĂ˝ kloub lokte, flexe a extenze.",
    "HumeroradiĂˇlnĂ­ kloub - kontakt capitulum humeri a hlaviÄŤky radia, podĂ­l na stabilitÄ›.",
    "ProximĂˇlnĂ­ radioulnĂˇrnĂ­ kloub - ÄŤepovĂ˝ kloub pro pronaci a supinaci pĹ™edloktĂ­."
  ],
  en: [
    "Humeroulnar joint - primary hinge articulation responsible for flexion and extension.",
    "Humeroradial joint - capitulum-radial head articulation contributing to stability.",
    "Proximal radioulnar joint - pivot articulation enabling pronation and supination."
  ]
};

const elbowAnatomyUltrasoundFocus = {
  cs: "V ultrazvuku se nejÄŤastÄ›ji hodnotĂ­ spoleÄŤnĂ˝ extenzorovĂ˝ a flexorovĂ˝ Ăşpon, distĂˇlnĂ­ Ĺˇlacha bicepsu a tricepsu, n. medianus a kloubnĂ­ recesy.",
  en: "Elbow ultrasound mainly focuses on common extensor/flexor origins, distal biceps and triceps tendons, the median nerve, and joint recesses."
};

const elbowAnatomyLandmarkLead = {
  cs: "KostnĂ­ landmarky jsou zĂˇkladnĂ­ orientaÄŤnĂ­ body pĹ™i skenovĂˇnĂ­. PomĂˇhajĂ­ sprĂˇvnÄ› vĂ©st sondu a rychle rozliĹˇit normĂˇlnĂ­ anatomii od patologie.",
  en: "Bony landmarks are the key orientation points during elbow scanning and improve both probe guidance and interpretation."
};

const elbowAnatomyLandmarks = {
  cs: [
    "MediĂˇlnĂ­ epikondyl - orientace pro spoleÄŤnĂ˝ flexorovĂ˝ Ăşpon a n. ulnaris.",
    "LaterĂˇlnĂ­ epikondyl - orientace pro spoleÄŤnĂ˝ extenzorovĂ˝ Ăşpon.",
    "Olecranon - hlavnĂ­ bod zadnĂ­ho pĹ™Ă­stupu, hodnocenĂ­ tricepsu a burzy.",
    "HlaviÄŤka radia - orientace pro humeroradiĂˇlnĂ­ a proximĂˇlnĂ­ radioulnĂˇrnĂ­ skloubenĂ­."
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
      "Biceps brachii - flexe lokte a supinace; v UZ klĂ­ÄŤovĂˇ distĂˇlnĂ­ Ĺˇlacha.",
      "Brachialis - hlavnĂ­ flexor lokte; dĹŻleĹľitĂ˝ pĹ™i pĹ™ednĂ­ bolesti lokte.",
      "Triceps brachii - extenze lokte; hodnocenĂ­ distĂˇlnĂ­ Ĺˇlachy a olekranovĂ© burzy.",
      "SpoleÄŤnĂ˝ flexor-pronĂˇtorovĂ˝ komplex - mediĂˇlnĂ­ strana lokte; typickĂˇ oblast mediĂˇlnĂ­ epikondylopatie.",
      "SpoleÄŤnĂ˝ extenzor-supinĂˇtorovĂ˝ komplex - laterĂˇlnĂ­ strana lokte; typickĂˇ oblast laterĂˇlnĂ­ epikondylopatie."
    ],
    other: [
      "Anconeus - pomocnĂˇ extenze a stabilizace lokte.",
      "Supinator - supinace pĹ™edloktĂ­; vĂ˝znam pĹ™i podezĹ™enĂ­ na Ăştlak radiĂˇlnĂ­ho nervu."
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
  cs: "ObrĂˇzek 1. PolohovĂˇnĂ­ pacienta pĹ™i vyĹˇetĹ™enĂ­ ramennĂ­ho kloubu. 1: zĂˇkladnĂ­ pozice pro vyĹˇetĹ™enĂ­ ventrĂˇlnĂ­ho pohledu, 2: pozice k vyĹˇetĹ™enĂ­ m. subscapularis - ventrĂˇlnĂ­ pohled, 3: Crass position - pozice k vyĹˇetĹ™enĂ­ rotĂˇtorovĂ© manĹľety - laterĂˇlnĂ­ pohled, 4: modified Crass position - pozice k vyĹˇetĹ™enĂ­ rotĂˇtorovĂ© manĹľety - laterĂˇlnĂ­ pohled, 5: pozice k vyĹˇetĹ™enĂ­ dorzĂˇlnĂ­ho pohledu.",
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
        Ultrazvuk <strong>ramennĂ­ho kloubu</strong> je v PMR velmi cennĂ˝, protoĹľe umoĹľĹuje rychle propojit klinickĂ˝ obraz s nĂˇlezem
        pĹ™i pohybu. NejÄŤastÄ›ji se zamÄ›Ĺ™ujeme na <strong>Ĺˇlachy rotĂˇtorovĂ© manĹľety</strong> (supraspinatus, infraspinatus, subscapularis), Ĺˇlachu
        <strong>dlouhĂ© hlavy bicepsu</strong>, <strong>subakromiĂˇlnÄ›-subdeltoidnĂ­ burzu</strong> a zadnĂ­ recesus glenohumerĂˇlnĂ­ho kloubu. PrĂˇvÄ› tyto struktury bĂ˝vajĂ­
        nejÄŤastÄ›jĹˇĂ­m zdrojem bolesti pĹ™i abdukci, prĂˇci nad hlavou a pĹ™i rotaÄŤnĂ­ch pohybech. VĂ˝hodou je dynamickĂ© vyĹˇetĹ™enĂ­, kterĂ©
        pomĂˇhĂˇ rozliĹˇit <strong>impingement</strong>, <strong>tendinopatii</strong>, parciĂˇlnĂ­ ÄŤi kompletnĂ­ ruptury a zĂˇnÄ›tlivĂ© zmÄ›ny burzy nebo synovie.
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
        Ultrazvuk <strong>loketnĂ­ho kloubu</strong> je ideĂˇlnĂ­ pro cĂ­lenĂ© hodnocenĂ­ pĹ™etÄ›ĹľovanĂ˝ch struktur v oblasti mediĂˇlnĂ­ho a
        laterĂˇlnĂ­ho epikondylu, <strong>spoleÄŤnĂ©ho flexorovĂ©ho a extenzorovĂ©ho Ăşponu</strong>, kolaterĂˇlnĂ­ch vazĹŻ, distĂˇlnĂ­ch Ĺˇlach bicepsu a
        tricepsu i prĹŻbÄ›hu n. ulnaris v kubitĂˇlnĂ­m tunelu. V praxi je velmi pĹ™Ă­nosnĂ˝ pĹ™i bolesti pĹ™i Ăşchopu, extenzi zĂˇpÄ›stĂ­,
        flexi lokte nebo pĹ™i paresteziĂ­ch v ulnĂˇrnĂ­ oblasti. UmoĹľĹuje odliĹˇit epikondylopatii, parciĂˇlnĂ­ ruptury, synovitidu,
        kloubnĂ­ vĂ˝potek, burzitidu i <strong>kompresnĂ­ neuropatii</strong> a zĂˇroveĹ porovnat nĂˇlez s druhostrannĂ˝m loktem.
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
        Ultrazvuk <strong>zĂˇpÄ›stnĂ­ho kloubu</strong> je velmi uĹľiteÄŤnĂ˝ pĹ™i bolestech po pĹ™etĂ­ĹľenĂ­ i po Ăşrazu, protoĹľe umoĹľĹuje pĹ™esnÄ›
        zhodnotit ĹˇlachovĂ© kompartmenty, retinakula, radiokarpĂˇlnĂ­ oblast i karpĂˇlnĂ­ tunel. V klinickĂ© praxi se nejÄŤastÄ›ji zamÄ›Ĺ™ujeme
        na <strong>flexorovĂ© a extenzorovĂ© Ĺˇlachy</strong>, synovii a <strong>n. medianus</strong>, zejmĂ©na pĹ™i podezĹ™enĂ­ na tenosynovitidu, ganglion nebo syndrom
        karpĂˇlnĂ­ho tunelu. VĂ˝hodou je moĹľnost <strong>dynamickĂ©ho vyĹˇetĹ™enĂ­</strong> a pĹ™Ă­mĂ© korelace nĂˇlezu s bolestĂ­ pĹ™i pohybu prstĹŻ a zĂˇpÄ›stĂ­.
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
        Ultrazvuk <strong>kyÄŤelnĂ­ho kloubu</strong> mĂˇ v PMR dĹŻleĹľitĂ© mĂ­sto hlavnÄ› pĹ™i bolestech tĹ™Ă­sla a laterĂˇlnĂ­ strany kyÄŤle, kde
        pomĂˇhĂˇ rychle odliĹˇit intraartikulĂˇrnĂ­ a periartikulĂˇrnĂ­ pĹ™Ă­ÄŤiny potĂ­ĹľĂ­. Prakticky se zamÄ›Ĺ™ujeme na pĹ™ednĂ­ recesus s moĹľnĂ˝m
        vĂ˝potkem, iliopsoas, pĹ™Ă­mĂ˝ sval stehennĂ­, <strong>adduktorovĂ˝ a abduktorovĂ˝ aparĂˇt</strong> vÄŤetnÄ› trochanterickĂ˝ch burz. VyĹˇetĹ™enĂ­ tak dobĹ™e
        rozliĹˇuje <strong>synovitidu a kloubnĂ­ vĂ˝potek</strong> od tendinopatiĂ­ gluteĂˇlnĂ­ch Ĺˇlach, burzitid nebo entezopatiĂ­ v trochanterickĂ© oblasti.
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
        Ultrazvuk <strong>kolennĂ­ho kloubu</strong> je velmi efektivnĂ­ metoda pro rychlĂ© zhodnocenĂ­ pĹ™ednĂ­, mediĂˇlnĂ­ i laterĂˇlnĂ­ bolesti
        kolene. StandardnÄ› hodnotĂ­me <strong>suprapatelĂˇrnĂ­ recesus</strong>, kvadricepsovou a patelĂˇrnĂ­ Ĺˇlachu, kolaterĂˇlnĂ­ vazy a periartikulĂˇrnĂ­
        burzy, pĹ™Ă­padnÄ› i podkolennĂ­ oblast s Bakerovou cystou. PĹ™Ă­nosem je rychlĂˇ detekce vĂ˝potku a synovitidy a zĂˇroveĹ upĹ™esnÄ›nĂ­,
        zda jsou potĂ­Ĺľe dĂˇny <strong>tendinopatiĂ­, entezopatiĂ­, bursitidou</strong> nebo vazivovĂ˝m postiĹľenĂ­m.
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
        Ultrazvuk <strong>hlezennĂ­ho kloubu (kotnĂ­ku)</strong> je zĂˇsadnĂ­ zejmĂ©na po distorzĂ­ch a pĹ™i chronickĂ© nestabilitÄ›, protoĹľe
        umoĹľĹuje dynamicky zhodnotit vazivovĂ© i ĹˇlachovĂ© struktury. V praxi se vyĹˇetĹ™uje <strong>laterĂˇlnĂ­ vazivovĂ˝ komplex (ATFL, CFL)</strong>,
        mediĂˇlnĂ­ deltovĂ˝ vaz, peroneĂˇlnĂ­ Ĺˇlachy, tibialis posterior a pĹ™ednĂ­ recesus hlezna. Metoda pomĂˇhĂˇ odliĹˇit parciĂˇlnĂ­ ruptury
        vazĹŻ, tendinopatie, <strong>subluxace Ĺˇlach</strong>, synovitidu i kloubnĂ­ vĂ˝potek a pĹ™esnÄ›ji zacĂ­lit dalĹˇĂ­ lĂ©ÄŤebnĂ˝ postup.
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
  zapesti: { fileName: "03_Wrist.png", alt: { cs: "Anatomie zĂˇpÄ›stĂ­", en: "Wrist anatomy" } },
  kycel: { fileName: "04_Hip.png", alt: { cs: "Anatomie kyÄŤle", en: "Hip anatomy" } },
  koleno: { fileName: "05_Knee.png", alt: { cs: "Anatomie kolene", en: "Knee anatomy" } },
  kotnik: { fileName: "06_Ankle.png", alt: { cs: "Anatomie kotnĂ­ku", en: "Ankle anatomy" } }
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
              Ă—
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
  const isMedianNerveVideo = path === "/periferni-nervy/nervus-medianus/video-tutorial";
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
  const nerveKey = nerveAnatomyMatch?.[1];
  const nerveAnatomyCopy = nerveKey ? nerveAnatomyDescriptions[nerveKey] : undefined;
  const nerveUltrasoundKey = nerveUltrasoundMatch?.[1];
  const nerveUltrasoundContent = nerveUltrasoundKey ? nerveUltrasoundByNerve[nerveUltrasoundKey] : undefined;
  const ulnarInteractiveSections: NerveUltrasoundInteractiveSection[] =
    nerveUltrasoundKey === "nervus-ulnaris"
      ? [
          {
            title: { cs: "ObrĂˇzek 1", en: "Figure 1" },
            caption: { cs: "ObrĂˇzek 1. ListovĂˇnĂ­ mezi obrĂˇzkem 2 a 3.", en: "Figure 1. Swipe-through between figure 2 and 3." }
          },
          {
            title: { cs: "ObrĂˇzek 2", en: "Figure 2" },
            caption: {
              cs: "ObrĂˇzek 2. PorovnĂˇnĂ­ obrĂˇzku 2 a 3 posunutĂ­m prstu po dÄ›lĂ­cĂ­ linii.",
              en: "Figure 2. Comparison of figure 2 and 3 by dragging along the divider."
            }
          }
        ]
      : [];
  const ulnarSwipeImages =
    nerveUltrasoundKey === "nervus-ulnaris"
      ? [makeResponsiveImagePhone("Ulnar nerve", "UN2"), makeResponsiveImagePhone("Ulnar nerve", "UN3")]
      : [];
  const resolvedNerveUltrasoundContent =
    nerveUltrasoundKey === "nervus-ulnaris" && nerveUltrasoundContent
      ? {
          ...nerveUltrasoundContent,
          folder: "Nerves/Ulnar nerve",
          sections: ulnarNerveUltrasoundSections,
          swipeCompareImages: ulnarNerveSwipeCompareImages
        }
      : nerveUltrasoundContent;
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
            â€ą
          </span>
          <span className={styles.chapterText}>
            <span className={styles.chapterLabel}>{previousLabel}</span>
            <span className={styles.chapterTitle}>{localize(previousTarget.title, lang)}</span>
          </span>
        </Link>
      ) : (
        <span className={`${styles.chapterLink} ${styles.chapterDisabled}`} aria-disabled="true">
          <span className={styles.chapterArrow} aria-hidden="true">
            â€ą
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
            â€ş
          </span>
        </Link>
      ) : (
        <span className={`${styles.chapterLink} ${styles.chapterDisabled}`} aria-disabled="true">
          <span className={styles.chapterText}>
            <span className={styles.chapterLabel}>{t("nextChapter")}</span>
          </span>
          <span className={styles.chapterArrow} aria-hidden="true">
            â€ş
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

  if (isMedianNerveVideo) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.videoBox}>
          <div className={styles.videoWrap}>
            <iframe
              src="https://www.youtube-nocookie.com/embed/WmzHNPNkBx0"
              title={lang === "cs" ? "Nervus medianus video tutorial" : "Median nerve video tutorial"}
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

  if (nerveIntroMatch || nervePositioningMatch) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        {progressBar}
        <section className={styles.articleBox}>
          <p>
            {lang === "cs"
              ? "Tato ÄŤĂˇst je zatĂ­m pĹ™ipravena jako prĂˇzdnĂˇ a obsah bude doplnÄ›n."
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
          <p>{nerveAnatomyIntroCopy[lang]}</p>
          <ResponsiveImage
            image={makeResponsiveImagePhone("CS", "cross_sections")}
            alt={nerveAnatomyIntroAlt[lang]}
            wrapClassName={`${styles.shoulderUltrasoundImageWrap} ${styles.nerveImageWrap}`}
            enableMobileZoom
          />
          <div className={`${styles.knobologyGrid} ${styles.shoulderUltrasoundGrid}`}>
            {nerveAnatomyImages.map((item, index) => {
              const abbreviationSet = nerveAnatomyAbbreviations[item.key]?.[lang];
              const abbreviationLine = abbreviationSet ? abbreviationSet.join(", ") : undefined;
              const figureCaptionData = nerveAnatomyFigureCaptions[item.key];
              const figureCaption = figureCaptionData
                ? lang === "cs"
                  ? `ObrĂˇzek ${index + 1}: ${figureCaptionData.cs}`
                  : `Figure ${index + 1}: ${figureCaptionData.en}`
                : undefined;
              const figureCaptionWithPeriod = figureCaption ? `${figureCaption.replace(/[.]\s*$/, "")}.` : undefined;
              const combinedCaptionLine = [figureCaptionWithPeriod, abbreviationLine].filter(Boolean).join(" ");
              const zoomCaption = combinedCaptionLine;

              return (
                <article key={item.key} className={`${styles.knobologyCard} ${styles.shoulderUltrasoundCard} ${styles.nerveSectionCard}`}>
                  <div className={styles.articleBody}>
                    <h3>{item.title[lang]}</h3>
                    {nerveAnatomyCopy?.[item.key] ? <p>{nerveAnatomyCopy[item.key][lang]}</p> : null}
                  </div>
                  <ResponsiveImage
                    image={makeResponsiveImagePhone("CS", item.key)}
                    alt={item.title[lang]}
                    wrapClassName={`${styles.shoulderUltrasoundImageWrap} ${styles.nerveImageWrap}`}
                    enableMobileZoom
                    caption={zoomCaption}
                  />
                  {combinedCaptionLine ? (
                    <p className={styles.figureCaption}>
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
          <h2>{lang === "cs" ? "MĂ­sta Ăştlaku" : "Entrapment sites"}</h2>
          <ol className={styles.compactList}>
            {entrapmentSites[lang].map((item) => (
              <li key={`${item.title}-${item.description}`}>
                <strong>{item.title}</strong> â€“ {item.description}
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

                  return (
                    <article key={item.key} className={`${styles.knobologyCard} ${styles.shoulderUltrasoundCard} ${styles.nerveSectionCard}`}>
                      {compareImages ? (
                        <SwipeCompareImage
                          baseImage={compareImages.baseImage}
                          overlayImage={compareImages.overlayImage}
                          baseAlt={imageAlt}
                          overlayAlt={imageAlt}
                          ariaLabel={imageAlt}
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
                        <h3>{item.title[lang]}</h3>
                      </div>
                    </article>
                  );
                })}
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
          <h2>{lang === "cs" ? "MotorickĂˇ inervace" : "Motor innervation"}</h2>
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
          <h2>{lang === "cs" ? "SenzitivnĂ­ inervace" : "Sensory innervation"}</h2>
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
              ? "V muskuloskeletĂˇlnĂ­ sonografii se pouĹľĂ­vajĂ­ tĹ™i zĂˇkladnĂ­ typy sond: lineĂˇrnĂ­, konvexnĂ­ a vysokofrekvenÄŤnĂ­. Volba sondy pĹ™Ă­mo ovlivĹuje kvalitu obrazu i sprĂˇvnou interpretaci nĂˇlezu."
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
            alt={lang === "cs" ? "Typy drĹľenĂ­ sondy" : "Probe grip types"}
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
              ? "SprĂˇvnĂˇ knobologie je zĂˇklad kvalitnĂ­ho obrazu."
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
            alt={lang === "cs" ? "Ultrazvuk v medicĂ­nskĂ©m zobrazovĂˇnĂ­" : "Ultrasound in medical imaging"}
            enableMobileZoom
            caption={lang === "cs" ? "ObrĂˇzek 1: Ultrazvuk v medicĂ­nskĂ©m zobrazovĂˇnĂ­." : "Figure 1: Ultrasound in medical imaging."}
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
            alt={lang === "cs" ? "SchĂ©ma podĂ©lnĂ© zvukovĂ© vlny" : "Longitudinal sound wave diagram"}
            enableMobileZoom
            caption={lang === "cs" ? "ObrĂˇzek 2: PodĂ©lnĂˇ zvukovĂˇ vlna â€“ komprese a rarefakce." : "Figure 2: Longitudinal sound wave â€“ compression and rarefaction."}
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
            alt={lang === "cs" ? "Echogenita â€“ srovnĂˇnĂ­ jasovĂ˝ch ĂşrovnĂ­" : "Echogenicity â€“ comparison of brightness levels"}
            wrapClassName={styles.shoulderUltrasoundImageWrap}
            enableMobileZoom
            caption={lang === "cs" ? "ObrĂˇzek: ZĂˇkladnĂ­ ĂşrovnÄ› echogenity." : "Figure: Basic echogenicity levels."}
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
                ? `PolohovĂˇnĂ­ pacienta: ${localize(node.title, lang)}`
                : `Patient positioning: ${localize(node.title, lang)}`
            }
            wrapClassName={styles.shoulderUltrasoundImageWrap}
            enableMobileZoom
            caption={
              jointPositioning.imageBaseName === "rameno"
                ? shoulderPositioningZoomCaption[lang]
                : lang === "cs"
                  ? `PolohovĂˇnĂ­ pacienta - ${localize(node.title, lang)}`
                  : `Patient positioning - ${localize(node.title, lang)}`
            }
          />
          <h2>{lang === "cs" ? "Pozice a jejich vyuĹľitĂ­" : "Positions and their use"}</h2>
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
          <h2>{lang === "cs" ? "VyĹˇetĹ™ovacĂ­ protokol" : "Examination protocol"}</h2>
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
          <h2>{localized("VyĹˇetĹ™ovacĂ­ protokol")[lang]}</h2>
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
          <h2>{lang === "cs" ? "Ăšvod" : "Introduction"}</h2>
          <ul className={styles.compactList}>
            {shoulderIntroPoints[lang].map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <h2>{lang === "cs" ? "NejÄŤastÄ›jĹˇĂ­ patologie" : "Most common pathologies"}</h2>
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
            <h3 className={styles.anatomySubheading}>{lang === "cs" ? "RotĂˇtorovĂˇ manĹľeta" : "Rotator cuff"}</h3>
            <ul className={styles.compactList}>
              {shoulderAnatomyMuscles[lang].cuff.map((item) => (
                renderAnatomyListItem(item)
              ))}
            </ul>
            <h3 className={styles.anatomySubheading}>{lang === "cs" ? "DalĹˇĂ­ dĹŻleĹľitĂ© svaly" : "Other key muscles"}</h3>
            <ul className={styles.compactList}>
              {shoulderAnatomyMuscles[lang].other.map((item) => (
                renderAnatomyListItem(item)
              ))}
            </ul>
            <div
              className={`${styles.swipeGallery} ${styles.anatomyGallery}`}
              aria-label={lang === "cs" ? "Galerie svalĹŻ ramene" : "Shoulder muscle gallery"}
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
                Ă—
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
                aria-label={lang === "cs" ? "PĹ™edchozĂ­ obrĂˇzek" : "Previous image"}
              >
                â€ą
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
                aria-label={lang === "cs" ? "DalĹˇĂ­ obrĂˇzek" : "Next image"}
              >
                â€ş
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
            <h2>{lang === "cs" ? "AnatomickĂ˝ pĹ™ehled" : "Anatomical overview"}</h2>
            <h3 className={styles.anatomySubheading}>{lang === "cs" ? "RelevantnĂ­ klouby loketnĂ­ho komplexu" : "Relevant joints of the elbow complex"}</h3>
            <ul className={styles.compactList}>
              {elbowAnatomyJoints[lang].map((item) => (
                renderAnatomyListItem(item)
              ))}
            </ul>
            <p>{elbowAnatomyUltrasoundFocus[lang]}</p>
          </section>
          <section className={styles.anatomyCard}>
            <h2>{lang === "cs" ? "KostnĂ­ landmarky" : "Bony landmarks"}</h2>
            <p>{elbowAnatomyLandmarkLead[lang]}</p>
            <ul className={styles.compactList}>
              {elbowAnatomyLandmarks[lang].map((item) => (
                renderAnatomyListItem(item)
              ))}
            </ul>
          </section>
          <section className={styles.anatomyCard}>
            <h2>{lang === "cs" ? "Svaly" : "Muscles"}</h2>
            <h3 className={styles.anatomySubheading}>{lang === "cs" ? "HlavnĂ­ svalovĂ© skupiny" : "Key muscle groups"}</h3>
            <ul className={styles.compactList}>
              {elbowAnatomyMuscles[lang].primary.map((item) => (
                renderAnatomyListItem(item)
              ))}
            </ul>
            <h3 className={styles.anatomySubheading}>{lang === "cs" ? "DalĹˇĂ­ dĹŻleĹľitĂ© svaly" : "Other important muscles"}</h3>
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
