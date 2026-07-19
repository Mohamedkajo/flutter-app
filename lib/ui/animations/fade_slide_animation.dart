import 'package:flutter/material.dart';

/// Wraps [child] in a fade + vertical slide-in animation.
/// Driven by an [AnimationController] so the parent controls timing.
///
/// ```dart
/// FadeSlideAnimation(
///   controller: _controller,
///   delay: const Duration(milliseconds: 100),
///   child: MyWidget(),
/// )
/// ```
class FadeSlideAnimation extends StatefulWidget {
  const FadeSlideAnimation({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.duration = const Duration(milliseconds: 400),
    this.curve = Curves.easeOutCubic,
    this.offsetY = 24.0,
  });

  final Widget child;
  final Duration delay;
  final Duration duration;
  final Curve curve;
  final double offsetY;

  @override
  State<FadeSlideAnimation> createState() => _FadeSlideAnimationState();
}

class _FadeSlideAnimationState extends State<FadeSlideAnimation>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _opacity;
  late final Animation<Offset> _slide;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: widget.duration);
    _opacity = CurvedAnimation(parent: _ctrl, curve: widget.curve);
    _slide = Tween<Offset>(
      begin: Offset(0, widget.offsetY / 100),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _ctrl, curve: widget.curve));

    Future.delayed(widget.delay, () {
      if (mounted) _ctrl.forward();
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => FadeTransition(
        opacity: _opacity,
        child: SlideTransition(position: _slide, child: widget.child),
      );
}

/// Staggered list — each item fades-in after its predecessor.
class StaggeredList extends StatelessWidget {
  const StaggeredList({
    super.key,
    required this.children,
    this.staggerMs = 60,
    this.initialDelayMs = 0,
  });

  final List<Widget> children;
  final int staggerMs;
  final int initialDelayMs;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (int i = 0; i < children.length; i++)
          FadeSlideAnimation(
            delay: Duration(milliseconds: initialDelayMs + i * staggerMs),
            child: children[i],
          ),
      ],
    );
  }
}
