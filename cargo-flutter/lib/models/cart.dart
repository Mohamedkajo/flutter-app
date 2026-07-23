class CartItem {
  final int id;
  final int productId;
  final String productName;
  final double price;
  final String? image;
  final String? storeName;
  final int storeId;
  int quantity;

  CartItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.price,
    this.image,
    this.storeName,
    required this.storeId,
    required this.quantity,
  });

  factory CartItem.fromJson(Map<String, dynamic> j) => CartItem(
        id: j['id'] as int,
        productId: j['productId'] as int,
        productName: j['productName'] as String? ?? '',
        price: (j['price'] as num?)?.toDouble() ?? 0,
        image: j['image'] as String?,
        storeName: j['storeName'] as String?,
        storeId: j['storeId'] as int? ?? 0,
        quantity: j['quantity'] as int? ?? 1,
      );

  double get subtotal => price * quantity;
}

class Cart {
  final List<CartItem> items;
  final double deliveryFee;
  final double serviceFee;

  const Cart({
    required this.items,
    this.deliveryFee = 0,
    this.serviceFee = 0,
  });

  factory Cart.fromJson(Map<String, dynamic> j) {
    final rawItems = j['items'] as List<dynamic>? ?? [];
    return Cart(
      items: rawItems.map((e) => CartItem.fromJson(e as Map<String, dynamic>)).toList(),
      deliveryFee: (j['deliveryFee'] as num?)?.toDouble() ?? 0,
      serviceFee: (j['serviceFee'] as num?)?.toDouble() ?? 0,
    );
  }

  double get subtotal => items.fold(0, (sum, i) => sum + i.subtotal);
  double get total => subtotal + deliveryFee + serviceFee;
  int get itemCount => items.fold(0, (sum, i) => sum + i.quantity);
  bool get isEmpty => items.isEmpty;
}
