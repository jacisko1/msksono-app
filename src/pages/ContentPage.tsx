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

interface ProtocolStep {
  view: string;
  planes: string[];
}

interface JointProtocolImage {
  key: string;
  heading: string;
  bullets: string[];
}

interface JointContent {
  folder: string;
  introPoints: string[];
  pathologyPoints: string[];
  protocolSteps: ProtocolStep[];
  protocolImages: JointProtocolImage[];
}

const assetPath = (folder: string, file: string) =>
  `/assets/${folder.split("/").map(encodeURIComponent).join("/")}/${encodeURIComponent(file)}`;

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

const localized = <T,>(value: T) => ({ cs: value, en: value });

const jointContentBySlug: Record<string, JointContent> = {
  loket: {
    folder: "02_Elbow/protokol",
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
      { key: "08_Obrzek8", heading: "Obrázek 8. Dorzální pohled, sagitální rovina", bullets: ["Podélná dorzální projekce přes extenzorové šlachy a radiokarpální kloub s hodnocením tekutiny, zánětu a kontinuity šlach."] }
    ]
  },
  kycel: {
    folder: "04_Hip/protokol",
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
      { key: "05_Obrzek13", heading: "Obrázek 12. Dorzální pohled, sagitální rovina", bullets: ["T: šlacha hamstringů. Podélný pohled na úpon hamstringů na tuber ischiadicum pro hodnocení ruptur a tendinopatie."] }
    ]
  },
  koleno: {
    folder: "05_Knee/protokol",
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
      { key: "08_Obrzek8", heading: "Obrázek 8. Dorzální pohled, transverzální rovina", bullets: ["Příčný pohled svaly triceps surae vhodný pro myotendinózní poranění, atrofii a fibrotické změny."] }
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
  const jointIntroMatch = path.match(/^\/klouby\/(loket|zapesti|kycel|koleno|kotnik)\/uvod$/);
  const jointProtocolMatch = path.match(/^\/klouby\/(loket|zapesti|kycel|koleno|kotnik)\/vysetrovaci-protokol$/);
  const jointKey = jointProtocolMatch?.[1] ?? jointIntroMatch?.[1];
  const jointContent = jointKey ? jointContentBySlug[jointKey] : undefined;
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

  if (jointProtocolMatch && jointContent) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        <section className={styles.articleBox}>
          <h2>{localized("Vyšetřovací protokol")[lang]}</h2>
          <ol className={styles.compactList}>
            {jointContent.protocolSteps.map((step) => (
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
            {jointContent.protocolImages.map((item) => (
              <article key={item.key} className={`${styles.knobologyCard} ${styles.shoulderUltrasoundCard}`}>
                <ResponsiveImage
                  image={makeResponsiveImagePhone(jointContent.folder, item.key)}
                  alt={`${localize(node.title, lang)} ${item.key}`}
                  wrapClassName={styles.shoulderUltrasoundImageWrap}
                />
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
      </section>
    );
  }

  if (jointIntroMatch && jointContent) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        <section className={styles.articleBox}>
          <h2>{localized("Úvod")[lang]}</h2>
          <ul className={styles.compactList}>
            {jointContent.introPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <h2>{localized("Nejčastější patologie")[lang]}</h2>
          <ul className={styles.compactList}>
            {jointContent.pathologyPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
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
