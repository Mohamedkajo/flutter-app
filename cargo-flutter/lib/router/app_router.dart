import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/search/search_screen.dart';
import '../screens/cart/cart_screen.dart';
import '../screens/orders/orders_screen.dart';
import '../screens/orders/order_detail_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/store/store_listing_screen.dart';
import '../screens/store/store_detail_screen.dart';
import '../screens/product/product_detail_screen.dart';
import '../screens/favorites/favorites_screen.dart';
import '../screens/notifications/notifications_screen.dart';
import '../screens/wallet/wallet_screen.dart';
import '../widgets/app_shell.dart';

final _rootKey = GlobalKey<NavigatorState>();
final _shellKey = GlobalKey<NavigatorState>();

GoRouter buildRouter(AuthProvider auth) => GoRouter(
      navigatorKey: _rootKey,
      initialLocation: '/',
      refreshListenable: auth,
      redirect: (context, state) {
        final isAuth = auth.isAuthenticated;
        final isInit = auth.status != AuthStatus.unknown;
        final loc = state.matchedLocation;

        if (!isInit) return null;
        if (!isAuth && loc != '/login' && loc != '/register') return '/login';
        if (isAuth && (loc == '/login' || loc == '/register')) return '/';
        return null;
      },
      routes: [
        GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
        GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),

        ShellRoute(
          navigatorKey: _shellKey,
          builder: (context, state, child) => AppShell(child: child),
          routes: [
            GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
            GoRoute(path: '/search', builder: (_, __) => const SearchScreen()),
            GoRoute(path: '/cart', builder: (_, __) => const CartScreen()),
            GoRoute(path: '/orders', builder: (_, __) => const OrdersScreen()),
            GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
          ],
        ),

        // Full-screen routes (no bottom nav)
        GoRoute(
          path: '/stores',
          builder: (_, state) => StoreListingScreen(
            filter: state.uri.queryParameters['filter'],
            category: state.uri.queryParameters['category'],
          ),
        ),
        GoRoute(
          path: '/stores/:id',
          builder: (_, state) => StoreDetailScreen(storeId: int.parse(state.pathParameters['id']!)),
        ),
        GoRoute(
          path: '/products/:id',
          builder: (_, state) => ProductDetailScreen(productId: int.parse(state.pathParameters['id']!)),
        ),
        GoRoute(
          path: '/orders/:id',
          builder: (_, state) => OrderDetailScreen(orderId: int.parse(state.pathParameters['id']!)),
        ),
        GoRoute(path: '/favorites', builder: (_, __) => const FavoritesScreen()),
        GoRoute(path: '/notifications', builder: (_, __) => const NotificationsScreen()),
        GoRoute(path: '/wallet', builder: (_, __) => const WalletScreen()),
      ],
    );
