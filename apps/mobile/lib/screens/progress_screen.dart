import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:fl_chart/fl_chart.dart';
import '../app/theme.dart';
import '../core/api_client.dart';

class ProgressScreen extends StatefulWidget {
  const ProgressScreen({super.key});
  @override
  State<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends State<ProgressScreen> {
  Map<String, dynamic>? _comparison;
  List<Map<String, dynamic>> _weightHistory = [];
  bool _loading = true;
  bool _showLogSheet = false;
  String? _memberId;

  final _weightCtl = TextEditingController();
  final _chestCtl = TextEditingController();
  final _waistCtl = TextEditingController();
  final _bicepCtl = TextEditingController();
  final _thighCtl = TextEditingController();
  final _hipsCtl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final profileRes = await api.get('/members/me');
      _memberId = profileRes.data['member']['id'];
      final compRes = await api.get('/bodystats/$_memberId/comparison');
      final histRes = await api.get('/bodystats/$_memberId/weight-history');
      setState(() {
        _comparison = compRes.data;
        _weightHistory = (histRes.data['history'] as List?)?.cast<Map<String, dynamic>>() ?? [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _submitEntry() async {
    if (_memberId == null) return;
    final body = <String, dynamic>{};
    if (_weightCtl.text.isNotEmpty) body['weightKg'] = double.parse(_weightCtl.text);
    if (_chestCtl.text.isNotEmpty) body['chestCm'] = double.parse(_chestCtl.text);
    if (_waistCtl.text.isNotEmpty) body['waistCm'] = double.parse(_waistCtl.text);
    if (_bicepCtl.text.isNotEmpty) body['bicepCm'] = double.parse(_bicepCtl.text);
    if (_thighCtl.text.isNotEmpty) body['thighCm'] = double.parse(_thighCtl.text);
    if (_hipsCtl.text.isNotEmpty) body['hipsCm'] = double.parse(_hipsCtl.text);

    try {
      await api.post('/bodystats/$_memberId', data: body);
      HapticFeedback.mediumImpact();
      for (final c in [_weightCtl, _chestCtl, _waistCtl, _bicepCtl, _thighCtl, _hipsCtl]) {
        c.clear();
      }
      setState(() => _showLogSheet = false);
      _loadData();
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to save')));
    }
  }

  @override
  void dispose() {
    for (final c in [_weightCtl, _chestCtl, _waistCtl, _bicepCtl, _thighCtl, _hipsCtl]) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final latest = _comparison?['latest'];
    final changes = _comparison?['changes'];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Progress'),
        actions: [
          TextButton.icon(
            onPressed: () => setState(() => _showLogSheet = !_showLogSheet),
            icon: const Icon(Icons.add, size: 18),
            label: const Text('Log'),
            style: TextButton.styleFrom(foregroundColor: AppColors.brand),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.brand))
          : RefreshIndicator(
              onRefresh: _loadData,
              color: AppColors.brand,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_showLogSheet) _buildLogForm(),
                    if (_weightHistory.isNotEmpty) _buildChart(),
                    const Text('Measurements', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppColors.textSecondary)),
                    const SizedBox(height: 12),
                    if (latest != null)
                      _buildMeasurements(latest, changes)
                    else
                      _buildEmptyState(),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildLogForm() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardDark,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.brand.withOpacity(0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Log Body Stats', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
            const SizedBox(height: 14),
            _fieldRow(_weightCtl, 'Weight (kg)*', _chestCtl, 'Chest (cm)'),
            const SizedBox(height: 10),
            _fieldRow(_waistCtl, 'Waist (cm)', _bicepCtl, 'Bicep (cm)'),
            const SizedBox(height: 10),
            _fieldRow(_thighCtl, 'Thigh (cm)', _hipsCtl, 'Hips (cm)'),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity, height: 44,
              child: ElevatedButton(onPressed: _weightCtl.text.isNotEmpty ? _submitEntry : null, child: const Text('Save Entry')),
            ),
          ],
        ),
      ),
    );
  }

  Widget _fieldRow(TextEditingController c1, String l1, TextEditingController c2, String l2) {
    return Row(children: [
      Expanded(child: TextField(controller: c1, keyboardType: const TextInputType.numberWithOptions(decimal: true), style: const TextStyle(fontSize: 14), decoration: InputDecoration(labelText: l1, labelStyle: const TextStyle(fontSize: 12, color: AppColors.textMuted), contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10), isDense: true))),
      const SizedBox(width: 10),
      Expanded(child: TextField(controller: c2, keyboardType: const TextInputType.numberWithOptions(decimal: true), style: const TextStyle(fontSize: 14), decoration: InputDecoration(labelText: l2, labelStyle: const TextStyle(fontSize: 12, color: AppColors.textMuted), contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10), isDense: true))),
    ]);
  }

  Widget _buildChart() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Weight Trend', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppColors.textSecondary)),
          const SizedBox(height: 12),
          Container(
            height: 200,
            padding: const EdgeInsets.fromLTRB(0, 16, 16, 8),
            decoration: BoxDecoration(color: AppColors.cardDark, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
            child: LineChart(LineChartData(
              gridData: FlGridData(show: true, drawVerticalLine: false, getDrawingHorizontalLine: (v) => FlLine(color: AppColors.border, strokeWidth: 0.5)),
              titlesData: FlTitlesData(
                topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 40, getTitlesWidget: (v, m) => Text('${v.toInt()}', style: const TextStyle(fontSize: 10, color: AppColors.textMuted)))),
                bottomTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              ),
              borderData: FlBorderData(show: false),
              lineBarsData: [
                LineChartBarData(
                  spots: _weightHistory.asMap().entries.map((e) => FlSpot(e.key.toDouble(), (e.value['weight'] as num).toDouble())).toList(),
                  isCurved: true, color: AppColors.brand, barWidth: 2.5,
                  dotData: const FlDotData(show: true),
                  belowBarData: BarAreaData(show: true, color: AppColors.brand.withOpacity(0.08)),
                ),
              ],
            )),
          ),
        ],
      ),
    );
  }

  Widget _buildMeasurements(Map<String, dynamic> latest, Map<String, dynamic>? changes) {
    final items = [
      ('Weight', latest['weightKg'], 'kg', changes?['weightKg']),
      ('Chest', latest['chestCm'], 'cm', changes?['chestCm']),
      ('Waist', latest['waistCm'], 'cm', changes?['waistCm']),
      ('Bicep', latest['bicepCm'], 'cm', changes?['bicepCm']),
      ('Thigh', latest['thighCm'], 'cm', changes?['thighCm']),
      ('Hips', latest['hipsCm'], 'cm', changes?['hipsCm']),
    ];
    return GridView.count(
      crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 2,
      children: items.map((item) {
        final numVal = item.$2 != null ? double.tryParse(item.$2.toString()) : null;
        final numChg = item.$4 != null ? double.tryParse(item.$4.toString()) : null;
        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: AppColors.cardDark, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
            Text(item.$1, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
            const SizedBox(height: 4),
            Row(children: [
              Text(numVal != null ? numVal.toStringAsFixed(1) : '—', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
              const SizedBox(width: 2),
              Text(numVal != null ? item.$3 : '', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
              const Spacer(),
              if (numChg != null && numChg != 0) ...[
                Icon(numChg > 0 ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded, size: 14, color: numChg > 0 ? AppColors.danger : AppColors.success),
                Text(numChg.abs().toStringAsFixed(1), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: numChg > 0 ? AppColors.danger : AppColors.success)),
              ],
            ]),
          ]),
        );
      }).toList(),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(color: AppColors.cardDark, borderRadius: BorderRadius.circular(16)),
      child: Column(children: [
        Icon(Icons.straighten, size: 40, color: AppColors.textMuted.withOpacity(0.5)),
        const SizedBox(height: 12),
        const Text('No measurements yet', style: TextStyle(color: AppColors.textMuted)),
        const SizedBox(height: 4),
        const Text('Tap "Log" to add your first entry', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
      ]),
    );
  }
}
