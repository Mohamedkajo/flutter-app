import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header
            Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: AppColors.gradientPrimary,
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(32)),
              ),
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
                  child: Column(
                    children: [
                      const Text('My Profile', style: TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w500)),
                      const SizedBox(height: 24),
                      // Avatar
                      Container(
                        width: 88, height: 88,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withOpacity(0.2),
                          border: Border.all(color: Colors.white, width: 3),
                        ),
                        child: user?.avatar != null
                            ? ClipOval(child: Image.network(user!.avatar!, fit: BoxFit.cover))
                            : Center(
                                child: Text(user?.initials ?? 'U',
                                    style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w800)),
                              ),
                      ),
                      const SizedBox(height: 14),
                      Text(user?.name ?? 'Guest', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
                      Text(user?.email ?? '', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14)),
                      const SizedBox(height: 20),
                      // Stats row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _Stat(label: 'Points', value: '${user?.loyaltyPoints ?? 0}', icon: Icons.stars_rounded),
                          Container(width: 1, height: 36, color: Colors.white.withOpacity(0.3)),
                          _Stat(label: 'Wallet', value: '\$${(user?.walletBalance ?? 0).toStringAsFixed(2)}', icon: Icons.account_balance_wallet_rounded),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Menu sections
            _Section(title: 'Account', items: [
              _MenuItem(icon: Icons.person_outline_rounded, label: 'Personal Information', color: AppColors.primary, onTap: () {}),
              _MenuItem(icon: Icons.location_on_outlined, label: 'Saved Addresses', color: AppColors.info, onTap: () {}),
              _MenuItem(icon: Icons.account_balance_wallet_outlined, label: 'Wallet & Payments', color: AppColors.success, onTap: () => context.push('/wallet')),
              _MenuItem(icon: Icons.favorite_border_rounded, label: 'My Favorites', color: AppColors.secondary, onTap: () => context.push('/favorites')),
            ]),

            const SizedBox(height: 16),

            _Section(title: 'Orders', items: [
              _MenuItem(icon: Icons.receipt_long_outlined, label: 'Order History', color: AppColors.primary, onTap: () => context.go('/orders')),
              _MenuItem(icon: Icons.notifications_outlined, label: 'Notifications', color: AppColors.warning, onTap: () => context.push('/notifications')),
            ]),

            const SizedBox(height: 16),

            _Section(title: 'Support', items: [
              _MenuItem(icon: Icons.help_outline_rounded, label: 'Help & Support', color: AppColors.teal, onTap: () {}),
              _MenuItem(icon: Icons.star_outline_rounded, label: 'Rate the App', color: AppColors.accent, onTap: () {}),
              _MenuItem(icon: Icons.info_outline_rounded, label: 'About Cargo', color: AppColors.textSecondary, onTap: () {}),
            ]),

            const SizedBox(height: 16),

            // Logout
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: SizedBox(
                width: double.infinity,
                height: 52,
                child: OutlinedButton.icon(
                  onPressed: () async {
                    final confirm = await showDialog<bool>(
                      context: context,
                      builder: (_) => AlertDialog(
                        title: const Text('Sign Out'),
                        content: const Text('Are you sure you want to sign out?'),
                        actions: [
                          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
                          ElevatedButton(onPressed: () => Navigator.pop(context, true),
                              style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
                              child: const Text('Sign Out')),
                        ],
                      ),
                    );
                    if (confirm == true && context.mounted) context.read<AuthProvider>().logout();
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.error,
                    side: const BorderSide(color: AppColors.error),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
                  ),
                  icon: const Icon(Icons.logout_rounded, size: 20),
                  label: const Text('Sign Out', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                ),
              ),
            ),
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  const _Stat({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) => Column(children: [
        Icon(icon, color: Colors.white70, size: 20),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
        Text(label, style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 12)),
      ]);
}

class _Section extends StatelessWidget {
  final String title;
  final List<_MenuItem> items;
  const _Section({required this.title, required this.items});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.5)),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.lg), border: Border.all(color: AppColors.border)),
              child: Column(
                children: List.generate(items.length * 2 - 1, (i) {
                  if (i.isOdd) return const Divider(height: 1, indent: 56);
                  return items[i ~/ 2];
                }),
              ),
            ),
          ],
        ),
      );
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _MenuItem({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) => ListTile(
        onTap: onTap,
        leading: Container(
          width: 38, height: 38,
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: color, size: 20),
        ),
        title: Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        trailing: const Icon(Icons.chevron_right_rounded, size: 20, color: AppColors.textMuted),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
        minLeadingWidth: 38,
      );
}
