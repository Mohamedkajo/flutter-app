import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-sm">C</div>
              Cargo
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              The all-in-one marketplace connecting customers with the best local stores. Shop smarter, deliver faster.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {[["About Us", "/about"], ["Services", "/services"], ["Careers", "/careers"], ["Blog", "/blog"], ["Contact", "/contact"]].map(([label, href]) => (
                <li key={href}><Link href={href} className="text-gray-400 hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              {[["FAQ", "/faq"], ["Marketplace", "/marketplace"], ["Promotions", "/promotions"], ["Privacy Policy", "/privacy"], ["Terms & Conditions", "/terms"]].map(([label, href]) => (
                <li key={href}><Link href={href} className="text-gray-400 hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-400"><Mail className="w-4 h-4 text-primary shrink-0" />hello@cargo.app</li>
              <li className="flex items-center gap-2 text-gray-400"><Phone className="w-4 h-4 text-primary shrink-0" />+1 (555) 000-0000</li>
              <li className="flex items-start gap-2 text-gray-400"><MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />123 Commerce St, Tech City, TC 00000</li>
            </ul>
            <div className="mt-5">
              <p className="text-xs text-gray-500 mb-2">Download our app</p>
              <Link href="/download" className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Get the App
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Cargo. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
