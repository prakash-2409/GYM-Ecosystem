import 'package:flutter/material.dart';
import '../app/theme.dart';
import '../core/api_client.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<Map<String, dynamic>> _notifications = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    try {
      final res = await api.get('/notifications');
      final list = (res.data['notifications'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      setState(() { _notifications = list; _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'fee_reminder':
      case 'fee_overdue':
        return Icons.payments_outlined;
      case 'plan_expiry':
        return Icons.timer_outlined;
      case 'inactivity_nudge':
        return Icons.directions_run_rounded;
      case 'birthday_wish':
        return Icons.cake_outlined;
      case 'workout_updated':
        return Icons.fitness_center;
      case 'checkin_success':
        return Icons.check_circle_outline;
      default:
        return Icons.notifications_outlined;
    }
  }

  Color _colorForType(String type) {
    switch (type) {
      case 'fee_reminder':
      case 'fee_overdue':
        return AppColors.danger;
      case 'plan_expiry':
        return AppColors.warning;
      case 'inactivity_nudge':
        return AppColors.brand;
      case 'birthday_wish':
        return const Color(0xFFEC4899);
      case 'workout_updated':
        return AppColors.success;
      case 'checkin_success':
        return AppColors.success;
      default:
        return AppColors.textMuted;
    }
  }

  String _timeAgo(String? dateStr) {
    if (dateStr == null) return '';
    final date = DateTime.tryParse(dateStr);
    if (date == null) return '';
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 1) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${date.day}/${date.month}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Notifications')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.brand))
          : _notifications.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.notifications_off_outlined, size: 48, color: AppColors.textMuted.withOpacity(0.5)),
                      const SizedBox(height: 12),
                      const Text('No notifications yet', style: TextStyle(color: AppColors.textMuted, fontSize: 14)),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadNotifications,
                  color: AppColors.brand,
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: _notifications.length,
                    itemBuilder: (context, index) {
                      final n = _notifications[index];
                      final type = n['type'] as String? ?? '';
                      final color = _colorForType(type);

                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.cardDark,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: color.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Icon(_iconForType(type), size: 18, color: color),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    (n['title'] as String?) ?? type.replaceAll('_', ' '),
                                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    (n['body'] as String?) ?? '',
                                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      Text(
                                        _timeAgo(n['sentAt'] as String?),
                                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                      ),
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                        decoration: BoxDecoration(
                                          color: AppColors.surface,
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          (n['channel'] as String? ?? '').toUpperCase(),
                                          style: const TextStyle(fontSize: 9, color: AppColors.textMuted, fontWeight: FontWeight.w600),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
