import { Link } from "wouter";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-black text-primary/20 mb-4">404</div>
        <h1 className="text-3xl font-extrabold mb-3">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <button onClick={() => history.back()} className="flex items-center gap-2 border px-5 py-2.5 rounded-xl font-semibold hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
