import React from 'react';
import { Truck, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-gray-400 border-t border-navy-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-navy-800/80">
          
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-brand-orange p-2 rounded-lg">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">LOAD<span className="text-brand-orange">BYTON</span></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Dubai's premier digital drayage marketplace connecting shippers with verified container haulage fleets in Jebel Ali Port.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>DP World & RTA Transport Compliant</span>
            </div>
          </div>

          {/* Col 2: Key Terminals */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Port Coverage</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-brand-orange transition-colors">Jebel Ali Terminal 1 (T1)</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">Jebel Ali Terminal 2 (T2)</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">Jebel Ali Terminal 3 (T3)</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">Jebel Ali Terminal 4 (T4)</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">Khalifa Port & Sharjah Terminal</a></li>
            </ul>
          </div>

          {/* Col 3: Key Haulage Lanes */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Top Drayage Lanes</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-brand-orange transition-colors">Jebel Ali → JAFZA North & South</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">Jebel Ali → Al Quoz Industrial</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">Jebel Ali → Dubai Investments Park</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">Jebel Ali → Dubai South / DWC</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">Jebel Ali → Abu Dhabi Industrial</a></li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Dubai Head Office</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-brand-orange mt-0.5 shrink-0" />
                <span>Level 14, JAFZA One Tower, Jebel Ali Free Zone, Dubai, UAE</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-brand-orange shrink-0" />
                <span>+971 4 800 LOAD (5623)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-brand-orange shrink-0" />
                <span className="break-all">support@loadbyton.ae</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} Loadbyton Technologies FZ-LLC. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-gray-400">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400">Terms of Service</a>
            <a href="#" className="hover:text-gray-400">Carrier Operating Standards</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
