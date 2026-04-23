import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'api_client.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  // Background message handling — deep linking is done via notification tap
  print('[FCM] Background message: ${message.messageId}');
}

class FCMHandler {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  static Future<void> init() async {
    try {
      await Firebase.initializeApp();
    } catch (e) {
      print('[FCM] Firebase init skipped (not configured): $e');
      return;
    }

    // Request permission
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('[FCM] Permission granted');

      // Get token and save to server
      final token = await _messaging.getToken();
      if (token != null) {
        await _saveTokenToServer(token);
      }

      // Listen for token refresh
      _messaging.onTokenRefresh.listen(_saveTokenToServer);

      // Background handler
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // Foreground messages — show in-app banner
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        print('[FCM] Foreground message: ${message.notification?.title}');
        // The app should show an in-app banner via a snackbar or overlay
      });

      // Notification tap (app was in background)
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        _handleNotificationTap(message);
      });

      // Check if app was opened from a terminated state by a notification
      final initialMessage = await _messaging.getInitialMessage();
      if (initialMessage != null) {
        _handleNotificationTap(initialMessage);
      }
    }
  }

  static Future<void> _saveTokenToServer(String token) async {
    try {
      await api.post('/members/fcm-token', data: {'token': token});
      print('[FCM] Token saved to server');
    } catch (e) {
      print('[FCM] Failed to save token: $e');
    }
  }

  static void _handleNotificationTap(RemoteMessage message) {
    final type = message.data['type'];
    // Deep linking based on notification type
    // GoRouter handles this — the app should navigate via context.go()
    print('[FCM] Notification tapped, type: $type');
    // Routing will be handled in the router based on deep link
  }
}
