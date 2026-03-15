import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// ─── Colors ──────────────────────────────────────────
class AppColors {
  static const background = Color(0xFF0F0F0F);
  static const cardDark = Color(0xFF1A1A1A);
  static const surface = Color(0xFF222222);
  static const textPrimary = Color(0xFFF5F5F5);
  static const textSecondary = Color(0xFF999999);
  static const textMuted = Color(0xFF666666);
  static const border = Color(0xFF333333);
  static const success = Color(0xFF22C55E);
  static const warning = Color(0xFFF59E0B);
  static const danger = Color(0xFFEF4444);
  // Brand color — overridden per gym from API
  static const brand = Color(0xFF6366F1);
}

final gymTheme = ThemeData(
  brightness: Brightness.dark,
  scaffoldBackgroundColor: AppColors.background,
  colorScheme: const ColorScheme.dark(
    primary: AppColors.brand,
    surface: AppColors.cardDark,
    onSurface: AppColors.textPrimary,
    error: AppColors.danger,
  ),
  textTheme: GoogleFonts.dmSansTextTheme(ThemeData.dark().textTheme),
  cardTheme: CardTheme(
    color: AppColors.cardDark,
    elevation: 0,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
  ),
  appBarTheme: AppBarTheme(
    backgroundColor: AppColors.background,
    elevation: 0,
    centerTitle: false,
    titleTextStyle: GoogleFonts.dmSans(
      fontSize: 20,
      fontWeight: FontWeight.w700,
      color: AppColors.textPrimary,
    ),
  ),
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: AppColors.cardDark,
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AppColors.border),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AppColors.border),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AppColors.brand, width: 2),
    ),
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    hintStyle: GoogleFonts.dmSans(color: AppColors.textMuted, fontSize: 14),
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: AppColors.brand,
      foregroundColor: Colors.white,
      minimumSize: const Size(double.infinity, 48),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      textStyle: GoogleFonts.dmSans(fontSize: 16, fontWeight: FontWeight.w600),
    ),
  ),
  dividerTheme: const DividerThemeData(color: AppColors.border, thickness: 0.5),
  bottomNavigationBarTheme: const BottomNavigationBarThemeData(
    backgroundColor: AppColors.cardDark,
    selectedItemColor: AppColors.brand,
    unselectedItemColor: AppColors.textMuted,
    type: BottomNavigationBarType.fixed,
    elevation: 0,
  ),
);
