import 'package:flutter/material.dart';

import '../../../../core/widgets/placeholder_section.dart';

class DocumentsScreen extends StatelessWidget {
  const DocumentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Документы')),
      body: PlaceholderSection(
        title: 'Документы',
        description: 'Архив фото ТТН, сопроводительных документов и чеков.',
      ),
    );
  }
}
