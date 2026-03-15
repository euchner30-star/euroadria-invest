import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Building2, Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with lighter overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1554155845-440a0ec58d3b)',
          filter: 'brightness(0.35)'
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Main Logo and Tagline */}
        <div className="mb-12 animate-fadeIn">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-[#3eb489] flex items-center justify-center shadow-xl">
                <span className="text-white font-bold text-3xl">E</span>
              </div>
              <span className="text-white font-display text-5xl md:text-6xl tracking-tight">
                Euro<span className="text-[#3eb489]">Adria</span>
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-4 text-xl md:text-2xl text-white/90 font-light tracking-widest">
            <span className="hover:text-[#3eb489] transition-colors cursor-default">Business</span>
            <span className="text-[#3eb489]">•</span>
            <span className="hover:text-[#3eb489] transition-colors cursor-default">Invest</span>
            <span className="text-[#3eb489]">•</span>
            <span className="hover:text-[#3eb489] transition-colors cursor-default">Lifestyle</span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl max-w-3xl mx-auto mb-12 p-8 animate-slideUp">
          <p className="text-lg md:text-xl text-white/90 leading-relaxed font-light">
            Ihr exklusiver Partner für Investments, Business und Lifestyle an der Adria. 
            Entdecken Sie einzigartige Chancen auf dem Balkan mit erstklassiger Expertise.
          </p>
        </div>

        {/* Team Photo Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl max-w-4xl mx-auto mb-12 p-8 animate-slideUp">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <img
                src="/team-photo.jpg"
                alt="Milena Bubanja & Holger Kuhlmann"
                className="rounded-xl shadow-2xl w-full"
              />
            </div>
            <div className="order-1 md:order-2 text-left">
              <div className="inline-block bg-[#3eb489]/20 border border-[#3eb489]/40 text-sm text-[#3eb489] px-4 py-2 rounded-full mb-4 font-medium">
                Ihre operative Task-Force
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Milena Bubanja & <br />Holger Kuhlmann
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                Wir sichern Ihr Vermögen am Balkan.
              </p>
              <div className="space-y-3 text-white/70 text-sm mb-6">
                <div>
                  <span className="text-[#3eb489] font-semibold">Milena Bubanja:</span> Legal & Compliance Expert
                </div>
                <div>
                  <span className="text-[#3eb489] font-semibold">Holger Kuhlmann:</span> Strategic Investment Advisor
                </div>
              </div>
              <Link to="/team" className="inline-flex items-center space-x-2 px-6 py-3 bg-[#3eb489] text-white font-semibold rounded-lg hover:bg-[#35a07a] transition-all">
                <span>Unser Team</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-[#3eb489]" />
            <span className="text-white text-sm font-medium">Premium Investments</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-[#3eb489]" />
            <span className="text-white text-sm font-medium">Luxus-Immobilien</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#3eb489]" />
            <span className="text-white text-sm font-medium">Adriatic Lifestyle</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/blog" className="px-10 py-4 bg-[#3eb489] text-white text-lg font-semibold rounded-lg hover:bg-[#35a07a] transition-all group">
            Entdecken Sie unsere Insights
            <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/contact"
            className="px-10 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 transition-all font-medium text-lg rounded-lg"
          >
            Kostenlose Beratung
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-[#3eb489] rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
