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
              The UAE's digital drayage marketplace connecting shippers with verified container haulage fleets at every major port and free zone across all seven emirates.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>DP World & Federal Transport Compliant</span>
            </div>
          </div>

          {/* Col 2: Coverage */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">UAE Coverage</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-brand-orange transition-colors cursor-default">Ports across all seven emirates</span></li>
              <li><span className="hover:text-brand-orange transition-colors cursor-default">Free zones & industrial areas</span></li>
              <li><span className="hover:text-brand-orange transition-colors cursor-default">Warehouse & distribution parks</span></li>
              <li><span className="hover:text-brand-orange transition-colors cursor-default">Inland depots & container yards</span></li>
              <li><span className="hover:text-brand-orange transition-colors cursor-default">City-to-city trucking lanes</span></li>
            </ul>
          </div>

          {/* Col 3: Key Haulage Lanes */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Top Drayage Lanes</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-brand-orange transition-colors cursor-default">Port → Dubai South / DWC</span></li>
              <li><span className="hover:text-brand-orange transition-colors cursor-default">Port → Al Quoz Industrial</span></li>
              <li><span className="hover:text-brand-orange transition-colors cursor-default">Port → Dubai Investments Park</span></li>
              <li><span className="hover:text-brand-orange transition-colors cursor-default">Khalifa Port → Mussafah</span></li>
              <li><span className="hover:text-brand-orange transition-colors cursor-default">Khor Fakkan → Interior Emirates</span></li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Head Office</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-brand-orange mt-0.5 shrink-0" />
                <span>Dubai, United Arab Emirates</span>
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
            <span className="hover:text-gray-400 cursor-default">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-default">Terms of Service</span>
            <span className="hover:text-gray-400 cursor-default">Carrier Operating Standards</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
