import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:badges/badges.dart' as badges;
import '../../providers/cart_provider.dart';
import '../../theme/app_theme.dart';

class MainShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const MainShell({super.key, required this.navigationShell});

  void _onTap(BuildContext ctx, int index) {
    if (index == navigationShell.currentIndex) {
      navigationShell.goBranch(index, initialLocation: true);
    } else {
      navigationShell.goBranch(index);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final current = navigationShell.currentIndex;

    return Scaffold(
      body: navigationShell,
      extendBody: true,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.08),
              blurRadius: 24,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 64,
            child: Row(
              children: [
                _NavItem(
                  index: 0,
                  current: current,
                  icon: Icons.home_outlined,
                  activeIcon: Icons.home_rounded,
                  label: 'Home',
                  onTap: () => _onTap(context, 0),
                ),
                _NavItem(
                  index: 1,
                  current: current,
                  icon: Icons.search_rounded,
                  activeIcon: Icons.search_rounded,
                  label: 'Search',
                  onTap: () => _onTap(context, 1),
                ),
                // Raised cart button
                Expanded(
                  child: GestureDetector(
                    onTap: () => _onTap(context, 2),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Transform.translate(
                          offset: const Offset(0, -10),
                          child: badges.Badge(
                            showBadge: cart.itemCount > 0,
                            position: badges.BadgePosition.topEnd(top: -4, end: -4),
                            badgeStyle: const badges.BadgeStyle(
                              badgeColor: AppColors.secondary,
                              padding: EdgeInsets.all(5),
                            ),
                            badgeContent: Text(
                              '${cart.itemCount}',
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700),
                            ),
                            child: Container(
                              width: 54,
                              height: 54,
                              decoration: const BoxDecoration(
                                gradient: AppColors.gradientPrimary,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Color(0x445E2D91),
                                    blurRadius: 12,
                                    offset: Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: const Icon(
                                Icons.shopping_bag_outlined,
                                color: Colors.white,
                                size: 26,
                              ),
                            ),
                          ),
                        ),
                        Transform.translate(
                          offset: const Offset(0, -6),
                          child: Text(
                            'Cart',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: current == 2
                                  ? AppColors.primary
                                  : AppColors.textMuted,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                _NavItem(
                  index: 3,
                  current: current,
                  icon: Icons.receipt_long_outlined,
                  activeIcon: Icons.receipt_long_rounded,
                  label: 'Orders',
                  onTap: () => _onTap(context, 3),
                ),
                _NavItem(
                  index: 4,
                  current: current,
                  icon: Icons.person_outline_rounded,
                  activeIcon: Icons.person_rounded,
                  label: 'Profile',
                  onTap: () => _onTap(context, 4),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final int index;
  final int current;
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final VoidCallback onTap;

  const _NavItem({
    required this.index,
    required this.current,
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = current == index;
    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              child: Icon(
                isActive ? activeIcon : icon,
                key: ValueKey(isActive),
                color: isActive ? AppColors.primary : AppColors.textMuted,
                size: 24,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                color: isActive ? AppColors.primary : AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
