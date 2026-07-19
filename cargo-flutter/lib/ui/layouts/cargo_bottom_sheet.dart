import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/cargo_colors.dart';
import '../../theme/cargo_spacing.dart';

/// Shows a modal bottom sheet with Cargo handle + optional title.
Future<T?> showCargoBottomSheet<T>({
  required BuildContext context,
  required Widget child,
  String? title,
  bool isDismissible = true,
  bool isScrollControlled = true,
  double initialChildSize = 0.55,
  double maxChildSize = 0.92,
}) {
  return showModalBottomSheet<T>(
    context: context,
    isDismissible: isDismissible,
    isScrollControlled: isScrollControlled,
    backgroundColor: Colors.transparent,
    builder: (_) => DraggableScrollableSheet(
      initialChildSize: initialChildSize,
      minChildSize: 0.3,
      maxChildSize: maxChildSize,
      builder: (ctx, scrollCtrl) => _CargoSheet(
        title: title,
        scrollController: scrollCtrl,
        child: child,
      ),
    ),
  );
}

class _CargoSheet extends StatelessWidget {
  const _CargoSheet({
    required this.child,
    this.title,
    this.scrollController,
  });

  final Widget child;
  final String? title;
  final ScrollController? scrollController;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── Handle ──────────────────────────────────────────────────────
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: CargoColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          if (title != null) ...[
            Padding(
              padding: const EdgeInsets.fromLTRB(
                  CargoSpacing.screenH, 4, CargoSpacing.screenH, 12),
              child: Text(
                title!,
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: CargoColors.textPrimary,
                ),
              ),
            ),
            const Divider(height: 1, color: CargoColors.divider),
          ],
          Expanded(
            child: SingleChildScrollView(
              controller: scrollController,
              padding: const EdgeInsets.fromLTRB(
                  CargoSpacing.screenH,
                  CargoSpacing.md,
                  CargoSpacing.screenH,
                  CargoSpacing.xl),
              child: child,
            ),
          ),
        ],
      ),
    );
  }
}
