import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/app_config.dart';
import '../../../../core/widgets/app_panel.dart';
import '../../../../shared/models/operations_models.dart';
import '../../../../shared/repositories/trips_repository.dart';
import '../../../trips/presentation/controllers/trips_controller.dart';

class DocumentsScreen extends ConsumerWidget {
  const DocumentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trips = ref.watch(tripsControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Документы')),
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
                  Text(
                    'Архив документов',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 8),
                  const Text('Первый контур архива строится из рейсовых отчетов: ТТН, доп. фото, водитель, машина и заявка.'),
                ],
              ),
            );
          }

          final trip = trips[index - 1];
          return AppPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        '${trip.orderNumber} · ${trip.ttnNumber}',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                      ),
                    ),
                    const Icon(Icons.description_rounded),
                  ],
                ),
                const SizedBox(height: 8),
                Text('${trip.customerName} · ${trip.driverName} · ${trip.vehiclePlate}'),
                const SizedBox(height: 6),
                Text('Файл ТТН: ${trip.ttnPhotoName}'),
                if (trip.ttnDocumentPath != null) ...[
                  const SizedBox(height: 6),
                  Text('Storage: ${trip.ttnDocumentPath}'),
                ],
                const SizedBox(height: 6),
                Text('Доп. фото: ${trip.supportingPhotosCount} · создано: ${trip.createdAtLabel}'),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    FilledButton.tonalIcon(
                      onPressed: () => _showDocumentDetails(context, trip),
                      icon: const Icon(Icons.visibility_rounded),
                      label: const Text('Открыть карточку'),
                    ),
                    FilledButton.icon(
                      onPressed: () => _openTtnFile(context, ref, trip),
                      icon: const Icon(Icons.open_in_new_rounded),
                      label: const Text('Открыть файл'),
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

  void _showDocumentDetails(BuildContext context, TripReportSummary trip) {
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('ТТН ${trip.ttnNumber}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Заявка: ${trip.orderNumber}'),
            Text('Заказчик: ${trip.customerName}'),
            Text('Водитель: ${trip.driverName}'),
            Text('Машина: ${trip.vehiclePlate}'),
            Text('Файл: ${trip.ttnPhotoName}'),
            Text('Storage path: ${trip.ttnDocumentPath ?? 'нет в dev-режиме'}'),
            Text('OCR: ${trip.ocrStatusLabel}'),
            const SizedBox(height: 12),
            const Text('В dev-режиме доступна карточка документа. В Supabase-контуре файл хранится в Storage, метаданные — в таблице documents.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Закрыть'),
          ),
        ],
      ),
    );
  }

  Future<void> _openTtnFile(BuildContext context, WidgetRef ref, TripReportSummary trip) async {
    if (!AppConfig.isSupabaseConfigured) {
      _showMessage(context, 'В dev-режиме файл не загружается в Storage. Доступна только карточка документа.');
      return;
    }

    final filePath = trip.ttnDocumentPath;
    if (filePath == null || filePath.isEmpty) {
      _showMessage(context, 'У этого рейса пока нет пути к файлу ТТН в Storage.');
      return;
    }

    try {
      final url = await ref.read(tripsRepositoryProvider).createTtnDocumentUrl(filePath);
      final uri = Uri.parse(url);
      final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!opened && context.mounted) {
        _showMessage(context, 'Не удалось открыть файл ТТН.');
      }
    } catch (error) {
      if (!context.mounted) return;
      _showMessage(context, 'Не удалось получить ссылку на файл ТТН: $error');
    }
  }

  void _showMessage(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }
}
