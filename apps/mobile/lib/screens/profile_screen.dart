import 'package:flutter/material.dart';
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
      setState(() {
        _profileData = res.data;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Log Out',
            style: TextStyle(fontWeight: FontWeight.w700)),
        content: const Text('Are you sure you want to log out?',
            style: TextStyle(color: AppColors.textSecondary)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.danger),
            child: const Text('Log Out'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await SecureStorage.clearAll();
      if (mounted) context.go('/login');
    }
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
      body: _loading
          ? Center(
              child: Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(14),
                  gradient: AppColors.brandGradient,
                ),
                padding: const EdgeInsets.all(12),
                child: const CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 2.5,
                ),
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadProfile,
              color: AppColors.brandPrimary,
              child: CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  // Premium header with gradient
                  SliverToBoxAdapter(
                    child: Container(
                      padding: const EdgeInsets.fromLTRB(20, 60, 20, 30),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            AppColors.brandPrimary.withOpacity(0.15),
                            AppColors.background,
                          ],
                        ),
                      ),
                      child: Column(
                        children: [
                          // Avatar with gradient border
                          Container(
                            width: 100,
                            height: 100,
                            padding: const EdgeInsets.all(3),
                            decoration: BoxDecoration(
                              gradient: AppColors.brandGradient,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color:
                                      AppColors.brandPrimary.withOpacity(0.4),
                                  blurRadius: 20,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: Container(
                              decoration: const BoxDecoration(
                                color: AppColors.background,
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: ShaderMask(
                                  shaderCallback: (bounds) => AppColors
                                      .brandGradient
                                      .createShader(bounds),
                                  child: Text(
                                    (member?['name'] as String?)
                                            ?.substring(0, 1)
                                            .toUpperCase() ??
                                        '?',
                                    style: const TextStyle(
                                      fontSize: 40,
                                      fontWeight: FontWeight.w700,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            member?['name'] ?? '',
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 14, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Text(
                              member?['memberCode'] ?? '',
                              style: const TextStyle(
                                fontSize: 14,
                                color: AppColors.textSecondary,
                                fontFamily: 'monospace',
                                fontWeight: FontWeight.w600,
                                letterSpacing: 1,
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  gradient: AppColors.brandGradient,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                gym?['name'] ?? '',
                                style: const TextStyle(
                                  fontSize: 14,
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

                  SliverPadding(
                    padding: const EdgeInsets.all(20),
                    sliver: SliverList(
                      delegate: SliverChildListDelegate([
                        // QR Code Card - Premium Design
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            gradient: AppColors.brandGradient,
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.brandPrimary.withOpacity(0.3),
                                blurRadius: 20,
                                spreadRadius: 0,
                              ),
                            ],
                          ),
                          child: Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Column(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: Colors.grey[50],
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: QrImageView(
                                    data: member?['memberCode'] ?? '',
                                    version: QrVersions.auto,
                                    size: 180,
                                    backgroundColor: Colors.grey[50]!,
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
                                const SizedBox(height: 16),
                                Text(
                                  'Your Member QR Code',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.grey[800],
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Show this at reception for quick check-in',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[500],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Stats Row - Calories and Steps
                        const Row(
                          children: [
                            Expanded(
                              child: _ProgressStatTile(
                                label: 'Calories',
                                value: '1,240',
                                unit: 'kcal',
                                progress: 0.78,
                                icon: Icons.local_fire_department_rounded,
                                color: AppColors.brandPrimary,
                              ),
                            ),
                            SizedBox(width: 12),
                            Expanded(
                              child: _ProgressStatTile(
                                label: 'Daily Steps',
                                value: '8,452',
                                unit: 'steps',
                                progress: 0.84,
                                icon: Icons.directions_walk_rounded,
                                color: AppColors.success,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 24),

                        // Activity Heatmap
                        _buildActivityHeatmap(),

                        const SizedBox(height: 24),

                        // Plan Info Card
                        if (sub != null)
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: AppColors.cardDark,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(10),
                                          decoration: BoxDecoration(
                                            gradient: AppColors.brandGradient,
                                            borderRadius:
                                                BorderRadius.circular(12),
                                          ),
                                          child: const Icon(
                                            Icons.card_membership_rounded,
                                            color: Colors.white,
                                            size: 20,
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            const Text(
                                              'Current Plan',
                                              style: TextStyle(
                                                fontSize: 12,
                                                color: AppColors.textMuted,
                                              ),
                                            ),
                                            const SizedBox(height: 2),
                                            Text(
                                              sub['planName'] ?? '',
                                              style: const TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.w700,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: feeStatus == 'paid'
                                            ? AppColors.success
                                                .withOpacity(0.15)
                                            : feeStatus == 'due'
                                                ? AppColors.warning
                                                    .withOpacity(0.15)
                                                : AppColors.danger
                                                    .withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(20),
                                        border: Border.all(
                                          color: feeStatus == 'paid'
                                              ? AppColors.success
                                                  .withOpacity(0.3)
                                              : feeStatus == 'due'
                                                  ? AppColors.warning
                                                      .withOpacity(0.3)
                                                  : AppColors.danger
                                                      .withOpacity(0.3),
                                        ),
                                      ),
                                      child: Text(
                                        feeStatus == 'paid'
                                            ? 'Active'
                                            : feeStatus == 'due'
                                                ? 'Due Soon'
                                                : 'Overdue',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: feeStatus == 'paid'
                                              ? AppColors.success
                                              : feeStatus == 'due'
                                                  ? AppColors.warning
                                                  : AppColors.danger,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 20),
                                Container(
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: AppColors.surface,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          const Text(
                                            'Valid Until',
                                            style: TextStyle(
                                                fontSize: 11,
                                                color: AppColors.textMuted),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            DateFormat('d MMM yyyy').format(
                                                DateTime.parse(sub['endDate'])),
                                            style: const TextStyle(
                                              fontSize: 15,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ],
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 14, vertical: 8),
                                        decoration: BoxDecoration(
                                          color:
                                              (sub['daysRemaining'] ?? 0) <= 7
                                                  ? AppColors.danger
                                                      .withOpacity(0.15)
                                                  : AppColors.brandPrimary
                                                      .withOpacity(0.15),
                                          borderRadius:
                                              BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          '${sub['daysRemaining']} days left',
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w700,
                                            color:
                                                (sub['daysRemaining'] ?? 0) <= 7
                                                    ? AppColors.danger
                                                    : AppColors.brandPrimary,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),

                        const SizedBox(height: 24),

                        // Personal Info Section
                        const Text(
                          'Personal Information',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 12),

                        Container(
                          decoration: BoxDecoration(
                            color: AppColors.cardDark,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Column(
                            children: [
                              _InfoRow(
                                icon: Icons.phone_rounded,
                                label: 'Phone',
                                value: member?['phone'] ?? '',
                                isFirst: true,
                              ),
                              _InfoRow(
                                icon: Icons.email_rounded,
                                label: 'Email',
                                value: member?['email'] ?? '—',
                              ),
                              _InfoRow(
                                icon: Icons.cake_rounded,
                                label: 'Date of Birth',
                                value: member?['dateOfBirth'] != null
                                    ? DateFormat('d MMM yyyy').format(
                                        DateTime.parse(member['dateOfBirth']))
                                    : '—',
                              ),
                              _InfoRow(
                                icon: Icons.calendar_month_rounded,
                                label: 'Member Since',
                                value: member?['joinedAt'] != null
                                    ? DateFormat('d MMM yyyy').format(
                                        DateTime.parse(member['joinedAt']))
                                    : '—',
                                isLast: true,
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 32),

                        // Logout Button
                        GestureDetector(
                          onTap: _logout,
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppColors.danger.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                  color: AppColors.danger.withOpacity(0.2)),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.logout_rounded,
                                    color: AppColors.danger, size: 20),
                                SizedBox(width: 10),
                                Text(
                                  'Log Out',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.danger,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 40),
                      ]),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildActivityHeatmap() {
    // Sample data for 2 weeks
    final weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    final week1 = [0.4, 1.0, 0.0, 0.6, 1.0, 0.0, 0.0]; // Activity levels
    final week2 = [0.2, 1.0, 0.8, 0.0, 1.0, 0.4, 0.0];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Activity Heatmap',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          // Day labels
          Row(
            children: weekDays
                .map((day) => Expanded(
                      child: Center(
                        child: Text(
                          day,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ),
                    ))
                .toList(),
          ),
          const SizedBox(height: 8),
          // Week 1
          Row(
            children: week1
                .map((level) => Expanded(
                      child: Container(
                        margin: const EdgeInsets.all(2),
                        height: 24,
                        decoration: BoxDecoration(
                          color: level > 0
                              ? AppColors.brandPrimary
                                  .withOpacity(level * 0.3 + 0.2)
                              : AppColors.surface,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ))
                .toList(),
          ),
          const SizedBox(height: 4),
          // Week 2
          Row(
            children: week2
                .map((level) => Expanded(
                      child: Container(
                        margin: const EdgeInsets.all(2),
                        height: 24,
                        decoration: BoxDecoration(
                          color: level > 0
                              ? AppColors.brandPrimary
                                  .withOpacity(level * 0.3 + 0.2)
                              : AppColors.surface,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ))
                .toList(),
          ),
        ],
      ),
    );
  }
}

class _ProgressStatTile extends StatelessWidget {
  final String label, value, unit;
  final double progress;
  final IconData icon;
  final Color color;

  const _ProgressStatTile({
    required this.label,
    required this.value,
    required this.unit,
    required this.progress,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardDark.withOpacity(0.8),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Stack(
        children: [
          // Left accent bar
          Positioned(
            top: 0,
            left: 0,
            bottom: 0,
            child: Container(
              width: 3,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(left: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(icon, size: 18, color: color),
                    ),
                    Text(
                      label.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textMuted,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      value,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      unit,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                // Progress bar
                Container(
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(2),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(2),
                    child: FractionallySizedBox(
                      widthFactor: progress,
                      alignment: Alignment.centerLeft,
                      child: Container(
                        decoration: BoxDecoration(
                          color: color,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label, value;
  final bool isFirst;
  final bool isLast;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
    this.isFirst = false,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      decoration: BoxDecoration(
        border: isLast
            ? null
            : const Border(
                bottom: BorderSide(color: AppColors.border, width: 0.5)),
        borderRadius: BorderRadius.only(
          topLeft: isFirst ? const Radius.circular(16) : Radius.zero,
          topRight: isFirst ? const Radius.circular(16) : Radius.zero,
          bottomLeft: isLast ? const Radius.circular(16) : Radius.zero,
          bottomRight: isLast ? const Radius.circular(16) : Radius.zero,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 18, color: AppColors.textMuted),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
