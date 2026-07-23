import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});
  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  Map<String, dynamic>? _wallet;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _wallet = await ApiService.instance.getWallet();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showTopUp() {
    final ctrl = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Top Up Wallet', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
          const SizedBox(height: 16),
          const Text('Quick amounts:', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          Wrap(spacing: 8, children: [10, 25, 50, 100].map((amt) => GestureDetector(
            onTap: () => ctrl.text = '$amt',
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.08),
                borderRadius: BorderRadius.circular(AppRadius.full),
                border: Border.all(color: AppColors.primary.withOpacity(0.2)),
              ),
              child: Text('\$$amt', style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.primary)),
            ),
          )).toList()),
          const SizedBox(height: 16),
          TextField(
            controller: ctrl,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(
              hintText: 'Custom amount',
              prefixText: '\$ ',
              prefixIcon: Icon(Icons.attach_money_rounded, color: AppColors.primary),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity, height: 52,
            child: ElevatedButton(
              onPressed: () async {
                final amount = double.tryParse(ctrl.text);
                if (amount == null || amount <= 0) return;
                Navigator.pop(ctx);
                try {
                  await ApiService.instance.topUpWallet(amount);
                  await _load();
                  if (mounted) ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('\$${amount.toStringAsFixed(2)} added to wallet!'), backgroundColor: AppColors.success),
                  );
                } catch (e) {
                  if (mounted) ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.toString()), backgroundColor: AppColors.error),
                  );
                }
              },
              child: const Text('Top Up'),
            ),
          ),
        ]),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final balance = (_wallet?['balance'] as num?)?.toDouble() ?? 0;
    final transactions = (_wallet?['transactions'] as List<dynamic>?) ?? [];

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 220,
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            leading: const BackButton(),
            actions: [
              IconButton(icon: const Icon(Icons.refresh_rounded), onPressed: _load),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(gradient: AppColors.gradientHero),
                child: SafeArea(
                  child: _loading
                      ? const Center(child: CircularProgressIndicator(color: Colors.white))
                      : Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                          const SizedBox(height: 40),
                          const Text('Available Balance', style: TextStyle(color: Colors.white70, fontSize: 14)),
                          const SizedBox(height: 8),
                          Text('\$${balance.toStringAsFixed(2)}',
                              style: const TextStyle(color: Colors.white, fontSize: 42, fontWeight: FontWeight.w800)),
                          const SizedBox(height: 20),
                          ElevatedButton.icon(
                            onPressed: _showTopUp,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: AppColors.primary,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.full)),
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                            ),
                            icon: const Icon(Icons.add_rounded),
                            label: const Text('Top Up', style: TextStyle(fontWeight: FontWeight.w700)),
                          ),
                        ]),
                ),
              ),
            ),
          ),

          // Transactions
          SliverToBoxAdapter(child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
            child: const Text('Transaction History', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          )),

          if (transactions.isEmpty)
            const SliverToBoxAdapter(child: Padding(
              padding: EdgeInsets.all(32),
              child: Center(child: Text('No transactions yet', style: TextStyle(color: AppColors.textSecondary))),
            ))
          else
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (_, i) {
                  final tx = transactions[i] as Map<String, dynamic>;
                  final isCredit = (tx['type'] as String?) == 'credit' || (tx['amount'] as num? ?? 0) > 0;
                  final amount = (tx['amount'] as num?)?.toDouble() ?? 0;
                  final date = tx['createdAt'] != null ? DateTime.tryParse(tx['createdAt'].toString()) : null;
                  return Container(
                    margin: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(children: [
                      Container(
                        width: 42, height: 42,
                        decoration: BoxDecoration(
                          color: isCredit ? AppColors.success.withOpacity(0.1) : AppColors.error.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(isCredit ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
                            color: isCredit ? AppColors.success : AppColors.error, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(tx['description'] as String? ?? (isCredit ? 'Top Up' : 'Payment'),
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        if (date != null)
                          Text(DateFormat('MMM d, y').format(date), style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                      ])),
                      Text('${isCredit ? "+" : "-"}\$${amount.abs().toStringAsFixed(2)}',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: isCredit ? AppColors.success : AppColors.error)),
                    ]),
                  );
                },
                childCount: transactions.length,
              ),
            ),
          const SliverToBoxAdapter(child: SizedBox(height: 40)),
        ],
      ),
    );
  }
}
