import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../app/theme.dart';
import '../core/api_client.dart';
import 'package:intl/intl.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Map<String, dynamic>? _profileData;
  bool _loading = true;
  bool _checkingIn = false;
  String? _checkInStatus;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final res = await api.get('/members/me');
      setState(() { _profileData = res.data; _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _scanAndCheckIn() async {
    final result = await Navigator.of(context).push<String>(
      MaterialPageRoute(builder: (_) => const QRScannerPage()),
    );

    if (result != null && mounted) {
      try {
        final qrData = jsonDecode(result);
        setState(() { _checkingIn = true; _checkInStatus = null; });

        await api.post('/checkins/qr', data: {
          'gymId': qrData['gymId'],
          'hash': qrData['hash'],
        });

        HapticFeedback.heavyImpact();
        setState(() { _checkingIn = false; _checkInStatus = 'success'; });
        _loadProfile(); // Refresh stats

        // Reset status after 3 seconds
        Future.delayed(const Duration(seconds: 3), () {
          if (mounted) setState(() => _checkInStatus = null);
        });
      } catch (e) {
        HapticFeedback.vibrate();
        setState(() { _checkingIn = false; _checkInStatus = 'error'; });
        Future.delayed(const Duration(seconds: 3), () {
          if (mounted) setState(() => _checkInStatus = null);
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final member = _profileData?['member'];
    final sub = _profileData?['subscription'];
    final stats = _profileData?['stats'];
    final attendance = (_profileData?['attendanceLast7Days'] as List?)?.cast<String>() ?? [];
    final feeStatus = _profileData?['feeStatus'];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hey, ${member?['name']?.toString().split(' ').first ?? 'there'} 👋',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
            ),
            Text(
              DateFormat('EEEE, d MMM').format(DateTime.now()),
              style: const TextStyle(fontSize: 12, color: AppColors.textMuted, fontWeight: FontWeight.w400),
            ),
          ],
        ),
        toolbarHeight: 64,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.brand))
          : RefreshIndicator(
              onRefresh: _loadProfile,
              color: AppColors.brand,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ─── Check-in Button ──────────────────
                    GestureDetector(
                      onTap: _checkingIn ? null : _scanAndCheckIn,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          gradient: _checkInStatus == 'success'
                              ? const LinearGradient(colors: [Color(0xFF059669), Color(0xFF22C55E)])
                              : _checkInStatus == 'error'
                                  ? const LinearGradient(colors: [Color(0xFFDC2626), Color(0xFFEF4444)])
                                  : stats?['checkedInToday'] == true
                                      ? const LinearGradient(colors: [Color(0xFF059669), Color(0xFF22C55E)])
                                      : const LinearGradient(colors: [Color(0xFF4F46E5), Color(0xFF6366F1)]),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                _checkInStatus == 'success'
                                    ? Icons.check_rounded
                                    : _checkInStatus == 'error'
                                        ? Icons.close_rounded
                                        : stats?['checkedInToday'] == true
                                            ? Icons.check_rounded
                                            : Icons.qr_code_scanner_rounded,
                                color: Colors.white,
                                size: 24,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _checkingIn
                                        ? 'Checking in...'
                                        : _checkInStatus == 'success'
                                            ? 'Checked in! ✅'
                                            : _checkInStatus == 'error'
                                                ? 'Check-in failed'
                                                : stats?['checkedInToday'] == true
                                                    ? 'Checked in today ✅'
                                                    : 'Scan QR to Check In',
                                    style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    stats?['checkedInToday'] == true
                                        ? 'Great job showing up today!'
                                        : 'Point camera at gym QR code',
                                    style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 12),
                                  ),
                                ],
                              ),
                            ),
                            if (!_checkingIn && stats?['checkedInToday'] != true)
                              Icon(Icons.arrow_forward_ios_rounded, color: Colors.white.withOpacity(0.5), size: 16),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // ─── 7-Day Attendance Strip ───────────
                    const Text('This Week', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppColors.textSecondary)),
                    const SizedBox(height: 8),
                    Row(
                      children: List.generate(7, (i) {
                        final date = DateTime.now().subtract(Duration(days: 6 - i));
                        final dateStr = DateFormat('yyyy-MM-dd').format(date);
                        final isPresent = attendance.contains(dateStr);
                        final isToday = i == 6;

                        return Expanded(
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 2),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: isPresent ? AppColors.success.withOpacity(0.15) : AppColors.cardDark,
                              borderRadius: BorderRadius.circular(10),
                              border: isToday ? Border.all(color: AppColors.brand, width: 1.5) : null,
                            ),
                            child: Column(
                              children: [
                                Text(
                                  DateFormat('E').format(date).substring(0, 1),
                                  style: TextStyle(fontSize: 11, color: isPresent ? AppColors.success : AppColors.textMuted),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  width: 6,
                                  height: 6,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: isPresent ? AppColors.success : AppColors.textMuted.withOpacity(0.3),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${date.day}',
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: isPresent ? AppColors.textPrimary : AppColors.textMuted),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ),

                    const SizedBox(height: 20),

                    // ─── Stats Cards ──────────────────────
                    Row(
                      children: [
                        Expanded(child: _StatCard(label: 'Total Visits', value: '${stats?['totalVisits'] ?? 0}', icon: Icons.directions_run_rounded)),
                        const SizedBox(width: 10),
                        Expanded(child: _StatCard(label: 'This Month', value: '${stats?['monthVisits'] ?? 0}', icon: Icons.calendar_month_rounded)),
                        const SizedBox(width: 10),
                        Expanded(child: _StatCard(
                          label: 'Days Left',
                          value: '${sub?['daysRemaining'] ?? 0}',
                          icon: Icons.timer_outlined,
                          valueColor: (sub?['daysRemaining'] ?? 0) <= 7 ? AppColors.danger : null,
                        )),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // ─── Plan Card ────────────────────────
                    if (sub != null) ...[
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.cardDark,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(sub['planName'] ?? 'Plan', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: feeStatus == 'paid'
                                        ? AppColors.success.withOpacity(0.15)
                                        : feeStatus == 'due'
                                            ? AppColors.warning.withOpacity(0.15)
                                            : AppColors.danger.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    feeStatus == 'paid' ? 'Paid' : feeStatus == 'due' ? 'Due Soon' : 'Overdue',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: feeStatus == 'paid' ? AppColors.success : feeStatus == 'due' ? AppColors.warning : AppColors.danger,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('Expires ${DateFormat('d MMM yyyy').format(DateTime.parse(sub['endDate']))}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                Text('${sub['daysRemaining']} days left', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                              ],
                            ),
                            const SizedBox(height: 8),
                            // Progress bar
                            ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: 1 - ((sub['daysRemaining'] ?? 0) / 30).clamp(0.0, 1.0),
                                backgroundColor: AppColors.border,
                                color: (sub['daysRemaining'] ?? 0) <= 7 ? AppColors.danger : AppColors.brand,
                                minHeight: 4,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    // ─── Fee Warning ──────────────────────
                    if (feeStatus == 'overdue') ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.danger.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.danger.withOpacity(0.3)),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.warning_amber_rounded, color: AppColors.danger, size: 20),
                            SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'Your membership fee is overdue. Please renew at the front desk.',
                                style: TextStyle(fontSize: 12, color: AppColors.danger),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color? valueColor;

  const _StatCard({required this.label, required this.value, required this.icon, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: AppColors.textMuted),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: valueColor ?? AppColors.textPrimary)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
        ],
      ),
    );
  }
}

// ─── QR Scanner ────────────────────────────────────

class QRScannerPage extends StatefulWidget {
  const QRScannerPage({super.key});

  @override
  State<QRScannerPage> createState() => _QRScannerPageState();
}

class _QRScannerPageState extends State<QRScannerPage> {
  final MobileScannerController _controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
  );
  bool _scanned = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text('Scan Gym QR', style: TextStyle(fontSize: 16)),
        leading: IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _controller,
            onDetect: (capture) {
              if (_scanned) return;
              final barcode = capture.barcodes.firstOrNull;
              if (barcode?.rawValue != null) {
                _scanned = true;
                HapticFeedback.heavyImpact();
                Navigator.pop(context, barcode!.rawValue);
              }
            },
          ),
          // Overlay
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.brand, width: 3),
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
          Positioned(
            bottom: 60,
            left: 0,
            right: 0,
            child: Text(
              'Align the QR code within the frame',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }
}
