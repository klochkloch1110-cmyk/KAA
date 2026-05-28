import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/app_config.dart';
import '../../../../core/widgets/app_panel.dart';
import '../../../../core/widgets/app_status_badge.dart';
import '../../../../shared/models/operations_models.dart';
import '../../../../shared/repositories/dev_operations_repository.dart';
import '../../../../shared/repositories/orders_repository.dart';
import '../controllers/orders_controller.dart';

class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});

  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen> {
  final _formKey = GlobalKey<FormState>();
  final _customerController = TextEditingController();
  final _routeFromController = TextEditingController();
  final _routeToController = TextEditingController();
  final _materialController = TextEditingController();
  final _volumeController = TextEditingController();
  final _rateController = TextEditingController();
  final _unitRateController = TextEditingController();

  String? _editingOrderId;
  String _statusLabel = 'Черновик';
  String _volumeUnit = 'т';
  String? _selectedDriverName;
  String? _selectedVehiclePlate;
  String? _selectedCustomerId;
  String? _selectedSourceOrgId;
  String? _selectedDestinationOrgId;
  String? _selectedMaterialId;
  String? _selectedPickupLocationId;
  String? _selectedDropoffLocationId;
  String? _selectedDriverId;
  String? _selectedVehicleId;
  OrderFormRefs? _orderFormRefs;
  bool _isLoadingRemoteOrders = false;
  bool _isLoadingOrderRefs = false;
  bool _isSavingOrder = false;
  String? _remoteOrdersError;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _startCreate();
      _loadRemoteOrders();
      _loadOrderRefs();
    });
  }

  @override
  void dispose() {
    _customerController.dispose();
    _routeFromController.dispose();
    _routeToController.dispose();
    _materialController.dispose();
    _volumeController.dispose();
    _rateController.dispose();
    _unitRateController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final repository = ref.watch(devOperationsRepositoryProvider);
    final orders = ref.watch(ordersControllerProvider);
    final drivers = repository.getDrivers();
    final vehicles = repository.getVehicles();
    final statusOptions = repository.getOrderStatusOptions();
    final currency = NumberFormat.decimalPattern('ru_RU');
    final selectedOrder = _editingOrderId == null
        ? null
        : orders.where((item) => item.id == _editingOrderId).cast<OrderSummary?>().firstOrNull;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Заявки'),
        actions: [
          TextButton.icon(
            onPressed: _startCreate,
            icon: const Icon(Icons.add_rounded),
            label: const Text('Новая заявка'),
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isWide = constraints.maxWidth >= 1180;

          if (isWide) {
            return Row(
              children: [
                Expanded(
                  flex: 7,
                  child: Column(
                    children: [
                      _RemoteOrdersBanner(
                        isLoading: _isLoadingRemoteOrders,
                        error: _remoteOrdersError,
                        onRetry: _loadRemoteOrders,
                      ),
                      Expanded(
                        child: _OrdersListPane(
                          orders: orders,
                          selectedOrderId: _editingOrderId,
                          currency: currency,
                          onSelect: _openForEdit,
                        ),
                      ),
                    ],
                  ),
                ),
                const VerticalDivider(width: 1),
                SizedBox(
                  width: 420,
                  child: _OrderEditorPane(
                    formKey: _formKey,
                    selectedOrder: selectedOrder,
                    customerController: _customerController,
                    routeFromController: _routeFromController,
                    routeToController: _routeToController,
                    materialController: _materialController,
                    volumeController: _volumeController,
                    rateController: _rateController,
                    unitRateController: _unitRateController,
                    statusLabel: _statusLabel,
                    volumeUnit: _volumeUnit,
                    selectedDriverName: _selectedDriverName,
                    selectedVehiclePlate: _selectedVehiclePlate,
                    statusOptions: statusOptions,
                    drivers: drivers,
                    vehicles: vehicles,
                    orderFormRefs: _orderFormRefs,
                    isLoadingOrderRefs: _isLoadingOrderRefs,
                    selectedCustomerId: _selectedCustomerId,
                    selectedSourceOrgId: _selectedSourceOrgId,
                    selectedDestinationOrgId: _selectedDestinationOrgId,
                    selectedMaterialId: _selectedMaterialId,
                    selectedPickupLocationId: _selectedPickupLocationId,
                    selectedDropoffLocationId: _selectedDropoffLocationId,
                    selectedDriverId: _selectedDriverId,
                    selectedVehicleId: _selectedVehicleId,
                    onCustomerRefChanged: _selectCustomerRef,
                    onSourceOrgRefChanged: (value) => setState(() => _selectedSourceOrgId = value),
                    onDestinationOrgRefChanged: (value) => setState(() => _selectedDestinationOrgId = value),
                    onMaterialRefChanged: _selectMaterialRef,
                    onPickupLocationRefChanged: _selectPickupLocationRef,
                    onDropoffLocationRefChanged: _selectDropoffLocationRef,
                    onDriverRefChanged: _selectDriverRef,
                    onVehicleRefChanged: _selectVehicleRef,
                    onStatusChanged: (value) => setState(() => _statusLabel = value ?? 'Черновик'),
                    onVolumeUnitChanged: (value) => setState(() => _volumeUnit = value ?? 'т'),
                    onDriverChanged: (value) => setState(() => _selectedDriverName = value),
                    onVehicleChanged: (value) => setState(() => _selectedVehiclePlate = value),
                    onCancel: _startCreate,
                    onSave: _saveOrder,
                    isSaving: _isSavingOrder,
                  ),
                ),
              ],
            );
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _RemoteOrdersBanner(
                isLoading: _isLoadingRemoteOrders,
                error: _remoteOrdersError,
                onRetry: _loadRemoteOrders,
              ),
              const SizedBox(height: 16),
              _OrderEditorPane(
                formKey: _formKey,
                selectedOrder: selectedOrder,
                customerController: _customerController,
                routeFromController: _routeFromController,
                routeToController: _routeToController,
                materialController: _materialController,
                volumeController: _volumeController,
                rateController: _rateController,
                unitRateController: _unitRateController,
                statusLabel: _statusLabel,
                volumeUnit: _volumeUnit,
                selectedDriverName: _selectedDriverName,
                selectedVehiclePlate: _selectedVehiclePlate,
                statusOptions: statusOptions,
                drivers: drivers,
                vehicles: vehicles,
                orderFormRefs: _orderFormRefs,
                isLoadingOrderRefs: _isLoadingOrderRefs,
                selectedCustomerId: _selectedCustomerId,
                selectedSourceOrgId: _selectedSourceOrgId,
                selectedDestinationOrgId: _selectedDestinationOrgId,
                selectedMaterialId: _selectedMaterialId,
                selectedPickupLocationId: _selectedPickupLocationId,
                selectedDropoffLocationId: _selectedDropoffLocationId,
                selectedDriverId: _selectedDriverId,
                selectedVehicleId: _selectedVehicleId,
                onCustomerRefChanged: _selectCustomerRef,
                onSourceOrgRefChanged: (value) => setState(() => _selectedSourceOrgId = value),
                onDestinationOrgRefChanged: (value) => setState(() => _selectedDestinationOrgId = value),
                onMaterialRefChanged: _selectMaterialRef,
                onPickupLocationRefChanged: _selectPickupLocationRef,
                onDropoffLocationRefChanged: _selectDropoffLocationRef,
                onDriverRefChanged: _selectDriverRef,
                onVehicleRefChanged: _selectVehicleRef,
                onStatusChanged: (value) => setState(() => _statusLabel = value ?? 'Черновик'),
                onVolumeUnitChanged: (value) => setState(() => _volumeUnit = value ?? 'т'),
                onDriverChanged: (value) => setState(() => _selectedDriverName = value),
                onVehicleChanged: (value) => setState(() => _selectedVehiclePlate = value),
                onCancel: _startCreate,
                onSave: _saveOrder,
                isSaving: _isSavingOrder,
              ),
              const SizedBox(height: 16),
              _OrdersListPane(
                orders: orders,
                selectedOrderId: _editingOrderId,
                currency: currency,
                onSelect: _openForEdit,
              ),
            ],
          );
        },
      ),
    );
  }

  void _startCreate() {
    final repository = ref.read(devOperationsRepositoryProvider);
    final orders = ref.read(ordersControllerProvider);
    final draft = OrderDraft.empty(repository.generateNextOrderNumber(orders));
    _applyDraft(draft);
  }

  Future<void> _loadRemoteOrders() async {
    if (!AppConfig.isSupabaseConfigured || _isLoadingRemoteOrders) {
      return;
    }

    setState(() {
      _isLoadingRemoteOrders = true;
      _remoteOrdersError = null;
    });

    try {
      await ref.read(ordersControllerProvider.notifier).loadRemoteAdminOrdersIfConfigured();
      if (!mounted) return;
      _startCreate();
    } catch (error) {
      if (!mounted) return;
      setState(() => _remoteOrdersError = error.toString());
    } finally {
      if (mounted) {
        setState(() => _isLoadingRemoteOrders = false);
      }
    }
  }

  Future<void> _loadOrderRefs() async {
    if (!AppConfig.isSupabaseConfigured || _isLoadingOrderRefs) {
      return;
    }

    setState(() => _isLoadingOrderRefs = true);

    try {
      final refs = await ref.read(ordersRepositoryProvider).fetchOrderFormRefs();
      if (!mounted) return;
      setState(() => _orderFormRefs = refs);
    } catch (error) {
      if (!mounted) return;
      setState(() => _remoteOrdersError = error.toString());
    } finally {
      if (mounted) {
        setState(() => _isLoadingOrderRefs = false);
      }
    }
  }

  void _openForEdit(OrderSummary order) {
    _applyDraft(OrderDraft.fromSummary(order));
  }

  void _applyDraft(OrderDraft draft) {
    setState(() {
      _editingOrderId = draft.id;
      _customerController.text = draft.customerName;
      _routeFromController.text = draft.routeFrom;
      _routeToController.text = draft.routeTo;
      _materialController.text = draft.materialName;
      _volumeController.text = draft.volumeValue;
      _rateController.text = draft.driverRateRub == 0 ? '' : '${draft.driverRateRub}';
      _unitRateController.text = draft.adminRatePerUnitRub == 0 ? '' : '${draft.adminRatePerUnitRub}';
      _statusLabel = draft.statusLabel;
      _volumeUnit = draft.volumeUnit;
      _selectedDriverName = draft.driverName;
      _selectedVehiclePlate = draft.vehiclePlate;
      _selectedCustomerId = draft.customerId;
      _selectedSourceOrgId = draft.sourceOrgId;
      _selectedDestinationOrgId = draft.destinationOrgId;
      _selectedMaterialId = draft.materialId;
      _selectedPickupLocationId = draft.pickupLocationId;
      _selectedDropoffLocationId = draft.dropoffLocationId;
      _selectedDriverId = draft.assignedDriverId;
      _selectedVehicleId = draft.assignedVehicleId;
    });
  }

  void _selectCustomerRef(String? id) {
    setState(() {
      _selectedCustomerId = id;
      _customerController.text = _orderFormRefs?.customers.firstWhereOrNull((item) => item.id == id)?.name ?? _customerController.text;
    });
  }

  void _selectMaterialRef(String? id) {
    setState(() {
      _selectedMaterialId = id;
      final material = _orderFormRefs?.materials.firstWhereOrNull((item) => item.id == id);
      _materialController.text = material?.name ?? _materialController.text;
      if (material?.subtitle == 'm3') {
        _volumeUnit = 'м3';
      } else if (material?.subtitle == 'ton') {
        _volumeUnit = 'т';
      }
    });
  }

  void _selectPickupLocationRef(String? id) {
    setState(() {
      _selectedPickupLocationId = id;
      _routeFromController.text = _orderFormRefs?.locations.firstWhereOrNull((item) => item.id == id)?.name ?? _routeFromController.text;
    });
  }

  void _selectDropoffLocationRef(String? id) {
    setState(() {
      _selectedDropoffLocationId = id;
      _routeToController.text = _orderFormRefs?.locations.firstWhereOrNull((item) => item.id == id)?.name ?? _routeToController.text;
    });
  }

  void _selectDriverRef(String? id) {
    setState(() {
      _selectedDriverId = id;
      _selectedDriverName = _orderFormRefs?.drivers.firstWhereOrNull((item) => item.id == id)?.name;
    });
  }

  void _selectVehicleRef(String? id) {
    setState(() {
      _selectedVehicleId = id;
      _selectedVehiclePlate = _orderFormRefs?.vehicles.firstWhereOrNull((item) => item.id == id)?.name;
    });
  }

  Future<void> _saveOrder() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_isSavingOrder) {
      return;
    }

    if ((_statusLabel == 'Назначена' || _statusLabel == 'В работе') && (_selectedDriverName == null || _selectedVehiclePlate == null)) {
      _showMessage('Для статуса "$_statusLabel" нужно назначить и водителя, и машину.');
      return;
    }

    final repository = ref.read(devOperationsRepositoryProvider);
    final vehicles = repository.getVehicles();
    final selectedVehicle = vehicles.where((item) => item.plateNumber == _selectedVehiclePlate).cast().firstOrNull;
    if (selectedVehicle != null && (selectedVehicle.statusLabel == 'На сервисе') && (_statusLabel == 'Назначена' || _statusLabel == 'В работе')) {
      _showMessage('Нельзя назначить машину со статусом "На сервисе" на активную заявку.');
      return;
    }

    setState(() => _isSavingOrder = true);

    try {
      final currentOrder = ref.read(ordersControllerProvider).where((item) => item.id == _editingOrderId).firstOrNull;
      await ref.read(ordersControllerProvider.notifier).saveOrder(
            OrderDraft(
              id: _editingOrderId,
              orderNumber: currentOrder?.orderNumber ?? '',
              customerName: _customerController.text,
              routeFrom: _routeFromController.text,
              routeTo: _routeToController.text,
              materialName: _materialController.text,
              volumeValue: _volumeController.text,
              volumeUnit: _volumeUnit,
              statusLabel: _statusLabel,
              driverName: _selectedDriverName,
              vehiclePlate: _selectedVehiclePlate,
              driverRateRub: int.tryParse(_rateController.text.trim()) ?? 0,
              adminRatePerUnitRub: int.tryParse(_unitRateController.text.trim()) ?? 0,
              customerId: _selectedCustomerId ?? currentOrder?.customerId,
              sourceOrgId: _selectedSourceOrgId ?? currentOrder?.sourceOrgId,
              destinationOrgId: _selectedDestinationOrgId ?? currentOrder?.destinationOrgId,
              materialId: _selectedMaterialId ?? currentOrder?.materialId,
              pickupLocationId: _selectedPickupLocationId ?? currentOrder?.pickupLocationId,
              dropoffLocationId: _selectedDropoffLocationId ?? currentOrder?.dropoffLocationId,
              assignedDriverId: _selectedDriverId ?? currentOrder?.assignedDriverId,
              assignedVehicleId: _selectedVehicleId ?? currentOrder?.assignedVehicleId,
            ),
          );

      if (!mounted) return;
      _showMessage(_editingOrderId == null ? 'Заявка создана.' : 'Изменения по заявке сохранены.');
      _startCreate();
    } catch (error) {
      if (!mounted) return;
      _showMessage('Не удалось сохранить заявку: $error');
    } finally {
      if (mounted) {
        setState(() => _isSavingOrder = false);
      }
    }
  }

  void _showMessage(String text) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }
}

class _RemoteOrdersBanner extends StatelessWidget {
  const _RemoteOrdersBanner({
    required this.isLoading,
    required this.error,
    required this.onRetry,
  });

  final bool isLoading;
  final String? error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    if (!AppConfig.isSupabaseConfigured) {
      return const SizedBox.shrink();
    }

    if (!isLoading && error == null) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
      child: AppPanel(
        child: Row(
          children: [
            if (isLoading)
              const SizedBox.square(
                dimension: 18,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            else
              Icon(Icons.warning_rounded, color: Theme.of(context).colorScheme.error),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                isLoading
                    ? 'Загружаем заявки из Supabase...'
                    : 'Не удалось загрузить заявки из Supabase. Оставлены локальные dev-данные.\n$error',
              ),
            ),
            if (!isLoading)
              TextButton(
                onPressed: onRetry,
                child: const Text('Повторить'),
              ),
          ],
        ),
      ),
    );
  }
}

class _OrdersListPane extends StatelessWidget {
  const _OrdersListPane({
    required this.orders,
    required this.selectedOrderId,
    required this.currency,
    required this.onSelect,
  });

  final List<OrderSummary> orders;
  final String? selectedOrderId;
  final NumberFormat currency;
  final ValueChanged<OrderSummary> onSelect;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(24),
      itemCount: orders.length + 1,
      separatorBuilder: (context, index) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        if (index == 0) {
          return const AppPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Этап проекта: рабочий модуль заявок'),
                SizedBox(height: 8),
                Text('Теперь админ может не только видеть список, но и собирать заявку: заказчик, маршрут, материал, объем, ставка, водитель и машина.'),
              ],
            ),
          );
        }

        final order = orders[index - 1];
        final tone = switch (order.statusLabel) {
          'В работе' => AppStatusTone.success,
          'Назначена' => AppStatusTone.info,
          'Отменена' => AppStatusTone.danger,
          'Завершена' => AppStatusTone.muted,
          _ => AppStatusTone.warning,
        };

        final isSelected = order.id == selectedOrderId;

        return InkWell(
          borderRadius: BorderRadius.circular(24),
          onTap: () => onSelect(order),
          child: AppPanel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        '${order.orderNumber} · ${order.customerName}',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                      ),
                    ),
                    if (isSelected) ...[
                      const Icon(Icons.edit_rounded, size: 18),
                      const SizedBox(width: 8),
                    ],
                    AppStatusBadge(label: order.statusLabel, tone: tone),
                  ],
                ),
                const SizedBox(height: 10),
                Text(order.routeLabel),
                const SizedBox(height: 6),
                Text('${order.materialName} · ${order.volumeText} · ставка водителю ${currency.format(order.driverRateRub)} ₽/рейс'),
                const SizedBox(height: 6),
                Text('Админ: ${currency.format(order.adminRatePerUnitRub)} ₽ за ед. (${order.volumeText.split(' ').last})'),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 12,
                  runSpacing: 8,
                  children: [
                    Text('Водитель: ${order.driverName}'),
                    Text('Машина: ${order.vehiclePlate}'),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _OrderEditorPane extends StatelessWidget {
  const _OrderEditorPane({
    required this.formKey,
    required this.selectedOrder,
    required this.customerController,
    required this.routeFromController,
    required this.routeToController,
    required this.materialController,
    required this.volumeController,
    required this.rateController,
    required this.unitRateController,
    required this.statusLabel,
    required this.volumeUnit,
    required this.selectedDriverName,
    required this.selectedVehiclePlate,
    required this.statusOptions,
    required this.drivers,
    required this.vehicles,
    required this.orderFormRefs,
    required this.isLoadingOrderRefs,
    required this.selectedCustomerId,
    required this.selectedSourceOrgId,
    required this.selectedDestinationOrgId,
    required this.selectedMaterialId,
    required this.selectedPickupLocationId,
    required this.selectedDropoffLocationId,
    required this.selectedDriverId,
    required this.selectedVehicleId,
    required this.onCustomerRefChanged,
    required this.onSourceOrgRefChanged,
    required this.onDestinationOrgRefChanged,
    required this.onMaterialRefChanged,
    required this.onPickupLocationRefChanged,
    required this.onDropoffLocationRefChanged,
    required this.onDriverRefChanged,
    required this.onVehicleRefChanged,
    required this.onStatusChanged,
    required this.onVolumeUnitChanged,
    required this.onDriverChanged,
    required this.onVehicleChanged,
    required this.onCancel,
    required this.onSave,
    required this.isSaving,
  });

  final GlobalKey<FormState> formKey;
  final OrderSummary? selectedOrder;
  final TextEditingController customerController;
  final TextEditingController routeFromController;
  final TextEditingController routeToController;
  final TextEditingController materialController;
  final TextEditingController volumeController;
  final TextEditingController rateController;
  final TextEditingController unitRateController;
  final String statusLabel;
  final String volumeUnit;
  final String? selectedDriverName;
  final String? selectedVehiclePlate;
  final List<String> statusOptions;
  final List<DriverSummary> drivers;
  final List<VehicleSummary> vehicles;
  final OrderFormRefs? orderFormRefs;
  final bool isLoadingOrderRefs;
  final String? selectedCustomerId;
  final String? selectedSourceOrgId;
  final String? selectedDestinationOrgId;
  final String? selectedMaterialId;
  final String? selectedPickupLocationId;
  final String? selectedDropoffLocationId;
  final String? selectedDriverId;
  final String? selectedVehicleId;
  final ValueChanged<String?> onCustomerRefChanged;
  final ValueChanged<String?> onSourceOrgRefChanged;
  final ValueChanged<String?> onDestinationOrgRefChanged;
  final ValueChanged<String?> onMaterialRefChanged;
  final ValueChanged<String?> onPickupLocationRefChanged;
  final ValueChanged<String?> onDropoffLocationRefChanged;
  final ValueChanged<String?> onDriverRefChanged;
  final ValueChanged<String?> onVehicleRefChanged;
  final ValueChanged<String?> onStatusChanged;
  final ValueChanged<String?> onVolumeUnitChanged;
  final ValueChanged<String?> onDriverChanged;
  final ValueChanged<String?> onVehicleChanged;
  final VoidCallback onCancel;
  final VoidCallback onSave;
  final bool isSaving;

  @override
  Widget build(BuildContext context) {
    final refs = orderFormRefs;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        AppPanel(
          child: Form(
            key: formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  selectedOrder == null ? 'Новая заявка' : 'Редактирование заявки',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                Text(
                  selectedOrder?.orderNumber ?? 'Номер будет назначен после сохранения.',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 20),
                TextFormField(
                  controller: customerController,
                  decoration: const InputDecoration(labelText: 'Заказчик'),
                  validator: _requiredField,
                ),
                if (AppConfig.isSupabaseConfigured) ...[
                  const SizedBox(height: 12),
                  _RefDropdown(
                    label: 'Supabase: заказчик',
                    value: selectedCustomerId,
                    items: refs?.customers ?? const [],
                    isLoading: isLoadingOrderRefs,
                    onChanged: onCustomerRefChanged,
                  ),
                ],
                const SizedBox(height: 12),
                TextFormField(
                  controller: routeFromController,
                  decoration: const InputDecoration(labelText: 'Точка погрузки'),
                  validator: _requiredField,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: routeToController,
                  decoration: const InputDecoration(labelText: 'Точка разгрузки'),
                  validator: _requiredField,
                ),
                if (AppConfig.isSupabaseConfigured) ...[
                  const SizedBox(height: 12),
                  _RefDropdown(
                    label: 'Supabase: организация-отправитель',
                    value: selectedSourceOrgId,
                    items: refs?.organizations ?? const [],
                    isLoading: isLoadingOrderRefs,
                    onChanged: onSourceOrgRefChanged,
                  ),
                  const SizedBox(height: 12),
                  _RefDropdown(
                    label: 'Supabase: организация-получатель',
                    value: selectedDestinationOrgId,
                    items: refs?.organizations ?? const [],
                    isLoading: isLoadingOrderRefs,
                    onChanged: onDestinationOrgRefChanged,
                  ),
                  const SizedBox(height: 12),
                  _RefDropdown(
                    label: 'Supabase: точка погрузки',
                    value: selectedPickupLocationId,
                    items: refs?.locations ?? const [],
                    isLoading: isLoadingOrderRefs,
                    onChanged: onPickupLocationRefChanged,
                  ),
                  const SizedBox(height: 12),
                  _RefDropdown(
                    label: 'Supabase: точка разгрузки',
                    value: selectedDropoffLocationId,
                    items: refs?.locations ?? const [],
                    isLoading: isLoadingOrderRefs,
                    onChanged: onDropoffLocationRefChanged,
                  ),
                ],
                const SizedBox(height: 12),
                TextFormField(
                  controller: materialController,
                  decoration: const InputDecoration(labelText: 'Материал'),
                  validator: _requiredField,
                ),
                if (AppConfig.isSupabaseConfigured) ...[
                  const SizedBox(height: 12),
                  _RefDropdown(
                    label: 'Supabase: материал',
                    value: selectedMaterialId,
                    items: refs?.materials ?? const [],
                    isLoading: isLoadingOrderRefs,
                    onChanged: onMaterialRefChanged,
                  ),
                ],
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: volumeController,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        decoration: const InputDecoration(labelText: 'Объем'),
                        validator: _requiredField,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: volumeUnit,
                        decoration: const InputDecoration(labelText: 'Ед. измерения'),
                        items: const [
                          DropdownMenuItem(value: 'т', child: Text('т')),
                          DropdownMenuItem(value: 'м3', child: Text('м3')),
                        ],
                        onChanged: onVolumeUnitChanged,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: rateController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Ставка водителя за рейс, ₽'),
                  validator: (value) {
                    if ((value ?? '').trim().isEmpty) {
                      return 'Укажите ставку';
                    }
                    if ((int.tryParse(value!.trim()) ?? -1) < 0) {
                      return 'Ставка должна быть неотрицательной';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: unitRateController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(labelText: 'Админ: ставка за ${volumeUnit == 'м3' ? 'м3' : 'тонну'}, ₽'),
                  validator: (value) {
                    if ((value ?? '').trim().isEmpty) {
                      return 'Укажите ставку за единицу';
                    }
                    if ((int.tryParse(value!.trim()) ?? -1) < 0) {
                      return 'Ставка должна быть неотрицательной';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: statusLabel,
                  decoration: const InputDecoration(labelText: 'Статус заявки'),
                  items: [
                    for (final item in statusOptions) DropdownMenuItem(value: item, child: Text(item)),
                  ],
                  onChanged: onStatusChanged,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String?>(
                  initialValue: AppConfig.isSupabaseConfigured ? selectedDriverId : selectedDriverName,
                  decoration: const InputDecoration(labelText: 'Назначить водителя'),
                  items: [
                    const DropdownMenuItem<String?>(value: null, child: Text('Пока без водителя')),
                    if (AppConfig.isSupabaseConfigured && refs != null)
                      for (final driver in refs.drivers)
                        DropdownMenuItem<String?>(
                          value: driver.id,
                          child: Text(_refLabel(driver)),
                        )
                    else
                      for (final driver in drivers)
                      DropdownMenuItem<String?>(
                        value: driver.fullName,
                        child: Text('${driver.fullName} · ${driver.statusLabel}'),
                      ),
                  ],
                  onChanged: AppConfig.isSupabaseConfigured ? onDriverRefChanged : onDriverChanged,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String?>(
                  initialValue: AppConfig.isSupabaseConfigured ? selectedVehicleId : selectedVehiclePlate,
                  decoration: const InputDecoration(labelText: 'Назначить машину'),
                  items: [
                    const DropdownMenuItem<String?>(value: null, child: Text('Пока без машины')),
                    if (AppConfig.isSupabaseConfigured && refs != null)
                      for (final vehicle in refs.vehicles)
                        DropdownMenuItem<String?>(
                          value: vehicle.id,
                          child: Text(_refLabel(vehicle)),
                        )
                    else
                      for (final vehicle in vehicles)
                      DropdownMenuItem<String?>(
                        value: vehicle.plateNumber,
                        child: Text('${vehicle.plateNumber} · ${vehicle.displayName} · ${vehicle.statusLabel}'),
                      ),
                  ],
                  onChanged: AppConfig.isSupabaseConfigured ? onVehicleRefChanged : onVehicleChanged,
                ),
                const SizedBox(height: 18),
                const Text(
                  'Правило: для статусов "Назначена" и "В работе" обязательно назначить водителя и машину. Машину со статусом "На сервисе" назначать нельзя.',
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: isSaving ? null : onCancel,
                        child: const Text('Очистить форму'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: isSaving ? null : onSave,
                        icon: isSaving
                            ? const SizedBox.square(
                                dimension: 18,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.save_rounded),
                        label: Text(isSaving ? 'Сохраняем...' : 'Сохранить'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  static String? _requiredField(String? value) {
    if ((value ?? '').trim().isEmpty) {
      return 'Заполните поле';
    }
    return null;
  }
}

class _RefDropdown extends StatelessWidget {
  const _RefDropdown({
    required this.label,
    required this.value,
    required this.items,
    required this.isLoading,
    required this.onChanged,
  });

  final String label;
  final String? value;
  final List<OrderRefItem> items;
  final bool isLoading;
  final ValueChanged<String?> onChanged;

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<String?>(
      initialValue: value,
      decoration: InputDecoration(
        labelText: label,
        helperText: isLoading ? 'Загружаем справочник...' : null,
      ),
      items: [
        const DropdownMenuItem<String?>(value: null, child: Text('Не выбрано')),
        for (final item in items)
          DropdownMenuItem<String?>(
            value: item.id,
            child: Text(_refLabel(item)),
          ),
      ],
      onChanged: isLoading ? null : onChanged,
    );
  }
}

String _refLabel(OrderRefItem item) {
  final subtitle = item.subtitle?.trim();
  if (subtitle == null || subtitle.isEmpty) {
    return item.name;
  }
  return '${item.name} · $subtitle';
}

extension<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;

  T? firstWhereOrNull(bool Function(T item) test) {
    for (final item in this) {
      if (test(item)) {
        return item;
      }
    }
    return null;
  }
}
