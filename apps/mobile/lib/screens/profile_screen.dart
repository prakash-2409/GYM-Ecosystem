import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:intl/intl.dart';
import '../app/theme.dart';
import '../core/api_client.dart';
import '../core/storage.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _profileData;
  bool _loading = true;

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

  Future<void> _logout() async {
    await SecureStorage.clearAll();
    if (mounted) context.go('/login');
  }

  @override
  Widget build(BuildContext context) {
    final member = _profileData?['member'];
    final gym = _profileData?['gym'];
    final sub = _profileData?['subscription'];
    final stats = _profileData?['stats'];
    final feeStatus = _profileData?['feeStatus'];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Profile')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.brand))
          : RefreshIndicator(
              onRefresh: _loadProfile,
              color: AppColors.brand,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Avatar + Name
                    Container(
                      width: 72, height: 72,
                      decoration: BoxDecoration(
                        color: AppColors.brand.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Center(
                        child: Text(
                          (member?['name'] as String?)?.substring(0, 1).toUpperCase() ?? '?',
                          style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.brand),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(member?['name'] ?? '', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text(member?['memberCode'] ?? '', style: const TextStyle(fontSize: 13, color: AppColors.textMuted, fontFamily: 'monospace')),
                    const SizedBox(height: 4),
                    Text(gym?['name'] ?? '', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),

                    const SizedBox(height: 24),

                    // QR Code Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        children: [
                          QrImageView(
                            data: member?['memberCode'] ?? '',
                            version: QrVersions.auto,
                            size: 160,
                            backgroundColor: Colors.white,
                            eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.roundedOuter, color: Colors.black),
                            dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.roundedOutsideCorners, color: Colors.black),
                          ),
                          const SizedBox(height: 8),
                          Text('Show this to the receptionist', style: TextStyle(fontSize: 11, color: Colors.grey[600])),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Stats
                    Row(children: [
                      _StatTile(label: 'Total Visits', value: '${stats?['totalVisits'] ?? 0}'),
                      const SizedBox(width: 10),
                      _StatTile(label: 'This Month', value: '${stats?['monthVisits'] ?? 0}'),
                    ]),

                    const SizedBox(height: 20),

                    // Plan Info
                    if (sub != null)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.cardDark,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                              const Text('Current Plan', style: TextStyle(fontSize: 13, color: AppColors.textMuted)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: feeStatus == 'paid' ? AppColors.success.withOpacity(0.15) : feeStatus == 'due' ? AppColors.warning.withOpacity(0.15) : AppColors.danger.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  feeStatus == 'paid' ? '✅ Paid' : feeStatus == 'due' ? '⏰ Due Soon' : '⚠️ Overdue',
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: feeStatus == 'paid' ? AppColors.success : feeStatus == 'due' ? AppColors.warning : AppColors.danger),
                                ),
                              ),
                            ]),
                            const SizedBox(height: 8),
                            Text(sub['planName'] ?? '', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                            const SizedBox(height: 8),
                            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                              Text('${DateFormat('d MMM').format(DateTime.parse(sub['startDate']))} → ${DateFormat('d MMM yyyy').format(DateTime.parse(sub['endDate']))}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                              Text('${sub['daysRemaining']}d left', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: (sub['daysRemaining'] ?? 0) <= 7 ? AppColors.danger : AppColors.textSecondary)),
                            ]),
                          ],
                        ),
                      ),

                    const SizedBox(height: 20),

                    // Info rows
                    _InfoRow(icon: Icons.phone, label: 'Phone', value: member?['phone'] ?? ''),
                    _InfoRow(icon: Icons.email_outlined, label: 'Email', value: member?['email'] ?? '—'),
                    _InfoRow(icon: Icons.cake_outlined, label: 'DOB', value: member?['dateOfBirth'] != null ? DateFormat('d MMM yyyy').format(DateTime.parse(member['dateOfBirth'])) : '—'),
                    _InfoRow(icon: Icons.calendar_today, label: 'Joined', value: member?['joinedAt'] != null ? DateFormat('d MMM yyyy').format(DateTime.parse(member['joinedAt'])) : '—'),

                    const SizedBox(height: 24),

                    // Logout
                    SizedBox(
                      width: double.infinity, height: 48,
                      child: OutlinedButton.icon(
                        onPressed: _logout,
                        icon: const Icon(Icons.logout, size: 18),
                        label: const Text('Log Out'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.danger,
                          side: BorderSide(color: AppColors.danger.withOpacity(0.3)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),

                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
    );
  }
}

class _StatTile extends StatelessWidget {
  final String label, value;
  const _StatTile({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: AppColors.cardDark, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
        child: Column(children: [
          Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
        ]),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label, value;
  const _InfoRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 1),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.cardDark,
          border: Border(bottom: BorderSide(color: AppColors.border.withOpacity(0.5))),
        ),
        child: Row(children: [
          Icon(icon, size: 18, color: AppColors.textMuted),
          const SizedBox(width: 12),
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
        ]),
      ),
    );
  }
}
