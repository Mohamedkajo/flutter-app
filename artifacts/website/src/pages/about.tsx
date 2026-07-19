import { Target, Heart, Lightbulb, Users } from "lucide-react";

const VALUES = [
  { icon: Target, title: "Mission-Driven", desc: "We exist to connect communities with the products they love, faster and more affordably than ever before." },
  { icon: Heart, title: "Customer First", desc: "Every decision we make starts with the customer. Their satisfaction is our primary measure of success." },
  { icon: Lightbulb, title: "Always Innovating", desc: "Technology moves fast. We stay ahead by building intuitive tools that merchants and shoppers actually want to use." },
  { icon: Users, title: "Community", desc: "We believe in lifting local businesses and helping them compete in the digital age without barriers." },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 to-purple-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">About Cargo</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We're on a mission to make commerce faster, fairer, and more accessible for everyone — from independent store owners to everyday shoppers.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-extrabold mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>Cargo was founded with a simple idea: local stores deserve the same reach as big e-commerce giants. We built a platform that gives every merchant — large or small — the tools to connect with customers digitally.</p>
              <p>Since our founding, we've grown into a full-featured marketplace that supports hundreds of stores and serves tens of thousands of customers every month. Our mobile-first approach means shoppers can discover, order, and track everything from the palm of their hand.</p>
              <p>We're not just a marketplace — we're a growth partner. From inventory management to marketing tools, Cargo gives merchants everything they need to thrive in the digital age.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[["2020", "Founded"], ["1,200+", "Partner Stores"], ["50K+", "Customers"], ["99.8%", "Uptime"]].map(([val, label]) => (
              <div key={label} className="border rounded-2xl p-6 bg-white text-center">
                <div className="text-3xl font-extrabold text-primary mb-1">{val}</div>
                <div className="text-muted-foreground text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold mb-3">Our Values</h2>
            <p className="text-muted-foreground text-lg">The principles that guide everything we do.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-6 border text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
