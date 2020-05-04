import {
  Component,
  ChangeDetectionStrategy,
  Input,
  TemplateRef,
  ElementRef,
  Inject,
  AfterViewInit,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { clamp } from '@moviz-core';

@Component({
  selector: 'app-swipeable-content',
  templateUrl: './swipeable-content.component.html',
  styleUrls: ['./swipeable-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwipeableContentComponent implements AfterViewInit {
  @Input()
  public leftContent: TemplateRef<any>;

  @Input()
  public mainContent: TemplateRef<any>;

  @Input()
  public rightContent: TemplateRef<any>;

  @Input()
  public context: any;

  private raiseLeftSwipeAction: boolean;
  @Input()
  private leftSwipeAction: (context?: any) => void;

  private raiseRightSwipeAction: boolean;
  @Input()
  private rightSwipeAction: (context?: any) => void;

  private htmlDocument: HTMLElement;
  private currentElement: HTMLElement;

  private leftElement: HTMLElement;
  private mainElement: HTMLElement;
  private rightElement: HTMLElement;

  constructor(private elementRef: ElementRef, @Inject(DOCUMENT) private document: any) {}

  public ngAfterViewInit(): void {
    this.htmlDocument = this.document.documentElement as HTMLElement;
    this.currentElement = this.elementRef.nativeElement as HTMLElement;
    this.leftElement = this.currentElement.querySelector('.left-content') as HTMLElement;
    this.mainElement = this.currentElement.querySelector('.main-content') as HTMLElement;
    this.rightElement = this.currentElement.querySelector('.right-content') as HTMLElement;

    if (this.mainElement) {
      this.prefixedEvent(this.mainElement, 'animationend', () => this.reset());
    }
  }

  private prefixedEvent(element, type, callback): void {
    const browersPrefixes = ['webkit', 'moz', 'MS', 'o', ''];

    for (const prefix of browersPrefixes) {
      if (!prefix) {
        type = type.toLowerCase();
      }

      element.addEventListener(prefix + type, callback, false);
    }
  }

  public move(delta: number): void {
    if (this.mainElement) {
      const absoluteDelta = Math.abs(delta);

      if (-25 < delta || delta < 25) {
        this.reset(false);
      }

      const scaleValue = absoluteDelta / 100;

      if (delta > 0) {
        if (absoluteDelta <= this.htmlDocument.offsetWidth) {
          this.leftElement.style.opacity = '1';
          this.mainElement.style.transform = `translateX(${absoluteDelta}px)`;

          // Hide icons
          if (absoluteDelta >= this.htmlDocument.offsetWidth / 3) {
            this.rightElement.style.opacity = '0';
          }

          if (absoluteDelta >= this.htmlDocument.offsetWidth / 4) {
            this.leftElement.style.width = (absoluteDelta * 100) / this.htmlDocument.offsetWidth + 20 + '%';
            this.rightElement.style.width = 100 - Math.abs((absoluteDelta * 100) / this.htmlDocument.offsetWidth) + '%';

            this.leftElement.style.transform = 'scale(' + clamp(scaleValue, 1, 1.5) + ')';

            this.raiseLeftSwipeAction = true;
          }
        }
      } else {
        if (absoluteDelta <= this.htmlDocument.offsetWidth) {
          this.mainElement.style.transform = `translateX(${-absoluteDelta}px)`;
          this.rightElement.style.opacity = '1';

          // Hide icons
          if (absoluteDelta >= this.htmlDocument.offsetWidth / 3) {
            this.leftElement.style.opacity = '0';
          }

          if (absoluteDelta >= this.htmlDocument.offsetWidth / 4) {
            this.leftElement.style.width = 100 - Math.abs((absoluteDelta * 100) / this.htmlDocument.offsetWidth) + '%';
            this.rightElement.style.width = (absoluteDelta * 100) / this.htmlDocument.offsetWidth + 20 + '%';

            this.rightElement.style.transform = 'scale(' + clamp(scaleValue, 1, 1.5) + ')';

            this.raiseRightSwipeAction = true;
          }
        }
      }
    }
  }

  public stop(delta: number): void {
    const absoluteDelta = Math.abs(delta);
    const middleOffset = Math.abs(this.htmlDocument.offsetWidth / 2);

    if (absoluteDelta < middleOffset) {
      // Go back directly to the initial position
      this.mainElement.style.animation = 'reset-main-content 250ms ease-in forwards';

      if (delta > 0) {
        this.leftElement.style.animation = 'left-to-right-left-content 500ms ease-in forwards';
        this.rightElement.style.animation = 'left-to-right-right-content 500ms ease-in forwards';
      } else {
        this.leftElement.style.animation = 'right-to-left-left-content 500ms ease-in forwards';
        this.rightElement.style.animation = 'right-to-left-right-content 500ms ease-in forwards';
      }
    } else {
      // Go to the opposite side and go back to the initial position
      if (delta > 0) {
        // Go to full right then go back to left
        this.leftElement.style.animation = 'right-to-left-left-content 500ms ease-in forwards';
        this.mainElement.style.animation = 'right-to-left-main-content 500ms ease-in forwards';
        this.rightElement.style.animation = 'right-to-left-right-content 500ms ease-in forwards';
      } else {
        // Go to full left then go back to right
        this.leftElement.style.animation = 'left-to-right-left-content 500ms ease-in forwards';
        this.mainElement.style.animation = 'left-to-right-main-content 500ms ease-in forwards';
        this.rightElement.style.animation = 'left-to-right-right-content 500ms ease-in forwards';
      }
    }
  }

  private reset(raiseActions: boolean = true) {
    this.leftElement.style.width = `25%`;
    this.leftElement.style.animation = '';
    this.leftElement.style.opacity = '1';
    this.leftElement.style.transform = 'scale(1)';

    this.mainElement.style.transform = `translateX(0px)`;
    this.mainElement.style.animation = '';

    this.rightElement.style.width = `25%`;
    this.rightElement.style.animation = '';
    this.rightElement.style.opacity = '1';
    this.rightElement.style.transform = 'scale(1)';

    if (raiseActions) {
      if (this.raiseLeftSwipeAction && this.leftSwipeAction) {
        this.leftSwipeAction(this.context);
      } else if (this.raiseRightSwipeAction && this.rightSwipeAction) {
        this.rightSwipeAction(this.context);
      }
    }

    this.raiseLeftSwipeAction = false;
    this.raiseRightSwipeAction = false;
  }
}
