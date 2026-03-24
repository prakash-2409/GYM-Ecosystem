import 'package:flutter/material.dart';
import '../app/theme.dart';
import '../core/api_client.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  int _selectedTab = 0;
  bool _loading = true;
  List<Map<String, dynamic>> _rankings = [];
  Map<String, dynamic>? _currentUser;

  @override
  void initState() {
    super.initState();
    _loadLeaderboard();
  }

  Future<void> _loadLeaderboard() async {
    setState(() => _loading = true);
    try {
      final type = _selectedTab == 0 ? 'consistency' : 'volume';
      final res = await api.get('/leaderboard?type=$type');
      setState(() {
        _rankings =
            (res.data['rankings'] as List?)?.cast<Map<String, dynamic>>() ?? [];
        _currentUser = res.data['currentUser'];
        _loading = false;
      });
    } catch (e) {
      // Use mock data for demo
      setState(() {
        _rankings = [
          {'rank': 1, 'name': 'Elena R.', 'value': 14200, 'streak': 21},
          {'rank': 2, 'name': 'Marcus V.', 'value': 12800, 'streak': 18},
          {'rank': 3, 'name': 'Kaito S.', 'value': 11500, 'streak': 15},
          {'rank': 4, 'name': 'Sarah K.', 'value': 10200, 'streak': 12},
          {'rank': 5, 'name': 'Alexander', 'value': 11200, 'streak': 14, 'isCurrentUser': true},
        ];
        _currentUser = {'rank': 5, 'name': 'Alexander', 'value': 11200, 'streak': 14};
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // Header
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.fromLTRB(16, 60, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Leaderboard',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: AppColors.brandPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Weekly Rankings',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textMuted,
                      letterSpacing: 1.5,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Tab Switcher
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: AppColors.cardDark,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          setState(() => _selectedTab = 0);
                          _loadLeaderboard();
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _selectedTab == 0
                                ? AppColors.brandPrimary
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Center(
                            child: Text(
                              'Consistency',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: _selectedTab == 0
                                    ? Colors.white
                                    : AppColors.textMuted,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          setState(() => _selectedTab = 1);
                          _loadLeaderboard();
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _selectedTab == 1
                                ? AppColors.brandPrimary
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Center(
                            child: Text(
                              'Volume',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: _selectedTab == 1
                                    ? Colors.white
                                    : AppColors.textMuted,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 24)),

          // Top 3 Podium
          if (!_loading && _rankings.length >= 3)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: _buildPodium(),
              ),
            ),

          const SliverToBoxAdapter(child: SizedBox(height: 24)),

          // Current User Position
          if (_currentUser != null)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: _buildCurrentUserCard(),
              ),
            ),

          // Loading indicator
          if (_loading)
            const SliverFillRemaining(
              child: Center(
                child: CircularProgressIndicator(color: AppColors.brandPrimary),
              ),
            ),

          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }

  Widget _buildPodium() {
    final top3 = _rankings.take(3).toList();
    if (top3.length < 3) return const SizedBox.shrink();

    return SizedBox(
      height: 220,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // 2nd Place
          Expanded(
            child: _buildPodiumItem(
              rank: 2,
              name: top3[1]['name'] ?? '',
              value: top3[1]['value'] ?? 0,
              height: 96,
              isFirst: false,
            ),
          ),
          const SizedBox(width: 8),
          // 1st Place
          Expanded(
            child: _buildPodiumItem(
              rank: 1,
              name: top3[0]['name'] ?? '',
              value: top3[0]['value'] ?? 0,
              height: 128,
              isFirst: true,
            ),
          ),
          const SizedBox(width: 8),
          // 3rd Place
          Expanded(
            child: _buildPodiumItem(
              rank: 3,
              name: top3[2]['name'] ?? '',
              value: top3[2]['value'] ?? 0,
              height: 64,
              isFirst: false,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPodiumItem({
    required int rank,
    required String name,
    required int value,
    required double height,
    required bool isFirst,
  }) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        // Avatar
        Container(
          width: isFirst ? 64 : 48,
          height: isFirst ? 64 : 48,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: isFirst ? AppColors.brandGradient : null,
            color: isFirst ? null : AppColors.surface,
            border: Border.all(
              color: isFirst
                  ? Colors.transparent
                  : AppColors.border,
              width: 2,
            ),
          ),
          child: Stack(
            children: [
              Center(
                child: Text(
                  name.isNotEmpty ? name[0].toUpperCase() : '?',
                  style: TextStyle(
                    fontSize: isFirst ? 24 : 18,
                    fontWeight: FontWeight.w700,
                    color: isFirst ? Colors.white : AppColors.textPrimary,
                  ),
                ),
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  width: isFirst ? 24 : 20,
                  height: isFirst ? 24 : 20,
                  decoration: BoxDecoration(
                    color: isFirst
                        ? AppColors.brandPrimary
                        : AppColors.surface,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Center(
                    child: Text(
                      '$rank',
                      style: TextStyle(
                        fontSize: isFirst ? 12 : 10,
                        fontWeight: FontWeight.w700,
                        color: isFirst
                            ? Colors.white
                            : AppColors.textPrimary,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        // Podium bar
        Container(
          height: height,
          decoration: BoxDecoration(
            color: isFirst
                ? AppColors.cardDark
                : AppColors.cardDark,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(16),
              topRight: Radius.circular(16),
            ),
            border: Border.all(
              color: isFirst
                  ? AppColors.brandPrimary.withOpacity(0.3)
                  : AppColors.border,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Text(
                name.split(' ').first,
                style: TextStyle(
                  fontSize: isFirst ? 14 : 12,
                  fontWeight: FontWeight.w600,
                  color: isFirst
                      ? AppColors.brandPrimary
                      : AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCurrentUserCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.brandPrimary.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          // Rank
          Text(
            '${_currentUser?['rank'] ?? '-'}',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.brandPrimary,
            ),
          ),
          const SizedBox(width: 12),
          // Avatar
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.brandPrimary.withOpacity(0.2),
              border: Border.all(
                color: AppColors.brandPrimary,
                width: 2,
              ),
            ),
            child: Center(
              child: Text(
                (_currentUser?['name'] as String? ?? '?')[0].toUpperCase(),
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.brandPrimary,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          // Name and streak
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${_currentUser?['name'] ?? ''} (You)',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${_currentUser?['streak'] ?? 0} Day Streak',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: AppColors.brandPrimary,
                  ),
                ),
              ],
            ),
          ),
          // Value
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${_formatValue(_currentUser?['value'] ?? 0)} kg',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                '87.5%',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.success,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatValue(int value) {
    if (value >= 1000) {
      return '${(value / 1000).toStringAsFixed(1)}k';
    }
    return value.toString();
  }
}
