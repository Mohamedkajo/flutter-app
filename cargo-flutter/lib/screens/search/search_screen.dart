import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../models/product.dart';
import '../../models/store.dart';
import '../../providers/cart_provider.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/product_card.dart';
import '../../widgets/store_card.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});
  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabs = TabController(length: 2, vsync: this);
  final _ctrl = TextEditingController();
  List<Product> _products = [];
  List<Store> _stores = [];
  bool _loading = false;
  String _query = '';

  @override
  void dispose() {
    _ctrl.dispose();
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _search(String q) async {
    setState(() { _query = q; _loading = true; });
    if (q.isEmpty) {
      setState(() { _products = []; _stores = []; _loading = false; });
      return;
    }
    try {
      final results = await Future.wait([
        ApiService.instance.searchProducts(q),
        ApiService.instance.getStores(search: q),
      ]);
      if (mounted) {
        setState(() {
          _products = results[0] as List<Product>;
          _stores = results[1] as List<Store>;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Column(
          children: [
            // Search bar
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _ctrl,
                      autofocus: true,
                      onChanged: (v) {
                        if (v.length >= 2 || v.isEmpty) _search(v.trim());
                      },
                      decoration: InputDecoration(
                        hintText: 'Search products & stores…',
                        prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted),
                        suffixIcon: _ctrl.text.isNotEmpty
                            ? IconButton(icon: const Icon(Icons.clear_rounded, color: AppColors.textMuted), onPressed: () { _ctrl.clear(); _search(''); })
                            : null,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Tabs
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: TabBar(
                controller: _tabs,
                labelColor: AppColors.primary,
                unselectedLabelColor: AppColors.textMuted,
                indicatorColor: AppColors.primary,
                indicatorSize: TabBarIndicatorSize.label,
                labelStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                tabs: [
                  Tab(text: 'Products${_products.isNotEmpty ? " (${_products.length})" : ""}'),
                  Tab(text: 'Stores${_stores.isNotEmpty ? " (${_stores.length})" : ""}'),
                ],
              ),
            ),

            // Results
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                  : _query.isEmpty
                      ? _buildEmpty()
                      : TabBarView(
                          controller: _tabs,
                          children: [
                            _buildProducts(),
                            _buildStores(),
                          ],
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty() => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_rounded, size: 64, color: AppColors.primary.withOpacity(0.2)),
            const SizedBox(height: 16),
            const Text('Search for anything', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
            const SizedBox(height: 8),
            const Text('Products, stores, categories…', style: TextStyle(color: AppColors.textSecondary)),
          ],
        ),
      );

  Widget _buildProducts() {
    if (_products.isEmpty) return _noResults('No products found for "$_query"');
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.72),
      itemCount: _products.length,
      itemBuilder: (_, i) => ProductCard(
        product: _products[i],
        onAddToCart: () async {
          final ok = await context.read<CartProvider>().addItem(_products[i].id);
          if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(ok ? 'Added to cart' : 'Failed to add'),
            backgroundColor: ok ? AppColors.success : AppColors.error,
          ));
        },
      ),
    );
  }

  Widget _buildStores() {
    if (_stores.isEmpty) return _noResults('No stores found for "$_query"');
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _stores.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (_, i) => StoreCard(store: _stores[i]),
    );
  }

  Widget _noResults(String msg) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off_rounded, size: 56, color: AppColors.primary.withOpacity(0.2)),
            const SizedBox(height: 12),
            Text(msg, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondary)),
          ],
        ),
      );
}
