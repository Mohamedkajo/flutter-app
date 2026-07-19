import { useEffect, useState, type ReactNode } from 'react';
import { Signal, Wifi, Battery } from 'lucide-react';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 540 : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 540px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

function StatusBar() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const hh = time.getHours().toString().padStart(2, '0');
  const mm = time.getMinutes().toString().padStart(2, '0');
  return (
    <div
      className="shrink-0 relative h-11 flex items-center justify-between px-6 text-white text-xs font-semibold select-none pointer-events-none"
      style={{ background: '#5E2D91' }}
    >
      <span>{hh}:{mm}</span>
      {/* Dynamic island */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[108px] h-[30px] bg-black rounded-full" />
      <div className="flex items-center gap-[5px]">
        <Signal size={13} strokeWidth={2} />
        <Wifi size={13} strokeWidth={2} />
        <Battery size={16} strokeWidth={2} />
      </div>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div className="shrink-0 h-5 flex items-center justify-center bg-white">
      <div className="w-[120px] h-[5px] bg-black/15 rounded-full" />
    </div>
  );
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  const isDesktop = useIsDesktop();

  if (!isDesktop) {
    return (
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {children}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at 30% 20%, #3b1a6b 0%, #1a0b33 40%, #0d0520 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Ambient glow behind phone */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 500,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(94,45,145,0.35) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Phone outer shell */}
      <div
        className="relative flex-shrink-0"
        style={{
          width: 406,
          height: 878,
          borderRadius: 56,
          background: 'linear-gradient(145deg, #2c2c2e 0%, #1c1c1e 100%)',
          boxShadow:
            '0 0 0 1px #3a3a3c, inset 0 0 0 1px #48484a, 0 60px 120px rgba(0,0,0,0.8), 0 0 80px rgba(94,45,145,0.25)',
          padding: 8,
        }}
      >
        {/* Physical buttons — volume */}
        {[110, 168].map((top) => (
          <div
            key={top}
            style={{
              position: 'absolute',
              left: -4,
              top,
              width: 4,
              height: 38,
              background: 'linear-gradient(to right, #2c2c2e, #3a3a3c)',
              borderRadius: '3px 0 0 3px',
            }}
          />
        ))}
        {/* Power button */}
        <div
          style={{
            position: 'absolute',
            right: -4,
            top: 148,
            width: 4,
            height: 68,
            background: 'linear-gradient(to left, #2c2c2e, #3a3a3c)',
            borderRadius: '0 3px 3px 0',
          }}
        />

        {/* Screen bezel with subtle inner glow */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 48,
            overflow: 'hidden',
            background: '#000',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <StatusBar />
          {/* Content area */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#F8F8FC' }}>
            {children}
          </div>
          <HomeIndicator />
        </div>

        {/* Screen top glare */}
        <div
          className="pointer-events-none absolute"
          style={{
            top: 8,
            left: 8,
            right: 8,
            height: '40%',
            borderRadius: '48px 48px 0 0',
            background: 'linear-gradient(170deg, rgba(255,255,255,0.06) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Brand label below phone */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 text-xs font-medium tracking-widest select-none">
        CARGO
      </div>
    </div>
  );
}
