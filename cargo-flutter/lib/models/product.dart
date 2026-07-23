class Product {
  final int id;
  final String name;
  final String? description;
  final double price;
  final double? originalPrice;
  final String image;
  final String? storeName;
  final int? storeId;
  final double rating;
  final int reviewCount;
  final int? discountPercent;
  final List<String> tags;
  final bool isAvailable;
  final String? categoryName;

  const Product({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.originalPrice,
    required this.image,
    this.storeName,
    this.storeId,
    this.rating = 4.5,
    this.reviewCount = 0,
    this.discountPercent,
    this.tags = const [],
    this.isAvailable = true,
    this.categoryName,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: json['id'] as int,
        name: json['name'] as String,
        description: json['description'] as String?,
        price: (json['price'] as num).toDouble(),
        originalPrice: (json['originalPrice'] as num?)?.toDouble(),
        image: json['image'] as String,
        storeName: json['storeName'] as String?,
        storeId: json['storeId'] as int?,
        rating: (json['rating'] as num?)?.toDouble() ?? 4.5,
        reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
        discountPercent: json['discountPercent'] as int?,
        tags: (json['tags'] as List<dynamic>?)?.cast<String>() ?? [],
        isAvailable: json['isAvailable'] as bool? ?? true,
        categoryName: json['categoryName'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'price': price,
        'originalPrice': originalPrice,
        'image': image,
        'storeName': storeName,
        'storeId': storeId,
        'rating': rating,
        'reviewCount': reviewCount,
        'discountPercent': discountPercent,
        'tags': tags,
        'isAvailable': isAvailable,
        'categoryName': categoryName,
      };
}
