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
  body: { cs: string; en: string };
}

interface MovementSection {
  title: { cs: string; en: string };
  image: ResponsiveImageSet;
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
      cs: "Vysokofrekvenční sonda představuje variantu lineární sondy pracující s velmi vysokými frekvencemi, což umožňuje mimořádně detailní zobrazení povrchově uložených struktur. V MSK sonografii je využívána především k hodnocení drobných šlach, vazů, nervů, kožních a podkožních struktur nebo malých kloubů. Její hlavní nevýhodou je velmi omezená hloubková penetrace, která neumožňuje spolehlivé zobrazení hlubších anatomických struktur.",
      en: "A high-frequency probe is a linear variant working with very high frequencies, enabling highly detailed imaging of superficial structures. In MSK ultrasound, it is mainly used for small tendons, ligaments, nerves, skin and subcutaneous tissues, and small joints. Its main limitation is low penetration depth for deeper structures."
    }
  },
  {
    title: { cs: "Lineární sonda", en: "Linear probe" },
    image: makeResponsiveImage("Probes", "linear probe"),
    body: {
      cs: "Lineární sonda je nejčastěji používaným typem sondy v muskuloskeletální sonografii díky vysokému rozlišení v povrchových vrstvách. Pracuje s vysokými frekvencemi, které umožňují detailní zobrazení šlach, vazů, nervů, svalů a kloubních pouzder v mělké hloubce. Její hlavní výhodou je výborná prostorová a kontrastní rozlišovací schopnost, nevýhodou naopak omezená penetrační schopnost do větší hloubky, což může ztížit vyšetření hluboko uložených struktur u obézních pacientů nebo v oblasti kyčle. V MSK sonografii je lineární sonda základním nástrojem pro rutinní diagnostiku povrchových měkkotkáňových struktur a dynamické vyšetření.",
      en: "The linear probe is the most commonly used transducer in musculoskeletal ultrasound due to high superficial resolution. It uses high frequencies to visualize tendons, ligaments, nerves, muscles, and joint capsules in shallow depth. Its advantage is excellent spatial and contrast resolution; its limitation is reduced penetration for deeper structures."
    }
  },
  {
    title: { cs: "Konvexní sonda", en: "Convex probe" },
    image: makeResponsiveImage("Probes", "konex probe"),
    body: {
      cs: "Konvexní sonda se vyznačuje zakřiveným tvarem a širším zorným polem v hloubce, což umožňuje lepší přehled o hlubších anatomických strukturách. V muskuloskeletální sonografii nachází uplatnění zejména při orientačním zobrazení hluboko uložených oblastí a při vyšetření objemnějších kloubů nebo svalových skupin. Její nevýhodou je nižší prostorové rozlišení oproti lineární sondě, zejména v povrchových vrstvách, což omezuje detailní hodnocení jemných šlachových a ligamentózních struktur.",
      en: "The convex probe has a curved footprint and wider deep field of view, making it useful for deeper anatomy in MSK scanning. It is mainly used for deeper regions and larger joints or muscle groups. The tradeoff is lower spatial resolution than a linear probe, especially superficially."
    }
  }
];

const movements: MovementSection[] = [
  {
    title: { cs: "Sliding (klouzání)", en: "Sliding" },
    image: makeResponsiveImage("Probe movements", "01_slide"),
    body: {
      cs: "Sliding (klouzání) je pohyb sondy v její dlouhé ose, při kterém dochází k plynulému posunu sondy po kůži bez změny její orientace nebo náklonu. Ultrazvukový paprsek zůstává veden ve stejné rovině, což umožňuje kontinuální sledování anatomických struktur. Tento pohyb je zásadní pro orientaci v terénu a pochopení prostorových vztahů. V muskuloskeletálním ultrazvuku se sliding využívá zejména k trasování nervů, šlach, svalů a cév, ke sledování jejich průběhu v celé délce a k vyhledávání fokálních změn, ruptur nebo ztluštění.",
      en: "Sliding is probe motion along its long axis without changing tilt or orientation. The beam stays in one plane and supports continuous tracking of structures."
    }
  },
  {
    title: { cs: "Rocking (heel-toe)", en: "Rocking (heel-toe)" },
    image: makeResponsiveImage("Probe movements", "02_rock"),
    body: {
      cs: "Rocking (heel-toe) je pohyb sondy v její dlouhé ose, při kterém se sonda naklání střídavě na jednu a druhou hranu, aniž by se posouvala po kůži. Tím se mění úhel dopadu ultrazvukového paprsku na vyšetřovanou strukturu. Tento manévr je klíčový zejména pro potlačení anizotropie šlach a vazů, které se při nekolmém dopadu paprsku mohou jevit falešně hypoechogenní. Jemným rockingem lze zvýraznit fibrilární strukturu a odlišit artefakt od skutečné patologie.",
      en: "Rocking tilts the probe on alternating edges without skin translation. It is key for reducing tendon and ligament anisotropy."
    }
  },
  {
    title: { cs: "Sweeping (přeskenování)", en: "Sweeping" },
    image: makeResponsiveImage("Probe movements", "03_sweep"),
    body: {
      cs: "Sweeping (přeskenování) je pohyb sondy v krátké ose, při kterém se sonda posouvá kolmo ke své dlouhé ose bez změny náklonu či orientace. Dochází tak k postupnému zobrazení vyšetřované oblasti v sérii sousedních řezů. Tento pohyb umožňuje systematické vyhledávání patologií, které by mohly být při statickém zobrazení přehlédnuty. V muskuloskeletálním ultrazvuku se sweeping používá k hodnocení šlach, svalů, nervů i tekutinových kolekcí a k porovnání symetrických oblastí.",
      en: "Sweeping moves the probe in short-axis translation, creating adjacent slices to systematically search for pathology."
    }
  },
  {
    title: { cs: "Faning (vějířování)", en: "Faning" },
    image: makeResponsiveImage("Probe movements", "04_fan"),
    body: {
      cs: "Faning (vějířování) je naklánění sondy v krátké ose, při kterém zůstává místo kontaktu se kůží zachováno, ale mění se úhel insonace ze strany na stranu. Tento manévr umožňuje optimalizovat dopad ultrazvukového paprsku na struktury náchylné k anizotropii, zejména šlachy a vazy. Faning pomáhá vyrušit falešnou hypoechogenitu, zpřesnit posouzení kontinuity vláken a lépe zobrazit okraje šlach a jejich úpony.",
      en: "Faning changes insonation angle around a fixed skin contact point and helps optimize tendon and ligament visualization."
    }
  },
  {
    title: { cs: "Komprese", en: "Compression" },
    image: makeResponsiveImage("Probe movements", "05_compression"),
    body: {
      cs: "Komprese je pohyb sondy v ose Z, při kterém je na tkáně vyvíjen řízený tlak kolmo do hloubky. Tento manévr slouží k hodnocení kompresibility struktur a k rozlišení tekutinových a solidních útvarů. Komprese je užitečná při vyšetření burzitid, hematomů, cyst i ruptur šlach. Specifickým využitím je sonopalpace, kdy tlakem sondy vyvoláme bolest odpovídající pacientovým obtížím, případně sono-Tinelův příznak při vyšetření nervů.",
      en: "Compression is controlled pressure in the Z-axis, useful for assessing compressibility and differentiating fluid from solid findings."
    }
  },
  {
    title: { cs: "Dekomprese", en: "Decompression" },
    image: makeResponsiveImage("Probe movements", "06_decompression"),
    body: {
      cs: "Dekomprese je opačný pohyb sondy v ose Z, při kterém dochází k uvolnění tlaku vyvíjeného na vyšetřovanou oblast. Tento manévr je zásadní zejména při hodnocení cév, protože nadměrná komprese může vést k jejich kolapsu. Po uvolnění tlaku se cévy znovu rozepnou, což je důležité pro správné zobrazení v Dopplerovských režimech. Dekomprese rovněž zvyšuje detekovatelnost tekutinových kolekcí, které se po uvolnění tlaku lépe redistribuují.",
      en: "Decompression releases pressure and is essential in vascular and Doppler assessment where overcompression may collapse vessels."
    }
  },
  {
    title: { cs: "Rotace (helikoptéra)", en: "Rotation (helicopter)" },
    image: makeResponsiveImage("Probe movements", "07_helicopter"),
    body: {
      cs: "Rotace (helikoptéra) je pohyb sondy, při kterém se sonda otáčí kolem svého středu bez posunu po kůži. Tento manévr umožňuje plynulou změnu roviny zobrazení, typicky z příčné do podélné a naopak, přičemž sledovaná struktura zůstává ve středu obrazu. Rotace je klíčová pro sledování kontinuity šlach, nervů a cév, pro ověření anatomických vztahů a pro správnou prostorovou orientaci při vyšetření.",
      en: "Rotation turns the probe around its center to switch between transverse and longitudinal planes while keeping the structure centered."
    }
  },
  {
    title: { cs: "Wiper (stěrače, kružítko)", en: "Wiper" },
    image: makeResponsiveImage("Probe movements", "08_wiper"),
    body: {
      cs: "Wiper (stěrače, kružítko) je rotační pohyb sondy, při kterém zůstává jedna její strana fixována na místě, zatímco opačná strana opisuje oblouk nebo kruhový pohyb. Tento manévr umožňuje měnit úhel insonace při zachování kontaktu s důležitým anatomickým orientačním bodem. Je velmi užitečný při vyšetření vějířovitě uspořádaných svalů a šlach nebo oblastí s komplexní anatomií, kde umožňuje systematické hodnocení bez ztráty orientace.",
      en: "Wiper keeps one probe edge fixed while the other sweeps in an arc, preserving orientation in complex anatomy."
    }
  }
];

const knobologyItems = [
  "ABC",
  "CD",
  "Clip",
  "Depth",
  "Double screen",
  "Focus",
  "Freeze",
  "Frequency",
  "Gain",
  "Measure",
  "PD",
  "Pictogram",
  "Power",
  "Print",
  "Probes",
  "Single screen",
  "Store",
  "SWE",
  "Zoom"
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
  const isShoulderEmpty =
    path === "/klouby/rameno/uvod" ||
    path === "/klouby/rameno/anatomie";
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
              ? "Před zahájením ultrazvukového vyšetření je důležité krátce se seznámit s typy ultrazvukových sond, protože jejich volba zásadně ovlivňuje kvalitu zobrazení a správnou interpretaci nálezu. V muskuloskeletální sonografii se používají základní typy sond: lineární, konvexní a vysokofrekvenční. Každá z nich má odlišné technické vlastnosti a zobrazovací charakteristiky, které je nutné znát již na začátku výuky, aby vyšetření bylo systematické, reprodukovatelné a diagnosticky přínosné."
              : "Before starting an ultrasound examination, it is important to understand probe types, since probe selection strongly affects image quality and interpretation. In musculoskeletal ultrasound, the key probe types are linear, convex, and high-frequency."}
          </p>
          <div className={styles.articleGrid}>
            {probes.map((probe) => (
              <article key={probe.title.en} className={styles.articleCard}>
                <ResponsiveImage
                  image={probe.image}
                  alt={probe.title[lang]}
                  wrapClassName={styles.probeImageWrap}
                />
                <div className={styles.articleBody}>
                  <h3>{probe.title[lang]}</h3>
                  <p>{probe.body[lang]}</p>
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
                  <p>{movement.body[lang]}</p>
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
          <h2>{lang === "cs" ? "Knobologie" : "Knobology"}</h2>
          <div className={styles.knobologyGrid}>
            {knobologyItems.map((item) => (
              <article key={item} className={styles.knobologyCard}>
                <ResponsiveImage image={makeResponsiveImage("Knobology", item)} alt={item} />
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
