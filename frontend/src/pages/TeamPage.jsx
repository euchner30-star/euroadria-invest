import React from 'react';
import TeamSection from '../components/TeamSection';
import { LeadMagnetBox } from '../components/ArticleComponents';

const TeamPage = () => {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <TeamSection />
      
      {/* Lead Magnet */}
      <div className="max-w-4xl mx-auto px-6">
        <LeadMagnetBox />
      </div>
    </div>
  );
};

export default TeamPage;