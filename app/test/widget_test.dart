import 'package:avl84_app/app/app.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('shows login screen in dev mode', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: Avl84App()));
    await tester.pumpAndSettle();

    expect(find.text('АВЛ 84'), findsOneWidget);
    expect(find.text('Dev: войти как руководитель'), findsOneWidget);
  });
}
