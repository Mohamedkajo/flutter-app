import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/cargo_colors.dart';
import '../../theme/cargo_spacing.dart';

/// Small pill-shaped tag for delivery time, fees, categories, etc.
class CargoTag extends StatelessWidget {
  const CargoTag({
    super.key,
    required this.label,
    this.icon,
    this.color,
    this.backgroundColor,
    this.fontSize = 11,
  });

  const CargoTag.primary({
    super.key,
    required this.label,
    this.icon,
    this.fontSize = 11,
  })  : color = CargoColors.primary,
        backgroundColor = CargoColors.primaryLight;

  const CargoTag.muted({
    super.key,
    required this.label,
    this.icon,
    this.fontSize = 11,
  })  : color = CargoColors.textSecondary,
        backgroundColor = const Color(0xFFF3F4F6);

  const CargoTag.teal({
    super.key,
    required this.label,
    this.icon,
    this.fontSize = 11,
  })  : color = CargoColors.teal,
        backgroundColor = const Color(0xFFE6F7F5);

  final String label;
  final IconData? icon;
  final Color? color;
  final Color? backgroundColor;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    final fg = color ?? CargoColors.primary;
    final bg = backgroundColor ?? CargoColors.primaryLight;
    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: CargoSpacing.sm, vertical: CargoSpacing.xxs + 1),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(CargoSpacing.radiusMax),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: fontSize + 1, color: fg),
            const SizedBox(width: 3),
          ],
          Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: fontSize,
              fontWeight: FontWeight.w600,
              color: fg,
            ),
          ),
        ],
      ),
    );
  }
}
