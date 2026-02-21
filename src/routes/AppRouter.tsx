import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { useLanguage } from "../data/language";
import { flatNavigation, findNavItem } from "../data/navigation";
import { Layout } from "../layout/Layout";

const HomePage = lazy(() => import("../pages/HomePage"));
const SectionPage = lazy(() => import("../pages/SectionPage"));
const ContentPage = lazy(() => import("../pages/ContentPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const OfflinePage = lazy(() => import("../pages/OfflinePage"));

function LoadingFallback() {
  const { t } = useLanguage();
  return <p>{t("loading")}</p>;
}

function RoutedPage({ path }: { path: string }) {
  const node = findNavItem(path);

  if (!node) {
    return <NotFoundPage />;
  }

  return node.children?.length ? <SectionPage path={node.path} /> : <ContentPage path={node.path} />;
}

const allPaths = flatNavigation.map((item) => item.path);

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          {allPaths.map((path) => (
            <Route key={path} path={path.slice(1)} element={<RoutedPage path={path} />} />
          ))}
          <Route path="offline" element={<OfflinePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

