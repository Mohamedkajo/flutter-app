# 🚚 Cargo — Premium Multi-Vendor Delivery Marketplace

<p align="center">
  <img src="screenshots/home.png" width="200" alt="Home Screen"/>
  <img src="screenshots/store.png" width="200" alt="Store Detail"/>
  <img src="screenshots/cart.png" width="200" alt="Cart"/>
  <img src="screenshots/orders.png" width="200" alt="Orders"/>
</p>

> **Cargo** is a production-ready Flutter mobile app for a multi-vendor delivery marketplace targeting the Middle East. It connects customers with restaurants, grocery stores, pharmacies, and fashion retailers — offering real-time order tracking, a built-in wallet, flash sales, and loyalty points.

---

## ✨ Features

| Category | Features |
|---|---|
| 🏪 **Discovery** | Featured stores, nearby, online, categories, flash sales, trending products |
| 🔍 **Search** | Full-text search across stores and products with instant results |
| 🛒 **Cart** | Add/remove items, quantity control, coupon codes, order summary |
| 📦 **Orders** | Place orders, active order tracking, order history, cancel/reorder |
| 🗺️ **Tracking** | Live driver location, step-by-step timeline, ETA |
| 💳 **Wallet** | Balance, top-up via card/cash, transaction history, loyalty points |
| ❤️ **Favourites** | Save stores and products across sessions |
| 🔔 **Notifications** | Order updates, promotions, system alerts with timeago |
| 👤 **Profile** | Edit profile, addresses, preferences, logout |
| 🔐 **Auth** | Secure login & registration, JWT token, auto-login from storage |

---

## 🎨 Design System

Brand palette following the **Cargo** design language:

| Token | Value | Use |
|---|---|---|
| Primary | `#5E2D91` | Buttons, highlights, headers |
| Primary Dark | `#47206E` | Gradients, pressed state |
| Coral | `#F25B57` | Badges, flash sale, CTAs |
| Amber | `#F6A623` | Stars, warnings |
| Teal | `#0DB39E` | Online status, success accents |
| Font | Poppins | All text via google_fonts |

---

## 📁 Folder Structure

```
cargo/
├── lib/
│   ├── main.dart                   # App entry point + providers
│   ├── config/
│   │   └── api_config.dart         # Base URL, timeouts, storage keys
│   ├── models/                     # Data models (fromJson / toJson)
│   │   ├── cart.dart
│   │   ├── category.dart
│   │   ├── order.dart
│   │   ├── product.dart
│   │   ├── store.dart
│   │   └── user.dart
│   ├── providers/                  # ChangeNotifier state management
│   │   ├── app_provider.dart       # Home data (stores, categories, flash sales)
│   │   ├── auth_provider.dart      # Auth state + token persistence
│   │   └── cart_provider.dart      # Cart state + mutations
│   ├── router/
│   │   └── app_router.dart         # go_router with auth redirect + shell
│   ├── services/
│   │   └── api_service.dart        # HTTP client (singleton)
│   ├── theme/
│   │   └── app_theme.dart          # MaterialTheme + AppColors
│   ├── screens/                    # One folder per feature
│   │   ├── auth/                   # Login, Register
│   │   ├── cart/                   # Cart
│   │   ├── categories/             # Category browser (sidebar + store list)
│   │   ├── favorites/              # Saved stores & products
│   │   ├── home/                   # Home feed
│   │   ├── notifications/          # Notification inbox
│   │   ├── orders/                 # Order list + tracking
│   │   ├── product/                # Product detail + add to cart
│   │   ├── profile/                # User profile + settings
│   │   ├── search/                 # Full-text search
│   │   ├── shell/                  # BottomNav shell wrapper
│   │   ├── store/                  # Store list + store detail
│   │   └── wallet/                 # Wallet balance + top-up
│   ├── ui/                         # 📐 Design system & component library
│   │   ├── index.dart              # Barrel export — import everything from here
│   │   ├── theme/
│   │   │   ├── cargo_colors.dart   # Brand palette, gradients, semantic colors
│   │   │   ├── cargo_typography.dart # Poppins text styles
│   │   │   └── cargo_spacing.dart  # Spacing scale + radii constants
│   │   ├── components/
│   │   │   ├── avatars/            # StoreAvatar (initials fallback)
│   │   │   ├── badges/             # StatusBadge, OnlineDot
│   │   │   ├── buttons/            # CargoButton (primary / secondary / text)
│   │   │   ├── cards/              # StoreListCard, ProductCard, OrderCard, NotificationCard
│   │   │   ├── feedback/           # CargoEmptyState, CargoErrorState, SuccessDialog
│   │   │   ├── inputs/             # CargoTextField, CargoSearchBar
│   │   │   └── misc/              # SectionHeader, CargoTag, RatingRow
│   │   ├── animations/
│   │   │   ├── fade_slide_animation.dart  # Staggered list animations
│   │   │   └── shimmer_loader.dart        # Skeleton placeholders
│   │   ├── dialogs/
│   │   │   ├── confirm_dialog.dart         # Generic confirm / alert
│   │   │   ├── coupon_bottom_sheet.dart    # Coupon code input
│   │   │   └── topup_bottom_sheet.dart     # Wallet top-up flow
│   │   ├── forms/
│   │   │   └── address_form.dart           # Address capture form
│   │   └── layouts/
│   │       ├── app_scaffold.dart           # Scaffold + status bar helper
│   │       └── cargo_bottom_sheet.dart     # Draggable modal bottom sheet
│   └── widgets/                    # Legacy widget shims (kept for compatibility)
│       ├── common/
│       ├── flash_sale_banner.dart
│       ├── product_card.dart
│       └── store_card.dart
├── assets/
│   ├── icons/                      # SVG / PNG icons
│   ├── images/                     # Brand images, placeholders
│   └── lottie/                     # Lottie animation JSONs
├── android/                        # Android platform files
├── pubspec.yaml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Min Version |
|---|---|
| Flutter SDK | 3.3.0 |
| Dart SDK | 3.0.0 |
| Android Studio / Xcode | Latest stable |

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/Mohamedkajo/flutter-app.git
cd flutter-app

# 2. Get dependencies
flutter pub get

# 3. Run on a device or emulator
flutter run
```

### Build for Production

```bash
# Android release APK
flutter build apk --release

# Android App Bundle (for Play Store)
flutter build appbundle --release

# iOS (requires macOS + Xcode)
flutter build ios --release
```

---

## ⚙️ Environment Variables

The app reads its API base URL from a Dart-define constant at build time.

| Variable | Default | Description |
|---|---|---|
| `API_BASE_URL` | Replit dev domain | Backend REST API base URL |

**Override during build:**
```bash
flutter run --dart-define=API_BASE_URL=https://api.your-domain.com/api
flutter build apk --dart-define=API_BASE_URL=https://api.your-domain.com/api
```

**Or set it permanently** in `lib/config/api_config.dart`:
```dart
static const String baseUrl = 'https://api.your-domain.com/api';
```

---

## 🔌 Backend API

This Flutter app talks to the **Cargo API Server** (Express + PostgreSQL).

**Endpoints used:**

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/auth/login` | No |
| POST | `/auth/register` | No |
| GET | `/stores` | No |
| GET | `/stores/featured` | No |
| GET | `/stores/nearby` | No |
| GET | `/stores/online` | No |
| GET | `/stores/:id` | No |
| GET | `/stores/:id/products` | No |
| GET | `/categories` | No |
| GET | `/products/trending` | No |
| GET | `/flash-sales` | No |
| GET | `/cart` | ✅ Bearer |
| POST | `/cart/items` | ✅ Bearer |
| PATCH | `/cart/items/:id` | ✅ Bearer |
| DELETE | `/cart/items/:id` | ✅ Bearer |
| GET | `/orders` | ✅ Bearer |
| POST | `/orders` | ✅ Bearer |
| GET | `/orders/:id` | ✅ Bearer |
| GET | `/orders/:id/tracking` | ✅ Bearer |
| GET | `/wallet` | ✅ Bearer |
| POST | `/wallet/topup` | ✅ Bearer |
| GET | `/favorites` | ✅ Bearer |
| POST | `/favorites/toggle` | ✅ Bearer |
| GET | `/notifications` | ✅ Bearer |
| GET | `/users/profile` | ✅ Bearer |
| PATCH | `/users/profile` | ✅ Bearer |

---

## 🧱 State Management

The app uses **Provider** (ChangeNotifier) with three top-level providers:

- **`AuthProvider`** — authentication state, token, user data, persist to SharedPreferences
- **`CartProvider`** — cart items, totals, add/remove/clear
- **`AppProvider`** — home feed data (featured stores, categories, flash sales, trending products)

---

## 🗺️ Navigation

Navigation is handled by **go_router** with:
- Auth redirect (unauthenticated → `/login`)
- `StatefulShellRoute` for persistent bottom navigation (Home / Search / Cart / Orders / Profile)
- Deep links for stores, products, orders, tracking

---

## 🛠️ Key Dependencies

| Package | Purpose |
|---|---|
| `provider ^6.1.2` | State management |
| `go_router ^14.3.0` | Declarative navigation |
| `http ^1.2.2` | API calls |
| `google_fonts ^6.2.1` | Poppins typeface |
| `cached_network_image ^3.4.1` | Image caching with placeholder |
| `shimmer ^3.0.0` | Loading skeleton animations |
| `shared_preferences ^2.3.3` | Token persistence |
| `intl ^0.19.0` | Date / currency formatting |
| `timeago ^3.7.0` | Human-readable timestamps |
| `fl_chart ^0.69.0` | Wallet transaction charts |
| `flutter_rating_bar ^4.0.1` | Star rating display |

---

## 📸 Screenshots

| Home | Store Detail | Cart | Orders |
|---|---|---|---|
| ![Home](screenshots/home.png) | ![Store](screenshots/store.png) | ![Cart](screenshots/cart.png) | ![Orders](screenshots/orders.png) |

| Search | Wallet | Profile | Tracking |
|---|---|---|---|
| ![Search](screenshots/search.png) | ![Wallet](screenshots/wallet.png) | ![Profile](screenshots/profile.png) | ![Tracking](screenshots/tracking.png) |

---

## 📄 License

MIT © 2024 Cargo Marketplace
