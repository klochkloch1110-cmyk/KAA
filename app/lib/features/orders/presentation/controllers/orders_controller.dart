import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_config.dart';
import '../../../../shared/models/operations_models.dart';
import '../../../../shared/repositories/dev_operations_repository.dart';
import '../../../../shared/repositories/orders_repository.dart';

final ordersControllerProvider = StateNotifierProvider<OrdersController, List<OrderSummary>>((ref) {
  final devRepository = ref.watch(devOperationsRepositoryProvider);
  final ordersRepository = ref.watch(ordersRepositoryProvider);
  return OrdersController(devRepository: devRepository, ordersRepository: ordersRepository);
});

class OrdersController extends StateNotifier<List<OrderSummary>> {
  OrdersController({
    required DevOperationsRepository devRepository,
    required OrdersRepository ordersRepository,
  })  : _devRepository = devRepository,
        _ordersRepository = ordersRepository,
        super(devRepository.getAdminOrders());

  final DevOperationsRepository _devRepository;
  final OrdersRepository _ordersRepository;

  Future<void> loadRemoteAdminOrdersIfConfigured() async {
    if (!AppConfig.isSupabaseConfigured) {
      return;
    }

    final remoteOrders = await _ordersRepository.fetchAdminOrders();
    state = remoteOrders;
  }

  Future<void> saveOrder(OrderDraft draft) async {
    final orderNumber = draft.orderNumber.isEmpty ? _devRepository.generateNextOrderNumber(state) : draft.orderNumber;

    if (AppConfig.isSupabaseConfigured && draft.canPersistToSupabase) {
      final request = draft.toWriteRequest(orderNumber: orderNumber);
      final savedOrder = draft.id == null
          ? await _ordersRepository.createOrder(request)
          : await _ordersRepository.updateOrder(draft.id!, request);
      _upsertLocalOrder(savedOrder);
      return;
    }

    final routeLabel = '${draft.routeFrom.trim()} -> ${draft.routeTo.trim()}';
    final volumeText = '${draft.volumeValue.trim()} ${draft.volumeUnit.trim()}';
    final order = OrderSummary(
      id: draft.id ?? 'order-${state.length + 1}',
      orderNumber: orderNumber,
      customerName: draft.customerName.trim(),
      routeLabel: routeLabel,
      materialName: draft.materialName.trim(),
      volumeText: volumeText,
      statusLabel: draft.statusLabel,
      driverName: draft.driverName?.trim().isNotEmpty == true ? draft.driverName!.trim() : 'Не назначен',
      vehiclePlate: draft.vehiclePlate?.trim().isNotEmpty == true ? draft.vehiclePlate!.trim() : '—',
      driverRateRub: draft.driverRateRub,
      adminRatePerUnitRub: draft.adminRatePerUnitRub,
    );

    _upsertLocalOrder(order);
  }

  void _upsertLocalOrder(OrderSummary order) {
    final existingIndex = state.indexWhere((item) => item.id == order.id);
    if (existingIndex == -1) {
      state = [order, ...state];
      return;
    }

    final nextState = [...state];
    nextState[existingIndex] = order;
    state = nextState;
  }
}

class OrderDraft {
  const OrderDraft({
    this.id,
    required this.orderNumber,
    required this.customerName,
    required this.routeFrom,
    required this.routeTo,
    required this.materialName,
    required this.volumeValue,
    required this.volumeUnit,
    required this.statusLabel,
    required this.driverName,
    required this.vehiclePlate,
    required this.driverRateRub,
    required this.adminRatePerUnitRub,
    this.customerId,
    this.sourceOrgId,
    this.destinationOrgId,
    this.materialId,
    this.pickupLocationId,
    this.dropoffLocationId,
    this.assignedDriverId,
    this.assignedVehicleId,
    this.notes,
  });

  final String? id;
  final String orderNumber;
  final String customerName;
  final String routeFrom;
  final String routeTo;
  final String materialName;
  final String volumeValue;
  final String volumeUnit;
  final String statusLabel;
  final String? driverName;
  final String? vehiclePlate;
  final int driverRateRub;
  final int adminRatePerUnitRub;
  final String? customerId;
  final String? sourceOrgId;
  final String? destinationOrgId;
  final String? materialId;
  final String? pickupLocationId;
  final String? dropoffLocationId;
  final String? assignedDriverId;
  final String? assignedVehicleId;
  final String? notes;

  bool get canPersistToSupabase {
    return customerId != null &&
        sourceOrgId != null &&
        destinationOrgId != null &&
        materialId != null &&
        pickupLocationId != null &&
        dropoffLocationId != null;
  }

  OrderWriteRequest toWriteRequest({required String orderNumber}) {
    if (!canPersistToSupabase) {
      throw StateError('Для сохранения заявки в Supabase нужны ID справочников: заказчик, организации, материал и точки маршрута.');
    }

    return OrderWriteRequest(
      orderNumber: orderNumber,
      customerId: customerId!,
      sourceOrgId: sourceOrgId!,
      destinationOrgId: destinationOrgId!,
      materialId: materialId!,
      totalVolumePlanned: double.tryParse(volumeValue.replaceAll(',', '.')) ?? 0,
      volumeUnit: volumeUnit,
      pickupLocationId: pickupLocationId!,
      dropoffLocationId: dropoffLocationId!,
      driverRatePerTrip: driverRateRub,
      adminRatePerUnit: adminRatePerUnitRub,
      status: statusLabel,
      assignedDriverId: assignedDriverId,
      assignedVehicleId: assignedVehicleId,
      notes: notes,
    );
  }

  factory OrderDraft.empty(String nextOrderNumber) {
    return OrderDraft(
      orderNumber: nextOrderNumber,
      customerName: '',
      routeFrom: '',
      routeTo: '',
      materialName: '',
      volumeValue: '',
      volumeUnit: 'т',
      statusLabel: 'Черновик',
      driverName: null,
      vehiclePlate: null,
      driverRateRub: 0,
      adminRatePerUnitRub: 0,
    );
  }

  factory OrderDraft.fromSummary(OrderSummary order) {
    final volumeParts = order.volumeText.split(' ');
    final volumeValue = volumeParts.isEmpty ? '' : volumeParts.first;
    final volumeUnit = volumeParts.length > 1 ? volumeParts.sublist(1).join(' ') : 'т';

    return OrderDraft(
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      routeFrom: order.routeFrom,
      routeTo: order.routeTo,
      materialName: order.materialName,
      volumeValue: volumeValue,
      volumeUnit: volumeUnit,
      statusLabel: order.statusLabel,
      driverName: order.driverName == 'Не назначен' ? null : order.driverName,
      vehiclePlate: order.vehiclePlate == '—' ? null : order.vehiclePlate,
      driverRateRub: order.driverRateRub,
      adminRatePerUnitRub: order.adminRatePerUnitRub,
      customerId: order.customerId,
      sourceOrgId: order.sourceOrgId,
      destinationOrgId: order.destinationOrgId,
      materialId: order.materialId,
      pickupLocationId: order.pickupLocationId,
      dropoffLocationId: order.dropoffLocationId,
      assignedDriverId: order.assignedDriverId,
      assignedVehicleId: order.assignedVehicleId,
    );
  }
}
