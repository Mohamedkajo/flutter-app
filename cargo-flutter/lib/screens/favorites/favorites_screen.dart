import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_service.dart';
import '../../models/store.dart';
import '../../models/product.dart';
import '../../theme/app_theme.dart';
import '../../ui/index.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  final _api = ApiService();

  List<Store> _stores = [];
  List<Product> _products = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
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
      final favs = await _api.getFavorites();
      final storeIds = favs
          .where((f) => f['type'] == 'store')
          .map((f) => f['refId'] as int)
          .toList();
      final productIds = favs
          .where((f) => f['type'] == 'product')
          .map((f) => f['refId'] as int)
          .toList();

      final stores = await _api.getStores();
      final products = await _api.getProducts();

      setState(() {
        _stores = stores.where((s) => storeIds.contains(s.id)).toList();
        _products = products.where((p) => productIds.contains(p.id)).toList();
        _loading = false;
        _error = null;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('Favourites'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        bottom: TabBar(
          controller: _tabs,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          indicatorWeight: 3,
          tabs: [
            Tab(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.store_rounded, size: 16),
                  const SizedBox(width: 6),
                  Text('Stores (${_stores.length})'),
                ],
              ),
            ),
            Tab(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.fastfood_rounded, size: 16),
                  const SizedBox(width: 6),
                  Text('Products (${_products.length})'),
                ],
              ),
            ),
          ],
        ),
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary))
          : _error != null
              ? CargoErrorState(message: _error!, onRetry: _load)
              : TabBarView(
                  controller: _tabs,
                  children: [
                    _storeTab(),
                    _productTab(),
                  ],
                ),
    );
  }

  Widget _storeTab() {
    if (_stores.isEmpty) {
      return const CargoEmptyState(
        icon: Icons.favorite_border_rounded,
        title: 'No favourite stores yet',
        subtitle: 'Tap the heart icon on a store to save it here.',
      );
    }
    return RefreshIndicator(
      onRefresh: _load,
      color: AppColors.primary,
      child: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: _stores.length,
        itemBuilder: (_, i) => StoreListCard(
          store: _stores[i],
          onTap: () => context.push('/stores/${_stores[i].id}'),
        ),
      ),
    );
  }

  Widget _productTab() {
    if (_products.isEmpty) {
      return const CargoEmptyState(
        icon: Icons.favorite_border_rounded,
        title: 'No favourite products yet',
        subtitle: 'Tap the heart on a product to save it here.',
      );
    }
    return RefreshIndicator(
      onRefresh: _load,
      color: AppColors.primary,
      child: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: _products.length,
        itemBuilder: (_, i) => ProductListTile(
          product: _products[i],
          onTap: () => context.push('/products/${_products[i].id}'),
        ),
      ),
    );
  }
}
