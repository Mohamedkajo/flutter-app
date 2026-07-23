class Category {
  final int id;
  final String name;
  final String? slug;
  final String? icon;
  final String? image;
  final int? storeCount;
  final int? productCount;

  const Category({
    required this.id,
    required this.name,
    this.slug,
    this.icon,
    this.image,
    this.storeCount,
    this.productCount,
  });

  factory Category.fromJson(Map<String, dynamic> j) => Category(
        id: j['id'] as int,
        name: j['name'] as String? ?? '',
        slug: j['slug'] as String?,
        icon: j['icon'] as String?,
        image: j['image'] as String?,
        storeCount: (j['storeCount'] as num?)?.toInt(),
        productCount: (j['productCount'] as num?)?.toInt(),
      );
}
