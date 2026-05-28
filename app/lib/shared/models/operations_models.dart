class DriverSummary {
  const DriverSummary({
    required this.id,
    required this.fullName,
    required this.phone,
    required this.statusLabel,
    required this.assignedVehiclePlate,
    required this.tripsToday,
    required this.earningsToday,
  });

  final String id;
  final String fullName;
  final String phone;
  final String statusLabel;
  final String assignedVehiclePlate;
  final int tripsToday;
  final int earningsToday;
}

class VehicleSummary {
  const VehicleSummary({
    required this.id,
    required this.displayName,
    required this.plateNumber,
    required this.statusLabel,
    required this.odometerKm,
    required this.assignedDriverName,
    required this.lastServiceNote,
  });

  final String id;
  final String displayName;
  final String plateNumber;
  final String statusLabel;
  final int odometerKm;
  final String assignedDriverName;
  final String lastServiceNote;
}

class OrderSummary {
  const OrderSummary({
    required this.id,
    required this.orderNumber,
    required this.customerName,
    required this.routeLabel,
    required this.materialName,
    required this.volumeText,
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
  });

  final String id;
  final String orderNumber;
  final String customerName;
  final String routeLabel;
  final String materialName;
  final String volumeText;
  final String statusLabel;
  final String driverName;
  final String vehiclePlate;
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

  String get routeFrom {
    final parts = routeLabel.split('->');
    return parts.isEmpty ? routeLabel : parts.first.trim();
  }

  String get routeTo {
    final parts = routeLabel.split('->');
    return parts.length < 2 ? '' : parts.last.trim();
  }

  OrderSummary copyWith({
    String? id,
    String? orderNumber,
    String? customerName,
    String? routeLabel,
    String? materialName,
    String? volumeText,
    String? statusLabel,
    String? driverName,
    String? vehiclePlate,
    int? driverRateRub,
    int? adminRatePerUnitRub,
    String? customerId,
    String? sourceOrgId,
    String? destinationOrgId,
    String? materialId,
    String? pickupLocationId,
    String? dropoffLocationId,
    String? assignedDriverId,
    String? assignedVehicleId,
  }) {
    return OrderSummary(
      id: id ?? this.id,
      orderNumber: orderNumber ?? this.orderNumber,
      customerName: customerName ?? this.customerName,
      routeLabel: routeLabel ?? this.routeLabel,
      materialName: materialName ?? this.materialName,
      volumeText: volumeText ?? this.volumeText,
      statusLabel: statusLabel ?? this.statusLabel,
      driverName: driverName ?? this.driverName,
      vehiclePlate: vehiclePlate ?? this.vehiclePlate,
      driverRateRub: driverRateRub ?? this.driverRateRub,
      adminRatePerUnitRub: adminRatePerUnitRub ?? this.adminRatePerUnitRub,
      customerId: customerId ?? this.customerId,
      sourceOrgId: sourceOrgId ?? this.sourceOrgId,
      destinationOrgId: destinationOrgId ?? this.destinationOrgId,
      materialId: materialId ?? this.materialId,
      pickupLocationId: pickupLocationId ?? this.pickupLocationId,
      dropoffLocationId: dropoffLocationId ?? this.dropoffLocationId,
      assignedDriverId: assignedDriverId ?? this.assignedDriverId,
      assignedVehicleId: assignedVehicleId ?? this.assignedVehicleId,
    );
  }
}

class DriverHomeSnapshot {
  const DriverHomeSnapshot({
    required this.driverName,
    required this.vehicleLabel,
    required this.shiftStatusLabel,
    required this.activeOrder,
    required this.completedTrips,
    required this.earningsRub,
    required this.completedTtns,
  });

  final String driverName;
  final String vehicleLabel;
  final String shiftStatusLabel;
  final OrderSummary? activeOrder;
  final int completedTrips;
  final int earningsRub;
  final List<String> completedTtns;
}

class AdminDashboardSnapshot {
  const AdminDashboardSnapshot({
    required this.activeOrders,
    required this.tripsToday,
    required this.driversOnShift,
    required this.ocrReviewCount,
    required this.focusItems,
  });

  final int activeOrders;
  final int tripsToday;
  final int driversOnShift;
  final int ocrReviewCount;
  final List<String> focusItems;
}

class TripReportSummary {
  const TripReportSummary({
    required this.id,
    required this.orderId,
    required this.orderNumber,
    required this.customerName,
    required this.driverName,
    required this.vehiclePlate,
    required this.ttnNumber,
    required this.volumeText,
    required this.statusLabel,
    required this.ocrStatusLabel,
    required this.ttnPhotoName,
    required this.supportingPhotosCount,
    required this.createdAtLabel,
    required this.createdAt,
  });

  final String id;
  final String orderId;
  final String orderNumber;
  final String customerName;
  final String driverName;
  final String vehiclePlate;
  final String ttnNumber;
  final String volumeText;
  final String statusLabel;
  final String ocrStatusLabel;
  final String ttnPhotoName;
  final int supportingPhotosCount;
  final String createdAtLabel;
  final DateTime createdAt;

  double get volumeValue {
    return double.tryParse(volumeText.split(' ').first.replaceAll(',', '.')) ?? 0;
  }
}

class ShiftSummary {
  const ShiftSummary({
    required this.id,
    required this.driverName,
    required this.vehiclePlate,
    required this.statusLabel,
    required this.shiftDateLabel,
    required this.startTimeLabel,
    required this.endTimeLabel,
    required this.closingOdometerKm,
    required this.fuelLiters,
    required this.totalTrips,
    required this.totalVolume,
    required this.totalEarningsRub,
    required this.note,
  });

  final String id;
  final String driverName;
  final String vehiclePlate;
  final String statusLabel;
  final String shiftDateLabel;
  final String startTimeLabel;
  final String endTimeLabel;
  final int? closingOdometerKm;
  final double? fuelLiters;
  final int totalTrips;
  final double totalVolume;
  final int totalEarningsRub;
  final String note;

  ShiftSummary copyWith({
    String? id,
    String? driverName,
    String? vehiclePlate,
    String? statusLabel,
    String? shiftDateLabel,
    String? startTimeLabel,
    String? endTimeLabel,
    int? closingOdometerKm,
    double? fuelLiters,
    int? totalTrips,
    double? totalVolume,
    int? totalEarningsRub,
    String? note,
    bool clearClosingOdometer = false,
    bool clearFuelLiters = false,
  }) {
    return ShiftSummary(
      id: id ?? this.id,
      driverName: driverName ?? this.driverName,
      vehiclePlate: vehiclePlate ?? this.vehiclePlate,
      statusLabel: statusLabel ?? this.statusLabel,
      shiftDateLabel: shiftDateLabel ?? this.shiftDateLabel,
      startTimeLabel: startTimeLabel ?? this.startTimeLabel,
      endTimeLabel: endTimeLabel ?? this.endTimeLabel,
      closingOdometerKm: clearClosingOdometer ? null : (closingOdometerKm ?? this.closingOdometerKm),
      fuelLiters: clearFuelLiters ? null : (fuelLiters ?? this.fuelLiters),
      totalTrips: totalTrips ?? this.totalTrips,
      totalVolume: totalVolume ?? this.totalVolume,
      totalEarningsRub: totalEarningsRub ?? this.totalEarningsRub,
      note: note ?? this.note,
    );
  }
}
