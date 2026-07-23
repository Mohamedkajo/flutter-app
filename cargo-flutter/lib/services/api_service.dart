import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/user.dart';
import '../models/store.dart';
import '../models/product.dart';
import '../models/category.dart';
import '../models/cart.dart';
import '../models/order.dart';
import '../models/notification_model.dart';

class ApiException implements Exception {
  final int? statusCode;
  final String message;
  ApiException(this.message, {this.statusCode});
  @override
  String toString() => message;
}

class ApiService {
  ApiService._();
  static final ApiService instance = ApiService._();

  String? _token;

  Future<void> setToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(ApiConfig.tokenKey, token);
  }

  Future<String?> getToken() async {
    if (_token != null) return _token;
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(ApiConfig.tokenKey);
    return _token;
  }

  Future<void> clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(ApiConfig.tokenKey);
    await prefs.remove(ApiConfig.userKey);
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Uri _url(String path, [Map<String, String>? query]) {
    final base = ApiConfig.baseUrl.endsWith('/')
        ? ApiConfig.baseUrl.substring(0, ApiConfig.baseUrl.length - 1)
        : ApiConfig.baseUrl;
    final uri = Uri.parse('$base$path');
    return query != null ? uri.replace(queryParameters: query) : uri;
  }

  Future<dynamic> _get(String path, [Map<String, String>? query]) async {
    try {
      final res = await http
          .get(_url(path, query), headers: _headers)
          .timeout(ApiConfig.receiveTimeout);
      return _parse(res);
    } on SocketException {
      throw ApiException('No internet connection');
    } on HttpException {
      throw ApiException('Network error');
    }
  }

  Future<dynamic> _post(String path, Map<String, dynamic> body) async {
    try {
      final res = await http
          .post(_url(path), headers: _headers, body: jsonEncode(body))
          .timeout(ApiConfig.receiveTimeout);
      return _parse(res);
    } on SocketException {
      throw ApiException('No internet connection');
    }
  }

  Future<dynamic> _put(String path, Map<String, dynamic> body) async {
    try {
      final res = await http
          .put(_url(path), headers: _headers, body: jsonEncode(body))
          .timeout(ApiConfig.receiveTimeout);
      return _parse(res);
    } on SocketException {
      throw ApiException('No internet connection');
    }
  }

  Future<dynamic> _delete(String path) async {
    try {
      final res = await http
          .delete(_url(path), headers: _headers)
          .timeout(ApiConfig.receiveTimeout);
      return _parse(res);
    } on SocketException {
      throw ApiException('No internet connection');
    }
  }

  dynamic _parse(http.Response res) {
    final body = utf8.decode(res.bodyBytes);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return body.isNotEmpty ? jsonDecode(body) : null;
    }
    String msg = 'Request failed';
    try {
      final data = jsonDecode(body);
      msg = data['message'] ?? data['error'] ?? msg;
    } catch (_) {}
    throw ApiException(msg, statusCode: res.statusCode);
  }

  // ─── Auth ───────────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> login(String email, String password) async {
    final data = await _post('/auth/login', {'email': email, 'password': password});
    return data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> register(String name, String email, String password) async {
    final data = await _post('/auth/register', {
      'name': name,
      'email': email,
      'password': password,
    });
    return data as Map<String, dynamic>;
  }

  Future<User> getProfile() async {
    final data = await _get('/auth/me');
    return User.fromJson(data as Map<String, dynamic>);
  }

  Future<User> updateProfile(Map<String, dynamic> body) async {
    final data = await _put('/auth/profile', body);
    return User.fromJson(data as Map<String, dynamic>);
  }

  // ─── Stores ─────────────────────────────────────────────────────────────────

  Future<List<Store>> getStores({String? category, String? search, int limit = 20}) async {
    final q = <String, String>{
      'limit': '$limit',
      if (category != null) 'category': category,
      if (search != null) 'search': search,
    };
    final data = await _get('/stores', q);
    return (data as List<dynamic>).map((e) => Store.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Store>> getFeaturedStores() async {
    final data = await _get('/stores', {'featured': 'true', 'limit': '10'});
    return (data as List<dynamic>).map((e) => Store.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Store>> getNearbyStores() async {
    final data = await _get('/stores/nearby');
    return (data as List<dynamic>).map((e) => Store.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Store> getStore(int id) async {
    final data = await _get('/stores/$id');
    return Store.fromJson(data as Map<String, dynamic>);
  }

  Future<List<Product>> getStoreProducts(int storeId) async {
    final data = await _get('/stores/$storeId/products');
    return (data as List<dynamic>).map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ─── Products ────────────────────────────────────────────────────────────────

  Future<List<Product>> getProducts({String? search, String? category, bool? featured}) async {
    final q = <String, String>{
      if (search != null) 'search': search,
      if (category != null) 'category': category,
      if (featured != null) 'featured': '$featured',
    };
    final data = await _get('/products', q.isNotEmpty ? q : null);
    return (data as List<dynamic>).map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Product> getProduct(int id) async {
    final data = await _get('/products/$id');
    return Product.fromJson(data as Map<String, dynamic>);
  }

  Future<List<Product>> searchProducts(String query) => getProducts(search: query);

  // ─── Categories ──────────────────────────────────────────────────────────────

  Future<List<Category>> getCategories() async {
    final data = await _get('/categories');
    return (data as List<dynamic>).map((e) => Category.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ─── Flash Sales ─────────────────────────────────────────────────────────────

  Future<List<Product>> getFlashSales() async {
    try {
      final data = await _get('/flash-sales');
      final List<dynamic> items = data is List ? data : (data['items'] ?? []);
      return items
          .map((e) {
            final product = (e['product'] ?? e) as Map<String, dynamic>;
            if (e['discountPercent'] != null) product['discountPercent'] = e['discountPercent'];
            return Product.fromJson(product);
          })
          .toList();
    } catch (_) {
      return [];
    }
  }

  // ─── Cart ─────────────────────────────────────────────────────────────────────

  Future<Cart> getCart() async {
    final data = await _get('/cart');
    if (data is List) return Cart(items: data.map((e) => CartItem.fromJson(e as Map<String, dynamic>)).toList());
    return Cart.fromJson(data as Map<String, dynamic>);
  }

  Future<void> addToCart(int productId, int quantity) async {
    await _post('/cart', {'productId': productId, 'quantity': quantity});
  }

  Future<void> updateCartItem(int itemId, int quantity) async {
    await _put('/cart/$itemId', {'quantity': quantity});
  }

  Future<void> removeCartItem(int itemId) async {
    await _delete('/cart/$itemId');
  }

  Future<void> clearCart() async {
    await _delete('/cart');
  }

  // ─── Orders ───────────────────────────────────────────────────────────────────

  Future<List<Order>> getOrders() async {
    final data = await _get('/orders');
    return (data as List<dynamic>).map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Order> getOrder(int id) async {
    final data = await _get('/orders/$id');
    return Order.fromJson(data as Map<String, dynamic>);
  }

  Future<Order> placeOrder(Map<String, dynamic> body) async {
    final data = await _post('/orders', body);
    return Order.fromJson(data as Map<String, dynamic>);
  }

  Future<void> cancelOrder(int id) async {
    await _put('/orders/$id', {'status': 'cancelled'});
  }

  // ─── Favorites ────────────────────────────────────────────────────────────────

  Future<List<Product>> getFavorites() async {
    final data = await _get('/favorites');
    return (data as List<dynamic>).map((e) {
      final product = (e['product'] ?? e) as Map<String, dynamic>;
      return Product.fromJson(product);
    }).toList();
  }

  Future<void> toggleFavorite(int productId) async {
    await _post('/favorites', {'productId': productId});
  }

  // ─── Notifications ────────────────────────────────────────────────────────────

  Future<List<AppNotification>> getNotifications() async {
    final data = await _get('/notifications');
    return (data as List<dynamic>)
        .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> markNotificationRead(int id) async {
    await _put('/notifications/$id', {'isRead': true});
  }

  // ─── Wallet ───────────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> getWallet() async {
    final data = await _get('/wallet');
    return data as Map<String, dynamic>;
  }

  Future<void> topUpWallet(double amount) async {
    await _post('/wallet/topup', {'amount': amount});
  }
}
