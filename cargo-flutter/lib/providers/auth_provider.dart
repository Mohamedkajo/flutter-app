import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/user.dart';
import '../services/api_service.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthProvider extends ChangeNotifier {
  AuthStatus _status = AuthStatus.unknown;
  User? _user;
  String? _error;

  AuthStatus get status => _status;
  User? get user => _user;
  String? get error => _error;
  bool get isAuthenticated => _status == AuthStatus.authenticated;
  bool get isLoading => _status == AuthStatus.unknown;

  AuthProvider() {
    _tryAutoLogin();
  }

  Future<void> _tryAutoLogin() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(ApiConfig.tokenKey);
      final userJson = prefs.getString(ApiConfig.userKey);

      if (token == null) {
        _status = AuthStatus.unauthenticated;
        notifyListeners();
        return;
      }

      await ApiService.instance.setToken(token);

      if (userJson != null) {
        _user = User.fromJson(jsonDecode(userJson) as Map<String, dynamic>);
        _status = AuthStatus.authenticated;
        notifyListeners();
      }

      // Refresh profile in background
      try {
        _user = await ApiService.instance.getProfile();
        await _saveUser(_user!);
        _status = AuthStatus.authenticated;
      } catch (_) {
        if (_user == null) {
          _status = AuthStatus.unauthenticated;
          await ApiService.instance.clearToken();
        }
      }
    } catch (_) {
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _error = null;
    try {
      final data = await ApiService.instance.login(email, password);
      final token = data['token'] as String?;
      final userData = data['user'] as Map<String, dynamic>?;

      if (token == null) {
        _error = 'Invalid response from server';
        notifyListeners();
        return false;
      }

      await ApiService.instance.setToken(token);
      _user = userData != null ? User.fromJson(userData) : await ApiService.instance.getProfile();
      await _saveUser(_user!);
      _status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    } catch (_) {
      _error = 'Something went wrong. Please try again.';
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String name, String email, String password) async {
    _error = null;
    try {
      final data = await ApiService.instance.register(name, email, password);
      final token = data['token'] as String?;
      final userData = data['user'] as Map<String, dynamic>?;

      if (token != null) {
        await ApiService.instance.setToken(token);
        _user = userData != null ? User.fromJson(userData) : await ApiService.instance.getProfile();
        await _saveUser(_user!);
        _status = AuthStatus.authenticated;
        notifyListeners();
        return true;
      }
      _error = 'Registration failed';
      notifyListeners();
      return false;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    } catch (_) {
      _error = 'Something went wrong. Please try again.';
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await ApiService.instance.clearToken();
    _user = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  Future<void> refreshUser() async {
    try {
      _user = await ApiService.instance.getProfile();
      await _saveUser(_user!);
      notifyListeners();
    } catch (_) {}
  }

  Future<void> _saveUser(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(ApiConfig.userKey, jsonEncode(user.toJson()));
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
