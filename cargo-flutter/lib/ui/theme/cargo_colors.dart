import 'package:flutter/material.dart';

/// Cargo brand color palette — single source of truth for all UI colors.
/// Use these constants instead of raw hex values throughout the app.
abstract final class CargoColors {
  // ── Brand ──────────────────────────────────────────────────────────────
  static const Color primary      = Color(0xFF5E2D91);
  static const Color primaryDark  = Color(0xFF47206E);
  static const Color primaryLight = Color(0xFFE8DDF6);

  static const Color coral  = Color(0xFFF25B57);
  static const Color amber  = Color(0xFFF6A623);
  static const Color teal   = Color(0xFF0DB39E);

  // ── Semantic ────────────────────────────────────────────────────────────
  static const Color success     = Color(0xFF22C55E);
  static const Color warning     = Color(0xFFF59E0B);
  static const Color error       = Color(0xFFEF4444);
  static const Color info        = Color(0xFF3B82F6);

  // ── Surface & background ───────────────────────────────────────────────
  static const Color surface     = Color(0xFFF8F8FC);
  static const Color white       = Colors.white;
  static const Color card        = Colors.white;

  // ── Text ───────────────────────────────────────────────────────────────
  static const Color textPrimary   = Color(0xFF1A1A2E);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textMuted     = Color(0xFF9CA3AF);
  static const Color textHint      = Color(0xFFBDBDBD);

  // ── Border & divider ──────────────────────────────────────────────────
  static const Color border  = Color(0xFFE5E7EB);
  static const Color divider = Color(0xFFEBEBF0);

  // ── Gradients ─────────────────────────────────────────────────────────
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF5E2D91), Color(0xFF47206E)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient coralGradient = LinearGradient(
    colors: [Color(0xFFF25B57), Color(0xFFE04E4A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkGradient = LinearGradient(
    colors: [Colors.transparent, Color(0xCC000000)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient initialsGradient = LinearGradient(
    colors: [Color(0xFF5E2D91), Color(0xFFF25B57)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ── Status colors ─────────────────────────────────────────────────────
  static Color statusColor(String status) => switch (status.toLowerCase()) {
    'delivered' || 'completed' => success,
    'cancelled' || 'refunded'  => error,
    'preparing' || 'accepted'  => amber,
    _                          => primary,
  };

  static Color statusBg(String status) => statusColor(status).withOpacity(0.1);
}
