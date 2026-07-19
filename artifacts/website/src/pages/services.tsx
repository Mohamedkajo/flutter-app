import { ShoppingBag, Store, Truck, BarChart3, Shield, Bell, Smartphone, Headphones } from "lucide-react";
import { Link } from "wouter";

const SERVICES = [
  {
    icon: ShoppingBag,
    title: "Multi-Store Marketplace",
    desc: "Browse and shop from hundreds of stores across every category — fashion, electronics, food, and more — all in one unified checkout experience.",
    highlight: "For Shoppers",
  },
  {
    icon: Store,
    title: "Merchant Storefronts",
    desc: "Launch your digital storefront in minutes. Manage products, pricing, inventory, and promotions from one simple dashboard.",
    highlight: "For Merchants",
  },
  {
    icon: Truck,
    title: "Smart Delivery",
    desc: "Real-time order tracking, optimized delivery routes, and same-day fulfillment powered by our driver network.",
    highlight: "Logistics",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    desc: "Deep analytics on sales, customer behavior, and inventory. Make smarter decisions with data you can actually use.",
    highlight: "Business Intelligence",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    desc: "Integrated wallet system with buyer protection, refund management, and support for multiple payment methods.",
    highlight: "Payments",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    desc: "Push notifications for order updates, flash sales, promotions, and personalized product recommendations.",
    highlight: "Engagement",
  },
  {
    icon: Smartphone,
    title: "Mobile-First App",
    desc: "Native iOS and Android apps built for speed. Shop, track orders, and manage your store on the go.",
    highlight: "Mobile",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Dedicated support teams for merchants and shoppers. Live chat, email, and phone support around the clock.",
    highlight: "Support",
  },
];

export default function ServicesPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary/5 to-purple-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Our Services</h1>
          <p className="text-xl text-muted-foreground">Everything you need to shop, sell, and grow — in one platform.</p>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map(s => (
            <div key={s.title} className="border rounded-2xl p-6 bg-white hover:shadow-md hover:border-primary/30 transition-all">
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">{s.highlight}</span>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mt-4 mb-3">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-base mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Ready to get started?</h2>
          <p className="text-primary-foreground/80 mb-8">Join thousands of merchants and customers already on Cargo.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/download" className="bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all">Download the App</Link>
            <Link href="/contact" className="border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all">Contact Sales</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
