import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { LanguageProvider } from "./context/LanguageContext";
import usePageTracker from "./hooks/usePageTracker";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import ScrollToTop from "./components/ScrollToTop";
import CookieConsent from "./components/CookieConsent";
import ErrorBoundary from "./components/ErrorBoundary";

// Critical: Home loaded eagerly (first page users see)
import Home from "./pages/Home.jsx";

// Lazy-loaded pages (only downloaded when visited)
const BlogPage = lazy(() => import("./pages/BlogPage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));
const ImpressumPage = lazy(() => import("./pages/ImpressumPage"));
const DatenschutzPage = lazy(() => import("./pages/DatenschutzPage"));
const AGBPage = lazy(() => import("./pages/AGBPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NewsletterUnsubscribe = lazy(() => import("./pages/NewsletterUnsubscribe"));
const SerbiaExecutivePage = lazy(() => import("./pages/SerbiaExecutivePage"));
const CryptoBankingPage = lazy(() => import("./pages/CryptoBankingPage"));
const CryptoCompliancePage = lazy(() => import("./pages/CryptoCompliancePage"));
const InfrastrukturRadarPage = lazy(() => import("./pages/InfrastrukturRadarPage"));
const LeistungenPage = lazy(() => import("./pages/LeistungenPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
// Immobilien Region Pages
const SkadarLakePage = lazy(() => import("./pages/immobilien/SkadarLakePage"));
const ZabljakPage = lazy(() => import("./pages/immobilien/ZabljakPage"));
const BudvaPage = lazy(() => import("./pages/immobilien/BudvaPage"));
const NiksicPage = lazy(() => import("./pages/immobilien/NiksicPage"));
const PodgoricaPage = lazy(() => import("./pages/immobilien/PodgoricaPage"));
// Investment Intelligence Pages
const InvestmentDashboard = lazy(() => import("./pages/investment/InvestmentDashboard"));
const ROICalculator = lazy(() => import("./pages/investment/ROICalculator"));
const LocationComparison = lazy(() => import("./pages/investment/LocationComparison"));
const LocationProfile = lazy(() => import("./pages/investment/LocationProfile"));
const InvestmentSimulation = lazy(() => import("./pages/investment/InvestmentSimulation"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function PageTracker() {
  usePageTracker();
  return null;
}

function App() {
  return (
    <LanguageProvider>
    <div className="App min-h-screen flex flex-col">
      <BrowserRouter>
        <PageTracker />
        <ScrollToTop />
        <Header />
        <main className="flex-1">
        <ErrorBoundary>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#C8A96A] border-t-transparent rounded-full animate-spin" /></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<ArticlePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
          <Route path="/leistungen" element={<LeistungenPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/investments" element={<Home />} />
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/datenschutz" element={<DatenschutzPage />} />
          <Route path="/agb" element={<AGBPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/newsletter/abmelden" element={<NewsletterUnsubscribe />} />
          <Route path="/serbia-executive" element={<SerbiaExecutivePage />} />
          <Route path="/serbia-executive/crypto-banking" element={<CryptoBankingPage />} />
          <Route path="/serbia-executive/crypto-compliance" element={<CryptoCompliancePage />} />
          <Route path="/infrastruktur-radar" element={<InfrastrukturRadarPage />} />
          {/* Immobilien Region Routes */}
          <Route path="/immobilien/skadar-lake" element={<SkadarLakePage />} />
          <Route path="/immobilien/zabljak" element={<ZabljakPage />} />
          <Route path="/immobilien/budva" element={<BudvaPage />} />
          <Route path="/immobilien/niksic" element={<NiksicPage />} />
          <Route path="/immobilien/podgorica" element={<PodgoricaPage />} />
          {/* Investment Intelligence Routes */}
          <Route path="/investment" element={<InvestmentDashboard />} />
          <Route path="/investment/rechner" element={<ROICalculator />} />
          <Route path="/investment/vergleich" element={<LocationComparison />} />
          <Route path="/investment/standort/:city" element={<LocationProfile />} />
          <Route path="/investment/simulation" element={<InvestmentSimulation />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
        </ErrorBoundary>
        </main>
        <Footer />
        <WhatsAppButton />
        <CookieConsent />
      </BrowserRouter>
    </div>
    </LanguageProvider>
  );
}

export default App;
