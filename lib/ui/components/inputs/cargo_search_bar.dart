import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/cargo_colors.dart';
import '../../theme/cargo_spacing.dart';

/// Cargo search bar with optional filter icon callback.
class CargoSearchBar extends StatelessWidget {
  const CargoSearchBar({
    super.key,
    this.hint = 'Search stores, food, products…',
    this.controller,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.onFilterTap,
    this.autofocus = false,
    this.readOnly = false,
    this.focusNode,
  });

  final String hint;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onTap;
  final VoidCallback? onFilterTap;
  final bool autofocus;
  final bool readOnly;
  final FocusNode? focusNode;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(CargoSpacing.radiusMd),
        border: Border.all(color: CargoColors.border),
        boxShadow: [
          BoxShadow(
            color: CargoColors.primary.withOpacity(0.06),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 12),
            child: Icon(Icons.search_rounded, color: CargoColors.textMuted, size: 20),
          ),
          Expanded(
            child: TextField(
              controller: controller,
              onChanged: onChanged,
              onSubmitted: onSubmitted,
              onTap: onTap,
              autofocus: autofocus,
              readOnly: readOnly,
              focusNode: focusNode,
              textInputAction: TextInputAction.search,
              style: GoogleFonts.poppins(fontSize: 13, color: CargoColors.textPrimary),
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: GoogleFonts.poppins(fontSize: 13, color: CargoColors.textHint),
                border: InputBorder.none,
                contentPadding: EdgeInsets.zero,
                isDense: true,
              ),
            ),
          ),
          if (onFilterTap != null)
            GestureDetector(
              onTap: onFilterTap,
              child: Container(
                width: 40,
                height: 40,
                margin: const EdgeInsets.only(right: 4),
                decoration: BoxDecoration(
                  color: CargoColors.primaryLight,
                  borderRadius: BorderRadius.circular(CargoSpacing.radiusSm),
                ),
                child: const Icon(Icons.tune_rounded,
                    color: CargoColors.primary, size: 18),
              ),
            ),
        ],
      ),
    );
  }
}
