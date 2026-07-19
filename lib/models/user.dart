class User {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String? avatar;
  final String role;
  final int loyaltyPoints;
  final double walletBalance;

  const User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.avatar,
    this.role = 'customer',
    this.loyaltyPoints = 0,
    this.walletBalance = 0,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] as int,
        name: json['name'] as String,
        email: json['email'] as String,
        phone: json['phone'] as String?,
        avatar: json['avatar'] as String?,
        role: json['role'] as String? ?? 'customer',
        loyaltyPoints: (json['loyaltyPoints'] as num?)?.toInt() ?? 0,
        walletBalance: (json['walletBalance'] as num?)?.toDouble() ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'phone': phone,
        'avatar': avatar,
        'role': role,
        'loyaltyPoints': loyaltyPoints,
        'walletBalance': walletBalance,
      };
}
