import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../theme/cargo_colors.dart';
import '../../theme/cargo_spacing.dart';

/// Base shimmer block — use [width], [height], and [radius] to shape it.
class ShimmerBlock extends StatelessWidget {
  const ShimmerBlock({
    super.key,
    this.width,
    this.height = 16,
    this.radius = CargoSpacing.radiusMd,
    this.margin,
  });

  final double? width;
  final double height;
  final double radius;
  final EdgeInsets? margin;

  @override
  Widget build(BuildContext context) => Shimmer.fromColors(
        baseColor: const Color(0xFFE5E7EB),
        highlightColor: const Color(0xFFF9FAFB),
        child: Container(
          width: width,
          height: height,
          margin: margin,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(radius),
          ),
        ),
      );
}

/// Store card skeleton shown while loading.
class StoreCardSkeleton extends StatelessWidget {
  const StoreCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(CargoSpacing.radiusXl),
        ),
        child: Row(
          children: [
            ShimmerBlock(
                width: 72,
                height: 72,
                radius: CargoSpacing.radiusLg),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const ShimmerBlock(height: 14, radius: 4),
                  const SizedBox(height: 6),
                  ShimmerBlock(width: 120, height: 12, radius: 4),
                  const SizedBox(height: 10),
                  Row(children: const [
                    ShimmerBlock(width: 60, height: 24, radius: 12),
                    SizedBox(width: 8),
                    ShimmerBlock(width: 60, height: 24, radius: 12),
                  ]),
                ],
              ),
            ),
          ],
        ),
      );
}

/// Product card skeleton.
class ProductCardSkeleton extends StatelessWidget {
  const ProductCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) => Container(
        width: 160,
        margin: const EdgeInsets.only(right: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(CargoSpacing.radiusXl),
        ),
        child: Column(
          children: [
            ShimmerBlock(
                height: 120,
                radius: CargoSpacing.radiusXl),
            const Padding(
              padding: EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ShimmerBlock(height: 12),
                  SizedBox(height: 6),
                  ShimmerBlock(width: 80, height: 10, radius: 4),
                  SizedBox(height: 8),
                  ShimmerBlock(width: 60, height: 16, radius: 4),
                ],
              ),
            ),
          ],
        ),
      );
}

/// Generic full-screen loading list of [StoreCardSkeleton].
class LoadingList extends StatelessWidget {
  const LoadingList({super.key, this.count = 5});

  final int count;

  @override
  Widget build(BuildContext context) => ListView.builder(
        padding: const EdgeInsets.all(CargoSpacing.screenH),
        itemCount: count,
        itemBuilder: (_, __) => const StoreCardSkeleton(),
      );
}
