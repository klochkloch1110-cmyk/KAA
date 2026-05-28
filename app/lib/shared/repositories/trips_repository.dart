import 'dart:typed_data';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/constants/app_config.dart';
import '../models/operations_models.dart';

final tripsRepositoryProvider = Provider<TripsRepository>((ref) {
  if (AppConfig.isSupabaseConfigured) {
    return SupabaseTripsRepository(Supabase.instance.client);
  }

  return const UnsupportedTripsRepository();
});

abstract class TripsRepository {
  Future<List<TripReportSummary>> fetchAdminTrips();

  Future<List<TripReportSummary>> fetchDriverTrips(String driverId);

  Future<TripReportSummary> createTrip(TripWriteRequest request);
}

class TripWriteRequest {
  const TripWriteRequest({
    required this.orderId,
    required this.shiftId,
    required this.driverId,
    required this.vehicleId,
    required this.loadedVolume,
    required this.volumeUnit,
    required this.ttnNumber,
    required this.runOcrCheck,
    required this.ttnPhotoName,
    required this.ttnPhotoBytes,
    required this.supportingPhotosCount,
    required this.comment,
  });

  final String orderId;
  final String shiftId;
  final String driverId;
  final String vehicleId;
  final double loadedVolume;
  final String volumeUnit;
  final String ttnNumber;
  final bool runOcrCheck;
  final String ttnPhotoName;
  final Uint8List? ttnPhotoBytes;
  final int supportingPhotosCount;
  final String comment;

  Map<String, dynamic> toJson() {
    return {
      'order_id': orderId,
      'shift_id': shiftId,
      'driver_id': driverId,
      'vehicle_id': vehicleId,
      'loaded_volume': loadedVolume,
      'volume_unit': _toDbVolumeUnit(volumeUnit),
      'ttn_number_manual': ttnNumber,
      'status': 'submitted',
      'ocr_status': runOcrCheck ? 'pending' : 'not_required',
    };
  }
}

class UnsupportedTripsRepository implements TripsRepository {
  const UnsupportedTripsRepository();

  @override
  Future<List<TripReportSummary>> fetchAdminTrips() async {
    throw UnsupportedError('Supabase не настроен. Сейчас используется локальный dev-контур.');
  }

  @override
  Future<List<TripReportSummary>> fetchDriverTrips(String driverId) async {
    throw UnsupportedError('Supabase не настроен. Сейчас используется локальный dev-контур.');
  }

  @override
  Future<TripReportSummary> createTrip(TripWriteRequest request) async {
    throw UnsupportedError('Supabase не настроен. Сейчас используется локальный dev-контур.');
  }
}

class SupabaseTripsRepository implements TripsRepository {
  const SupabaseTripsRepository(this._client);

  final SupabaseClient _client;

  static const _select = '''
    id,
    order_id,
    loaded_volume,
    volume_unit,
    ttn_number_manual,
    status,
    ocr_status,
    created_at,
    order:orders!trips_order_id_fkey(order_number, customers(name)),
    driver:users!trips_driver_id_fkey(full_name),
    vehicle:vehicles!trips_vehicle_id_fkey(plate_number)
  ''';

  @override
  Future<List<TripReportSummary>> fetchAdminTrips() async {
    final rows = await _client.from('trips').select(_select).order('created_at', ascending: false);
    return rows.map(_mapTrip).toList(growable: false);
  }

  @override
  Future<List<TripReportSummary>> fetchDriverTrips(String driverId) async {
    final rows = await _client.from('trips').select(_select).eq('driver_id', driverId).order('created_at', ascending: false);
    return rows.map(_mapTrip).toList(growable: false);
  }

  @override
  Future<TripReportSummary> createTrip(TripWriteRequest request) async {
    final row = await _client.from('trips').insert(request.toJson()).select(_select).single();
    final trip = _mapTrip(row);
    final filePath = await _uploadTtnPhoto(tripId: trip.id, request: request);
    await _createTtnDocument(tripId: trip.id, filePath: filePath, request: request);
    return trip.copyWithDocumentInfo(
      ttnPhotoName: request.ttnPhotoName.trim(),
      supportingPhotosCount: request.supportingPhotosCount,
    );
  }

  Future<String> _uploadTtnPhoto({required String tripId, required TripWriteRequest request}) async {
    final fileName = request.ttnPhotoName.trim();
    final filePath = '${request.driverId}/trips/$tripId/$fileName';
    final bytes = request.ttnPhotoBytes;

    if (fileName.isNotEmpty && bytes != null && bytes.isNotEmpty) {
      await _client.storage.from('documents').uploadBinary(
            filePath,
            bytes,
            fileOptions: FileOptions(
              contentType: _guessMimeType(fileName),
              upsert: true,
            ),
          );
    }

    return filePath;
  }

  Future<void> _createTtnDocument({required String tripId, required String filePath, required TripWriteRequest request}) async {
    final fileName = request.ttnPhotoName.trim();
    if (fileName.isEmpty) return;
    final hasUploadedFile = request.ttnPhotoBytes != null && request.ttnPhotoBytes!.isNotEmpty;

    await _client.from('documents').insert({
      'entity_type': 'trip',
      'entity_id': tripId,
      'document_type': 'ttn',
      'file_path': filePath,
      'file_name': fileName,
      'mime_type': _guessMimeType(fileName),
      'uploaded_by': request.driverId,
      'metadata_json': {
        'source': 'mobile_trip_report_form',
        'supporting_photos_count': request.supportingPhotosCount,
        'driver_comment': request.comment.trim(),
        'storage_upload_pending': !hasUploadedFile,
      },
    });
  }

  TripReportSummary _mapTrip(Map<String, dynamic> row) {
    final order = row['order'] as Map<String, dynamic>?;
    final customers = order?['customers'] as Map<String, dynamic>?;
    final volumeUnit = _mapVolumeUnit(row['volume_unit'] as String?);
    final createdAt = _parseCreatedAt(row['created_at'] as String?);

    return TripReportSummary(
      id: row['id'] as String,
      orderId: row['order_id'] as String,
      orderNumber: order?['order_number'] as String? ?? 'Без номера',
      customerName: customers?['name'] as String? ?? 'Заказчик не указан',
      driverName: _nestedValue(row['driver'], 'full_name') ?? 'Водитель не указан',
      vehiclePlate: _nestedValue(row['vehicle'], 'plate_number') ?? '—',
      ttnNumber: row['ttn_number_manual'] as String? ?? '—',
      volumeText: '${_formatNumber(row['loaded_volume'])} $volumeUnit',
      statusLabel: _mapTripStatus(row['status'] as String?),
      ocrStatusLabel: _mapOcrStatus(row['ocr_status'] as String?),
      ttnPhotoName: 'Файл в Storage',
      supportingPhotosCount: 0,
      createdAtLabel: _formatCreatedAt(createdAt),
      createdAt: createdAt,
    );
  }
}

String? _nestedValue(Object? value, String field) {
  if (value is Map<String, dynamic>) {
    return value[field] as String?;
  }
  return null;
}

String _toDbVolumeUnit(String value) {
  return switch (value) {
    'м3' => 'm3',
    'т' => 'ton',
    'ton' || 'm3' => value,
    _ => 'ton',
  };
}

String _mapVolumeUnit(String? value) {
  return switch (value) {
    'm3' => 'м3',
    'ton' => 'т',
    _ => value ?? 'т',
  };
}

String _mapTripStatus(String? value) {
  return switch (value) {
    'submitted' => 'Отправлен',
    'verified' => 'Проверен',
    'needs_review' => 'Проверить',
    'rejected' => 'Отклонен',
    _ => value ?? 'Отправлен',
  };
}

String _mapOcrStatus(String? value) {
  return switch (value) {
    'pending' => 'Ожидает OCR',
    'matched' => 'Совпало',
    'mismatch' => 'Есть расхождение',
    'failed' => 'Ошибка OCR',
    'not_required' => 'OCR не требуется',
    _ => value ?? 'OCR не требуется',
  };
}

DateTime _parseCreatedAt(String? value) {
  return DateTime.tryParse(value ?? '')?.toLocal() ?? DateTime.fromMillisecondsSinceEpoch(0);
}

String _formatCreatedAt(DateTime date) {
  if (date.millisecondsSinceEpoch == 0) return '—';
  final now = DateTime.now();
  final prefix = date.year == now.year && date.month == now.month && date.day == now.day ? 'Сегодня' : DateFormat('dd.MM.yyyy', 'ru_RU').format(date);
  return '$prefix, ${DateFormat('HH:mm', 'ru_RU').format(date)}';
}

String _formatNumber(Object? value) {
  final number = value is num ? value : num.tryParse('$value');
  if (number == null) return '0';
  if (number == number.roundToDouble()) return '${number.round()}';
  return number.toStringAsFixed(2);
}

String _guessMimeType(String fileName) {
  final lower = fileName.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return 'image/jpeg';
}

extension on TripReportSummary {
  TripReportSummary copyWithDocumentInfo({
    required String ttnPhotoName,
    required int supportingPhotosCount,
  }) {
    return TripReportSummary(
      id: id,
      orderId: orderId,
      orderNumber: orderNumber,
      customerName: customerName,
      driverName: driverName,
      vehiclePlate: vehiclePlate,
      ttnNumber: ttnNumber,
      volumeText: volumeText,
      statusLabel: statusLabel,
      ocrStatusLabel: ocrStatusLabel,
      ttnPhotoName: ttnPhotoName.isEmpty ? this.ttnPhotoName : ttnPhotoName,
      supportingPhotosCount: supportingPhotosCount,
      createdAtLabel: createdAtLabel,
      createdAt: createdAt,
    );
  }
}
