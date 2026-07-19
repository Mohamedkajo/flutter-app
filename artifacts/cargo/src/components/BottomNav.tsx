import { Link, useLocation } from 'wouter';
import { Home, Search, ShoppingBag, ClipboardList, User as UserIcon } from 'lucide-react';
import { useGetCart } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home, exact: true },
  { path: '/search', label: 'Search', icon: Search, exact: false },
  { path: '/cart', label: 'Cart', icon: ShoppingBag, exact: false, isCenter: true },
  { path: '/orders', label: 'Orders', icon: ClipboardList, exact: false },
  { path: '/profile', label: 'Profile', icon: UserIcon, exact: false },
];

function isActive(location: string, path: string, exact: boolean) {
  return exact ? location === path : location.startsWith(path);
}

export function BottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { data: cart } = useGetCart({ query: { enabled: !!user, queryKey: ['cart'] } });
  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <div className="shrink-0 bg-white/95 backdrop-blur-md border-t border-[#EBEBF0] rounded-t-[28px] shadow-[0_-8px_32px_rgba(94,45,145,0.08)]">
      <div className="flex items-center justify-around px-3 h-[68px]">
        {NAV_ITEMS.map((item) => {
          const active = isActive(location, item.path, item.exact);
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link key={item.path} href={item.path}>
                <div className="relative -top-5 flex flex-col items-center">
                  <div className="absolute inset-0 rounded-full bg-primary/20 scale-110 blur-md" />
                  <div className="relative w-[58px] h-[58px] bg-gradient-to-br from-[#5E2D91] to-[#47206E] rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(94,45,145,0.45)] border-[3px] border-white text-white hover:scale-105 active:scale-95 transition-transform duration-150">
                    <Icon size={24} strokeWidth={2} />
                    <AnimatePresence>
                      {cartCount > 0 && (
                        <motion.span
                          key="badge"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[#F25B57] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white"
                        >
                          {cartCount > 99 ? '99+' : cartCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="mt-1.5 text-[10px] font-semibold text-[#5E2D91]">Cart</span>
                </div>
              </Link>
            );
          }

          return (
            <Link key={item.path} href={item.path}>
              <div className="flex flex-col items-center justify-center w-14 gap-1 py-1 select-none">
                <div className="relative flex items-center justify-center w-10 h-10">
                  <AnimatePresence>
                    {active && (
                      <motion.div
                        key="pill"
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-[#E8DDF6] rounded-xl"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={`relative z-10 transition-colors duration-150 ${active ? 'text-[#5E2D91]' : 'text-[#9CA3AF]'}`}
                  />
                </div>
                <span className={`text-[10px] transition-colors duration-150 ${active ? 'font-700 text-[#5E2D91]' : 'font-500 text-[#9CA3AF]'}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
