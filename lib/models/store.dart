class Store {
  final int id;
  final String name;
  final String slug;
  final String image;
  final String? logo;
  final String categoryName;
  final String? categoryIcon;
  final double rating;
  final int reviewCount;
  final String deliveryTime;
  final double deliveryFee;
  final double minOrder;
  final bool isOpen;
  final bool isFeatured;
  final bool isVerified;
  final bool isTrending;
  final bool isOnline;
  final String? description;
  final String? address;
  final String? phone;
  final double? distance;
  final List<String> tags;

  const Store({
    required this.id,
    required this.name,
    required this.slug,
    required this.image,
    this.logo,
    required this.categoryName,
    this.categoryIcon,
    required this.rating,
    required this.reviewCount,
    required this.deliveryTime,
    required this.deliveryFee,
    required this.minOrder,
    required this.isOpen,
    this.isFeatured = false,
    this.isVerified = false,
    this.isTrending = false,
    this.isOnline = false,
    this.description,
    this.address,
    this.phone,
    this.distance,
    this.tags = const [],
  });

  factory Store.fromJson(Map<String, dynamic> json) => Store(
        id: json['id'] as int,
        name: json['name'] as String,
        slug: json['slug'] as String,
        image: json['image'] as String,
        logo: json['logo'] as String?,
        categoryName: json['categoryName'] as String,
        categoryIcon: json['categoryIcon'] as String?,
        rating: (json['rating'] as num).toDouble(),
        reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
        deliveryTime: json['deliveryTime'] as String,
        deliveryFee: (json['deliveryFee'] as num).toDouble(),
        minOrder: (json['minOrder'] as num?)?.toDouble() ?? 0,
        isOpen: json['isOpen'] as bool? ?? true,
        isFeatured: json['isFeatured'] as bool? ?? false,
        isVerified: json['isVerified'] as bool? ?? false,
        isTrending: json['isTrending'] as bool? ?? false,
        isOnline: json['isOnline'] as bool? ?? false,
        description: json['description'] as String?,
        address: json['address'] as String?,
        phone: json['phone'] as String?,
        distance: (json['distance'] as num?)?.toDouble(),
        tags: (json['tags'] as List<dynamic>?)?.cast<String>() ?? [],
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'slug': slug,
        'image': image,
        'logo': logo,
        'categoryName': categoryName,
        'categoryIcon': categoryIcon,
        'rating': rating,
        'reviewCount': reviewCount,
        'deliveryTime': deliveryTime,
        'deliveryFee': deliveryFee,
        'minOrder': minOrder,
        'isOpen': isOpen,
        'isFeatured': isFeatured,
        'isVerified': isVerified,
        'isTrending': isTrending,
        'isOnline': isOnline,
        'description': description,
        'address': address,
        'phone': phone,
        'distance': distance,
        'tags': tags,
      };
}
