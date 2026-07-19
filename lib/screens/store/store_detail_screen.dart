import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import '../../models/store.dart';
import '../../models/product.dart';
import '../../providers/cart_provider.dart';
import '../../services/api_service.dart';
import '../../widgets/product_card.dart';
import '../../widgets/common/loading_shimmer.dart';
import '../../theme/app_theme.dart';

class StoreDetailScreen extends StatefulWidget {
  final int storeId;
  const StoreDetailScreen({super.key, required this.storeId});

  @override
  State<StoreDetailScreen> createState() => _StoreDetailScreenState();
}

class _StoreDetailScreenState extends State<StoreDetailScreen> {
  final _api = ApiService();
  Store? _store;
  List<Product> _products = [];
  List<String> _categories = [];
  String? _selectedCategory;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    try {
      final res = await Future.wait([
        _api.getStore(widget.storeId),
        _api.getStoreProducts(widget.storeId),
      ]);
      _store = res[0] as Store;
      _products = res[1] as List<Product>;
      final cats = _products
          .where((p) => p.categoryName != null)
          .map((p) => p.categoryName!)
          .toSet()
          .toList();
      _categories = cats;
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  List<Product> get _filtered {
    if (_selectedCategory == null) return _products;
    return _products.where((p) => p.categoryName == _selectedCategory).toList();
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();

    return Scaffold(
      backgroundColor: AppColors.surface,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: GestureDetector(
          onTap: () => context.pop(),
          child: Container(
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.4),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.arrow_back_ios_new_rounded,
                color: Colors.white, size: 18),
          ),
        ),
        actions: [
          GestureDetector(
            onTap: () {},
            child: Container(
              margin: const EdgeInsets.all(8),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.4),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.favorite_border_rounded,
                  color: Colors.white, size: 18),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary))
          : _store == null
              ? const Center(child: Text('Store not found'))
              : CustomScrollView(
                  slivers: [
                    // ── Cover image ────────────────────────────────────
                    SliverToBoxAdapter(
                      child: Stack(
                        clipBehavior: Clip.none,
                        children: [
                          CachedNetworkImage(
                            imageUrl: _store!.image,
                            height: 230,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          ),
                          Positioned.fill(
                            child: Container(
                              decoration:
                                  const BoxDecoration(gradient: AppColors.darkGradient),
                            ),
                          ),
                          // Logo overlapping
                          Positioned(
                            bottom: -28,
                            left: 20,
                            child: Container(
                              width: 64,
                              height: 64,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border:
                                    Border.all(color: Colors.white, width: 3),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.15),
                                    blurRadius: 12,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: ClipOval(
                                child: CachedNetworkImage(
                                  imageUrl: _store!.logo ?? _store!.image,
                                  fit: BoxFit.cover,
                                  errorWidget: (_, __, ___) => Container(
                                    color: AppColors.primaryLight,
                                    child: const Icon(
                                        Icons.storefront_rounded,
                                        color: AppColors.primary,
                                        size: 28),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // ── Store info ─────────────────────────────────────
                    SliverToBoxAdapter(
                      child: Container(
                        color: Colors.white,
                        padding:
                            const EdgeInsets.fromLTRB(20, 40, 20, 20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    _store!.name,
                                    style: const TextStyle(
                                      fontSize: 22,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                ),
                                if (_store!.isOnline)
                                  _badge('Online', AppColors.teal),
                                if (_store!.isVerified) ...[
                                  const SizedBox(width: 6),
                                  _badge('Verified', AppColors.primary),
                                ],
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(_store!.categoryName,
                                style: const TextStyle(
                                    fontSize: 13, color: AppColors.textMuted)),
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                RatingBarIndicator(
                                  rating: _store!.rating,
                                  itemBuilder: (_, __) => const Icon(
                                      Icons.star_rounded,
                                      color: AppColors.amber),
                                  itemCount: 5,
                                  itemSize: 16,
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  '${_store!.rating} (${_store!.reviewCount} reviews)',
                                  style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.textPrimary),
                                ),
                              ],
                            ),
                            if (_store!.address != null) ...[
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  const Icon(Icons.location_on_rounded,
                                      size: 14, color: AppColors.textMuted),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      _store!.address!,
                                      style: const TextStyle(
                                          fontSize: 12,
                                          color: AppColors.textMuted),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                            const SizedBox(height: 14),
                            // Delivery info row
                            Row(
                              children: [
                                _infoChip(Icons.access_time_rounded,
                                    _store!.deliveryTime),
                                const SizedBox(width: 10),
                                _infoChip(Icons.local_shipping_outlined,
                                    '\$${_store!.deliveryFee.toStringAsFixed(0)} delivery'),
                                const SizedBox(width: 10),
                                _infoChip(Icons.shopping_bag_outlined,
                                    'Min \$${_store!.minOrder.toStringAsFixed(0)}'),
                              ],
                            ),
                            if (_store!.description != null) ...[
                              const SizedBox(height: 14),
                              Text(
                                _store!.description!,
                                style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textSecondary,
                                    height: 1.5),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),

                    // ── Category chips ─────────────────────────────────
                    if (_categories.isNotEmpty)
                      SliverPersistentHeader(
                        pinned: true,
                        delegate: _CatHeader(
                          categories: _categories,
                          selected: _selectedCategory,
                          onSelect: (c) =>
                              setState(() => _selectedCategory = c),
                        ),
                      ),

                    // ── Product grid ───────────────────────────────────
                    SliverPadding(
                      padding:
                          const EdgeInsets.fromLTRB(16, 16, 16, 100),
                      sliver: _filtered.isEmpty
                          ? const SliverToBoxAdapter(
                              child: Center(
                                child: Padding(
                                  padding: EdgeInsets.all(40),
                                  child: Text('No products available',
                                      style: TextStyle(
                                          color: AppColors.textMuted)),
                                ),
                              ),
                            )
                          : SliverGrid(
                              gridDelegate:
                                  const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 14,
                                childAspectRatio: 0.72,
                              ),
                              delegate: SliverChildBuilderDelegate(
                                (_, i) => ProductCard(product: _filtered[i]),
                                childCount: _filtered.length,
                              ),
                            ),
                    ),
                  ],
                ),
      // ── Cart bottom bar ──────────────────────────────────────────────
      bottomNavigationBar: cart.itemCount > 0
          ? SafeArea(
              child: Container(
                margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                child: ElevatedButton(
                  onPressed: () => context.push('/cart'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text('${cart.itemCount} items',
                            style: const TextStyle(
                                fontSize: 13, fontWeight: FontWeight.w600)),
                      ),
                      const Text('View Cart →',
                          style: TextStyle(
                              fontSize: 15, fontWeight: FontWeight.w700)),
                      Text('\$${cart.total.toStringAsFixed(2)}',
                          style: const TextStyle(
                              fontSize: 15, fontWeight: FontWeight.w700)),
                    ],
                  ),
                ),
              ),
            )
          : null,
    );
  }

  Widget _badge(String text, Color color) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Text(text,
            style: TextStyle(
                fontSize: 11, fontWeight: FontWeight.w600, color: color)),
      );

  Widget _infoChip(IconData icon, String text) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 13, color: AppColors.primary),
            const SizedBox(width: 4),
            Text(text,
                style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textSecondary)),
          ],
        ),
      );
}

class _CatHeader extends SliverPersistentHeaderDelegate {
  final List<String> categories;
  final String? selected;
  final void Function(String?) onSelect;

  const _CatHeader(
      {required this.categories, required this.selected, required this.onSelect});

  @override
  double get minExtent => 56;
  @override
  double get maxExtent => 56;

  @override
  Widget build(
          BuildContext ctx, double shrinkOffset, bool overlapsContent) =>
      Container(
        color: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: categories.length + 1,
          separatorBuilder: (_, __) => const SizedBox(width: 8),
          itemBuilder: (_, i) {
            final isAll = i == 0;
            final cat = isAll ? null : categories[i - 1];
            final isSelected = isAll ? selected == null : selected == cat;
            return GestureDetector(
              onTap: () => onSelect(cat),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary : AppColors.surface,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  isAll ? 'All' : cat!,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                  ),
                ),
              ),
            );
          },
        ),
      );

  @override
  bool shouldRebuild(_CatHeader o) =>
      o.selected != selected || o.categories != categories;
}
