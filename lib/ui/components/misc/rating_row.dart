import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/cargo_colors.dart';

/// Star-rating row: ★ 4.8 · 324 ratings
class RatingRow extends StatelessWidget {
  const RatingRow({
    super.key,
    required this.rating,
    this.reviewCount,
    this.size = 13,
    this.showCount = true,
  });

  final double rating;
  final int? reviewCount;
  final double size;
  final bool showCount;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.star_rounded, color: CargoColors.amber, size: size + 1),
        const SizedBox(width: 3),
        Text(
          rating.toStringAsFixed(1),
          style: GoogleFonts.poppins(
            fontSize: size,
            fontWeight: FontWeight.w700,
            color: CargoColors.textPrimary,
          ),
        ),
        if (showCount && reviewCount != null) ...[
          Text(
            ' · ${reviewCount!}+ ratings',
            style: GoogleFonts.poppins(
              fontSize: size - 1,
              color: CargoColors.textMuted,
            ),
          ),
        ],
      ],
    );
  }
}
