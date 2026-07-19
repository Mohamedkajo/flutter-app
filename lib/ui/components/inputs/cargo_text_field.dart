import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/cargo_colors.dart';
import '../../theme/cargo_spacing.dart';

/// Cargo-branded text field. Handles labels, validation, password visibility,
/// and numeric-only inputs out of the box.
class CargoTextField extends StatefulWidget {
  const CargoTextField({
    super.key,
    this.label,
    this.hint,
    this.controller,
    this.onChanged,
    this.onSubmitted,
    this.validator,
    this.obscureText = false,
    this.keyboardType,
    this.textInputAction,
    this.prefixIcon,
    this.suffixIcon,
    this.enabled = true,
    this.autofocus = false,
    this.maxLines = 1,
    this.maxLength,
    this.inputFormatters,
    this.focusNode,
    this.autocorrect = true,
  });

  final String? label;
  final String? hint;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final FormFieldValidator<String>? validator;
  final bool obscureText;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final IconData? prefixIcon;
  final IconData? suffixIcon;
  final bool enabled;
  final bool autofocus;
  final int? maxLines;
  final int? maxLength;
  final List<TextInputFormatter>? inputFormatters;
  final FocusNode? focusNode;
  final bool autocorrect;

  @override
  State<CargoTextField> createState() => _CargoTextFieldState();
}

class _CargoTextFieldState extends State<CargoTextField> {
  bool _obscure = false;

  @override
  void initState() {
    super.initState();
    _obscure = widget.obscureText;
  }

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: widget.controller,
      onChanged: widget.onChanged,
      onFieldSubmitted: widget.onSubmitted,
      validator: widget.validator,
      obscureText: _obscure,
      keyboardType: widget.keyboardType,
      textInputAction: widget.textInputAction,
      enabled: widget.enabled,
      autofocus: widget.autofocus,
      maxLines: widget.maxLines,
      maxLength: widget.maxLength,
      inputFormatters: widget.inputFormatters,
      focusNode: widget.focusNode,
      autocorrect: widget.autocorrect,
      style: GoogleFonts.poppins(fontSize: 14, color: CargoColors.textPrimary),
      decoration: InputDecoration(
        labelText: widget.label,
        hintText: widget.hint,
        hintStyle: GoogleFonts.poppins(fontSize: 14, color: CargoColors.textHint),
        labelStyle: GoogleFonts.poppins(fontSize: 13, color: CargoColors.textSecondary),
        contentPadding: const EdgeInsets.symmetric(
            horizontal: CargoSpacing.md, vertical: 14),
        prefixIcon: widget.prefixIcon != null
            ? Icon(widget.prefixIcon, size: 20, color: CargoColors.textMuted)
            : null,
        suffixIcon: widget.obscureText
            ? IconButton(
                icon: Icon(
                  _obscure ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                  size: 20,
                  color: CargoColors.textMuted,
                ),
                onPressed: () => setState(() => _obscure = !_obscure),
              )
            : widget.suffixIcon != null
                ? Icon(widget.suffixIcon, size: 20, color: CargoColors.textMuted)
                : null,
        filled: true,
        fillColor: CargoColors.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(CargoSpacing.radiusMd),
          borderSide: const BorderSide(color: CargoColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(CargoSpacing.radiusMd),
          borderSide: const BorderSide(color: CargoColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(CargoSpacing.radiusMd),
          borderSide: const BorderSide(color: CargoColors.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(CargoSpacing.radiusMd),
          borderSide: const BorderSide(color: CargoColors.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(CargoSpacing.radiusMd),
          borderSide: const BorderSide(color: CargoColors.error, width: 1.5),
        ),
        counterText: '',
      ),
    );
  }
}
