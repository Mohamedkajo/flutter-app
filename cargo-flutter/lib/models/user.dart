class User {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String? avatar;
  final String role;
  final int loyaltyPoints;
  final double walletBalance;
  final String? address;

  const User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.avatar,
    this.role = 'customer',
    this.loyaltyPoints = 0,
    this.walletBalance = 0,
    this.address,
  });

  factory User.fromJson(Map<String, dynamic> j) => User(
        id: j['id'] as int,
        name: j['name'] as String? ?? '',
        email: j['email'] as String? ?? '',
        phone: j['phone'] as String?,
        avatar: j['avatar'] as String?,
        role: j['role'] as String? ?? 'customer',
        loyaltyPoints: (j['loyaltyPoints'] as num?)?.toInt() ?? 0,
        walletBalance: (j['walletBalance'] as num?)?.toDouble() ?? 0,
        address: j['address'] as String?,
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
        'address': address,
      };

  User copyWith({
    String? name,
    String? phone,
    String? avatar,
    String? address,
    double? walletBalance,
    int? loyaltyPoints,
  }) =>
      User(
        id: id,
        name: name ?? this.name,
        email: email,
        phone: phone ?? this.phone,
        avatar: avatar ?? this.avatar,
        role: role,
        loyaltyPoints: loyaltyPoints ?? this.loyaltyPoints,
        walletBalance: walletBalance ?? this.walletBalance,
        address: address ?? this.address,
      );

  String get initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return name.isNotEmpty ? name[0].toUpperCase() : 'U';
  }
}
