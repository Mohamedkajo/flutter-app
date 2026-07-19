import 'package:flutter/foundation.dart';
import '../models/store.dart';
import '../models/product.dart';
import '../models/category.dart';
import '../services/api_service.dart';

class AppProvider extends ChangeNotifier {
  List<Store> featuredStores = [];
  List<Store> nearbyStores = [];
  List<Store> onlineStores = [];
  List<Category> categories = [];
  List<Map<String, dynamic>> flashSales = [];
  List<Product> trendingProducts = [];
  int unreadCount = 2;
  bool isLoading = false;
  String? error;

  final ApiService _api = ApiService();

  Future<void> loadHomeData() async {
    isLoading = true;
    notifyListeners();
    try {
      final results = await Future.wait([
        _api.getFeaturedStores(),
        _api.getNearbyStores(),
        _api.getCategories(),
        _api.getOnlineStores(),
        _api.getFlashSales(),
        _api.getTrendingProducts(),
      ]);
      featuredStores = results[0] as List<Store>;
      nearbyStores = results[1] as List<Store>;
      categories = results[2] as List<Category>;
      onlineStores = results[3] as List<Store>;
      flashSales = results[4] as List<Map<String, dynamic>>;
      trendingProducts = results[5] as List<Product>;
      error = null;
    } catch (e) {
      error = e.toString();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  void decrementUnread() {
    if (unreadCount > 0) {
      unreadCount--;
      notifyListeners();
    }
  }
}
