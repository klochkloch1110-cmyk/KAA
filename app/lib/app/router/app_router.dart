import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/enums/user_role.dart';
import '../../features/auth/presentation/controllers/auth_controller.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/dashboard/presentation/screens/admin_dashboard_screen.dart';
import '../../features/documents/presentation/screens/documents_screen.dart';
import '../../features/driver_home/presentation/screens/driver_home_screen.dart';
import '../../features/driver_orders/presentation/screens/driver_orders_screen.dart';
import '../../features/driver_profile/presentation/screens/driver_profile_screen.dart';
import '../../features/drivers/presentation/screens/drivers_screen.dart';
import '../../features/orders/presentation/screens/orders_screen.dart';
import '../../features/reports/presentation/screens/reports_screen.dart';
import '../../features/settings/presentation/screens/settings_screen.dart';
import '../../features/shifts/presentation/screens/shifts_screen.dart';
import '../../features/trips/presentation/screens/trips_screen.dart';
import '../../features/vehicles/presentation/screens/vehicles_screen.dart';
import '../../features/auth/presentation/screens/admin_shell.dart';
import '../../features/auth/presentation/screens/driver_shell.dart';
import 'app_routes.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authControllerProvider);

  return GoRouter(
    initialLocation: AppRoutes.login,
    redirect: (context, state) {
      final location = state.uri.path;
      final isLogin = location == AppRoutes.login;

      if (authState.isLoading) {
        return isLogin || location == '/splash' ? null : '/splash';
      }

      final user = authState.valueOrNull;
      if (user == null) {
        return isLogin ? null : AppRoutes.login;
      }

      final defaultRoute = switch (user.role) {
        UserRole.driver => AppRoutes.driverHome,
        UserRole.admin || UserRole.operator => AppRoutes.adminDashboard,
      };

      if (isLogin) {
        return defaultRoute;
      }

      final isAdminArea = location.startsWith('/admin');
      final isDriverArea = location.startsWith('/driver');

      if (user.role == UserRole.driver && isAdminArea) {
        return AppRoutes.driverHome;
      }

      if (user.role != UserRole.driver && isDriverArea) {
        return AppRoutes.adminDashboard;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => AdminShell(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.adminDashboard,
            builder: (context, state) => const AdminDashboardScreen(),
          ),
          GoRoute(
            path: AppRoutes.adminOrders,
            builder: (context, state) => const OrdersScreen(),
          ),
          GoRoute(
            path: AppRoutes.adminTrips,
            builder: (context, state) => const TripsScreen(),
          ),
          GoRoute(
            path: AppRoutes.adminShifts,
            builder: (context, state) => const ShiftsScreen(),
          ),
          GoRoute(
            path: AppRoutes.adminVehicles,
            builder: (context, state) => const VehiclesScreen(),
          ),
          GoRoute(
            path: AppRoutes.adminDrivers,
            builder: (context, state) => const DriversScreen(),
          ),
          GoRoute(
            path: AppRoutes.adminDocuments,
            builder: (context, state) => const DocumentsScreen(),
          ),
          GoRoute(
            path: AppRoutes.adminReports,
            builder: (context, state) => const ReportsScreen(),
          ),
          GoRoute(
            path: AppRoutes.adminSettings,
            builder: (context, state) => const SettingsScreen(),
          ),
        ],
      ),
      ShellRoute(
        builder: (context, state, child) => DriverShell(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.driverHome,
            builder: (context, state) => const DriverHomeScreen(),
          ),
          GoRoute(
            path: AppRoutes.driverOrders,
            builder: (context, state) => const DriverOrdersScreen(),
          ),
          GoRoute(
            path: AppRoutes.driverShift,
            builder: (context, state) => const ShiftsScreen(),
          ),
          GoRoute(
            path: AppRoutes.driverProfile,
            builder: (context, state) => const DriverProfileScreen(),
          ),
        ],
      ),
    ],
  );
});
