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

const shoulderUltrasoundImages = [
  {
    key: "01_anterior_view_transverse_plane",
    title: { cs: "Predni pohled - transversalni rovina", en: "Anterior view - transverse plane" }
  },
  {
    key: "02_anterior_view_transverse_plane_2",
    title: { cs: "Predni pohled - transversalni rovina 2", en: "Anterior view - transverse plane 2" }
  },
  {
    key: "03_anterior_view_longitudinal_plane",
    title: { cs: "Predni pohled - longitudinalni rovina", en: "Anterior view - longitudinal plane" }
  },
  {
    key: "04_anterior_view_longitudinal_plane_2",
    title: { cs: "Predni pohled - longitudinalni rovina 2", en: "Anterior view - longitudinal plane 2" }
  },
  {
    key: "05_lateral_view_transverse_plane",
    title: { cs: "Lateralni pohled - transversalni rovina", en: "Lateral view - transverse plane" }
  },
  {
    key: "06_lateral_view_longitudinal_plane",
    title: { cs: "Lateralni pohled - longitudinalni rovina", en: "Lateral view - longitudinal plane" }
  },
  {
    key: "07_posterior_view_transverse_plane",
    title: { cs: "Posteriorni pohled - transversalni rovina", en: "Posterior view - transverse plane" }
  },
  {
    key: "08_posterior_view_transverse_plane_2",
    title: { cs: "Posteriorni pohled - transversalni rovina 2", en: "Posterior view - transverse plane 2" }
  }
];

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
  const isShoulderEmpty = path === "/klouby/rameno/uvod" || path === "/klouby/rameno/anatomie";
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
          <h2>{lang === "cs" ? "0.1 Ultrazvukové sondy" : "0.1 Ultrasound probes"}</h2>
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
          <h2>{lang === "cs" ? "0.2 Pohyby sondou" : "0.2 Probe movements"}</h2>
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
          <h2>{lang === "cs" ? "0.3 Knobologie" : "0.3 Knobology"}</h2>
          <p>
            {lang === "cs"
              ? "Správná knobologie je základ kvalitního obrazu. Ovládací prvky jsou seřazené podle pořadí v textu a každý je přiřazen k odpovídajícímu obrázku."
              : "Proper knobology is essential for image quality. Controls are ordered to match the learning text and paired with the corresponding image."}
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
          <h2>{lang === "cs" ? "Ultrazvukove obrazky ramene" : "Shoulder ultrasound images"}</h2>
          <div className={`${styles.knobologyGrid} ${styles.shoulderUltrasoundGrid}`}>
            {shoulderUltrasoundImages.map((item) => (
              <article key={item.key} className={`${styles.knobologyCard} ${styles.shoulderUltrasoundCard}`}>
                <ResponsiveImage
                  image={makeResponsiveImage("shoulder", item.key)}
                  alt={item.title[lang]}
                  wrapClassName={styles.shoulderUltrasoundImageWrap}
                />
              </article>
            ))}
          </div>
        </section>
      </section>
    );
  }

  if (isShoulderEmpty) {
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
