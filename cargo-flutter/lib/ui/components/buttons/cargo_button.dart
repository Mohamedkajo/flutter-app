import 'package:flutter/material.dart';
import '../../theme/cargo_colors.dart';
import '../../theme/cargo_spacing.dart';
import '../../theme/cargo_typography.dart';

/// Primary filled button with Cargo brand styling.
///
/// ```dart
/// CargoButton(label: 'Log In', onPressed: () {})
/// CargoButton.secondary(label: 'Cancel', onPressed: () {})
/// CargoButton.loading()
/// ```
class CargoButton extends StatelessWidget {
  const CargoButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.isLoading = false,
    this.enabled = true,
    this.height = CargoSpacing.buttonHeightLg,
    this.backgroundColor,
    this.foregroundColor,
    this.borderRadius = CargoSpacing.radiusXl,
    this.width,
  }) : _variant = _Variant.primary;

  const CargoButton.secondary({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.isLoading = false,
    this.enabled = true,
    this.height = CargoSpacing.buttonHeightLg,
    this.backgroundColor,
    this.foregroundColor,
    this.borderRadius = CargoSpacing.radiusXl,
    this.width,
  }) : _variant = _Variant.secondary;

  const CargoButton.text({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.isLoading = false,
    this.enabled = true,
    this.height = CargoSpacing.buttonHeightMd,
    this.backgroundColor,
    this.foregroundColor,
    this.borderRadius = CargoSpacing.radiusXl,
    this.width,
  }) : _variant = _Variant.text;

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool isLoading;
  final bool enabled;
  final double height;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final double borderRadius;
  final double? width;
  final _Variant _variant;

  @override
  Widget build(BuildContext context) {
    final isDisabled = !enabled || isLoading || onPressed == null;

    final bg = backgroundColor ??
        (_variant == _Variant.primary
            ? CargoColors.primary
            : _variant == _Variant.secondary
                ? CargoColors.primaryLight
                : Colors.transparent);

    final fg = foregroundColor ??
        (_variant == _Variant.primary
            ? Colors.white
            : _variant == _Variant.secondary
                ? CargoColors.primary
                : CargoColors.primary);

    final style = switch (_variant) {
      _Variant.primary || _Variant.secondary => ElevatedButton.styleFrom(
          backgroundColor: bg,
          foregroundColor: fg,
          disabledBackgroundColor: bg.withOpacity(0.5),
          disabledForegroundColor: fg.withOpacity(0.5),
          elevation: 0,
          shadowColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(horizontal: 24),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(borderRadius)),
          minimumSize: Size(width ?? double.infinity, height),
        ),
      _Variant.text => TextButton.styleFrom(
          foregroundColor: fg,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(borderRadius)),
          minimumSize: Size(width ?? 0, height),
        ),
    };

    Widget child = isLoading
        ? SizedBox(
            width: 22,
            height: 22,
            child: CircularProgressIndicator(
                strokeWidth: 2.5, color: fg))
        : Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 18),
                const SizedBox(width: 8),
              ],
              Text(label, style: CargoTypography.buttonMedium.copyWith(color: fg)),
            ],
          );

    return switch (_variant) {
      _Variant.primary || _Variant.secondary => ElevatedButton(
          onPressed: isDisabled ? null : onPressed,
          style: style as ButtonStyle,
          child: child,
        ),
      _Variant.text => TextButton(
          onPressed: isDisabled ? null : onPressed,
          style: style as ButtonStyle,
          child: child,
        ),
    };
  }
}

enum _Variant { primary, secondary, text }
