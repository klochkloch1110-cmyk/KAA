import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/constants/app_config.dart';
import '../models/operations_models.dart';

final ordersRepositoryProvider = Provider<OrdersRepository>((ref) {
  if (AppConfig.isSupabaseConfigured) {
    return SupabaseOrdersRepository(Supabase.instance.client);
  }

  return const UnsupportedOrdersRepository();
});

abstract class OrdersRepository {
  Future<List<OrderSummary>> fetchAdminOrders();

  Future<List<OrderSummary>> fetchDriverOrders(String driverId);

  Future<OrderFormRefs> fetchOrderFormRefs();

  Future<OrderSummary> createOrder(OrderWriteRequest request);

  Future<OrderSummary> updateOrder(String orderId, OrderWriteRequest request);
}

class OrderFormRefs {
  const OrderFormRefs({
    required this.customers,
    required this.organizations,
    required this.materials,
    required this.locations,
    required this.drivers,
    required this.vehicles,
  });

  final List<OrderRefItem> customers;
  final List<OrderRefItem> organizations;
  final List<OrderRefItem> materials;
  final List<OrderRefItem> locations;
  final List<OrderRefItem> drivers;
  final List<OrderRefItem> vehicles;
}

class OrderRefItem {
  const OrderRefItem({required this.id, required this.name, this.subtitle});

  final String id;
  final String name;
  final String? subtitle;
}

class OrderWriteRequest {
  const OrderWriteRequest({
    required this.orderNumber,
    required this.customerId,
    required this.sourceOrgId,
    required this.destinationOrgId,
    required this.materialId,
    required this.totalVolumePlanned,
    required this.volumeUnit,
    required this.pickupLocationId,
    required this.dropoffLocationId,
    required this.driverRatePerTrip,
    required this.adminRatePerUnit,
    required this.status,
    required this.assignedDriverId,
    required this.assignedVehicleId,
    this.notes,
  });

  final String orderNumber;
  final String customerId;
  final String sourceOrgId;
  final String destinationOrgId;
  final String materialId;
  final double totalVolumePlanned;
  final String volumeUnit;
  final String pickupLocationId;
  final String dropoffLocationId;
  final int driverRatePerTrip;
  final int adminRatePerUnit;
  final String status;
  final String? assignedDriverId;
  final String? assignedVehicleId;
  final String? notes;

  Map<String, dynamic> toInsertJson({required String createdBy}) {
    return {
      ...toUpdateJson(),
      'order_number': orderNumber,
      'created_by': createdBy,
    };
  }

  Map<String, dynamic> toUpdateJson() {
    return {
      'customer_id': customerId,
      'source_org_id': sourceOrgId,
      'destination_org_id': destinationOrgId,
      'material_id': materialId,
      'total_volume_planned': totalVolumePlanned,
      'volume_unit': _toDbVolumeUnit(volumeUnit),
      'pickup_location_id': pickupLocationId,
      'dropoff_location_id': dropoffLocationId,
      'driver_rate_per_trip': driverRatePerTrip,
      'admin_rate_per_unit': adminRatePerUnit,
      'status': _toDbOrderStatus(status),
      'assigned_driver_id': assignedDriverId,
      'assigned_vehicle_id': assignedVehicleId,
      'notes': notes,
    };
  }
}

class UnsupportedOrdersRepository implements OrdersRepository {
  const UnsupportedOrdersRepository();

  @override
  Future<List<OrderSummary>> fetchAdminOrders() async {
    throw UnsupportedError('Supabase не настроен. Сейчас используется локальный dev-контур.');
  }

  @override
  Future<List<OrderSummary>> fetchDriverOrders(String driverId) async {
    throw UnsupportedError('Supabase не настроен. Сейчас используется локальный dev-контур.');
  }

  @override
  Future<OrderFormRefs> fetchOrderFormRefs() async {
    throw UnsupportedError('Supabase не настроен. Сейчас используется локальный dev-контур.');
  }

  @override
  Future<OrderSummary> createOrder(OrderWriteRequest request) async {
    throw UnsupportedError('Supabase не настроен. Сейчас используется локальный dev-контур.');
  }

  @override
  Future<OrderSummary> updateOrder(String orderId, OrderWriteRequest request) async {
    throw UnsupportedError('Supabase не настроен. Сейчас используется локальный dev-контур.');
  }
}

class SupabaseOrdersRepository implements OrdersRepository {
  const SupabaseOrdersRepository(this._client);

  final SupabaseClient _client;

  static const _select = '''
    id,
    order_number,
    customer_id,
    source_org_id,
    destination_org_id,
    material_id,
    pickup_location_id,
    dropoff_location_id,
    assigned_driver_id,
    assigned_vehicle_id,
    total_volume_planned,
    volume_unit,
    driver_rate_per_trip,
    admin_rate_per_unit,
    status,
    customers(name),
    materials(name),
    pickup_location:locations!orders_pickup_location_id_fkey(name),
    dropoff_location:locations!orders_dropoff_location_id_fkey(name),
    assigned_driver:users!orders_assigned_driver_id_fkey(full_name),
    assigned_vehicle:vehicles!orders_assigned_vehicle_id_fkey(plate_number)
  ''';

  static const _driverSelect = '''
    id,
    order_number,
    customer_id,
    source_org_id,
    destination_org_id,
    material_id,
    pickup_location_id,
    dropoff_location_id,
    assigned_driver_id,
    assigned_vehicle_id,
    total_volume_planned,
    volume_unit,
    driver_rate_per_trip,
    status,
    customer_name,
    material_name,
    pickup_location_name,
    dropoff_location_name,
    assigned_driver_name,
    assigned_vehicle_plate
  ''';

  @override
  Future<List<OrderSummary>> fetchAdminOrders() async {
    final rows = await _client.from('orders').select(_select).order('order_date', ascending: false);
    return rows.map(_mapOrder).toList(growable: false);
  }

  @override
  Future<List<OrderSummary>> fetchDriverOrders(String driverId) async {
    final rows = await _client
        .from('driver_orders_safe')
        .select(_driverSelect)
        .eq('assigned_driver_id', driverId)
        .order('order_date', ascending: false);
    return rows.map(_mapDriverOrder).toList(growable: false);
  }

  @override
  Future<OrderFormRefs> fetchOrderFormRefs() async {
    final results = await Future.wait([
      _client.from('customers').select('id, name').order('name'),
      _client.from('organizations').select('id, name, type').order('name'),
      _client.from('materials').select('id, name, unit').eq('is_active', true).order('name'),
      _client.from('locations').select('id, name, address').order('name'),
      _client.from('users').select('id, full_name, phone').eq('role', 'driver').eq('status', 'active').order('full_name'),
      _client.from('vehicles').select('id, plate_number, brand, model, status').neq('status', 'inactive').order('plate_number'),
    ]);

    return OrderFormRefs(
      customers: _mapRefs(results[0], nameField: 'name'),
      organizations: _mapRefs(results[1], nameField: 'name', subtitleField: 'type'),
      materials: _mapRefs(results[2], nameField: 'name', subtitleField: 'unit'),
      locations: _mapRefs(results[3], nameField: 'name', subtitleField: 'address'),
      drivers: _mapRefs(results[4], nameField: 'full_name', subtitleField: 'phone'),
      vehicles: _mapVehicleRefs(results[5]),
    );
  }

  @override
  Future<OrderSummary> createOrder(OrderWriteRequest request) async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) {
      throw StateError('Для создания заявки нужна активная Supabase-сессия.');
    }

    final row = await _client
        .from('orders')
        .insert(request.toInsertJson(createdBy: userId))
        .select(_select)
        .single();
    return _mapOrder(row);
  }

  @override
  Future<OrderSummary> updateOrder(String orderId, OrderWriteRequest request) async {
    final row = await _client
        .from('orders')
        .update(request.toUpdateJson())
        .eq('id', orderId)
        .select(_select)
        .single();
    return _mapOrder(row);
  }

  OrderSummary _mapOrder(Map<String, dynamic> row) {
    final pickupName = _nestedName(row['pickup_location']) ?? 'Погрузка';
    final dropoffName = _nestedName(row['dropoff_location']) ?? 'Разгрузка';
    final volumeUnit = _mapVolumeUnit(row['volume_unit'] as String?);
    final volume = row['total_volume_planned'];

    return OrderSummary(
      id: row['id'] as String,
      orderNumber: row['order_number'] as String? ?? 'Без номера',
      customerName: _nestedName(row['customers']) ?? 'Заказчик не указан',
      routeLabel: '$pickupName -> $dropoffName',
      materialName: _nestedName(row['materials']) ?? 'Материал не указан',
      volumeText: '${_formatNumber(volume)} $volumeUnit',
      statusLabel: _mapOrderStatus(row['status'] as String?),
      driverName: _nestedName(row['assigned_driver']) ?? 'Не назначен',
      vehiclePlate: _nestedName(row['assigned_vehicle'], field: 'plate_number') ?? '—',
      driverRateRub: _toInt(row['driver_rate_per_trip']),
      adminRatePerUnitRub: _toInt(row['admin_rate_per_unit']),
      customerId: row['customer_id'] as String?,
      sourceOrgId: row['source_org_id'] as String?,
      destinationOrgId: row['destination_org_id'] as String?,
      materialId: row['material_id'] as String?,
      pickupLocationId: row['pickup_location_id'] as String?,
      dropoffLocationId: row['dropoff_location_id'] as String?,
      assignedDriverId: row['assigned_driver_id'] as String?,
      assignedVehicleId: row['assigned_vehicle_id'] as String?,
    );
  }

  OrderSummary _mapDriverOrder(Map<String, dynamic> row) {
    final pickupName = row['pickup_location_name'] as String? ?? 'Погрузка';
    final dropoffName = row['dropoff_location_name'] as String? ?? 'Разгрузка';
    final volumeUnit = _mapVolumeUnit(row['volume_unit'] as String?);
    final volume = row['total_volume_planned'];

    return OrderSummary(
      id: row['id'] as String,
      orderNumber: row['order_number'] as String? ?? 'Без номера',
      customerName: row['customer_name'] as String? ?? 'Заказчик не указан',
      routeLabel: '$pickupName -> $dropoffName',
      materialName: row['material_name'] as String? ?? 'Материал не указан',
      volumeText: '${_formatNumber(volume)} $volumeUnit',
      statusLabel: _mapOrderStatus(row['status'] as String?),
      driverName: row['assigned_driver_name'] as String? ?? 'Не назначен',
      vehiclePlate: row['assigned_vehicle_plate'] as String? ?? '—',
      driverRateRub: _toInt(row['driver_rate_per_trip']),
      adminRatePerUnitRub: 0,
      customerId: row['customer_id'] as String?,
      sourceOrgId: row['source_org_id'] as String?,
      destinationOrgId: row['destination_org_id'] as String?,
      materialId: row['material_id'] as String?,
      pickupLocationId: row['pickup_location_id'] as String?,
      dropoffLocationId: row['dropoff_location_id'] as String?,
      assignedDriverId: row['assigned_driver_id'] as String?,
      assignedVehicleId: row['assigned_vehicle_id'] as String?,
    );
  }
}

List<OrderRefItem> _mapRefs(
  List<dynamic> rows, {
  required String nameField,
  String? subtitleField,
}) {
  return rows
      .whereType<Map<String, dynamic>>()
      .map(
        (row) => OrderRefItem(
          id: row['id'] as String,
          name: row[nameField] as String? ?? 'Без названия',
          subtitle: subtitleField == null ? null : row[subtitleField] as String?,
        ),
      )
      .toList(growable: false);
}

List<OrderRefItem> _mapVehicleRefs(List<dynamic> rows) {
  return rows
      .whereType<Map<String, dynamic>>()
      .map((row) {
        final brand = row['brand'] as String? ?? '';
        final model = row['model'] as String? ?? '';
        final status = row['status'] as String? ?? '';
        final subtitle = [brand, model, status].where((item) => item.trim().isNotEmpty).join(' · ');
        return OrderRefItem(
          id: row['id'] as String,
          name: row['plate_number'] as String? ?? 'Без номера',
          subtitle: subtitle.isEmpty ? null : subtitle,
        );
      })
      .toList(growable: false);
}

String? _nestedName(Object? value, {String field = 'name'}) {
  if (value is Map<String, dynamic>) {
    return value[field] as String?;
  }
  return null;
}

String _mapVolumeUnit(String? value) {
  return switch (value) {
    'm3' => 'м3',
    'ton' => 'т',
    _ => value ?? 'т',
  };
}

String _mapOrderStatus(String? value) {
  return switch (value) {
    'draft' => 'Черновик',
    'assigned' => 'Назначена',
    'in_progress' => 'В работе',
    'completed' => 'Завершена',
    'cancelled' => 'Отменена',
    'archived' => 'Архив',
    _ => value ?? 'Черновик',
  };
}

String _toDbVolumeUnit(String value) {
  return switch (value) {
    'м3' => 'm3',
    'т' => 'ton',
    'ton' || 'm3' => value,
    _ => 'ton',
  };
}

String _toDbOrderStatus(String value) {
  return switch (value) {
    'Черновик' => 'draft',
    'Назначена' => 'assigned',
    'В работе' => 'in_progress',
    'Завершена' => 'completed',
    'Отменена' => 'cancelled',
    'Архив' => 'archived',
    _ => value,
  };
}

String _formatNumber(Object? value) {
  final number = value is num ? value : num.tryParse('$value');
  if (number == null) {
    return '0';
  }
  if (number == number.roundToDouble()) {
    return '${number.round()}';
  }
  return number.toStringAsFixed(2);
}

int _toInt(Object? value) {
  if (value is int) {
    return value;
  }
  if (value is num) {
    return value.round();
  }
  return num.tryParse('$value')?.round() ?? 0;
}
