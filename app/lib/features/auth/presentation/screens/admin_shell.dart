import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_routes.dart';
import '../controllers/auth_controller.dart';

class AdminShell extends ConsumerWidget {
  const AdminShell({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = [
      _NavItem('Панель', Icons.dashboard_rounded, AppRoutes.adminDashboard),
      _NavItem('Заявки', Icons.assignment_rounded, AppRoutes.adminOrders),
      _NavItem('Рейсы', Icons.route_rounded, AppRoutes.adminTrips),
      _NavItem('Смены', Icons.access_time_rounded, AppRoutes.adminShifts),
      _NavItem('Машины', Icons.local_shipping_rounded, AppRoutes.adminVehicles),
      _NavItem('Водители', Icons.people_alt_rounded, AppRoutes.adminDrivers),
      _NavItem('Документы', Icons.image_rounded, AppRoutes.adminDocuments),
      _NavItem('Отчеты', Icons.bar_chart_rounded, AppRoutes.adminReports),
      _NavItem('Настройки', Icons.settings_rounded, AppRoutes.adminSettings),
    ];

    final currentPath = GoRouterState.of(context).uri.path;
    final selectedIndex = items.indexWhere((item) => item.path == currentPath);

    return Scaffold(
      body: Row(
        children: [
          NavigationRail(
            extended: MediaQuery.sizeOf(context).width >= 1100,
            selectedIndex: selectedIndex < 0 ? 0 : selectedIndex,
            onDestinationSelected: (index) => context.go(items[index].path),
            leading: Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Text(
                'АВЛ 84',
                style: TextStyle(
                  color: Theme.of(context).colorScheme.primary,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
            destinations: [
              for (final item in items)
                NavigationRailDestination(
                  icon: Icon(item.icon),
                  label: Text(item.label),
                ),
            ],
            trailing: Expanded(
              child: Align(
                alignment: Alignment.bottomCenter,
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: IconButton(
                    tooltip: 'Выйти',
                    onPressed: () => ref.read(authControllerProvider.notifier).signOut(),
                    icon: const Icon(Icons.logout_rounded),
                  ),
                ),
              ),
            ),
          ),
          const VerticalDivider(width: 1),
          Expanded(child: child),
        ],
      ),
    );
  }
}

class _NavItem {
  const _NavItem(this.label, this.icon, this.path);

  final String label;
  final IconData icon;
  final String path;
}
