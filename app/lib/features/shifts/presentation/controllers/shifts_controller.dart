import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_config.dart';
import '../../../../shared/models/operations_models.dart';
import '../../../../shared/repositories/shifts_repository.dart';

final shiftsControllerProvider = StateNotifierProvider<ShiftsController, List<ShiftSummary>>((ref) {
  final shiftsRepository = ref.watch(shiftsRepositoryProvider);
  return ShiftsController(shiftsRepository: shiftsRepository);
});

class ShiftsController extends StateNotifier<List<ShiftSummary>> {
  ShiftsController({required ShiftsRepository shiftsRepository})
      : _shiftsRepository = shiftsRepository,
        super(const [
          ShiftSummary(
            id: 'shift-1',
            driverName: 'Петров Сергей Николаевич',
            vehiclePlate: 'М482ОР 790',
            statusLabel: 'Закрыта',
            shiftDateLabel: 'Сегодня',
            startTimeLabel: '08:00',
            endTimeLabel: '18:30',
            closingOdometerKm: 126540,
            fuelLiters: 85,
            totalTrips: 3,
            totalVolume: 54,
            totalEarningsRub: 4800,
            note: 'Без замечаний',
          ),
        ]);

  final ShiftsRepository _shiftsRepository;

  Future<void> loadRemoteShiftsIfConfigured() async {
    if (!AppConfig.isSupabaseConfigured) {
      return;
    }

    state = await _shiftsRepository.fetchShifts();
  }

  ShiftSummary? openShiftForDriver(String driverName) {
    final matches = state.where((item) => item.driverName == driverName && item.statusLabel == 'Открыта');
    return matches.isEmpty ? null : matches.first;
  }

  Future<void> openShift({
    required String driverName,
    required String vehiclePlate,
    String? driverId,
    String? vehicleId,
  }) async {
    if (openShiftForDriver(driverName) != null) {
      return;
    }

    if (AppConfig.isSupabaseConfigured && driverId != null && vehicleId != null) {
      final shift = await _shiftsRepository.openShift(driverId: driverId, vehicleId: vehicleId);
      state = [shift, ...state];
      return;
    }

    final shift = ShiftSummary(
      id: 'shift-${state.length + 1}',
      driverName: driverName,
      vehiclePlate: vehiclePlate,
      statusLabel: 'Открыта',
      shiftDateLabel: 'Сегодня',
      startTimeLabel: 'Сейчас',
      endTimeLabel: '—',
      closingOdometerKm: null,
      fuelLiters: null,
      totalTrips: 0,
      totalVolume: 0,
      totalEarningsRub: 0,
      note: '',
    );

    state = [shift, ...state];
  }

  Future<void> closeShift({
    required String shiftId,
    required int closingOdometerKm,
    required double fuelLiters,
    required String note,
    required List<TripReportSummary> trips,
    required List<OrderSummary> orders,
  }) async {
    final index = state.indexWhere((item) => item.id == shiftId);
    if (index == -1) {
      return;
    }

    final current = state[index];
    final driverTrips = trips.where((item) => item.shiftId == current.id).toList(growable: false);
    final totalVolume = driverTrips.fold<double>(0, (sum, item) => sum + item.volumeValue);
    final totalEarnings = driverTrips.fold<int>(0, (sum, trip) {
      final order = _findOrder(orders, trip.orderId);
      return sum + (order?.driverRateRub ?? 0);
    });

    if (AppConfig.isSupabaseConfigured) {
      final saved = await _shiftsRepository.closeShift(
        shiftId: shiftId,
        closingOdometerKm: closingOdometerKm,
        fuelLiters: fuelLiters,
        totalTrips: driverTrips.length,
        totalVolume: totalVolume,
        totalEarningsRub: totalEarnings,
        note: note,
      );

      final nextState = [...state];
      nextState[index] = saved;
      state = nextState;
      return;
    }

    final updated = current.copyWith(
      statusLabel: 'Закрыта',
      endTimeLabel: 'Сейчас',
      closingOdometerKm: closingOdometerKm,
      fuelLiters: fuelLiters,
      totalTrips: driverTrips.length,
      totalVolume: totalVolume,
      totalEarningsRub: totalEarnings,
      note: note.trim().isEmpty ? 'Без комментария' : note.trim(),
    );

    final nextState = [...state];
    nextState[index] = updated;
    state = nextState;
  }

  OrderSummary? _findOrder(List<OrderSummary> orders, String orderId) {
    final matches = orders.where((item) => item.id == orderId);
    return matches.isEmpty ? null : matches.first;
  }
}
