import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../models/order.dart';
import '../../theme/cargo_colors.dart';
import '../../theme/cargo_spacing.dart';
import '../badges/status_badge.dart';

/// Order summary card — used in Orders list and profile history.
class OrderCard extends StatelessWidget {
  const OrderCard({
    super.key,
    required this.order,
    required this.onTap,
    this.onReorder,
    this.onTrack,
  });

  final Order order;
  final VoidCallback onTap;
  final VoidCallback? onReorder;
  final VoidCallback? onTrack;

  bool get _isActive =>
      !['delivered', 'completed', 'cancelled', 'refunded', 'returned']
          .contains(order.status);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(CargoSpacing.radiusXl),
          boxShadow: [
            BoxShadow(
              color: CargoColors.primary.withOpacity(0.06),
              blurRadius: 12,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header row ────────────────────────────────────────────────
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        order.storeName,
                        style: GoogleFonts.poppins(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: CargoColors.textPrimary),
                      ),
                      Text(
                        'Order #${order.id}  ·  ${order.itemCount} item${order.itemCount > 1 ? 's' : ''}',
                        style: GoogleFonts.poppins(
                            fontSize: 12, color: CargoColors.textMuted),
                      ),
                    ],
                  ),
                ),
                StatusBadge(status: order.status),
              ],
            ),

            const SizedBox(height: 10),
            const Divider(color: CargoColors.divider, height: 1),
            const SizedBox(height: 10),

            // ── Price + delivery time ─────────────────────────────────────
            Row(
              children: [
                const Icon(Icons.receipt_long_rounded,
                    size: 14, color: CargoColors.textMuted),
                const SizedBox(width: 4),
                Text(
                  'AED ${order.total.toStringAsFixed(2)}',
                  style: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: CargoColors.textPrimary),
                ),
                const SizedBox(width: 16),
                const Icon(Icons.access_time_rounded,
                    size: 14, color: CargoColors.textMuted),
                const SizedBox(width: 4),
                Text(
                  order.estimatedDelivery ?? '—',
                  style: GoogleFonts.poppins(
                      fontSize: 13, color: CargoColors.textSecondary),
                ),
              ],
            ),

            // ── Actions ───────────────────────────────────────────────────
            if (_isActive || onReorder != null) ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  if (_isActive && onTrack != null) ...[
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: onTrack,
                        icon: const Icon(Icons.gps_fixed_rounded, size: 14),
                        label: const Text('Track'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: CargoColors.primary,
                          side: const BorderSide(
                              color: CargoColors.primary, width: 1.2),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          textStyle: GoogleFonts.poppins(
                              fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                  ],
                  if (onReorder != null)
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: onReorder,
                        icon: const Icon(Icons.refresh_rounded, size: 14),
                        label: const Text('Reorder'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: CargoColors.primary,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          textStyle: GoogleFonts.poppins(
                              fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
