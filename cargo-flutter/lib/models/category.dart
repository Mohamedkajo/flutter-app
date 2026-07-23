class Category {
  final int id;
  final String name;
  final String slug;
  final String icon;
  final int storeCount;

  const Category({
    required this.id,
    required this.name,
    required this.slug,
    required this.icon,
    this.storeCount = 0,
  });

  factory Category.fromJson(Map<String, dynamic> json) => Category(
        id: json['id'] as int,
        name: json['name'] as String,
        slug: json['slug'] as String,
        icon: json['icon'] as String,
        storeCount: (json['storeCount'] as num?)?.toInt() ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'slug': slug,
        'icon': icon,
        'storeCount': storeCount,
      };
}
