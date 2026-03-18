import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

// ─── Design System Colors ─────────────────────────────────
// Aligned to GymOS mobile spec — dark only theme
class AppColors {
  // Backgrounds
  static const background = Color(0xFF0F0F0F);
  static const surface = Color(0xFF1A1A1A);
  static const surfaceElevated = Color(0xFF222222);
  static const surfaceOverlay = Color(0xFF2A2A2A);
  static const navBackground = Color(0xFF111111);

  // Text
  static const textPrimary = Color(0xFFF5F5F0);
  static const textSecondary = Color(0xFF888888);
  static const textMuted = Color(0xFF555555);
  static const textDisabled = Color(0xFF3A3A3A);

  // Borders
  static final border = Colors.white.withOpacity(0.08);
  static final borderStrong = Colors.white.withOpacity(0.15);
  static final divider = Colors.white.withOpacity(0.06);

  // Status
  static const success = Color(0xFF22C55E);
  static final successBg = const Color(0xFF22C55E).withOpacity(0.12);
  static const warning = Color(0xFFF59E0B);
  static final warningBg = const Color(0xFFF59E0B).withOpacity(0.12);
  static const error = Color(0xFFEF4444);
  static final errorBg = const Color(0xFFEF4444).withOpacity(0.12);

  // Overlay
  static final overlayModal = Colors.black.withOpacity(0.75);

  // Brand — overridden per gym from API
  static const brand = Color(0xFF6366F1);
}

// ─── Typography Scale ──────────────────────────────────────
// DM Sans — all sizes per design system
class AppTypography {
  static TextStyle display = GoogleFonts.dmSans(
    fontSize: 28,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
    height: 1.2,
  );

  static TextStyle heading = GoogleFonts.dmSans(
    fontSize: 22,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
    height: 1.2,
  );

  static TextStyle subheading = GoogleFonts.dmSans(
    fontSize: 18,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
    height: 1.3,
  );

  static TextStyle bodyLarge = GoogleFonts.dmSans(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: AppColors.textPrimary,
    height: 1.5,
  );

  static TextStyle body = GoogleFonts.dmSans(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textPrimary,
    height: 1.5,
  );

  static TextStyle caption = GoogleFonts.dmSans(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
    height: 1.4,
  );

  static TextStyle overline = GoogleFonts.dmSans(
    fontSize: 11,
    fontWeight: FontWeight.w500,
    color: AppColors.textSecondary,
    letterSpacing: 0.8,
    height: 1.4,
  );
}

// ─── Spacing Constants ─────────────────────────────────────
class AppSpacing {
  static const double screenHorizontal = 16;
  static const double betweenCards = 12;
  static const double betweenSections = 24;
  static const double cardPadding = 16;
  static const double listItemHeight = 64;
  static const double bottomNavHeight = 64;
}

// ─── Theme ─────────────────────────────────────────────────
final gymTheme = ThemeData(
  brightness: Brightness.dark,
  scaffoldBackgroundColor: AppColors.background,
  colorScheme: const ColorScheme.dark(
    primary: AppColors.brand,
    surface: AppColors.surface,
    onSurface: AppColors.textPrimary,
    error: AppColors.error,
  ),

  // Typography — DM Sans everywhere
  textTheme: GoogleFonts.dmSansTextTheme(ThemeData.dark().textTheme).copyWith(
    headlineLarge: AppTypography.display,
    headlineMedium: AppTypography.heading,
    headlineSmall: AppTypography.subheading,
    bodyLarge: AppTypography.bodyLarge,
    bodyMedium: AppTypography.body,
    bodySmall: AppTypography.caption,
    labelSmall: AppTypography.overline,
  ),

  // Cards — 16px radius, no shadow, surface bg
  cardTheme: CardTheme(
    color: AppColors.surface,
    elevation: 0,
    margin: EdgeInsets.zero,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(16),
      side: BorderSide(color: Colors.white.withOpacity(0.07)),
    ),
  ),

  // AppBar — background matches scaffold, no elevation
  appBarTheme: AppBarTheme(
    backgroundColor: AppColors.background,
    elevation: 0,
    scrolledUnderElevation: 0,
    centerTitle: false,
    systemOverlayStyle: SystemUiOverlayStyle.light,
    titleTextStyle: GoogleFonts.dmSans(
      fontSize: 22,
      fontWeight: FontWeight.w500,
      color: AppColors.textPrimary,
    ),
    iconTheme: const IconThemeData(
      color: AppColors.textPrimary,
      size: 24,
    ),
  ),

  // Inputs — filled, surface bg, brand focus ring
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: AppColors.surface,
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AppColors.brand, width: 2),
    ),
    errorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AppColors.error),
    ),
    focusedErrorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AppColors.error, width: 2),
    ),
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    hintStyle: GoogleFonts.dmSans(color: AppColors.textMuted, fontSize: 14),
    labelStyle: GoogleFonts.dmSans(
      color: AppColors.textSecondary,
      fontSize: 14,
      fontWeight: FontWeight.w400,
    ),
    errorStyle: GoogleFonts.dmSans(color: AppColors.error, fontSize: 12),
  ),

  // Primary buttons — 52px height, 12px radius, brand bg, weight 500
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: AppColors.brand,
      foregroundColor: Colors.white,
      disabledBackgroundColor: AppColors.brand.withOpacity(0.4),
      disabledForegroundColor: Colors.white.withOpacity(0.4),
      minimumSize: const Size(double.infinity, 52),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      textStyle: GoogleFonts.dmSans(fontSize: 16, fontWeight: FontWeight.w500),
      elevation: 0,
      splashFactory: InkRipple.splashFactory,
    ),
  ),

  // Outlined buttons — secondary variant
  outlinedButtonTheme: OutlinedButtonThemeData(
    style: OutlinedButton.styleFrom(
      foregroundColor: AppColors.textPrimary,
      minimumSize: const Size(double.infinity, 52),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      side: BorderSide(color: Colors.white.withOpacity(0.12)),
      textStyle: GoogleFonts.dmSans(fontSize: 16, fontWeight: FontWeight.w500),
    ),
  ),

  // Text buttons — ghost variant
  textButtonTheme: TextButtonThemeData(
    style: TextButton.styleFrom(
      foregroundColor: AppColors.brand,
      minimumSize: const Size(48, 48),
      textStyle: GoogleFonts.dmSans(fontSize: 14, fontWeight: FontWeight.w500),
    ),
  ),

  // Dividers
  dividerTheme: DividerThemeData(
    color: Colors.white.withOpacity(0.06),
    thickness: 1,
    space: 0,
  ),

  // Bottom Navigation — #111111 bg, 64px, brand active, #555555 inactive
  bottomNavigationBarTheme: const BottomNavigationBarThemeData(
    backgroundColor: AppColors.navBackground,
    selectedItemColor: AppColors.brand,
    unselectedItemColor: AppColors.textMuted,
    type: BottomNavigationBarType.fixed,
    elevation: 0,
    selectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
    unselectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w400),
    showUnselectedLabels: true,
    showSelectedLabels: true,
  ),

  // Bottom Sheet — 20px top corners, surface bg
  bottomSheetTheme: const BottomSheetThemeData(
    backgroundColor: AppColors.surface,
    elevation: 0,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    dragHandleColor: Color(0xFF3A3A3A),
    dragHandleSize: Size(36, 4),
    showDragHandle: true,
  ),

  // Dialog — avoid using, prefer bottom sheets on mobile
  dialogTheme: DialogTheme(
    backgroundColor: AppColors.surface,
    elevation: 0,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    titleTextStyle: GoogleFonts.dmSans(
      fontSize: 18,
      fontWeight: FontWeight.w500,
      color: AppColors.textPrimary,
    ),
    contentTextStyle: GoogleFonts.dmSans(
      fontSize: 14,
      fontWeight: FontWeight.w400,
      color: AppColors.textSecondary,
    ),
  ),

  // Snackbar
  snackBarTheme: SnackBarThemeData(
    backgroundColor: AppColors.surfaceElevated,
    contentTextStyle: GoogleFonts.dmSans(
      fontSize: 14,
      color: AppColors.textPrimary,
    ),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    behavior: SnackBarBehavior.floating,
    elevation: 0,
  ),

  // Chips
  chipTheme: ChipThemeData(
    backgroundColor: AppColors.surface,
    selectedColor: AppColors.brand.withOpacity(0.12),
    labelStyle: GoogleFonts.dmSans(fontSize: 13, fontWeight: FontWeight.w400),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
    side: BorderSide(color: Colors.white.withOpacity(0.08)),
    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
  ),

  // ListTile — 64px min height
  listTileTheme: ListTileThemeData(
    minVerticalPadding: 12,
    contentPadding: const EdgeInsets.symmetric(horizontal: 16),
    tileColor: Colors.transparent,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
    titleTextStyle: GoogleFonts.dmSans(
      fontSize: 15,
      fontWeight: FontWeight.w400,
      color: AppColors.textPrimary,
    ),
    subtitleTextStyle: GoogleFonts.dmSans(
      fontSize: 13,
      fontWeight: FontWeight.w400,
      color: AppColors.textSecondary,
    ),
  ),

  // Icon theme
  iconTheme: const IconThemeData(
    color: AppColors.textPrimary,
    size: 24,
  ),

  // Splash / ripple
  splashColor: Colors.white.withOpacity(0.05),
  highlightColor: Colors.transparent,
);
