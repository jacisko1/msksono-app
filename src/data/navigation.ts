import type { Locale } from "./language";

export type SectionKey = "basics" | "klouby" | "periferni-nervy" | "svaly";

export interface LocalizedLabel {
  cs: string;
  en: string;
}

export interface NavItem {
  title: LocalizedLabel;
  path: string;
  section: SectionKey;
  color: string;
  children?: NavItem[];
}

interface RawNavItem {
  title: LocalizedLabel;
  path: string;
  children?: RawNavItem[];
}

const withSection = (section: SectionKey, color: string, items: RawNavItem[]): NavItem[] =>
  items.map((item) => ({
    ...item,
    section,
    color,
    children: item.children ? withSection(section, color, item.children) : undefined
  }));

const nerveChildren = (basePath: string): RawNavItem[] => [
  {
    title: { cs: "Motorická inervace", en: "Motor innervation" },
    path: `${basePath}/motoricka-inervace`
  },
  {
    title: { cs: "Senzitivní inervace", en: "Sensory innervation" },
    path: `${basePath}/senzitivni-inervace`
  },
  {
    title: { cs: "Anatomický průběh", en: "Anatomical course" },
    path: `${basePath}/anatomicky-prubeh`
  },
  {
    title: { cs: "Ultrazvukové vyšetření", en: "Ultrasound examination" },
    path: `${basePath}/ultrazvukove-vysetreni`
  },
  {
    title: { cs: "Video tutorial", en: "Video tutorial" },
    path: `${basePath}/video-tutorial`
  },
  {
    title: { cs: "Místa útlaku", en: "Entrapment sites" },
    path: `${basePath}/mista-utlaku`
  }
];

export const navigationTree: NavItem[] = [
  {
    title: { cs: "Základy", en: "Basics" },
    path: "/basics",
    section: "basics",
    color: "#209069",
    children: withSection("basics", "#209069", [
      {
        title: { cs: "Fyzikalni principy", en: "Physical principles" },
        path: "/basics/fyzikalni-principy",
        children: [
          { title: { cs: "Ultrazvuk", en: "Ultrasound" }, path: "/basics/fyzikalni-principy/ultrazvuk" },
          { title: { cs: "Zvukova vlna", en: "Sound wave" }, path: "/basics/fyzikalni-principy/zvukova-vlna" },
          { title: { cs: "Rychlost zvuku", en: "Speed of sound" }, path: "/basics/fyzikalni-principy/rychlost-zvuku" },
          { title: { cs: "Akusticka impedance", en: "Acoustic impedance" }, path: "/basics/fyzikalni-principy/akusticka-impedance" },
          { title: { cs: "Odraz", en: "Reflection" }, path: "/basics/fyzikalni-principy/odraz" },
          { title: { cs: "Lom", en: "Refraction" }, path: "/basics/fyzikalni-principy/lom" }
        ]
      },
      {
        title: { cs: "Ultrazvukovy obraz", en: "Ultrasound image" },
        path: "/basics/ultrazvukovy-obraz",
        children: [
          { title: { cs: "Orientace v obraze", en: "Image orientation" }, path: "/basics/ultrazvukovy-obraz/orientace-v-obrazu" },
          { title: { cs: "Echogenita", en: "Echogenicity" }, path: "/basics/ultrazvukovy-obraz/echogenita" },
          {
            title: { cs: "Ultrazvukov\u00e9 sondy", en: "Ultrasound probes" },
            path: "/basics/ultrazvukovy-obraz/ultrazvukove-sondy",
            children: [
              { title: { cs: "Typy sond", en: "Probe types" }, path: "/basics/ultrazvukovy-obraz/ultrazvukove-sondy/typy-sond" },
              {
                title: { cs: "Pohyby sondou", en: "Probe movements" },
                path: "/basics/ultrazvukovy-obraz/ultrazvukove-sondy/pohyby-sondou"
              },
              { title: { cs: "Dr\u017een\u00ed sondy", en: "Probe grip" }, path: "/basics/ultrazvukovy-obraz/ultrazvukove-sondy/drzeni-sondy" },
              {
                title: { cs: "Orientace sondy", en: "Probe orientation" },
                path: "/basics/ultrazvukovy-obraz/ultrazvukove-sondy/orientace-sondy"
              }
            ]
          }
        ]
      },
      { title: { cs: "Vyšetřované struktury", en: "Examined structures" }, path: "/basics/vysetrovane-struktury" },
      { title: { cs: "Knobologie", en: "Knobology" }, path: "/basics/knobologie" },
      { title: { cs: "Artefakty", en: "Artifacts" }, path: "/basics/artefakty"  },
      { title: { cs: "Poloha pacienta", en: "Patient positioning" }, path: "/basics/poloha-pacienta" },
      { title: { cs: "Ergonomie vyšetření", en: "Examination ergonomics" }, path: "/basics/ergonomie-vysetreni" },
      { title: { cs: "Metaforické pomůcky", en: "Metaphorical aids" }, path: "/basics/metaforicke-pomucky" },
      { title: { cs: "Fantomy", en: "Phantoms" }, path: "/basics/fantomy" },

    ])
  },
  {
    title: { cs: "Klouby", en: "Joints" },
    path: "/klouby",
    section: "klouby",
    color: "#00626c",
    children: withSection("klouby", "#00626c", [
      {
        title: { cs: "Rameno", en: "Shoulder" },
        path: "/klouby/rameno",
        children: [
          { title: { cs: "Úvod", en: "Introduction" }, path: "/klouby/rameno/uvod" },
          { title: { cs: "Anatomie", en: "Anatomy" }, path: "/klouby/rameno/anatomie" },
            { title: { cs: "Polohování", en: "Positioning" }, path: "/klouby/rameno/polohovani" },
          { title: { cs: "Video tutorial", en: "Video tutorial" }, path: "/klouby/rameno/video-tutorial" },
          {
            title: { cs: "Protokol", en: "Protocol" },
            path: "/klouby/rameno/vysetrovaci-protokol"
          },
          { title: { cs: "Nejčastější patologie", en: "Most common pathologies" }, path: "/klouby/rameno/nejcastejsi-patologie" }
        ]
      },
      {
        title: { cs: "Loket", en: "Elbow" },
        path: "/klouby/loket",
        children: [
          { title: { cs: "Úvod", en: "Introduction" }, path: "/klouby/loket/uvod" },
          { title: { cs: "Anatomie", en: "Anatomy" }, path: "/klouby/loket/anatomie" },
            { title: { cs: "Polohování", en: "Positioning" }, path: "/klouby/loket/polohovani" },
          { title: { cs: "Video tutorial", en: "Video tutorial" }, path: "/klouby/loket/video-tutorial" },
          { title: { cs: "Protokol", en: "Protocol" }, path: "/klouby/loket/vysetrovaci-protokol" },
          { title: { cs: "Nejčastější patologie", en: "Most common pathologies" }, path: "/klouby/loket/nejcastejsi-patologie" }
        ]
      },
      {
        title: { cs: "Zápěstí a ruka", en: "Wrist and hand" },
        path: "/klouby/zapesti",
        children: [
          { title: { cs: "Úvod", en: "Introduction" }, path: "/klouby/zapesti/uvod" },
          { title: { cs: "Anatomie", en: "Anatomy" }, path: "/klouby/zapesti/anatomie" },
            { title: { cs: "Polohování", en: "Positioning" }, path: "/klouby/zapesti/polohovani" },
          { title: { cs: "Video tutorial", en: "Video tutorial" }, path: "/klouby/zapesti/video-tutorial" },
          { title: { cs: "Protokol", en: "Protocol" }, path: "/klouby/zapesti/vysetrovaci-protokol" },
          { title: { cs: "Nejčastější patologie", en: "Most common pathologies" }, path: "/klouby/zapesti/nejcastejsi-patologie" }
        ]
      },
      {
        title: { cs: "Kyčel", en: "Hip" },
        path: "/klouby/kycel",
        children: [
          { title: { cs: "Úvod", en: "Introduction" }, path: "/klouby/kycel/uvod" },
          { title: { cs: "Anatomie", en: "Anatomy" }, path: "/klouby/kycel/anatomie" },
            { title: { cs: "Polohování", en: "Positioning" }, path: "/klouby/kycel/polohovani" },
          { title: { cs: "Video tutorial", en: "Video tutorial" }, path: "/klouby/kycel/video-tutorial" },
          { title: { cs: "Protokol", en: "Protocol" }, path: "/klouby/kycel/vysetrovaci-protokol" },
          { title: { cs: "Nejčastější patologie", en: "Most common pathologies" }, path: "/klouby/kycel/nejcastejsi-patologie" }
        ]
      },
      {
        title: { cs: "Koleno", en: "Knee" },
        path: "/klouby/koleno",
        children: [
          { title: { cs: "Úvod", en: "Introduction" }, path: "/klouby/koleno/uvod" },
          { title: { cs: "Anatomie", en: "Anatomy" }, path: "/klouby/koleno/anatomie" },
            { title: { cs: "Polohování", en: "Positioning" }, path: "/klouby/koleno/polohovani" },
          { title: { cs: "Video tutorial", en: "Video tutorial" }, path: "/klouby/koleno/video-tutorial" },
          { title: { cs: "Protokol", en: "Protocol" }, path: "/klouby/koleno/vysetrovaci-protokol" },
          { title: { cs: "Nejčastější patologie", en: "Most common pathologies" }, path: "/klouby/koleno/nejcastejsi-patologie" }
        ]
      },
      {
        title: { cs: "Kotník a noha", en: "Ankle and foot" },
        path: "/klouby/kotnik",
        children: [
          { title: { cs: "Úvod", en: "Introduction" }, path: "/klouby/kotnik/uvod" },
          { title: { cs: "Anatomie", en: "Anatomy" }, path: "/klouby/kotnik/anatomie" },
            { title: { cs: "Polohování", en: "Positioning" }, path: "/klouby/kotnik/polohovani" },
          { title: { cs: "Video tutorial", en: "Video tutorial" }, path: "/klouby/kotnik/video-tutorial" },
          { title: { cs: "Protokol", en: "Protocol" }, path: "/klouby/kotnik/vysetrovaci-protokol" },
          { title: { cs: "Nejčastější patologie", en: "Most common pathologies" }, path: "/klouby/kotnik/nejcastejsi-patologie" }
        ]
      }
    ])
  },
  {
    title: { cs: "Nervy", en: "Nerves" },
    path: "/periferni-nervy",
    section: "periferni-nervy",
    color: "#d2be00",
    children: withSection("periferni-nervy", "#d2be00", [
      {
        title: { cs: "Nervus medianus", en: "Median nerve" },
        path: "/periferni-nervy/nervus-medianus",
        children: nerveChildren("/periferni-nervy/nervus-medianus")
      },
      {
        title: { cs: "Nervus ulnaris", en: "Ulnar nerve" },
        path: "/periferni-nervy/nervus-ulnaris",
        children: nerveChildren("/periferni-nervy/nervus-ulnaris")
      },
      {
        title: { cs: "Nervus radialis", en: "Radial nerve" },
        path: "/periferni-nervy/nervus-radialis",
        children: nerveChildren("/periferni-nervy/nervus-radialis")
      },
      {
        title: { cs: "Nervus femoralis", en: "Femoral nerve" },
        path: "/periferni-nervy/nervus-femoralis",
        children: nerveChildren("/periferni-nervy/nervus-femoralis")
      },
      {
        title: { cs: "Nervus ischiadicus", en: "Sciatic nerve" },
        path: "/periferni-nervy/nervus-ischiadicus",
        children: nerveChildren("/periferni-nervy/nervus-ischiadicus")
      },
      {
        title: { cs: "Nervus tibialis", en: "Tibial nerve" },
        path: "/periferni-nervy/nervus-tibialis",
        children: nerveChildren("/periferni-nervy/nervus-tibialis")
      },
      {
        title: { cs: "Nervus peroneus communis", en: "Common peroneal nerve" },
        path: "/periferni-nervy/nervus-peroneus-communis",
        children: nerveChildren("/periferni-nervy/nervus-peroneus-communis")
      }
    ])
  },
  {
    title: { cs: "Svaly", en: "Muscles" },
    path: "/svaly",
    section: "svaly",
    color: "#9a2626",
    children: withSection("svaly", "#9a2626", [
      {
        title: { cs: "Biceps brachii", en: "Biceps brachii" },
        path: "/svaly/biceps-brachii",
        children: [
          { title: { cs: "Úvod", en: "Introduction" }, path: "/svaly/biceps-brachii/uvod" },
          { title: { cs: "Anatomie", en: "Anatomy" }, path: "/svaly/biceps-brachii/anatomie" },
          { title: { cs: "Polohování", en: "Positioning" }, path: "/svaly/biceps-brachii/polohovani" },
          { title: { cs: "Video tutorial", en: "Video tutorial" }, path: "/svaly/biceps-brachii/video-tutorial" },
          { title: { cs: "Protokol", en: "Protocol" }, path: "/svaly/biceps-brachii/vysetrovaci-protokol" },
          { title: { cs: "Nejčastější patologie", en: "Most common pathologies" }, path: "/svaly/biceps-brachii/nejcastejsi-patologie" }
        ]
      }
    ])
  }
];

const flattenRecursive = (items: NavItem[]): NavItem[] =>
  items.flatMap((item) => [item, ...(item.children ? flattenRecursive(item.children) : [])]);

export const flatNavigation = flattenRecursive(navigationTree);

const pathMap = new Map(flatNavigation.map((item) => [item.path, item] as const));

export const localize = (label: LocalizedLabel, lang: Locale): string => label[lang];

export const findNavItem = (path: string): NavItem | undefined => {
  const cleaned = path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;
  return pathMap.get(cleaned);
};

export const getThemeColor = (path: string): string => findNavItem(path)?.color ?? "#00626c";

export const getBreadcrumbItems = (path: string): NavItem[] => {
  const cleaned = path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;
  if (cleaned === "/") {
    return [];
  }

  const segments = cleaned.split("/").filter(Boolean);
  let current = "";
  const crumbs: NavItem[] = [];

  for (const segment of segments) {
    current += `/${segment}`;
    const found = pathMap.get(current);
    if (found) {
      crumbs.push(found);
    }
  }

  return crumbs;
};
