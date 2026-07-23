import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../models/store.dart';
import '../theme/app_theme.dart';

class StoreCard extends StatelessWidget {
  final Store store;
  const StoreCard({super.key, required this.store});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/stores/${store.id}'),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: AppColors.border),
          boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.06), blurRadius: 16, offset: const Offset(0, 4))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Banner image
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
              child: Stack(
                children: [
                  SizedBox(
                    height: 140,
                    width: double.infinity,
                    child: store.coverImage.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: store.coverImage,
                            fit: BoxFit.cover,
                            errorWidget: (_, __, ___) => _placeholder(),
                            placeholder: (_, __) => _placeholder(shimmer: true),
                          )
                        : _placeholder(),
                  ),
                  // Gradient overlay
                  Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [Colors.transparent, Colors.black.withOpacity(0.55)],
                          stops: const [0.4, 1.0],
                        ),
                      ),
                    ),
                  ),
                  // Featured badge
                  if (store.isFeatured)
                    Positioned(
                      top: 10, left: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.accent,
                          borderRadius: BorderRadius.circular(AppRadius.full),
                        ),
                        child: const Text('Featured', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
                      ),
                    ),
                  // Online badge
                  if (store.isOnline)
                    Positioned(
                      top: 10, right: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.teal,
                          borderRadius: BorderRadius.circular(AppRadius.full),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(width: 6, height: 6, decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle)),
                            const SizedBox(width: 4),
                            const Text('Online', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                    ),
                  // Rating & delivery time badges (bottom)
                  Positioned(
                    bottom: 8, left: 10,
                    child: _Badge(icon: Icons.star_rounded, iconColor: AppColors.accent, text: '${store.rating}'),
                  ),
                  Positioned(
                    bottom: 8, right: 10,
                    child: _Badge(icon: Icons.schedule_rounded, iconColor: Colors.white70, text: store.deliveryTime),
                  ),
                ],
              ),
            ),

            // Store info
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Logo circle
                  Transform.translate(
                    offset: const Offset(0, -18),
                    child: Container(
                      width: 48, height: 48,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                        border: Border.all(color: Colors.white, width: 3),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 8, offset: const Offset(0, 2))],
                      ),
                      child: ClipOval(
                        child: store.logoImage.isNotEmpty
                            ? CachedNetworkImage(
                                imageUrl: store.logoImage,
                                fit: BoxFit.cover,
                                errorWidget: (_, __, ___) => _logoPlaceholder(store.initial),
                              )
                            : _logoPlaceholder(store.initial),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 6),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(store.name,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                              ),
                              if (store.isVerified)
                                const Icon(Icons.verified_rounded, color: AppColors.info, size: 16),
                            ],
                          ),
                          if (store.categoryName != null)
                            Text(store.categoryName!, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w400)),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              _Chip(label: store.deliveryTime, icon: Icons.schedule_rounded),
                              const SizedBox(width: 6),
                              _Chip(label: '\$${store.deliveryFee.toStringAsFixed(0)} delivery'),
                              if (store.distance != null) ...[
                                const SizedBox(width: 6),
                                _Chip(label: '${store.distance!.toStringAsFixed(1)} km', icon: Icons.location_on_rounded),
                              ],
                            ],
                          ),
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

  Widget _placeholder({bool shimmer = false}) => Container(
        color: AppColors.shimmerBase,
        child: const Center(child: Icon(Icons.store_rounded, color: AppColors.primary, size: 36)),
      );

  Widget _logoPlaceholder(String initial) => Container(
        decoration: const BoxDecoration(gradient: AppColors.gradientPrimary),
        child: Center(
          child: Text(initial,
              style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800)),
        ),
      );
}

class _Badge extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String text;
  const _Badge({required this.icon, required this.iconColor, required this.text});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.92),
          borderRadius: BorderRadius.circular(AppRadius.full),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 12, color: iconColor == Colors.white70 ? AppColors.textSecondary : iconColor),
            const SizedBox(width: 3),
            Text(text, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          ],
        ),
      );
}

class _Chip extends StatelessWidget {
  final String label;
  final IconData? icon;
  const _Chip({required this.label, this.icon});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
        decoration: BoxDecoration(
          color: AppColors.divider,
          borderRadius: BorderRadius.circular(AppRadius.full),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[Icon(icon!, size: 10, color: AppColors.primary), const SizedBox(width: 3)],
            Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
          ],
        ),
      );
}
