// EuroAdria - Cluster System & Article Categories

export const themeClusters = [
  {
    id: 'A',
    name: 'Makro & Strategie',
    slug: 'makro-strategie',
    description: 'EU-Konvergenz, Markt-Analysen und strategische Investment-Fundamentals',
    color: '#D4AF37'
  },
  {
    id: 'B',
    name: 'Recht & Compliance',
    slug: 'recht-compliance',
    description: 'Due Diligence, Kataster-Prüfung, rechtliche Sicherheit',
    color: '#C0C0C0'
  },
  {
    id: 'C',
    name: 'Montenegro Regionen',
    slug: 'montenegro-regionen',
    description: 'Skadar Lake, Lustica Bay, Budva, Kotor',
    color: '#4A90E2'
  },
  {
    id: 'D',
    name: 'Serbien & Balkan',
    slug: 'serbien-balkan',
    description: 'Zabljak, Cetinje, aufstrebende Märkte',
    color: '#7B68EE'
  },
  {
    id: 'E',
    name: 'Lifestyle & Relocation',
    slug: 'lifestyle-relocation',
    description: 'Auswandern, Lebensqualität, Residency',
    color: '#50C878'
  },
  {
    id: 'F',
    name: 'Business Setup',
    slug: 'business-setup',
    description: 'Firmengründung, Banking, Steuern 9-15%',
    color: '#FF6B6B'
  }
];

export const getClusterById = (id) => {
  return themeClusters.find(cluster => cluster.id === id);
};

export const getClusterBySlug = (slug) => {
  return themeClusters.find(cluster => cluster.slug === slug);
};