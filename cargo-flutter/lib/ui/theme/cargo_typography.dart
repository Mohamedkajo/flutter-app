import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'cargo_colors.dart';

/// Cargo typography system using Poppins.
/// All text styles are defined here for consistency.
abstract final class CargoTypography {
  static TextStyle get _base => GoogleFonts.poppins();

  // ── Display ────────────────────────────────────────────────────────────
  static TextStyle get displayLarge  => _base.copyWith(fontSize: 32, fontWeight: FontWeight.w800, color: CargoColors.textPrimary, letterSpacing: -1);
  static TextStyle get displayMedium => _base.copyWith(fontSize: 28, fontWeight: FontWeight.w800, color: CargoColors.textPrimary, letterSpacing: -0.5);
  static TextStyle get displaySmall  => _base.copyWith(fontSize: 24, fontWeight: FontWeight.w700, color: CargoColors.textPrimary);

  // ── Heading ────────────────────────────────────────────────────────────
  static TextStyle get h1 => _base.copyWith(fontSize: 22, fontWeight: FontWeight.w700, color: CargoColors.textPrimary);
  static TextStyle get h2 => _base.copyWith(fontSize: 20, fontWeight: FontWeight.w700, color: CargoColors.textPrimary);
  static TextStyle get h3 => _base.copyWith(fontSize: 18, fontWeight: FontWeight.w700, color: CargoColors.textPrimary);
  static TextStyle get h4 => _base.copyWith(fontSize: 16, fontWeight: FontWeight.w600, color: CargoColors.textPrimary);

  // ── Body ───────────────────────────────────────────────────────────────
  static TextStyle get bodyLarge  => _base.copyWith(fontSize: 16, color: CargoColors.textPrimary);
  static TextStyle get bodyMedium => _base.copyWith(fontSize: 14, color: CargoColors.textPrimary);
  static TextStyle get bodySmall  => _base.copyWith(fontSize: 13, color: CargoColors.textSecondary);

  // ── Label ──────────────────────────────────────────────────────────────
  static TextStyle get labelLarge  => _base.copyWith(fontSize: 13, fontWeight: FontWeight.w600, color: CargoColors.textPrimary);
  static TextStyle get labelMedium => _base.copyWith(fontSize: 12, fontWeight: FontWeight.w600, color: CargoColors.textSecondary);
  static TextStyle get labelSmall  => _base.copyWith(fontSize: 11, fontWeight: FontWeight.w500, color: CargoColors.textMuted);

  // ── Caption & misc ─────────────────────────────────────────────────────
  static TextStyle get caption  => _base.copyWith(fontSize: 11, color: CargoColors.textMuted);
  static TextStyle get overline => _base.copyWith(fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 1.2, color: CargoColors.textMuted);

  // ── Button ─────────────────────────────────────────────────────────────
  static TextStyle get buttonLarge  => _base.copyWith(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white);
  static TextStyle get buttonMedium => _base.copyWith(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white);
  static TextStyle get buttonSmall  => _base.copyWith(fontSize: 12, fontWeight: FontWeight.w600);

  // ── Price ──────────────────────────────────────────────────────────────
  static TextStyle get price      => _base.copyWith(fontSize: 18, fontWeight: FontWeight.w800, color: CargoColors.primary);
  static TextStyle get priceSmall => _base.copyWith(fontSize: 14, fontWeight: FontWeight.w700, color: CargoColors.primary);
}
