import { AfterViewInit, Renderer2, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageViewerConfig } from './imageviewer.config';
import { ImageCacheService } from './imagecache.service';
export declare class ImageViewerComponent implements AfterViewInit, OnDestroy {
    private _sanitizer;
    private _renderer;
    private _imageCache;
    private config;
    private _src;
    get src(): string | File;
    set src(value: string | File);
    private _filetype;
    get filetype(): string;
    set filetype(value: string);
    private _width;
    get width(): number;
    set width(value: number);
    private _height;
    get height(): number;
    set height(value: number);
    canvasRef: any;
    private _canvas;
    private _context;
    private _dirty;
    private _nextPageButton;
    private _beforePageButton;
    private _zoomOutButton;
    private _zoomInButton;
    private _rotateLeftButton;
    private _rotateRightButton;
    private _resetButton;
    private _buttons;
    private _currentTooltip;
    private _touchStartState;
    private _listenDestroyList;
    private _resource;
    private _resourceChangeSub;
    private _imageResource;
    private _pdfResource;
    constructor(_sanitizer: DomSanitizer, _renderer: Renderer2, _imageCache: ImageCacheService, config: ImageViewerConfig);
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    setUpResource(): void;
    onTap(evt: any): void;
    onTouchEnd(): void;
    processTouchEvent(evt: any): void;
    private addEventListeners;
    private onMouseWheel;
    private checkTooltipActivation;
    private nextPage;
    private previousPage;
    private zoomIn;
    private zoomOut;
    private rotateLeft;
    private rotateRight;
    private resetImage;
    private updateCanvas;
    private render;
    private drawButtons;
    private drawPaginator;
    private drawRoundRectangle;
    private extendsDefaultConfig;
    private screenToCanvasCentre;
    private getUIElements;
    private getUIElement;
    private isImage;
    private isPdf;
}
