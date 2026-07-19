import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../theme/cargo_colors.dart';

/// Circular store avatar — shows the logo photo when available,
/// otherwise falls back to an initials gradient circle (matching the web app).
class StoreAvatar extends StatelessWidget {
  const StoreAvatar({
    super.key,
    required this.name,
    this.logoUrl,
    this.size = 44,
    this.borderWidth = 2,
    this.borderColor = CargoColors.white,
  });

  final String name;
  final String? logoUrl;
  final double size;
  final double borderWidth;
  final Color borderColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size + borderWidth * 2,
      height: size + borderWidth * 2,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: borderColor, width: borderWidth),
      ),
      child: ClipOval(
        child: _content,
      ),
    );
  }

  Widget get _content {
    if (logoUrl != null && logoUrl!.isNotEmpty) {
      return CachedNetworkImage(
        imageUrl: logoUrl!,
        width: size,
        height: size,
        fit: BoxFit.cover,
        errorWidget: (_, __, ___) => _initialsWidget,
      );
    }
    return _initialsWidget;
  }

  Widget get _initialsWidget => Container(
        width: size,
        height: size,
        decoration: const BoxDecoration(
          gradient: CargoColors.initialsGradient,
        ),
        child: Center(
          child: Text(
            name.isNotEmpty ? name[0].toUpperCase() : '?',
            style: TextStyle(
              color: Colors.white,
              fontSize: size * 0.38,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      );
}
