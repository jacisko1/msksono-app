import { ContentPlaceholder } from "../components/ContentPlaceholder";
import { PageHeader } from "../components/PageHeader";
import { useLanguage } from "../data/language";
import { findNavItem, localize } from "../data/navigation";
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

const assetPath = (folder: string, file: string) =>
  `/assets/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;

const makeResponsiveImage = (folder: string, baseName: string): ResponsiveImageSet => ({
  mobile: assetPath(folder, `${baseName}_mobile.webp`),
  tablet: assetPath(folder, `${baseName}_tablet.webp`),
  pc: assetPath(folder, `${baseName}_pc.webp`)
});

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

function ResponsiveImage({
  image,
  alt,
  wrapClassName
}: {
  image: ResponsiveImageSet;
  alt: string;
  wrapClassName?: string;
}) {
  const wrapClass = wrapClassName ? `${styles.inlineImageWrap} ${wrapClassName}` : styles.inlineImageWrap;

  return (
    <picture className={wrapClass}>
      <source media="(max-width: 640px)" srcSet={image.mobile} />
      <source media="(max-width: 1024px)" srcSet={image.tablet} />
      <img className={styles.inlineImage} src={image.pc} alt={alt} loading="lazy" decoding="async" />
    </picture>
  );
}

export default function ContentPage({ path }: ContentPageProps) {
  const { lang, t } = useLanguage();
  const node = findNavItem(path);
  const isShoulderVideo = path === "/klouby/rameno/video-tutorial";
  const isShoulderUltrasoundPage = path === "/klouby/rameno/vysetrovaci-protokol";
  const isShoulderIntroPage = path === "/klouby/rameno/uvod";
  const isShoulderAnatomyPage = path === "/klouby/rameno/anatomie";
  const isProbesPage = path === "/basics/sondy";
  const isProbeMovementsPage = path === "/basics/pohyby-sondou";
  const isKnobologyPage = path === "/basics/knobologie";

  if (!node) {
    return <ContentPlaceholder title={t("pageNotFound")} />;
  }

  if (isShoulderVideo) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        <section className={styles.videoBox}>
          <div className={styles.videoWrap}>
            <iframe
              src="https://www.youtube-nocookie.com/embed/TCpKWtJ9g9A"
              title="Rameno video tutorial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </section>
      </section>
    );
  }

  if (isProbesPage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
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
      </section>
    );
  }

  if (isProbeMovementsPage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
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
      </section>
    );
  }

  if (isKnobologyPage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
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
      </section>
    );
  }

  if (isShoulderUltrasoundPage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        <section className={styles.articleBox}>
          <h2>{lang === "cs" ? "Vyšetřovací protokol" : "Examination protocol"}</h2>
          <ol className={styles.compactList}>
            {shoulderProtocolSteps[lang].map((step) => (
              <li key={step.view}>
                {step.view}
                <ol type="A" className={styles.compactList}>
                  {step.planes.map((plane) => (
                    <li key={plane}>{plane}</li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
          <div className={`${styles.knobologyGrid} ${styles.shoulderUltrasoundGrid}`}>
            {shoulderUltrasoundImages.map((item) => (
              <article key={item.key} className={`${styles.knobologyCard} ${styles.shoulderUltrasoundCard}`}>
                <ResponsiveImage
                  image={makeResponsiveImage("shoulder", item.key)}
                  alt={item.title[lang]}
                  wrapClassName={styles.shoulderUltrasoundImageWrap}
                />
                <div className={styles.articleBody}>
                  <h3>{item.caption[lang].heading}</h3>
                  {item.caption[lang].bullets.length > 0 && (
                    <ul className={styles.compactList}>
                      {item.caption[lang].bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
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
      </section>
    );
  }

  if (isShoulderAnatomyPage) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        <section className={styles.emptyBox} />
      </section>
    );
  }

  return (
    <section className={styles.stack}>
      <PageHeader title={localize(node.title, lang)} color={node.color} />
      <section className={styles.emptyBox} />
    </section>
  );
}
