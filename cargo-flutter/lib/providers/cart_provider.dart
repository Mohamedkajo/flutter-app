import 'package:flutter/foundation.dart';
import '../models/cart.dart';
import '../services/api_service.dart';

class CartProvider extends ChangeNotifier {
  List<CartItem> _items = [];
  bool _isLoading = false;
  String? _error;

  List<CartItem> get items => _items;
  bool get isLoading => _isLoading;
  String? get error => _error;
  int get itemCount => _items.fold(0, (sum, i) => sum + i.quantity);
  double get subtotal => _items.fold(0.0, (sum, i) => sum + i.subtotal);
  double get deliveryFee => _items.isEmpty ? 0 : (_items.first.storeId != null ? 15.0 : 0.0);
  double get total => subtotal + deliveryFee;
  bool get isEmpty => _items.isEmpty;
  String? get storeName => _items.isNotEmpty ? _items.first.storeName : null;

  final ApiService _api = ApiService();

  Future<void> fetchCart() async {
    _isLoading = true;
    notifyListeners();
    try {
      _items = await _api.getCart();
      _error = null;
    } catch (e) {
      _error = e.toString();
      _items = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addItem(int productId, int quantity) async {
    try {
      await _api.addToCart(productId, quantity);
      await fetchCart();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> removeItem(int itemId) async {
    try {
      await _api.removeFromCart(itemId);
      _items.removeWhere((i) => i.id == itemId);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> updateQuantity(int itemId, int quantity) async {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }
    try {
      await _api.updateCartItem(itemId, quantity);
      final idx = _items.indexWhere((i) => i.id == itemId);
      if (idx != -1) {
        _items[idx] = _items[idx].copyWith(quantity: quantity);
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> clearCart() async {
    try {
      await _api.clearCart();
      _items = [];
      notifyListeners();
    } catch (_) {}
  }
}
