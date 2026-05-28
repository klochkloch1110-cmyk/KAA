import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/constants/app_config.dart';
import '../domain/app_user.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return SupabaseAuthRepository();
});

abstract class AuthRepository {
  Future<AppUser?> currentUser();

  Future<AppUser> signIn({required String email, required String password});

  Future<void> signOut();
}

class SupabaseAuthRepository implements AuthRepository {
  SupabaseClient get _client => Supabase.instance.client;

  @override
  Future<AppUser?> currentUser() async {
    if (!AppConfig.isSupabaseConfigured) {
      return null;
    }

    final authUser = _client.auth.currentUser;
    if (authUser == null) {
      return null;
    }

    return _loadAppUser(authUser.id);
  }

  @override
  Future<AppUser> signIn({required String email, required String password}) async {
    if (!AppConfig.isSupabaseConfigured) {
      throw Exception('Supabase не настроен. Используйте dev-вход или задайте SUPABASE_URL/SUPABASE_ANON_KEY.');
    }

    final response = await _client.auth.signInWithPassword(
      email: email,
      password: password,
    );

    final authUser = response.user;
    if (authUser == null) {
      throw Exception('Не удалось войти. Проверьте логин и пароль.');
    }

    return _loadAppUser(authUser.id);
  }

  @override
  Future<void> signOut() async {
    if (!AppConfig.isSupabaseConfigured) {
      return;
    }

    await _client.auth.signOut();
  }

  Future<AppUser> _loadAppUser(String id) async {
    final data = await _client.from('users').select().eq('id', id).single();
    return AppUser.fromJson(data);
  }
}

