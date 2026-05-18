import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Process from './components/Process';
import DealsPage from './pages/DealsPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import ThankYouPage from './pages/ThankYouPage';
import FeaturedWork from './components/FeaturedWork';
import DealMatchTeaser from './components/DealMatchTeaser';
import DealMatchPage from './pages/DealMatchPage';
import Advisors from './components/Advisors';
import AdvisorPage from './pages/AdvisorPage';
import Brands from './components/Brands';
import GetInTouch from './components/GetInTouch';
import Footer from './components/Layout/Footer';

// Landing page composes all home sections
function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Process />
      <FeaturedWork />
      <DealMatchTeaser />
      <Advisors />
      <Brands />
      <GetInTouch />
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/deal-match" element={<DealMatchPage />} />
          <Route path="/property/:slug" element={<PropertyDetailPage />} />
          <Route path="/advisor" element={<AdvisorPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;