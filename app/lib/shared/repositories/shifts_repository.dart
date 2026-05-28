import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/constants/app_config.dart';
import '../models/operations_models.dart';

final shiftsRepositoryProvider = Provider<ShiftsRepository>((ref) {
  if (AppConfig.isSupabaseConfigured) {
    return SupabaseShiftsRepository(Supabase.instance.client);
  }

  return const UnsupportedShiftsRepository();
});

abstract class ShiftsRepository {
  Future<List<ShiftSummary>> fetchShifts();

  Future<ShiftSummary?> fetchOpenShift(String driverId);

  Future<ShiftSummary> openShift({required String driverId, required String vehicleId});

  Future<ShiftSummary> closeShift({
    required String shiftId,
    required int closingOdometerKm,
    required double fuelLiters,
    required int totalTrips,
    required double totalVolume,
    required int totalEarningsRub,
    required String note,
  });
}

class UnsupportedShiftsRepository implements ShiftsRepository {
  const UnsupportedShiftsRepository();

  @override
  Future<List<ShiftSummary>> fetchShifts() async {
    throw UnsupportedError('Supabase не настроен. Сейчас используется локальный dev-контур.');
  }

  @override
  Future<ShiftSummary?> fetchOpenShift(String driverId) async {
    throw UnsupportedError('Supabase не настроен. Сейчас используется локальный dev-контур.');
  }

  @override
  Future<ShiftSummary> openShift({required String driverId, required String vehicleId}) async {
    throw UnsupportedError('Supabase не настроен. Сейчас используется локальный dev-контур.');
  }

  @override
  Future<ShiftSummary> closeShift({
    required String shiftId,
    required int closingOdometerKm,
    required double fuelLiters,
    required int totalTrips,
    required double totalVolume,
    required int totalEarningsRub,
    required String note,
  }) async {
    throw UnsupportedError('Supabase не настроен. Сейчас используется локальный dev-контур.');
  }
}

class SupabaseShiftsRepository implements ShiftsRepository {
  const SupabaseShiftsRepository(this._client);

  final SupabaseClient _client;

  static const _select = '''
    id,
    shift_date,
    status,
    start_time,
    end_time,
    closing_odometer,
    fuel_filled_liters,
    notes,
    total_trips_cached,
    total_volume_cached,
    total_earnings_cached,
    driver:users!shifts_driver_id_fkey(full_name),
    vehicle:vehicles!shifts_vehicle_id_fkey(plate_number)
  ''';

  @override
  Future<List<ShiftSummary>> fetchShifts() async {
    final rows = await _client.from('shifts').select(_select).order('shift_date', ascending: false);
    return rows.map(_mapShift).toList(growable: false);
  }

  @override
  Future<ShiftSummary?> fetchOpenShift(String driverId) async {
    final rows = await _client.from('shifts').select(_select).eq('driver_id', driverId).eq('status', 'open').limit(1);
    if (rows.isEmpty) {
      return null;
    }
    return _mapShift(rows.first);
  }

  @override
  Future<ShiftSummary> openShift({required String driverId, required String vehicleId}) async {
    final row = await _client
        .from('shifts')
        .insert({
          'driver_id': driverId,
          'vehicle_id': vehicleId,
          'status': 'open',
          'start_time': DateTime.now().toUtc().toIso8601String(),
        })
        .select(_select)
        .single();
    return _mapShift(row);
  }

  @override
  Future<ShiftSummary> closeShift({
    required String shiftId,
    required int closingOdometerKm,
    required double fuelLiters,
    required int totalTrips,
    required double totalVolume,
    required int totalEarningsRub,
    required String note,
  }) async {
    final row = await _client
        .from('shifts')
        .update({
          'status': 'submitted',
          'end_time': DateTime.now().toUtc().toIso8601String(),
          'closing_odometer': closingOdometerKm,
          'fuel_filled_liters': fuelLiters,
          'total_trips_cached': totalTrips,
          'total_volume_cached': totalVolume,
          'total_earnings_cached': totalEarningsRub,
          'notes': note.trim().isEmpty ? 'Без комментария' : note.trim(),
        })
        .eq('id', shiftId)
        .select(_select)
        .single();
    return _mapShift(row);
  }

  ShiftSummary _mapShift(Map<String, dynamic> row) {
    return ShiftSummary(
      id: row['id'] as String,
      driverName: _nestedValue(row['driver'], 'full_name') ?? 'Водитель не указан',
      vehiclePlate: _nestedValue(row['vehicle'], 'plate_number') ?? '—',
      statusLabel: _mapShiftStatus(row['status'] as String?),
      shiftDateLabel: _formatDate(row['shift_date'] as String?),
      startTimeLabel: _formatTime(row['start_time'] as String?),
      endTimeLabel: _formatTime(row['end_time'] as String?),
      closingOdometerKm: _toNullableInt(row['closing_odometer']),
      fuelLiters: _toNullableDouble(row['fuel_filled_liters']),
      totalTrips: _toInt(row['total_trips_cached']),
      totalVolume: _toDouble(row['total_volume_cached']),
      totalEarningsRub: _toInt(row['total_earnings_cached']),
      note: row['notes'] as String? ?? '',
    );
  }
}

String? _nestedValue(Object? value, String field) {
  if (value is Map<String, dynamic>) {
    return value[field] as String?;
  }
  return null;
}

String _mapShiftStatus(String? value) {
  return switch (value) {
    'open' => 'Открыта',
    'submitted' => 'Закрыта',
    'approved' => 'Принята',
    'needs_review' => 'На проверке',
    _ => value ?? 'Ожидание',
  };
}

String _formatDate(String? value) {
  final date = DateTime.tryParse(value ?? '');
  if (date == null) {
    return '—';
  }
  final now = DateTime.now();
  if (date.year == now.year && date.month == now.month && date.day == now.day) {
    return 'Сегодня';
  }
  return DateFormat('dd.MM.yyyy', 'ru_RU').format(date);
}

String _formatTime(String? value) {
  final date = DateTime.tryParse(value ?? '')?.toLocal();
  if (date == null) {
    return '—';
  }
  return DateFormat('HH:mm', 'ru_RU').format(date);
}

int? _toNullableInt(Object? value) => value == null ? null : _toInt(value);

double? _toNullableDouble(Object? value) => value == null ? null : _toDouble(value);

int _toInt(Object? value) {
  if (value is int) return value;
  if (value is num) return value.round();
  return num.tryParse('$value')?.round() ?? 0;
}

double _toDouble(Object? value) {
  if (value is double) return value;
  if (value is num) return value.toDouble();
  return double.tryParse('$value') ?? 0;
}
