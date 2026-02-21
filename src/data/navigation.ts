export type SectionKey = "basics" | "klouby" | "periferni-nervy" | "svaly";

export interface NavItem {
  title: string;
  path: string;
  section: SectionKey;
  color: string;
  children?: NavItem[];
}

interface RawNavItem {
  title: string;
  path: string;
  children?: RawNavItem[];
}

const withSection = (
  section: SectionKey,
  color: string,
  items: RawNavItem[]
): NavItem[] =>
  items.map((item) => ({
    ...item,
    section,
    color,
    children: item.children ? withSection(section, color, item.children) : undefined
  }));

export const navigationTree: NavItem[] = [
  {
    title: "Basics",
    path: "/basics",
    section: "basics",
    color: "#209069",
    children: withSection("basics", "#209069", [
      { title: "Sondy", path: "/basics/sondy" },
      { title: "Pohyby sondou", path: "/basics/pohyby-sondou" },
      { title: "Knobologie", path: "/basics/knobologie" },
      { title: "Artefakty", path: "/basics/artefakty" }
    ])
  },
  {
    title: "Klouby",
    path: "/klouby",
    section: "klouby",
    color: "#00626c",
    children: withSection("klouby", "#00626c", [
      { title: "Rameno", path: "/klouby/rameno" },
      { title: "Loket", path: "/klouby/loket" },
      { title: "Zápěstí", path: "/klouby/zapesti" },
      { title: "Ruka", path: "/klouby/ruka" },
      { title: "Kyčel", path: "/klouby/kycel" },
      { title: "Koleno", path: "/klouby/koleno" },
      { title: "Kotník", path: "/klouby/kotnik" },
      { title: "Noha", path: "/klouby/noha" }
    ])
  },
  {
    title: "Periferní nervy",
    path: "/periferni-nervy",
    section: "periferni-nervy",
    color: "#d2be00",
    children: withSection("periferni-nervy", "#d2be00", [
      {
        title: "Úvod",
        path: "/periferni-nervy/uvod",
        children: [
          { title: "Význam a indikace", path: "/periferni-nervy/uvod/vyznam-a-indikace" },
          { title: "Sonoanatomie", path: "/periferni-nervy/uvod/sonoanatomie" },
          { title: "Sonopatologie", path: "/periferni-nervy/uvod/sonopatologie" },
          { title: "Technické principy", path: "/periferni-nervy/uvod/technicke-principy" },
          { title: "Plexy", path: "/periferni-nervy/uvod/plexy" }
        ]
      },
      { title: "Nervus medianus", path: "/periferni-nervy/nervus-medianus" },
      { title: "Nervus ulnaris", path: "/periferni-nervy/nervus-ulnaris" },
      { title: "Nervus radialis", path: "/periferni-nervy/nervus-radialis" },
      { title: "Nervus femoralis", path: "/periferni-nervy/nervus-femoralis" },
      { title: "Nervus ischiadicus", path: "/periferni-nervy/nervus-ischiadicus" },
      { title: "Nervus tibialis", path: "/periferni-nervy/nervus-tibialis" },
      { title: "Nervus peroneus communis", path: "/periferni-nervy/nervus-peroneus-communis" }
    ])
  },
  {
    title: "Svaly",
    path: "/svaly",
    section: "svaly",
    color: "#9a2626",
    children: withSection("svaly", "#9a2626", [
      { title: "Horní končetina", path: "/svaly/horni-koncetina" },
      { title: "Dolní končetina", path: "/svaly/dolni-koncetina" }
    ])
  }
];

const flattenRecursive = (items: NavItem[]): NavItem[] =>
  items.flatMap((item) => [item, ...(item.children ? flattenRecursive(item.children) : [])]);

export const flatNavigation = flattenRecursive(navigationTree);

export const pathMap = new Map(flatNavigation.map((item) => [item.path, item] as const));

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
