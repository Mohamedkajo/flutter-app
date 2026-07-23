import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/app_provider.dart';
import 'router/app_router.dart';
import 'theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));
  runApp(const CargoApp());
}

class CargoApp extends StatelessWidget {
  const CargoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => AppProvider()),
      ],
      child: const _RouterWrapper(),
    );
  }
}

class _RouterWrapper extends StatefulWidget {
  const _RouterWrapper();
  @override
  State<_RouterWrapper> createState() => _RouterWrapperState();
}

class _RouterWrapperState extends State<_RouterWrapper> {
  late final _router = buildRouter(context.read<AuthProvider>());

  @override
  Widget build(BuildContext context) {
    // Trigger app data load once authenticated
    final auth = context.watch<AuthProvider>();
    if (auth.isAuthenticated) {
      context.read<AppProvider>().init();
      context.read<CartProvider>().load();
    }

    return MaterialApp.router(
      title: 'Cargo',
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      routerConfig: _router,
    );
  }
}
