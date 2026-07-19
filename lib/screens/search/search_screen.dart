import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../models/store.dart';
import '../../models/product.dart';
import '../../services/api_service.dart';
import '../../widgets/store_card.dart';
import '../../widgets/product_card.dart';
import '../../widgets/common/loading_shimmer.dart';
import '../../theme/app_theme.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen>
    with SingleTickerProviderStateMixin {
  final _controller = TextEditingController();
  late final TabController _tabs;
  final _api = ApiService();
  Timer? _debounce;

  List<Store> _stores = [];
  List<Product> _products = [];
  bool _loading = false;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
    _controller.addListener(_onChanged);
    _loadAll();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    _tabs.dispose();
    super.dispose();
  }

  void _onChanged() {
    final q = _controller.text.trim();
    if (q == _query) return;
    _query = q;
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 450), _search);
  }

  Future<void> _loadAll() async {
    setState(() => _loading = true);
    try {
      final res = await Future.wait([
        _api.getStores(),
        _api.getTrendingProducts(),
      ]);
      _stores = res[0] as List<Store>;
      _products = res[1] as List<Product>;
    } catch (_) {}
    setState(() => _loading = false);
  }

  Future<void> _search() async {
    if (_query.isEmpty) {
      _loadAll();
      return;
    }
    setState(() => _loading = true);
    try {
      final res = await Future.wait([
        _api.getStores(search: _query),
        _api.searchProducts(_query),
      ]);
      _stores = res[0] as List<Store>;
      _products = res[1] as List<Product>;
    } catch (_) {}
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: Column(
        children: [
          // ── Flat purple header ─────────────────────────────────────────
          Container(
            color: AppColors.primary,
            padding: EdgeInsets.fromLTRB(
                16, MediaQuery.of(context).padding.top + 12, 16, 16),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 46,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      children: [
                        const Padding(
                          padding: EdgeInsets.only(left: 12, right: 8),
                          child: Icon(Icons.search_rounded,
                              color: AppColors.textMuted, size: 20),
                        ),
                        Expanded(
                          child: TextField(
                            controller: _controller,
                            autofocus: false,
                            style: const TextStyle(
                              fontSize: 14,
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.w500,
                            ),
                            decoration: const InputDecoration(
                              hintText: 'Search stores, food…',
                              hintStyle: TextStyle(
                                  color: AppColors.textMuted, fontSize: 14),
                              border: InputBorder.none,
                              isDense: true,
                            ),
                          ),
                        ),
                        if (_controller.text.isNotEmpty)
                          GestureDetector(
                            onTap: () {
                              _controller.clear();
                              _query = '';
                              _loadAll();
                            },
                            child: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 10),
                              child: Icon(Icons.close_rounded,
                                  color: AppColors.textMuted, size: 18),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                    color: AppColors.primaryDark,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.tune_rounded,
                      color: Colors.white, size: 20),
                ),
              ],
            ),
          ),

          // ── Tab bar ────────────────────────────────────────────────────
          Container(
            color: AppColors.primary,
            child: Container(
              decoration: const BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: TabBar(
                controller: _tabs,
                labelColor: AppColors.primary,
                unselectedLabelColor: AppColors.textMuted,
                indicatorColor: AppColors.primary,
                indicatorWeight: 3,
                labelStyle: const TextStyle(
                    fontSize: 14, fontWeight: FontWeight.w600),
                tabs: const [
                  Tab(text: 'Stores'),
                  Tab(text: 'Products'),
                ],
              ),
            ),
          ),

          // ── Tab content ────────────────────────────────────────────────
          Expanded(
            child: TabBarView(
              controller: _tabs,
              children: [
                _StoresTab(stores: _stores, loading: _loading, query: _query),
                _ProductsTab(products: _products, loading: _loading, query: _query),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StoresTab extends StatelessWidget {
  final List<Store> stores;
  final bool loading;
  final String query;

  const _StoresTab(
      {required this.stores, required this.loading, required this.query});

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: 5,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (_, __) => const StoreCardShimmer(),
      );
    }
    if (stores.isEmpty) return _EmptyState(query: query, type: 'stores');
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      itemCount: stores.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (_, i) => StoreCard(store: stores[i]),
    );
  }
}

class _ProductsTab extends StatelessWidget {
  final List<Product> products;
  final bool loading;
  final String query;

  const _ProductsTab(
      {required this.products, required this.loading, required this.query});

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.72,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
        ),
        itemCount: 6,
        itemBuilder: (_, __) => const ProductCardShimmer(),
      );
    }
    if (products.isEmpty) return _EmptyState(query: query, type: 'products');
    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.72,
        crossAxisSpacing: 12,
        mainAxisSpacing: 14,
      ),
      itemCount: products.length,
      itemBuilder: (_, i) => ProductCard(product: products[i]),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final String query;
  final String type;
  const _EmptyState({required this.query, required this.type});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('🔍', style: TextStyle(fontSize: 56)),
            const SizedBox(height: 16),
            Text(
              query.isEmpty ? 'Search for $type' : 'No $type found',
              style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary),
            ),
            const SizedBox(height: 8),
            Text(
              query.isEmpty
                  ? 'Type something above to get started'
                  : 'Try a different keyword',
              style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
