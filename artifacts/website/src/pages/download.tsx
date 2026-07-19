import { Apple, Star, Shield, Zap, Smartphone, Download } from "lucide-react";

const FEATURES = ["Real-time order tracking", "Flash deals & exclusive offers", "Secure wallet & payments", "1,200+ stores in one app", "Easy returns & refunds", "24/7 customer support"];

export default function DownloadPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary via-purple-600 to-indigo-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur">
                <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" /> Rated 4.9/5 — 50,000+ downloads
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">Get the Cargo App</h1>
              <p className="text-primary-foreground/80 text-lg mb-8 leading-relaxed">
                Shop smarter, track faster, and discover deals — all from the palm of your hand. Available on iOS and Android.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#" className="flex items-center gap-3 bg-white text-gray-900 px-6 py-3.5 rounded-xl hover:bg-gray-50 transition-all">
                  <Apple className="w-7 h-7" />
                  <div><p className="text-xs text-gray-500">Download on the</p><p className="font-bold text-base">App Store</p></div>
                </a>
                <a href="#" className="flex items-center gap-3 bg-white text-gray-900 px-6 py-3.5 rounded-xl hover:bg-gray-50 transition-all">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76a2 2 0 0 1-.87-.87L12 13l9.69 9.89a2 2 0 0 1-.87.87L12.3 25 3.18 23.76zM.07 4.9A2 2 0 0 0 0 5.5v13a2 2 0 0 0 .07.6L10.5 12 .07 4.9zm23.86 0L13.5 12l10.43 7.1A2 2 0 0 0 24 18.5v-13a2 2 0 0 0-.07-.6zM3.18.24L12.3-1l8.89 1.24a2 2 0 0 1 .87.87L12 12 2.31 1.11A2 2 0 0 1 3.18.24z"/></svg>
                  <div><p className="text-xs text-gray-500">Get it on</p><p className="font-bold text-base">Google Play</p></div>
                </a>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-64 h-64 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur border border-white/20">
                <Smartphone className="w-32 h-32 text-white/60" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold mb-3">Everything in One App</h2>
          <p className="text-muted-foreground text-lg">Designed to make shopping effortless.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f} className="flex items-center gap-3 p-4 border rounded-xl bg-white">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-medium text-sm">{f}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-14">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Sarah M.", text: "The best shopping app I've ever used. Fast, reliable, and incredible deals!", stars: 5 },
              { name: "Ahmed K.", text: "As a merchant, Cargo has tripled my online sales. The dashboard is fantastic.", stars: 5 },
              { name: "Lisa T.", text: "Real-time tracking is amazing. My orders always arrive on time. Love it!", stars: 5 },
            ].map(r => (
              <div key={r.name} className="bg-white border rounded-2xl p-6 text-left">
                <div className="flex gap-0.5 mb-3">{[...Array(r.stars)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}</div>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">"{r.text}"</p>
                <p className="font-semibold text-sm">{r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
