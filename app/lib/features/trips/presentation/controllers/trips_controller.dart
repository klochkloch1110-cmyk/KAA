import 'dart:typed_data';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_config.dart';
import '../../../../shared/models/operations_models.dart';
import '../../../../shared/repositories/trips_repository.dart';

final tripsControllerProvider = StateNotifierProvider<TripsController, List<TripReportSummary>>((ref) {
  final tripsRepository = ref.watch(tripsRepositoryProvider);
  return TripsController(tripsRepository: tripsRepository);
});

class TripsController extends StateNotifier<List<TripReportSummary>> {
  TripsController({required TripsRepository tripsRepository})
      : _tripsRepository = tripsRepository,
        super([
          TripReportSummary(
            id: 'trip-1',
            orderId: 'order-1',
            shiftId: null,
            orderNumber: 'AVL-0021/05/26',
            customerName: 'Стройком-М',
            driverName: 'Иванов Иван Петрович',
            vehiclePlate: 'А123КС 77',
            ttnNumber: 'ТТН-5471',
            volumeText: '20 т',
            statusLabel: 'Отправлен',
            ocrStatusLabel: 'Ожидает OCR',
            ttnPhotoName: 'ttn_5471.jpg',
            ttnDocumentPath: null,
            supportingPhotosCount: 1,
            createdAtLabel: 'Сегодня, 11:20',
            createdAt: DateTime.now(),
          ),
          TripReportSummary(
            id: 'trip-2',
            orderId: 'order-2',
            shiftId: 'shift-1',
            orderNumber: 'AVL-0022/05/26',
            customerName: 'БетонИнвест',
            driverName: 'Петров Сергей Николаевич',
            vehiclePlate: 'М482ОР 790',
            ttnNumber: 'ТТН-6624',
            volumeText: '18 т',
            statusLabel: 'Проверить',
            ocrStatusLabel: 'Есть расхождение',
            ttnPhotoName: 'ttn_6624.jpg',
            ttnDocumentPath: null,
            supportingPhotosCount: 2,
            createdAtLabel: 'Сегодня, 12:05',
            createdAt: DateTime.now(),
          ),
        ]);

  final TripsRepository _tripsRepository;

  Future<void> loadRemoteAdminTripsIfConfigured() async {
    if (!AppConfig.isSupabaseConfigured) {
      return;
    }

    state = await _tripsRepository.fetchAdminTrips();
  }

  Future<void> loadRemoteDriverTripsIfConfigured(String driverId) async {
    if (!AppConfig.isSupabaseConfigured) {
      return;
    }

    state = await _tripsRepository.fetchDriverTrips(driverId);
  }

  Future<void> submitReport(TripReportDraft draft) async {
    if (AppConfig.isSupabaseConfigured && draft.canPersistToSupabase) {
      final saved = await _tripsRepository.createTrip(draft.toWriteRequest());
      state = [saved, ...state];
      return;
    }

    final now = DateTime.now();
    final report = TripReportSummary(
      id: 'trip-${state.length + 1}',
      orderId: draft.order.id,
      shiftId: draft.shiftId,
      orderNumber: draft.order.orderNumber,
      customerName: draft.order.customerName,
      driverName: draft.order.driverName,
      vehiclePlate: draft.order.vehiclePlate,
      ttnNumber: draft.ttnNumber.trim(),
      volumeText: '${draft.volumeValue.trim()} ${draft.volumeUnit}',
      statusLabel: 'Отправлен',
      ocrStatusLabel: draft.runOcrCheck ? 'Ожидает OCR' : 'OCR не требуется',
      ttnPhotoName: draft.ttnPhotoName.trim(),
      ttnDocumentPath: null,
      supportingPhotosCount: draft.supportingPhotosCount,
      createdAtLabel: 'Только что',
      createdAt: now,
    );

    state = [report, ...state];
  }
}

class TripReportDraft {
  const TripReportDraft({
    required this.order,
    required this.ttnNumber,
    required this.volumeValue,
    required this.volumeUnit,
    required this.ttnPhotoName,
    this.ttnPhotoBytes,
    required this.supportingPhotosCount,
    required this.runOcrCheck,
    required this.comment,
    this.shiftId,
    this.driverId,
    this.vehicleId,
  });

  final OrderSummary order;
  final String ttnNumber;
  final String volumeValue;
  final String volumeUnit;
  final String ttnPhotoName;
  final Uint8List? ttnPhotoBytes;
  final int supportingPhotosCount;
  final bool runOcrCheck;
  final String comment;
  final String? shiftId;
  final String? driverId;
  final String? vehicleId;

  bool get canPersistToSupabase {
    return shiftId != null && driverId != null && vehicleId != null && order.id.isNotEmpty;
  }

  TripWriteRequest toWriteRequest() {
    if (!canPersistToSupabase) {
      throw StateError('Для сохранения рейса в Supabase нужны открытая смена, водитель, машина и заявка.');
    }

    return TripWriteRequest(
      orderId: order.id,
      shiftId: shiftId!,
      driverId: driverId!,
      vehicleId: vehicleId!,
      loadedVolume: double.tryParse(volumeValue.replaceAll(',', '.')) ?? 0,
      volumeUnit: volumeUnit,
      ttnNumber: ttnNumber.trim(),
      runOcrCheck: runOcrCheck,
      ttnPhotoName: ttnPhotoName,
      ttnPhotoBytes: ttnPhotoBytes,
      supportingPhotosCount: supportingPhotosCount,
      comment: comment,
    );
  }
}
