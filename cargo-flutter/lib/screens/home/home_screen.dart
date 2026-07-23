import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../../models/product.dart';
import '../../models/store.dart';
import '../../providers/app_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/section_header.dart';
import '../../widgets/shimmer_loader.dart';
import '../../widgets/store_card.dart';
import '../../widgets/product_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _bannerCtrl = PageController();

  final List<Map<String, dynamic>> _banners = [
    {'title': 'Flash Sale Today!', 'subtitle': 'Up to 50% off selected items', 'color': const Color(0xFF5E2D91), 'icon': Icons.flash_on_rounded},
    {'title': 'Free Delivery', 'subtitle': 'On orders above \$30 this week', 'color': const Color(0xFFF25B57), 'icon': Icons.local_shipping_rounded},
    {'title': 'New Stores', 'subtitle': 'Discover fresh arrivals near you', 'color': const Color(0xFF14B8A6), 'icon': Icons.store_rounded},
  ];

  @override
  void dispose() {
    _bannerCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final app = context.watch<AppProvider>();

    return Scaffold(
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () => context.read<AppProvider>().refresh(),
        child: CustomScrollView(
          slivers: [
            // ── App bar ──────────────────────────────────────────────────────
            SliverToBoxAdapter(child: _buildHeader(context, user?.name ?? 'there')),

            // ── Promo banner ─────────────────────────────────────────────────
            SliverToBoxAdapter(child: _buildBanner()),

            // ── Category pills ───────────────────────────────────────────────
            SliverToBoxAdapter(child: _buildCategories(app)),

            const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.lg)),

            // ── Flash sales ──────────────────────────────────────────────────
            if (app.flashSales.isNotEmpty) ...[
              SliverToBoxAdapter(
                child: SectionHeader(
                  title: '⚡ Flash Sales',
                  subtitle: 'Limited-time deals',
                  actionLabel: 'See all',
                  onAction: () => context.push('/search?flash=true'),
                ),
              ),
              SliverToBoxAdapter(child: _buildFlashSales(app.flashSales)),
              const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.lg)),
            ],

            // ── Featured stores ──────────────────────────────────────────────
            SliverToBoxAdapter(
              child: SectionHeader(
                title: '🏪 Featured Stores',
                subtitle: 'Handpicked for you',
                actionLabel: 'View all',
                onAction: () => context.push('/stores'),
              ),
            ),
            SliverToBoxAdapter(child: _buildFeaturedStores(app)),
            const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.lg)),

            // ── Trending products ─────────────────────────────────────────────
            SliverToBoxAdapter(
              child: SectionHeader(
                title: '🔥 Trending Now',
                subtitle: 'Most popular this week',
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 12)),
            if (app.loading)
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                sliver: SliverGrid(
                  delegate: SliverChildBuilderDelegate((_, i) => const ProductCardShimmer(), childCount: 4),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.72),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                sliver: SliverGrid(
                  delegate: SliverChildBuilderDelegate(
                    (_, i) => ProductCard(
                      product: app.trendingProducts[i],
                      onAddToCart: () => _addToCart(context, app.trendingProducts[i]),
                    ),
                    childCount: app.trendingProducts.length,
                  ),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.72),
                ),
              ),

            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, String name) {
    return Container(
      decoration: const BoxDecoration(
        gradient: AppColors.gradientPrimary,
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          child: Column(
            children: [
              Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Good ${_greeting()}! 👋', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                      Text(name.split(' ').first, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
                    ],
                  ),
                  const Spacer(),
                  // Notifications
                  GestureDetector(
                    onTap: () => context.push('/notifications'),
                    child: Container(
                      width: 42, height: 42,
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
                      child: const Icon(Icons.notifications_outlined, color: Colors.white, size: 22),
                    ),
                  ),
                  const SizedBox(width: 10),
                  // Favorites
                  GestureDetector(
                    onTap: () => context.push('/favorites'),
                    child: Container(
                      width: 42, height: 42,
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
                      child: const Icon(Icons.favorite_border_rounded, color: Colors.white, size: 22),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              // Search bar
              GestureDetector(
                onTap: () => context.go('/search'),
                child: Container(
                  height: 48,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.md)),
                  child: const Row(
                    children: [
                      Icon(Icons.search_rounded, color: AppColors.textMuted, size: 22),
                      SizedBox(width: 10),
                      Text('Search stores, products…', style: TextStyle(color: AppColors.textMuted, fontSize: 14)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBanner() {
    return Column(
      children: [
        const SizedBox(height: 20),
        SizedBox(
          height: 160,
          child: PageView.builder(
            controller: _bannerCtrl,
            itemCount: _banners.length,
            itemBuilder: (_, i) {
              final b = _banners[i];
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Container(
                  decoration: BoxDecoration(
                    color: b['color'] as Color,
                    borderRadius: BorderRadius.circular(AppRadius.xl),
                    boxShadow: [BoxShadow(color: (b['color'] as Color).withOpacity(0.35), blurRadius: 20, offset: const Offset(0, 8))],
                  ),
                  padding: const EdgeInsets.all(24),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(AppRadius.full)),
                              child: const Text('LIMITED OFFER', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.8)),
                            ),
                            const SizedBox(height: 8),
                            Text(b['title'] as String, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800, height: 1.1)),
                            const SizedBox(height: 4),
                            Text(b['subtitle'] as String, style: TextStyle(color: Colors.white.withOpacity(0.85), fontSize: 13)),
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.full)),
                              child: Text('Shop Now', style: TextStyle(color: b['color'] as Color, fontSize: 13, fontWeight: FontWeight.w700)),
                            ),
                          ],
                        ),
                      ),
                      Icon(b['icon'] as IconData, color: Colors.white.withOpacity(0.2), size: 90),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 12),
        SmoothPageIndicator(
          controller: _bannerCtrl,
          count: _banners.length,
          effect: const ExpandingDotsEffect(
            activeDotColor: AppColors.primary,
            dotColor: AppColors.border,
            dotHeight: 6,
            dotWidth: 6,
            expansionFactor: 3,
          ),
        ),
        const SizedBox(height: 8),
      ],
    );
  }

  Widget _buildCategories(AppProvider app) {
    if (app.loading) {
      return SizedBox(
        height: 90,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 8),
          itemCount: 6,
          separatorBuilder: (_, __) => const SizedBox(width: 12),
          itemBuilder: (_, __) => Column(
            children: [const ShimmerBox(width: 56, height: 56, radius: AppRadius.full), const SizedBox(height: 4), ShimmerBox(width: 44, height: 10, radius: 4)],
          ),
        ),
      );
    }
    return SizedBox(
      height: 90,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 4),
        itemCount: app.categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (_, i) {
          final cat = app.categories[i];
          return GestureDetector(
            onTap: () => context.push('/stores?category=${cat.slug ?? cat.name}'),
            child: Column(
              children: [
                Container(
                  width: 56, height: 56,
                  decoration: BoxDecoration(
                    gradient: AppColors.gradientPrimary,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.2), blurRadius: 8, offset: const Offset(0, 3))],
                  ),
                  child: Center(
                    child: cat.icon != null && cat.icon!.isNotEmpty
                        ? Text(cat.icon!, style: const TextStyle(fontSize: 26))
                        : const Icon(Icons.category_rounded, color: Colors.white, size: 24),
                  ),
                ),
                const SizedBox(height: 6),
                Text(cat.name, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildFlashSales(List<Product> items) {
    return Column(
      children: [
        const SizedBox(height: 12),
        SizedBox(
          height: 220,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (_, i) => ProductCardHorizontal(
              product: items[i],
              onAddToCart: () => _addToCart(context, items[i]),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFeaturedStores(AppProvider app) {
    return Column(
      children: [
        const SizedBox(height: 12),
        if (app.loading)
          SizedBox(
            height: 240,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              itemCount: 3,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (_, __) => const SizedBox(width: 280, child: StoreCardShimmer()),
            ),
          )
        else
          SizedBox(
            height: 240,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              itemCount: app.featuredStores.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (_, i) => SizedBox(width: 280, child: StoreCard(store: app.featuredStores[i])),
            ),
          ),
      ],
    );
  }

  Future<void> _addToCart(BuildContext context, Product product) async {
    final ok = await context.read<CartProvider>().addItem(product.id);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(ok ? '${product.name} added to cart' : 'Failed to add item'),
      backgroundColor: ok ? AppColors.success : AppColors.error,
      duration: const Duration(seconds: 2),
    ));
  }

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }
}
