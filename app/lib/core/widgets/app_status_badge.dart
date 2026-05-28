import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';

class AppStatusBadge extends StatelessWidget {
  const AppStatusBadge({
    required this.label,
    required this.tone,
    super.key,
  });

  final String label;
  final AppStatusTone tone;

  @override
  Widget build(BuildContext context) {
    final color = switch (tone) {
      AppStatusTone.success => AppColors.success,
      AppStatusTone.warning => AppColors.warning,
      AppStatusTone.danger => AppColors.danger,
      AppStatusTone.info => AppColors.cyan,
      AppStatusTone.muted => Theme.of(context).colorScheme.outline,
    };

    return DecoratedBox(
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        child: Text(
          label,
          style: TextStyle(
            color: color,
            fontSize: 12,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

enum AppStatusTone { success, warning, danger, info, muted }
