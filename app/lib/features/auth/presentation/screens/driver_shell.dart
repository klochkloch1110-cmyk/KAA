import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_routes.dart';
import '../controllers/auth_controller.dart';

class DriverShell extends ConsumerWidget {
  const DriverShell({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final path = GoRouterState.of(context).uri.path;
    final index = switch (path) {
      AppRoutes.driverOrders => 1,
      AppRoutes.driverShift => 2,
      AppRoutes.driverProfile => 3,
      _ => 0,
    };

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (value) {
          if (value == 4) {
            ref.read(authControllerProvider.notifier).signOut();
            return;
          }

          final route = switch (value) {
            1 => AppRoutes.driverOrders,
            2 => AppRoutes.driverShift,
            3 => AppRoutes.driverProfile,
            _ => AppRoutes.driverHome,
          };
          context.go(route);
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_rounded), label: 'Главная'),
          NavigationDestination(icon: Icon(Icons.assignment_rounded), label: 'Заявки'),
          NavigationDestination(icon: Icon(Icons.access_time_rounded), label: 'Смена'),
          NavigationDestination(icon: Icon(Icons.person_rounded), label: 'Профиль'),
          NavigationDestination(icon: Icon(Icons.logout_rounded), label: 'Выход'),
        ],
      ),
    );
  }
}
