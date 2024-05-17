import { Component, Input, ViewChild, Renderer2, Inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageViewerConfig, IMAGEVIEWER_CONFIG, IMAGEVIEWER_CONFIG_DEFAULT } from './imageviewer.config';
import { Button, toSquareAngle } from './imageviewer.model';
import { ImageResourceLoader } from './image.loader';
import { ImageCacheService } from './imagecache.service';
import { PdfResourceLoader } from './pdf.loader';
const MIN_TOOLTIP_WIDTH_SPACE = 500;
export class ImageViewerComponent {
    //#endregion
    //#region Lifecycle events
    constructor(_sanitizer, _renderer, _imageCache, config) {
        this._sanitizer = _sanitizer;
        this._renderer = _renderer;
        this._imageCache = _imageCache;
        this.config = config;
        // dirty state
        this._dirty = true;
        // contains all active buttons
        this._buttons = [];
        // current tool tip (used to track change of tool tip)
        this._currentTooltip = null;
        // cached data when touch events started
        this._touchStartState = {};
        // list of event listener destroyers
        this._listenDestroyList = [];
        this.config = this.extendsDefaultConfig(config);
        this._nextPageButton = new Button(this.config.nextPageButton, this.config.buttonStyle);
        this._beforePageButton = new Button(this.config.beforePageButton, this.config.buttonStyle);
        this._zoomOutButton = new Button(this.config.zoomOutButton, this.config.buttonStyle);
        this._zoomInButton = new Button(this.config.zoomInButton, this.config.buttonStyle);
        this._rotateLeftButton = new Button(this.config.rotateLeftButton, this.config.buttonStyle);
        this._rotateRightButton = new Button(this.config.rotateRightButton, this.config.buttonStyle);
        this._resetButton = new Button(this.config.resetButton, this.config.buttonStyle);
        this._buttons = [
            this._zoomOutButton,
            this._zoomInButton,
            this._rotateLeftButton,
            this._rotateRightButton,
            this._resetButton
        ].filter(item => item.display)
            .sort((a, b) => a.sortId - b.sortId);
    }
    get src() { return this._src; }
    set src(value) {
        if (value === this._src) {
            return;
        }
        this._src = value;
        this.setUpResource();
    }
    get filetype() { return this._filetype; }
    set filetype(value) {
        if (value === this._filetype) {
            return;
        }
        this._filetype = value;
        this.setUpResource();
    }
    get width() { return this._width; }
    set width(value) {
        if (value === this._width) {
            return;
        }
        this._width = value;
        if (this._canvas) {
            this._canvas.width = this._width;
        }
        this.resetImage();
    }
    get height() { return this._height; }
    set height(value) {
        if (value === this._height) {
            return;
        }
        this._height = value;
        if (this._canvas) {
            this._canvas.height = this._height;
        }
        this.resetImage();
    }
    ngAfterViewInit() {
        this._canvas = this.canvasRef.nativeElement;
        this._context = this._canvas.getContext('2d');
        // setting canvas dimention
        this._canvas.width = this.width || this.config.width;
        this._canvas.height = this.height || this.config.height;
        // setting buttons actions
        this._nextPageButton.onClick = (evt) => { this.nextPage(); return false; };
        this._beforePageButton.onClick = (evt) => { this.previousPage(); return false; };
        this._zoomOutButton.onClick = (evt) => { this.zoomOut(); return false; };
        this._zoomInButton.onClick = (evt) => { this.zoomIn(); return false; };
        this._rotateLeftButton.onClick = (evt) => { this.rotateLeft(); return false; };
        this._rotateRightButton.onClick = (evt) => { this.rotateRight(); return false; };
        this._resetButton.onClick = (evt) => { this.resetImage(); return false; };
        // register event listeners
        this.addEventListeners();
        this.updateCanvas();
    }
    ngOnDestroy() {
        // unregiste event listeners
        this._listenDestroyList.forEach(listenDestroy => {
            if (typeof listenDestroy === 'function') {
                listenDestroy();
            }
        });
        this._imageCache.disposeCache();
    }
    setUpResource() {
        if (this.isImage(this.src) && (!this._resource || !(this._resource instanceof ImageResourceLoader))) {
            if (this._resourceChangeSub) {
                this._resourceChangeSub.unsubscribe();
            }
            if (!this._imageResource) {
                this._imageResource = new ImageResourceLoader();
            }
            this._resource = this._imageResource;
        }
        else if (this.isPdf(this.src) && (!this._resource || !(this._resource instanceof PdfResourceLoader))) {
            if (this._resourceChangeSub) {
                this._resourceChangeSub.unsubscribe();
            }
            if (!this._pdfResource) {
                this._pdfResource = new PdfResourceLoader(this._imageCache);
            }
            this._resource = this._pdfResource;
        }
        if (this._resource) {
            this._resource.src = this.src instanceof File ? URL.createObjectURL(this.src) : this.src;
            this._resourceChangeSub = this._resource.onResourceChange().subscribe(() => {
                this.updateCanvas();
                if (this.src instanceof File) {
                    URL.revokeObjectURL(this._resource.src);
                }
            });
            this._resource.setUp();
            this.resetImage();
            if (this._context) {
                this.updateCanvas();
            }
        }
    }
    //#endregion
    //#region Touch events
    onTap(evt) {
        const position = { x: evt.clientX, y: evt.clientY };
        const activeElement = this.getUIElement(this.screenToCanvasCentre(position));
        if (activeElement !== null) {
            activeElement.onClick(evt);
        }
    }
    onTouchEnd() {
        this._touchStartState.viewport = undefined;
        this._touchStartState.scale = undefined;
        this._touchStartState.rotate = undefined;
    }
    processTouchEvent(evt) {
        // process pan
        if (!this._touchStartState.viewport) {
            this._touchStartState.viewport = Object.assign({}, this._resource.viewport);
        }
        const viewport = this._resource.viewport;
        viewport.x = this._touchStartState.viewport.x + evt.deltaX;
        viewport.y = this._touchStartState.viewport.y + evt.deltaY;
        // process pinch in/out
        if (!this._touchStartState.scale) {
            this._touchStartState.scale = this._resource.viewport.scale;
        }
        const newScale = this._touchStartState.scale * evt.scale;
        viewport.scale = newScale > this._resource.maxScale ? this._resource.maxScale :
            newScale < this._resource.minScale ? this._resource.minScale : newScale;
        // process rotate left/right
        if (!this._touchStartState.rotate) {
            this._touchStartState.rotate = { rotation: viewport.rotation, startRotate: evt.rotation };
        }
        if (evt.rotation !== 0) {
            const newAngle = this._touchStartState.rotate.rotation + evt.rotation - this._touchStartState.rotate.startRotate;
            viewport.rotation = this.config.rotateStepper ? toSquareAngle(newAngle) : newAngle;
        }
        this._dirty = true;
    }
    //#endregion
    //#region Mouse Events
    addEventListeners() {
        // zooming
        this._listenDestroyList.push(this._renderer.listen(this._canvas, 'DOMMouseScroll', (evt) => this.onMouseWheel(evt)));
        this._listenDestroyList.push(this._renderer.listen(this._canvas, 'mousewheel', (evt) => this.onMouseWheel(evt)));
        // show tooltip when mouseover it
        this._listenDestroyList.push(this._renderer.listen(this._canvas, 'mousemove', (evt) => this.checkTooltipActivation(this.screenToCanvasCentre({ x: evt.clientX, y: evt.clientY }))));
    }
    onMouseWheel(evt) {
        if (!evt) {
            evt = event;
        }
        evt.preventDefault();
        if (evt.detail < 0 || evt.wheelDelta > 0) { // up -> larger
            this.zoomIn();
        }
        else { // down -> smaller
            this.zoomOut();
        }
    }
    checkTooltipActivation(pos) {
        this.getUIElements().forEach(x => x.hover = false);
        const activeElement = this.getUIElement(pos);
        const oldToolTip = this._currentTooltip;
        if (activeElement !== null) {
            if (typeof activeElement.hover !== 'undefined') {
                activeElement.hover = true;
            }
            if (typeof activeElement.tooltip !== 'undefined') {
                this._currentTooltip = activeElement.tooltip;
            }
        }
        if (oldToolTip !== this._currentTooltip) {
            this._dirty = true;
        }
    }
    //#endregion
    //#region Button Actions
    nextPage() {
        if (!this._resource) {
            return;
        }
        if (this._resource.currentItem >= this._resource.totalItem) {
            return;
        }
        if (this._resource.currentItem < 1) {
            this._resource.currentItem = 0;
        }
        this._resource.currentItem++;
        this._resource.loadResource();
        this._dirty = true;
    }
    previousPage() {
        if (!this._resource) {
            return;
        }
        if (this._resource.currentItem <= 1) {
            return;
        }
        if (this._resource.currentItem > this._resource.totalItem) {
            this._resource.currentItem = this._resource.totalItem + 1;
        }
        this._resource.currentItem--;
        this._resource.loadResource();
        this._dirty = true;
    }
    zoomIn() {
        if (!this._resource) {
            return;
        }
        const newScale = this._resource.viewport.scale * (1 + this.config.scaleStep);
        this._resource.viewport.scale = newScale > this._resource.maxScale ? this._resource.maxScale : newScale;
        this._dirty = true;
    }
    zoomOut() {
        if (!this._resource) {
            return;
        }
        const newScale = this._resource.viewport.scale * (1 - this.config.scaleStep);
        this._resource.viewport.scale = newScale < this._resource.minScale ? this._resource.minScale : newScale;
        this._dirty = true;
    }
    rotateLeft() {
        if (!this._resource) {
            return;
        }
        const viewport = this._resource.viewport;
        viewport.rotation = viewport.rotation === 0 ? 270 : viewport.rotation - 90;
        this._dirty = true;
    }
    rotateRight() {
        if (!this._resource) {
            return;
        }
        const viewport = this._resource.viewport;
        viewport.rotation = viewport.rotation === 270 ? 0 : viewport.rotation + 90;
        this._dirty = true;
    }
    resetImage() {
        if (!this._resource) {
            return;
        }
        this._resource.resetViewport(this._canvas);
        this._dirty = true;
    }
    //#endregion
    //#region Draw Canvas
    updateCanvas() {
        this.resetImage();
        // start new render loop
        this.render();
    }
    render() {
        const vm = this;
        // only re-render if dirty
        if (this._dirty && this._resource) {
            this._dirty = false;
            const ctx = this._context;
            ctx.save();
            this._resource.draw(ctx, this.config, this._canvas, () => {
                ctx.restore();
                if (vm._resource.loaded) {
                    // draw buttons
                    this.drawButtons(ctx);
                    // draw paginator
                    if (this._resource.showItemsQuantity) {
                        this.drawPaginator(ctx);
                    }
                }
            });
        }
        requestAnimationFrame(() => this.render());
    }
    drawButtons(ctx) {
        const padding = this.config.tooltips.padding;
        const radius = this.config.tooltips.radius;
        const gap = 2 * radius + padding;
        const x = this._canvas.width - radius - padding;
        const y = this._canvas.height - radius - padding;
        // draw buttons
        for (let i = 0; i < this._buttons.length; i++) {
            this._buttons[i].draw(ctx, x, y - gap * i, radius);
        }
        // draw tooltip
        if (this._currentTooltip !== null && this._canvas.width > MIN_TOOLTIP_WIDTH_SPACE) {
            ctx.save();
            const fontSize = radius;
            ctx.font = fontSize + 'px sans-serif';
            // calculate position
            const textSize = ctx.measureText(this._currentTooltip).width, rectWidth = textSize + padding, rectHeight = fontSize * 0.70 + padding, rectX = this._canvas.width
                - (2 * radius + 2 * padding) // buttons
                - rectWidth, rectY = this._canvas.height - rectHeight - padding, textX = rectX + 0.5 * padding, textY = this._canvas.height - 1.5 * padding;
            ctx.globalAlpha = this.config.tooltips.bgAlpha;
            ctx.fillStyle = this.config.tooltips.bgStyle;
            this.drawRoundRectangle(ctx, rectX, rectY, rectWidth, rectHeight, 8, true, false);
            ctx.globalAlpha = this.config.tooltips.textAlpha;
            ctx.fillStyle = this.config.tooltips.textStyle;
            ctx.fillText(this._currentTooltip, textX, textY);
            ctx.restore();
        }
    }
    drawPaginator(ctx) {
        const padding = this.config.tooltips.padding;
        const radius = this.config.tooltips.radius;
        const labelWidth = 50;
        const x1 = (this._canvas.width - labelWidth) / 2 - radius - padding; // PrevPageButton
        const x2 = this._canvas.width / 2; // Label
        const x3 = (this._canvas.width + labelWidth) / 2 + radius + padding; // NextPageButton
        const y = this._canvas.height - radius - padding;
        const label = this._resource.currentItem + '/' + this._resource.totalItem;
        const fontSize = 25;
        ctx.save();
        this._beforePageButton.draw(ctx, x1, y, radius);
        this._nextPageButton.draw(ctx, x3, y, radius);
        ctx.restore();
        ctx.save();
        ctx.font = fontSize + 'px Verdana';
        ctx.textAlign = 'center';
        ctx.fillText(label, x2, this._canvas.height - padding - fontSize / 2, labelWidth);
        ctx.restore();
    }
    drawRoundRectangle(ctx, x, y, width, height, radius, fill, stroke) {
        radius = (typeof radius === 'number') ? radius : 5;
        fill = (typeof fill === 'boolean') ? fill : true; // fill = default
        stroke = (typeof stroke === 'boolean') ? stroke : false;
        // draw round rectangle
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (fill) {
            ctx.fill();
        }
        if (stroke) {
            ctx.stroke();
        }
    }
    //#endregion
    //#region Utils
    extendsDefaultConfig(cfg) {
        const defaultCfg = IMAGEVIEWER_CONFIG_DEFAULT;
        const localCfg = Object.assign({}, defaultCfg, cfg);
        if (cfg.buttonStyle) {
            localCfg.buttonStyle = Object.assign(defaultCfg.buttonStyle, cfg.buttonStyle);
        }
        if (cfg.tooltips) {
            localCfg.tooltips = Object.assign(defaultCfg.tooltips, cfg.tooltips);
        }
        if (cfg.nextPageButton) {
            localCfg.nextPageButton = Object.assign(defaultCfg.nextPageButton, cfg.nextPageButton);
        }
        if (cfg.beforePageButton) {
            localCfg.beforePageButton = Object.assign(defaultCfg.beforePageButton, cfg.beforePageButton);
        }
        if (cfg.zoomOutButton) {
            localCfg.zoomOutButton = Object.assign(defaultCfg.zoomOutButton, cfg.zoomOutButton);
        }
        if (cfg.zoomOutButton) {
            localCfg.zoomOutButton = Object.assign(defaultCfg.zoomOutButton, cfg.zoomOutButton);
        }
        if (cfg.zoomInButton) {
            localCfg.zoomInButton = Object.assign(defaultCfg.zoomInButton, cfg.zoomInButton);
        }
        if (cfg.rotateLeftButton) {
            localCfg.rotateLeftButton = Object.assign(defaultCfg.rotateLeftButton, cfg.rotateLeftButton);
        }
        if (cfg.rotateRightButton) {
            localCfg.rotateRightButton = Object.assign(defaultCfg.rotateRightButton, cfg.rotateRightButton);
        }
        if (cfg.resetButton) {
            localCfg.resetButton = Object.assign(defaultCfg.resetButton, cfg.resetButton);
        }
        return localCfg;
    }
    screenToCanvasCentre(pos) {
        const rect = this._canvas.getBoundingClientRect();
        return { x: pos.x - rect.left, y: pos.y - rect.top };
    }
    getUIElements() {
        const hoverElements = this._buttons.slice();
        hoverElements.push(this._nextPageButton);
        hoverElements.push(this._beforePageButton);
        return hoverElements;
    }
    getUIElement(pos) {
        const activeUIElement = this.getUIElements().filter((uiElement) => {
            return uiElement.isWithinBounds(pos.x, pos.y);
        });
        return (activeUIElement.length > 0) ? activeUIElement[0] : null;
    }
    isImage(file) {
        if (this._filetype && this._filetype.toLowerCase() === 'image') {
            return true;
        }
        return testFile(file, '\\.(png|jpg|jpeg|gif)|image/png');
    }
    isPdf(file) {
        if (this._filetype && this._filetype.toLowerCase() === 'pdf') {
            return true;
        }
        return testFile(file, '\\.(pdf)|application/pdf');
    }
}
ImageViewerComponent.decorators = [
    { type: Component, args: [{
                selector: 'ngx-imageviewer',
                template: `
    <canvas #imageContainer [width]="width" [height]="height"
      (click)="onTap($event)" (pinchin)="processTouchEvent($event)" (pinchout)="processTouchEvent($event)"
      (panmove)="processTouchEvent($event)" (panend)="onTouchEnd()" (rotatemove)="processTouchEvent($event)"
      (rotateend)="onTouchEnd()">
    </canvas>
  `,
                styles: [`
    :host { display: block }
    :host canvas { margin: 0 auto; display: block }
    [hidden] { display: none !important }
  `]
            },] }
];
ImageViewerComponent.ctorParameters = () => [
    { type: DomSanitizer },
    { type: Renderer2 },
    { type: ImageCacheService },
    { type: ImageViewerConfig, decorators: [{ type: Inject, args: [IMAGEVIEWER_CONFIG,] }] }
];
ImageViewerComponent.propDecorators = {
    src: [{ type: Input, args: ['src',] }],
    filetype: [{ type: Input, args: ['filetype',] }],
    width: [{ type: Input, args: ['width',] }],
    height: [{ type: Input, args: ['height',] }],
    canvasRef: [{ type: ViewChild, args: ['imageContainer', { static: false },] }]
};
function testFile(file, regexTest) {
    if (!file) {
        return false;
    }
    const name = file instanceof File ? file.name : file;
    return name.toLowerCase().match(regexTest) !== null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2V2aWV3ZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWltYWdldmlld2VyL3NyYy9saWIvaW1hZ2V2aWV3ZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBaUIsU0FBUyxFQUFFLE1BQU0sRUFBYSxNQUFNLGVBQWUsQ0FBQztBQUN6RyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFHekQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLDBCQUEwQixFQUE2QixNQUFNLHNCQUFzQixDQUFDO0FBQ3BJLE9BQU8sRUFBWSxNQUFNLEVBQUUsYUFBYSxFQUFrQixNQUFNLHFCQUFxQixDQUFDO0FBQ3RGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUVqRCxNQUFNLHVCQUF1QixHQUFHLEdBQUcsQ0FBQztBQWlCcEMsTUFBTSxPQUFPLG9CQUFvQjtJQThFL0IsWUFBWTtJQUVaLDBCQUEwQjtJQUMxQixZQUNVLFVBQXdCLEVBQ3hCLFNBQW9CLEVBQ3BCLFdBQThCLEVBQ0YsTUFBeUI7UUFIckQsZUFBVSxHQUFWLFVBQVUsQ0FBYztRQUN4QixjQUFTLEdBQVQsU0FBUyxDQUFXO1FBQ3BCLGdCQUFXLEdBQVgsV0FBVyxDQUFtQjtRQUNGLFdBQU0sR0FBTixNQUFNLENBQW1CO1FBdkMvRCxjQUFjO1FBQ04sV0FBTSxHQUFHLElBQUksQ0FBQztRQVd0Qiw4QkFBOEI7UUFDdEIsYUFBUSxHQUFHLEVBQUUsQ0FBQztRQUV0QixzREFBc0Q7UUFDOUMsb0JBQWUsR0FBRyxJQUFJ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QUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLEtBQUssS0FBSyxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUM7U0FBRTtRQUM5RSxPQUFPLFFBQVEsQ0FBQyxJQUFJLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztJQUNwRCxDQUFDOzs7WUFuZUYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxpQkFBaUI7Z0JBQzNCLFFBQVEsRUFBRTs7Ozs7O0dBTVQ7eUJBQ1E7Ozs7R0FJUjthQUNGOzs7WUF6QlEsWUFBWTtZQURnQyxTQUFTO1lBT3JELGlCQUFpQjtZQUhqQixpQkFBaUIsdUJBNEdyQixNQUFNLFNBQUMsa0JBQWtCOzs7a0JBaEYzQixLQUFLLFNBQUMsS0FBSzt1QkFTWCxLQUFLLFNBQUMsVUFBVTtvQkFRaEIsS0FBSyxTQUFDLE9BQU87cUJBU2IsS0FBSyxTQUFDLFFBQVE7d0JBT2QsU0FBUyxTQUFDLGdCQUFnQixFQUFFLEVBQUMsTUFBTSxFQUFFLEtBQUssRUFBQzs7QUFrYjlDLFNBQVMsUUFBUSxDQUFDLElBQW1CLEVBQUUsU0FBaUI7SUFDdEQsSUFBSSxDQUFDLElBQUksRUFBRTtRQUFFLE9BQU8sS0FBSyxDQUFDO0tBQUU7SUFDNUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3JELE9BQU8sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxJQUFJLENBQUM7QUFDdEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIFZpZXdDaGlsZCwgQWZ0ZXJWaWV3SW5pdCwgUmVuZGVyZXIyLCBJbmplY3QsIE9uRGVzdHJveSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRG9tU2FuaXRpemVyIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgSW1hZ2VWaWV3ZXJDb25maWcsIElNQUdFVklFV0VSX0NPTkZJRywgSU1BR0VWSUVXRVJfQ09ORklHX0RFRkFVTFQsIEJ1dHRvbkNvbmZpZywgQnV0dG9uU3R5bGUgfSBmcm9tICcuL2ltYWdldmlld2VyLmNvbmZpZyc7XG5pbXBvcnQgeyBWaWV3cG9ydCwgQnV0dG9uLCB0b1NxdWFyZUFuZ2xlLCBSZXNvdXJjZUxvYWRlciB9IGZyb20gJy4vaW1hZ2V2aWV3ZXIubW9kZWwnO1xuaW1wb3J0IHsgSW1hZ2VSZXNvdXJjZUxvYWRlciB9IGZyb20gJy4vaW1hZ2UubG9hZGVyJztcbmltcG9ydCB7IEltYWdlQ2FjaGVTZXJ2aWNlIH0gZnJvbSAnLi9pbWFnZWNhY2hlLnNlcnZpY2UnO1xuaW1wb3J0IHsgUGRmUmVzb3VyY2VMb2FkZXIgfSBmcm9tICcuL3BkZi5sb2FkZXInO1xuXG5jb25zdCBNSU5fVE9PTFRJUF9XSURUSF9TUEFDRSA9IDUwMDtcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmd4LWltYWdldmlld2VyJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8Y2FudmFzICNpbWFnZUNvbnRhaW5lciBbd2lkdGhdPVwid2lkdGhcIiBbaGVpZ2h0XT1cImhlaWdodFwiXG4gICAgICAoY2xpY2spPVwib25UYXAoJGV2ZW50KVwiIChwaW5jaGluKT1cInByb2Nlc3NUb3VjaEV2ZW50KCRldmVudClcIiAocGluY2hvdXQpPVwicHJvY2Vzc1RvdWNoRXZlbnQoJGV2ZW50KVwiXG4gICAgICAocGFubW92ZSk9XCJwcm9jZXNzVG91Y2hFdmVudCgkZXZlbnQpXCIgKHBhbmVuZCk9XCJvblRvdWNoRW5kKClcIiAocm90YXRlbW92ZSk9XCJwcm9jZXNzVG91Y2hFdmVudCgkZXZlbnQpXCJcbiAgICAgIChyb3RhdGVlbmQpPVwib25Ub3VjaEVuZCgpXCI+XG4gICAgPC9jYW52YXM+XG4gIGAsXG4gIHN0eWxlczogW2BcbiAgICA6aG9zdCB7IGRpc3BsYXk6IGJsb2NrIH1cbiAgICA6aG9zdCBjYW52YXMgeyBtYXJnaW46IDAgYXV0bzsgZGlzcGxheTogYmxvY2sgfVxuICAgIFtoaWRkZW5dIHsgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50IH1cbiAgYF1cbn0pXG5leHBvcnQgY2xhc3MgSW1hZ2VWaWV3ZXJDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuXG4gIC8vI3JlZ2lvbiBJbnB1dCBwcm9wZXJ0aWVzXG4gIHByaXZhdGUgX3NyYzogc3RyaW5nIHwgRmlsZTtcbiAgZ2V0IHNyYygpIHsgcmV0dXJuIHRoaXMuX3NyYzsgfVxuICBASW5wdXQoJ3NyYycpIHNldCBzcmModmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHRoaXMuX3NyYykgeyByZXR1cm47IH1cbiAgICB0aGlzLl9zcmMgPSB2YWx1ZTtcbiAgICB0aGlzLnNldFVwUmVzb3VyY2UoKTtcbiAgfVxuXG4gIC8vIEZJWCBub3Qgd29ya2lnbiBwcm9wZXJseVxuICBwcml2YXRlIF9maWxldHlwZTogc3RyaW5nO1xuICBnZXQgZmlsZXR5cGUoKSB7IHJldHVybiB0aGlzLl9maWxldHlwZTsgfVxuICBASW5wdXQoJ2ZpbGV0eXBlJykgc2V0IGZpbGV0eXBlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICBpZiAodmFsdWUgPT09IHRoaXMuX2ZpbGV0eXBlKSB7IHJldHVybjsgfVxuICAgIHRoaXMuX2ZpbGV0eXBlID0gdmFsdWU7XG4gICAgdGhpcy5zZXRVcFJlc291cmNlKCk7XG4gIH1cblxuICBwcml2YXRlIF93aWR0aDogbnVtYmVyO1xuICBnZXQgd2lkdGgoKSB7IHJldHVybiB0aGlzLl93aWR0aDsgfVxuICBASW5wdXQoJ3dpZHRoJykgc2V0IHdpZHRoKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB0aGlzLl93aWR0aCkgeyByZXR1cm47IH1cbiAgICB0aGlzLl93aWR0aCA9IHZhbHVlO1xuICAgIGlmICh0aGlzLl9jYW52YXMpIHsgdGhpcy5fY2FudmFzLndpZHRoID0gdGhpcy5fd2lkdGg7IH1cbiAgICB0aGlzLnJlc2V0SW1hZ2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgX2hlaWdodDogbnVtYmVyO1xuICBnZXQgaGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5faGVpZ2h0OyB9XG4gIEBJbnB1dCgnaGVpZ2h0Jykgc2V0IGhlaWdodCh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gdGhpcy5faGVpZ2h0KSB7IHJldHVybjsgfVxuICAgIHRoaXMuX2hlaWdodCA9IHZhbHVlO1xuICAgIGlmICh0aGlzLl9jYW52YXMpIHsgdGhpcy5fY2FudmFzLmhlaWdodCA9IHRoaXMuX2hlaWdodDsgfVxuICAgIHRoaXMucmVzZXRJbWFnZSgpO1xuICB9XG5cbiAgQFZpZXdDaGlsZCgnaW1hZ2VDb250YWluZXInLCB7c3RhdGljOiBmYWxzZX0pIGNhbnZhc1JlZjogYW55O1xuICAvLyNlbmRyZWdpb25cblxuICAvLyNyZWdpb24gUHJpdmF0ZSBwcm9wZXJ0aWVzXG4gIC8vIENhbnZhcyAyRCBjb250ZXh0XG4gIHByaXZhdGUgX2NhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG4gIHByaXZhdGUgX2NvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcblxuICAvLyBkaXJ0eSBzdGF0ZVxuICBwcml2YXRlIF9kaXJ0eSA9IHRydWU7XG5cbiAgLy8gYWN0aW9uIGJ1dHRvbnNcbiAgcHJpdmF0ZSBfbmV4dFBhZ2VCdXR0b246IEJ1dHRvbjtcbiAgcHJpdmF0ZSBfYmVmb3JlUGFnZUJ1dHRvbjogQnV0dG9uO1xuICBwcml2YXRlIF96b29tT3V0QnV0dG9uOiBCdXR0b247XG4gIHByaXZhdGUgX3pvb21JbkJ1dHRvbjogQnV0dG9uO1xuICBwcml2YXRlIF9yb3RhdGVMZWZ0QnV0dG9uOiBCdXR0b247XG4gIHByaXZhdGUgX3JvdGF0ZVJpZ2h0QnV0dG9uOiBCdXR0b247XG4gIHByaXZhdGUgX3Jlc2V0QnV0dG9uOiBCdXR0b247XG5cbiAgLy8gY29udGFpbnMgYWxsIGFjdGl2ZSBidXR0b25zXG4gIHByaXZhdGUgX2J1dHRvbnMgPSBbXTtcblxuICAvLyBjdXJyZW50IHRvb2wgdGlwICh1c2VkIHRvIHRyYWNrIGNoYW5nZSBvZiB0b29sIHRpcClcbiAgcHJpdmF0ZSBfY3VycmVudFRvb2x0aXAgPSBudWxsO1xuXG4gIC8vIGNhY2hlZCBkYXRhIHdoZW4gdG91Y2ggZXZlbnRzIHN0YXJ0ZWRcbiAgcHJpdmF0ZSBfdG91Y2hTdGFydFN0YXRlOiBhbnkgPSB7fTtcblxuICAvLyBsaXN0IG9mIGV2ZW50IGxpc3RlbmVyIGRlc3Ryb3llcnNcbiAgcHJpdmF0ZSBfbGlzdGVuRGVzdHJveUxpc3QgPSBbXTtcblxuICAvLyBpbWFnZSAvIFBkZiBEcmF3YWJsZSBSZXNvdXJjZVxuICBwcml2YXRlIF9yZXNvdXJjZTogUmVzb3VyY2VMb2FkZXI7XG4gIHByaXZhdGUgX3Jlc291cmNlQ2hhbmdlU3ViOiBTdWJzY3JpcHRpb247XG5cbiAgLy8gQ2FjaGluZyByZXNvdXJjZUxvYWRlciBpbnN0YW5jZXMgdG8gcmV1c2VcbiAgcHJpdmF0ZSBfaW1hZ2VSZXNvdXJjZTogSW1hZ2VSZXNvdXJjZUxvYWRlcjtcbiAgcHJpdmF0ZSBfcGRmUmVzb3VyY2U6IFBkZlJlc291cmNlTG9hZGVyO1xuXG4gIC8vI2VuZHJlZ2lvblxuXG4gIC8vI3JlZ2lvbiBMaWZlY3ljbGUgZXZlbnRzXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX3Nhbml0aXplcjogRG9tU2FuaXRpemVyLFxuICAgIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICAgcHJpdmF0ZSBfaW1hZ2VDYWNoZTogSW1hZ2VDYWNoZVNlcnZpY2UsXG4gICAgQEluamVjdChJTUFHRVZJRVdFUl9DT05GSUcpIHByaXZhdGUgY29uZmlnOiBJbWFnZVZpZXdlckNvbmZpZ1xuICApIHtcbiAgICB0aGlzLmNvbmZpZyA9IHRoaXMuZXh0ZW5kc0RlZmF1bHRDb25maWcoY29uZmlnKTtcbiAgICB0aGlzLl9uZXh0UGFnZUJ1dHRvbiA9IG5ldyBCdXR0b24odGhpcy5jb25maWcubmV4dFBhZ2VCdXR0b24sIHRoaXMuY29uZmlnLmJ1dHRvblN0eWxlKTtcbiAgICB0aGlzLl9iZWZvcmVQYWdlQnV0dG9uID0gbmV3IEJ1dHRvbih0aGlzLmNvbmZpZy5iZWZvcmVQYWdlQnV0dG9uLCB0aGlzLmNvbmZpZy5idXR0b25TdHlsZSk7XG4gICAgdGhpcy5fem9vbU91dEJ1dHRvbiA9IG5ldyBCdXR0b24odGhpcy5jb25maWcuem9vbU91dEJ1dHRvbiwgdGhpcy5jb25maWcuYnV0dG9uU3R5bGUpO1xuICAgIHRoaXMuX3pvb21JbkJ1dHRvbiA9IG5ldyBCdXR0b24odGhpcy5jb25maWcuem9vbUluQnV0dG9uLCB0aGlzLmNvbmZpZy5idXR0b25TdHlsZSk7XG4gICAgdGhpcy5fcm90YXRlTGVmdEJ1dHRvbiA9IG5ldyBCdXR0b24odGhpcy5jb25maWcucm90YXRlTGVmdEJ1dHRvbiwgdGhpcy5jb25maWcuYnV0dG9uU3R5bGUpO1xuICAgIHRoaXMuX3JvdGF0ZVJpZ2h0QnV0dG9uID0gbmV3IEJ1dHRvbih0aGlzLmNvbmZpZy5yb3RhdGVSaWdodEJ1dHRvbiwgdGhpcy5jb25maWcuYnV0dG9uU3R5bGUpO1xuICAgIHRoaXMuX3Jlc2V0QnV0dG9uID0gbmV3IEJ1dHRvbih0aGlzLmNvbmZpZy5yZXNldEJ1dHRvbiwgdGhpcy5jb25maWcuYnV0dG9uU3R5bGUpO1xuICAgIHRoaXMuX2J1dHRvbnMgPSBbXG4gICAgICB0aGlzLl96b29tT3V0QnV0dG9uLFxuICAgICAgdGhpcy5fem9vbUluQnV0dG9uLFxuICAgICAgdGhpcy5fcm90YXRlTGVmdEJ1dHRvbixcbiAgICAgIHRoaXMuX3JvdGF0ZVJpZ2h0QnV0dG9uLFxuICAgICAgdGhpcy5fcmVzZXRCdXR0b25cbiAgICBdLmZpbHRlcihpdGVtID0+IGl0ZW0uZGlzcGxheSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBhLnNvcnRJZCAtIGIuc29ydElkKTtcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICB0aGlzLl9jYW52YXMgPSB0aGlzLmNhbnZhc1JlZi5uYXRpdmVFbGVtZW50O1xuICAgIHRoaXMuX2NvbnRleHQgPSB0aGlzLl9jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgIC8vIHNldHRpbmcgY2FudmFzIGRpbWVudGlvblxuICAgIHRoaXMuX2NhbnZhcy53aWR0aCA9IHRoaXMud2lkdGggfHwgdGhpcy5jb25maWcud2lkdGg7XG4gICAgdGhpcy5fY2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0IHx8IHRoaXMuY29uZmlnLmhlaWdodDtcblxuICAgIC8vIHNldHRpbmcgYnV0dG9ucyBhY3Rpb25zXG4gICAgdGhpcy5fbmV4dFBhZ2VCdXR0b24ub25DbGljayA9IChldnQpID0+IHsgdGhpcy5uZXh0UGFnZSgpOyByZXR1cm4gZmFsc2U7IH07XG4gICAgdGhpcy5fYmVmb3JlUGFnZUJ1dHRvbi5vbkNsaWNrID0gKGV2dCkgPT4geyB0aGlzLnByZXZpb3VzUGFnZSgpOyByZXR1cm4gZmFsc2U7IH07XG4gICAgdGhpcy5fem9vbU91dEJ1dHRvbi5vbkNsaWNrID0gKGV2dCkgPT4geyB0aGlzLnpvb21PdXQoKTsgcmV0dXJuIGZhbHNlOyB9O1xuICAgIHRoaXMuX3pvb21JbkJ1dHRvbi5vbkNsaWNrID0gKGV2dCkgPT4geyB0aGlzLnpvb21JbigpOyByZXR1cm4gZmFsc2U7IH07XG4gICAgdGhpcy5fcm90YXRlTGVmdEJ1dHRvbi5vbkNsaWNrID0gKGV2dCkgPT4geyB0aGlzLnJvdGF0ZUxlZnQoKTsgcmV0dXJuIGZhbHNlOyB9O1xuICAgIHRoaXMuX3JvdGF0ZVJpZ2h0QnV0dG9uLm9uQ2xpY2sgPSAoZXZ0KSA9PiB7IHRoaXMucm90YXRlUmlnaHQoKTsgcmV0dXJuIGZhbHNlOyB9O1xuICAgIHRoaXMuX3Jlc2V0QnV0dG9uLm9uQ2xpY2sgPSAoZXZ0KSA9PiB7IHRoaXMucmVzZXRJbWFnZSgpOyByZXR1cm4gZmFsc2U7IH07XG5cbiAgICAvLyByZWdpc3RlciBldmVudCBsaXN0ZW5lcnNcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG5cbiAgICB0aGlzLnVwZGF0ZUNhbnZhcygpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgLy8gdW5yZWdpc3RlIGV2ZW50IGxpc3RlbmVyc1xuICAgIHRoaXMuX2xpc3RlbkRlc3Ryb3lMaXN0LmZvckVhY2gobGlzdGVuRGVzdHJveSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGxpc3RlbkRlc3Ryb3kgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgbGlzdGVuRGVzdHJveSgpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuX2ltYWdlQ2FjaGUuZGlzcG9zZUNhY2hlKCk7XG4gIH1cblxuICBzZXRVcFJlc291cmNlKCkge1xuICAgIGlmICh0aGlzLmlzSW1hZ2UodGhpcy5zcmMpICYmICghdGhpcy5fcmVzb3VyY2UgfHwgISh0aGlzLl9yZXNvdXJjZSBpbnN0YW5jZW9mIEltYWdlUmVzb3VyY2VMb2FkZXIpKSkge1xuICAgICAgaWYgKHRoaXMuX3Jlc291cmNlQ2hhbmdlU3ViKSB7XG4gICAgICAgIHRoaXMuX3Jlc291cmNlQ2hhbmdlU3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuX2ltYWdlUmVzb3VyY2UpIHtcbiAgICAgICAgdGhpcy5faW1hZ2VSZXNvdXJjZSA9IG5ldyBJbWFnZVJlc291cmNlTG9hZGVyKCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9yZXNvdXJjZSA9IHRoaXMuX2ltYWdlUmVzb3VyY2U7XG4gICAgfSBlbHNlIGlmICh0aGlzLmlzUGRmKHRoaXMuc3JjKSAmJiAoIXRoaXMuX3Jlc291cmNlIHx8ICEodGhpcy5fcmVzb3VyY2UgaW5zdGFuY2VvZiBQZGZSZXNvdXJjZUxvYWRlcikpKSB7XG4gICAgICBpZiAodGhpcy5fcmVzb3VyY2VDaGFuZ2VTdWIpIHtcbiAgICAgICAgdGhpcy5fcmVzb3VyY2VDaGFuZ2VTdWIudW5zdWJzY3JpYmUoKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5fcGRmUmVzb3VyY2UpIHtcbiAgICAgICAgdGhpcy5fcGRmUmVzb3VyY2UgPSBuZXcgUGRmUmVzb3VyY2VMb2FkZXIodGhpcy5faW1hZ2VDYWNoZSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9yZXNvdXJjZSA9IHRoaXMuX3BkZlJlc291cmNlO1xuICAgIH1cbiAgICBpZiAodGhpcy5fcmVzb3VyY2UpIHtcbiAgICAgIHRoaXMuX3Jlc291cmNlLnNyYyA9IHRoaXMuc3JjIGluc3RhbmNlb2YgRmlsZSA/IFVSTC5jcmVhdGVPYmplY3RVUkwodGhpcy5zcmMpIDogdGhpcy5zcmM7XG4gICAgICB0aGlzLl9yZXNvdXJjZUNoYW5nZVN1YiA9IHRoaXMuX3Jlc291cmNlLm9uUmVzb3VyY2VDaGFuZ2UoKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZUNhbnZhcygpO1xuICAgICAgICBpZiAodGhpcy5zcmMgaW5zdGFuY2VvZiBGaWxlKSB7XG4gICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh0aGlzLl9yZXNvdXJjZS5zcmMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3Jlc291cmNlLnNldFVwKCk7XG4gICAgICB0aGlzLnJlc2V0SW1hZ2UoKTtcbiAgICAgIGlmICh0aGlzLl9jb250ZXh0KSB7IHRoaXMudXBkYXRlQ2FudmFzKCk7IH1cbiAgICB9XG4gIH1cbiAgLy8jZW5kcmVnaW9uXG5cbiAgLy8jcmVnaW9uIFRvdWNoIGV2ZW50c1xuICBvblRhcChldnQpIHtcbiAgICBjb25zdCBwb3NpdGlvbiA9IHsgeDogZXZ0LmNsaWVudFgsIHk6IGV2dC5jbGllbnRZIH07XG4gICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IHRoaXMuZ2V0VUlFbGVtZW50KHRoaXMuc2NyZWVuVG9DYW52YXNDZW50cmUocG9zaXRpb24pKTtcbiAgICBpZiAoYWN0aXZlRWxlbWVudCAhPT0gbnVsbCkgeyBhY3RpdmVFbGVtZW50Lm9uQ2xpY2soZXZ0KTsgfVxuICB9XG5cbiAgb25Ub3VjaEVuZCgpIHtcbiAgICB0aGlzLl90b3VjaFN0YXJ0U3RhdGUudmlld3BvcnQgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fdG91Y2hTdGFydFN0YXRlLnNjYWxlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3RvdWNoU3RhcnRTdGF0ZS5yb3RhdGUgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBwcm9jZXNzVG91Y2hFdmVudChldnQpIHtcbiAgICAvLyBwcm9jZXNzIHBhblxuICAgIGlmICghdGhpcy5fdG91Y2hTdGFydFN0YXRlLnZpZXdwb3J0KSB7IHRoaXMuX3RvdWNoU3RhcnRTdGF0ZS52aWV3cG9ydCA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuX3Jlc291cmNlLnZpZXdwb3J0KTsgfVxuXG4gICAgY29uc3Qgdmlld3BvcnQgPSB0aGlzLl9yZXNvdXJjZS52aWV3cG9ydDtcbiAgICB2aWV3cG9ydC54ID0gdGhpcy5fdG91Y2hTdGFydFN0YXRlLnZpZXdwb3J0LnggKyBldnQuZGVsdGFYO1xuICAgIHZpZXdwb3J0LnkgPSB0aGlzLl90b3VjaFN0YXJ0U3RhdGUudmlld3BvcnQueSArIGV2dC5kZWx0YVk7XG5cbiAgICAvLyBwcm9jZXNzIHBpbmNoIGluL291dFxuICAgIGlmICghdGhpcy5fdG91Y2hTdGFydFN0YXRlLnNjYWxlKSB7IHRoaXMuX3RvdWNoU3RhcnRTdGF0ZS5zY2FsZSA9IHRoaXMuX3Jlc291cmNlLnZpZXdwb3J0LnNjYWxlOyB9XG4gICAgY29uc3QgbmV3U2NhbGUgPSB0aGlzLl90b3VjaFN0YXJ0U3RhdGUuc2NhbGUgKiBldnQuc2NhbGU7XG4gICAgdmlld3BvcnQuc2NhbGUgPSBuZXdTY2FsZSA+IHRoaXMuX3Jlc291cmNlLm1heFNjYWxlID8gdGhpcy5fcmVzb3VyY2UubWF4U2NhbGUgOlxuICAgICAgbmV3U2NhbGUgPCB0aGlzLl9yZXNvdXJjZS5taW5TY2FsZSA/IHRoaXMuX3Jlc291cmNlLm1pblNjYWxlIDogbmV3U2NhbGU7XG5cbiAgICAvLyBwcm9jZXNzIHJvdGF0ZSBsZWZ0L3JpZ2h0XG4gICAgaWYgKCF0aGlzLl90b3VjaFN0YXJ0U3RhdGUucm90YXRlKSB7IHRoaXMuX3RvdWNoU3RhcnRTdGF0ZS5yb3RhdGUgPSB7IHJvdGF0aW9uOiB2aWV3cG9ydC5yb3RhdGlvbiwgc3RhcnRSb3RhdGU6IGV2dC5yb3RhdGlvbiB9OyB9XG4gICAgaWYgKGV2dC5yb3RhdGlvbiAhPT0gMCkge1xuICAgICAgY29uc3QgbmV3QW5nbGUgPSB0aGlzLl90b3VjaFN0YXJ0U3RhdGUucm90YXRlLnJvdGF0aW9uICsgZXZ0LnJvdGF0aW9uIC0gdGhpcy5fdG91Y2hTdGFydFN0YXRlLnJvdGF0ZS5zdGFydFJvdGF0ZTtcbiAgICAgIHZpZXdwb3J0LnJvdGF0aW9uID0gdGhpcy5jb25maWcucm90YXRlU3RlcHBlciA/IHRvU3F1YXJlQW5nbGUobmV3QW5nbGUpIDogbmV3QW5nbGU7XG4gICAgfVxuICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgfVxuICAvLyNlbmRyZWdpb25cblxuICAvLyNyZWdpb24gTW91c2UgRXZlbnRzXG4gIHByaXZhdGUgYWRkRXZlbnRMaXN0ZW5lcnMoKSB7XG4gICAgLy8gem9vbWluZ1xuICAgIHRoaXMuX2xpc3RlbkRlc3Ryb3lMaXN0LnB1c2godGhpcy5fcmVuZGVyZXIubGlzdGVuKHRoaXMuX2NhbnZhcywgJ0RPTU1vdXNlU2Nyb2xsJywgKGV2dCkgPT4gdGhpcy5vbk1vdXNlV2hlZWwoZXZ0KSkpO1xuICAgIHRoaXMuX2xpc3RlbkRlc3Ryb3lMaXN0LnB1c2godGhpcy5fcmVuZGVyZXIubGlzdGVuKHRoaXMuX2NhbnZhcywgJ21vdXNld2hlZWwnLCAoZXZ0KSA9PiB0aGlzLm9uTW91c2VXaGVlbChldnQpKSk7XG5cbiAgICAvLyBzaG93IHRvb2x0aXAgd2hlbiBtb3VzZW92ZXIgaXRcbiAgICB0aGlzLl9saXN0ZW5EZXN0cm95TGlzdC5wdXNoKHRoaXMuX3JlbmRlcmVyLmxpc3Rlbih0aGlzLl9jYW52YXMsICdtb3VzZW1vdmUnLCAoZXZ0KSA9PlxuICAgICAgdGhpcy5jaGVja1Rvb2x0aXBBY3RpdmF0aW9uKHRoaXMuc2NyZWVuVG9DYW52YXNDZW50cmUoeyB4OiBldnQuY2xpZW50WCwgeTogZXZ0LmNsaWVudFkgfSkpXG4gICAgKSk7XG4gIH1cblxuICBwcml2YXRlIG9uTW91c2VXaGVlbChldnQpIHtcbiAgICBpZiAoIWV2dCkgeyBldnQgPSBldmVudDsgfVxuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmIChldnQuZGV0YWlsIDwgMCB8fCBldnQud2hlZWxEZWx0YSA+IDApIHsgLy8gdXAgLT4gbGFyZ2VyXG4gICAgICB0aGlzLnpvb21JbigpO1xuICAgIH0gZWxzZSB7IC8vIGRvd24gLT4gc21hbGxlclxuICAgICAgdGhpcy56b29tT3V0KCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjaGVja1Rvb2x0aXBBY3RpdmF0aW9uKHBvczogeyB4OiBudW1iZXIsIHk6IG51bWJlciB9KSB7XG4gICAgdGhpcy5nZXRVSUVsZW1lbnRzKCkuZm9yRWFjaCh4ID0+IHguaG92ZXIgPSBmYWxzZSk7XG4gICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IHRoaXMuZ2V0VUlFbGVtZW50KHBvcyk7XG4gICAgY29uc3Qgb2xkVG9vbFRpcCA9IHRoaXMuX2N1cnJlbnRUb29sdGlwO1xuICAgIGlmIChhY3RpdmVFbGVtZW50ICE9PSBudWxsKSB7XG4gICAgICBpZiAodHlwZW9mIGFjdGl2ZUVsZW1lbnQuaG92ZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGFjdGl2ZUVsZW1lbnQuaG92ZXIgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBhY3RpdmVFbGVtZW50LnRvb2x0aXAgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRUb29sdGlwID0gYWN0aXZlRWxlbWVudC50b29sdGlwO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAob2xkVG9vbFRpcCAhPT0gdGhpcy5fY3VycmVudFRvb2x0aXApIHsgdGhpcy5fZGlydHkgPSB0cnVlOyB9XG4gIH1cbiAgLy8jZW5kcmVnaW9uXG5cbiAgLy8jcmVnaW9uIEJ1dHRvbiBBY3Rpb25zXG5cbiAgcHJpdmF0ZSBuZXh0UGFnZSgpIHtcbiAgICBpZiAoIXRoaXMuX3Jlc291cmNlKSB7IHJldHVybjsgfVxuICAgIGlmICh0aGlzLl9yZXNvdXJjZS5jdXJyZW50SXRlbSA+PSB0aGlzLl9yZXNvdXJjZS50b3RhbEl0ZW0pIHsgcmV0dXJuOyB9XG4gICAgaWYgKHRoaXMuX3Jlc291cmNlLmN1cnJlbnRJdGVtIDwgMSkgeyB0aGlzLl9yZXNvdXJjZS5jdXJyZW50SXRlbSA9IDA7IH1cbiAgICB0aGlzLl9yZXNvdXJjZS5jdXJyZW50SXRlbSsrO1xuICAgIHRoaXMuX3Jlc291cmNlLmxvYWRSZXNvdXJjZSgpO1xuICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgcHJldmlvdXNQYWdlKCkge1xuICAgIGlmICghdGhpcy5fcmVzb3VyY2UpIHsgcmV0dXJuOyB9XG4gICAgaWYgKHRoaXMuX3Jlc291cmNlLmN1cnJlbnRJdGVtIDw9IDEpIHsgcmV0dXJuOyB9XG4gICAgaWYgKHRoaXMuX3Jlc291cmNlLmN1cnJlbnRJdGVtID4gdGhpcy5fcmVzb3VyY2UudG90YWxJdGVtKSB7IHRoaXMuX3Jlc291cmNlLmN1cnJlbnRJdGVtID0gdGhpcy5fcmVzb3VyY2UudG90YWxJdGVtICsgMTsgfVxuICAgIHRoaXMuX3Jlc291cmNlLmN1cnJlbnRJdGVtLS07XG4gICAgdGhpcy5fcmVzb3VyY2UubG9hZFJlc291cmNlKCk7XG4gICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSB6b29tSW4oKSB7XG4gICAgaWYgKCF0aGlzLl9yZXNvdXJjZSkgeyByZXR1cm47IH1cbiAgICBjb25zdCBuZXdTY2FsZSA9IHRoaXMuX3Jlc291cmNlLnZpZXdwb3J0LnNjYWxlICogKDEgKyB0aGlzLmNvbmZpZy5zY2FsZVN0ZXApO1xuICAgIHRoaXMuX3Jlc291cmNlLnZpZXdwb3J0LnNjYWxlID0gbmV3U2NhbGUgPiB0aGlzLl9yZXNvdXJjZS5tYXhTY2FsZSA/IHRoaXMuX3Jlc291cmNlLm1heFNjYWxlIDogbmV3U2NhbGU7XG4gICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSB6b29tT3V0KCkge1xuICAgIGlmICghdGhpcy5fcmVzb3VyY2UpIHsgcmV0dXJuOyB9XG4gICAgY29uc3QgbmV3U2NhbGUgPSB0aGlzLl9yZXNvdXJjZS52aWV3cG9ydC5zY2FsZSAqICgxIC0gdGhpcy5jb25maWcuc2NhbGVTdGVwKTtcbiAgICB0aGlzLl9yZXNvdXJjZS52aWV3cG9ydC5zY2FsZSA9IG5ld1NjYWxlIDwgdGhpcy5fcmVzb3VyY2UubWluU2NhbGUgPyB0aGlzLl9yZXNvdXJjZS5taW5TY2FsZSA6IG5ld1NjYWxlO1xuICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgcm90YXRlTGVmdCgpIHtcbiAgICBpZiAoIXRoaXMuX3Jlc291cmNlKSB7IHJldHVybjsgfVxuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fcmVzb3VyY2Uudmlld3BvcnQ7XG4gICAgdmlld3BvcnQucm90YXRpb24gPSB2aWV3cG9ydC5yb3RhdGlvbiA9PT0gMCA/IDI3MCA6IHZpZXdwb3J0LnJvdGF0aW9uIC0gOTA7XG4gICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSByb3RhdGVSaWdodCgpIHtcbiAgICBpZiAoIXRoaXMuX3Jlc291cmNlKSB7IHJldHVybjsgfVxuICAgIGNvbnN0IHZpZXdwb3J0ID0gdGhpcy5fcmVzb3VyY2Uudmlld3BvcnQ7XG4gICAgdmlld3BvcnQucm90YXRpb24gPSB2aWV3cG9ydC5yb3RhdGlvbiA9PT0gMjcwID8gMCA6IHZpZXdwb3J0LnJvdGF0aW9uICsgOTA7XG4gICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNldEltYWdlKCkge1xuICAgIGlmICghdGhpcy5fcmVzb3VyY2UpIHsgcmV0dXJuOyB9XG4gICAgdGhpcy5fcmVzb3VyY2UucmVzZXRWaWV3cG9ydCh0aGlzLl9jYW52YXMpO1xuICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZTtcbiAgfVxuICAvLyNlbmRyZWdpb25cblxuICAvLyNyZWdpb24gRHJhdyBDYW52YXNcbiAgcHJpdmF0ZSB1cGRhdGVDYW52YXMoKSB7XG4gICAgdGhpcy5yZXNldEltYWdlKCk7XG5cbiAgICAvLyBzdGFydCBuZXcgcmVuZGVyIGxvb3BcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXIoKSB7XG4gICAgY29uc3Qgdm0gPSB0aGlzO1xuICAgIC8vIG9ubHkgcmUtcmVuZGVyIGlmIGRpcnR5XG4gICAgaWYgKHRoaXMuX2RpcnR5ICYmIHRoaXMuX3Jlc291cmNlKSB7XG4gICAgICB0aGlzLl9kaXJ0eSA9IGZhbHNlO1xuXG4gICAgICBjb25zdCBjdHggPSB0aGlzLl9jb250ZXh0O1xuICAgICAgY3R4LnNhdmUoKTtcblxuICAgICAgdGhpcy5fcmVzb3VyY2UuZHJhdyhjdHgsIHRoaXMuY29uZmlnLCB0aGlzLl9jYW52YXMsICgpID0+IHtcbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcblxuICAgICAgICBpZiAodm0uX3Jlc291cmNlLmxvYWRlZCkge1xuICAgICAgICAgIC8vIGRyYXcgYnV0dG9uc1xuICAgICAgICAgIHRoaXMuZHJhd0J1dHRvbnMoY3R4KTtcblxuICAgICAgICAgIC8vIGRyYXcgcGFnaW5hdG9yXG4gICAgICAgICAgaWYgKHRoaXMuX3Jlc291cmNlLnNob3dJdGVtc1F1YW50aXR5KSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdQYWdpbmF0b3IoY3R4KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5yZW5kZXIoKSk7XG4gIH1cblxuICBwcml2YXRlIGRyYXdCdXR0b25zKGN0eCkge1xuICAgIGNvbnN0IHBhZGRpbmcgPSB0aGlzLmNvbmZpZy50b29sdGlwcy5wYWRkaW5nO1xuICAgIGNvbnN0IHJhZGl1cyA9IHRoaXMuY29uZmlnLnRvb2x0aXBzLnJhZGl1cztcbiAgICBjb25zdCBnYXAgPSAyICogcmFkaXVzICsgcGFkZGluZztcbiAgICBjb25zdCB4ID0gdGhpcy5fY2FudmFzLndpZHRoIC0gcmFkaXVzIC0gcGFkZGluZztcbiAgICBjb25zdCB5ID0gdGhpcy5fY2FudmFzLmhlaWdodCAtIHJhZGl1cyAtIHBhZGRpbmc7XG5cbiAgICAvLyBkcmF3IGJ1dHRvbnNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2J1dHRvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuX2J1dHRvbnNbaV0uZHJhdyhjdHgsIHgsIHkgLSBnYXAgKiBpLCByYWRpdXMpO1xuICAgIH1cblxuICAgIC8vIGRyYXcgdG9vbHRpcFxuICAgIGlmICh0aGlzLl9jdXJyZW50VG9vbHRpcCAhPT0gbnVsbCAmJiB0aGlzLl9jYW52YXMud2lkdGggPiBNSU5fVE9PTFRJUF9XSURUSF9TUEFDRSkge1xuICAgICAgY3R4LnNhdmUoKTtcbiAgICAgIGNvbnN0IGZvbnRTaXplID0gcmFkaXVzO1xuICAgICAgY3R4LmZvbnQgPSBmb250U2l6ZSArICdweCBzYW5zLXNlcmlmJztcblxuICAgICAgLy8gY2FsY3VsYXRlIHBvc2l0aW9uXG4gICAgICBjb25zdCB0ZXh0U2l6ZSA9IGN0eC5tZWFzdXJlVGV4dCh0aGlzLl9jdXJyZW50VG9vbHRpcCkud2lkdGhcbiAgICAgICAgLCByZWN0V2lkdGggPSB0ZXh0U2l6ZSArIHBhZGRpbmdcbiAgICAgICAgLCByZWN0SGVpZ2h0ID0gZm9udFNpemUgKiAwLjcwICsgcGFkZGluZ1xuICAgICAgICAsIHJlY3RYID0gdGhpcy5fY2FudmFzLndpZHRoXG4gICAgICAgICAgLSAoMiAqIHJhZGl1cyArIDIgKiBwYWRkaW5nKSAvLyBidXR0b25zXG4gICAgICAgICAgLSByZWN0V2lkdGhcbiAgICAgICAgLCByZWN0WSA9IHRoaXMuX2NhbnZhcy5oZWlnaHQgLSByZWN0SGVpZ2h0IC0gcGFkZGluZ1xuICAgICAgICAsIHRleHRYID0gcmVjdFggKyAwLjUgKiBwYWRkaW5nXG4gICAgICAgICwgdGV4dFkgPSB0aGlzLl9jYW52YXMuaGVpZ2h0IC0gMS41ICogcGFkZGluZztcblxuICAgICAgY3R4Lmdsb2JhbEFscGhhID0gdGhpcy5jb25maWcudG9vbHRpcHMuYmdBbHBoYTtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbmZpZy50b29sdGlwcy5iZ1N0eWxlO1xuICAgICAgdGhpcy5kcmF3Um91bmRSZWN0YW5nbGUoY3R4LCByZWN0WCwgcmVjdFksIHJlY3RXaWR0aCwgcmVjdEhlaWdodCwgOCwgdHJ1ZSwgZmFsc2UpO1xuXG4gICAgICBjdHguZ2xvYmFsQWxwaGEgPSB0aGlzLmNvbmZpZy50b29sdGlwcy50ZXh0QWxwaGE7XG4gICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5jb25maWcudG9vbHRpcHMudGV4dFN0eWxlO1xuICAgICAgY3R4LmZpbGxUZXh0KHRoaXMuX2N1cnJlbnRUb29sdGlwLCB0ZXh0WCwgdGV4dFkpO1xuXG4gICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZHJhd1BhZ2luYXRvcihjdHgpIHtcbiAgICBjb25zdCBwYWRkaW5nID0gdGhpcy5jb25maWcudG9vbHRpcHMucGFkZGluZztcbiAgICBjb25zdCByYWRpdXMgPSB0aGlzLmNvbmZpZy50b29sdGlwcy5yYWRpdXM7XG4gICAgY29uc3QgbGFiZWxXaWR0aCA9IDUwO1xuICAgIGNvbnN0IHgxID0gKHRoaXMuX2NhbnZhcy53aWR0aCAtIGxhYmVsV2lkdGgpIC8gMiAtIHJhZGl1cyAtIHBhZGRpbmc7IC8vIFByZXZQYWdlQnV0dG9uXG4gICAgY29uc3QgeDIgPSB0aGlzLl9jYW52YXMud2lkdGggLyAyOyAvLyBMYWJlbFxuICAgIGNvbnN0IHgzID0gKHRoaXMuX2NhbnZhcy53aWR0aCArIGxhYmVsV2lkdGgpIC8gMiArIHJhZGl1cyArIHBhZGRpbmc7IC8vIE5leHRQYWdlQnV0dG9uXG4gICAgY29uc3QgeSA9IHRoaXMuX2NhbnZhcy5oZWlnaHQgLSByYWRpdXMgLSBwYWRkaW5nO1xuICAgIGNvbnN0IGxhYmVsID0gdGhpcy5fcmVzb3VyY2UuY3VycmVudEl0ZW0gKyAnLycgKyB0aGlzLl9yZXNvdXJjZS50b3RhbEl0ZW07XG4gICAgY29uc3QgZm9udFNpemUgPSAyNTtcblxuICAgIGN0eC5zYXZlKCk7XG4gICAgdGhpcy5fYmVmb3JlUGFnZUJ1dHRvbi5kcmF3KGN0eCwgeDEsIHksIHJhZGl1cyk7XG4gICAgdGhpcy5fbmV4dFBhZ2VCdXR0b24uZHJhdyhjdHgsIHgzLCB5LCByYWRpdXMpO1xuICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC5mb250ID0gZm9udFNpemUgKyAncHggVmVyZGFuYSc7XG4gICAgY3R4LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgIGN0eC5maWxsVGV4dChsYWJlbCwgeDIsIHRoaXMuX2NhbnZhcy5oZWlnaHQgLSBwYWRkaW5nIC0gZm9udFNpemUgLyAyLCBsYWJlbFdpZHRoKTtcbiAgICBjdHgucmVzdG9yZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBkcmF3Um91bmRSZWN0YW5nbGUoY3R4LCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCByYWRpdXMsIGZpbGwsIHN0cm9rZSkge1xuICAgIHJhZGl1cyA9ICh0eXBlb2YgcmFkaXVzID09PSAnbnVtYmVyJykgPyByYWRpdXMgOiA1O1xuICAgIGZpbGwgPSAodHlwZW9mIGZpbGwgPT09ICdib29sZWFuJykgPyBmaWxsIDogdHJ1ZTsgLy8gZmlsbCA9IGRlZmF1bHRcbiAgICBzdHJva2UgPSAodHlwZW9mIHN0cm9rZSA9PT0gJ2Jvb2xlYW4nKSA/IHN0cm9rZSA6IGZhbHNlO1xuXG4gICAgLy8gZHJhdyByb3VuZCByZWN0YW5nbGVcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4Lm1vdmVUbyh4ICsgcmFkaXVzLCB5KTtcbiAgICBjdHgubGluZVRvKHggKyB3aWR0aCAtIHJhZGl1cywgeSk7XG4gICAgY3R4LnF1YWRyYXRpY0N1cnZlVG8oeCArIHdpZHRoLCB5LCB4ICsgd2lkdGgsIHkgKyByYWRpdXMpO1xuICAgIGN0eC5saW5lVG8oeCArIHdpZHRoLCB5ICsgaGVpZ2h0IC0gcmFkaXVzKTtcbiAgICBjdHgucXVhZHJhdGljQ3VydmVUbyh4ICsgd2lkdGgsIHkgKyBoZWlnaHQsIHggKyB3aWR0aCAtIHJhZGl1cywgeSArIGhlaWdodCk7XG4gICAgY3R4LmxpbmVUbyh4ICsgcmFkaXVzLCB5ICsgaGVpZ2h0KTtcbiAgICBjdHgucXVhZHJhdGljQ3VydmVUbyh4LCB5ICsgaGVpZ2h0LCB4LCB5ICsgaGVpZ2h0IC0gcmFkaXVzKTtcbiAgICBjdHgubGluZVRvKHgsIHkgKyByYWRpdXMpO1xuICAgIGN0eC5xdWFkcmF0aWNDdXJ2ZVRvKHgsIHksIHggKyByYWRpdXMsIHkpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgIGlmIChmaWxsKSB7IGN0eC5maWxsKCk7IH1cbiAgICBpZiAoc3Ryb2tlKSB7IGN0eC5zdHJva2UoKTsgfVxuICB9XG5cbiAgLy8jZW5kcmVnaW9uXG5cbiAgLy8jcmVnaW9uIFV0aWxzXG5cbiAgcHJpdmF0ZSBleHRlbmRzRGVmYXVsdENvbmZpZyhjZmc6IEltYWdlVmlld2VyQ29uZmlnKSB7XG4gICAgY29uc3QgZGVmYXVsdENmZyA9IElNQUdFVklFV0VSX0NPTkZJR19ERUZBVUxUO1xuICAgIGNvbnN0IGxvY2FsQ2ZnID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdENmZywgY2ZnKTtcbiAgICBpZiAoY2ZnLmJ1dHRvblN0eWxlKSB7IGxvY2FsQ2ZnLmJ1dHRvblN0eWxlID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0Q2ZnLmJ1dHRvblN0eWxlLCBjZmcuYnV0dG9uU3R5bGUpOyB9XG4gICAgaWYgKGNmZy50b29sdGlwcykgeyBsb2NhbENmZy50b29sdGlwcyA9IE9iamVjdC5hc3NpZ24oZGVmYXVsdENmZy50b29sdGlwcywgY2ZnLnRvb2x0aXBzKTsgfVxuICAgIGlmIChjZmcubmV4dFBhZ2VCdXR0b24pIHsgbG9jYWxDZmcubmV4dFBhZ2VCdXR0b24gPSBPYmplY3QuYXNzaWduKGRlZmF1bHRDZmcubmV4dFBhZ2VCdXR0b24sIGNmZy5uZXh0UGFnZUJ1dHRvbik7IH1cbiAgICBpZiAoY2ZnLmJlZm9yZVBhZ2VCdXR0b24pIHsgbG9jYWxDZmcuYmVmb3JlUGFnZUJ1dHRvbiA9IE9iamVjdC5hc3NpZ24oZGVmYXVsdENmZy5iZWZvcmVQYWdlQnV0dG9uLCBjZmcuYmVmb3JlUGFnZUJ1dHRvbik7IH1cbiAgICBpZiAoY2ZnLnpvb21PdXRCdXR0b24pIHsgbG9jYWxDZmcuem9vbU91dEJ1dHRvbiA9IE9iamVjdC5hc3NpZ24oZGVmYXVsdENmZy56b29tT3V0QnV0dG9uLCBjZmcuem9vbU91dEJ1dHRvbik7IH1cbiAgICBpZiAoY2ZnLnpvb21PdXRCdXR0b24pIHsgbG9jYWxDZmcuem9vbU91dEJ1dHRvbiA9IE9iamVjdC5hc3NpZ24oZGVmYXVsdENmZy56b29tT3V0QnV0dG9uLCBjZmcuem9vbU91dEJ1dHRvbik7IH1cbiAgICBpZiAoY2ZnLnpvb21JbkJ1dHRvbikgeyBsb2NhbENmZy56b29tSW5CdXR0b24gPSBPYmplY3QuYXNzaWduKGRlZmF1bHRDZmcuem9vbUluQnV0dG9uLCBjZmcuem9vbUluQnV0dG9uKTsgfVxuICAgIGlmIChjZmcucm90YXRlTGVmdEJ1dHRvbikgeyBsb2NhbENmZy5yb3RhdGVMZWZ0QnV0dG9uID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0Q2ZnLnJvdGF0ZUxlZnRCdXR0b24sIGNmZy5yb3RhdGVMZWZ0QnV0dG9uKTsgfVxuICAgIGlmIChjZmcucm90YXRlUmlnaHRCdXR0b24pIHsgbG9jYWxDZmcucm90YXRlUmlnaHRCdXR0b24gPSBPYmplY3QuYXNzaWduKGRlZmF1bHRDZmcucm90YXRlUmlnaHRCdXR0b24sIGNmZy5yb3RhdGVSaWdodEJ1dHRvbik7IH1cbiAgICBpZiAoY2ZnLnJlc2V0QnV0dG9uKSB7IGxvY2FsQ2ZnLnJlc2V0QnV0dG9uID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0Q2ZnLnJlc2V0QnV0dG9uLCBjZmcucmVzZXRCdXR0b24pOyB9XG4gICAgcmV0dXJuIGxvY2FsQ2ZnO1xuICB9XG5cbiAgcHJpdmF0ZSBzY3JlZW5Ub0NhbnZhc0NlbnRyZShwb3M6IHsgeDogbnVtYmVyLCB5OiBudW1iZXIgfSkge1xuICAgIGNvbnN0IHJlY3QgPSB0aGlzLl9jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgcmV0dXJuIHsgeDogcG9zLnggLSByZWN0LmxlZnQsIHk6IHBvcy55IC0gcmVjdC50b3AgfTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0VUlFbGVtZW50cygpOiBCdXR0b25bXSB7XG4gICAgY29uc3QgaG92ZXJFbGVtZW50cyA9IHRoaXMuX2J1dHRvbnMuc2xpY2UoKTtcbiAgICBob3ZlckVsZW1lbnRzLnB1c2godGhpcy5fbmV4dFBhZ2VCdXR0b24pO1xuICAgIGhvdmVyRWxlbWVudHMucHVzaCh0aGlzLl9iZWZvcmVQYWdlQnV0dG9uKTtcbiAgICByZXR1cm4gaG92ZXJFbGVtZW50cztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0VUlFbGVtZW50KHBvczogeyB4OiBudW1iZXIsIHk6IG51bWJlciB9KSB7XG4gICAgY29uc3QgYWN0aXZlVUlFbGVtZW50ID0gdGhpcy5nZXRVSUVsZW1lbnRzKCkuZmlsdGVyKCh1aUVsZW1lbnQpID0+IHtcbiAgICAgIHJldHVybiB1aUVsZW1lbnQuaXNXaXRoaW5Cb3VuZHMocG9zLngsIHBvcy55KTtcbiAgICB9KTtcbiAgICByZXR1cm4gKGFjdGl2ZVVJRWxlbWVudC5sZW5ndGggPiAwKSA/IGFjdGl2ZVVJRWxlbWVudFswXSA6IG51bGw7XG4gIH1cblxuICBwcml2YXRlIGlzSW1hZ2UoZmlsZTogc3RyaW5nIHwgRmlsZSkge1xuICAgIGlmICh0aGlzLl9maWxldHlwZSAmJiB0aGlzLl9maWxldHlwZS50b0xvd2VyQ2FzZSgpID09PSAnaW1hZ2UnKSB7IHJldHVybiB0cnVlOyB9XG4gICAgcmV0dXJuIHRlc3RGaWxlKGZpbGUsICdcXFxcLihwbmd8anBnfGpwZWd8Z2lmKXxpbWFnZS9wbmcnKTtcbiAgfVxuXG4gIHByaXZhdGUgaXNQZGYoZmlsZTogc3RyaW5nIHwgRmlsZSkge1xuICAgIGlmICh0aGlzLl9maWxldHlwZSAmJiB0aGlzLl9maWxldHlwZS50b0xvd2VyQ2FzZSgpID09PSAncGRmJykgeyByZXR1cm4gdHJ1ZTsgfVxuICAgIHJldHVybiB0ZXN0RmlsZShmaWxlLCAnXFxcXC4ocGRmKXxhcHBsaWNhdGlvbi9wZGYnKTtcbiAgfVxuICAvLyNlbmRyZWdpb25cbn1cblxuZnVuY3Rpb24gdGVzdEZpbGUoZmlsZTogc3RyaW5nIHwgRmlsZSwgcmVnZXhUZXN0OiBzdHJpbmcpIHtcbiAgaWYgKCFmaWxlKSB7IHJldHVybiBmYWxzZTsgfVxuICBjb25zdCBuYW1lID0gZmlsZSBpbnN0YW5jZW9mIEZpbGUgPyBmaWxlLm5hbWUgOiBmaWxlO1xuICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpLm1hdGNoKHJlZ2V4VGVzdCkgIT09IG51bGw7XG59XG4iXX0=