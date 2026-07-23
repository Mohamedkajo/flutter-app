class AppNotification {
  final int id;
  final String title;
  final String body;
  final String type; // order | promo | system | driver | chat
  final bool isRead;
  final DateTime createdAt;
  final Map<String, dynamic>? data;

  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.isRead,
    required this.createdAt,
    this.data,
  });

  factory AppNotification.fromJson(Map<String, dynamic> j) => AppNotification(
        id: j['id'] as int,
        title: j['title'] as String? ?? '',
        body: j['body'] as String? ?? '',
        type: j['type'] as String? ?? 'system',
        isRead: j['isRead'] as bool? ?? false,
        createdAt: j['createdAt'] != null
            ? DateTime.tryParse(j['createdAt'].toString()) ?? DateTime.now()
            : DateTime.now(),
        data: j['data'] as Map<String, dynamic>?,
      );
}
