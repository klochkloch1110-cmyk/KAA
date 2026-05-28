import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';

import '../../../../core/widgets/app_panel.dart';
import '../../../../shared/models/operations_models.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../../../shifts/presentation/controllers/shifts_controller.dart';
import '../controllers/trips_controller.dart';

Future<void> showTripReportSheet(BuildContext context, WidgetRef ref, OrderSummary order) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (context) => _TripReportSheet(order: order, ref: ref),
  );
}

class _TripReportSheet extends StatefulWidget {
  const _TripReportSheet({required this.order, required this.ref});

  final OrderSummary order;
  final WidgetRef ref;

  @override
  State<_TripReportSheet> createState() => _TripReportSheetState();
}

class _TripReportSheetState extends State<_TripReportSheet> {
  final _formKey = GlobalKey<FormState>();
  final _ttnController = TextEditingController();
  final _volumeController = TextEditingController();
  final _ttnPhotoController = TextEditingController();
  final _supportingPhotosController = TextEditingController(text: '0');
  final _commentController = TextEditingController();

  String _volumeUnit = 'т';
  PlatformFile? _ttnPhotoFile;
  bool _runOcrCheck = true;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _ttnController.dispose();
    _volumeController.dispose();
    _ttnPhotoController.dispose();
    _supportingPhotosController.dispose();
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final insets = MediaQuery.viewInsetsOf(context);

    return Padding(
      padding: EdgeInsets.only(bottom: insets.bottom),
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
        child: AppPanel(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Отчет по рейсу',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                Text('${widget.order.orderNumber} · ${widget.order.customerName}'),
                const SizedBox(height: 4),
                Text(widget.order.routeLabel),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _ttnController,
                  decoration: const InputDecoration(labelText: 'Номер ТТН'),
                  validator: _required,
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _volumeController,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        decoration: const InputDecoration(labelText: 'Объем по рейсу'),
                        validator: _required,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: _volumeUnit,
                        decoration: const InputDecoration(labelText: 'Ед. измерения'),
                        items: const [
                          DropdownMenuItem(value: 'т', child: Text('т')),
                          DropdownMenuItem(value: 'м3', child: Text('м3')),
                        ],
                        onChanged: (value) => setState(() => _volumeUnit = value ?? 'т'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _ttnPhotoController,
                        readOnly: true,
                        decoration: const InputDecoration(labelText: 'Фото/файл ТТН'),
                        validator: _required,
                      ),
                    ),
                    const SizedBox(width: 12),
                    FilledButton.tonalIcon(
                      onPressed: _isSubmitting ? null : _pickTtnPhoto,
                      icon: const Icon(Icons.attach_file_rounded),
                      label: const Text('Выбрать'),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _supportingPhotosController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Кол-во доп. фото'),
                  validator: (value) {
                    if ((value ?? '').trim().isEmpty) {
                      return 'Укажите количество';
                    }
                    if ((int.tryParse(value!.trim()) ?? -1) < 0) {
                      return 'Количество не может быть отрицательным';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _commentController,
                  maxLines: 3,
                  decoration: const InputDecoration(labelText: 'Комментарий водителя'),
                ),
                const SizedBox(height: 12),
                SwitchListTile.adaptive(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Запустить OCR-сверку'),
                  subtitle: const Text('Пока в dev-режиме это только статус в журнале.'),
                  value: _runOcrCheck,
                  onChanged: (value) => setState(() => _runOcrCheck = value),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('Отмена'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: _isSubmitting ? null : _submit,
                        icon: _isSubmitting
                            ? const SizedBox.square(
                                dimension: 18,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.send_rounded),
                        label: Text(_isSubmitting ? 'Отправляем...' : 'Отправить отчет'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final user = widget.ref.read(authControllerProvider).valueOrNull;
    final openShift = user == null ? null : widget.ref.read(shiftsControllerProvider.notifier).openShiftForDriver(user.fullName);

    setState(() => _isSubmitting = true);
    try {
      await widget.ref.read(tripsControllerProvider.notifier).submitReport(
            TripReportDraft(
              order: widget.order,
              ttnNumber: _ttnController.text,
              volumeValue: _volumeController.text,
              volumeUnit: _volumeUnit,
              ttnPhotoName: _ttnPhotoController.text,
              ttnPhotoBytes: _ttnPhotoFile?.bytes,
              supportingPhotosCount: int.tryParse(_supportingPhotosController.text.trim()) ?? 0,
              runOcrCheck: _runOcrCheck,
              comment: _commentController.text,
              shiftId: openShift?.id,
              driverId: user?.isDev == false ? user?.id : null,
              vehicleId: widget.order.assignedVehicleId,
            ),
          );

      if (!mounted) return;
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Рейсовый отчет отправлен.')),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Не удалось отправить рейсовый отчет: $error')));
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  Future<void> _pickTtnPhoto() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: const ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
      withData: true,
    );

    final file = result?.files.single;
    if (file == null) return;

    setState(() {
      _ttnPhotoFile = file;
      _ttnPhotoController.text = file.name;
    });
  }

  String? _required(String? value) {
    if ((value ?? '').trim().isEmpty) {
      return 'Заполните поле';
    }
    return null;
  }
}
