import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
declare var BarcodeDetector: any;

@Component({
  selector: 'ps-barcode-scan',
  templateUrl: './ps-barcode-scan.component.html',
  styleUrls: ['./ps-barcode-scan.component.scss']
})

export class PsBarcodeScanComponent {
  @ViewChild('videoEl', { static: true }) videoEl!: ElementRef<HTMLVideoElement>;

  @Input() Type: "QR" | "Barcode" = "Barcode";
  @Output() onScan = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<boolean>();

  private facingModes: ('environment' | 'user')[] = ['environment', 'user'];
  private currentFacingIndex = 0;
  private stream: MediaStream | null = null;

  constructor(
    private notification: PsKendoNotificationService,
  ) { }

  async ngOnInit() {
    await this.startCamera();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  //#region  scan
  private scanning = false;
  public isshowvideo = false;

  private async startCamera() {
    this.stopCamera();
    this.scanning = true;

    const facingMode = this.facingModes[this.currentFacingIndex];
    const constraints: MediaStreamConstraints = { video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      const video = this.videoEl.nativeElement;
      video.srcObject = this.stream;
      await video.play();
      this.isshowvideo = true;

      const detector = new BarcodeDetector({ formats: ["qr_code", "ean_13", "code_128"] });
      const scanLoop = () => {
        //dừng loop nếu đã tắt
        if (!this.scanning)
          return;

        detector.detect(video).then(codes => {
          if (codes.length > 0) {
            this.onScan.emit(codes[0].rawValue);
            this.stopCamera();
          } else {
            requestAnimationFrame(scanLoop);
          }
        }).catch(err => {
          this.notification.onError("Lỗi: " + err.message);
        });
      }

      scanLoop();
    } catch (err) {
      this.notification.onError("Lỗi khi mở camera: " + err.message);
    }
  }

  private stopCamera() {
    this.scanning = false;

    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    const video = this.videoEl?.nativeElement;
    if (video) {
      try { video.pause(); video.srcObject = null; } catch { }
    }
  }
  //#endregion

  //#region  flash
  public isFlashOn = false;

  toggleFlash() {
    if (!this.stream) return;

    const track = this.stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities() as any;
    if (!capabilities.torch) {
      this.notification.onError("Thiết bị không hỗ trợ bật flash.");
      return;
    }

    this.isFlashOn = !this.isFlashOn;

    track.applyConstraints({
      advanced: [{ torch: this.isFlashOn }]
    } as any);
  }
  //#endregion

  //#region  select image
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  public selectImage() {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const img = new Image();
    const reader = new FileReader();

    reader.onload = async (e: any) => {
      img.src = e.target.result;

      img.onload = async () => {
        try {
          const detector = new BarcodeDetector({ formats: ["qr_code", "ean_13", "code_128"] });
          const codes = await detector.detect(img);
          if (codes.length > 0) {
            this.onScan.emit(codes[0].rawValue);
          } else {
            this.notification.onError("Không tìm thấy barcode trong hình ảnh");
          }
        } catch (err: any) {
          this.notification.onError("Lỗi khi đọc barcode: " + err.message);
        }
      };
    };

    reader.readAsDataURL(file);
  }
  //#endregion

  //#region  close
  async onCloseScan() {
    await this.stopCamera();
    this.onClose.emit();
  }
  //#endregion
}
