import { useState, useEffect } from "react";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { apiFetch } from "@/lib/api";

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      <button className="w-full flex items-center justify-between p-5 text-left font-medium hover:bg-muted/40 transition-colors" onClick={() => setOpen(!open)}>
        {q}
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 text-muted-foreground leading-relaxed text-sm border-t">{a}</div>}
    </div>
  );
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<any[]>("/faq"),
      apiFetch<any[]>("/faq/categories"),
    ]).then(([f, c]) => { setFaqs(f); setCategories(c); }).finally(() => setLoading(false));
  }, []);

  const filtered = faqs.filter(f => {
    const matchesCat = filter === "all" || String(f.categoryId) === filter;
    const matchesSearch = !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div>
      <section className="bg-gradient-to-br from-primary/5 to-purple-50 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-lg mb-8">Have a question? We probably already answered it.</p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="search" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Category tabs */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-8">
            <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "all" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>All</button>
            {categories.map((c: any) => (
              <button key={c.id} onClick={() => setFilter(String(c.id))} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === String(c.id) ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {c.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No results found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((faq: any) => (
              <AccordionItem key={faq.id} q={faq.question} a={faq.answer} />
            ))}
          </div>
        )}

        <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-2xl text-center">
          <h3 className="font-bold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground text-sm mb-4">Our support team is here to help you.</p>
          <a href="/contact" className="inline-flex items-center gap-1.5 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
