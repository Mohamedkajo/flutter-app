import 'package:flutter/material.dart';
import '../../theme/cargo_colors.dart';
import '../../theme/cargo_typography.dart';
import '../buttons/cargo_button.dart';

/// Success confirmation dialog or bottom-sheet panel.
Future<void> showSuccessDialog(
  BuildContext context, {
  required String title,
  required String message,
  String buttonLabel = 'OK',
  VoidCallback? onDismiss,
}) {
  return showDialog(
    context: context,
    barrierDismissible: false,
    builder: (_) => SuccessDialog(
      title: title,
      message: message,
      buttonLabel: buttonLabel,
      onDismiss: onDismiss,
    ),
  );
}

class SuccessDialog extends StatelessWidget {
  const SuccessDialog({
    super.key,
    required this.title,
    required this.message,
    this.buttonLabel = 'OK',
    this.onDismiss,
  });

  final String title;
  final String message;
  final String buttonLabel;
  final VoidCallback? onDismiss;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: CargoColors.success.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_rounded,
                  size: 44, color: CargoColors.success),
            ),
            const SizedBox(height: 20),
            Text(title,
                style: CargoTypography.h2, textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(message,
                style: CargoTypography.bodySmall,
                textAlign: TextAlign.center),
            const SizedBox(height: 24),
            CargoButton(
              label: buttonLabel,
              onPressed: () {
                Navigator.pop(context);
                onDismiss?.call();
              },
            ),
          ],
        ),
      ),
    );
  }
}
