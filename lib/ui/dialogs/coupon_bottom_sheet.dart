import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/cargo_colors.dart';
import '../../theme/cargo_spacing.dart';
import '../../theme/cargo_typography.dart';
import '../buttons/cargo_button.dart';
import '../inputs/cargo_text_field.dart';
import '../layouts/cargo_bottom_sheet.dart';

/// Bottom sheet for entering a coupon / promo code.
Future<String?> showCouponSheet(BuildContext context) {
  return showCargoBottomSheet<String>(
    context: context,
    title: 'Apply Coupon',
    initialChildSize: 0.45,
    child: const _CouponSheetContent(),
  );
}

class _CouponSheetContent extends StatefulWidget {
  const _CouponSheetContent();

  @override
  State<_CouponSheetContent> createState() => _CouponSheetContentState();
}

class _CouponSheetContentState extends State<_CouponSheetContent> {
  final _ctrl = TextEditingController();
  final List<_Coupon> _suggestions = const [
    _Coupon(code: 'CARGO10', description: '10% off on orders above AED 50'),
    _Coupon(code: 'WELCOME20', description: '20% off your first order'),
    _Coupon(code: 'FREESHIP', description: 'Free delivery on any order'),
  ];

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Input + Apply ─────────────────────────────────────────────────
        Row(
          children: [
            Expanded(
              child: CargoTextField(
                controller: _ctrl,
                hint: 'Enter coupon code',
                prefixIcon: Icons.confirmation_number_outlined,
              ),
            ),
            const SizedBox(width: 12),
            CargoButton(
              label: 'Apply',
              onPressed: () {
                if (_ctrl.text.trim().isNotEmpty) {
                  Navigator.pop(context, _ctrl.text.trim().toUpperCase());
                }
              },
              width: 90,
              height: 52,
            ),
          ],
        ),

        const SizedBox(height: 24),
        Text('Available Coupons', style: CargoTypography.labelLarge),
        const SizedBox(height: 12),

        // ── Suggestion chips ──────────────────────────────────────────────
        ..._suggestions.map(
          (c) => GestureDetector(
            onTap: () => Navigator.pop(context, c.code),
            child: Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.symmetric(
                  horizontal: CargoSpacing.md, vertical: 12),
              decoration: BoxDecoration(
                color: CargoColors.primaryLight,
                borderRadius: BorderRadius.circular(CargoSpacing.radiusMd),
                border: Border.all(color: CargoColors.primary.withOpacity(0.25)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.local_offer_rounded,
                      color: CargoColors.primary, size: 18),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(c.code,
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: CargoColors.primary,
                            )),
                        Text(c.description,
                            style: GoogleFonts.poppins(
                                fontSize: 11,
                                color: CargoColors.textSecondary)),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right_rounded,
                      color: CargoColors.primary, size: 18),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _Coupon {
  const _Coupon({required this.code, required this.description});

  final String code;
  final String description;
}
