import React from 'react';
import TeamSection from '../components/TeamSection';
import { LeadMagnetBox } from '../components/ArticleComponents';
import SEO from '../components/SEO';

const TeamPage = () => {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <SEO 
        title="Our Team"
        description="Meet the EuroAdria Corporate Solutions team: Milena Bubanja and Holger Kuhlmann - Your experts for investments in the Adriatic region."
        url="/team"
      />
      <TeamSection />
      
      {/* Lead Magnet */}
      <div className="max-w-4xl mx-auto px-6">
        <LeadMagnetBox />
      </div>
    </div>
  );
};

export default TeamPage;