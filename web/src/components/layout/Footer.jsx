import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-brand-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                HAVEN<span className="text-brand-500">.</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering tenants with an AI-assisted property rental discovery platform. Seamless viewing schedules, intelligent assistant insights, and verified property listings.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 bg-brand-950/60 border border-brand-800/80 px-3 py-1.5 rounded-full w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>HAVEN Tenant Rental Platform</span>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Explore</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-brand-400 transition-colors">Home Landing</Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-brand-400 transition-colors">All Properties</Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-brand-400 transition-colors">Saved Favorites</Link>
              </li>
              <li>
                <Link to="/viewings" className="hover:text-brand-400 transition-colors">Viewing Requests</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Property Types */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Property Types</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link to="/properties?propertyType=Penthouse" className="hover:text-brand-400 transition-colors">Luxury Penthouses</Link>
              </li>
              <li>
                <Link to="/properties?propertyType=Villa" className="hover:text-brand-400 transition-colors">Private Villas</Link>
              </li>
              <li>
                <Link to="/properties?propertyType=Apartment" className="hover:text-brand-400 transition-colors">Modern Apartments</Link>
              </li>
              <li>
                <Link to="/properties?propertyType=Studio" className="hover:text-brand-400 transition-colors">Urban Loft Studios</Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact Info */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Support</h4>
            <div className="flex flex-col gap-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Metropolitan Financial District</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>support@havenrental.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+1 (800) 555-HAVEN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} HAVEN Property Rental Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Overview</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
