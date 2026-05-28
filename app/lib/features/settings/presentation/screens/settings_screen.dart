import 'package:flutter/material.dart';

import '../../../../core/widgets/placeholder_section.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Настройки')),
      body: PlaceholderSection(
        title: 'Настройки и справочники',
        description: 'Заказчики, организации, материалы, локации и системные параметры.',
      ),
    );
  }
}
