import 'package:flutter/material.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../models/notification_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});
  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<AppNotification> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _items = await ApiService.instance.getNotifications();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(title: const Text('Notifications'), backgroundColor: Colors.white, leading: const BackButton()),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _items.isEmpty
              ? Center(
                  child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.notifications_none_rounded, size: 64, color: AppColors.primary.withOpacity(0.2)),
                    const SizedBox(height: 16),
                    const Text('No notifications yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                  ]),
                )
              : RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: _load,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (_, i) => _NotifCard(notif: _items[i]),
                  ),
                ),
    );
  }
}

class _NotifCard extends StatelessWidget {
  final AppNotification notif;
  const _NotifCard({required this.notif});

  @override
  Widget build(BuildContext context) {
    final color = _typeColor(notif.type);
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: notif.isRead ? Colors.white : AppColors.primary.withOpacity(0.04),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: notif.isRead ? AppColors.border : AppColors.primary.withOpacity(0.2)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 42, height: 42,
            decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
            child: Icon(_typeIcon(notif.type), color: color, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(child: Text(notif.title, style: TextStyle(fontSize: 14, fontWeight: notif.isRead ? FontWeight.w500 : FontWeight.w700))),
              if (!notif.isRead)
                Container(width: 8, height: 8, decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle)),
            ]),
            const SizedBox(height: 4),
            Text(notif.body, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4)),
            const SizedBox(height: 6),
            Text(timeago.format(notif.createdAt), style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
          ])),
        ],
      ),
    );
  }

  Color _typeColor(String t) {
    switch (t) {
      case 'order': return AppColors.primary;
      case 'promo': return AppColors.secondary;
      case 'driver': return AppColors.teal;
      case 'chat': return AppColors.info;
      default: return AppColors.textSecondary;
    }
  }

  IconData _typeIcon(String t) {
    switch (t) {
      case 'order': return Icons.receipt_long_rounded;
      case 'promo': return Icons.local_offer_rounded;
      case 'driver': return Icons.delivery_dining_rounded;
      case 'chat': return Icons.chat_bubble_outline_rounded;
      default: return Icons.notifications_rounded;
    }
  }
}
