import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/product.dart';
import '../../models/store.dart';
import '../../providers/cart_provider.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/product_card.dart';
import '../../widgets/shimmer_loader.dart';

class StoreDetailScreen extends StatefulWidget {
  final int storeId;
  const StoreDetailScreen({super.key, required this.storeId});
  @override
  State<StoreDetailScreen> createState() => _StoreDetailScreenState();
}

class _StoreDetailScreenState extends State<StoreDetailScreen> {
  Store? _store;
  List<Product> _products = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        ApiService.instance.getStore(widget.storeId),
        ApiService.instance.getStoreProducts(widget.storeId),
      ]);
      if (mounted) setState(() {
        _store = results[0] as Store;
        _products = results[1] as List<Product>;
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: _loading ? _buildLoading() : _buildContent(),
    );
  }

  Widget _buildLoading() => const CustomScrollView(slivers: [
    SliverAppBar(pinned: true, expandedHeight: 200, flexibleSpace: FlexibleSpaceBar(background: ShimmerBox(height: 200))),
    SliverToBoxAdapter(child: SizedBox(height: 16)),
    SliverPadding(
      padding: EdgeInsets.symmetric(horizontal: 16),
      sliver: SliverGrid(
        delegate: SliverChildBuilderDelegate(ProductCardShimmer.new, childCount: 4),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.72),
      ),
    ),
  ]);

  Widget _buildContent() {
    final store = _store;
    if (store == null) {
      return const Center(child: Text('Store not found'));
    }
    return CustomScrollView(
      slivers: [
        SliverAppBar(
          pinned: true,
          expandedHeight: 220,
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          flexibleSpace: FlexibleSpaceBar(
            background: Stack(
              fit: StackFit.expand,
              children: [
                store.coverImage.isNotEmpty
                    ? CachedNetworkImage(imageUrl: store.coverImage, fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => Container(color: AppColors.primary))
                    : Container(decoration: const BoxDecoration(gradient: AppColors.gradientPrimary)),
                DecoratedBox(decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.transparent, Colors.black.withOpacity(0.65)],
                    begin: Alignment.topCenter, end: Alignment.bottomCenter,
                  ),
                )),
                Positioned(bottom: 16, left: 16, right: 16,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      // Logo
                      Container(
                        width: 60, height: 60,
                        decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white, border: Border.all(color: Colors.white, width: 2)),
                        child: ClipOval(
                          child: store.logoImage.isNotEmpty
                              ? CachedNetworkImage(imageUrl: store.logoImage, fit: BoxFit.cover, errorWidget: (_, __, ___) => _logo(store))
                              : _logo(store),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(store.name, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800)),
                          if (store.categoryName != null)
                            Text(store.categoryName!, style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
                        ],
                      )),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        // Store info chips
        SliverToBoxAdapter(child: Padding(
          padding: const EdgeInsets.all(16),
          child: Wrap(spacing: 10, runSpacing: 8, children: [
            _InfoChip(icon: Icons.star_rounded, label: '${store.rating} (${store.reviewCount})', color: AppColors.accent),
            _InfoChip(icon: Icons.schedule_rounded, label: store.deliveryTime, color: AppColors.primary),
            _InfoChip(icon: Icons.delivery_dining_rounded, label: '\$${store.deliveryFee.toStringAsFixed(0)} delivery', color: AppColors.teal),
            if (store.isOpen)
              _InfoChip(icon: Icons.circle, label: 'Open', color: AppColors.success)
            else
              _InfoChip(icon: Icons.circle, label: 'Closed', color: AppColors.error),
            if (store.distance != null)
              _InfoChip(icon: Icons.location_on_rounded, label: '${store.distance!.toStringAsFixed(1)} km', color: AppColors.info),
          ]),
        )),

        if (store.description != null && store.description!.isNotEmpty)
          SliverToBoxAdapter(child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Text(store.description!, style: const TextStyle(color: AppColors.textSecondary, fontSize: 14, height: 1.5)),
          )),

        // Products header
        const SliverToBoxAdapter(child: Padding(
          padding: EdgeInsets.fromLTRB(16, 0, 16, 12),
          child: Text('Menu', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
        )),

        // Products grid
        _products.isEmpty
            ? const SliverToBoxAdapter(child: Padding(
                padding: EdgeInsets.all(32),
                child: Center(child: Text('No products available', style: TextStyle(color: AppColors.textSecondary))),
              ))
            : SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                sliver: SliverGrid(
                  delegate: SliverChildBuilderDelegate(
                    (_, i) => ProductCard(
                      product: _products[i],
                      onAddToCart: () async {
                        final ok = await context.read<CartProvider>().addItem(_products[i].id);
                        if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                          content: Text(ok ? '${_products[i].name} added to cart' : 'Failed'),
                          backgroundColor: ok ? AppColors.success : AppColors.error,
                        ));
                      },
                    ),
                    childCount: _products.length,
                  ),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.72),
                ),
              ),
      ],
    );
  }

  Widget _logo(Store store) => Container(
        decoration: const BoxDecoration(gradient: AppColors.gradientPrimary),
        child: Center(child: Text(store.initial, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800))),
      );
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _InfoChip({required this.icon, required this.label, required this.color});
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(AppRadius.full), border: Border.all(color: color.withOpacity(0.2))),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 13, color: color),
          const SizedBox(width: 5),
          Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color)),
        ]),
      );
}
