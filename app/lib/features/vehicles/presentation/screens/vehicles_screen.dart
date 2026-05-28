import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/widgets/app_panel.dart';
import '../../../../core/widgets/app_status_badge.dart';
import '../../../../shared/repositories/dev_operations_repository.dart';

class VehiclesScreen extends ConsumerWidget {
  const VehiclesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final vehicles = ref.watch(devOperationsRepositoryProvider).getVehicles();
    final km = NumberFormat.decimalPattern('ru_RU');

    return Scaffold(
      appBar: AppBar(title: const Text('Машины')),
      body: ListView.separated(
        padding: const EdgeInsets.all(24),
        itemCount: vehicles.length,
        separatorBuilder: (context, index) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final vehicle = vehicles[index];
          final tone = switch (vehicle.statusLabel) {
            'Активна' => AppStatusTone.success,
            'На сервисе' => AppStatusTone.warning,
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
                        '${vehicle.plateNumber} · ${vehicle.displayName}',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                      ),
                    ),
                    AppStatusBadge(label: vehicle.statusLabel, tone: tone),
                  ],
                ),
                const SizedBox(height: 10),
                Text('Пробег: ${km.format(vehicle.odometerKm)} км'),
                const SizedBox(height: 6),
                Text('Закреплено за: ${vehicle.assignedDriverName}'),
                const SizedBox(height: 6),
                Text(vehicle.lastServiceNote),
              ],
            ),
          );
        },
      ),
    );
  }
}
