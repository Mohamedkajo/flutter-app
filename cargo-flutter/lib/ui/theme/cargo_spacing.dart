/// Cargo spacing & sizing constants.
/// All layout gaps, paddings, and radii should use these values.
abstract final class CargoSpacing {
  // ── Spacing scale (4-pt base) ──────────────────────────────────────────
  static const double xxs = 2;
  static const double xs  = 4;
  static const double sm  = 8;
  static const double md  = 16;
  static const double lg  = 24;
  static const double xl  = 32;
  static const double xxl = 48;

  /// Standard horizontal screen padding.
  static const double screenH = 20;

  /// Standard vertical page padding (top/bottom).
  static const double screenV = 16;

  // ── Border radii ────────────────────────────────────────────────────────
  static const double radiusXs  = 4;
  static const double radiusSm  = 8;
  static const double radiusMd  = 12;
  static const double radiusLg  = 16;
  static const double radiusXl  = 20;
  static const double radiusXxl = 24;
  static const double radiusMax = 100; // pill shape

  // ── Card / container sizing ─────────────────────────────────────────────
  static const double cardElevation    = 0;
  static const double buttonHeightLg   = 56;
  static const double buttonHeightMd   = 48;
  static const double buttonHeightSm   = 36;
  static const double inputHeight      = 52;
  static const double bottomNavHeight  = 68;
  static const double appBarHeight     = 60;
}
