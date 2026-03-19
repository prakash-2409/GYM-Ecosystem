import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../app/theme.dart';
import '../core/api_client.dart';
import '../core/storage.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  bool _otpSent = false;
  bool _loading = false;
  String? _error;

  Future<void> _sendOTP() async {
    if (_phoneController.text.length < 10) {
      setState(() => _error = 'Enter a valid 10-digit phone number');
      return;
    }

    setState(() { _loading = true; _error = null; });
    try {
      await api.post('/auth/otp/send', data: {'phone': _phoneController.text.trim()});
      HapticFeedback.lightImpact();
      setState(() { _otpSent = true; _loading = false; });
    } catch (e) {
      setState(() { _error = 'Failed to send OTP. Try again.'; _loading = false; });
    }
  }

  Future<void> _verifyOTP() async {
    if (_otpController.text.length < 4) {
      setState(() => _error = 'Enter the OTP');
      return;
    }

    setState(() { _loading = true; _error = null; });
    try {
      final res = await api.post('/auth/otp/verify', data: {
        'phone': _phoneController.text.trim(),
        'otp': _otpController.text.trim(),
      });

      final token = res.data['token'] as String;
      final gymSlug = res.data['gymSlug'] as String?;

      await SecureStorage.saveToken(token);
      if (gymSlug != null) await SecureStorage.saveGymSlug(gymSlug);

      HapticFeedback.mediumImpact();
      if (mounted) context.go('/home');
    } catch (e) {
      setState(() { _error = 'Invalid OTP. Please try again.'; _loading = false; });
    }
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Spacer(),

              // Logo
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: AppColors.brand,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.fitness_center, color: Colors.white, size: 28),
              ),
              const SizedBox(height: 24),

              Text(
                _otpSent ? 'Verify OTP' : 'Welcome back',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                _otpSent
                    ? 'Enter the code sent to +91 ${_phoneController.text}'
                    : 'Enter your phone number to get started',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondary,
                    ),
              ),

              const SizedBox(height: 32),

              if (!_otpSent) ...[
                // Phone input
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  maxLength: 10,
                  style: const TextStyle(fontSize: 18, letterSpacing: 1),
                  decoration: InputDecoration(
                    hintText: '9876543210',
                    prefixIcon: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text('🇮🇳', style: TextStyle(fontSize: 20)),
                          const SizedBox(width: 8),
                          const Text('+91', style: TextStyle(color: AppColors.textSecondary, fontSize: 16)),
                          const SizedBox(width: 8),
                          SizedBox(height: 24, child: VerticalDivider(color: AppColors.border)),
                        ],
                      ),
                    ),
                    counterText: '',
                  ),
                ),
              ] else ...[
                // OTP input
                TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 24, letterSpacing: 12, fontWeight: FontWeight.w600),
                  decoration: const InputDecoration(
                    hintText: '• • • • • •',
                    counterText: '',
                  ),
                ),
                const SizedBox(height: 12),
                Center(
                  child: TextButton(
                    onPressed: () => setState(() { _otpSent = false; _otpController.clear(); _error = null; }),
                    child: const Text('Change phone number', style: TextStyle(color: AppColors.brand, fontSize: 13)),
                  ),
                ),
              ],

              if (_error != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.danger.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: AppColors.danger, size: 18),
                      const SizedBox(width: 8),
                      Expanded(child: Text(_error!, style: const TextStyle(color: AppColors.danger, fontSize: 13))),
                    ],
                  ),
                ),
              ],

              const Spacer(),

              // Action button
              ElevatedButton(
                onPressed: _loading ? null : (_otpSent ? _verifyOTP : _sendOTP),
                child: _loading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text(_otpSent ? 'Verify & Login' : 'Send OTP'),
              ),

              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
