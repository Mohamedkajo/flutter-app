/// API configuration for Cargo marketplace.
/// Set [baseUrl] to your deployed backend URL in production.
/// During development, override via --dart-define=API_BASE_URL=https://your-dev-url/api
class ApiConfig {
  /// Base URL for all API calls. Override via --dart-define=API_BASE_URL=...
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://your-api-domain.replit.dev/api',
  );

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);

  static const String tokenKey  = 'cargo_token';
  static const String userKey   = 'cargo_user';
}
