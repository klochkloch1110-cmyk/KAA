import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/widgets/app_panel.dart';
import '../../../../shared/models/operations_models.dart';
import '../../../orders/presentation/controllers/orders_controller.dart';
import '../../../trips/presentation/controllers/trips_controller.dart';

class ReportsScreen extends ConsumerStatefulWidget {
  const ReportsScreen({super.key});

  @override
  ConsumerState<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends ConsumerState<ReportsScreen> {
  late DateTime _periodStart;
  late DateTime _periodEnd;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _periodStart = DateTime(now.year, now.month, now.day);
    _periodEnd = DateTime(now.year, now.month, now.day);
  }

  @override
  Widget build(BuildContext context) {
    final trips = ref.watch(tripsControllerProvider);
    final orders = ref.watch(ordersControllerProvider);
    final filteredTrips = trips.where(_isTripInSelectedPeriod).toList(growable: false);
    final csv = _buildTripsCsv(filteredTrips, orders);
    final dateFormat = DateFormat('dd.MM.yyyy', 'ru_RU');
    final totalVolume = filteredTrips.fold<double>(0, (sum, item) => sum + item.volumeValue);
    final totalEarnings = filteredTrips.fold<int>(0, (sum, trip) {
      final matches = orders.where((order) => order.id == trip.orderId);
      return sum + (matches.isEmpty ? 0 : matches.first.driverRateRub);
    });
    final adminTotal = filteredTrips.fold<int>(0, (sum, trip) {
      final matches = orders.where((order) => order.id == trip.orderId);
      final rate = matches.isEmpty ? 0 : matches.first.adminRatePerUnitRub;
      return sum + (trip.volumeValue * rate).round();
    });
    final currency = NumberFormat.decimalPattern('ru_RU');

    return Scaffold(
      appBar: AppBar(title: const Text('Отчеты')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          AppPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Выгрузка рейсов за период',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                const Text('Первый отчет релиза 0.1: простая таблица рейсов для сверки с заказчиком и внутреннего учета.'),
                const SizedBox(height: 18),
                Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: [
                    OutlinedButton.icon(
                      onPressed: () => _pickDate(isStart: true),
                      icon: const Icon(Icons.calendar_month_rounded),
                      label: Text('С: ${dateFormat.format(_periodStart)}'),
                    ),
                    OutlinedButton.icon(
                      onPressed: () => _pickDate(isStart: false),
                      icon: const Icon(Icons.event_rounded),
                      label: Text('По: ${dateFormat.format(_periodEnd)}'),
                    ),
                    FilledButton.icon(
                      onPressed: () => _copyCsv(csv),
                      icon: const Icon(Icons.copy_rounded),
                      label: const Text('Скопировать CSV'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 16,
            runSpacing: 16,
            children: [
              _ReportMetric(title: 'Рейсов', value: '${filteredTrips.length}'),
              _ReportMetric(title: 'Общий объем', value: _formatVolume(totalVolume)),
              _ReportMetric(title: 'Начислено водителям', value: '${currency.format(totalEarnings)} ₽'),
              _ReportMetric(title: 'Админ-итог по ставке/ед.', value: '${currency.format(adminTotal)} ₽'),
            ],
          ),
          const SizedBox(height: 16),
          AppPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Предпросмотр таблицы',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: DataTable(
                    columns: const [
                      DataColumn(label: Text('Дата')),
                      DataColumn(label: Text('Заявка')),
                      DataColumn(label: Text('Заказчик')),
                      DataColumn(label: Text('Водитель')),
                      DataColumn(label: Text('Машина')),
                      DataColumn(label: Text('ТТН')),
                      DataColumn(label: Text('Объем')),
                      DataColumn(label: Text('Админ ставка/ед.')),
                      DataColumn(label: Text('Админ сумма')),
                      DataColumn(label: Text('Статус')),
                    ],
                    rows: [
                      for (final trip in filteredTrips)
                        DataRow(
                          cells: [
                            DataCell(Text(trip.createdAtLabel)),
                            DataCell(Text(trip.orderNumber)),
                            DataCell(Text(trip.customerName)),
                            DataCell(Text(trip.driverName)),
                            DataCell(Text(trip.vehiclePlate)),
                            DataCell(Text(trip.ttnNumber)),
                            DataCell(Text(trip.volumeText)),
                            DataCell(Text('${currency.format(_findAdminRate(orders, trip.orderId))} ₽')),
                            DataCell(Text('${currency.format((trip.volumeValue * _findAdminRate(orders, trip.orderId)).round())} ₽')),
                            DataCell(Text(trip.statusLabel)),
                          ],
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          AppPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'CSV',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 12),
                SelectableText(
                  csv,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(fontFamily: 'monospace'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickDate({required bool isStart}) async {
    final current = isStart ? _periodStart : _periodEnd;
    final picked = await showDatePicker(
      context: context,
      initialDate: current,
      firstDate: DateTime(2024),
      lastDate: DateTime(2030),
      locale: const Locale('ru'),
    );

    if (picked == null || !mounted) {
      return;
    }

    setState(() {
      if (isStart) {
        _periodStart = picked;
        if (_periodEnd.isBefore(_periodStart)) {
          _periodEnd = picked;
        }
      } else {
        _periodEnd = picked;
        if (_periodStart.isAfter(_periodEnd)) {
          _periodStart = picked;
        }
      }
    });
  }

  Future<void> _copyCsv(String csv) async {
    await Clipboard.setData(ClipboardData(text: csv));
    if (!mounted) {
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('CSV скопирован в буфер обмена.')),
    );
  }

  bool _isTripInSelectedPeriod(TripReportSummary trip) {
    final createdAt = trip.createdAt;
    final day = DateTime(createdAt.year, createdAt.month, createdAt.day);
    return !day.isBefore(_periodStart) && !day.isAfter(_periodEnd);
  }
}

class _ReportMetric extends StatelessWidget {
  const _ReportMetric({required this.title, required this.value});

  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 240,
      child: AppPanel(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 4),
            Text(value, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)),
          ],
        ),
      ),
    );
  }
}

String _buildTripsCsv(List<dynamic> trips, List<dynamic> orders) {
  final rows = <List<String>>[
    ['Дата', 'Заявка', 'Заказчик', 'Водитель', 'Машина', 'ТТН', 'Объем', 'Статус', 'OCR', 'Ставка водителя', 'Админ ставка за ед.', 'Админ сумма'],
    for (final trip in trips)
      [
        trip.createdAtLabel as String,
        trip.orderNumber as String,
        trip.customerName as String,
        trip.driverName as String,
        trip.vehiclePlate as String,
        trip.ttnNumber as String,
        trip.volumeText as String,
        trip.statusLabel as String,
        trip.ocrStatusLabel as String,
        '${_findRate(orders, trip.orderId as String)}',
        '${_findAdminRate(orders, trip.orderId as String)}',
        '${((trip.volumeValue as double) * _findAdminRate(orders, trip.orderId as String)).round()}',
      ],
  ];

  return rows.map((row) => row.map(_escapeCsvCell).join(';')).join('\n');
}

int _findRate(List<dynamic> orders, String orderId) {
  final matches = orders.where((order) => order.id == orderId);
  return matches.isEmpty ? 0 : matches.first.driverRateRub as int;
}

int _findAdminRate(List<dynamic> orders, String orderId) {
  final matches = orders.where((order) => order.id == orderId);
  return matches.isEmpty ? 0 : matches.first.adminRatePerUnitRub as int;
}

String _escapeCsvCell(String value) {
  final escaped = value.replaceAll('"', '""');
  if (escaped.contains(';') || escaped.contains('\n') || escaped.contains('"')) {
    return '"$escaped"';
  }
  return escaped;
}

String _formatVolume(double value) {
  if (value == value.roundToDouble()) {
    return '${value.round()} т';
  }
  return '${value.toStringAsFixed(1)} т';
}
