import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/widgets/app_panel.dart';
import '../../../../shared/repositories/dev_operations_repository.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';

class DriverProfileScreen extends ConsumerWidget {
  const DriverProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).valueOrNull;
    final snapshot = ref.watch(devOperationsRepositoryProvider).getDriverHome(user);

    return Scaffold(
      appBar: AppBar(title: const Text('Профиль')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          AppPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user?.fullName ?? 'Водитель',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                Text('Телефон: ${user?.phone ?? '—'}'),
                const SizedBox(height: 6),
                Text('Текущий рабочий статус: ${snapshot.shiftStatusLabel}'),
                const SizedBox(height: 6),
                Text('Назначенная машина: ${snapshot.vehicleLabel}'),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const AppPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Следующий шаг для этого модуля'),
                SizedBox(height: 8),
                Text('Добавить редактирование профиля, смену пароля и настройки темы. Пока экран закрывает базовый рабочий контекст водителя.'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
