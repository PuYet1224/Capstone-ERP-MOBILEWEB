import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'ps-dialog-confirm-signature',
  templateUrl: './ps-dialog-confirm-signature.component.html',
  styleUrls: ['./ps-dialog-confirm-signature.component.scss'],
})
export class PsDialogConfirmSignatureComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() open: boolean = false;
  @Input() title = 'KÝ TÊN XÁC NHẬN YÊU CẦU';
  @Input() closeOnBackdropClick: boolean = true;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<string>();

  @ViewChild('sigCanvas', { static: false }) sigCanvas!: ElementRef<HTMLCanvasElement>;

  private signaturePad!: SignaturePad;
  private initTimeout: any;

  ngAfterViewInit(): void {
    if (this.open) {
      this.initializeSignaturePad();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      if (this.initTimeout) {
        clearTimeout(this.initTimeout);
      }
      this.initTimeout = setTimeout(() => this.initializeSignaturePad(), 100);
    }
  }

  ngOnDestroy(): void {
    if (this.initTimeout) {
      clearTimeout(this.initTimeout);
    }
    if (this.signaturePad) {
      this.signaturePad.off();
    }
  }

  private initializeSignaturePad(): void {
    const canvas = this.sigCanvas.nativeElement;
    if (!canvas) {
      return;
    }

    if (this.signaturePad) {
      this.signaturePad.clear();
      this.signaturePad.off();
    }

    this.resizeCanvas(canvas);

    this.signaturePad = new SignaturePad(canvas, {
      penColor: 'black',
      backgroundColor: 'rgb(0, 0, 0, 0)',
      throttle: 10,
      minDistance: 5
    });

    const preventDefault = (e: Event) => e.preventDefault();
    canvas.addEventListener('touchstart', preventDefault, { passive: false });
    canvas.addEventListener('touchmove', preventDefault, { passive: false });
    canvas.addEventListener('touchend', preventDefault, { passive: false });
  }

  private resizeCanvas(canvas: HTMLCanvasElement): void {
    const container = canvas.parentElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    }
  }

  public onBackdropClick(): void {
    if (this.closeOnBackdropClick) {
      this.close.emit();
    }
  }

  public onCloseClick(): void {
    this.close.emit();
  }

  public onSaveClick(): void {
    if (!this.signaturePad) {
      return;
    }

    if (this.signaturePad.isEmpty()) {
      return;
    }

    this.save.emit(this.signaturePad.toDataURL('image/png'));
  }

  public clearSignature(): void {
    if (this.signaturePad) {
      this.signaturePad.clear();
    }
  }

  public getSignatureData(): string | null {
    return this.signaturePad && !this.signaturePad.isEmpty() ? this.signaturePad.toDataURL('image/png') : null;
  }
}
