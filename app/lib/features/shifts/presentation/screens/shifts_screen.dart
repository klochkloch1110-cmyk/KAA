import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/app_config.dart';
import '../../../../core/enums/user_role.dart';
import '../../../../core/widgets/app_panel.dart';
import '../../../../core/widgets/app_status_badge.dart';
import '../../../../shared/repositories/dev_operations_repository.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../../../orders/presentation/controllers/orders_controller.dart';
import '../../../trips/presentation/controllers/trips_controller.dart';
import '../controllers/shifts_controller.dart';

class ShiftsScreen extends ConsumerStatefulWidget {
  const ShiftsScreen({super.key});

  @override
  ConsumerState<ShiftsScreen> createState() => _ShiftsScreenState();
}

class _ShiftsScreenState extends ConsumerState<ShiftsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _odometerController = TextEditingController();
  final _fuelController = TextEditingController(text: '0');
  final _noteController = TextEditingController();
  bool _isLoadingRemoteShifts = false;
  bool _isSavingShift = false;
  String? _remoteShiftsError;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _loadRemoteShifts();
    });
  }

  @override
  void dispose() {
    _odometerController.dispose();
    _fuelController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authControllerProvider).valueOrNull;
    final shifts = ref.watch(shiftsControllerProvider);
    final trips = ref.watch(tripsControllerProvider);
    final orders = ref.watch(ordersControllerProvider);
    final isDriver = user?.role == UserRole.driver;
    final currency = NumberFormat.decimalPattern('ru_RU');

    if (isDriver) {
      final openShift = user == null ? null : ref.read(shiftsControllerProvider.notifier).openShiftForDriver(user.fullName);
      final driverTrips = openShift == null ? const [] : trips.where((item) => item.shiftId == openShift.id).toList(growable: false);
      final orderBreakdown = _buildOrderBreakdown(driverTrips, orders);
      final vehiclePlate = _resolveVehiclePlate(user?.fullName, orders, driverTrips);
      final minOdometerKm = _resolveLastOdometerKm(vehiclePlate);
      final totalVolume = driverTrips.fold<double>(0, (sum, item) => sum + item.volumeValue);
      final totalEarnings = driverTrips.fold<int>(0, (sum, trip) {
        final matches = orders.where((order) => order.id == trip.orderId);
        return sum + (matches.isEmpty ? 0 : matches.first.driverRateRub);
      });

      return Scaffold(
        appBar: AppBar(title: const Text('Моя смена')),
        body: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            AppPanel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          openShift == null ? 'Смена еще не открыта' : 'Смена открыта',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                        ),
                      ),
                      AppStatusBadge(
                        label: openShift?.statusLabel ?? 'Ожидание',
                        tone: openShift == null ? AppStatusTone.muted : AppStatusTone.success,
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text('Водитель: ${user?.fullName ?? '—'}'),
                  const SizedBox(height: 6),
                  Text('Машина: $vehiclePlate'),
                  const SizedBox(height: 18),
                  if (openShift == null)
                    FilledButton.icon(
                      onPressed: user == null
                          ? null
                          : () {
                              _openShift(user.fullName, vehiclePlate, orders);
                            },
                      icon: const Icon(Icons.play_arrow_rounded),
                      label: const Text('Открыть смену'),
                    )
                  else
                    _CloseShiftForm(
                      formKey: _formKey,
                      odometerController: _odometerController,
                      fuelController: _fuelController,
                      noteController: _noteController,
                      minOdometerKm: minOdometerKm,
                      onSubmit: () => _closeShift(openShift.id),
                      isSaving: _isSavingShift,
                    ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: _MetricCard(title: 'Рейсов', value: '${driverTrips.length}')),
                const SizedBox(width: 12),
                Expanded(child: _MetricCard(title: 'Объем', value: _formatVolume(totalVolume))),
              ],
            ),
            const SizedBox(height: 12),
            _MetricCard(title: 'Предварительно начислено', value: '${currency.format(totalEarnings)} ₽'),
            const SizedBox(height: 16),
            AppPanel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Итог по заявкам за смену',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 12),
                  if (orderBreakdown.isEmpty)
                    const Text('Пока нет рейсов по заявкам.')
                  else
                    for (final item in orderBreakdown) ...[
                      Text('${item.orderNumber} · рейсов: ${item.tripsCount} · объем: ${_formatVolume(item.volume)}'),
                      const SizedBox(height: 8),
                    ],
                ],
              ),
            ),
            const SizedBox(height: 16),
            AppPanel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Рейсы текущей смены',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 12),
                  if (driverTrips.isEmpty)
                    const Text('Пока нет отправленных рейсовых отчетов.')
                  else
                    for (final trip in driverTrips) ...[
                      Text('${trip.ttnNumber} · ${trip.volumeText} · ${trip.orderNumber}'),
                      const SizedBox(height: 8),
                    ],
                ],
              ),
            ),
          ],
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Смены')),
      body: ListView.separated(
        padding: const EdgeInsets.all(24),
        itemCount: shifts.length + 1,
        separatorBuilder: (context, index) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          if (index == 0) {
            return AppPanel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Журнал смен'),
                  const SizedBox(height: 8),
                  const Text('Админ видит открытые и закрытые смены, итоговые рейсы, объем, пробег и заправку.'),
                  if (_isLoadingRemoteShifts || _remoteShiftsError != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      _isLoadingRemoteShifts
                          ? 'Загружаем смены из Supabase...'
                          : 'Не удалось загрузить смены из Supabase. Оставлены локальные dev-данные.\n$_remoteShiftsError',
                    ),
                  ],
                ],
              ),
            );
          }

          final shift = shifts[index - 1];
          final shiftTrips = trips.where((item) => item.shiftId == shift.id).toList(growable: false);
          final orderBreakdown = _buildOrderBreakdown(shiftTrips, orders);
          final tone = shift.statusLabel == 'Открыта' ? AppStatusTone.success : AppStatusTone.info;

          return AppPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        '${shift.driverName} · ${shift.vehiclePlate}',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                      ),
                    ),
                    AppStatusBadge(label: shift.statusLabel, tone: tone),
                  ],
                ),
                const SizedBox(height: 8),
                Text('${shift.shiftDateLabel} · ${shift.startTimeLabel} - ${shift.endTimeLabel}'),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 12,
                  runSpacing: 8,
                  children: [
                    Text('Рейсов: ${shift.totalTrips}'),
                    Text('Объем: ${_formatVolume(shift.totalVolume)}'),
                    Text('Начислено: ${currency.format(shift.totalEarningsRub)} ₽'),
                    Text('Пробег: ${shift.closingOdometerKm == null ? '—' : '${shift.closingOdometerKm} км'}'),
                    Text('ДТ: ${shift.fuelLiters == null ? '—' : '${shift.fuelLiters} л'}'),
                  ],
                ),
                if (shift.note.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text('Комментарий: ${shift.note}'),
                ],
                if (orderBreakdown.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Text('Разбивка по заявкам:', style: Theme.of(context).textTheme.titleSmall),
                  const SizedBox(height: 6),
                  for (final item in orderBreakdown) ...[
                    Text('${item.orderNumber}: ${item.tripsCount} рейс., ${_formatVolume(item.volume)}, админ-итог ${currency.format(item.adminAmountRub)} ₽'),
                    const SizedBox(height: 4),
                  ],
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _loadRemoteShifts() async {
    if (!AppConfig.isSupabaseConfigured || _isLoadingRemoteShifts) {
      return;
    }

    setState(() {
      _isLoadingRemoteShifts = true;
      _remoteShiftsError = null;
    });

    try {
      await ref.read(shiftsControllerProvider.notifier).loadRemoteShiftsIfConfigured();
    } catch (error) {
      if (!mounted) return;
      setState(() => _remoteShiftsError = error.toString());
    } finally {
      if (mounted) {
        setState(() => _isLoadingRemoteShifts = false);
      }
    }
  }

  Future<void> _openShift(String driverName, String vehiclePlate, List<dynamic> orders) async {
    if (_isSavingShift) {
      return;
    }

    final vehicleMatches = orders.where((order) => order.driverName == driverName && order.assignedVehicleId != null);
    final vehicleId = vehicleMatches.isEmpty ? null : vehicleMatches.first.assignedVehicleId as String?;
    final user = ref.read(authControllerProvider).valueOrNull;

    setState(() => _isSavingShift = true);
    try {
      await ref.read(shiftsControllerProvider.notifier).openShift(
            driverName: driverName,
            vehiclePlate: vehiclePlate,
            driverId: user?.isDev == false ? user?.id : null,
            vehicleId: vehicleId,
          );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Не удалось открыть смену: $error')));
    } finally {
      if (mounted) {
        setState(() => _isSavingShift = false);
      }
    }
  }

  Future<void> _closeShift(String shiftId) async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isSavingShift = true);
    try {
      await ref.read(shiftsControllerProvider.notifier).closeShift(
            shiftId: shiftId,
            closingOdometerKm: int.tryParse(_odometerController.text.trim()) ?? 0,
            fuelLiters: double.tryParse(_fuelController.text.trim().replaceAll(',', '.')) ?? 0,
            note: _noteController.text,
            trips: ref.read(tripsControllerProvider),
            orders: ref.read(ordersControllerProvider),
          );

      if (!mounted) return;
      _odometerController.clear();
      _fuelController.text = '0';
      _noteController.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Смена закрыта. Итоги рассчитаны автоматически.')),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Не удалось закрыть смену: $error')));
    } finally {
      if (mounted) {
        setState(() => _isSavingShift = false);
      }
    }
  }

  int? _resolveLastOdometerKm(String vehiclePlate) {
    final vehicles = ref.read(devOperationsRepositoryProvider).getVehicles();
    final matches = vehicles.where((item) => item.plateNumber == vehiclePlate);
    return matches.isEmpty ? null : matches.first.odometerKm;
  }
}

class _CloseShiftForm extends StatelessWidget {
  const _CloseShiftForm({
    required this.formKey,
    required this.odometerController,
    required this.fuelController,
    required this.noteController,
    required this.minOdometerKm,
    required this.onSubmit,
    required this.isSaving,
  });

  final GlobalKey<FormState> formKey;
  final TextEditingController odometerController;
  final TextEditingController fuelController;
  final TextEditingController noteController;
  final int? minOdometerKm;
  final VoidCallback onSubmit;
  final bool isSaving;

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
      child: Column(
        children: [
          TextFormField(
            controller: odometerController,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: 'Пробег на конец смены, км',
              helperText: minOdometerKm == null ? null : 'Не меньше последнего пробега: $minOdometerKm км',
            ),
            validator: (value) {
              if ((value ?? '').trim().isEmpty) {
                return 'Укажите пробег';
              }
              final odometer = int.tryParse(value!.trim()) ?? -1;
              if (odometer <= 0) {
                return 'Пробег должен быть положительным';
              }
              final minValue = minOdometerKm;
              if (minValue != null && odometer < minValue) {
                return 'Пробег не может быть меньше $minValue км';
              }
              return null;
            },
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: fuelController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(labelText: 'Заправлено ДТ, л'),
            validator: (value) {
              if ((double.tryParse((value ?? '').trim().replaceAll(',', '.')) ?? -1) < 0) {
                return 'Литры не могут быть отрицательными';
              }
              return null;
            },
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: noteController,
            maxLines: 3,
            decoration: const InputDecoration(labelText: 'Комментарий по смене'),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: isSaving ? null : onSubmit,
              icon: isSaving
                  ? const SizedBox.square(
                      dimension: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.lock_clock_rounded),
              label: Text(isSaving ? 'Закрываем...' : 'Закрыть смену'),
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.title, required this.value});

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

String _resolveVehiclePlate(String? driverName, List<dynamic> orders, List<dynamic> trips) {
  if (driverName == null) {
    return '—';
  }

  final orderMatches = orders.where((order) => order.driverName == driverName && order.vehiclePlate != '—');
  if (orderMatches.isNotEmpty) {
    return orderMatches.first.vehiclePlate as String;
  }

  final tripMatches = trips.where((trip) => trip.driverName == driverName && trip.vehiclePlate != '—');
  if (tripMatches.isNotEmpty) {
    return tripMatches.first.vehiclePlate as String;
  }

  return '—';
}

String _formatVolume(double value) {
  if (value == value.roundToDouble()) {
    return '${value.round()} т';
  }

  return '${value.toStringAsFixed(1)} т';
}

List<_OrderBreakdown> _buildOrderBreakdown(List<dynamic> trips, List<dynamic> orders) {
  final result = <String, _OrderBreakdown>{};

  for (final trip in trips) {
    final orderMatches = orders.where((order) => order.id == trip.orderId);
    final order = orderMatches.isEmpty ? null : orderMatches.first;
    final key = trip.orderId as String;
    final current = result[key];
    final volume = trip.volumeValue as double;
    final adminRate = order == null ? 0 : order.adminRatePerUnitRub as int;
    final orderNumber = trip.orderNumber as String;

    result[key] = _OrderBreakdown(
      orderNumber: orderNumber,
      tripsCount: (current?.tripsCount ?? 0) + 1,
      volume: (current?.volume ?? 0) + volume,
      adminAmountRub: (current?.adminAmountRub ?? 0) + (volume * adminRate).round(),
    );
  }

  return result.values.toList(growable: false);
}

class _OrderBreakdown {
  const _OrderBreakdown({
    required this.orderNumber,
    required this.tripsCount,
    required this.volume,
    required this.adminAmountRub,
  });

  final String orderNumber;
  final int tripsCount;
  final double volume;
  final int adminAmountRub;
}
