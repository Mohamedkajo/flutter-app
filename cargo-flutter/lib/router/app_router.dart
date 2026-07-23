import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../screens/shell/main_shell.dart';
import '../screens/home/home_screen.dart';
import '../screens/search/search_screen.dart';
import '../screens/store/store_listing_screen.dart';
import '../screens/store/store_detail_screen.dart';
import '../screens/product/product_detail_screen.dart';
import '../screens/cart/cart_screen.dart';
import '../screens/orders/orders_screen.dart';
import '../screens/orders/order_tracking_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/wallet/wallet_screen.dart';
import '../screens/notifications/notifications_screen.dart';
import '../screens/favorites/favorites_screen.dart';
import '../screens/categories/categories_screen.dart';
import '../screens/address/address_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';

final _rootKey   = GlobalKey<NavigatorState>();
final _homeKey   = GlobalKey<NavigatorState>(debugLabel: 'home');
final _searchKey = GlobalKey<NavigatorState>(debugLabel: 'search');
final _cartKey   = GlobalKey<NavigatorState>(debugLabel: 'cart');
final _ordersKey = GlobalKey<NavigatorState>(debugLabel: 'orders');
final _profileKey= GlobalKey<NavigatorState>(debugLabel: 'profile');

class AppRouter {
  static GoRouter router(AuthProvider auth) => GoRouter(
    navigatorKey: _rootKey,
    initialLocation: '/',
    debugLogDiagnostics: false,
    redirect: (ctx, state) {
      final authed = auth.isAuthenticated;
      final onAuth = state.matchedLocation == '/login' ||
                     state.matchedLocation == '/register';
      if (!authed && !onAuth) return '/login';
      if (authed && onAuth) return '/';
      return null;
    },
    refreshListenable: auth,
    routes: [
      // ── Auth (fullscreen, outside shell) ─────────────────────────────
      GoRoute(
        path: '/login',
        parentNavigatorKey: _rootKey,
        builder: (_, __) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        parentNavigatorKey: _rootKey,
        builder: (_, __) => const RegisterScreen(),
      ),

      // ── Fullscreen routes (above shell) ───────────────────────────────
      GoRoute(
        path: '/stores/:storeId',
        parentNavigatorKey: _rootKey,
        builder: (_, s) =>
            StoreDetailScreen(storeId: int.parse(s.pathParameters['storeId']!)),
      ),
      GoRoute(
        path: '/products/:productId',
        parentNavigatorKey: _rootKey,
        builder: (_, s) =>
            ProductDetailScreen(productId: int.parse(s.pathParameters['productId']!)),
      ),
      GoRoute(
        path: '/orders/:orderId/tracking',
        parentNavigatorKey: _rootKey,
        builder: (_, s) =>
            OrderTrackingScreen(orderId: int.parse(s.pathParameters['orderId']!)),
      ),
      GoRoute(
        path: '/wallet',
        parentNavigatorKey: _rootKey,
        builder: (_, __) => const WalletScreen(),
      ),
      GoRoute(
        path: '/notifications',
        parentNavigatorKey: _rootKey,
        builder: (_, __) => const NotificationsScreen(),
      ),
      GoRoute(
        path: '/favorites',
        parentNavigatorKey: _rootKey,
        builder: (_, __) => const FavoritesScreen(),
      ),
      GoRoute(
        path: '/categories',
        parentNavigatorKey: _rootKey,
        builder: (_, __) => const CategoriesScreen(),
      ),
      GoRoute(
        path: '/stores',
        parentNavigatorKey: _rootKey,
        builder: (_, s) => StoreListingScreen(
          filter: s.uri.queryParameters['filter'],
          category: s.uri.queryParameters['category'],
        ),
      ),
      GoRoute(
        path: '/address/new',
        parentNavigatorKey: _rootKey,
        builder: (_, __) => const AddressScreen(),
      ),

      // ── Shell with bottom navigation ──────────────────────────────────
      StatefulShellRoute.indexedStack(
        builder: (_, __, shell) => MainShell(shell: shell),
        branches: [
          StatefulShellBranch(
            navigatorKey: _homeKey,
            routes: [
              GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _searchKey,
            routes: [
              GoRoute(path: '/search', builder: (_, __) => const SearchScreen()),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _cartKey,
            routes: [
              GoRoute(path: '/cart', builder: (_, __) => const CartScreen()),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _ordersKey,
            routes: [
              GoRoute(path: '/orders', builder: (_, __) => const OrdersScreen()),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _profileKey,
            routes: [
              GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
            ],
          ),
        ],
      ),
    ],
  );
}
