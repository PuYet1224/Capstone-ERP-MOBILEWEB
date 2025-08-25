import { FileRestrictions, SuccessEvent, UploadComponent as KendoUploadComponent, SelectEvent, FileInfo } from '@progress/kendo-angular-upload';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { FilterDescriptor } from '@progress/kendo-data-query';
import { PSKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { TreeDataInterface } from '../../models/dtos/tree-data.interface';
import { PSCoreApiService } from 'src/app/services/ps-core-api.service';
import { FileDTO } from 'src/app/models/dtos/file.dto';
import { PsLayoutLoaderService } from 'src/app/layouts/main-layout/services/ps-layout-loader.service';
import { FolderPathEnum } from 'src/app/models/enums/folder-path.enum';

@Component({
  selector: 'ps-dialog-upload',
  templateUrl: './ps-dialog-upload.component.html',
  styleUrls: ['./ps-dialog-upload.component.scss'],
})
export class PsDialogUploadComponent {
  constructor(
    private coreapi: PSCoreApiService,
    private notification: PSKendoNotificationService,
    private subLoader: PsLayoutLoaderService,
  ) { }

  // =================== Inputs / Outputs ===================
  @Input() folders: TreeDataInterface[] = [];
  @Input() files: FileDTO[] = [];
  @Input() isOpen = false;
  @Input() open = false;
  @Input() keyPathUpload: FolderPathEnum;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() upload = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  // =================== ViewChilds ===================
  @ViewChild('uploadRef') uploadRef!: KendoUploadComponent;
  @ViewChild('dropZoneRef') dropZoneRef!: ElementRef<HTMLDivElement>;
  @ViewChild('uploadedZone') uploadedZoneRef!: ElementRef<HTMLDivElement>;

  // =================== States ===================
  public isDraggingOverDropzone = false;
  // public isDraggingOverUploaded = false;
  public isDraggingOverTrash = false;
  private draggingFile: FileDTO | null = null;

  public selectedFiles: FileDTO[] = [];
  public myFiles: FileDTO[] = [];
  public filteredFile: FileDTO[] = [];

  public selectedFolder = '';
  public selectedPath: string[] = [];

  public myRestrictions: FileRestrictions = {
    allowedExtensions: [],
  };

  public data: TreeDataInterface[] = [];
  private arrUnsubscribe: Subscription[] = [];

  // =================== APIs ===================
  uploadSaveUrl = 'saveUrl';
  uploadRemoveUrl = 'removeUrl';

  // =================== Lifecycle ===================
  ngOnInit(): void {
    this.data = this.buildTree(this.folders);
    if (this.files?.length > 0) {
      this.myFiles = [...this.files];
      this.filteredFile = [...this.myFiles];
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['folders']) {
      this.data = this.buildTree(this.folders);
    }
    if (changes['files']) {
      const val = changes['files'].currentValue;
      if (Array.isArray(val)) {
        this.myFiles = [...val];
      }
      else if (val && Array.isArray(val.ObjectReturn)) {
        this.myFiles = [...val.ObjectReturn];
      }
      else {
        this.myFiles = [];
      }
      this.filteredFile = [...this.myFiles];
    }
  }


  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }


  // =================== Upload ===================
  triggerManualSelect() {
    const input = this.uploadRef.wrapper.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (input) input.click();
  }

  public onUpload(ev: SuccessEvent) {
    const saved: FileDTO[] = ev.response?.body || [];
    this.myFiles.push(...saved);
    this.filteredFile = [...this.myFiles];
  }

  public getIconForFile(file: FileDTO): string {
    // Lấy đuôi file từ tên
    const parts = file.Name.split('.');
    const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : '';

    // Danh sách định dạng ảnh
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    if (imageExts.includes(ext)) {
      // Nếu là ảnh, hiển thị chính đường dẫn
      return file.Path;
    }

    // Ngược lại, trả về icon theo loại file
    const mapExt: Record<string, string> = {
      xlsx: 'excel_icon.png',
      xls: 'excel_icon.png',
      pptx: 'ppt_icon.png',
      docx: 'word_icon.png',
      doc: 'word_icon.png',
      pdf: 'pdf_icon.png',
      txt: 'txt_icon.png',
    };
    const icon = mapExt[ext] || 'txt_icon.png';
    return `../../../../../assets/images/icons/ps-dialog-upload-icon/${icon}`;
  }


  // =================== Folder ===================
  public onFolderSelect({ item }: { item: any }) {
    const dataItem = item.dataItem;
    this.selectedFolder = dataItem.text;
    this.selectedPath = dataItem.path || [dataItem.text];
  }

  private buildTree(nodes: TreeDataInterface[], parentPath: string[] = []): TreeDataInterface[] {
    return nodes.map((node) => ({
      ...node,
      path: [...parentPath, node.text],
      items: node.items ? this.buildTree(node.items, [...parentPath, node.text]) : undefined,
    }));
  }

  public fetchChildren(node: TreeDataInterface): Observable<TreeDataInterface[]> {
    return of(node.items);
  }

  public hasChildren(node: TreeDataInterface): boolean {
    return !!node.items?.length;
  }

  get hasFolders(): boolean {
    return this.filteredFile.length > 0;
  }
  clearSelection(): void {
    this.selectedFiles = [];
    this.lastSelectedIndex = null;
  }

  close() {
    this.open = false;
    this.openChange.emit(false);
  }
  // =================== Drag & Drop ===================
  // @HostListener('document:dragover', ['$event'])
  // onGlobalDragOver(event: DragEvent): void {
  //   if (!this.uploadedZoneRef) return;
  //   const rect = this.uploadedZoneRef.nativeElement.getBoundingClientRect();
  //   const { clientX: x, clientY: y } = event;
  //   this.isDraggingOverUploaded =
  //     x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  // }

  // @HostListener('document:drop', ['$event'])
  // onGlobalDrop(): void {
  //   this.isDraggingOverUploaded = false;
  // }

  @HostListener('document:dragover', ['$event'])
  onDropZoneDragEnter() {
    this.isDraggingOverDropzone = true;
  }

  onDropZoneDragLeave(event: DragEvent) {
    const rect = this.dropZoneRef?.nativeElement.getBoundingClientRect();
    const { clientX, clientY } = event;
    if (
      rect &&
      (clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom)
    ) {
      this.isDraggingOverDropzone = false;
    }
  }

  onDropZoneDrop(event: DragEvent) {
    this.isDraggingOverDropzone = false;
  }
  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    if (this.open
      && this.uploadedZoneRef
      && !this.uploadedZoneRef.nativeElement.contains(target)
    ) {
      this.clearSelection();
    }
  }

  onFileDragStart(file: FileDTO) {
    this.draggingFile = file;
  }

  onMultiFileDragStart() {
    // Không cần làm gì, selectedFiles đã lưu
  }

  onTrashDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingOverTrash = true;
  }

  onTrashDragLeave(event: DragEvent): void {
    this.isDraggingOverTrash = false;
  }

  // =================== File Actions ===================
  onTrashDrop(event: DragEvent): void {
    var listpath = this.selectedFiles.map(m => {
      var listlink = m.Path.split('/');
      const startIndex = listlink.indexOf('resource');
      const slicedArr = listlink.slice(startIndex);
      return '~/' + slicedArr.join('/');
    });
    this.isDraggingOverDropzone = false;
    if (listpath.length > 0) {
      this.deleteimage(listpath);
    }

  }

  private lastSelectedIndex: number | null = null;
  toggleFileSelection(file: FileDTO, index: number, event: MouseEvent) {
    if (event.shiftKey && this.lastSelectedIndex !== null) {
      // SHIFT+click: chọn cả vùng
      const start = Math.min(this.lastSelectedIndex, index);
      const end = Math.max(this.lastSelectedIndex, index);
      const range = this.filteredFile.slice(start, end + 1);
      range.forEach(f => {
        if (!this.selectedFiles.some(sel => sel.Path === f.Path)) {
          this.selectedFiles.push(f);
        }
      });
    }
    else if (event.ctrlKey || event.metaKey) {
      // CTRL/CMD+click: toggle chọn từng cái
      const existingIndex = this.selectedFiles.findIndex(f => f.Path === file.Path);
      if (existingIndex >= 0) {
        this.selectedFiles.splice(existingIndex, 1);
      } else {
        this.selectedFiles.push(file);
      }
      this.lastSelectedIndex = index;
    }
    else {
      // CLICK thường: clear tất cả và chỉ chọn file này
      this.selectedFiles = [file];
      this.lastSelectedIndex = index;

    }
  }


  @Output() fileDoubleClick = new EventEmitter<FileDTO>();
  onFileDoubleClick(file: FileDTO): void {
    this.fileDoubleClick.emit(file);
  }


  isSelected(file: FileDTO): boolean {
    return this.selectedFiles.some((f) => f.Path === file.Path);
  }

  public removeCustomFile(path: string) {
    this.myFiles = this.myFiles.filter((f) => f.Path !== path);
    this.filteredFile = this.filteredFile.filter((f) => f.Path !== path);
  }


  // =================== Filter ===================
  handleFilteredFile(filters: FilterDescriptor[]) {
    if (!filters.length) {
      this.filteredFile = [...this.myFiles];
      return;
    }

    const keyword = filters[0].value?.toLowerCase?.() || '';

    this.filteredFile = this.myFiles.filter((file: any) =>
      file.Name?.toLowerCase().includes(keyword)
    );
  }

  public onSelect(e: SelectEvent) {
    this.updateimage(e.files);
  }

  public updateimage(e: Array<FileInfo>) {
    this.subLoader.loader(true);
    var temp = this.coreapi.UploadImage(this.keyPathUpload, e).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.upload.emit();
          this.subLoader.loader(false);
          this.notification.onSuccess(`Thành công`);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi tải file lên hệ thống: ${res.ErrorString}`);
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi tải file lên hệ thống: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private deleteimage(listpath: string[]) {
    this.subLoader.loader(true);
    var temp = this.coreapi.DeleteImage(listpath).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.delete.emit();
          this.selectedFiles = [];
          this.subLoader.loader(false);
          this.notification.onSuccess(`Thành công`);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi xoá file hệ thống: ${res.ErrorString}`);
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi tải file hệ thống: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

}
