import 'package:flutter/material.dart';
import '../../theme/cargo_colors.dart';
import '../../theme/cargo_typography.dart';

/// Section header row with optional "See All" action.
class SectionHeader extends StatelessWidget {
  const SectionHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.actionLabel = 'See All',
    this.onAction,
    this.padding = const EdgeInsets.symmetric(horizontal: 20),
  });

  final String title;
  final String? subtitle;
  final String actionLabel;
  final VoidCallback? onAction;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: CargoTypography.h4),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(subtitle!, style: CargoTypography.caption),
                ],
              ],
            ),
          ),
          if (onAction != null)
            TextButton(
              onPressed: onAction,
              style: TextButton.styleFrom(
                foregroundColor: CargoColors.primary,
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Row(
                children: [
                  Text(actionLabel,
                      style: CargoTypography.labelMedium
                          .copyWith(color: CargoColors.primary)),
                  const Icon(Icons.chevron_right_rounded,
                      size: 16, color: CargoColors.primary),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
