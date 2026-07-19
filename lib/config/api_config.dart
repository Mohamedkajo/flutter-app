/// API configuration for Cargo marketplace.
/// Set [baseUrl] to your deployed backend URL in production.
/// During development on Replit, this points to the dev domain.
class ApiConfig {
  /// Base URL for all API calls. Override via --dart-define=API_BASE_URL=...
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://8469b585-4dc3-4e99-8fe1-8655e1a71500-00-h7jul741nzkb.riker.replit.dev/api',
  );

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);

  static const String tokenKey  = 'cargo_token';
  static const String userKey   = 'cargo_user';
}
