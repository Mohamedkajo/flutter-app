import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../models/product.dart';
import '../theme/app_theme.dart';

class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback? onAddToCart;

  const ProductCard({super.key, required this.product, this.onAddToCart});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/products/${product.id}'),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: AppColors.border),
          boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.05), blurRadius: 12, offset: const Offset(0, 3))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
              child: Stack(
                children: [
                  SizedBox(
                    height: 130,
                    width: double.infinity,
                    child: product.image != null && product.image!.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: product.image!,
                            fit: BoxFit.cover,
                            errorWidget: (_, __, ___) => _placeholder(),
                          )
                        : _placeholder(),
                  ),
                  // Discount badge
                  if (product.hasDiscount)
                    Positioned(
                      top: 8, left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.secondary,
                          borderRadius: BorderRadius.circular(AppRadius.full),
                        ),
                        child: Text(
                          '-${product.effectiveDiscount.toInt()}%',
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ),
                  // Unavailable overlay
                  if (!product.isAvailable)
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.45),
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
                        ),
                        child: const Center(
                          child: Text('Unavailable',
                              style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Info
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary, height: 1.3)),
                  if (product.storeName != null) ...[
                    const SizedBox(height: 2),
                    Text(product.storeName!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                  ],
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Icons.star_rounded, size: 13, color: AppColors.accent),
                      const SizedBox(width: 2),
                      Text('${product.rating}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                      const Spacer(),
                      // Price
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text('\$${product.price.toStringAsFixed(2)}',
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primary)),
                          if (product.originalPrice != null && product.originalPrice! > product.price)
                            Text('\$${product.originalPrice!.toStringAsFixed(2)}',
                                style: const TextStyle(fontSize: 10, color: AppColors.textMuted, decoration: TextDecoration.lineThrough)),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  // Add to cart button
                  SizedBox(
                    width: double.infinity,
                    height: 34,
                    child: ElevatedButton(
                      onPressed: product.isAvailable ? onAddToCart : null,
                      style: ElevatedButton.styleFrom(
                        padding: EdgeInsets.zero,
                        backgroundColor: AppColors.primary,
                        disabledBackgroundColor: AppColors.border,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
                        elevation: 0,
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.add_rounded, size: 16, color: Colors.white),
                          SizedBox(width: 4),
                          Text('Add', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _placeholder() => Container(
        color: AppColors.shimmerBase,
        child: const Center(child: Icon(Icons.fastfood_rounded, color: AppColors.primary, size: 32)),
      );
}

/// Horizontal product card for flash sales / featured rows
class ProductCardHorizontal extends StatelessWidget {
  final Product product;
  final VoidCallback? onAddToCart;

  const ProductCardHorizontal({super.key, required this.product, this.onAddToCart});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/products/${product.id}'),
      child: Container(
        width: 200,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: AppColors.border),
          boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.05), blurRadius: 12, offset: const Offset(0, 3))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
              child: Stack(
                children: [
                  SizedBox(
                    height: 110,
                    width: double.infinity,
                    child: product.image != null && product.image!.isNotEmpty
                        ? CachedNetworkImage(imageUrl: product.image!, fit: BoxFit.cover,
                            errorWidget: (_, __, ___) => Container(color: AppColors.shimmerBase))
                        : Container(color: AppColors.shimmerBase, child: const Center(child: Icon(Icons.fastfood_rounded, color: AppColors.primary, size: 28))),
                  ),
                  if (product.hasDiscount)
                    Positioned(
                      top: 6, left: 6,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: AppColors.secondary, borderRadius: BorderRadius.circular(AppRadius.full)),
                        child: Text('-${product.effectiveDiscount.toInt()}%',
                            style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800)),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name, maxLines: 1, overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('\$${product.price.toStringAsFixed(2)}',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primary)),
                      GestureDetector(
                        onTap: onAddToCart,
                        child: Container(
                          width: 28, height: 28,
                          decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(8)),
                          child: const Icon(Icons.add_rounded, color: Colors.white, size: 18),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
