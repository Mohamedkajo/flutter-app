import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _form = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _obscure = true;
  bool _loading = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    setState(() => _loading = true);
    final auth = context.read<AuthProvider>();
    final ok = await auth.register(_nameCtrl.text.trim(), _emailCtrl.text.trim(), _passCtrl.text);
    if (!mounted) return;
    setState(() => _loading = false);
    if (!ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.error ?? 'Registration failed'), backgroundColor: AppColors.error),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Form(
            key: _form,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                GestureDetector(
                  onTap: () => context.go('/login'),
                  child: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 32),
                Text('Create account ✨', style: Theme.of(context).textTheme.displaySmall),
                const SizedBox(height: 8),
                Text('Join thousands of happy shoppers', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)),
                const SizedBox(height: 36),

                _field(label: 'Full name', ctrl: _nameCtrl, hint: 'Ahmed Mohamed',
                    icon: Icons.person_outline_rounded, action: TextInputAction.next,
                    validator: (v) => (v == null || v.trim().length < 2) ? 'Enter your full name' : null),
                const SizedBox(height: 20),

                _field(label: 'Email address', ctrl: _emailCtrl, hint: 'you@example.com',
                    icon: Icons.email_outlined, type: TextInputType.emailAddress, action: TextInputAction.next,
                    validator: (v) {
                      if (v == null || v.isEmpty) return 'Email is required';
                      if (!v.contains('@')) return 'Enter a valid email';
                      return null;
                    }),
                const SizedBox(height: 20),

                _field(label: 'Password', ctrl: _passCtrl, hint: '••••••••',
                    icon: Icons.lock_outline_rounded, obscure: _obscure, action: TextInputAction.next,
                    suffixIcon: IconButton(
                      icon: Icon(_obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 20, color: AppColors.textMuted),
                      onPressed: () => setState(() => _obscure = !_obscure),
                    ),
                    validator: (v) => (v == null || v.length < 6) ? 'Password must be at least 6 characters' : null),
                const SizedBox(height: 20),

                _field(label: 'Confirm password', ctrl: _confirmCtrl, hint: '••••••••',
                    icon: Icons.lock_outline_rounded, obscure: true, action: TextInputAction.done,
                    validator: (v) => v != _passCtrl.text ? 'Passwords do not match' : null),
                const SizedBox(height: 32),

                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    child: _loading
                        ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                        : const Text('Create Account'),
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Already have an account? ', style: TextStyle(color: AppColors.textSecondary)),
                    GestureDetector(
                      onTap: () => context.go('/login'),
                      child: const Text('Sign In', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _field({
    required String label,
    required TextEditingController ctrl,
    required String hint,
    required IconData icon,
    TextInputType type = TextInputType.text,
    TextInputAction action = TextInputAction.next,
    bool obscure = false,
    Widget? suffixIcon,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
        const SizedBox(height: 8),
        TextFormField(
          controller: ctrl,
          keyboardType: type,
          textInputAction: action,
          obscureText: obscure,
          decoration: InputDecoration(hintText: hint, prefixIcon: Icon(icon, size: 20, color: AppColors.textMuted), suffixIcon: suffixIcon),
          validator: validator,
        ),
      ],
    );
  }
}
