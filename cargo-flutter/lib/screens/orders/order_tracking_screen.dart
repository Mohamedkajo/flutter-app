import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../models/order.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class OrderTrackingScreen extends StatefulWidget {
  final int orderId;
  const OrderTrackingScreen({super.key, required this.orderId});

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen> {
  final _api = ApiService.instance;
  Order? _order;
  bool _isLoading = true;

  static const _steps = [
    ('ordered', 'Order Placed', Icons.receipt_long_rounded, 'Your order has been placed'),
    ('confirmed', 'Confirmed', Icons.check_circle_outline_rounded, 'Restaurant confirmed your order'),
    ('preparing', 'Preparing', Icons.soup_kitchen_rounded, 'Your food is being prepared'),
    ('on_the_way', 'On the Way', Icons.delivery_dining_rounded, 'Driver is heading to you'),
    ('delivered', 'Delivered', Icons.home_rounded, 'Enjoy your meal!'),
  ];

  static const _statusOrder = [
    'ordered', 'confirmed', 'preparing', 'on_the_way', 'delivered'
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      _order = await _api.getOrder(widget.orderId);
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  int get _currentStep {
    if (_order == null) return 0;
    // Map 'pending' → 'ordered'
    final status = _order!.status == 'pending' ? 'ordered' : _order!.status;
    final idx = _statusOrder.indexOf(status);
    return idx < 0 ? 0 : idx;
  }

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
        title: Text(
          'Order #${widget.orderId}',
          style: const TextStyle(
              color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700),
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              color: AppColors.primary,
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // ── Map placeholder ──────────────────────────────────
                  Container(
                    height: 180,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8EFF5),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Stack(
                      children: [
                        // Fake map grid
                        for (var row = 0; row < 4; row++)
                          for (var col = 0; col < 6; col++)
                            Positioned(
                              left: col * 65.0,
                              top: row * 48.0,
                              child: Container(
                                width: 64,
                                height: 47,
                                decoration: BoxDecoration(
                                  border: Border.all(
                                      color: Colors.white38, width: 0.5),
                                ),
                              ),
                            ),
                        Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 52,
                                height: 52,
                                decoration: const BoxDecoration(
                                  color: AppColors.primary,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                    Icons.delivery_dining_rounded,
                                    color: Colors.white,
                                    size: 28),
                              ),
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 5),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(20),
                                  boxShadow: [
                                    BoxShadow(
                                        color: Colors.black.withOpacity(0.1),
                                        blurRadius: 6)
                                  ],
                                ),
                                child: const Text(
                                  'Tracking your order…',
                                  style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.textPrimary),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // ── Status stepper ───────────────────────────────────
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.06),
                          blurRadius: 12,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Order Status',
                            style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary)),
                        const SizedBox(height: 16),
                        ...List.generate(_steps.length, (i) {
                          final (_, label, icon, desc) = _steps[i];
                          final isDone = i <= _currentStep;
                          final isCurrent = i == _currentStep;
                          final isLast = i == _steps.length - 1;
                          return Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Dot + line
                              Column(
                                children: [
                                  AnimatedContainer(
                                    duration: const Duration(milliseconds: 300),
                                    width: 32,
                                    height: 32,
                                    decoration: BoxDecoration(
                                      color: isDone
                                          ? (isCurrent
                                              ? AppColors.primary
                                              : AppColors.teal)
                                          : AppColors.surface,
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: isDone
                                            ? Colors.transparent
                                            : AppColors.border,
                                        width: 2,
                                      ),
                                    ),
                                    child: Icon(
                                      icon,
                                      size: 16,
                                      color: isDone
                                          ? Colors.white
                                          : AppColors.textMuted,
                                    ),
                                  ),
                                  if (!isLast)
                                    AnimatedContainer(
                                      duration: const Duration(milliseconds: 300),
                                      width: 2,
                                      height: 36,
                                      color: i < _currentStep
                                          ? AppColors.teal
                                          : AppColors.divider,
                                    ),
                                ],
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Padding(
                                  padding: EdgeInsets.only(
                                      bottom: isLast ? 0 : 20,
                                      top: 4),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        label,
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: isCurrent
                                              ? FontWeight.w700
                                              : FontWeight.w500,
                                          color: isDone
                                              ? AppColors.textPrimary
                                              : AppColors.textMuted,
                                        ),
                                      ),
                                      if (isCurrent) ...[
                                        const SizedBox(height: 2),
                                        Text(desc,
                                            style: const TextStyle(
                                                fontSize: 12,
                                                color: AppColors.textMuted)),
                                      ],
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          );
                        }),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // ── Driver info (if on the way) ──────────────────────
                  if (_order?.status == 'on_the_way' &&
                      _order?.driverName != null)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.05),
                            blurRadius: 10,
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 52,
                            height: 52,
                            decoration: const BoxDecoration(
                              color: AppColors.primaryLight,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.person_rounded,
                                color: AppColors.primary, size: 28),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(_order!.driverName!,
                                    style: const TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textPrimary)),
                                const SizedBox(height: 2),
                                Row(
                                  children: [
                                    const Icon(Icons.star_rounded,
                                        size: 13, color: AppColors.accent),
                                    const SizedBox(width: 3),
                                    const Text(
                                        '4.8',
                                        style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.textPrimary)),
                                    const Text(' · Your Driver',
                                        style: TextStyle(
                                            fontSize: 12,
                                            color: AppColors.textMuted)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          if (_order?.driverPhone != null)
                            GestureDetector(
                              onTap: () => launchUrl(
                                  Uri.parse('tel:${_order!.driverPhone}')),
                              child: Container(
                                width: 42,
                                height: 42,
                                decoration: BoxDecoration(
                                  color: AppColors.teal.withOpacity(0.12),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.phone_rounded,
                                    color: AppColors.teal, size: 20),
                              ),
                            ),
                        ],
                      ),
                    ),

                  const SizedBox(height: 16),

                  // ── Order summary ────────────────────────────────────
                  if (_order != null)
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.05),
                            blurRadius: 10,
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Order Summary',
                              style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary)),
                          const SizedBox(height: 12),
                          ..._order!.items.map((item) => Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('${item.quantity}× ${item.productName}',
                                        style: const TextStyle(
                                            fontSize: 13,
                                            color: AppColors.textSecondary)),
                                    Text(
                                        '\$${(item.price * item.quantity).toStringAsFixed(2)}',
                                        style: const TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.textPrimary)),
                                  ],
                                ),
                              )),
                          const Divider(color: AppColors.divider),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total',
                                  style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.textPrimary)),
                              Text(
                                '\$${_order!.total.toStringAsFixed(2)}',
                                style: const TextStyle(
                                    fontSize: 17,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.primary),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                  const SizedBox(height: 32),
                ],
              ),
            ),
    );
  }
}
