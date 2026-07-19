import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/cargo_colors.dart';
import '../../theme/cargo_spacing.dart';
import '../../theme/cargo_typography.dart';
import '../buttons/cargo_button.dart';
import '../layouts/cargo_bottom_sheet.dart';

/// Bottom sheet for wallet top-up flow.
Future<double?> showTopUpSheet(BuildContext context) {
  return showCargoBottomSheet<double>(
    context: context,
    title: 'Top Up Wallet',
    initialChildSize: 0.65,
    child: const _TopUpContent(),
  );
}

class _TopUpContent extends StatefulWidget {
  const _TopUpContent();

  @override
  State<_TopUpContent> createState() => _TopUpContentState();
}

class _TopUpContentState extends State<_TopUpContent> {
  final _ctrl = TextEditingController();
  double? _selected;
  String _method = 'card';

  static const _presets = [50.0, 100.0, 200.0, 500.0];
  static const _methods = [
    ('card', Icons.credit_card_rounded, 'Credit / Debit Card'),
    ('cash', Icons.payments_rounded, 'Cash'),
  ];

  double get _amount => _selected ?? (double.tryParse(_ctrl.text) ?? 0);

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
        // ── Quick presets ─────────────────────────────────────────────────
        Text('Quick Select', style: CargoTypography.labelLarge),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          children: _presets
              .map((v) => ChoiceChip(
                    label: Text('AED ${v.toInt()}',
                        style: GoogleFonts.poppins(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: _selected == v
                                ? Colors.white
                                : CargoColors.primary)),
                    selected: _selected == v,
                    selectedColor: CargoColors.primary,
                    backgroundColor: CargoColors.primaryLight,
                    side: BorderSide.none,
                    onSelected: (_) => setState(() {
                      _selected = v;
                      _ctrl.clear();
                    }),
                  ))
              .toList(),
        ),

        const SizedBox(height: 16),
        Text('Custom Amount', style: CargoTypography.labelLarge),
        const SizedBox(height: 8),
        TextField(
          controller: _ctrl,
          keyboardType:
              const TextInputType.numberWithOptions(decimal: true),
          inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[\d.]'))],
          onChanged: (_) => setState(() => _selected = null),
          style: GoogleFonts.poppins(
              fontSize: 14, color: CargoColors.textPrimary),
          decoration: InputDecoration(
            hintText: '0.00',
            prefixText: 'AED  ',
            prefixStyle: GoogleFonts.poppins(
                fontSize: 14, color: CargoColors.textMuted),
            filled: true,
            fillColor: CargoColors.surface,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(CargoSpacing.radiusMd),
              borderSide: const BorderSide(color: CargoColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(CargoSpacing.radiusMd),
              borderSide: const BorderSide(color: CargoColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(CargoSpacing.radiusMd),
              borderSide:
                  const BorderSide(color: CargoColors.primary, width: 1.5),
            ),
          ),
        ),

        const SizedBox(height: 20),
        Text('Payment Method', style: CargoTypography.labelLarge),
        const SizedBox(height: 10),
        ..._methods.map(
          (m) => GestureDetector(
            onTap: () => setState(() => _method = m.$1),
            child: Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: _method == m.$1
                    ? CargoColors.primaryLight
                    : Colors.white,
                borderRadius: BorderRadius.circular(CargoSpacing.radiusMd),
                border: Border.all(
                  color: _method == m.$1
                      ? CargoColors.primary
                      : CargoColors.border,
                ),
              ),
              child: Row(
                children: [
                  Icon(m.$2,
                      size: 20,
                      color: _method == m.$1
                          ? CargoColors.primary
                          : CargoColors.textMuted),
                  const SizedBox(width: 12),
                  Text(m.$3,
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: _method == m.$1
                            ? CargoColors.primary
                            : CargoColors.textPrimary,
                      )),
                  const Spacer(),
                  if (_method == m.$1)
                    const Icon(Icons.check_circle_rounded,
                        color: CargoColors.primary, size: 18),
                ],
              ),
            ),
          ),
        ),

        const SizedBox(height: 24),
        CargoButton(
          label: _amount > 0
              ? 'Top Up AED ${_amount.toStringAsFixed(2)}'
              : 'Enter Amount',
          onPressed: _amount > 0
              ? () => Navigator.pop(context, _amount)
              : null,
          enabled: _amount > 0,
        ),
      ],
    );
  }
}
