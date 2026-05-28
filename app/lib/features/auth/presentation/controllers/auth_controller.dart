import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/enums/user_role.dart';
import '../../data/auth_repository.dart';
import '../../domain/app_user.dart';

final authControllerProvider = StateNotifierProvider<AuthController, AsyncValue<AppUser?>>((ref) {
  return AuthController(ref.watch(authRepositoryProvider));
});

class AuthController extends StateNotifier<AsyncValue<AppUser?>> {
  AuthController(this._repository) : super(const AsyncValue.loading()) {
    restoreSession();
  }

  final AuthRepository _repository;

  Future<void> restoreSession() async {
    try {
      state = AsyncValue.data(await _repository.currentUser());
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> signIn({required String email, required String password}) async {
    state = const AsyncValue.loading();

    try {
      state = AsyncValue.data(await _repository.signIn(email: email, password: password));
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> signOut() async {
    await _repository.signOut();
    state = const AsyncValue.data(null);
  }

  void devSignInAs(UserRole role) {
    state = AsyncValue.data(AppUser.dev(role));
  }

  void clearError() {
    if (state.hasError) {
      state = const AsyncValue.data(null);
    }
  }
}
