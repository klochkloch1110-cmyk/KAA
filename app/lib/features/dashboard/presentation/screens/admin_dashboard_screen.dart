import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/widgets/app_panel.dart';
import '../../../../core/widgets/app_status_badge.dart';
import '../../../../shared/repositories/dev_operations_repository.dart';

class AdminDashboardScreen extends ConsumerWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final snapshot = ref.watch(devOperationsRepositoryProvider).getAdminDashboard();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Панель руководителя'),
        actions: [
          TextButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.add_rounded),
            label: const Text('Создать заявку'),
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Wrap(
            spacing: 16,
            runSpacing: 16,
            children: [
              _KpiCard(title: 'Активные заявки', value: '${snapshot.activeOrders}', icon: Icons.assignment_rounded),
              _KpiCard(title: 'Рейсы сегодня', value: '${snapshot.tripsToday}', icon: Icons.route_rounded),
              _KpiCard(title: 'Водители на смене', value: '${snapshot.driversOnShift}', icon: Icons.people_alt_rounded),
              _KpiCard(title: 'OCR/проверка', value: '${snapshot.ocrReviewCount}', icon: Icons.warning_rounded),
            ],
          ),
          const SizedBox(height: 24),
          AppPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Операционное ядро релиза 0.1',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 12),
                const Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    AppStatusBadge(label: 'Заявки', tone: AppStatusTone.info),
                    AppStatusBadge(label: 'Рейсы', tone: AppStatusTone.info),
                    AppStatusBadge(label: 'Фото ТТН', tone: AppStatusTone.warning),
                    AppStatusBadge(label: 'Смены', tone: AppStatusTone.info),
                    AppStatusBadge(label: 'Выгрузка', tone: AppStatusTone.muted),
                  ],
                ),
                const SizedBox(height: 18),
                for (final item in snapshot.focusItems) ...[
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.check_circle_outline_rounded, size: 18, color: Theme.of(context).colorScheme.primary),
                      const SizedBox(width: 10),
                      Expanded(child: Text(item)),
                    ],
                  ),
                  const SizedBox(height: 10),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  const _KpiCard({required this.title, required this.value, required this.icon});

  final String title;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 240,
      child: AppPanel(
        child: Row(
          children: [
            Icon(icon, color: Theme.of(context).colorScheme.primary),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: Theme.of(context).textTheme.bodySmall),
                  const SizedBox(height: 4),
                  Text(value, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
