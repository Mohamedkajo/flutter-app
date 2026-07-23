import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../models/cart.dart';
import '../../providers/cart_provider.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});
  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  bool _placing = false;
  final _addressCtrl = TextEditingController(text: '123 Main St, Dubai');

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => context.read<CartProvider>().load());
  }

  @override
  void dispose() {
    _addressCtrl.dispose();
    super.dispose();
  }

  Future<void> _placeOrder(CartProvider cart) async {
    if (cart.isEmpty) return;
    setState(() => _placing = true);
    try {
      final order = await ApiService.instance.placeOrder({'deliveryAddress': _addressCtrl.text, 'paymentMethod': 'wallet'});
      await cart.clear();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Order placed! 🎉'), backgroundColor: AppColors.success));
      context.push('/orders/${order.id}');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: AppColors.error));
    } finally {
      if (mounted) setState(() => _placing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('My Cart'),
        actions: [
          if (!cart.isEmpty)
            TextButton(
              onPressed: () async { await cart.clear(); },
              child: const Text('Clear', style: TextStyle(color: AppColors.secondary)),
            ),
        ],
      ),
      body: cart.loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : cart.isEmpty
              ? _buildEmpty(context)
              : Column(
                  children: [
                    Expanded(
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: cart.cart.items.length + 1,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (_, i) {
                          if (i == cart.cart.items.length) return _buildSummary(cart.cart);
                          return _CartItemCard(item: cart.cart.items[i], cart: cart);
                        },
                      ),
                    ),
                    // Place order button
                    Container(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 20, offset: const Offset(0, -4))],
                      ),
                      child: Column(
                        children: [
                          // Address input
                          TextField(
                            controller: _addressCtrl,
                            decoration: const InputDecoration(
                              hintText: 'Delivery address',
                              prefixIcon: Icon(Icons.location_on_outlined, color: AppColors.primary),
                            ),
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            height: 52,
                            child: ElevatedButton(
                              onPressed: _placing ? null : () => _placeOrder(cart),
                              child: _placing
                                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                                  : Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        const Icon(Icons.shopping_bag_outlined, size: 20),
                                        const SizedBox(width: 8),
                                        Text('Place Order · \$${cart.cart.total.toStringAsFixed(2)}'),
                                      ],
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildEmpty(BuildContext context) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100, height: 100,
              decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.08), shape: BoxShape.circle),
              child: const Icon(Icons.shopping_bag_outlined, size: 48, color: AppColors.primary),
            ),
            const SizedBox(height: 20),
            const Text('Your cart is empty', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            const Text('Add items from any store to get started', style: TextStyle(color: AppColors.textSecondary)),
            const SizedBox(height: 24),
            ElevatedButton(onPressed: () => context.go('/'), child: const Text('Browse Stores')),
          ],
        ),
      );

  Widget _buildSummary(Cart cart) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            _row('Subtotal', '\$${cart.subtotal.toStringAsFixed(2)}'),
            const SizedBox(height: 8),
            _row('Delivery', '\$${cart.deliveryFee.toStringAsFixed(2)}'),
            const SizedBox(height: 8),
            _row('Service fee', '\$${cart.serviceFee.toStringAsFixed(2)}'),
            const Divider(height: 20),
            _row('Total', '\$${cart.total.toStringAsFixed(2)}', bold: true),
          ],
        ),
      );

  Widget _row(String label, String value, {bool bold = false}) => Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: bold ? AppColors.textPrimary : AppColors.textSecondary, fontWeight: bold ? FontWeight.w700 : FontWeight.w400, fontSize: bold ? 16 : 14)),
          Text(value, style: TextStyle(color: bold ? AppColors.primary : AppColors.textPrimary, fontWeight: bold ? FontWeight.w800 : FontWeight.w500, fontSize: bold ? 18 : 14)),
        ],
      );
}

class _CartItemCard extends StatelessWidget {
  final CartItem item;
  final CartProvider cart;
  const _CartItemCard({required this.item, required this.cart});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          // Image
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.md),
            child: Container(
              width: 72, height: 72, color: AppColors.shimmerBase,
              child: item.image != null
                  ? Image.network(item.image!, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.fastfood_rounded, color: AppColors.primary, size: 28))
                  : const Icon(Icons.fastfood_rounded, color: AppColors.primary, size: 28),
            ),
          ),
          const SizedBox(width: 12),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.productName, maxLines: 2, overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                if (item.storeName != null)
                  Text(item.storeName!, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                const SizedBox(height: 8),
                Text('\$${item.price.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primary)),
              ],
            ),
          ),
          // Qty controls
          Column(
            children: [
              IconButton(
                onPressed: () => cart.removeItem(item.id),
                icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error, size: 20),
                padding: EdgeInsets.zero, constraints: const BoxConstraints(),
              ),
              const SizedBox(height: 4),
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: Row(
                  children: [
                    _QtyBtn(icon: Icons.remove, onTap: () => cart.updateItem(item.id, item.quantity - 1)),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text('${item.quantity}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                    ),
                    _QtyBtn(icon: Icons.add, onTap: () => cart.updateItem(item.id, item.quantity + 1)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _QtyBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _QtyBtn({required this.icon, required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          width: 32, height: 32,
          alignment: Alignment.center,
          child: Icon(icon, size: 18, color: AppColors.primary),
        ),
      );
}
