class Store {
  final int id;
  final String name;
  final String? slug;
  final String? image;
  final String? logo;
  final String? bannerImage;
  final String? description;
  final String? categoryName;
  final String? address;
  final String? phone;
  final double rating;
  final int reviewCount;
  final String deliveryTime;
  final double deliveryFee;
  final double? minimumOrder;
  final bool isOpen;
  final bool isOnline;
  final bool isFeatured;
  final bool isVerified;
  final double? distance;

  const Store({
    required this.id,
    required this.name,
    this.slug,
    this.image,
    this.logo,
    this.bannerImage,
    this.description,
    this.categoryName,
    this.address,
    this.phone,
    this.rating = 4.5,
    this.reviewCount = 0,
    this.deliveryTime = '20-30 Min',
    this.deliveryFee = 0,
    this.minimumOrder,
    this.isOpen = true,
    this.isOnline = false,
    this.isFeatured = false,
    this.isVerified = false,
    this.distance,
  });

  factory Store.fromJson(Map<String, dynamic> j) => Store(
        id: j['id'] as int,
        name: j['name'] as String? ?? '',
        slug: j['slug'] as String?,
        image: j['image'] as String?,
        logo: j['logo'] as String?,
        bannerImage: j['bannerImage'] as String?,
        description: j['description'] as String?,
        categoryName: j['categoryName'] as String?,
        address: j['address'] as String?,
        phone: j['phone'] as String?,
        rating: (j['rating'] as num?)?.toDouble() ?? 4.5,
        reviewCount: (j['reviewCount'] as num?)?.toInt() ?? 0,
        deliveryTime: j['deliveryTime'] as String? ?? '20-30 Min',
        deliveryFee: (j['deliveryFee'] as num?)?.toDouble() ?? 0,
        minimumOrder: (j['minimumOrder'] as num?)?.toDouble(),
        isOpen: j['isOpen'] as bool? ?? true,
        isOnline: j['isOnline'] as bool? ?? false,
        isFeatured: j['isFeatured'] as bool? ?? false,
        isVerified: j['isVerified'] as bool? ?? false,
        distance: (j['distance'] as num?)?.toDouble(),
      );

  String get coverImage => bannerImage ?? image ?? '';
  String get logoImage => logo ?? image ?? '';
  String get initial => name.isNotEmpty ? name[0].toUpperCase() : 'S';
}
