class OrderItem {
  final int productId;
  final String name;
  final double price;
  final int quantity;
  final String? image;

  const OrderItem({
    required this.productId,
    required this.name,
    required this.price,
    required this.quantity,
    this.image,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) => OrderItem(
        productId: json['productId'] as int,
        name: json['name'] as String,
        price: (json['price'] as num).toDouble(),
        quantity: json['quantity'] as int,
        image: json['image'] as String?,
      );
}

class Order {
  final int id;
  final String status;
  final double total;
  final double subtotal;
  final double deliveryFee;
  final int itemCount;
  final DateTime createdAt;
  final String? storeName;
  final String? storeImage;
  final List<OrderItem> items;
  final String? estimatedTime;
  final String? driverName;
  final String? driverPhone;
  final double? driverRating;

  const Order({
    required this.id,
    required this.status,
    required this.total,
    required this.subtotal,
    required this.deliveryFee,
    required this.itemCount,
    required this.createdAt,
    this.storeName,
    this.storeImage,
    this.items = const [],
    this.estimatedTime,
    this.driverName,
    this.driverPhone,
    this.driverRating,
  });

  factory Order.fromJson(Map<String, dynamic> json) => Order(
        id: json['id'] as int,
        status: json['status'] as String,
        total: (json['total'] as num).toDouble(),
        subtotal: (json['subtotal'] as num?)?.toDouble() ?? (json['total'] as num).toDouble(),
        deliveryFee: (json['deliveryFee'] as num?)?.toDouble() ?? 0,
        itemCount: (json['itemCount'] as num?)?.toInt() ?? 0,
        createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ?? DateTime.now(),
        storeName: json['storeName'] as String?,
        storeImage: json['storeImage'] as String?,
        items: (json['items'] as List<dynamic>?)
                ?.map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
        estimatedTime: json['estimatedTime'] as String?,
        driverName: json['driverName'] as String?,
        driverPhone: json['driverPhone'] as String?,
        driverRating: (json['driverRating'] as num?)?.toDouble(),
      );

  bool get isActive => ['pending', 'confirmed', 'preparing', 'on_the_way'].contains(status);
  bool get isDelivered => status == 'delivered';
  bool get isCancelled => status == 'cancelled';
}
