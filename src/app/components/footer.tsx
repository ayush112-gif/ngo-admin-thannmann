import { Link } from '@/app/components/router';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Column */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#38BDF8]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Thannmanngaadi Foundation
            </h3>
            <p className="text-gray-300 text-sm mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Creating change through compassion and action. Empowering communities with education, health support, and sustainable initiatives.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#38BDF8] transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-[#38BDF8] transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-[#38BDF8] transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-[#38BDF8] transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              <li><Link href="/about" className="text-gray-300 hover:text-[#38BDF8] transition-colors">About Us</Link></li>
              <li><Link href="/programs" className="text-gray-300 hover:text-[#38BDF8] transition-colors">Our Programs</Link></li>
              <li><Link href="/volunteer" className="text-gray-300 hover:text-[#38BDF8] transition-colors">Volunteer</Link></li>
              <li><Link href="/internships" className="text-gray-300 hover:text-[#38BDF8] transition-colors">Internships</Link></li>
              <li><Link href="/donate" className="text-gray-300 hover:text-[#38BDF8] transition-colors">Donate</Link></li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Resources
            </h4>
            <ul className="space-y-2 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              <li><Link href="/impact" className="text-gray-300 hover:text-[#38BDF8] transition-colors">Impact Stories</Link></li>
              <li><Link href="/blog" className="text-gray-300 hover:text-[#38BDF8] transition-colors">Blog & Updates</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-[#38BDF8] transition-colors">Contact Us</Link></li>
              <li><Link href="/admin" className="text-gray-300 hover:text-[#38BDF8] transition-colors">Admin Login</Link></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              <li className="flex items-start gap-2 text-gray-300">
                <Mail size={18} className="mt-0.5 flex-shrink-0" />
                <span>info@thannmanngaadi.org</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Phone size={18} className="mt-0.5 flex-shrink-0" />
                <span>+91 1234567890</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                <span>Kerala, India</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p style={{ fontFamily: 'Inter, sans-serif' }}>
            © 2026 Thannmanngaadi Foundation. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
