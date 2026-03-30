import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import ScrollToTop from "./components/ScrollToTop";
import CookieConsent from "./components/CookieConsent";
import Home from "./pages/Home.jsx";
import BlogPage from "./pages/BlogPage";
import ArticlePage from "./pages/ArticlePage";
import ContactPage from "./pages/ContactPage";
import TeamPage from "./pages/TeamPage";
import ImpressumPage from "./pages/ImpressumPage";
import DatenschutzPage from "./pages/DatenschutzPage";
import AdminPage from "./pages/AdminPage";
import SerbiaExecutivePage from "./pages/SerbiaExecutivePage";
import InfrastrukturRadarPage from "./pages/InfrastrukturRadarPage";
// Immobilien Region Pages
import SkadarLakePage from "./pages/immobilien/SkadarLakePage";
import ZabljakPage from "./pages/immobilien/ZabljakPage";
import BudvaPage from "./pages/immobilien/BudvaPage";
import NiksicPage from "./pages/immobilien/NiksicPage";
import PodgoricaPage from "./pages/immobilien/PodgoricaPage";
// Investment Intelligence Pages
import InvestmentDashboard from "./pages/investment/InvestmentDashboard";
import ROICalculator from "./pages/investment/ROICalculator";
import LocationComparison from "./pages/investment/LocationComparison";
import LocationProfile from "./pages/investment/LocationProfile";

function App() {
  return (
    <div className="App min-h-screen flex flex-col">
      <BrowserRouter>
        <ScrollToTop />
        <Header />
        <main className="flex-1"><Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<ArticlePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/investments" element={<Home />} />
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/datenschutz" element={<DatenschutzPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/serbia-executive" element={<SerbiaExecutivePage />} />
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
        </Routes>
        </main>
        <Footer />
        <WhatsAppButton />
        <CookieConsent />
      </BrowserRouter>
    </div>
  );
}

export default App;
