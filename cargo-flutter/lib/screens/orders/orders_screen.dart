import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../models/order.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});
  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabs = TabController(length: 2, vsync: this);
  List<Order> _orders = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _orders = await ApiService.instance.getOrders();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final active = _orders.where((o) => o.isActive).toList();
    final past = _orders.where((o) => !o.isActive).toList();

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(title: const Text('My Orders'), bottom: TabBar(
        controller: _tabs,
        labelColor: AppColors.primary,
        unselectedLabelColor: AppColors.textMuted,
        indicatorColor: AppColors.primary,
        tabs: [Tab(text: 'Active${active.isNotEmpty ? " (${active.length})" : ""}'), const Tab(text: 'Past')],
      )),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              color: AppColors.primary,
              onRefresh: _load,
              child: TabBarView(
                controller: _tabs,
                children: [
                  _buildList(active, emptyMsg: 'No active orders'),
                  _buildList(past, emptyMsg: 'No past orders'),
                ],
              ),
            ),
    );
  }

  Widget _buildList(List<Order> orders, {required String emptyMsg}) {
    if (orders.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.receipt_long_outlined, size: 64, color: AppColors.primary.withOpacity(0.2)),
            const SizedBox(height: 16),
            Text(emptyMsg, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
          ],
        ),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: orders.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (_, i) => _OrderCard(order: orders[i]),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Order order;
  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    final color = _statusColor(order.status);
    return GestureDetector(
      onTap: () => context.push('/orders/${order.id}'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: AppColors.border),
          boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.04), blurRadius: 12, offset: const Offset(0, 2))],
        ),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
                  child: Icon(_statusIcon(order.status), color: color, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(order.storeName ?? 'Order #${order.id}',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                      Text(DateFormat('MMM d, y · h:mm a').format(order.createdAt),
                          style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(AppRadius.full)),
                      child: Text(order.statusLabel, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color)),
                    ),
                    const SizedBox(height: 4),
                    Text('\$${order.total.toStringAsFixed(2)}',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.primary)),
                  ],
                ),
              ],
            ),
            if (order.isActive) ...[
              const SizedBox(height: 14),
              // Progress bar
              Row(
                children: List.generate(5, (i) {
                  final done = i < order.statusStep;
                  final active = i == order.statusStep - 1;
                  return Expanded(
                    child: Container(
                      margin: EdgeInsets.only(right: i < 4 ? 4 : 0),
                      height: 4,
                      decoration: BoxDecoration(
                        color: done || active ? AppColors.primary : AppColors.border,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  Text(order.statusLabel, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary)),
                  const Spacer(),
                  const Icon(Icons.chevron_right_rounded, size: 18, color: AppColors.textMuted),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _statusColor(String s) {
    switch (s) {
      case 'delivered': return AppColors.success;
      case 'cancelled': return AppColors.error;
      case 'pending': return AppColors.warning;
      default: return AppColors.primary;
    }
  }

  IconData _statusIcon(String s) {
    switch (s) {
      case 'delivered': return Icons.check_circle_rounded;
      case 'cancelled': return Icons.cancel_rounded;
      case 'pending': return Icons.access_time_rounded;
      case 'picked_up': return Icons.delivery_dining_rounded;
      default: return Icons.restaurant_rounded;
    }
  }
}
