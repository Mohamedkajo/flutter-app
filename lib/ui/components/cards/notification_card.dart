import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../theme/cargo_colors.dart';
import '../../theme/cargo_spacing.dart';

/// Notification list tile with type icon, read/unread indicator, and timeago.
class NotificationCard extends StatelessWidget {
  const NotificationCard({
    super.key,
    required this.type,
    required this.title,
    required this.message,
    required this.createdAt,
    this.isRead = false,
    this.onTap,
  });

  final String type;
  final String title;
  final String message;
  final DateTime createdAt;
  final bool isRead;
  final VoidCallback? onTap;

  IconData get _icon => switch (type) {
        'order'  => Icons.receipt_long_rounded,
        'promo'  => Icons.local_offer_rounded,
        'driver' => Icons.delivery_dining_rounded,
        'chat'   => Icons.chat_bubble_outline_rounded,
        _        => Icons.notifications_rounded,
      };

  Color get _color => switch (type) {
        'order'  => CargoColors.primary,
        'promo'  => CargoColors.coral,
        'driver' => CargoColors.teal,
        'chat'   => CargoColors.amber,
        _        => CargoColors.primary,
      };

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isRead ? Colors.white : CargoColors.primaryLight.withOpacity(0.4),
          borderRadius: BorderRadius.circular(CargoSpacing.radiusLg),
          border: isRead
              ? null
              : Border.all(
                  color: CargoColors.primary.withOpacity(0.15), width: 1),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Icon ──────────────────────────────────────────────────────
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: _color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(_icon, color: _color, size: 20),
            ),
            const SizedBox(width: 12),

            // ── Content ───────────────────────────────────────────────────
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          title,
                          style: GoogleFonts.poppins(
                            fontSize: 13,
                            fontWeight:
                                isRead ? FontWeight.w500 : FontWeight.w700,
                            color: CargoColors.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        timeago.format(createdAt, allowFromNow: true),
                        style: GoogleFonts.poppins(
                            fontSize: 10, color: CargoColors.textMuted),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    message,
                    style: GoogleFonts.poppins(
                        fontSize: 12, color: CargoColors.textSecondary),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),

            // ── Unread dot ────────────────────────────────────────────────
            if (!isRead)
              Container(
                margin: const EdgeInsets.only(left: 8, top: 4),
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: CargoColors.primary,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
