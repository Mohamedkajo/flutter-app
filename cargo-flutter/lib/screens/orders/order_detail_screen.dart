import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/order.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class OrderDetailScreen extends StatefulWidget {
  final int orderId;
  const OrderDetailScreen({super.key, required this.orderId});
  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  Order? _order;
  bool _loading = true;

  final _steps = ['Placed', 'Confirmed', 'Preparing', 'Ready', 'On the Way', 'Delivered'];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final o = await ApiService.instance.getOrder(widget.orderId);
      if (mounted) setState(() { _order = o; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: Text('Order #${widget.orderId}'),
        backgroundColor: Colors.white,
        leading: const BackButton(),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _order == null
              ? const Center(child: Text('Order not found'))
              : RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: _load,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _buildStatus(),
                        const SizedBox(height: 16),
                        _buildTracker(),
                        const SizedBox(height: 16),
                        _buildItems(),
                        const SizedBox(height: 16),
                        _buildSummary(),
                        const SizedBox(height: 16),
                        if (_order!.deliveryAddress != null) _buildAddress(),
                        const SizedBox(height: 80),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildStatus() {
    final o = _order!;
    final color = o.isCancelled ? AppColors.error : o.isDelivered ? AppColors.success : AppColors.primary;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [color, color.withOpacity(0.7)], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(AppRadius.xl),
      ),
      child: Row(
        children: [
          Container(
            width: 52, height: 52,
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), shape: BoxShape.circle),
            child: Icon(_statusIcon(o.status), color: Colors.white, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(o.statusLabel, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
                Text(DateFormat('MMM d, y · h:mm a').format(o.createdAt),
                    style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
                if (o.estimatedDelivery != null) ...[
                  const SizedBox(height: 4),
                  Text('Est. delivery: ${o.estimatedDelivery}',
                      style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 12, fontWeight: FontWeight.w600)),
                ],
              ],
            ),
          ),
          Text('\$${o.total.toStringAsFixed(2)}',
              style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }

  Widget _buildTracker() {
    final step = _order!.statusStep;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.lg), border: Border.all(color: AppColors.border)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Order Progress', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          const SizedBox(height: 20),
          ...List.generate(_steps.length, (i) {
            final done = i < step;
            final active = i == step - 1;
            return Row(
              children: [
                Column(
                  children: [
                    Container(
                      width: 28, height: 28,
                      decoration: BoxDecoration(
                        color: done || active ? AppColors.primary : AppColors.border,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(done ? Icons.check_rounded : Icons.circle, color: Colors.white, size: done ? 16 : 8),
                    ),
                    if (i < _steps.length - 1)
                      Container(width: 2, height: 28, color: done ? AppColors.primary : AppColors.border),
                  ],
                ),
                const SizedBox(width: 14),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Text(_steps[i],
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: active ? FontWeight.w700 : FontWeight.w400,
                        color: done || active ? AppColors.textPrimary : AppColors.textMuted,
                      )),
                ),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _buildItems() {
    final items = _order!.items;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.lg), border: Border.all(color: AppColors.border)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Items', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          ...items.map((item) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Row(
              children: [
                Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(color: AppColors.shimmerBase, borderRadius: BorderRadius.circular(8)),
                  child: item.image != null
                      ? ClipRRect(borderRadius: BorderRadius.circular(8), child: Image.network(item.image!, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.fastfood_rounded, color: AppColors.primary, size: 22)))
                      : const Icon(Icons.fastfood_rounded, color: AppColors.primary, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(item.productName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                  Text('x${item.quantity}', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                ])),
                Text('\$${item.subtotal.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary)),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildSummary() {
    final o = _order!;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.lg), border: Border.all(color: AppColors.border)),
      child: Column(children: [
        _row('Subtotal', '\$${(o.total - o.deliveryFee).toStringAsFixed(2)}'),
        const SizedBox(height: 8),
        _row('Delivery fee', '\$${o.deliveryFee.toStringAsFixed(2)}'),
        const Divider(height: 20),
        _row('Total', '\$${o.total.toStringAsFixed(2)}', bold: true),
      ]),
    );
  }

  Widget _buildAddress() => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.lg), border: Border.all(color: AppColors.border)),
        child: Row(
          children: [
            const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 22),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Delivery Address', style: TextStyle(fontSize: 13, color: AppColors.textMuted, fontWeight: FontWeight.w500)),
              Text(_order!.deliveryAddress!, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
            ])),
          ],
        ),
      );

  Widget _row(String label, String value, {bool bold = false}) => Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: bold ? AppColors.textPrimary : AppColors.textSecondary, fontWeight: bold ? FontWeight.w700 : FontWeight.w400, fontSize: bold ? 15 : 14)),
          Text(value, style: TextStyle(color: bold ? AppColors.primary : AppColors.textPrimary, fontWeight: bold ? FontWeight.w800 : FontWeight.w500, fontSize: bold ? 17 : 14)),
        ],
      );

  IconData _statusIcon(String s) {
    switch (s) {
      case 'delivered': return Icons.check_circle_rounded;
      case 'cancelled': return Icons.cancel_rounded;
      case 'picked_up': return Icons.delivery_dining_rounded;
      case 'preparing': return Icons.restaurant_rounded;
      default: return Icons.access_time_rounded;
    }
  }
}
