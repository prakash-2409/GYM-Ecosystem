import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app/router.dart';
import 'app/theme.dart';
import 'core/fcm_handler.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await FCMHandler.init();
  runApp(const ProviderScope(child: GymStackApp()));
}

class GymStackApp extends ConsumerWidget {
  const GymStackApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'GymStack',
      debugShowCheckedModeBanner: false,
      theme: gymTheme,
      routerConfig: router,
    );
  }
}
