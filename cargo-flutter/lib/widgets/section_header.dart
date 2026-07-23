import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class SectionHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  const SectionHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.titleLarge),
                if (subtitle != null)
                  Text(subtitle!, style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
          if (actionLabel != null && onAction != null)
            TextButton(
              onPressed: onAction,
              style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4)),
              child: Row(
                children: [
                  Text(actionLabel!, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary)),
                  const Icon(Icons.chevron_right_rounded, size: 18, color: AppColors.primary),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
