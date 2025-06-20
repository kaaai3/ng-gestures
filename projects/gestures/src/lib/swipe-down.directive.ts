import { Directive, ElementRef, EventEmitter, Output, Renderer2, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[ngSwipeDown]',
  standalone: true,
})
export class SwipeDownDirective implements OnInit {
  @Output() swipeYClose = new EventEmitter<void>();

  /** Minimum pixels to swipe down before closing (default: 100) */
  @Input() threshold = 100;

  /** Maximum pixels the element can be swiped down (default: 400) */
  @Input() maxSwipe = 400;

  /** Whether to set `will-change: transform` for smooth GPU animation (default: true) */
  @Input() willChange = true;

  /** If set, only allow swipe when gesture starts on/inside this element */
  @Input() swipeStartTarget?: ElementRef | HTMLElement;

  /**
   * Optional: Maximum viewport width (px) where swipe is enabled.
   * If set, swipe is disabled when viewport >= this value.
   * If not set, swipe is always enabled.
   */
  @Input() desktopBreakpoint?: number;

  private startY = 0;
  private currentY = 0;
  private dragging = false;
  private animating = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    if (this.willChange) {
      this.renderer.setStyle(this.el.nativeElement, 'will-change', 'transform');
    }
    // Prevent pull-to-refresh inside swipe directive
    this.renderer.setStyle(this.el.nativeElement, 'touch-action', 'none');
    this.renderer.setStyle(this.el.nativeElement, '-webkit-user-select', 'none');
    this.renderer.setStyle(this.el.nativeElement, 'user-select', 'none');
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (this.swipeStartTarget) {
      const swipeElem = this.swipeStartTarget instanceof ElementRef
        ? this.swipeStartTarget.nativeElement
        : this.swipeStartTarget;
      // Only start swipe if the event target is inside the target element
      const eventTarget = event.target as Node;
      if (eventTarget && !swipeElem.contains(eventTarget)) {
        return; // Ignore swipe from outside the header
      }
    }

    // ...rest of your existing swipe start logic...
    if (!this.isSwipeEnabled()) return;
    if (event.touches.length !== 1) return;
    this.dragging = true;
    this.animating = false;
    this.startY = event.touches[0].clientY;
    this.currentY = 0;
    this.setTransition('none');
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this.dragging || event.touches.length !== 1) return;
    const touchY = event.touches[0].clientY;
    this.currentY = touchY - this.startY;
    // Only allow downward drag, clamp to maxSwipe
    if (this.currentY > 0) {
      const translateY = Math.min(this.currentY, this.maxSwipe);
      this.setTranslateY(translateY);
    }
  }

  @HostListener('touchend')
  onTouchEnd() {
    if (!this.dragging) return;
    this.dragging = false;
    if (this.currentY > this.threshold) {
      this.animateOut();
      this.swipeYClose.emit();
    } else {
      this.animateBack();
    }
  }

  private setTranslateY(y: number) {
    this.renderer.setStyle(this.el.nativeElement, 'transform', `translateY(${y}px)`);
  }

  private setTransition(value: string) {
    this.renderer.setStyle(this.el.nativeElement, 'transition', `transform ${value}`);
  }

  private animateBack() {
    this.animating = true;
    // Instantly move to current position (no transition)
    this.setTransition('none');
    this.setTranslateY(this.currentY);
    void (this.el.nativeElement as HTMLElement).offsetHeight; // Force reflow
    // Animate to 0
    this.setTransition('0.35s cubic-bezier(.23,1.01,.32,1)');
    this.setTranslateY(0);
    setTimeout(() => {
      this.setTransition('none');
      this.animating = false;
    }, 350);
  }

  private animateOut() {
    this.animating = true;
    // Instantly move to current position (no transition)
    this.setTransition('none');
    this.setTranslateY(this.currentY);
    void (this.el.nativeElement as HTMLElement).offsetHeight; // Force reflow
    // Animate offscreen
    this.setTransition('0.25s cubic-bezier(.23,1.01,.32,1)');
    this.setTranslateY(window.innerHeight);
    setTimeout(() => {
      this.setTransition('none');
      this.animating = false;
    }, 250);
  }

  /**
   * Returns true if swipe is enabled based on optional desktopBreakpoint.
   * If desktopBreakpoint is undefined, swipe is always enabled.
   */
  private isSwipeEnabled(): boolean {
    return !(this.desktopBreakpoint !== undefined && window.innerWidth >= this.desktopBreakpoint);

  }
}
