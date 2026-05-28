enum UserRole {
  admin,
  driver,
  operator;

  static UserRole fromJson(String value) {
    return UserRole.values.firstWhere(
      (role) => role.name == value,
      orElse: () => UserRole.driver,
    );
  }
}

