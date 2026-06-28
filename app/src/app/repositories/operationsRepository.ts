import { appEnv } from "../config/env";
import { getSupabaseClient } from "../services/supabaseClient";
import type { AppDictionaryItem, AppDocument, AppDriver, AppOrder, AppShift, AppTrip, AppVehicle, AssignedDriver, CloseShiftInput, CreateDictionaryItemInput, CreateDriverInput, CreateOrderInput, CreateVehicleInput, OpenShiftInput, SubmitTripInput, UpdateOrderInput } from "../store/AppStore";

export interface OperationsRepository {
  mode: "mock" | "supabase";
  listOrders: () => Promise<AppOrder[]>;
  listTrips: () => Promise<AppTrip[]>;
  listDocuments: () => Promise<AppDocument[]>;
  listShifts: () => Promise<AppShift[]>;
  listDrivers: () => Promise<AppDriver[]>;
  listVehicles: () => Promise<AppVehicle[]>;
  listDictionaries: () => Promise<AppDictionaryItem[]>;
  createOrder: (order: CreateOrderInput) => Promise<void>;
  updateOrder: (order: UpdateOrderInput) => Promise<void>;
  createDriver: (driver: CreateDriverInput) => Promise<void>;
  createVehicle: (vehicle: CreateVehicleInput) => Promise<void>;
  createDictionaryItem: (item: CreateDictionaryItemInput) => Promise<void>;
  assignDrivers: (orderNumber: string, drivers: AssignedDriver[]) => Promise<void>;
  updateOrderStatus: (orderNumber: string, status: AppOrder["status"]) => Promise<void>;
  openShift: (input: OpenShiftInput) => Promise<void>;
  updateShiftStatus: (shiftId: string, status: AppShift["status"]) => Promise<void>;
  submitTripReport: (trip: SubmitTripInput) => Promise<void>;
  closeShift: (input: CloseShiftInput) => Promise<void>;
}

export const operationsRepository: OperationsRepository = appEnv.isSupabaseConfigured
  ? createSupabaseOperationsRepository()
  : createMockOperationsRepository();

function createMockOperationsRepository(): OperationsRepository {
  return {
    mode: "mock",
    async listOrders() {
      return [];
    },
    async listTrips() {
      return [];
    },
    async listDocuments() {
      return [];
    },
    async listShifts() {
      return [];
    },
    async listDrivers() {
      return [];
    },
    async listVehicles() {
      return [];
    },
    async listDictionaries() {
      return [];
    },
    async createOrder() {},
    async updateOrder() {},
    async createDriver() {},
    async createVehicle() {},
    async createDictionaryItem() {},
    async assignDrivers() {},
    async updateOrderStatus() {},
    async openShift() {},
    async updateShiftStatus() {},
    async submitTripReport() {},
    async closeShift() {},
  };
}

function createSupabaseOperationsRepository(): OperationsRepository {
  return {
    mode: "supabase",
    async listOrders() {
      const supabase = await requireSupabaseClient();
      const { data, error } = await supabase
        .from("orders")
        .select(`
          order_number,
          order_date,
          total_volume_planned,
          volume_unit,
          driver_rate_per_trip,
          admin_rate_per_unit,
          assigned_driver_id,
          assigned_vehicle_id,
          notes,
          status,
          customers(name),
          organizations!orders_source_org_id_fkey(name),
          destination:organizations!orders_destination_org_id_fkey(name),
          materials(name),
          pickup:locations!orders_pickup_location_id_fkey(name,address),
          dropoff:locations!orders_dropoff_location_id_fkey(name,address),
          driver:users!orders_assigned_driver_id_fkey(full_name,phone),
          vehicle:vehicles!orders_assigned_vehicle_id_fkey(brand,model,plate_number),
          order_assignments(
            driver_id,
            vehicle_id,
            driver:users!order_assignments_driver_id_fkey(full_name,phone),
            vehicle:vehicles!order_assignments_vehicle_id_fkey(brand,model,plate_number)
          )
        `)
        .order("order_date", { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []).map(mapOrderRow);
    },
    async listTrips() {
      const supabase = await requireSupabaseClient();
      const { data, error } = await supabase
        .from("trips")
        .select(`
          id,
          driver_id,
          vehicle_id,
          shift_id,
          trip_date,
          loaded_volume,
          ttn_number_manual,
          status,
          ocr_status,
          ocr_ttn_number,
          ocr_volume,
          orders(order_number, customers(name)),
          driver:users!trips_driver_id_fkey(full_name),
          vehicle:vehicles!trips_vehicle_id_fkey(plate_number)
        `)
        .order("trip_date", { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []).map(mapTripRow);
    },
    async listDocuments() {
      const supabase = await requireSupabaseClient();
      const { data, error } = await supabase
        .from("documents")
        .select(`
          id,
          entity_id,
          document_type,
          file_path,
          uploaded_at,
          metadata_json
        `)
        .eq("entity_type", "trip")
        .order("uploaded_at", { ascending: false });

      if (error) throw new Error(error.message);

      const tripIds = [...new Set((data ?? []).map((row: any) => row.entity_id).filter(Boolean))];
      const tripById = new Map<string, any>();

      if (tripIds.length > 0) {
        const { data: tripsData, error: tripsError } = await supabase
          .from("trips")
          .select(`
            id,
            trip_date,
            ttn_number_manual,
            ocr_status,
            orders(order_number, customers(name)),
            driver:users!trips_driver_id_fkey(full_name),
            vehicle:vehicles!trips_vehicle_id_fkey(plate_number)
          `)
          .in("id", tripIds);

        if (tripsError) throw new Error(tripsError.message);
        for (const trip of tripsData ?? []) tripById.set(trip.id, trip);
      }

      const rows = await Promise.all((data ?? []).map(async (row: any) => {
        const { data: signed } = await supabase.storage
          .from("documents")
          .createSignedUrl(row.file_path, 60 * 10);
        return mapDocumentRow(row, tripById.get(row.entity_id), signed?.signedUrl);
      }));

      return rows;
    },
    async listShifts() {
      const supabase = await requireSupabaseClient();
      const { data, error } = await supabase
        .from("shifts")
        .select(`
          id,
          driver_id,
          vehicle_id,
          shift_date,
          status,
          start_time,
          end_time,
          closing_odometer,
          fuel_filled_liters,
          total_trips_cached,
          total_volume_cached,
          total_earnings_cached,
          driver:users!shifts_driver_id_fkey(full_name),
          vehicle:vehicles!shifts_vehicle_id_fkey(plate_number,current_odometer)
        `)
        .order("shift_date", { ascending: false })
        .order("start_time", { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []).map(mapShiftRow);
    },
    async listDrivers() {
      const supabase = await requireSupabaseClient();
      const { data, error } = await supabase
        .from("users")
        .select("id,full_name,phone,email,status,driver_profiles(license_number,employment_date)")
        .eq("role", "driver")
        .order("full_name", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []).map(mapDriverRow);
    },
    async listVehicles() {
      const supabase = await requireSupabaseClient();
      const { data, error } = await supabase
        .from("vehicles")
        .select("id,brand,model,plate_number,status,current_odometer")
        .order("plate_number", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []).map(mapVehicleRow);
    },
    async listDictionaries() {
      const supabase = await requireSupabaseClient();
      const [customers, organizations, materials, locations] = await Promise.all([
        supabase.from("customers").select("id,name,inn,contact_person,phone").order("name", { ascending: true }),
        supabase.from("organizations").select("id,name,type,address").order("name", { ascending: true }),
        supabase.from("materials").select("id,name,unit,is_active").order("name", { ascending: true }),
        supabase.from("locations").select("id,name,address").order("name", { ascending: true }),
      ]);

      const firstError = [customers.error, organizations.error, materials.error, locations.error].find(Boolean);
      if (firstError) throw new Error(firstError.message);

      return [
        ...(customers.data ?? []).map(mapCustomerDictionaryRow),
        ...(organizations.data ?? []).map(mapOrganizationDictionaryRow),
        ...(materials.data ?? []).map(mapMaterialDictionaryRow),
        ...(locations.data ?? []).map(mapLocationDictionaryRow),
      ];
    },
    async createOrder(order) {
      const supabase = await requireSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error(authError.message);
      const userId = authData.user?.id;
      if (!userId) throw new Error("Для создания заявки нужно войти в Supabase");

      const volumeUnit = order.volumeUnit === "м³" ? "m3" : "ton";
      const [customer, sourceOrg, destinationOrg, material, pickup, dropoff] = await Promise.all([
        getOrCreateCustomer(supabase, order.customer),
        getOrCreateOrganization(supabase, order.from, "source"),
        getOrCreateOrganization(supabase, order.to, "destination"),
        getOrCreateMaterial(supabase, order.material, volumeUnit),
        getOrCreateLocation(supabase, order.pointA),
        getOrCreateLocation(supabase, order.pointB),
      ]);

      const { data: insertedOrder, error } = await supabase.from("orders").insert({
        order_number: order.number,
        order_date: parseRuDate(order.date),
        customer_id: customer.id,
        source_org_id: sourceOrg.id,
        destination_org_id: destinationOrg.id,
        material_id: material.id,
        total_volume_planned: order.volume ?? null,
        volume_unit: volumeUnit,
        pickup_location_id: pickup.id,
        dropoff_location_id: dropoff.id,
        driver_rate_per_trip: order.ratePerTrip,
        admin_rate_per_unit: order.clientRate ?? null,
        notes: order.note ?? null,
        status: "draft",
        created_by: userId,
      }).select("id").single();

      if (error) throw new Error(error.message);
      await insertAuditLog(supabase, {
        userId,
        action: "order.create",
        entityType: "order",
        entityId: insertedOrder.id,
        newData: {
          order_number: order.number,
          status: "draft",
          customer: order.customer,
          total_volume_planned: order.volume ?? null,
        },
      });
    },
    async updateOrder(order) {
      const supabase = await requireSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error(authError.message);
      const userId = authData.user?.id;
      if (!userId) throw new Error("Для редактирования заявки нужно войти в Supabase");

      const volumeUnit = order.volumeUnit === "м³" ? "m3" : "ton";
      const [customer, sourceOrg, destinationOrg, material, pickup, dropoff] = await Promise.all([
        getOrCreateCustomer(supabase, order.customer),
        getOrCreateOrganization(supabase, order.from, "source"),
        getOrCreateOrganization(supabase, order.to, "destination"),
        getOrCreateMaterial(supabase, order.material, volumeUnit),
        getOrCreateLocation(supabase, order.pointA),
        getOrCreateLocation(supabase, order.pointB),
      ]);

      const { data: updatedOrder, error } = await supabase.from("orders").update({
        order_date: parseRuDate(order.date),
        customer_id: customer.id,
        source_org_id: sourceOrg.id,
        destination_org_id: destinationOrg.id,
        material_id: material.id,
        total_volume_planned: order.volume ?? null,
        volume_unit: volumeUnit,
        pickup_location_id: pickup.id,
        dropoff_location_id: dropoff.id,
        driver_rate_per_trip: order.ratePerTrip,
        admin_rate_per_unit: order.clientRate ?? null,
        notes: order.note ?? null,
      }).eq("order_number", order.number).select("id").single();

      if (error) throw new Error(error.message);
      await insertAuditLog(supabase, {
        userId,
        action: "order.update",
        entityType: "order",
        entityId: updatedOrder.id,
        newData: {
          order_number: order.number,
          customer: order.customer,
          total_volume_planned: order.volume ?? null,
        },
      });
    },
    async createDriver(driver) {
      const supabase = await requireSupabaseClient();
      const { error } = await supabase.functions.invoke("create-driver", { body: driver });
      if (error) throw new Error(error.message);
    },
    async createVehicle(vehicle) {
      const supabase = await requireSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error(authError.message);
      const userId = authData.user?.id;
      if (!userId) throw new Error("Для создания ТС нужно войти в Supabase");

      const plateNumber = normalizePlate(vehicle.plate);
      const { data: existing, error: existingError } = await supabase
        .from("vehicles")
        .select("id")
        .eq("plate_number", plateNumber)
        .maybeSingle();
      if (existingError) throw new Error(existingError.message);
      if (existing) throw new Error(`ТС с госномером ${plateNumber} уже есть в системе`);

      const notes = buildVehicleNotes(vehicle);
      const { data: insertedVehicle, error } = await supabase.from("vehicles").insert({
        brand: vehicle.brand.trim(),
        model: vehicle.model.trim() || null,
        plate_number: plateNumber,
        vin: vehicle.vin.trim() || null,
        current_odometer: vehicle.currentOdometer ?? 0,
        status: "active",
        notes,
      }).select("id").single();

      if (error) throw new Error(error.message);
      await insertAuditLog(supabase, {
        userId,
        action: "vehicle.create",
        entityType: "vehicle",
        entityId: insertedVehicle.id,
        newData: {
          plate_number: plateNumber,
          brand: vehicle.brand,
          model: vehicle.model,
          status: "active",
        },
      });
    },
    async createDictionaryItem(item) {
      const supabase = await requireSupabaseClient();
      const role = await getCurrentUserRole(supabase);
      if (!isStaffRole(role)) {
        throw new Error("Редактировать справочники может только руководитель или оператор");
      }

      const name = item.name.trim();
      if (!name) throw new Error("Укажите название элемента справочника");

      if (item.kind === "customers") {
        await ensureDictionaryNameIsUnique(supabase, "customers", name);
        const { error } = await supabase.from("customers").insert({ name, notes: item.subtitle?.trim() || null });
        if (error) throw new Error(error.message);
        return;
      }

      if (item.kind === "organizations") {
        await ensureDictionaryNameIsUnique(supabase, "organizations", name);
        const { error } = await supabase.from("organizations").insert({
          name,
          type: "universal",
          address: item.subtitle?.trim() || null,
        });
        if (error) throw new Error(error.message);
        return;
      }

      if (item.kind === "materials") {
        await ensureDictionaryNameIsUnique(supabase, "materials", name);
        const unit = item.subtitle?.includes("м³") ? "m3" : "ton";
        const { error } = await supabase.from("materials").insert({ name, unit, is_active: true });
        if (error) throw new Error(error.message);
        return;
      }

      await ensureDictionaryNameIsUnique(supabase, "locations", name);
      const address = item.subtitle?.trim() || name;
      const { error } = await supabase.from("locations").insert({ name, address });
      if (error) throw new Error(error.message);
    },
    async assignDrivers(orderNumber, drivers) {
      const supabase = await requireSupabaseClient();
      const { data: authData } = await supabase.auth.getUser();
      const createdBy = authData.user?.id ?? null;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", orderNumber)
        .single();
      if (orderError) throw new Error(orderError.message);

      const firstDriver = drivers[0];

      if (!firstDriver) {
        const { error: deleteError } = await supabase
          .from("order_assignments")
          .delete()
          .eq("order_id", order.id);
        if (deleteError) throw new Error(deleteError.message);

        const { error } = await supabase
          .from("orders")
          .update({ assigned_driver_id: null, assigned_vehicle_id: null, status: "draft" })
          .eq("order_number", orderNumber);
        if (error) throw new Error(error.message);
        await insertAuditLog(supabase, {
          userId: createdBy,
          action: "order.unassign",
          entityType: "order",
          entityId: order.id,
          newData: { order_number: orderNumber, status: "draft", assignments_count: 0 },
        });
        return;
      }

      const driverId = firstDriver.driverId ?? await findDriverIdByName(supabase, firstDriver.name);
      const vehicleId = firstDriver.vehicleId ?? await findVehicleIdByPlate(supabase, firstDriver.vehicle);
      if (!driverId) throw new Error("Водитель не найден в public.users. Проверьте профиль водителя в Supabase.");
      if (!vehicleId) throw new Error("ТС не найдено в public.vehicles. Добавьте машину или выберите существующую.");
      await assertVehicleAssignable(supabase, vehicleId, firstDriver.vehicle);

      const assignmentRows = await Promise.all(drivers.map(async (driver) => {
        const resolvedDriverId = driver.driverId ?? await findDriverIdByName(supabase, driver.name);
        const resolvedVehicleId = driver.vehicleId ?? await findVehicleIdByPlate(supabase, driver.vehicle);
        if (!resolvedDriverId) throw new Error(`Водитель ${driver.name} не найден в public.users.`);
        if (!resolvedVehicleId) throw new Error(`ТС ${driver.vehicle} не найдено в public.vehicles.`);
        await assertVehicleAssignable(supabase, resolvedVehicleId, driver.vehicle);
        return {
          order_id: order.id,
          driver_id: resolvedDriverId,
          vehicle_id: resolvedVehicleId,
          created_by: createdBy,
        };
      }));

      const { error: deleteError } = await supabase
        .from("order_assignments")
        .delete()
        .eq("order_id", order.id);
      if (deleteError) throw new Error(deleteError.message);

      const { error: insertError } = await supabase
        .from("order_assignments")
        .insert(assignmentRows);
      if (insertError) throw new Error(insertError.message);

      const { error } = await supabase
        .from("orders")
        .update({
          assigned_driver_id: driverId,
          assigned_vehicle_id: vehicleId,
          status: "assigned",
        })
        .eq("order_number", orderNumber);

      if (error) throw new Error(error.message);
      await insertAuditLog(supabase, {
        userId: createdBy,
        action: "order.assign_drivers",
        entityType: "order",
        entityId: order.id,
        newData: {
          order_number: orderNumber,
          status: "assigned",
          assignments: assignmentRows.map((assignment) => ({
            driver_id: assignment.driver_id,
            vehicle_id: assignment.vehicle_id,
          })),
        },
      });
    },
    async updateOrderStatus(orderNumber, status) {
      const supabase = await requireSupabaseClient();
      const { data: authData } = await supabase.auth.getUser();
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id,status")
        .eq("order_number", orderNumber)
        .single();
      if (orderError) throw new Error(orderError.message);

      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("order_number", orderNumber);
      if (error) throw new Error(error.message);
      await insertAuditLog(supabase, {
        userId: authData.user?.id ?? null,
        action: "order.status_update",
        entityType: "order",
        entityId: order.id,
        oldData: { status: order.status },
        newData: { status },
      });
    },
    async updateShiftStatus(shiftId, status) {
      const supabase = await requireSupabaseClient();
      const { data: authData } = await supabase.auth.getUser();
      const role = await getCurrentUserRole(supabase);
      if (!isStaffRole(role)) {
        throw new Error("Изменять статус закрытой смены может только руководитель или оператор");
      }

      const { data: shift, error: shiftError } = await supabase
        .from("shifts")
        .select("id,status")
        .eq("id", shiftId)
        .single();
      if (shiftError) throw new Error(shiftError.message);

      const { error } = await supabase
        .from("shifts")
        .update({ status })
        .eq("id", shiftId);
      if (error) throw new Error(error.message);
      await insertAuditLog(supabase, {
        userId: authData.user?.id ?? null,
        action: status === "approved" ? "shift.approve" : "shift.status_update",
        entityType: "shift",
        entityId: shift.id,
        oldData: { status: shift.status },
        newData: { status },
      });
    },
    async openShift(input) {
      const supabase = await requireSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error(authError.message);
      const userId = authData.user?.id;
      if (!userId) throw new Error("Для открытия смены нужно войти в Supabase");

      const { data: existingShift, error: existingError } = await supabase
        .from("shifts")
        .select("id")
        .eq("driver_id", userId)
        .eq("status", "open")
        .maybeSingle();
      if (existingError) throw new Error(existingError.message);
      if (existingShift) throw new Error("У водителя уже есть открытая смена");

      let vehicleId = input.vehicleId;
      if (!vehicleId) {
        const { data: assignment, error: assignmentError } = await supabase
          .from("order_assignments")
          .select("vehicle_id, orders(status)")
          .eq("driver_id", userId)
          .in("orders.status", ["assigned", "in_progress"])
          .limit(1)
          .maybeSingle();
        if (assignmentError) throw new Error(assignmentError.message);
        vehicleId = assignment?.vehicle_id;
      }

      if (!vehicleId) throw new Error("Не найдена назначенная машина для открытия смены");

      const { data: insertedShift, error } = await supabase.from("shifts").insert({
        driver_id: userId,
        vehicle_id: vehicleId,
        status: "open",
        start_time: new Date().toISOString(),
      }).select("id").single();
      if (error) throw new Error(error.message);
      await insertAuditLog(supabase, {
        userId,
        action: "shift.open",
        entityType: "shift",
        entityId: insertedShift.id,
        newData: { status: "open", vehicle_id: vehicleId },
      });
    },
    async submitTripReport(trip) {
      const supabase = await requireSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error(authError.message);
      const userId = authData.user?.id;
      if (!userId) throw new Error("Для отправки рейса нужно войти в Supabase");

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id,assigned_driver_id,assigned_vehicle_id,status")
        .eq("order_number", trip.orderNumber)
        .single();
      if (orderError) throw new Error(orderError.message);
      if (!["assigned", "in_progress"].includes(order.status)) {
        throw new Error("Рейсовый отчёт можно отправить только по активной назначенной заявке");
      }

      const { data: assignment, error: assignmentError } = await supabase
        .from("order_assignments")
        .select("vehicle_id")
        .eq("order_id", order.id)
        .eq("driver_id", userId)
        .maybeSingle();
      if (assignmentError) throw new Error(assignmentError.message);

      const vehicleId = assignment?.vehicle_id ?? order.assigned_vehicle_id;
      if (!vehicleId) throw new Error("В заявке не назначена машина для текущего водителя");

      const shiftId = await getOrCreateOpenShift(supabase, userId, vehicleId);

      const ocrChecked = Boolean(trip.ocrChecked);
      const { data: insertedTrip, error: tripError } = await supabase
        .from("trips")
        .insert({
          order_id: order.id,
          shift_id: shiftId,
          driver_id: userId,
          vehicle_id: vehicleId,
          loaded_volume: trip.volume,
          volume_unit: trip.volumeUnit === "tons" ? "ton" : "m3",
          ttn_number_manual: trip.consignmentNote,
          status: trip.hasOcrMismatch ? "needs_review" : "submitted",
          ocr_status: ocrChecked ? (trip.hasOcrMismatch ? "mismatch" : "matched") : "not_required",
          ocr_ttn_number: ocrChecked && !trip.hasOcrMismatch ? trip.consignmentNote : null,
          ocr_volume: ocrChecked && !trip.hasOcrMismatch ? trip.volume : null,
        })
        .select("id")
        .single();
      if (tripError) throw new Error(tripError.message);
      await insertAuditLog(supabase, {
        userId,
        action: "trip.submit_report",
        entityType: "trip",
        entityId: insertedTrip.id,
        newData: {
          order_id: order.id,
          shift_id: shiftId,
          vehicle_id: vehicleId,
          ttn_number_manual: trip.consignmentNote,
          loaded_volume: trip.volume,
          status: trip.hasOcrMismatch ? "needs_review" : "submitted",
        },
      });

      if (trip.photoDataUrl) {
        const { blob, mimeType } = dataUrlToBlob(trip.photoDataUrl);
        const filePath = `trips/${insertedTrip.id}/ttn/${Date.now()}_ttn.${extensionByMime(mimeType)}`;
        const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, blob, {
          contentType: mimeType,
          upsert: false,
        });
        if (uploadError) throw new Error(uploadError.message);

        const { data: insertedDocument, error: documentError } = await supabase.from("documents").insert({
          entity_type: "trip",
          entity_id: insertedTrip.id,
          document_type: "ttn",
          file_path: filePath,
          file_name: "ttn.jpg",
          mime_type: mimeType,
          uploaded_by: userId,
          metadata_json: {
            source: "react_app",
            order_number: trip.orderNumber,
            ttn_number: trip.consignmentNote,
          },
        }).select("id").single();
        if (documentError) throw new Error(documentError.message);
        await insertAuditLog(supabase, {
          userId,
          action: "document.upload_ttn",
          entityType: "document",
          entityId: insertedDocument.id,
          newData: {
            entity_type: "trip",
            entity_id: insertedTrip.id,
            document_type: "ttn",
            file_path: filePath,
          },
        });
      }

      if (order.status === "assigned") {
        await supabase.from("orders").update({ status: "in_progress" }).eq("id", order.id);
        await insertAuditLog(supabase, {
          userId,
          action: "order.status_update",
          entityType: "order",
          entityId: order.id,
          oldData: { status: "assigned" },
          newData: { status: "in_progress", reason: "trip_report_submitted" },
        });
      }
    },
    async closeShift(input) {
      const supabase = await requireSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error(authError.message);
      const userId = authData.user?.id;
      if (!userId) throw new Error("Для закрытия смены нужно войти в Supabase");

      const { data: shift, error: shiftError } = await supabase
        .from("shifts")
        .select("id,vehicle_id,status,closing_odometer,fuel_filled_liters,total_trips_cached,total_volume_cached,total_earnings_cached")
        .eq("driver_id", userId)
        .eq("status", "open")
        .maybeSingle();
      if (shiftError) throw new Error(shiftError.message);
      if (!shift) throw new Error("Открытая смена не найдена");

      const { data: trips, error: tripsError } = await supabase
        .from("trips")
        .select("loaded_volume, orders(driver_rate_per_trip)")
        .eq("shift_id", shift.id);
      if (tripsError) throw new Error(tripsError.message);

      const totalTrips = trips?.length ?? 0;
      const totalVolume = (trips ?? []).reduce((sum: number, trip: any) => sum + Number(trip.loaded_volume ?? 0), 0);
      const totalEarnings = (trips ?? []).reduce((sum: number, trip: any) => {
        const order = firstRelation(trip.orders);
        return sum + Number(order?.driver_rate_per_trip ?? 0);
      }, 0);

      const { error: updateError } = await supabase
        .from("shifts")
        .update({
          status: "submitted",
          end_time: new Date().toISOString(),
          closing_odometer: input.closingOdometer,
          fuel_filled_liters: input.fuelFilledLiters ?? null,
          total_trips_cached: totalTrips,
          total_volume_cached: totalVolume,
          total_earnings_cached: totalEarnings,
        })
        .eq("id", shift.id)
        .eq("status", "open");
      if (updateError) throw new Error(updateError.message);
      await insertAuditLog(supabase, {
        userId,
        action: "shift.close",
        entityType: "shift",
        entityId: shift.id,
        oldData: {
          status: shift.status,
          closing_odometer: shift.closing_odometer,
          fuel_filled_liters: shift.fuel_filled_liters,
          total_trips_cached: shift.total_trips_cached,
          total_volume_cached: shift.total_volume_cached,
          total_earnings_cached: shift.total_earnings_cached,
        },
        newData: {
          status: "submitted",
          closing_odometer: input.closingOdometer,
          fuel_filled_liters: input.fuelFilledLiters ?? null,
          total_trips_cached: totalTrips,
          total_volume_cached: totalVolume,
          total_earnings_cached: totalEarnings,
        },
      });

      await supabase
        .from("vehicles")
        .update({ current_odometer: input.closingOdometer })
        .eq("id", shift.vehicle_id);
    },
  };
}

async function requireSupabaseClient() {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error("Supabase не настроен");
  return supabase;
}

async function getCurrentUserRole(supabase: any): Promise<string | null> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw new Error(authError.message);
  const userId = authData.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();
  if (error) throw new Error(error.message);
  return data?.role ?? null;
}

function isStaffRole(role: string | null) {
  return role === "admin" || role === "operator";
}

async function insertAuditLog(
  supabase: any,
  input: {
    userId?: string | null;
    action: string;
    entityType: "user" | "vehicle" | "order" | "trip" | "shift" | "document" | "expense" | "payroll" | "system";
    entityId: string;
    oldData?: Record<string, unknown> | null;
    newData?: Record<string, unknown> | null;
  },
) {
  const { error } = await supabase.from("audit_logs").insert({
    user_id: input.userId ?? null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    old_data_json: input.oldData ?? null,
    new_data_json: input.newData ?? null,
  });
  if (error) throw new Error(`Действие выполнено, но audit log не записан: ${error.message}`);
}

function mapOrderRow(row: any): AppOrder {
  const driver = firstRelation(row.driver);
  const vehicle = firstRelation(row.vehicle);
  const assignments = Array.isArray(row.order_assignments) ? row.order_assignments : [];
  const source = firstRelation(row.organizations);
  const destination = firstRelation(row.destination);
  const customer = firstRelation(row.customers);
  const material = firstRelation(row.materials);
  const pickup = firstRelation(row.pickup);
  const dropoff = firstRelation(row.dropoff);

  return {
    number: row.order_number,
    date: formatRuDate(row.order_date),
    customer: customer?.name ?? "Заказчик",
    from: source?.name ?? "Отправитель",
    to: destination?.name ?? "Получатель",
    material: material?.name ?? "Материал",
    volume: Number(row.total_volume_planned ?? 0),
    volumeUnit: row.volume_unit === "m3" ? "м³" : "тонн",
    pointA: pickup?.address ?? pickup?.name ?? "Погрузка",
    pointB: dropoff?.address ?? dropoff?.name ?? "Разгрузка",
    ratePerTrip: Number(row.driver_rate_per_trip ?? 0),
    clientRate: Number(row.admin_rate_per_unit ?? 0),
    clientRateUnit: row.volume_unit === "m3" ? "м³" : "тонн",
    drivers: assignments.length > 0 ? assignments.map((assignment: any) => {
      const assignedDriver = firstRelation(assignment.driver);
      const assignedVehicle = firstRelation(assignment.vehicle);
      return {
        driverId: assignment.driver_id,
        vehicleId: assignment.vehicle_id,
        name: assignedDriver?.full_name ?? "Водитель",
        phone: assignedDriver?.phone ?? "",
        vehicle: assignedVehicle?.plate_number ?? "ТС",
        vehicleType: [assignedVehicle?.brand, assignedVehicle?.model].filter(Boolean).join(" "),
      };
    }) : driver && vehicle ? [{
      driverId: row.assigned_driver_id,
      vehicleId: row.assigned_vehicle_id,
      name: driver.full_name,
      phone: driver.phone ?? "",
      vehicle: vehicle.plate_number,
      vehicleType: [vehicle.brand, vehicle.model].filter(Boolean).join(" "),
    }] : [],
    tripsCompleted: 0,
    tripsTotal: 1,
    status: row.status,
    note: row.notes ?? undefined,
  };
}

function mapTripRow(row: any): AppTrip {
  const tripDate = new Date(row.trip_date);
  const order = firstRelation(row.orders);
  const customer = firstRelation(order?.customers);
  const driver = firstRelation(row.driver);
  const vehicle = firstRelation(row.vehicle);

  return {
    id: String(row.id).slice(0, 8),
    driverId: row.driver_id ? String(row.driver_id) : undefined,
    vehicleId: row.vehicle_id ? String(row.vehicle_id) : undefined,
    shiftId: row.shift_id ? String(row.shift_id) : undefined,
    orderNumber: order?.order_number ?? "Заявка",
    orderCustomer: customer?.name ?? "Заказчик",
    driver: driver?.full_name ?? "Водитель",
    vehicle: vehicle?.plate_number ?? "ТС",
    date: tripDate.toISOString().slice(0, 10),
    time: tripDate.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    consignmentNoteDriver: row.ttn_number_manual,
    consignmentNoteOCR: row.ocr_ttn_number,
    volumeDriver: Number(row.loaded_volume ?? 0),
    volumeOCR: row.ocr_volume === null ? null : Number(row.ocr_volume),
    status: row.status,
    ocrStatus: row.ocr_status,
    hasPhoto: true,
  };
}

function mapDocumentRow(row: any, trip: any, fileUrl?: string): AppDocument {
  const tripDate = new Date(trip?.trip_date ?? row.uploaded_at);
  const order = firstRelation(trip?.orders);
  const customer = firstRelation(order?.customers);
  const driver = firstRelation(trip?.driver);
  const vehicle = firstRelation(trip?.vehicle);

  return {
    id: String(row.id),
    type: row.document_type === "ttn" ? "consignment_note" : row.document_type,
    tripId: trip?.id ? String(trip.id).slice(0, 8) : "—",
    orderId: order?.order_number ?? row.metadata_json?.order_number ?? "—",
    driver: driver?.full_name ?? "Водитель",
    vehicle: vehicle?.plate_number ?? "ТС",
    customer: customer?.name ?? "Заказчик",
    consignmentNote: trip?.ttn_number_manual ?? row.metadata_json?.ttn_number ?? "—",
    date: tripDate.toISOString().slice(0, 10),
    uploadedAt: row.uploaded_at,
    ocrStatus: trip?.ocr_status ?? "not_required",
    fileUrl,
  };
}

function mapShiftRow(row: any): AppShift {
  const driver = firstRelation(row.driver);
  const vehicle = firstRelation(row.vehicle);
  const start = row.start_time ? new Date(row.start_time) : null;
  const end = row.end_time ? new Date(row.end_time) : null;
  const currentOdometer = Number(vehicle?.current_odometer ?? 0);
  const closingOdometer = row.closing_odometer === null ? null : Number(row.closing_odometer);

  return {
    id: String(row.id).slice(0, 8),
    driverId: row.driver_id ? String(row.driver_id) : undefined,
    vehicleId: row.vehicle_id ? String(row.vehicle_id) : undefined,
    driver: driver?.full_name ?? "Водитель",
    vehicle: vehicle?.plate_number ?? "ТС",
    startTime: start ? formatTime(start) : "—",
    endTime: end ? formatTime(end) : null,
    date: row.shift_date,
    status: row.status,
    tripsCount: Number(row.total_trips_cached ?? 0),
    mileageStart: closingOdometer ?? currentOdometer,
    mileageEnd: closingOdometer,
    fuelStart: 0,
    fuelEnd: row.fuel_filled_liters === null ? null : Number(row.fuel_filled_liters),
    totalVolume: Number(row.total_volume_cached ?? 0),
    earnings: Number(row.total_earnings_cached ?? 0),
  };
}

function mapDriverRow(row: any): AppDriver {
  const profile = firstRelation(row.driver_profiles);
  return {
    id: String(row.id),
    name: row.full_name ?? "Водитель",
    phone: row.phone ?? "",
    email: row.email ?? "",
    licenseNumber: profile?.license_number ?? "—",
    licenseExpiry: "—",
    licenseCategories: [],
    vehicle: null,
    status: row.status === "active" ? "active" : "inactive",
    tripsThisMonth: 0,
    earningsThisMonth: 0,
    rating: 5,
    joinDate: profile?.employment_date ?? "—",
  };
}

function mapVehicleRow(row: any): AppVehicle {
  return {
    id: String(row.id),
    plate: row.plate_number ?? "—",
    brand: row.brand ?? "",
    model: row.model ?? "",
    type: "самосвал",
    year: 0,
    vin: "",
    capacity: 0,
    bodyVolume: null,
    currentOdometer: Number(row.current_odometer ?? 0),
    assignedDriver: "",
    status: row.status === "active" ? "active" : row.status === "service" ? "service" : "inactive",
  };
}

function mapCustomerDictionaryRow(row: any): AppDictionaryItem {
  return {
    id: String(row.id),
    kind: "customers",
    name: row.name,
    subtitle: [row.inn ? `ИНН ${row.inn}` : null, row.contact_person, row.phone].filter(Boolean).join(" · ") || undefined,
  };
}

function mapOrganizationDictionaryRow(row: any): AppDictionaryItem {
  return {
    id: String(row.id),
    kind: "organizations",
    name: row.name,
    subtitle: [organizationTypeLabel(row.type), row.address].filter(Boolean).join(" · ") || undefined,
  };
}

function mapMaterialDictionaryRow(row: any): AppDictionaryItem {
  return {
    id: String(row.id),
    kind: "materials",
    name: row.name,
    subtitle: row.unit === "m3" ? "м³" : "тонн",
    isActive: Boolean(row.is_active),
  };
}

function mapLocationDictionaryRow(row: any): AppDictionaryItem {
  return {
    id: String(row.id),
    kind: "locations",
    name: row.name,
    subtitle: row.address,
  };
}

async function getOrCreateCustomer(supabase: any, name: string) {
  const trimmed = name.trim();
  const { data: existing, error: selectError } = await supabase
    .from("customers")
    .select("id")
    .eq("name", trimmed)
    .limit(1)
    .maybeSingle();
  if (selectError) throw new Error(selectError.message);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("customers")
    .insert({ name: trimmed })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function getOrCreateOrganization(supabase: any, name: string, type: "source" | "destination") {
  const trimmed = name.trim();
  const { data: existing, error: selectError } = await supabase
    .from("organizations")
    .select("id")
    .eq("name", trimmed)
    .limit(1)
    .maybeSingle();
  if (selectError) throw new Error(selectError.message);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("organizations")
    .insert({ name: trimmed, type })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function getOrCreateMaterial(supabase: any, name: string, unit: "m3" | "ton") {
  const trimmed = name.trim();
  const { data: existing, error: selectError } = await supabase
    .from("materials")
    .select("id")
    .eq("name", trimmed)
    .limit(1)
    .maybeSingle();
  if (selectError) throw new Error(selectError.message);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("materials")
    .insert({ name: trimmed, unit, is_active: true })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function getOrCreateLocation(supabase: any, address: string) {
  const trimmed = address.trim();
  const { data: existing, error: selectError } = await supabase
    .from("locations")
    .select("id")
    .eq("address", trimmed)
    .limit(1)
    .maybeSingle();
  if (selectError) throw new Error(selectError.message);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("locations")
    .insert({ name: trimmed, address: trimmed })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function ensureDictionaryNameIsUnique(supabase: any, table: string, name: string): Promise<void> {
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("name", name)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (data) throw new Error(`Значение «${name}» уже есть в справочнике`);
}

async function findDriverIdByName(supabase: any, name: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("role", "driver")
    .eq("full_name", name)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.id ?? null;
}

async function findVehicleIdByPlate(supabase: any, plate: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("vehicles")
    .select("id")
    .eq("plate_number", plate)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.id ?? null;
}

async function assertVehicleAssignable(supabase: any, vehicleId: string, plateLabel: string): Promise<void> {
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, plate_number, status")
    .eq("id", vehicleId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error(`ТС ${plateLabel} не найдено в public.vehicles.`);

  if (data.status !== "active") {
    const plate = data.plate_number ?? plateLabel;
    throw new Error(`ТС ${plate} недоступно для назначения: ${vehicleStatusLabel(data.status)}.`);
  }
}

function vehicleStatusLabel(status?: string | null): string {
  switch (status) {
    case "repair":
      return "ремонт";
    case "service":
      return "сервис";
    case "inactive":
      return "неактивно";
    case "active":
      return "активно";
    default:
      return status || "статус не указан";
  }
}

function organizationTypeLabel(type?: string | null): string {
  switch (type) {
    case "source":
      return "Отправитель";
    case "destination":
      return "Получатель";
    case "universal":
      return "Универсальная";
    default:
      return "Организация";
  }
}

function normalizePlate(value: string) {
  return value.toUpperCase().replace(/\s+/g, " ").trim();
}

function buildVehicleNotes(vehicle: CreateVehicleInput) {
  const parts = [
    `Тип: ${vehicle.type}`,
    `Год: ${vehicle.year}`,
    `Грузоподъёмность: ${vehicle.capacity} т`,
  ];

  if (vehicle.bodyVolume !== null) parts.push(`Объём кузова: ${vehicle.bodyVolume} м³`);
  if (vehicle.assignedDriver.trim()) parts.push(`Закреплённый водитель: ${vehicle.assignedDriver.trim()}`);
  if (vehicle.note?.trim()) parts.push(vehicle.note.trim());

  return parts.join("\n");
}

async function getOrCreateOpenShift(supabase: any, userId: string, vehicleId: string): Promise<string> {
  const { data: existing, error: existingError } = await supabase
    .from("shifts")
    .select("id")
    .eq("driver_id", userId)
    .eq("status", "open")
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (existing?.id) return existing.id;

  const { data: created, error: createError } = await supabase
    .from("shifts")
    .insert({
      driver_id: userId,
      vehicle_id: vehicleId,
      status: "open",
      start_time: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (createError) throw new Error(createError.message);
  return created.id;
}

function dataUrlToBlob(dataUrl: string) {
  const [header, base64] = dataUrl.split(",");
  const mimeType = header.match(/data:(.*);base64/)?.[1] ?? "image/jpeg";
  const bytes = atob(base64);
  const buffer = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index += 1) buffer[index] = bytes.charCodeAt(index);
  return { blob: new Blob([buffer], { type: mimeType }), mimeType };
}

function extensionByMime(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

function formatRuDate(value: string) {
  return new Date(value).toLocaleDateString("ru-RU");
}

function parseRuDate(value: string) {
  const [day, month, year] = value.split(".");
  if (!day || !month || !year) return new Date().toISOString().slice(0, 10);
  return `${year}-${month}-${day}`;
}

function formatTime(value: Date) {
  return value.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function firstRelation(value: any) {
  return Array.isArray(value) ? value[0] : value;
}
