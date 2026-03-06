const pathMatchers: Array<(path: string) => boolean> = [
  (path) => path === "/basics/ultrazvukovy-obraz/ultrazvukove-sondy/typy-sond",
  (path) => path === "/basics/ultrazvukovy-obraz/ultrazvukove-sondy/pohyby-sondou",
  (path) => path === "/basics/knobologie",
  (path) => /^\/klouby\/(rameno|loket|zapesti|kycel|koleno|kotnik)\/video-tutorial$/.test(path),
  (path) => path === "/svaly/biceps-brachii/video-tutorial",
  (path) => path === "/periferni-nervy/nervus-medianus/video-tutorial",
  (path) => path === "/klouby/rameno/vysetrovaci-protokol",
  (path) => path === "/klouby/rameno/uvod",
  (path) => /^\/klouby\/(loket|zapesti|kycel|koleno|kotnik)\/uvod$/.test(path),
  (path) => /^\/klouby\/(loket|zapesti|kycel|koleno|kotnik)\/vysetrovaci-protokol$/.test(path)
];

export const hasContentForPath = (path: string): boolean => pathMatchers.some((matches) => matches(path));
