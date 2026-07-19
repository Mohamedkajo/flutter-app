import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:badges/badges.dart' as badges;
import '../../providers/app_provider.dart';
import '../../providers/cart_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/store.dart';
import '../../models/product.dart';
import '../../models/category.dart';
import '../../widgets/store_card.dart';
import '../../widgets/product_card.dart';
import '../../widgets/flash_sale_banner.dart';
import '../../widgets/common/section_header.dart';
import '../../widgets/common/loading_shimmer.dart';
import '../../theme/app_theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AppProvider>().loadHomeData();
      context.read<CartProvider>().fetchCart();
    });
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final auth = context.watch<AuthProvider>();
    final cart = context.watch<CartProvider>();

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () => context.read<AppProvider>().loadHomeData(),
        child: CustomScrollView(
          slivers: [
            // ── App Bar ──────────────────────────────────────────────────
            SliverAppBar(
              pinned: true,
              expandedHeight: 110,
              backgroundColor: AppColors.primary,
              elevation: 0,
              flexibleSpace: FlexibleSpaceBar(
                collapseMode: CollapseMode.pin,
                background: Container(
                  decoration: const BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.vertical(
                      bottom: Radius.circular(28),
                    ),
                  ),
                  padding: const EdgeInsets.fromLTRB(20, 52, 20, 16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () {},
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.end,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.location_on_rounded,
                                      color: Colors.white60, size: 13),
                                  SizedBox(width: 4),
                                  Text(
                                    'DELIVERING TO',
                                    style: TextStyle(
                                      color: Colors.white60,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w600,
                                      letterSpacing: 1,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 3),
                              Row(
                                children: [
                                  Text(
                                    'Home — Dubai',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 17,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  const Icon(Icons.keyboard_arrow_down_rounded,
                                      color: Colors.white, size: 20),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      badges.Badge(
                        showBadge: app.unreadCount > 0,
                        badgeContent: Text(
                          '${app.unreadCount}',
                          style: const TextStyle(
                              color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700),
                        ),
                        badgeStyle: const badges.BadgeStyle(badgeColor: AppColors.coral),
                        child: GestureDetector(
                          onTap: () => context.push('/notifications'),
                          child: Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.15),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.notifications_outlined,
                                color: Colors.white, size: 22),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              bottom: PreferredSize(
                preferredSize: const Size.fromHeight(0),
                child: Container(
                  height: 28,
                  decoration: const BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                  ),
                ),
              ),
            ),

            SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Featured Stores (Stories style) ────────────────────
                  const SizedBox(height: 4),
                  _FeaturedStoresRow(
                    stores: app.featuredStores,
                    isLoading: app.isLoading,
                  ),

                  // ── Services Grid ───────────────────────────────────────
                  const SizedBox(height: 20),
                  _ServicesGrid(),

                  // ── Flash Sale ─────────────────────────────────────────
                  const SizedBox(height: 20),
                  if (app.flashSales.isNotEmpty)
                    FlashSaleBanner(
                      discount: app.flashSales.first['discount'] as String? ?? 'Up to 30% OFF',
                      endsIn: Duration(
                        hours: (app.flashSales.first['endsInHours'] as int?) ?? 2,
                        minutes: (app.flashSales.first['endsInMinutes'] as int?) ?? 45,
                      ),
                    )
                  else if (!app.isLoading)
                    const FlashSaleBanner(
                      discount: 'Up to 30% OFF',
                      endsIn: Duration(hours: 2, minutes: 45),
                    ),

                  // ── Shop Online ─────────────────────────────────────────
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: SectionHeader(
                      title: 'Shop Online',
                      subtitle: 'Vendors who sell online',
                      onAction: () => context.push('/stores'),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _OnlineStoresRow(
                    stores: app.onlineStores,
                    isLoading: app.isLoading,
                  ),

                  // ── Categories ─────────────────────────────────────────
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: SectionHeader(
                      title: 'Explore Categories',
                      onAction: () => context.push('/stores'),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _CategoriesGrid(
                    categories: app.categories,
                    isLoading: app.isLoading,
                  ),

                  // ── Nearby Stores ──────────────────────────────────────
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: SectionHeader(
                      title: 'Popular Nearby',
                      subtitle: 'Stores around you',
                      onAction: () => context.push('/stores'),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _NearbyStoresRow(
                    stores: app.nearbyStores,
                    isLoading: app.isLoading,
                  ),

                  // ── Trending Products ──────────────────────────────────
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: SectionHeader(
                      title: 'Trending Items',
                      subtitle: 'Everyone is ordering this',
                      onAction: () => context.push('/search'),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _TrendingGrid(
                    products: app.trendingProducts,
                    isLoading: app.isLoading,
                  ),

                  const SizedBox(height: 100),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Featured stores horizontal row (story circles) ──────────────────────────
class _FeaturedStoresRow extends StatelessWidget {
  final List<Store> stores;
  final bool isLoading;
  const _FeaturedStoresRow({required this.stores, required this.isLoading});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 108,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: isLoading ? 6 : stores.length,
        separatorBuilder: (_, __) => const SizedBox(width: 16),
        itemBuilder: (ctx, i) {
          if (isLoading) return const FeaturedStoreShimmer();
          final store = stores[i];
          return GestureDetector(
            onTap: () => ctx.push('/stores/${store.id}'),
            child: SizedBox(
              width: 72,
              child: Column(
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    padding: const EdgeInsets.all(3),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        colors: [Color(0xFF7B3FC4), Color(0xFFF25B57)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.25),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Container(
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                      ),
                      padding: const EdgeInsets.all(2.5),
                      child: ClipOval(
                        child: CachedNetworkImage(
                          imageUrl: store.image,
                          fit: BoxFit.cover,
                          errorWidget: (_, __, ___) => Container(
                            color: AppColors.primaryLight,
                            child: const Icon(Icons.storefront_rounded,
                                color: AppColors.primary, size: 28),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    store.name,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// ── Services grid ─────────────────────────────────────────────────────────
class _ServicesGrid extends StatelessWidget {
  final _services = const [
    {'emoji': '🛵', 'label': 'Scooter', 'color': Color(0xFFFFF0E6)},
    {'emoji': '📦', 'label': 'Package', 'color': Color(0xFFE8F4FF)},
    {'emoji': '🛺', 'label': 'Tricycle', 'color': Color(0xFFE8FFF6)},
    {'emoji': '🚐', 'label': 'Van', 'color': Color(0xFFF3E8FF)},
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: _services.map((s) {
          return Expanded(
            child: Padding(
              padding: EdgeInsets.only(
                right: s != _services.last ? 10 : 0,
              ),
              child: GestureDetector(
                onTap: () {},
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.06),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: s['color'] as Color,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Center(
                          child: Text(s['emoji'] as String,
                              style: const TextStyle(fontSize: 24)),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        s['label'] as String,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ── Online stores horizontal row ──────────────────────────────────────────
class _OnlineStoresRow extends StatelessWidget {
  final List<Store> stores;
  final bool isLoading;
  const _OnlineStoresRow({required this.stores, required this.isLoading});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 148,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: isLoading ? 4 : stores.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (ctx, i) {
          if (isLoading) {
            return const ShimmerBox(width: 110, height: 120, borderRadius: 18);
          }
          final store = stores[i];
          return GestureDetector(
            onTap: () => ctx.push('/stores/${store.id}'),
            child: SizedBox(
              width: 110,
              child: Column(
                children: [
                  Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(18),
                        child: CachedNetworkImage(
                          imageUrl: store.image,
                          width: 110,
                          height: 110,
                          fit: BoxFit.cover,
                          errorWidget: (_, __, ___) => Container(
                            width: 110,
                            height: 110,
                            color: AppColors.primaryLight,
                          ),
                        ),
                      ),
                      Positioned.fill(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(18),
                          child: Container(
                            decoration: const BoxDecoration(
                              gradient: AppColors.darkGradient,
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        top: 6,
                        right: 6,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.teal,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 4,
                                height: 4,
                                decoration: const BoxDecoration(
                                    color: Colors.white, shape: BoxShape.circle),
                              ),
                              const SizedBox(width: 3),
                              const Text('Online',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 8,
                                      fontWeight: FontWeight.w700)),
                            ],
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 6,
                        left: 0,
                        right: 0,
                        child: Text(
                          store.name,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '${store.categoryIcon ?? ''} ${store.categoryName}',
                      style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// ── Categories grid ───────────────────────────────────────────────────────
class _CategoriesGrid extends StatelessWidget {
  final List<Category> categories;
  final bool isLoading;
  const _CategoriesGrid({required this.categories, required this.isLoading});

  @override
  Widget build(BuildContext context) {
    final items = categories.take(8).toList();
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 4,
          mainAxisSpacing: 12,
          crossAxisSpacing: 10,
          childAspectRatio: 0.85,
        ),
        itemCount: isLoading ? 8 : items.length,
        itemBuilder: (ctx, i) {
          if (isLoading) {
            return const ShimmerBox(width: 70, height: 80, borderRadius: 14);
          }
          final cat = items[i];
          return GestureDetector(
            onTap: () => ctx.push('/stores'),
            child: Column(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.07),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(cat.icon,
                        style: const TextStyle(fontSize: 26)),
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  cat.name,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ── Nearby stores horizontal row ──────────────────────────────────────────
class _NearbyStoresRow extends StatelessWidget {
  final List<Store> stores;
  final bool isLoading;
  const _NearbyStoresRow({required this.stores, required this.isLoading});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 260,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: isLoading ? 4 : stores.length,
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (ctx, i) {
          if (isLoading) {
            return const SizedBox(width: 200, child: StoreCardShimmer());
          }
          return SizedBox(
            width: 200,
            child: StoreCard(store: stores[i]),
          );
        },
      ),
    );
  }
}

// ── Trending products 2-column grid ───────────────────────────────────────
class _TrendingGrid extends StatelessWidget {
  final List<Product> products;
  final bool isLoading;
  const _TrendingGrid({required this.products, required this.isLoading});

  @override
  Widget build(BuildContext context) {
    final items = products.take(6).toList();
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 14,
          crossAxisSpacing: 12,
          childAspectRatio: 0.72,
        ),
        itemCount: isLoading ? 4 : items.length,
        itemBuilder: (ctx, i) {
          if (isLoading) return const ProductCardShimmer();
          return ProductCard(product: items[i]);
        },
      ),
    );
  }
}
