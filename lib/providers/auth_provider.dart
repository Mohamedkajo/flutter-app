import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../config/api_config.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  String? _token;
  bool _isLoading = false;

  User? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null && _user != null;

  final ApiService _api = ApiService();

  Future<void> loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(ApiConfig.tokenKey);
    final userJson = prefs.getString(ApiConfig.userKey);
    if (userJson != null) {
      _user = User.fromJson(jsonDecode(userJson) as Map<String, dynamic>);
    }
    if (_token != null) {
      _api.setToken(_token);
    }
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await _api.login(email, password);
      _token = res['token'] as String?;
      final userData = res['user'] as Map<String, dynamic>?;
      if (userData != null) _user = User.fromJson(userData);
      _api.setToken(_token);
      final prefs = await SharedPreferences.getInstance();
      if (_token != null) await prefs.setString(ApiConfig.tokenKey, _token!);
      if (_user != null) {
        await prefs.setString(ApiConfig.userKey, jsonEncode(_user!.toJson()));
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> register(
      String name, String phone, String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await _api.register(name, phone, email, password);
      _token = res['token'] as String?;
      final userData = res['user'] as Map<String, dynamic>?;
      if (userData != null) _user = User.fromJson(userData);
      _api.setToken(_token);
      final prefs = await SharedPreferences.getInstance();
      if (_token != null) await prefs.setString(ApiConfig.tokenKey, _token!);
      if (_user != null) {
        await prefs.setString(ApiConfig.userKey, jsonEncode(_user!.toJson()));
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    _api.setToken(null);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(ApiConfig.tokenKey);
    await prefs.remove(ApiConfig.userKey);
    notifyListeners();
  }

  Future<void> refreshProfile() async {
    if (_token == null) return;
    try {
      final data = await _api.getProfile();
      _user = User.fromJson(data);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(ApiConfig.userKey, jsonEncode(_user!.toJson()));
      notifyListeners();
    } catch (_) {}
  }
}
