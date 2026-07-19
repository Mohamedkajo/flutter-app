import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../providers/app_provider.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final _api = ApiService();
  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = true;

  // Fallback demo notifications when API is unavailable
  static final _demo = [
    {
      'id': 1,
      'type': 'order',
      'title': 'Order Confirmed! 🎉',
      'message': 'Your order from Sara\'s Kitchen has been confirmed.',
      'createdAt': DateTime.now().subtract(const Duration(minutes: 5)).toIso8601String(),
      'isRead': false,
    },
    {
      'id': 2,
      'type': 'promo',
      'title': 'Flash Sale — 30% OFF',
      'message': 'Limited time offer on all food orders. Use code CARGO30.',
      'createdAt': DateTime.now().subtract(const Duration(hours: 2)).toIso8601String(),
      'isRead': false,
    },
    {
      'id': 3,
      'type': 'order',
      'title': 'Your driver is 5 min away 🛵',
      'message': 'Ahmed is almost at your location.',
      'createdAt': DateTime.now().subtract(const Duration(hours: 6)).toIso8601String(),
      'isRead': true,
    },
    {
      'id': 4,
      'type': 'system',
      'title': 'New stores near you!',
      'message': '3 new restaurants just launched in your area.',
      'createdAt': DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
      'isRead': true,
    },
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    try {
      _notifications = await _api.getNotifications();
      if (_notifications.isEmpty) _notifications = _demo;
    } catch (_) {
      _notifications = _demo;
    }
    setState(() => _isLoading = false);
  }

  Future<void> _markAllRead() async {
    try {
      await _api.markNotificationsRead();
    } catch (_) {}
    setState(() {
      _notifications = _notifications.map((n) => {...n, 'isRead': true}).toList();
    });
    context.read<AppProvider>().decrementUnread();
  }

  static const _typeColors = {
    'order': AppColors.teal,
    'promo': AppColors.coral,
    'system': AppColors.amber,
  };

  static const _typeIcons = {
    'order': Icons.delivery_dining_rounded,
    'promo': Icons.local_offer_rounded,
    'system': Icons.notifications_rounded,
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Colors.white, size: 20),
          onPressed: () => context.pop(),
        ),
        title: const Text('Notifications',
            style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w700)),
        actions: [
          TextButton(
            onPressed: _markAllRead,
            child: const Text('Mark all read',
                style: TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                    fontWeight: FontWeight.w500)),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary))
          : _notifications.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('🔔', style: TextStyle(fontSize: 56)),
                      SizedBox(height: 14),
                      Text('No notifications',
                          style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary)),
                    ],
                  ),
                )
              : RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: _load,
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
                    itemCount: _notifications.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, i) {
                      final n = _notifications[i];
                      final type = n['type'] as String? ?? 'system';
                      final isRead = n['isRead'] as bool? ?? true;
                      final color = _typeColors[type] ?? AppColors.textMuted;
                      final icon = _typeIcons[type] ?? Icons.notifications;
                      final createdAt =
                          DateTime.tryParse(n['createdAt'] as String? ?? '');
                      final ago = createdAt != null
                          ? timeago.format(createdAt)
                          : '';

                      return Dismissible(
                        key: ValueKey(n['id']),
                        direction: DismissDirection.endToStart,
                        background: Container(
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 20),
                          decoration: BoxDecoration(
                            color: AppColors.coral.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Icon(Icons.delete_rounded,
                              color: AppColors.coral),
                        ),
                        onDismissed: (_) {
                          setState(() => _notifications.removeAt(i));
                        },
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: isRead
                                ? Colors.white
                                : AppColors.primaryLight.withOpacity(0.5),
                            borderRadius: BorderRadius.circular(16),
                            border: isRead
                                ? Border.all(color: AppColors.border)
                                : Border.all(
                                    color: AppColors.primary.withOpacity(0.2)),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withOpacity(0.04),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 42,
                                height: 42,
                                decoration: BoxDecoration(
                                  color: color.withOpacity(0.12),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(icon, color: color, size: 20),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            n['title'] as String? ?? '',
                                            style: TextStyle(
                                              fontSize: 14,
                                              fontWeight: isRead
                                                  ? FontWeight.w500
                                                  : FontWeight.w700,
                                              color: AppColors.textPrimary,
                                            ),
                                          ),
                                        ),
                                        if (!isRead)
                                          Container(
                                            width: 8,
                                            height: 8,
                                            decoration: const BoxDecoration(
                                              color: AppColors.primary,
                                              shape: BoxShape.circle,
                                            ),
                                          ),
                                      ],
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      n['message'] as String? ?? '',
                                      style: const TextStyle(
                                          fontSize: 12,
                                          color: AppColors.textSecondary,
                                          height: 1.4),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 6),
                                    Text(ago,
                                        style: const TextStyle(
                                            fontSize: 11,
                                            color: AppColors.textMuted)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
