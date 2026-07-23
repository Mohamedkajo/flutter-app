class Product {
  final int id;
  final String name;
  final String? description;
  final double price;
  final double? originalPrice;
  final String? image;
  final int? storeId;
  final String? storeName;
  final String? categoryName;
  final double rating;
  final int reviewCount;
  final bool isFeatured;
  final bool isAvailable;
  final int? discountPercent;
  final List<String> tags;

  const Product({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.originalPrice,
    this.image,
    this.storeId,
    this.storeName,
    this.categoryName,
    this.rating = 4.5,
    this.reviewCount = 0,
    this.isFeatured = false,
    this.isAvailable = true,
    this.discountPercent,
    this.tags = const [],
  });

  factory Product.fromJson(Map<String, dynamic> j) => Product(
        id: j['id'] as int,
        name: j['name'] as String? ?? '',
        description: j['description'] as String?,
        price: (j['price'] as num?)?.toDouble() ?? 0,
        originalPrice: (j['originalPrice'] as num?)?.toDouble(),
        image: j['image'] as String?,
        storeId: j['storeId'] as int?,
        storeName: j['storeName'] as String?,
        categoryName: j['categoryName'] as String?,
        rating: (j['rating'] as num?)?.toDouble() ?? 4.5,
        reviewCount: (j['reviewCount'] as num?)?.toInt() ?? 0,
        isFeatured: j['isFeatured'] as bool? ?? false,
        isAvailable: j['isAvailable'] as bool? ?? true,
        discountPercent: (j['discountPercent'] as num?)?.toInt(),
        tags: (j['tags'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      );

  bool get hasDiscount =>
      discountPercent != null && discountPercent! > 0 ||
      (originalPrice != null && originalPrice! > price);

  double get effectiveDiscount {
    if (discountPercent != null && discountPercent! > 0) return discountPercent!.toDouble();
    if (originalPrice != null && originalPrice! > price) {
      return ((originalPrice! - price) / originalPrice! * 100).roundToDouble();
    }
    return 0;
  }
}
