import { Link } from 'wouter';
import { useListCategories } from '@workspace/api-client-react';
import { ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

// Colour palette for category cards (cycles if more categories than colours)
const CARD_COLOURS = [
  { bg: 'bg-orange-50',  ring: 'ring-orange-200',  text: 'text-orange-600'  },
  { bg: 'bg-purple-50',  ring: 'ring-purple-200',  text: 'text-purple-600'  },
  { bg: 'bg-teal-50',    ring: 'ring-teal-200',    text: 'text-teal-600'    },
  { bg: 'bg-rose-50',    ring: 'ring-rose-200',    text: 'text-rose-600'    },
  { bg: 'bg-blue-50',    ring: 'ring-blue-200',    text: 'text-blue-600'    },
  { bg: 'bg-amber-50',   ring: 'ring-amber-200',   text: 'text-amber-600'   },
  { bg: 'bg-green-50',   ring: 'ring-green-200',   text: 'text-green-600'   },
  { bg: 'bg-pink-50',    ring: 'ring-pink-200',    text: 'text-pink-600'    },
  { bg: 'bg-indigo-50',  ring: 'ring-indigo-200',  text: 'text-indigo-600'  },
  { bg: 'bg-cyan-50',    ring: 'ring-cyan-200',    text: 'text-cyan-600'    },
  { bg: 'bg-lime-50',    ring: 'ring-lime-200',    text: 'text-lime-600'    },
  { bg: 'bg-fuchsia-50', ring: 'ring-fuchsia-200', text: 'text-fuchsia-600' },
];

export default function Categories() {
  const { data: categories, isLoading } = useListCategories();

  return (
    <div className="flex flex-col min-h-full bg-surface pb-8">

      {/* ── Grid ──────────────────────────────────────────────────── */}
      <div className="px-4 pt-5 grid grid-cols-2 gap-3">
        {isLoading
          ? Array(10).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))
          : categories?.map((cat, i) => {
              const colour = CARD_COLOURS[i % CARD_COLOURS.length];
              return (
                <Link key={cat.id} href={`/stores?category=${cat.slug}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`
                      flex items-center gap-4 p-4 h-24 rounded-2xl
                      bg-white border border-border/40
                      shadow-[0_2px_12px_rgba(94,45,145,0.06)]
                      cursor-pointer hover:shadow-md active:scale-[0.97]
                      transition-all
                    `}
                  >
                    {/* Icon circle */}
                    <div className={`
                      w-14 h-14 rounded-2xl ${colour.bg} ${colour.ring}
                      ring-1 flex items-center justify-center shrink-0
                    `}>
                      <span className="text-3xl leading-none">{cat.icon}</span>
                    </div>

                    {/* Name + count */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground leading-tight truncate">
                        {cat.name}
                      </p>
                      {cat.storeCount != null && (
                        <p className={`text-xs font-semibold mt-0.5 ${colour.text}`}>
                          {cat.storeCount} stores
                        </p>
                      )}
                      <ChevronRight size={14} className="text-muted-foreground mt-1" />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
      </div>
    </div>
  );
}
