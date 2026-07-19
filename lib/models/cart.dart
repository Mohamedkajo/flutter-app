class CartItem {
  final int id;
  final int productId;
  final String name;
  final double price;
  final int quantity;
  final String? image;
  final int? storeId;
  final String? storeName;

  const CartItem({
    required this.id,
    required this.productId,
    required this.name,
    required this.price,
    required this.quantity,
    this.image,
    this.storeId,
    this.storeName,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) => CartItem(
        id: json['id'] as int,
        productId: json['productId'] as int,
        name: json['name'] as String,
        price: (json['price'] as num).toDouble(),
        quantity: json['quantity'] as int,
        image: json['image'] as String?,
        storeId: json['storeId'] as int?,
        storeName: json['storeName'] as String?,
      );

  double get subtotal => price * quantity;

  CartItem copyWith({int? quantity}) => CartItem(
        id: id,
        productId: productId,
        name: name,
        price: price,
        quantity: quantity ?? this.quantity,
        image: image,
        storeId: storeId,
        storeName: storeName,
      );
}
