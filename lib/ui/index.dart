/// Cargo UI Library — single import barrel.
///
/// ```dart
/// import 'package:cargo/ui/index.dart';
/// ```
library cargo_ui;

// ── Theme ────────────────────────────────────────────────────────────────────
export 'theme/cargo_colors.dart';
export 'theme/cargo_typography.dart';
export 'theme/cargo_spacing.dart';

// ── Buttons ──────────────────────────────────────────────────────────────────
export 'components/buttons/cargo_button.dart';

// ── Inputs ───────────────────────────────────────────────────────────────────
export 'components/inputs/cargo_text_field.dart';
export 'components/inputs/cargo_search_bar.dart';

// ── Feedback ─────────────────────────────────────────────────────────────────
export 'components/feedback/empty_state.dart';
export 'components/feedback/error_state.dart';
export 'components/feedback/success_dialog.dart';

// ── Badges ───────────────────────────────────────────────────────────────────
export 'components/badges/status_badge.dart';

// ── Avatars ──────────────────────────────────────────────────────────────────
export 'components/avatars/store_avatar.dart';

// ── Misc ─────────────────────────────────────────────────────────────────────
export 'components/misc/section_header.dart';
export 'components/misc/cargo_tag.dart';
export 'components/misc/rating_row.dart';

// ── Cards ────────────────────────────────────────────────────────────────────
export 'components/cards/store_card.dart';
export 'components/cards/product_card.dart';
export 'components/cards/order_card.dart';
export 'components/cards/notification_card.dart';

// ── Layouts ──────────────────────────────────────────────────────────────────
export 'layouts/app_scaffold.dart';
export 'layouts/cargo_bottom_sheet.dart';

// ── Animations ───────────────────────────────────────────────────────────────
export 'animations/fade_slide_animation.dart';
export 'animations/shimmer_loader.dart';

// ── Dialogs ──────────────────────────────────────────────────────────────────
export 'dialogs/confirm_dialog.dart';
export 'dialogs/coupon_bottom_sheet.dart';
export 'dialogs/topup_bottom_sheet.dart';

// ── Forms ────────────────────────────────────────────────────────────────────
export 'forms/address_form.dart';
