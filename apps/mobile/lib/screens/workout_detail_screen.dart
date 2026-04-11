import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../app/theme.dart';

class WorkoutDetailScreen extends StatefulWidget {
  final Map<String, dynamic>? workout;

  const WorkoutDetailScreen({super.key, this.workout});

  @override
  State<WorkoutDetailScreen> createState() => _WorkoutDetailScreenState();
}

class _WorkoutDetailScreenState extends State<WorkoutDetailScreen> {
  late Map<String, dynamic> _workout;
  int _activeExerciseIndex = 0;

  @override
  void initState() {
    super.initState();
    // Use provided workout or demo data
    _workout = widget.workout ??
        {
          'name': 'Leg Day - Power II',
          'category': 'Hypertrophy Focus',
          'intensity': 'Advanced Intensity',
          'duration': 75,
          'calories': 640,
          'volume': 14.2,
          'exercises': [
            {
              'name': 'Barbell Squat',
              'sets': 4,
              'reps': '8-10',
              'weight': 120,
              'completed': 3,
              'total': 4,
            },
            {
              'name': 'Leg Press',
              'sets': 3,
              'reps': '12',
              'weight': 240,
              'completed': 0,
              'total': 3,
            },
            {
              'name': 'Romanian Deadlift',
              'sets': 3,
              'reps': '10-12',
              'weight': 80,
              'completed': 0,
              'total': 3,
            },
            {
              'name': 'Leg Curl',
              'sets': 3,
              'reps': '12-15',
              'weight': 45,
              'completed': 0,
              'total': 3,
            },
            {
              'name': 'Calf Raises',
              'sets': 4,
              'reps': '15-20',
              'weight': 100,
              'completed': 0,
              'total': 4,
            },
          ],
        };
  }

  @override
  Widget build(BuildContext context) {
    final exercises =
        (_workout['exercises'] as List?)?.cast<Map<String, dynamic>>() ?? [];

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // Hero Header with Image
          SliverAppBar(
            expandedHeight: 320,
            pinned: true,
            backgroundColor: AppColors.background,
            leading: GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(
                margin: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(12),
                ),
                child:
                    const Icon(Icons.arrow_back_rounded, color: Colors.white),
              ),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  // Placeholder gradient background
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          AppColors.brandPrimary.withOpacity(0.3),
                          AppColors.background,
                        ],
                      ),
                    ),
                  ),
                  // Content overlay
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            AppColors.background.withOpacity(0.8),
                            AppColors.background,
                          ],
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Intensity badge
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.success.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                  color: AppColors.success.withOpacity(0.3)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 6,
                                  height: 6,
                                  decoration: const BoxDecoration(
                                    color: AppColors.success,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  _workout['intensity'] ?? 'Advanced',
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.success,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                          // Title
                          Text(
                            _workout['name'] ?? 'Workout',
                            style: const TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 16),
                          // Stats row
                          Row(
                            children: [
                              _buildStatChip(
                                label: 'Duration',
                                value: '${_workout['duration'] ?? 0} min',
                              ),
                              const SizedBox(width: 8),
                              _buildStatChip(
                                label: 'Calories',
                                value: '${_workout['calories'] ?? 0}',
                                highlight: true,
                              ),
                              const SizedBox(width: 8),
                              _buildStatChip(
                                label: 'Volume',
                                value: '${_workout['volume'] ?? 0}t',
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Exercises Section
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: Row(
                children: [
                  const Text(
                    'Exercises',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '(${exercises.length} total)',
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Exercise List
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final exercise = exercises[index];
                  final isActive = index == _activeExerciseIndex;
                  final completed = exercise['completed'] ?? 0;
                  final total = exercise['total'] ?? 1;
                  final progress = total > 0 ? completed / total : 0.0;

                  return GestureDetector(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      setState(() => _activeExerciseIndex = index);
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.cardDark,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isActive
                              ? AppColors.brandPrimary.withOpacity(0.5)
                              : AppColors.border,
                        ),
                      ),
                      child: Column(
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Exercise number
                              Container(
                                width: 28,
                                height: 28,
                                decoration: BoxDecoration(
                                  color: isActive
                                      ? AppColors.brandPrimary.withOpacity(0.2)
                                      : AppColors.surface,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Center(
                                  child: Text(
                                    (index + 1).toString().padLeft(2, '0'),
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: isActive
                                          ? AppColors.brandPrimary
                                          : AppColors.textMuted,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              // Exercise details
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      exercise['name'] ?? '',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        _buildExerciseStat(
                                          label: 'Sets',
                                          value:
                                              '${exercise['sets']} x ${exercise['reps']}',
                                        ),
                                        const SizedBox(width: 16),
                                        _buildExerciseStat(
                                          label: 'Load',
                                          value: '${exercise['weight']}kg',
                                          highlight: true,
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              // Progress circle (only for active exercise)
                              if (isActive)
                                SizedBox(
                                  width: 52,
                                  height: 52,
                                  child: Stack(
                                    children: [
                                      CircularProgressIndicator(
                                        value: progress,
                                        strokeWidth: 4,
                                        backgroundColor: AppColors.surface,
                                        valueColor:
                                            const AlwaysStoppedAnimation(
                                                AppColors.brandPrimary),
                                      ),
                                      Center(
                                        child: Text(
                                          '${(progress * 100).toInt()}%',
                                          style: const TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.textPrimary,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
                childCount: exercises.length,
              ),
            ),
          ),
        ],
      ),
      // Bottom action button
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
        decoration: const BoxDecoration(
          color: AppColors.background,
          border: Border(
            top: BorderSide(color: AppColors.border, width: 0.5),
          ),
        ),
        child: SafeArea(
          child: SizedBox(
            height: 52,
            child: ElevatedButton(
              onPressed: () {
                HapticFeedback.mediumImpact();
                // Start/resume workout
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.brandPrimary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: const Text(
                'Resume Workout',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatChip({
    required String label,
    required String value,
    bool highlight = false,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.cardDark.withOpacity(0.8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: highlight ? AppColors.brandPrimary : AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExerciseStat({
    required String label,
    required String value,
    bool highlight = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            fontSize: 10,
            color: AppColors.textMuted,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: highlight ? AppColors.brandPrimary : AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
