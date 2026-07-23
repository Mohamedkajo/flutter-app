class OrderItem {
  final int productId;
  final String productName;
  final double price;
  final int quantity;
  final String? image;

  const OrderItem({
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
    this.image,
  });

  factory OrderItem.fromJson(Map<String, dynamic> j) => OrderItem(
        productId: j['productId'] as int,
        productName: j['productName'] as String? ?? '',
        price: (j['price'] as num?)?.toDouble() ?? 0,
        quantity: j['quantity'] as int? ?? 1,
        image: j['image'] as String?,
      );

  double get subtotal => price * quantity;
}

class Order {
  final int id;
  final String status;
  final double total;
  final double deliveryFee;
  final List<OrderItem> items;
  final DateTime createdAt;
  final String? storeName;
  final String? storeImage;
  final String? deliveryAddress;
  final String? driverName;
  final String? driverPhone;
  final double? driverLat;
  final double? driverLng;
  final String? estimatedDelivery;

  const Order({
    required this.id,
    required this.status,
    required this.total,
    this.deliveryFee = 0,
    required this.items,
    required this.createdAt,
    this.storeName,
    this.storeImage,
    this.deliveryAddress,
    this.driverName,
    this.driverPhone,
    this.driverLat,
    this.driverLng,
    this.estimatedDelivery,
  });

  factory Order.fromJson(Map<String, dynamic> j) => Order(
        id: j['id'] as int,
        status: j['status'] as String? ?? 'pending',
        total: (j['total'] as num?)?.toDouble() ?? 0,
        deliveryFee: (j['deliveryFee'] as num?)?.toDouble() ?? 0,
        items: (j['items'] as List<dynamic>? ?? [])
            .map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        createdAt: j['createdAt'] != null
            ? DateTime.tryParse(j['createdAt'].toString()) ?? DateTime.now()
            : DateTime.now(),
        storeName: j['storeName'] as String?,
        storeImage: j['storeImage'] as String?,
        deliveryAddress: j['deliveryAddress'] as String?,
        driverName: j['driverName'] as String?,
        driverPhone: j['driverPhone'] as String?,
        driverLat: (j['driverLat'] as num?)?.toDouble(),
        driverLng: (j['driverLng'] as num?)?.toDouble(),
        estimatedDelivery: j['estimatedDelivery'] as String?,
      );

  bool get isActive => ['pending', 'confirmed', 'preparing', 'ready', 'picked_up'].contains(status);
  bool get isDelivered => status == 'delivered';
  bool get isCancelled => status == 'cancelled';

  String get statusLabel {
    switch (status) {
      case 'pending': return 'Order Placed';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready for Pickup';
      case 'picked_up': return 'On the Way';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  }

  int get statusStep {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'preparing': return 2;
      case 'ready': return 3;
      case 'picked_up': return 4;
      case 'delivered': return 5;
      default: return 0;
    }
  }
}
