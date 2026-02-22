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
      { title: { cs: "Sondy", en: "Probes" }, path: "/basics/sondy" },
      { title: { cs: "Pohyby sondou", en: "Probe movements" }, path: "/basics/pohyby-sondou" },
      { title: { cs: "Knobologie", en: "Knobology" }, path: "/basics/knobologie" }
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
          { title: { cs: "Video tutorial", en: "Video tutorial" }, path: "/klouby/rameno/video-tutorial" },
          {
            title: { cs: "Vyšetřovací protokol", en: "Examination protocol" },
            path: "/klouby/rameno/vysetrovaci-protokol"
          }
        ]
      },
      { title: { cs: "Loket", en: "Elbow" }, path: "/klouby/loket" },
      { title: { cs: "Zápěstí a ruka", en: "Wrist and hand" }, path: "/klouby/zapesti" },
      { title: { cs: "Kyčel", en: "Hip" }, path: "/klouby/kycel" },
      { title: { cs: "Koleno", en: "Knee" }, path: "/klouby/koleno" },
      { title: { cs: "Kotník a noha", en: "Ankle and foot" }, path: "/klouby/kotnik" }
    ])
  },
  {
    title: { cs: "Nervy", en: "Nerves" },
    path: "/periferni-nervy",
    section: "periferni-nervy",
    color: "#d2be00",
    children: withSection("periferni-nervy", "#d2be00", [
      {
        title: { cs: "Úvod", en: "Introduction" },
        path: "/periferni-nervy/uvod",
        children: [
          {
            title: { cs: "Význam a indikace", en: "Importance and indications" },
            path: "/periferni-nervy/uvod/vyznam-a-indikace"
          },
          { title: { cs: "Sonoanatomie", en: "Sonoanatomy" }, path: "/periferni-nervy/uvod/sonoanatomie" },
          { title: { cs: "Sonopatologie", en: "Sonopathology" }, path: "/periferni-nervy/uvod/sonopatologie" },
          {
            title: { cs: "Technické principy", en: "Technical principles" },
            path: "/periferni-nervy/uvod/technicke-principy"
          },
          { title: { cs: "Plexy", en: "Plexuses" }, path: "/periferni-nervy/uvod/plexy" }
        ]
      },
      { title: { cs: "Nervus medianus", en: "Median nerve" }, path: "/periferni-nervy/nervus-medianus" },
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
      { title: { cs: "Horní končetina", en: "Upper limb" }, path: "/svaly/horni-koncetina" },
      { title: { cs: "Dolní končetina", en: "Lower limb" }, path: "/svaly/dolni-koncetina" }
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
