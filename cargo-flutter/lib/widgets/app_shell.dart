import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:badges/badges.dart' as badges;
import '../providers/cart_provider.dart';
import '../theme/app_theme.dart';

class AppShell extends StatelessWidget {
  final Widget child;
  const AppShell({super.key, required this.child});

  int _locationToIndex(String loc) {
    if (loc.startsWith('/search')) return 1;
    if (loc.startsWith('/cart')) return 2;
    if (loc.startsWith('/orders')) return 3;
    if (loc.startsWith('/profile')) return 4;
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0: context.go('/'); break;
      case 1: context.go('/search'); break;
      case 2: context.go('/cart'); break;
      case 3: context.go('/orders'); break;
      case 4: context.go('/profile'); break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final loc = GoRouterState.of(context).matchedLocation;
    final current = _locationToIndex(loc);
    final cartCount = context.watch<CartProvider>().itemCount;

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppColors.border, width: 1)),
          boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.06), blurRadius: 20, offset: const Offset(0, -4))],
        ),
        child: SafeArea(
          child: SizedBox(
            height: 60,
            child: Row(
              children: [
                _NavItem(icon: Icons.home_outlined, activeIcon: Icons.home_rounded, label: 'Home', index: 0, current: current, onTap: _onTap),
                _NavItem(icon: Icons.search_outlined, activeIcon: Icons.search_rounded, label: 'Search', index: 1, current: current, onTap: _onTap),
                _CartNavItem(count: cartCount, current: current, onTap: _onTap),
                _NavItem(icon: Icons.receipt_long_outlined, activeIcon: Icons.receipt_long_rounded, label: 'Orders', index: 3, current: current, onTap: _onTap),
                _NavItem(icon: Icons.person_outline_rounded, activeIcon: Icons.person_rounded, label: 'Profile', index: 4, current: current, onTap: _onTap),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final int index;
  final int current;
  final void Function(BuildContext, int) onTap;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.index,
    required this.current,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final active = index == current;
    return Expanded(
      child: InkWell(
        onTap: () => onTap(context, index),
        borderRadius: BorderRadius.circular(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(active ? activeIcon : icon, color: active ? AppColors.primary : AppColors.textMuted, size: 24),
            const SizedBox(height: 2),
            Text(label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: active ? FontWeight.w600 : FontWeight.w400,
                  color: active ? AppColors.primary : AppColors.textMuted,
                )),
          ],
        ),
      ),
    );
  }
}

class _CartNavItem extends StatelessWidget {
  final int count;
  final int current;
  final void Function(BuildContext, int) onTap;
  const _CartNavItem({required this.count, required this.current, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final active = current == 2;
    return Expanded(
      child: InkWell(
        onTap: () => onTap(context, 2),
        borderRadius: BorderRadius.circular(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            badges.Badge(
              showBadge: count > 0,
              badgeContent: Text('$count', style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700)),
              badgeStyle: const badges.BadgeStyle(badgeColor: AppColors.secondary, padding: EdgeInsets.all(4)),
              child: Icon(
                active ? Icons.shopping_bag_rounded : Icons.shopping_bag_outlined,
                color: active ? AppColors.primary : AppColors.textMuted,
                size: 24,
              ),
            ),
            const SizedBox(height: 2),
            Text('Cart',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: active ? FontWeight.w600 : FontWeight.w400,
                  color: active ? AppColors.primary : AppColors.textMuted,
                )),
          ],
        ),
      ),
    );
  }
}
