import { useState, useEffect } from "react";
import { MapPin, Clock, ChevronDown, Briefcase } from "lucide-react";
import { apiFetch } from "@/lib/api";

const TYPE_COLORS: Record<string, string> = {
  "full-time": "bg-blue-100 text-blue-700",
  "part-time": "bg-purple-100 text-purple-700",
  "contract": "bg-orange-100 text-orange-700",
  "remote": "bg-green-100 text-green-700",
};

function JobCard({ job }: { job: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-2xl overflow-hidden bg-white hover:border-primary/30 transition-colors">
      <div className="p-6 flex items-start justify-between gap-4 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[job.type] || "bg-muted text-muted-foreground"}`}>{job.type}</span>
            <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">{job.department}</span>
          </div>
          <h3 className="font-bold text-lg mb-1">{job.title}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
            {job.salary && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.salary}</span>}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 mt-1 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="border-t px-6 pb-6 pt-4">
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{job.description}</p>
          {job.requirements?.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-2">Requirements</h4>
              <ul className="space-y-1">
                {job.requirements.map((r: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2"><span className="text-primary mt-0.5">•</span>{r}</li>
                ))}
              </ul>
            </div>
          )}
          <a href={`mailto:careers@cargo.app?subject=Application: ${job.title}`}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
            Apply for this Role
          </a>
        </div>
      )}
    </div>
  );
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("all");

  useEffect(() => {
    apiFetch<any[]>("/careers").then(setJobs).finally(() => setLoading(false));
  }, []);

  const departments = [...new Set(jobs.map(j => j.department))];
  const filtered = deptFilter === "all" ? jobs : jobs.filter(j => j.department === deptFilter);

  return (
    <div>
      <section className="bg-gradient-to-br from-primary/5 to-purple-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Briefcase className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Join Our Team</h1>
          <p className="text-muted-foreground text-lg">We're building the future of commerce. Come build it with us.</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        {loading ? (
          <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}</div>
        ) : (
          <>
            {departments.length > 1 && (
              <div className="flex gap-2 flex-wrap mb-8">
                <button onClick={() => setDeptFilter("all")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${deptFilter === "all" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>All Departments ({jobs.length})</button>
                {departments.map(d => (
                  <button key={d} onClick={() => setDeptFilter(d)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${deptFilter === d ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                    {d}
                  </button>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-16 border rounded-2xl text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No open positions right now.</p>
                <p className="text-sm mt-1">Check back later or send your resume to careers@cargo.app</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            )}

            <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-2xl text-center">
              <h3 className="font-bold mb-2">Don't see the right role?</h3>
              <p className="text-muted-foreground text-sm mb-4">Send us your CV — we're always looking for talented people.</p>
              <a href="mailto:careers@cargo.app" className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                Send Open Application
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
