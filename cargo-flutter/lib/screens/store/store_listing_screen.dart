import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../models/category.dart';
import '../../models/store.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/shimmer_loader.dart';
import '../../widgets/store_card.dart';

class StoreListingScreen extends StatefulWidget {
  final String? filter;
  final String? category;

  const StoreListingScreen({super.key, this.filter, this.category});

  @override
  State<StoreListingScreen> createState() => _StoreListingScreenState();
}

class _StoreListingScreenState extends State<StoreListingScreen> {
  List<Store> _stores = [];
  List<Category> _categories = [];
  bool _loading = true;
  String? _activeCategory;

  @override
  void initState() {
    super.initState();
    _activeCategory = widget.category;
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        _fetchStores(),
        if (_categories.isEmpty) ApiService.instance.getCategories(),
      ]);
      if (mounted) {
        setState(() {
          _stores = results[0] as List<Store>;
          if (results.length > 1) _categories = results[1] as List<Category>;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<List<Store>> _fetchStores() async {
    switch (widget.filter) {
      case 'nearby':
        return ApiService.instance.getNearbyStores();
      case 'online':
        final all = await ApiService.instance.getStores(category: _activeCategory);
        return all.where((s) => s.isOnline).toList();
      default:
        return ApiService.instance.getStores(category: _activeCategory);
    }
  }

  String get _title {
    switch (widget.filter) {
      case 'nearby': return 'Nearby Stores';
      case 'online': return 'Online Stores';
      default: return 'All Stores';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: NestedScrollView(
        headerSliverBuilder: (_, __) => [
          SliverAppBar(
            pinned: true,
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            title: Text(_title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
            expandedHeight: widget.filter == null ? 120 : 0,
            flexibleSpace: widget.filter == null
                ? FlexibleSpaceBar(
                    background: Container(
                      decoration: const BoxDecoration(gradient: AppColors.gradientPrimary),
                      alignment: Alignment.bottomLeft,
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                      child: _buildCategoryChips(),
                    ),
                  )
                : null,
          ),
        ],
        body: _loading
            ? ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: 4,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (_, __) => const StoreCardShimmer(),
              )
            : _stores.isEmpty
                ? _buildEmpty()
                : RefreshIndicator(
                    color: AppColors.primary,
                    onRefresh: _load,
                    child: ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: _stores.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (_, i) => StoreCard(store: _stores[i]),
                    ),
                  ),
      ),
    );
  }

  Widget _buildCategoryChips() {
    if (_categories.isEmpty) return const SizedBox.shrink();
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _Chip(label: 'All', active: _activeCategory == null, onTap: () { setState(() => _activeCategory = null); _load(); }),
          ..._categories.map((c) => _Chip(
                label: c.name,
                active: _activeCategory == (c.slug ?? c.name),
                onTap: () { setState(() => _activeCategory = c.slug ?? c.name); _load(); },
              )),
        ],
      ),
    );
  }

  Widget _buildEmpty() => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.store_outlined, size: 64, color: AppColors.primary.withOpacity(0.2)),
            const SizedBox(height: 16),
            const Text('No stores found', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            const Text('Try a different category or filter', style: TextStyle(color: AppColors.textSecondary)),
          ],
        ),
      );
}

class _Chip extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _Chip({required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          margin: const EdgeInsets.only(right: 8),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: active ? Colors.white : Colors.white.withOpacity(0.2),
            borderRadius: BorderRadius.circular(AppRadius.full),
          ),
          child: Text(label,
              style: TextStyle(
                fontSize: 13, fontWeight: FontWeight.w600,
                color: active ? AppColors.primary : Colors.white,
              )),
        ),
      );
}
