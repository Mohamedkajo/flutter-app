import 'package:flutter/material.dart';
import '../../theme/cargo_colors.dart';
import '../../theme/cargo_typography.dart';
import '../buttons/cargo_button.dart';

/// Centered empty-state widget with icon, title, subtitle, and optional CTA.
class CargoEmptyState extends StatelessWidget {
  const CargoEmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.actionLabel,
    this.onAction,
    this.iconColor,
    this.iconSize = 72,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;
  final Color? iconColor;
  final double iconSize;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: iconSize + 32,
              height: iconSize + 32,
              decoration: BoxDecoration(
                color: (iconColor ?? CargoColors.primary).withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: iconSize * 0.75,
                color: (iconColor ?? CargoColors.primary).withOpacity(0.6),
              ),
            ),
            const SizedBox(height: 20),
            Text(title,
                style: CargoTypography.h3,
                textAlign: TextAlign.center),
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(subtitle!,
                  style: CargoTypography.bodySmall,
                  textAlign: TextAlign.center),
            ],
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 24),
              CargoButton(
                label: actionLabel!,
                onPressed: onAction,
                width: 180,
                height: 48,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
