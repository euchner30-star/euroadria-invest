import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, TrendingUp, ArrowRight, Filter, Mountain, Waves, Factory, Trees } from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';

// Sample property data - in real app would come from API
const properties = {
  'skadar-lake': {
    name: 'Skadar-See Region',
    slug: 'skadar-lake',
    subtitle: 'Natur & Logistik-Scharnier',
    description: 'Der Skadar-See ist das größte Binnengewässer des Balkans und bietet einzigartige Investment-Chancen an der Schnittstelle von Natur und Infrastruktur.',
    icon: Trees,
    score: 82,
    heroImage: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200',
    highlights: ['Größter See des Balkans', 'UNESCO-Biosphärenreservat', 'Logistik-Hub Bar in 30 Min', 'Ökotourismus-Potenzial'],
    roi: '8-12%',
    priceRange: '€1.200 - €2.500/m²',
    apartments: [
      { id: 1, title: 'Seeblick Apartment Virpazar', size: '75m²', price: '€95.000', bedrooms: 2, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400' },
      { id: 2, title: 'Nature Residence Rijeka Crnojevića', size: '92m²', price: '€125.000', bedrooms: 3, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400' },
      { id: 3, title: 'Eco-Lodge Apartment Godinje', size: '55m²', price: '€68.000', bedrooms: 1, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400' },
    ]
  },
  'zabljak': {
    name: 'Žabljak',
    slug: 'zabljak',
    subtitle: 'Alpin-Tourismus & High-Score',
    description: 'Žabljak ist das höchstgelegene Städtchen am Balkan und das Zentrum des Durmitor-Nationalparks - ein aufstrebender Hotspot für Alpin-Tourismus.',
    icon: Mountain,
    score: 88,
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
    highlights: ['Durmitor Nationalpark', 'UNESCO Welterbe', 'Ski-Resort im Aufbau', 'Ganzjahres-Tourismus'],
    roi: '10-15%',
    priceRange: '€1.500 - €3.000/m²',
    apartments: [
      { id: 4, title: 'Mountain View Suite', size: '85m²', price: '€145.000', bedrooms: 2, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400' },
      { id: 5, title: 'Durmitor Chalet Apartment', size: '110m²', price: '€195.000', bedrooms: 3, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400' },
      { id: 6, title: 'Ski-In Apartment Black Lake', size: '68m²', price: '€115.000', bedrooms: 2, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400' },
    ]
  },
  'budva': {
    name: 'Budva',
    slug: 'budva',
    subtitle: 'Etablierter Küstenmarkt',
    description: 'Budva ist das touristische Herz Montenegros mit der höchsten Besucherdichte und einem etablierten Immobilienmarkt an der Adriaküste.',
    icon: Waves,
    score: 78,
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
    highlights: ['Adriaküste', 'Altstadt UNESCO-Kandidat', 'Höchste Touristendichte', 'Premium-Segment'],
    roi: '6-9%',
    priceRange: '€2.500 - €5.000/m²',
    apartments: [
      { id: 7, title: 'Beachfront Luxury Apartment', size: '95m²', price: '€285.000', bedrooms: 2, image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400' },
      { id: 8, title: 'Old Town View Residence', size: '78m²', price: '€225.000', bedrooms: 2, image: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400' },
      { id: 9, title: 'Slovenska Beach Apartment', size: '120m²', price: '€380.000', bedrooms: 3, image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400' },
    ]
  },
  'niksic': {
    name: 'Nikšić',
    slug: 'niksic',
    subtitle: 'Binnenentwicklung & Industrie',
    description: 'Nikšić ist die zweitgrößte Stadt Montenegros und ein aufstrebender Hub für Industrie, Bildung und Binnenentwicklung mit starkem Wachstumspotenzial.',
    icon: Factory,
    score: 85,
    heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
    highlights: ['Zweitgrößte Stadt', 'Universität & Industrie', 'Niedrige Einstiegspreise', 'Konvergenz-Potenzial'],
    roi: '9-14%',
    priceRange: '€800 - €1.800/m²',
    apartments: [
      { id: 10, title: 'City Center Apartment', size: '72m²', price: '€65.000', bedrooms: 2, image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400' },
      { id: 11, title: 'University District Studio', size: '45m²', price: '€38.000', bedrooms: 1, image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400' },
      { id: 12, title: 'Modern Family Apartment', size: '98m²', price: '€95.000', bedrooms: 3, image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400' },
    ]
  }
};

const ImmobilienangebotPage = () => {
  const { lang } = useLanguage();
  const en = lang === 'en';
  const [selectedType, setSelectedType] = useState('all');
  const regions = Object.values(properties);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white">
      <SEO 
        title={en ? "Real Estate Offering Montenegro | Apartments & Investment" : "Immobilienangebot Montenegro | Apartments & Investment"}
        description={en ? "Exclusive real estate in Montenegro: Apartments at Lake Skadar, in Žabljak, Budva and Nikšić. Investment scores, ROI analyses and premium properties for DACH investors." : "Exklusive Immobilien in Montenegro: Apartments am Skadar-See, in Žabljak, Budva und Nikšić. Investment-Scores, ROI-Analysen und Premium-Objekte für DACH-Investoren."}
        url="/immobilienangebot"
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-ea-gold/10 border border-ea-gold/30 rounded-full px-4 py-2 mb-6">
            <Building2 className="w-5 h-5 text-ea-gold" />
            <span className="text-ea-dark font-semibold text-sm">Premium Investment Properties</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-ea-dark mb-6">
            {en ? <>Real Estate <span className="text-ea-gold">Offering</span> Montenegro</> : <>Immobilien<span className="text-ea-gold">angebot</span> Montenegro</>}
          </h1>
          <p className="text-ea-dark/70 text-lg max-w-3xl mx-auto">
            {en ? 'Discover exclusive apartments in the emerging regions of Montenegro. Each property has been evaluated by EuroAdria Corporate Solutions for investment potential.' : 'Entdecken Sie exklusive Apartments in den aufstrebenden Regionen Montenegros. Jedes Objekt wurde von EuroAdria Corporate Solutions auf Investment-Potenzial geprüft.'}
          </p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
              selectedType === 'all' 
                ? 'bg-ea-dark text-white' 
                : 'bg-ea-light text-ea-dark hover:bg-ea-gold/20'
            }`}
          >
            Alle Regionen
          </button>
          <button
            onClick={() => setSelectedType('apartments')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              selectedType === 'apartments' 
                ? 'bg-ea-dark text-white' 
                : 'bg-ea-light text-ea-dark hover:bg-ea-gold/20'
            }`}
          >
            <Filter className="w-4 h-4" />
            Nur Apartments
          </button>
        </div>

        {/* Region Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {regions.map((region) => (
            <Link
              key={region.slug}
              to={`/immobilienangebot/${region.slug}`}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={region.heroImage}
                  alt={region.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                    <region.icon className="w-5 h-5 text-ea-gold" />
                    <span className="font-semibold text-ea-dark">{region.name}</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <div className={`px-3 py-1.5 rounded-full font-bold text-white text-sm ${
                    region.score >= 85 ? 'bg-orange-500' : region.score >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                    Score: {region.score}/100
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-ea-gold font-medium text-sm mb-2">{region.subtitle}</p>
                <p className="text-ea-dark/70 mb-4 line-clamp-2">{region.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {region.highlights.slice(0, 3).map((h, idx) => (
                    <span key={idx} className="text-xs bg-ea-light text-ea-dark px-2 py-1 rounded-full">
                      {h}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-ea-dark/50 text-xs">ROI Zielrendite</div>
                    <div className="text-ea-gold font-bold">{region.roi}</div>
                  </div>
                  <div>
                    <div className="text-ea-dark/50 text-xs">Preisspanne</div>
                    <div className="text-ea-dark font-semibold text-sm">{region.priceRange}</div>
                  </div>
                  <div className="text-ea-gold flex items-center gap-1 font-medium">
                    {region.apartments.length} Objekte
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-ea-dark rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Suchen Sie ein <span className="text-ea-gold">spezifisches Objekt</span>?
          </h2>
          <p className="text-ea-light/70 mb-6 max-w-2xl mx-auto">
            Unsere Experten haben Zugang zu Off-Market Immobilien, die nicht öffentlich gelistet sind. 
            Kontaktieren Sie uns für eine individuelle Beratung.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-ea-gold text-ea-dark font-bold rounded-xl hover:bg-ea-gold/90 transition-all"
          >
            Individuelle Beratung anfragen
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ImmobilienangebotPage;
export { properties };
