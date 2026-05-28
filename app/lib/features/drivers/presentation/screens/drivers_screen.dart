import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/widgets/app_panel.dart';
import '../../../../core/widgets/app_status_badge.dart';
import '../../../../shared/repositories/dev_operations_repository.dart';

class DriversScreen extends ConsumerWidget {
  const DriversScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final drivers = ref.watch(devOperationsRepositoryProvider).getDrivers();
    final currency = NumberFormat.decimalPattern('ru_RU');

    return Scaffold(
      appBar: AppBar(title: const Text('Водители')),
      body: ListView.separated(
        padding: const EdgeInsets.all(24),
        itemCount: drivers.length,
        separatorBuilder: (context, index) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final driver = drivers[index];
          final tone = switch (driver.statusLabel) {
            'На смене' => AppStatusTone.success,
            'Назначен на заявку' => AppStatusTone.info,
            _ => AppStatusTone.muted,
          };

          return AppPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        driver.fullName,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                      ),
                    ),
                    AppStatusBadge(label: driver.statusLabel, tone: tone),
                  ],
                ),
                const SizedBox(height: 10),
                Text(driver.phone),
                const SizedBox(height: 6),
                Text('Назначенная машина: ${driver.assignedVehiclePlate}'),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 12,
                  children: [
                    Text('Рейсов сегодня: ${driver.tripsToday}'),
                    Text('Начислено: ${currency.format(driver.earningsToday)} ₽'),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
