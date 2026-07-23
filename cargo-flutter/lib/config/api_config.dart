/// API configuration for Cargo marketplace.
/// Override [baseUrl] via --dart-define=API_BASE_URL=https://your-api.replit.app/api
class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://your-api-domain.replit.app/api',
  );

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);

  static const String tokenKey = 'cargo_token';
  static const String userKey = 'cargo_user';
}
