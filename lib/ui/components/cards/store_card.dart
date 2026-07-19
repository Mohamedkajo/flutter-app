import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../models/store.dart';
import '../../theme/cargo_colors.dart';
import '../../theme/cargo_spacing.dart';
import '../badges/status_badge.dart';
import '../misc/rating_row.dart';
import '../avatars/store_avatar.dart';

/// Horizontal list-row store card — used in StoreListing & Search results.
class StoreListCard extends StatelessWidget {
  const StoreListCard({
    super.key,
    required this.store,
    required this.onTap,
  });

  final Store store;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(CargoSpacing.radiusXl),
          boxShadow: [
            BoxShadow(
              color: CargoColors.primary.withOpacity(0.06),
              blurRadius: 12,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          children: [
            // ── Store image ─────────────────────────────────────────────
            ClipRRect(
              borderRadius: const BorderRadius.horizontal(
                  left: Radius.circular(CargoSpacing.radiusXl)),
              child: CachedNetworkImage(
                imageUrl: store.image,
                width: 100,
                height: 100,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) => Container(
                  width: 100,
                  height: 100,
                  color: CargoColors.primaryLight,
                  child: const Icon(Icons.store_rounded,
                      color: CargoColors.primary, size: 32),
                ),
              ),
            ),

            // ── Info ─────────────────────────────────────────────────────
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Name + verified
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            store.name,
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: CargoColors.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (store.isVerified)
                          const Padding(
                            padding: EdgeInsets.only(left: 4),
                            child: Icon(Icons.verified_rounded,
                                size: 14, color: CargoColors.primary),
                          ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      store.categoryName,
                      style: GoogleFonts.poppins(
                          fontSize: 12, color: CargoColors.textSecondary),
                    ),
                    const SizedBox(height: 6),
                    RatingRow(
                        rating: store.rating,
                        reviewCount: store.reviewCount,
                        size: 12),
                    const SizedBox(height: 6),
                    // Delivery chips
                    Row(
                      children: [
                        _chip(
                          icon: Icons.access_time_rounded,
                          label: store.deliveryTime,
                          color: CargoColors.primary,
                          bg: CargoColors.primaryLight,
                        ),
                        const SizedBox(width: 6),
                        _chip(
                          icon: Icons.delivery_dining_rounded,
                          label: store.deliveryFee == 0
                              ? 'Free'
                              : 'AED ${store.deliveryFee.toInt()}',
                          color: CargoColors.textSecondary,
                          bg: const Color(0xFFF3F4F6),
                        ),
                        if (store.isOnline) ...[
                          const SizedBox(width: 6),
                          OnlineDot(isOnline: store.isOpen),
                          const SizedBox(width: 4),
                          Text(store.isOpen ? 'Open' : 'Closed',
                              style: GoogleFonts.poppins(
                                  fontSize: 10,
                                  color: store.isOpen
                                      ? CargoColors.teal
                                      : CargoColors.textMuted)),
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
    );
  }

  Widget _chip(
      {required IconData icon,
      required String label,
      required Color color,
      required Color bg}) =>
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(CargoSpacing.radiusMax),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 11, color: color),
            const SizedBox(width: 3),
            Text(label,
                style: GoogleFonts.poppins(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: color)),
          ],
        ),
      );
}

/// Compact featured circle card — used on the Home screen hero row.
class FeaturedStoreCircle extends StatelessWidget {
  const FeaturedStoreCircle({
    super.key,
    required this.store,
    required this.onTap,
  });

  final Store store;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 100,
        child: Column(
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(18),
                  child: CachedNetworkImage(
                    imageUrl: store.image,
                    width: 100,
                    height: 100,
                    fit: BoxFit.cover,
                    errorWidget: (_, __, ___) => Container(
                      width: 100,
                      height: 100,
                      color: CargoColors.primaryLight,
                    ),
                  ),
                ),
                // dark overlay
                Positioned.fill(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(18),
                    child: Container(
                      decoration: const BoxDecoration(
                        gradient: CargoColors.darkGradient,
                      ),
                    ),
                  ),
                ),
                // rating badge
                Positioned(
                  bottom: 6,
                  left: 6,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.black45,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.star_rounded,
                            color: CargoColors.amber, size: 10),
                        const SizedBox(width: 2),
                        Text(store.rating.toStringAsFixed(1),
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              store.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.poppins(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: CargoColors.textPrimary),
            ),
            Text(
              store.deliveryTime,
              style: GoogleFonts.poppins(
                  fontSize: 10, color: CargoColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }
}
