import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return setError("Please fill in all required fields.");
    setSubmitting(true);
    setError("");
    try {
      await apiFetch("/contact", { method: "POST", body: JSON.stringify(form) });
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-primary/5 to-purple-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Get in Touch</h1>
          <p className="text-muted-foreground text-lg">We'd love to hear from you. Send us a message and we'll get back to you shortly.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact info */}
          <div>
            <h2 className="text-xl font-bold mb-6">Contact Information</h2>
            <div className="space-y-5">
              {[
                { icon: Mail, label: "Email", value: "hello@cargo.app" },
                { icon: Phone, label: "Phone", value: "+1 (555) 000-0000" },
                { icon: MapPin, label: "Office", value: "123 Commerce St, Tech City, TC 00000" },
              ].map(item => (
                <div key={item.label} className="flex gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                    <p className="font-medium text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-5 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="font-semibold text-sm mb-1">Business Hours</p>
              <p className="text-muted-foreground text-sm">Mon–Fri: 9am–6pm</p>
              <p className="text-muted-foreground text-sm">Sat–Sun: 10am–4pm</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {done ? (
              <div className="border rounded-2xl p-12 bg-white text-center">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground">Thank you for reaching out. We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="border rounded-2xl p-8 bg-white space-y-5">
                <h2 className="text-xl font-bold">Send a Message</h2>
                {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-3 text-sm">{error}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Name <span className="text-red-500">*</span></label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email <span className="text-red-500">*</span></label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" placeholder="you@example.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Subject <span className="text-red-500">*</span></label>
                    <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" placeholder="How can we help?" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Message <span className="text-red-500">*</span></label>
                  <textarea rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none" placeholder="Tell us about your question or request..." />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  <Send className="w-4 h-4" />{submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
