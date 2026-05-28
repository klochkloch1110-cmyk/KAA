import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_config.dart';
import '../../../../core/enums/user_role.dart';
import '../../../../core/widgets/app_panel.dart';
import '../../../../core/widgets/app_status_badge.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../controllers/trips_controller.dart';

class TripsScreen extends ConsumerStatefulWidget {
  const TripsScreen({super.key});

  @override
  ConsumerState<TripsScreen> createState() => _TripsScreenState();
}

class _TripsScreenState extends ConsumerState<TripsScreen> {
  bool _isLoadingRemoteTrips = false;
  String? _remoteTripsError;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _loadRemoteTrips();
    });
  }

  @override
  Widget build(BuildContext context) {
    final trips = ref.watch(tripsControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Рейсы')),
      body: ListView.separated(
        padding: const EdgeInsets.all(24),
        itemCount: trips.length + 1,
        separatorBuilder: (context, index) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          if (index == 0) {
            return AppPanel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Журнал рейсов уже подключен к локальному состоянию.'),
                  const SizedBox(height: 8),
                  const Text('Здесь админ видит ТТН, объем, фото, OCR-статус и может быстро понять, что нужно проверить.'),
                  if (_isLoadingRemoteTrips || _remoteTripsError != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      _isLoadingRemoteTrips
                          ? 'Загружаем рейсы из Supabase...'
                          : 'Не удалось загрузить рейсы из Supabase. Оставлены локальные dev-данные.\n$_remoteTripsError',
                    ),
                  ],
                ],
              ),
            );
          }

          final trip = trips[index - 1];
          final statusTone = switch (trip.statusLabel) {
            'Отправлен' => AppStatusTone.info,
            'Проверить' => AppStatusTone.warning,
            _ => AppStatusTone.muted,
          };
          final ocrTone = switch (trip.ocrStatusLabel) {
            'Есть расхождение' => AppStatusTone.warning,
            'OCR не требуется' => AppStatusTone.muted,
            _ => AppStatusTone.info,
          };

          return AppPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        '${trip.orderNumber} · ${trip.driverName}',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                      ),
                    ),
                    AppStatusBadge(label: trip.statusLabel, tone: statusTone),
                  ],
                ),
                const SizedBox(height: 8),
                Text('${trip.customerName} · ${trip.vehiclePlate}'),
                const SizedBox(height: 6),
                Text('ТТН: ${trip.ttnNumber} · объем: ${trip.volumeText}'),
                const SizedBox(height: 6),
                Text('Фото ТТН: ${trip.ttnPhotoName} · доп. фото: ${trip.supportingPhotosCount}'),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    AppStatusBadge(label: trip.ocrStatusLabel, tone: ocrTone),
                    AppStatusBadge(label: trip.createdAtLabel, tone: AppStatusTone.muted),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _loadRemoteTrips() async {
    if (!AppConfig.isSupabaseConfigured || _isLoadingRemoteTrips) {
      return;
    }

    setState(() {
      _isLoadingRemoteTrips = true;
      _remoteTripsError = null;
    });

    try {
      final user = ref.read(authControllerProvider).valueOrNull;
      if (user?.role == UserRole.driver && user?.isDev == false) {
        await ref.read(tripsControllerProvider.notifier).loadRemoteDriverTripsIfConfigured(user!.id);
      } else {
        await ref.read(tripsControllerProvider.notifier).loadRemoteAdminTripsIfConfigured();
      }
    } catch (error) {
      if (!mounted) return;
      setState(() => _remoteTripsError = error.toString());
    } finally {
      if (mounted) {
        setState(() => _isLoadingRemoteTrips = false);
      }
    }
  }
}
