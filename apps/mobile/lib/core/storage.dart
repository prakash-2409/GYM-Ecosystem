import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../app/constants.dart';

class SecureStorage {
  static const _storage = FlutterSecureStorage();

  static Future<void> saveToken(String token) async {
    await _storage.write(key: AppConstants.tokenKey, value: token);
  }

  static Future<String?> getToken() async {
    return _storage.read(key: AppConstants.tokenKey);
  }

  static Future<void> saveGymId(String gymId) async {
    await _storage.write(key: AppConstants.gymIdKey, value: gymId);
  }

  static Future<String?> getGymId() async {
    return _storage.read(key: AppConstants.gymIdKey);
  }

  static Future<void> saveGymSlug(String slug) async {
    await _storage.write(key: AppConstants.gymSlugKey, value: slug);
  }

  static Future<String?> getGymSlug() async {
    return _storage.read(key: AppConstants.gymSlugKey);
  }

  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
