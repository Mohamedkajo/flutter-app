import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:provider/provider.dart';
import '../../models/product.dart';
import '../../providers/cart_provider.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class ProductDetailScreen extends StatefulWidget {
  final int productId;
  const ProductDetailScreen({super.key, required this.productId});
  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  Product? _product;
  bool _loading = true;
  int _qty = 1;
  bool _addingToCart = false;
  bool _isFavorite = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final p = await ApiService.instance.getProduct(widget.productId);
      if (mounted) setState(() { _product = p; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _addToCart() async {
    if (_product == null) return;
    setState(() => _addingToCart = true);
    final ok = await context.read<CartProvider>().addItem(_product!.id, quantity: _qty);
    if (!mounted) return;
    setState(() => _addingToCart = false);
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(ok ? 'Added to cart 🛍️' : 'Failed to add'),
      backgroundColor: ok ? AppColors.success : AppColors.error,
    ));
  }

  Future<void> _toggleFavorite() async {
    if (_product == null) return;
    setState(() => _isFavorite = !_isFavorite);
    try {
      await ApiService.instance.toggleFavorite(_product!.id);
    } catch (_) {
      if (mounted) setState(() => _isFavorite = !_isFavorite);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _product == null
              ? const Center(child: Text('Product not found'))
              : Stack(
                  children: [
                    CustomScrollView(
                      slivers: [
                        SliverAppBar(
                          pinned: true,
                          expandedHeight: 280,
                          backgroundColor: Colors.white,
                          foregroundColor: AppColors.textPrimary,
                          actions: [
                            IconButton(
                              icon: Icon(_isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                                  color: _isFavorite ? AppColors.secondary : AppColors.textMuted),
                              onPressed: _toggleFavorite,
                            ),
                          ],
                          flexibleSpace: FlexibleSpaceBar(
                            background: _product!.image != null && _product!.image!.isNotEmpty
                                ? CachedNetworkImage(imageUrl: _product!.image!, fit: BoxFit.cover,
                                    errorWidget: (_, __, ___) => _imagePlaceholder())
                                : _imagePlaceholder(),
                          ),
                        ),
                        SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Category
                                if (_product!.categoryName != null)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.08), borderRadius: BorderRadius.circular(AppRadius.full)),
                                    child: Text(_product!.categoryName!, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary)),
                                  ),
                                const SizedBox(height: 12),
                                // Name
                                Text(_product!.name, style: Theme.of(context).textTheme.headlineMedium),
                                const SizedBox(height: 8),
                                // Rating
                                Row(children: [
                                  RatingBarIndicator(
                                    rating: _product!.rating,
                                    itemBuilder: (_, __) => const Icon(Icons.star_rounded, color: AppColors.accent),
                                    itemCount: 5, itemSize: 18,
                                  ),
                                  const SizedBox(width: 8),
                                  Text('${_product!.rating} (${_product!.reviewCount} reviews)',
                                      style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                                ]),
                                const SizedBox(height: 16),
                                // Price
                                Row(children: [
                                  Text('\$${_product!.price.toStringAsFixed(2)}',
                                      style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: AppColors.primary)),
                                  if (_product!.originalPrice != null && _product!.originalPrice! > _product!.price) ...[
                                    const SizedBox(width: 10),
                                    Text('\$${_product!.originalPrice!.toStringAsFixed(2)}',
                                        style: const TextStyle(fontSize: 16, color: AppColors.textMuted, decoration: TextDecoration.lineThrough)),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(color: AppColors.secondary.withOpacity(0.1), borderRadius: BorderRadius.circular(AppRadius.full)),
                                      child: Text('-${_product!.effectiveDiscount.toInt()}%',
                                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.secondary)),
                                    ),
                                  ],
                                ]),

                                // Store
                                if (_product!.storeName != null) ...[
                                  const SizedBox(height: 12),
                                  Row(children: [
                                    const Icon(Icons.store_rounded, size: 16, color: AppColors.textMuted),
                                    const SizedBox(width: 6),
                                    Text(_product!.storeName!, style: const TextStyle(fontSize: 14, color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
                                  ]),
                                ],

                                const Divider(height: 32),

                                // Description
                                if (_product!.description != null && _product!.description!.isNotEmpty) ...[
                                  const Text('Description', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                                  const SizedBox(height: 8),
                                  Text(_product!.description!,
                                      style: const TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.6)),
                                  const SizedBox(height: 16),
                                ],

                                // Tags
                                if (_product!.tags.isNotEmpty) ...[
                                  Wrap(spacing: 8, runSpacing: 8,
                                      children: _product!.tags.map((tag) => Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                            decoration: BoxDecoration(color: AppColors.divider, borderRadius: BorderRadius.circular(AppRadius.full)),
                                            child: Text(tag, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
                                          )).toList()),
                                ],

                                const SizedBox(height: 120),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),

                    // Bottom add to cart
                    Positioned(
                      bottom: 0, left: 0, right: 0,
                      child: Container(
                        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 24, offset: const Offset(0, -6))],
                        ),
                        child: Row(children: [
                          // Qty
                          Container(
                            decoration: BoxDecoration(border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(AppRadius.md)),
                            child: Row(children: [
                              _QtyBtn(icon: Icons.remove, onTap: () { if (_qty > 1) setState(() => _qty--); }),
                              Padding(padding: const EdgeInsets.symmetric(horizontal: 16),
                                  child: Text('$_qty', style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700))),
                              _QtyBtn(icon: Icons.add, onTap: () => setState(() => _qty++)),
                            ]),
                          ),
                          const SizedBox(width: 14),
                          Expanded(child: SizedBox(
                            height: 52,
                            child: ElevatedButton(
                              onPressed: _product!.isAvailable && !_addingToCart ? _addToCart : null,
                              child: _addingToCart
                                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                                  : Text('Add to Cart · \$${(_product!.price * _qty).toStringAsFixed(2)}',
                                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                            ),
                          )),
                        ]),
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _imagePlaceholder() => Container(
        color: AppColors.shimmerBase,
        child: const Center(child: Icon(Icons.fastfood_rounded, color: AppColors.primary, size: 60)),
      );
}

class _QtyBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _QtyBtn({required this.icon, required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: SizedBox(width: 42, height: 48, child: Icon(icon, size: 20, color: AppColors.primary)),
      );
}
