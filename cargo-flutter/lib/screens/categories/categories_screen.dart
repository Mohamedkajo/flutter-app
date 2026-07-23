import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/category.dart';
import '../../models/store.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../ui/index.dart';

class CategoriesScreen extends StatefulWidget {
  const CategoriesScreen({super.key});

  @override
  State<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends State<CategoriesScreen> {
  final _api = ApiService.instance;
  List<Category> _categories = [];
  Category? _selected;
  List<Store> _stores = [];
  bool _loadingCats = true;
  bool _loadingStores = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    try {
      final cats = await _api.getCategories();
      setState(() {
        _categories = cats;
        _loadingCats = false;
      });
      if (cats.isNotEmpty) _selectCategory(cats.first);
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loadingCats = false;
      });
    }
  }

  Future<void> _selectCategory(Category cat) async {
    setState(() {
      _selected = cat;
      _loadingStores = true;
      _stores = [];
    });
    try {
      final stores =
          await _api.getStores(category: cat.slug);
      setState(() {
        _stores = stores;
        _loadingStores = false;
      });
    } catch (_) {
      setState(() => _loadingStores = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('Categories'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _loadingCats
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary))
          : _error != null
              ? CargoErrorState(
                  message: _error!, onRetry: _loadCategories)
              : Row(
                  children: [
                    // ── Left sidebar ─────────────────────────────────────
                    Container(
                      width: 100,
                      color: Colors.white,
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        itemCount: _categories.length,
                        itemBuilder: (_, i) {
                          final cat = _categories[i];
                          final sel = _selected?.id == cat.id;
                          return GestureDetector(
                            onTap: () => _selectCategory(cat),
                            child: Container(
                              margin: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              padding: const EdgeInsets.symmetric(
                                  vertical: 10, horizontal: 6),
                              decoration: BoxDecoration(
                                color: sel
                                    ? AppColors.primaryLight
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(12),
                                border: sel
                                    ? Border.all(
                                        color: AppColors.primary
                                            .withOpacity(0.3))
                                    : null,
                              ),
                              child: Column(
                                children: [
                                  Text(cat.icon ?? '🛒',
                                      style: const TextStyle(fontSize: 26)),
                                  const SizedBox(height: 4),
                                  Text(
                                    cat.name,
                                    textAlign: TextAlign.center,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.poppins(
                                      fontSize: 10,
                                      fontWeight: sel
                                          ? FontWeight.w700
                                          : FontWeight.w400,
                                      color: sel
                                          ? AppColors.primary
                                          : AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                    // ── Right store list ──────────────────────────────────
                    Expanded(
                      child: _loadingStores
                          ? const LoadingList(count: 4)
                          : _stores.isEmpty
                              ? CargoEmptyState(
                                  icon: Icons.store_rounded,
                                  title: 'No stores',
                                  subtitle:
                                      'No stores in ${_selected?.name ?? 'this category'} yet.',
                                )
                              : RefreshIndicator(
                                  color: AppColors.primary,
                                  onRefresh: () =>
                                      _selectCategory(_selected!),
                                  child: ListView.builder(
                                    padding: const EdgeInsets.all(12),
                                    itemCount: _stores.length,
                                    itemBuilder: (_, i) =>
                                        StoreListCard(
                                      store: _stores[i],
                                      onTap: () => context.push(
                                          '/stores/${_stores[i].id}'),
                                    ),
                                  ),
                                ),
                    ),
                  ],
                ),
    );
  }
}
