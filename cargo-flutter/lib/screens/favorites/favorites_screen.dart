import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/product.dart';
import '../../providers/cart_provider.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/product_card.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});
  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  List<Product> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _items = await ApiService.instance.getFavorites();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('My Favorites'),
        backgroundColor: Colors.white,
        leading: const BackButton(),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _items.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.favorite_border_rounded, size: 64, color: AppColors.secondary.withOpacity(0.3)),
                      const SizedBox(height: 16),
                      const Text('No favorites yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      const Text('Tap ♡ on any product to save it here', style: TextStyle(color: AppColors.textSecondary)),
                    ],
                  ),
                )
              : RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: _load,
                  child: GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.72),
                    itemCount: _items.length,
                    itemBuilder: (_, i) => ProductCard(
                      product: _items[i],
                      onAddToCart: () async {
                        final ok = await context.read<CartProvider>().addItem(_items[i].id);
                        if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                          content: Text(ok ? 'Added to cart' : 'Failed'),
                          backgroundColor: ok ? AppColors.success : AppColors.error,
                        ));
                      },
                    ),
                  ),
                ),
    );
  }
}
