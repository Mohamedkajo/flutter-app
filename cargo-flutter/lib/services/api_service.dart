import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/store.dart';
import '../models/product.dart';
import '../models/category.dart';
import '../models/order.dart';
import '../models/cart.dart';
import '../models/user.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, {this.statusCode});

  @override
  String toString() => 'ApiException: $message (status: $statusCode)';
}

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _token;

  void setToken(String? token) => _token = token;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Uri _uri(String path, [Map<String, dynamic>? params]) {
    final cleanPath = path.startsWith('/') ? path : '/$path';
    final base = Uri.parse('${ApiConfig.baseUrl}$cleanPath');
    if (params == null || params.isEmpty) return base;
    final filtered = <String, String>{};
    params.forEach((k, v) {
      if (v != null) filtered[k] = v.toString();
    });
    return base.replace(queryParameters: filtered);
  }

  Future<dynamic> _get(String path, [Map<String, dynamic>? params]) async {
    final res = await http
        .get(_uri(path, params), headers: _headers)
        .timeout(ApiConfig.receiveTimeout);
    return _parse(res);
  }

  Future<dynamic> _post(String path, [Map<String, dynamic>? body]) async {
    final res = await http
        .post(_uri(path), headers: _headers, body: jsonEncode(body ?? {}))
        .timeout(ApiConfig.receiveTimeout);
    return _parse(res);
  }

  Future<dynamic> _patch(String path, [Map<String, dynamic>? body]) async {
    final res = await http
        .patch(_uri(path), headers: _headers, body: jsonEncode(body ?? {}))
        .timeout(ApiConfig.receiveTimeout);
    return _parse(res);
  }

  Future<dynamic> _delete(String path) async {
    final res = await http
        .delete(_uri(path), headers: _headers)
        .timeout(ApiConfig.receiveTimeout);
    return _parse(res);
  }

  dynamic _parse(http.Response res) {
    final body = jsonDecode(res.body);
    if (res.statusCode >= 200 && res.statusCode < 300) return body;
    final msg = body is Map
        ? body['error'] ?? body['message'] ?? 'Request failed'
        : 'Request failed';
    throw ApiException(msg.toString(), statusCode: res.statusCode);
  }

  // ── Auth ─────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> login(String email, String password) async =>
      await _post('/auth/login', {'email': email, 'password': password})
          as Map<String, dynamic>;

  Future<Map<String, dynamic>> register(
          String name, String phone, String email, String password) async =>
      await _post('/auth/register', {
        'name': name,
        'phone': phone,
        'email': email,
        'password': password,
      }) as Map<String, dynamic>;

  Future<Map<String, dynamic>> getProfile() async =>
      await _get('/users/profile') as Map<String, dynamic>;

  Future<void> updateProfile(Map<String, dynamic> data) async =>
      await _patch('/users/profile', data);

  // ── Stores ───────────────────────────────────────────────────────────────
  Future<List<Store>> getStores({
    String? category,
    String? search,
    bool? featured,
    bool? online,
  }) async {
    final data = await _get('/stores', {
      if (category != null) 'category': category,
      if (search != null) 'search': search,
      if (featured != null) 'featured': featured.toString(),
      if (online != null) 'online': online.toString(),
    }) as List<dynamic>;
    return data.map((e) => Store.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Store>> getFeaturedStores() async {
    final data = await _get('/stores/featured') as List<dynamic>;
    return data.map((e) => Store.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Store>> getNearbyStores() async {
    final data = await _get('/stores/nearby') as List<dynamic>;
    return data.map((e) => Store.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Store>> getOnlineStores() async {
    final data = await _get('/stores/online') as List<dynamic>;
    return data.map((e) => Store.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Store> getStore(int id) async =>
      Store.fromJson(await _get('/stores/$id') as Map<String, dynamic>);

  Future<List<Product>> getStoreProducts(int storeId,
      {String? category}) async {
    final data = await _get('/stores/$storeId/products',
        {if (category != null) 'category': category}) as List<dynamic>;
    return data.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Category>> getStoreCategories(int storeId) async {
    final data = await _get('/stores/$storeId/categories') as List<dynamic>;
    return data.map((e) => Category.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ── Categories ───────────────────────────────────────────────────────────
  Future<List<Category>> getCategories() async {
    final data = await _get('/categories') as List<dynamic>;
    return data.map((e) => Category.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ── Products ─────────────────────────────────────────────────────────────
  Future<List<Product>> getProducts({String? search, String? category}) async {
    final data = await _get('/products', {
      if (search != null) 'search': search,
      if (category != null) 'category': category,
    }) as List<dynamic>;
    return data.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Product>> getTrendingProducts() async {
    final data = await _get('/products/trending') as List<dynamic>;
    return data.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Product>> searchProducts(String query) async =>
      getProducts(search: query);

  Future<Product> getProduct(int id) async =>
      Product.fromJson(await _get('/products/$id') as Map<String, dynamic>);

  // ── Flash Sales ───────────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> getFlashSales() async =>
      ((await _get('/flash-sales')) as List<dynamic>)
          .cast<Map<String, dynamic>>();

  // ── Cart ─────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> getCartFull() async =>
      await _get('/cart') as Map<String, dynamic>;

  Future<List<CartItem>> getCart() async {
    final data = await _get('/cart') as Map<String, dynamic>;
    final items = data['items'] as List<dynamic>? ?? [];
    return items.map((e) => CartItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Map<String, dynamic>> addToCartFull(
      int productId, int quantity) async =>
      await _post('/cart/items', {
        'productId': productId,
        'quantity': quantity,
      }) as Map<String, dynamic>;

  Future<void> addToCart(int productId, int quantity) async =>
      await addToCartFull(productId, quantity);

  Future<void> updateCartItem(int itemId, int quantity) async =>
      await _patch('/cart/items/$itemId', {'quantity': quantity});

  Future<void> removeCartItem(int itemId) async =>
      await _delete('/cart/items/$itemId');

  Future<void> clearCart() async => await _delete('/cart');

  // ── Orders ───────────────────────────────────────────────────────────────
  Future<List<Order>> getOrders({String? status}) async {
    final data = await _get('/orders',
        {if (status != null) 'status': status}) as List<dynamic>;
    return data.map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Order> getOrder(int id) async =>
      Order.fromJson(await _get('/orders/$id') as Map<String, dynamic>);

  Future<Order> placeOrder(Map<String, dynamic> body) async =>
      Order.fromJson(await _post('/orders', body) as Map<String, dynamic>);

  Future<Order> cancelOrder(int id) async =>
      Order.fromJson(
          await _post('/orders/$id/cancel') as Map<String, dynamic>);

  Future<Map<String, dynamic>> getOrderTracking(int id) async =>
      await _get('/orders/$id/tracking') as Map<String, dynamic>;

  // ── Wallet ───────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> getWallet() async =>
      await _get('/wallet') as Map<String, dynamic>;

  Future<List<Map<String, dynamic>>> getTransactions() async =>
      ((await _get('/wallet/transactions')) as List<dynamic>)
          .cast<Map<String, dynamic>>();

  Future<Map<String, dynamic>> topUpWallet(
      double amount, String paymentMethod) async =>
      await _post('/wallet/topup', {
        'amount': amount,
        'paymentMethod': paymentMethod,
      }) as Map<String, dynamic>;

  // ── Favorites ────────────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> getFavorites() async =>
      ((await _get('/favorites')) as List<dynamic>)
          .cast<Map<String, dynamic>>();

  Future<Map<String, dynamic>> toggleFavorite({
    required String type,
    required int refId,
    String? name,
    String? image,
  }) async =>
      await _post('/favorites/toggle', {
        'type': type,
        'refId': refId,
        if (name != null) 'name': name,
        if (image != null) 'image': image,
      }) as Map<String, dynamic>;

  // ── Notifications ─────────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> getNotifications() async =>
      ((await _get('/notifications')) as List<dynamic>)
          .cast<Map<String, dynamic>>();

  Future<void> markNotificationRead(int notificationId) async =>
      await _post('/notifications/$notificationId/read');
}
