import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// ─── Colors ──────────────────────────────────────────
class AppColors {
  // Base colors
  static const background = Color(0xFF050505);
  static const cardDark = Color(0xFF0F0F0F);
  static const surface = Color(0xFF1A1A1A);
  static const surfaceLight = Color(0xFF242424);

  // Text colors
  static const textPrimary = Color(0xFFF5F5F5);
  static const textSecondary = Color(0xFFAAAAAA);
  static const textMuted = Color(0xFF666666);

  // Border colors
  static const border = Color(0xFF2A2A2A);
  static const borderLight = Color(0xFF3A3A3A);

  // Status colors
  static const success = Color(0xFF10B981);
  static const successLight = Color(0xFF34D399);
  static const warning = Color(0xFFF59E0B);
  static const warningLight = Color(0xFFFBBF24);
  static const danger = Color(0xFFEF4444);
  static const dangerLight = Color(0xFFF87171);

  // Brand gradient colors
  static const brandPrimary = Color(0xFF8B5CF6); // Violet
  static const brandSecondary = Color(0xFF06B6D4); // Cyan
  static const brand = Color(0xFF8B5CF6);

  // Gradient definitions
  static const brandGradient = LinearGradient(
    colors: [brandPrimary, brandSecondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const successGradient = LinearGradient(
    colors: [Color(0xFF059669), Color(0xFF10B981)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const dangerGradient = LinearGradient(
    colors: [Color(0xFFDC2626), Color(0xFFEF4444)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Glass effect colors
  static Color glassBackground = Colors.white.withOpacity(0.05);
  static Color glassBorder = Colors.white.withOpacity(0.1);
}

// ─── Shadows ──────────────────────────────────────────
class AppShadows {
  static List<BoxShadow> glow(Color color,
      {double blur = 20, double spread = 0}) {
    return [
      BoxShadow(
        color: color.withOpacity(0.3),
        blurRadius: blur,
        spreadRadius: spread,
      ),
    ];
  }

  static List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.2),
      blurRadius: 10,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> elevatedShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.3),
      blurRadius: 20,
      offset: const Offset(0, 8),
    ),
  ];
}

// ─── Glass Card Decoration ───────────────────────────
BoxDecoration glassDecoration({
  double borderRadius = 16,
  Color? borderColor,
  Color? backgroundColor,
}) {
  return BoxDecoration(
    color: backgroundColor ?? AppColors.glassBackground,
    borderRadius: BorderRadius.circular(borderRadius),
    border: Border.all(
      color: borderColor ?? AppColors.glassBorder,
      width: 1,
    ),
  );
}

BoxDecoration gradientDecoration({
  required Gradient gradient,
  double borderRadius = 16,
  List<BoxShadow>? boxShadow,
}) {
  return BoxDecoration(
    gradient: gradient,
    borderRadius: BorderRadius.circular(borderRadius),
    boxShadow: boxShadow,
  );
}

final gymTheme = ThemeData(
  brightness: Brightness.dark,
  scaffoldBackgroundColor: AppColors.background,
  colorScheme: const ColorScheme.dark(
    primary: AppColors.brandPrimary,
    secondary: AppColors.brandSecondary,
    surface: AppColors.cardDark,
    onSurface: AppColors.textPrimary,
    error: AppColors.danger,
  ),
  textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
    displayLarge: GoogleFonts.inter(fontWeight: FontWeight.w700),
    displayMedium: GoogleFonts.inter(fontWeight: FontWeight.w700),
    displaySmall: GoogleFonts.inter(fontWeight: FontWeight.w600),
    headlineLarge: GoogleFonts.inter(fontWeight: FontWeight.w600),
    headlineMedium: GoogleFonts.inter(fontWeight: FontWeight.w600),
    headlineSmall: GoogleFonts.inter(fontWeight: FontWeight.w600),
    titleLarge: GoogleFonts.inter(fontWeight: FontWeight.w600),
    titleMedium: GoogleFonts.inter(fontWeight: FontWeight.w500),
    titleSmall: GoogleFonts.inter(fontWeight: FontWeight.w500),
    bodyLarge: GoogleFonts.inter(),
    bodyMedium: GoogleFonts.inter(),
    bodySmall: GoogleFonts.inter(),
    labelLarge: GoogleFonts.inter(fontWeight: FontWeight.w600),
  ),
  cardTheme: CardThemeData(
    color: AppColors.cardDark,
    elevation: 0,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(20),
      side: const BorderSide(color: AppColors.border, width: 1),
    ),
  ),
  appBarTheme: AppBarTheme(
    backgroundColor: Colors.transparent,
    elevation: 0,
    scrolledUnderElevation: 0,
    centerTitle: false,
    titleTextStyle: GoogleFonts.inter(
      fontSize: 22,
      fontWeight: FontWeight.w700,
      color: AppColors.textPrimary,
    ),
  ),
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: AppColors.surface,
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: const BorderSide(color: AppColors.border),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: const BorderSide(color: AppColors.border),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: const BorderSide(color: AppColors.brandPrimary, width: 2),
    ),
    contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
    hintStyle: GoogleFonts.inter(color: AppColors.textMuted, fontSize: 14),
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: AppColors.brandPrimary,
      foregroundColor: Colors.white,
      minimumSize: const Size(double.infinity, 52),
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      textStyle: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600),
    ),
  ),
  outlinedButtonTheme: OutlinedButtonThemeData(
    style: OutlinedButton.styleFrom(
      foregroundColor: AppColors.textPrimary,
      minimumSize: const Size(double.infinity, 52),
      side: const BorderSide(color: AppColors.border),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      textStyle: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600),
    ),
  ),
  dividerTheme: const DividerThemeData(color: AppColors.border, thickness: 0.5),
  bottomNavigationBarTheme: BottomNavigationBarThemeData(
    backgroundColor: AppColors.cardDark,
    selectedItemColor: AppColors.brandPrimary,
    unselectedItemColor: AppColors.textMuted,
    type: BottomNavigationBarType.fixed,
    elevation: 0,
    selectedLabelStyle:
        GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600),
    unselectedLabelStyle:
        GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w500),
  ),
  snackBarTheme: SnackBarThemeData(
    backgroundColor: AppColors.surface,
    contentTextStyle: GoogleFonts.inter(color: AppColors.textPrimary),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    behavior: SnackBarBehavior.floating,
  ),
);
