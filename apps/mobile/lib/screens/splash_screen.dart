import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/storage.dart';
import '../core/api_client.dart';
import '../app/theme.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late AnimationController _pulseController;
  late AnimationController _scaleController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _pulseAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();

    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _fadeAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeOut),
    );

    _scaleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _scaleController, curve: Curves.elasticOut),
    );

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _fadeController.forward();
    _scaleController.forward();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    await Future.delayed(const Duration(seconds: 2));
    final token = await SecureStorage.getToken();

    if (!mounted) return;

    if (token != null) {
      // Validate token by fetching profile
      try {
        await api.get('/members/me');
        if (mounted) context.go('/home');
      } catch (_) {
        await SecureStorage.clearAll();
        if (mounted) context.go('/login');
      }
    } else {
      context.go('/login');
    }
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _pulseController.dispose();
    _scaleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Animated gradient background
          Positioned.fill(
            child: AnimatedBuilder(
              animation: _pulseController,
              builder: (context, child) {
                return Container(
                  decoration: BoxDecoration(
                    gradient: RadialGradient(
                      center: Alignment.center,
                      radius: 1.5 + (_pulseAnimation.value * 0.3),
                      colors: [
                        AppColors.brandPrimary
                            .withOpacity(0.15 * _pulseAnimation.value),
                        AppColors.brandSecondary
                            .withOpacity(0.08 * _pulseAnimation.value),
                        AppColors.background,
                      ],
                      stops: const [0.0, 0.4, 1.0],
                    ),
                  ),
                );
              },
            ),
          ),

          // Content
          Center(
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: ScaleTransition(
                scale: _scaleAnimation,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Premium logo with gradient and glow
                    AnimatedBuilder(
                      animation: _pulseController,
                      builder: (context, child) {
                        return Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(28),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.brandPrimary
                                    .withOpacity(0.4 * _pulseAnimation.value),
                                blurRadius: 30 + (10 * _pulseAnimation.value),
                                spreadRadius: 5 * _pulseAnimation.value,
                              ),
                              BoxShadow(
                                color: AppColors.brandSecondary
                                    .withOpacity(0.3 * _pulseAnimation.value),
                                blurRadius: 40 + (15 * _pulseAnimation.value),
                                spreadRadius: 2 * _pulseAnimation.value,
                              ),
                            ],
                          ),
                          child: child,
                        );
                      },
                      child: Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          gradient: AppColors.brandGradient,
                          borderRadius: BorderRadius.circular(28),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.2),
                            width: 2,
                          ),
                        ),
                        child: const Icon(
                          Icons.fitness_center_rounded,
                          color: Colors.white,
                          size: 48,
                        ),
                      ),
                    ),

                    const SizedBox(height: 32),

                    // App name with gradient text
                    ShaderMask(
                      shaderCallback: (bounds) =>
                          AppColors.brandGradient.createShader(bounds),
                      child: const Text(
                        'GymStack',
                        style: TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: -0.5,
                        ),
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Tagline
                    const Text(
                      'Your fitness journey starts here',
                      style: TextStyle(
                        fontSize: 15,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w500,
                        letterSpacing: 0.3,
                      ),
                    ),

                    const SizedBox(height: 60),

                    // Premium loading indicator
                    SizedBox(
                      width: 40,
                      height: 40,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          // Outer ring
                          AnimatedBuilder(
                            animation: _pulseController,
                            builder: (context, child) {
                              return Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color:
                                        AppColors.brandPrimary.withOpacity(0.2),
                                    width: 2,
                                  ),
                                ),
                              );
                            },
                          ),
                          // Spinning gradient ring
                          const SizedBox(
                            width: 40,
                            height: 40,
                            child: CircularProgressIndicator(
                              strokeWidth: 3,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                  AppColors.brandPrimary),
                              backgroundColor: Colors.transparent,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    const Text(
                      'Loading...',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textMuted,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom branding
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          gradient: AppColors.brandGradient,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Powered by GymStack',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textMuted,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
