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

export const navigationTree: NavItem[] = [
  {
    title: { cs: "Základy", en: "Basics" },
    path: "/basics",
    section: "basics",
    color: "#209069",
    children: withSection("basics", "#209069", [
      {
        title: { cs: "Princip UZ zobrazení", en: "US examination principles" },
        path: "/basics/princip-ultrazvukoveho-vysetreni"
      },
      { title: { cs: "Echogenita", en: "Echogenicity" }, path: "/basics/echogenita" },
      { title: { cs: "Orientace v obrazu", en: "Image orientation" }, path: "/basics/orientace-v-obrazu" },
      { title: { cs: "Vyšetřované struktury", en: "Examined structures" }, path: "/basics/vysetrovane-struktury" },
      { title: { cs: "Sondy", en: "Probes" }, path: "/basics/sondy" },
      { title: { cs: "Pohyby sondou", en: "Probe movements" }, path: "/basics/pohyby-sondou" },
      { title: { cs: "Držení sondy", en: "Probe grip" }, path: "/basics/drzeni-sondy" },
      { title: { cs: "Orientace sondy", en: "Probe orientation" }, path: "/basics/orientace-sondy" },
      { title: { cs: "Knobologie", en: "Knobology" }, path: "/basics/knobologie" },
      { title: { cs: "Artefakty", en: "Artifacts" }, path: "/basics/artefakty"  },
      { title: { cs: "Poloha pacienta", en: "Patient positioning" }, path: "/basics/poloha-pacienta" },
      { title: { cs: "Ergonomie vyšetření", en: "Examination ergonomics" }, path: "/basics/ergonomie-vysetreni" },
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
        children: [
          {
            title: { cs: "Motorická inervace", en: "Motor innervation" },
            path: "/periferni-nervy/nervus-medianus/motoricka-inervace"
          },
          {
            title: { cs: "Senzitivní inervace", en: "Sensory innervation" },
            path: "/periferni-nervy/nervus-medianus/senzitivni-inervace"
          },
          {
            title: { cs: "Anatomický průběh", en: "Anatomical course" },
            path: "/periferni-nervy/nervus-medianus/anatomicky-prubeh"
          },
          {
            title: { cs: "Ultrazvukové vyšetření", en: "Ultrasound examination" },
            path: "/periferni-nervy/nervus-medianus/ultrazvukove-vysetreni"
          },
          {
            title: { cs: "Video tutorial", en: "Video tutorial" },
            path: "/periferni-nervy/nervus-medianus/video-tutorial"
          },
          {
            title: { cs: "Místa útlaku", en: "Entrapment sites" },
            path: "/periferni-nervy/nervus-medianus/mista-utlaku"
          }
        ]
      },
      { title: { cs: "Nervus ulnaris", en: "Ulnar nerve" }, path: "/periferni-nervy/nervus-ulnaris" },
      { title: { cs: "Nervus radialis", en: "Radial nerve" }, path: "/periferni-nervy/nervus-radialis" },
      { title: { cs: "Nervus femoralis", en: "Femoral nerve" }, path: "/periferni-nervy/nervus-femoralis" },
      { title: { cs: "Nervus ischiadicus", en: "Sciatic nerve" }, path: "/periferni-nervy/nervus-ischiadicus" },
      { title: { cs: "Nervus tibialis", en: "Tibial nerve" }, path: "/periferni-nervy/nervus-tibialis" },
      {
        title: { cs: "Nervus peroneus communis", en: "Common peroneal nerve" },
        path: "/periferni-nervy/nervus-peroneus-communis"
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
          { title: { cs: "Video tutorial", en: "Video tutorial" }, path: "/svaly/biceps-brachii/video-tutorial" },
          { title: { cs: "Protokol", en: "Protocol" }, path: "/svaly/biceps-brachii/vysetrovaci-protokol" }
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

