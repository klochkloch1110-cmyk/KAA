import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/widgets/app_panel.dart';
import '../../../trips/presentation/widgets/trip_report_sheet.dart';
import '../../../orders/presentation/controllers/orders_controller.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';

class DriverOrdersScreen extends ConsumerWidget {
  const DriverOrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).valueOrNull;
    final allOrders = ref.watch(ordersControllerProvider);
    final orders = user == null
        ? const []
        : allOrders.where((order) => user.role.name != 'driver' || order.driverName == user.fullName).toList(growable: false);
    final currency = NumberFormat.decimalPattern('ru_RU');

    return Scaffold(
      appBar: AppBar(title: const Text('Мои заявки')),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: orders.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final order = orders[index];
          return AppPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  order.orderNumber,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                Text(order.customerName),
                const SizedBox(height: 6),
                Text(order.routeLabel),
                const SizedBox(height: 6),
                Text('${order.materialName} · ${order.volumeText}'),
                const SizedBox(height: 6),
                Text('Ставка: ${currency.format(order.driverRateRub)} ₽/рейс'),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.route_rounded),
                        label: const Text('Маршрут'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => showTripReportSheet(context, ref, order),
                        icon: const Icon(Icons.camera_alt_rounded),
                        label: const Text('Отчет по рейсу'),
                      ),
                    ),
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
