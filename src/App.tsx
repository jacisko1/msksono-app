import { AppRouter } from "./routes/AppRouter";
import { LanguageProvider } from "./data/language";

export default function App() {
  return (
    <LanguageProvider>
      <AppRouter />
    </LanguageProvider>
  );
}
