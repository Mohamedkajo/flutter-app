import 'package:flutter/material.dart';
import '../models/cart.dart';
import '../services/api_service.dart';

class CartProvider extends ChangeNotifier {
  Cart _cart = const Cart(items: []);
  bool _loading = false;
  String? _error;

  Cart get cart => _cart;
  bool get loading => _loading;
  String? get error => _error;
  int get itemCount => _cart.itemCount;
  bool get isEmpty => _cart.isEmpty;

  Future<void> load() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      _cart = await ApiService.instance.getCart();
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> addItem(int productId, {int quantity = 1}) async {
    try {
      await ApiService.instance.addToCart(productId, quantity);
      await load();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateItem(int itemId, int quantity) async {
    if (quantity <= 0) return removeItem(itemId);
    try {
      await ApiService.instance.updateCartItem(itemId, quantity);
      await load();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> removeItem(int itemId) async {
    try {
      await ApiService.instance.removeCartItem(itemId);
      await load();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> clear() async {
    try {
      await ApiService.instance.clearCart();
      _cart = const Cart(items: []);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
