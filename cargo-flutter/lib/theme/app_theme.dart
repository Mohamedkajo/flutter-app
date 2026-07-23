import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

abstract class AppColors {
  static const primary = Color(0xFF5E2D91);
  static const primaryLight = Color(0xFF7B3DB5);
  static const primaryDark = Color(0xFF47206E);
  static const secondary = Color(0xFFF25B57);
  static const accent = Color(0xFFF9A825);
  static const success = Color(0xFF22C55E);
  static const warning = Color(0xFFF59E0B);
  static const error = Color(0xFFEF4444);
  static const info = Color(0xFF3B82F6);
  static const teal = Color(0xFF14B8A6);

  static const surface = Color(0xFFF8F5FC);
  static const card = Color(0xFFFFFFFF);
  static const border = Color(0xFFEDE8F4);
  static const divider = Color(0xFFF0ECF8);

  static const textPrimary = Color(0xFF1A0A2E);
  static const textSecondary = Color(0xFF6B7280);
  static const textMuted = Color(0xFF9CA3AF);
  static const textOnPrimary = Colors.white;

  static const shimmerBase = Color(0xFFEDE8F4);
  static const shimmerHighlight = Color(0xFFF8F5FC);

  static const gradientPrimary = LinearGradient(
    colors: [Color(0xFF5E2D91), Color(0xFF47206E)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const gradientHero = LinearGradient(
    colors: [Color(0xFF5E2D91), Color(0xFF7B3DB5), Color(0xFFF25B57)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    stops: [0.0, 0.6, 1.0],
  );
}

abstract class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 48;
}

abstract class AppRadius {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
  static const double xxl = 32;
  static const double full = 999;
}

ThemeData buildAppTheme() {
  final base = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      primary: AppColors.primary,
      secondary: AppColors.secondary,
      surface: AppColors.surface,
      error: AppColors.error,
      brightness: Brightness.light,
    ),
  );

  return base.copyWith(
    textTheme: GoogleFonts.poppinsTextTheme(base.textTheme).copyWith(
      displayLarge: GoogleFonts.poppins(fontSize: 32, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
      displayMedium: GoogleFonts.poppins(fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
      displaySmall: GoogleFonts.poppins(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
      headlineLarge: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
      headlineMedium: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
      headlineSmall: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
      titleLarge: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
      titleMedium: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
      titleSmall: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
      bodyLarge: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w400, color: AppColors.textPrimary),
      bodyMedium: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textPrimary),
      bodySmall: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w400, color: AppColors.textSecondary),
      labelLarge: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600),
      labelMedium: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w500),
      labelSmall: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.textSecondary),
    ),
    scaffoldBackgroundColor: AppColors.surface,
    appBarTheme: AppBarTheme(
      elevation: 0,
      scrolledUnderElevation: 0,
      backgroundColor: Colors.transparent,
      foregroundColor: AppColors.textPrimary,
      titleTextStyle: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
    ),
    cardTheme: CardTheme(
      elevation: 0,
      color: AppColors.card,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        side: const BorderSide(color: AppColors.border, width: 1),
      ),
      margin: EdgeInsets.zero,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.card,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: const BorderSide(color: AppColors.error),
      ),
      hintStyle: GoogleFonts.poppins(color: AppColors.textMuted, fontSize: 14),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
        textStyle: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        side: const BorderSide(color: AppColors.primary, width: 1.5),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
        textStyle: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.primary,
        textStyle: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600),
      ),
    ),
    chipTheme: ChipThemeData(
      backgroundColor: AppColors.divider,
      selectedColor: AppColors.primary,
      labelStyle: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w500),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.full)),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: Colors.white,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.textMuted,
      type: BottomNavigationBarType.fixed,
      elevation: 0,
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: AppColors.textPrimary,
      contentTextStyle: GoogleFonts.poppins(color: Colors.white, fontSize: 14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
      behavior: SnackBarBehavior.floating,
    ),
    dividerTheme: const DividerThemeData(color: AppColors.divider, thickness: 1, space: 0),
    progressIndicatorTheme: const ProgressIndicatorThemeData(color: AppColors.primary),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: AppColors.primary,
      foregroundColor: Colors.white,
    ),
  );
}
