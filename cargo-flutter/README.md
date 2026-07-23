# Cargo Flutter App

A production-quality Flutter mobile app for the **Cargo** delivery marketplace — targeting Android & iOS.

## Features

- 🏠 **Home** — Promo banners, category pills, flash sales, featured stores, trending products
- 🔍 **Search** — Debounced search across products and stores, tabbed results
- 🛒 **Cart** — Quantity controls, delivery address, live order total, place order
- 📦 **Orders** — Active/past tabs, animated status tracker, order detail with timeline
- 👤 **Profile** — Loyalty points, wallet balance, full menu, logout
- 🏪 **Store listing** — Category filter, online/nearby tabs, store cards with real images
- 🛍️ **Store detail** — Banner, logo, info chips, product grid
- 📱 **Product detail** — Image, rating bar, quantity picker, add to cart, favorites
- ❤️ **Favorites** — Save products across sessions
- 🔔 **Notifications** — Grouped by type with timeago formatting
- 💳 **Wallet** — Balance card, quick top-up, transaction history

## Tech Stack

| Layer | Package |
|-------|---------|
| State | `provider` ^6.1.2 |
| Navigation | `go_router` ^14.3.0 |
| HTTP | `http` ^1.2.2 |
| Storage | `shared_preferences` ^2.3.3 |
| Images | `cached_network_image` ^3.4.1 |
| Fonts | `google_fonts` (Poppins) |
| UI extras | `shimmer`, `badges`, `flutter_rating_bar`, `smooth_page_indicator` |
| Utils | `intl`, `timeago`, `url_launcher`, `image_picker` |

## Quick Start

### 1. Prerequisites

- Flutter SDK ≥ 3.3.0 — [flutter.dev/get-started](https://docs.flutter.dev/get-started/install)
- Android Studio + Android SDK (for Android builds)
- Xcode (for iOS builds, macOS only)

Verify: `flutter doctor`

### 2. Clone & install

```bash
git clone https://github.com/Mohamedkajo/flutter-app.git
cd flutter-app
git checkout flutter-redesign
cd cargo-flutter
flutter pub get
```

### 3. Configure API URL

Edit `lib/config/api_config.dart` and replace the `defaultValue`:

```dart
static const String baseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'https://YOUR-REPLIT-APP.replit.app/api', // ← put your URL here
);
```

Or pass it at build time:

```bash
flutter build apk --release \
  --dart-define=API_BASE_URL=https://YOUR-REPLIT-APP.replit.app/api
```

### 4. Run on a connected device

```bash
# List connected devices
flutter devices

# Run in debug mode (hot reload available)
flutter run

# Build release APK
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### 5. Install APK on your phone

**Via USB (recommended):**
```bash
flutter install
```

**Via file transfer:**
1. Copy `build/app/outputs/flutter-apk/app-release.apk` to your phone
2. Open it → Allow "Install from unknown sources" → Install

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@cargo.com | password123 |
| Admin | admin@cargo.com | admin123 |

## Project Structure

```
lib/
├── config/          # API config, constants
├── models/          # Data models (User, Store, Product, Order, Cart…)
├── services/        # ApiService — all HTTP calls
├── providers/       # ChangeNotifier state (Auth, Cart, App)
├── router/          # GoRouter configuration
├── theme/           # AppColors, AppSpacing, AppRadius, ThemeData
├── widgets/         # Shared UI components
│   ├── app_shell.dart       # Bottom navigation shell
│   ├── store_card.dart      # Store card with banner/logo
│   ├── product_card.dart    # Product card (grid + horizontal)
│   ├── section_header.dart  # Section title + action link
│   └── shimmer_loader.dart  # Loading skeleton widgets
└── screens/
    ├── auth/         # Login, Register
    ├── home/         # Home feed
    ├── search/       # Search with tabs
    ├── store/        # Store listing, Store detail
    ├── product/      # Product detail
    ├── cart/         # Cart + checkout
    ├── orders/       # Orders list, Order detail
    ├── profile/      # Profile screen
    ├── favorites/    # Saved products
    ├── notifications/# Notification feed
    └── wallet/       # Balance + top-up + history
```
