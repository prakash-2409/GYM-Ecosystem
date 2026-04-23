import 'dart:async';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../app/theme.dart';
import '../core/api_client.dart';

class AccessPassScreen extends StatefulWidget {
  const AccessPassScreen({super.key});

  @override
  State<AccessPassScreen> createState() => _AccessPassScreenState();
}

class _AccessPassScreenState extends State<AccessPassScreen> {
  Map<String, dynamic>? _profileData;
  bool _loading = true;
  int _refreshCountdown = 45;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _loadProfile();
    _startCountdown();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startCountdown() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_refreshCountdown > 0) {
          _refreshCountdown--;
        } else {
          _refreshCountdown = 45;
          _loadProfile();
        }
      });
    });
  }

  Future<void> _loadProfile() async {
    try {
      final res = await api.get('/members/me');
      setState(() {
        _profileData = res.data;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final member = _profileData?['member'];
    final sub = _profileData?['subscription'];
    final daysRemaining = sub?['daysRemaining'] ?? 0;
    const totalDays = 30;
    final usagePercent =
        ((totalDays - daysRemaining) / totalDays * 100).clamp(0, 100);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: GestureDetector(
          onTap: () => Navigator.pop(context),
          child: const Icon(Icons.arrow_back_rounded,
              color: AppColors.brandPrimary),
        ),
        title: const Text(
          'Access Pass',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        centerTitle: true,
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.brandPrimary),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Membership Status Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.cardDark,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Stack(
                      children: [
                        // Background icon
                        Positioned(
                          top: 0,
                          right: 0,
                          child: Icon(
                            Icons.verified_user_rounded,
                            size: 48,
                            color: AppColors.textMuted.withOpacity(0.1),
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'CURRENT MEMBERSHIP',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textMuted,
                                letterSpacing: 1.5,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              sub?['planName'] ?? 'Elite Performance Tier',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 20),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Plan expires in $daysRemaining days',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: AppColors.textMuted,
                                  ),
                                ),
                                Text(
                                  '${usagePercent.toInt()}% Used',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: AppColors.textMuted,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            // Progress bar
                            Container(
                              height: 6,
                              decoration: BoxDecoration(
                                color: AppColors.surface,
                                borderRadius: BorderRadius.circular(3),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(3),
                                child: FractionallySizedBox(
                                  widthFactor: usagePercent / 100,
                                  alignment: Alignment.centerLeft,
                                  child: Container(
                                    decoration: BoxDecoration(
                                      gradient: AppColors.brandGradient,
                                      borderRadius: BorderRadius.circular(3),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // QR Code Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: AppColors.cardDark,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      children: [
                        const Text(
                          'Gym Access Pass',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Scan this code at the terminal',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textMuted,
                          ),
                        ),
                        const SizedBox(height: 20),
                        // QR Code
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: QrImageView(
                            data: member?['memberCode'] ?? 'DEMO123',
                            version: QrVersions.auto,
                            size: 180,
                            backgroundColor: Colors.white,
                            eyeStyle: const QrEyeStyle(
                              eyeShape: QrEyeShape.square,
                              color: AppColors.brandPrimary,
                            ),
                            dataModuleStyle: const QrDataModuleStyle(
                              dataModuleShape: QrDataModuleShape.square,
                              color: AppColors.cardDark,
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        // Refresh indicator
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.refresh_rounded,
                              size: 16,
                              color: AppColors.brandPrimary,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              'Refreshes in ${_refreshCountdown}s',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: AppColors.brandPrimary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Member code
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.cardDark,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          'Member Code: ',
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.textMuted,
                          ),
                        ),
                        Text(
                          member?['memberCode'] ?? 'DEMO123',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                            fontFamily: 'monospace',
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
