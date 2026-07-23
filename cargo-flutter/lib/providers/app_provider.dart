import 'package:flutter/material.dart';
import '../models/store.dart';
import '../models/product.dart';
import '../models/category.dart';
import '../services/api_service.dart';

class AppProvider extends ChangeNotifier {
  List<Store> _featuredStores = [];
  List<Product> _flashSales = [];
  List<Category> _categories = [];
  List<Product> _trendingProducts = [];
  bool _loading = false;
  bool _initialized = false;
  String? _error;

  List<Store> get featuredStores => _featuredStores;
  List<Product> get flashSales => _flashSales;
  List<Category> get categories => _categories;
  List<Product> get trendingProducts => _trendingProducts;
  bool get loading => _loading;
  bool get initialized => _initialized;
  String? get error => _error;

  Future<void> init() async {
    if (_initialized) return;
    _loading = true;
    notifyListeners();
    await _loadAll();
  }

  Future<void> refresh() async {
    _loading = true;
    _error = null;
    notifyListeners();
    await _loadAll();
  }

  Future<void> _loadAll() async {
    try {
      final results = await Future.wait([
        ApiService.instance.getFeaturedStores().catchError((_) => <Store>[]),
        ApiService.instance.getFlashSales().catchError((_) => <Product>[]),
        ApiService.instance.getCategories().catchError((_) => <Category>[]),
        ApiService.instance.getProducts(featured: true).catchError((_) => <Product>[]),
      ]);

      _featuredStores = results[0] as List<Store>;
      _flashSales = results[1] as List<Product>;
      _categories = results[2] as List<Category>;
      _trendingProducts = results[3] as List<Product>;
      _initialized = true;
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}
