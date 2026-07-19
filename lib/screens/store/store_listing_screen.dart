import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../models/store.dart';
import '../../models/category.dart';
import '../../services/api_service.dart';
import '../../widgets/store_card.dart';
import '../../widgets/common/loading_shimmer.dart';
import '../../theme/app_theme.dart';

class StoreListingScreen extends StatefulWidget {
  const StoreListingScreen({super.key});

  @override
  State<StoreListingScreen> createState() => _StoreListingScreenState();
}

class _StoreListingScreenState extends State<StoreListingScreen> {
  final _api = ApiService();
  List<Store> _stores = [];
  List<Category> _categories = [];
  String? _selectedCategory;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    try {
      final res = await Future.wait([
        _api.getStores(category: _selectedCategory),
        _api.getCategories(),
      ]);
      _stores = res[0] as List<Store>;
      _categories = res[1] as List<Category>;
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  Future<void> _filter(String? category) async {
    _selectedCategory = category;
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _load,
        child: CustomScrollView(
          slivers: [
            // ── App Bar ──────────────────────────────────────────────────
            SliverAppBar(
              pinned: true,
              backgroundColor: AppColors.primary,
              elevation: 0,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_ios_new_rounded,
                    color: Colors.white, size: 20),
                onPressed: () =>
                    context.canPop() ? context.pop() : context.go('/'),
              ),
              title: const Text(
                'All Stores',
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w700),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.search_rounded,
                      color: Colors.white, size: 22),
                  onPressed: () => context.go('/search'),
                ),
              ],
              bottom: PreferredSize(
                preferredSize: const Size.fromHeight(56),
                child: Container(
                  color: AppColors.primary,
                  child: Container(
                    decoration: const BoxDecoration(
                      color: AppColors.surface,
                      borderRadius:
                          BorderRadius.vertical(top: Radius.circular(28)),
                    ),
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                    child: _categories.isEmpty
                        ? const SizedBox(height: 44)
                        : SizedBox(
                            height: 44,
                            child: ListView.separated(
                              scrollDirection: Axis.horizontal,
                              itemCount: _categories.length + 1,
                              separatorBuilder: (_, __) =>
                                  const SizedBox(width: 8),
                              itemBuilder: (ctx, i) {
                                final isAll = i == 0;
                                final cat = isAll ? null : _categories[i - 1];
                                final isSelected = isAll
                                    ? _selectedCategory == null
                                    : _selectedCategory == cat?.slug;
                                return GestureDetector(
                                  onTap: () => _filter(cat?.slug),
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 16, vertical: 8),
                                    decoration: BoxDecoration(
                                      color: isSelected
                                          ? AppColors.primary
                                          : Colors.white,
                                      borderRadius: BorderRadius.circular(22),
                                      border: Border.all(
                                        color: isSelected
                                            ? AppColors.primary
                                            : AppColors.border,
                                      ),
                                    ),
                                    child: Text(
                                      isAll
                                          ? 'All'
                                          : '${cat!.icon} ${cat.name}',
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: isSelected
                                            ? Colors.white
                                            : AppColors.textSecondary,
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                  ),
                ),
              ),
            ),

            // ── Store list ───────────────────────────────────────────────
            if (_isLoading)
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (_, __) => const Padding(
                      padding: EdgeInsets.only(bottom: 14),
                      child: StoreCardShimmer(),
                    ),
                    childCount: 5,
                  ),
                ),
              )
            else if (_stores.isEmpty)
              const SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('🏪', style: TextStyle(fontSize: 52)),
                      SizedBox(height: 12),
                      Text('No stores found',
                          style: TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary)),
                      SizedBox(height: 6),
                      Text('Try a different category',
                          style: TextStyle(
                              fontSize: 13, color: AppColors.textMuted)),
                    ],
                  ),
                ),
              )
            else
              SliverPadding(
                padding:
                    const EdgeInsets.fromLTRB(16, 16, 16, 100),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (_, i) => Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: StoreCard(store: _stores[i]),
                    ),
                    childCount: _stores.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
