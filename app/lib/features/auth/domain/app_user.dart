import '../../../core/enums/user_role.dart';

class AppUser {
  const AppUser({
    required this.id,
    required this.role,
    required this.fullName,
    required this.phone,
    required this.isDev,
  });

  final String id;
  final UserRole role;
  final String fullName;
  final String phone;
  final bool isDev;

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] as String,
      role: UserRole.fromJson(json['role'] as String? ?? 'driver'),
      fullName: json['full_name'] as String? ?? 'Пользователь',
      phone: json['phone'] as String? ?? '',
      isDev: false,
    );
  }

  factory AppUser.dev(UserRole role) {
    return AppUser(
      id: 'dev-${role.name}',
      role: role,
      fullName: switch (role) {
        UserRole.admin => 'Администратор AVL 84',
        UserRole.operator => 'Оператор AVL 84',
        UserRole.driver => 'Иванов Иван Петрович',
      },
      phone: '+7 000 000-00-00',
      isDev: true,
    );
  }
}

