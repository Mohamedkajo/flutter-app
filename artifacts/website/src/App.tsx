import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

import HomePage from '@/pages/home';
import AboutPage from '@/pages/about';
import ServicesPage from '@/pages/services';
import MarketplacePage from '@/pages/marketplace';
import PromotionsPage from '@/pages/promotions';
import BlogPage from '@/pages/blog';
import BlogPostPage from '@/pages/blog-post';
import FaqPage from '@/pages/faq';
import ContactPage from '@/pages/contact';
import CareersPage from '@/pages/careers';
import DownloadPage from '@/pages/download';
import PrivacyPage from '@/pages/privacy';
import TermsPage from '@/pages/terms';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 60000 } },
});

function Router() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/services" component={ServicesPage} />
          <Route path="/marketplace" component={MarketplacePage} />
          <Route path="/promotions" component={PromotionsPage} />
          <Route path="/blog/:slug" component={BlogPostPage} />
          <Route path="/blog" component={BlogPage} />
          <Route path="/faq" component={FaqPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/careers" component={CareersPage} />
          <Route path="/download" component={DownloadPage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/terms" component={TermsPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}
