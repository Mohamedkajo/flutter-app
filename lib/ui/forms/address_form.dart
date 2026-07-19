import 'package:flutter/material.dart';
import '../../theme/cargo_colors.dart';
import '../../theme/cargo_typography.dart';
import '../buttons/cargo_button.dart';
import '../inputs/cargo_text_field.dart';

/// Address capture form (used in checkout + profile address management).
class AddressForm extends StatefulWidget {
  const AddressForm({
    super.key,
    this.onSubmit,
    this.submitLabel = 'Save Address',
  });

  final void Function(Map<String, String> data)? onSubmit;
  final String submitLabel;

  @override
  State<AddressForm> createState() => _AddressFormState();
}

class _AddressFormState extends State<AddressForm> {
  final _formKey = GlobalKey<FormState>();
  final _label = TextEditingController();
  final _street = TextEditingController();
  final _area = TextEditingController();
  final _city = TextEditingController();
  final _building = TextEditingController();
  final _notes = TextEditingController();
  String _type = 'Home';

  static const _types = ['Home', 'Work', 'Other'];

  @override
  void dispose() {
    _label.dispose();
    _street.dispose();
    _area.dispose();
    _city.dispose();
    _building.dispose();
    _notes.dispose();
    super.dispose();
  }

  void _submit() {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    widget.onSubmit?.call({
      'label': _label.text.trim().isEmpty ? _type : _label.text.trim(),
      'type': _type,
      'street': _street.text.trim(),
      'area': _area.text.trim(),
      'city': _city.text.trim(),
      'building': _building.text.trim(),
      'notes': _notes.text.trim(),
    });
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Address type ──────────────────────────────────────────────
          Text('Address Type', style: CargoTypography.labelLarge),
          const SizedBox(height: 8),
          Row(
            children: _types
                .map((t) => Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(t),
                        selected: _type == t,
                        selectedColor: CargoColors.primary,
                        labelStyle: TextStyle(
                          color: _type == t
                              ? Colors.white
                              : CargoColors.textPrimary,
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                        ),
                        backgroundColor: CargoColors.surface,
                        side: const BorderSide(color: CargoColors.border),
                        onSelected: (_) => setState(() => _type = t),
                      ),
                    ))
                .toList(),
          ),
          const SizedBox(height: 16),

          // ── Fields ────────────────────────────────────────────────────
          CargoTextField(
            controller: _label,
            label: 'Address Label (optional)',
            hint: 'e.g. My Office',
            prefixIcon: Icons.label_outline_rounded,
          ),
          const SizedBox(height: 12),
          CargoTextField(
            controller: _street,
            label: 'Street Address *',
            hint: 'Street name and number',
            prefixIcon: Icons.location_on_outlined,
            validator: (v) =>
                (v == null || v.trim().isEmpty) ? 'Required' : null,
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: CargoTextField(
                  controller: _building,
                  label: 'Building / Villa',
                  hint: 'Building No.',
                  prefixIcon: Icons.business_outlined,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: CargoTextField(
                  controller: _area,
                  label: 'Area / District',
                  hint: 'Jumeirah',
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          CargoTextField(
            controller: _city,
            label: 'City *',
            hint: 'Dubai',
            prefixIcon: Icons.location_city_outlined,
            validator: (v) =>
                (v == null || v.trim().isEmpty) ? 'Required' : null,
          ),
          const SizedBox(height: 12),
          CargoTextField(
            controller: _notes,
            label: 'Delivery Notes (optional)',
            hint: 'Gate code, landmark, floor…',
            prefixIcon: Icons.edit_note_rounded,
            maxLines: 3,
          ),
          const SizedBox(height: 24),
          CargoButton(label: widget.submitLabel, onPressed: _submit),
        ],
      ),
    );
  }
}
