import 'package:flutter/material.dart';
import '../../theme/cargo_colors.dart';
import '../../theme/cargo_typography.dart';
import '../buttons/cargo_button.dart';

/// Full-screen or inline error state with retry action.
class CargoErrorState extends StatelessWidget {
  const CargoErrorState({
    super.key,
    this.message = 'Something went wrong. Please try again.',
    this.onRetry,
  });

  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 88,
              height: 88,
              decoration: BoxDecoration(
                color: CargoColors.error.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.wifi_off_rounded,
                  size: 44, color: CargoColors.error),
            ),
            const SizedBox(height: 20),
            Text('Oops!', style: CargoTypography.h2),
            const SizedBox(height: 8),
            Text(message,
                style: CargoTypography.bodySmall,
                textAlign: TextAlign.center),
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              CargoButton(
                label: 'Try Again',
                onPressed: onRetry,
                icon: Icons.refresh_rounded,
                width: 160,
                height: 48,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
