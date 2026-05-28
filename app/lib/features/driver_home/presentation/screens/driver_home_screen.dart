import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/widgets/app_panel.dart';
import '../../../../core/widgets/app_status_badge.dart';
import '../../../../shared/models/operations_models.dart';
import '../../../../shared/repositories/dev_operations_repository.dart';
import '../../../auth/domain/app_user.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../../../orders/presentation/controllers/orders_controller.dart';
import '../../../trips/presentation/controllers/trips_controller.dart';
import '../../../trips/presentation/widgets/trip_report_sheet.dart';

class DriverHomeScreen extends ConsumerWidget {
  const DriverHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).valueOrNull;
    final snapshot = ref.watch(devOperationsRepositoryProvider).getDriverHome(user);
    final orders = ref.watch(ordersControllerProvider);
    final trips = ref.watch(tripsControllerProvider);
    final currency = NumberFormat.decimalPattern('ru_RU');
    final activeOrders = _resolveActiveOrders(user, orders);
    final activeOrder = activeOrders.isNotEmpty ? activeOrders.first : snapshot.activeOrder;
    final driverTrips = _resolveDriverTrips(user, trips);
    final tripsCount = driverTrips.length;
    final earningsValue = _calculateDriverEarnings(driverTrips, orders, fallback: snapshot.earningsRub);
    final ttnNumbers = driverTrips.map((item) => item.ttnNumber).toList(growable: false);

    return Scaffold(
      appBar: AppBar(title: const Text('Главная водителя')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          AppPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppStatusBadge(label: snapshot.shiftStatusLabel, tone: AppStatusTone.success),
                const SizedBox(height: 14),
                Text(
                  snapshot.driverName,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 6),
                Text(
                  'Машина: ${snapshot.vehicleLabel}',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
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
                  activeOrders.length > 1 ? 'Активные заявки' : 'Активная заявка',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 12),
                if ((activeOrders.isNotEmpty ? activeOrders : [if (activeOrder != null) activeOrder]).isNotEmpty) ...[
                  for (final order in (activeOrders.isNotEmpty ? activeOrders : [activeOrder!])) ...[
                    Text('${order.orderNumber} · ${order.customerName}'),
                    const SizedBox(height: 8),
                    Text(order.routeLabel),
                    const SizedBox(height: 8),
                    Text('Материал: ${order.materialName} · ставка: ${currency.format(order.driverRateRub)} ₽/рейс'),
                    const SizedBox(height: 12),
                    FilledButton.icon(
                      onPressed: () => showTripReportSheet(context, ref, order),
                      icon: const Icon(Icons.camera_alt_rounded),
                      label: const Text('Отчитаться по этой заявке'),
                    ),
                    const Divider(height: 24),
                  ],
                ] else
                  Text(
                    'Сейчас нет активной заявки. Можно подготовить водителю экран ожидания и уведомление о новом назначении.',
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _DriverMetric(title: 'Рейсов', value: '$tripsCount')),
              const SizedBox(width: 12),
              Expanded(child: _DriverMetric(title: 'Заработано', value: '${currency.format(earningsValue)} ₽')),
            ],
          ),
          const SizedBox(height: 16),
          AppPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Уже отправленные ТТН за смену',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final ttn in (ttnNumbers.isEmpty ? snapshot.completedTtns : ttnNumbers))
                      AppStatusBadge(label: ttn, tone: AppStatusTone.info),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

List<TripReportSummary> _resolveDriverTrips(AppUser? user, List<TripReportSummary> trips) {
  if (user == null) {
    return const [];
  }

  return trips.where((item) => item.driverName == user.fullName).toList(growable: false);
}

List<OrderSummary> _resolveActiveOrders(AppUser? user, List<OrderSummary> orders) {
  if (user == null) {
    return const [];
  }

  return orders.where((order) {
    final isForDriver = order.driverName == user.fullName;
    final isActive = order.statusLabel == 'Назначена' || order.statusLabel == 'В работе';
    return isForDriver && isActive;
  }).toList(growable: false);
}

int _calculateDriverEarnings(List<TripReportSummary> trips, List<OrderSummary> orders, {required int fallback}) {
  if (trips.isEmpty) {
    return fallback;
  }

  return trips.fold<int>(0, (sum, trip) {
    final matches = orders.where((order) => order.id == trip.orderId);
    return sum + (matches.isEmpty ? 0 : matches.first.driverRateRub);
  });
}

class _DriverMetric extends StatelessWidget {
  const _DriverMetric({required this.title, required this.value});

  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return AppPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 4),
          Text(value, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }
}
