/// API configuration for Cargo marketplace.
///
/// Dev URL  : https://8469b585-4dc3-4e99-8fe1-8655e1a71500-00-h7jul741nzkb.riker.replit.dev/api
/// Prod URL : https://<your-repl-name>.replit.app/api
///
/// Override at build time:
///   flutter run --dart-define=API_BASE_URL=https://xxx.replit.app/api
class ApiConfig {
  // ── Base URL ──────────────────────────────────────────────────────────────
  static const String devUrl =
      'https://8469b585-4dc3-4e99-8fe1-8655e1a71500-00-h7jul741nzkb.riker.replit.dev/api';

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: devUrl,
  );

  // ── Timeouts ──────────────────────────────────────────────────────────────
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // ── Storage keys ─────────────────────────────────────────────────────────
  static const String tokenKey = 'cargo_token';
  static const String userKey  = 'cargo_user';

  // ── Auth endpoints ────────────────────────────────────────────────────────
  static const String login    = '/auth/login';
  static const String register = '/auth/register';
  static const String profile  = '/users/profile';

  // ── Store endpoints ───────────────────────────────────────────────────────
  static const String stores         = '/stores';
  static const String storesFeatured = '/stores/featured';
  static const String storesNearby   = '/stores/nearby';
  static const String storesOnline   = '/stores/online';
  // /stores/:id
  // /stores/:id/products
  // /stores/:id/categories

  // ── Product endpoints ─────────────────────────────────────────────────────
  static const String products         = '/products';
  static const String productsTrending = '/products/trending';
  // /products/:id

  // ── Category endpoints ────────────────────────────────────────────────────
  static const String categories = '/categories';

  // ── Flash sale endpoints ──────────────────────────────────────────────────
  static const String flashSales = '/flash-sales';

  // ── Cart endpoints ────────────────────────────────────────────────────────
  static const String cart      = '/cart';
  static const String cartItems = '/cart/items';
  // /cart/items/:id

  // ── Order endpoints ───────────────────────────────────────────────────────
  static const String orders = '/orders';
  // /orders/:id
  // /orders/:id/cancel
  // /orders/:id/tracking

  // ── Wallet endpoints ──────────────────────────────────────────────────────
  static const String wallet             = '/wallet';
  static const String walletTransactions = '/wallet/transactions';
  static const String walletTopup        = '/wallet/topup';

  // ── Favorites endpoints ───────────────────────────────────────────────────
  static const String favorites       = '/favorites';
  static const String favoritesToggle = '/favorites/toggle';

  // ── Notification endpoints ────────────────────────────────────────────────
  static const String notifications = '/notifications';
  // /notifications/:id/read

  // ── Address endpoints ─────────────────────────────────────────────────────
  static const String addresses = '/addresses';
  // /addresses/:id
}
