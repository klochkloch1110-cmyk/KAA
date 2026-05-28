import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/enums/user_role.dart';
import '../../features/auth/domain/app_user.dart';
import '../models/operations_models.dart';

final devOperationsRepositoryProvider = Provider<DevOperationsRepository>((ref) {
  return const DevOperationsRepository();
});

class DevOperationsRepository {
  const DevOperationsRepository();

  static const _drivers = [
    DriverSummary(
      id: 'driver-1',
      fullName: 'Иванов Иван Петрович',
      phone: '+7 999 111-22-33',
      statusLabel: 'На смене',
      assignedVehiclePlate: 'А123КС 77',
      tripsToday: 5,
      earningsToday: 7500,
    ),
    DriverSummary(
      id: 'driver-2',
      fullName: 'Петров Сергей Николаевич',
      phone: '+7 999 222-33-44',
      statusLabel: 'Назначен на заявку',
      assignedVehiclePlate: 'М482ОР 790',
      tripsToday: 3,
      earningsToday: 4800,
    ),
    DriverSummary(
      id: 'driver-3',
      fullName: 'Сидоров Алексей Владимирович',
      phone: '+7 999 333-44-55',
      statusLabel: 'Ожидает смену',
      assignedVehiclePlate: '—',
      tripsToday: 0,
      earningsToday: 0,
    ),
  ];

  static const _vehicles = [
    VehicleSummary(
      id: 'vehicle-1',
      displayName: 'КамАЗ 6520',
      plateNumber: 'А123КС 77',
      statusLabel: 'Активна',
      odometerKm: 184230,
      assignedDriverName: 'Иванов Иван Петрович',
      lastServiceNote: 'ТО 15.05.2026 · следующее через 4 700 км',
    ),
    VehicleSummary(
      id: 'vehicle-2',
      displayName: 'Shacman X3000',
      plateNumber: 'М482ОР 790',
      statusLabel: 'Активна',
      odometerKm: 126480,
      assignedDriverName: 'Петров Сергей Николаевич',
      lastServiceNote: 'Шиномонтаж 21.05.2026',
    ),
    VehicleSummary(
      id: 'vehicle-3',
      displayName: 'Howo T5G',
      plateNumber: 'Е901ТР 50',
      statusLabel: 'На сервисе',
      odometerKm: 208910,
      assignedDriverName: '—',
      lastServiceNote: 'Замена гидролинии · возврат ожидается завтра',
    ),
  ];

  static const _orders = [
    OrderSummary(
      id: 'order-1',
      orderNumber: 'AVL-0021/05/26',
      customerName: 'Стройком-М',
      routeLabel: 'Карьер №3 -> Ленина, 45',
      materialName: 'Песок',
      volumeText: '240 т',
      statusLabel: 'В работе',
      driverName: 'Иванов Иван Петрович',
      vehiclePlate: 'А123КС 77',
      driverRateRub: 1500,
      adminRatePerUnitRub: 620,
    ),
    OrderSummary(
      id: 'order-2',
      orderNumber: 'AVL-0022/05/26',
      customerName: 'БетонИнвест',
      routeLabel: 'База Мытищи -> Химки, Заводская 12',
      materialName: 'Щебень',
      volumeText: '180 т',
      statusLabel: 'Назначена',
      driverName: 'Петров Сергей Николаевич',
      vehiclePlate: 'М482ОР 790',
      driverRateRub: 1600,
      adminRatePerUnitRub: 680,
    ),
    OrderSummary(
      id: 'order-3',
      orderNumber: 'AVL-0023/05/26',
      customerName: 'МосДорСнаб',
      routeLabel: 'Лобня, склад -> Долгопрудный, участок 8',
      materialName: 'Грунт',
      volumeText: '120 м3',
      statusLabel: 'Черновик',
      driverName: 'Не назначен',
      vehiclePlate: '—',
      driverRateRub: 1400,
      adminRatePerUnitRub: 540,
    ),
  ];

  List<DriverSummary> getDrivers() => _drivers;

  List<VehicleSummary> getVehicles() => _vehicles;

  List<OrderSummary> getAdminOrders() => _orders;

  String generateNextOrderNumber(Iterable<OrderSummary> orders) {
    final maxSequence = orders.fold<int>(0, (maxValue, order) {
      final match = RegExp(r'AVL-(\d+)').firstMatch(order.orderNumber);
      final value = int.tryParse(match?.group(1) ?? '') ?? 0;
      return value > maxValue ? value : maxValue;
    });

    final nextSequence = (maxSequence + 1).toString().padLeft(4, '0');
    return 'AVL-$nextSequence/05/26';
  }

  List<String> getOrderStatusOptions() {
    return const ['Черновик', 'Назначена', 'В работе', 'Завершена', 'Отменена'];
  }

  List<OrderSummary> getOrdersForUser(AppUser? user) {
    if (user == null) {
      return const [];
    }
    if (user.role != UserRole.driver) {
      return _orders;
    }

    final driverName = user.fullName;
    return _orders.where((order) => order.driverName == driverName).toList(growable: false);
  }

  DriverHomeSnapshot getDriverHome(AppUser? user) {
    final driver = _resolveDriver(user);
    final activeOrder = _orders.firstWhere(
      (order) => order.driverName == driver.fullName,
      orElse: () => const OrderSummary(
        id: 'empty',
        orderNumber: '',
        customerName: '',
        routeLabel: '',
        materialName: '',
        volumeText: '',
        statusLabel: '',
        driverName: '',
        vehiclePlate: '',
        driverRateRub: 0,
        adminRatePerUnitRub: 0,
      ),
    );

    final hasOrder = activeOrder.id != 'empty';
    final vehicle = _vehicles.firstWhere(
      (item) => item.plateNumber == driver.assignedVehiclePlate,
      orElse: () => const VehicleSummary(
        id: 'empty',
        displayName: 'Машина не назначена',
        plateNumber: '—',
        statusLabel: 'Ожидание',
        odometerKm: 0,
        assignedDriverName: '—',
        lastServiceNote: 'Нет данных',
      ),
    );

    return DriverHomeSnapshot(
      driverName: driver.fullName,
      vehicleLabel: '${vehicle.plateNumber} · ${vehicle.displayName} · пробег ${vehicle.odometerKm} км',
      shiftStatusLabel: driver.statusLabel,
      activeOrder: hasOrder ? activeOrder : null,
      completedTrips: driver.tripsToday,
      earningsRub: driver.earningsToday,
      completedTtns: const ['ТТН-5471', 'ТТН-5472', 'ТТН-5473', 'ТТН-5474', 'ТТН-5475'],
    );
  }

  AdminDashboardSnapshot getAdminDashboard() {
    return AdminDashboardSnapshot(
      activeOrders: _orders.where((item) => item.statusLabel != 'Черновик').length,
      tripsToday: _drivers.fold(0, (sum, item) => sum + item.tripsToday),
      driversOnShift: _drivers.where((item) => item.statusLabel == 'На смене').length,
      ocrReviewCount: 3,
      focusItems: const [
        'Справочники, водители и машины уже можно вести в UI-скелете.',
        'Следующий прикладной шаг: форма создания заявки и назначение водителя.',
        'После этого логично закрывать рейсовый отчет с фото ТТН.',
      ],
    );
  }

  DriverSummary _resolveDriver(AppUser? user) {
    if (user != null) {
      final matched = _drivers.where((item) => item.fullName == user.fullName).toList(growable: false);
      if (matched.isNotEmpty) {
        return matched.first;
      }
    }

    return _drivers.first;
  }
}
