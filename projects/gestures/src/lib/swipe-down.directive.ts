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

  /**
   * If true, disables swipe on desktop or hybrid devices.
   * Swipe will only work on touch-only/mobile devices.
   * (default: false)
   */
  @Input() disableOnDesktop = false;

  private startY = 0;
  private currentY = 0;
  private dragging = false;
  private animating = false;
  private swipeDisabled = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    if (this.willChange) {
      this.renderer.setStyle(this.el.nativeElement, 'will-change', 'transform');
    }
    this.renderer.setStyle(this.el.nativeElement, 'touch-action', 'none');
    this.renderer.setStyle(this.el.nativeElement, '-webkit-user-select', 'none');
    this.renderer.setStyle(this.el.nativeElement, 'user-select', 'none');
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    // If disabled on desktop, check here
    if (this.disableOnDesktop && this.isDesktopLikeDevice()) {
      this.swipeDisabled = true;
      return;
    } else {
      this.swipeDisabled = false;
    }
    if (event.touches.length !== 1) return;
    this.dragging = true;
    this.animating = false;
    this.startY = event.touches[0].clientY;
    this.currentY = 0;
    this.setTransition('none');
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (this.swipeDisabled) return;
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
    if (this.swipeDisabled) return;
    if (!this.dragging) return;
    this.dragging = false;
    // Decide close or reset
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
    // Set transition to none and commit current state
    this.setTransition('none');
    this.setTranslateY(this.currentY); // <--- set to current position
    // Force a browser reflow
    void (this.el.nativeElement as HTMLElement).offsetHeight;
    // Now set transition and animate to 0
    this.setTransition('0.35s cubic-bezier(.23,1.01,.32,1)');
    this.setTranslateY(0);
    setTimeout(() => {
      this.setTransition('none');
      this.animating = false;
    }, 350);
  }


  private animateOut() {
    this.animating = true;
    this.setTransition('0.25s cubic-bezier(.23,1.01,.32,1)');
    this.setTranslateY(window.innerHeight);
    setTimeout(() => {
      this.setTransition('none');
      this.animating = false;
    }, 250);
  }

  /** Heuristic to detect desktop/hybrid devices */
  private isDesktopLikeDevice(): boolean {
    // Not perfect but effective for most cases:
    const touchPoints = navigator.maxTouchPoints || 0;
    const userAgent = navigator.userAgent || '';
    // Consider "desktop" if no touch, or (large screen and not iPad/tablet)
    const isWide = window.innerWidth > 1024;
    const isWindows = userAgent.includes('Windows');
    const isMac = userAgent.includes('Macintosh');
    return touchPoints === 0 || ((isWindows || isMac) && isWide);
  }
}
