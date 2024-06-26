import { ResourceLoader } from './imageviewer.model';
import { getDocument } from 'pdfjs-dist';
export class PdfResourceLoader extends ResourceLoader {
    constructor(_imageCache) {
        super();
        this._imageCache = _imageCache;
        this.showItemsQuantity = true;
    }
    setUp() {
        const vm = this;
        if (vm.loading || !vm.src) {
            return;
        }
        const loadingTask = getDocument(vm.src);
        vm.loading = true;
        vm.currentItem = 1;
        loadingTask.promise.then((pdf) => {
            vm._pdf = pdf;
            vm.totalItem = pdf.numPages;
            vm.loaded = true;
            vm.loadResource();
        }, (reason) => {
            console.error(reason);
        });
    }
    loadResource() {
        const vm = this;
        if (!vm.loaded) {
            vm._pendingReload = true;
            return;
        }
        vm.loaded = false;
        const url = vm.src;
        const page = vm.currentItem;
        vm._pdf.getPage(page).then((pdfPage) => {
            vm._page = pdfPage;
            vm.loadImage(url, page, () => {
                vm.loaded = true;
                vm.loading = false;
                if (vm._pendingReload) {
                    vm._pendingReload = false;
                    vm.loadResource();
                }
                else {
                    vm.resourceChange.next();
                }
            });
        });
    }
    loadImage(src, page, onFinish) {
        const vm = this;
        const cacheimg = vm._imageCache.getImage(src, page);
        if (cacheimg) {
            vm._image = cacheimg;
            onFinish();
            return;
        }
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const pageVp = vm._page.getViewport({ scale: 2 });
        canvas.width = pageVp.width;
        canvas.height = pageVp.height;
        const renderContext = {
            canvasContext: context,
            viewport: pageVp
        };
        const renderTask = vm._page.render(renderContext);
        renderTask.promise.then(() => {
            canvas.toBlob(blob => {
                const img = new Image();
                img.onload = onFinish;
                img.src = URL.createObjectURL(blob);
                vm._imageCache.saveImage(src, page, img);
                vm._image = img;
            });
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGRmLmxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1pbWFnZXZpZXdlci9zcmMvbGliL3BkZi5sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBNEIsTUFBTSxxQkFBcUIsQ0FBQztBQUUvRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRXpDLE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxjQUFjO0lBS25ELFlBQW9CLFdBQThCO1FBQ2hELEtBQUssRUFBRSxDQUFDO1FBRFUsZ0JBQVcsR0FBWCxXQUFXLENBQW1CO1FBRWhELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7SUFDaEMsQ0FBQztJQUVELEtBQUs7UUFDSCxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDaEIsSUFBSSxFQUFFLENBQUMsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRTtZQUFFLE9BQU87U0FBRTtRQUN0QyxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hDLEVBQUUsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLEVBQUUsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDL0IsRUFBRSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7WUFDZCxFQUFFLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUM7WUFDNUIsRUFBRSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDakIsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3BCLENBQUMsRUFBRSxDQUFDLE1BQWMsRUFBRSxFQUFFO1lBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7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dXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlc291cmNlTG9hZGVyLCBEaW1lbnNpb24sIHRvU3F1YXJlQW5nbGUgfSBmcm9tICcuL2ltYWdldmlld2VyLm1vZGVsJztcbmltcG9ydCB7IEltYWdlQ2FjaGVTZXJ2aWNlIH0gZnJvbSAnLi9pbWFnZWNhY2hlLnNlcnZpY2UnO1xuaW1wb3J0IHsgZ2V0RG9jdW1lbnQgfSBmcm9tICdwZGZqcy1kaXN0JztcblxuZXhwb3J0IGNsYXNzIFBkZlJlc291cmNlTG9hZGVyIGV4dGVuZHMgUmVzb3VyY2VMb2FkZXIge1xuICBwcml2YXRlIF9wZGY7XG4gIHByaXZhdGUgX3BhZ2U7XG4gIHByaXZhdGUgX3BlbmRpbmdSZWxvYWQ6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaW1hZ2VDYWNoZTogSW1hZ2VDYWNoZVNlcnZpY2UpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuc2hvd0l0ZW1zUXVhbnRpdHkgPSB0cnVlO1xuICB9XG5cbiAgc2V0VXAoKSB7XG4gICAgY29uc3Qgdm0gPSB0aGlzO1xuICAgIGlmICh2bS5sb2FkaW5nIHx8ICF2bS5zcmMpIHsgcmV0dXJuOyB9XG4gICAgY29uc3QgbG9hZGluZ1Rhc2sgPSBnZXREb2N1bWVudCh2bS5zcmMpO1xuICAgIHZtLmxvYWRpbmcgPSB0cnVlO1xuICAgIHZtLmN1cnJlbnRJdGVtID0gMTtcbiAgICBsb2FkaW5nVGFzay5wcm9taXNlLnRoZW4oKHBkZikgPT4ge1xuICAgICAgdm0uX3BkZiA9IHBkZjtcbiAgICAgIHZtLnRvdGFsSXRlbSA9IHBkZi5udW1QYWdlcztcbiAgICAgIHZtLmxvYWRlZCA9IHRydWU7XG4gICAgICB2bS5sb2FkUmVzb3VyY2UoKTtcbiAgICB9LCAocmVhc29uOiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcbiAgICB9KTtcbiAgfVxuXG4gIGxvYWRSZXNvdXJjZSgpIHtcbiAgICBjb25zdCB2bSA9IHRoaXM7XG4gICAgaWYgKCF2bS5sb2FkZWQpIHtcbiAgICAgIHZtLl9wZW5kaW5nUmVsb2FkID0gdHJ1ZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdm0ubG9hZGVkID0gZmFsc2U7XG4gICAgY29uc3QgdXJsID0gdm0uc3JjO1xuICAgIGNvbnN0IHBhZ2UgPSB2bS5jdXJyZW50SXRlbTtcblxuICAgIHZtLl9wZGYuZ2V0UGFnZShwYWdlKS50aGVuKChwZGZQYWdlKSA9PiB7XG4gICAgICB2bS5fcGFnZSA9IHBkZlBhZ2U7XG4gICAgICB2bS5sb2FkSW1hZ2UodXJsLCBwYWdlLCAoKSA9PiB7XG4gICAgICAgIHZtLmxvYWRlZCA9IHRydWU7XG4gICAgICAgIHZtLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgaWYgKHZtLl9wZW5kaW5nUmVsb2FkKSB7XG4gICAgICAgICAgdm0uX3BlbmRpbmdSZWxvYWQgPSBmYWxzZTtcbiAgICAgICAgICB2bS5sb2FkUmVzb3VyY2UoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2bS5yZXNvdXJjZUNoYW5nZS5uZXh0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBsb2FkSW1hZ2Uoc3JjOiBzdHJpbmcsIHBhZ2U6IG51bWJlciwgb25GaW5pc2g6ICgpID0+IHZvaWQpIHtcbiAgICBjb25zdCB2bSA9IHRoaXM7XG4gICAgY29uc3QgY2FjaGVpbWcgPSB2bS5faW1hZ2VDYWNoZS5nZXRJbWFnZShzcmMsIHBhZ2UpO1xuICAgIGlmIChjYWNoZWltZykge1xuICAgICAgdm0uX2ltYWdlID0gY2FjaGVpbWc7XG4gICAgICBvbkZpbmlzaCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgY29uc3QgcGFnZVZwID0gdm0uX3BhZ2UuZ2V0Vmlld3BvcnQoeyBzY2FsZTogMiB9KTtcbiAgICBjYW52YXMud2lkdGggPSBwYWdlVnAud2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IHBhZ2VWcC5oZWlnaHQ7XG5cbiAgICBjb25zdCByZW5kZXJDb250ZXh0ID0ge1xuICAgICAgY2FudmFzQ29udGV4dDogY29udGV4dCxcbiAgICAgIHZpZXdwb3J0OiBwYWdlVnBcbiAgICB9O1xuICAgIGNvbnN0IHJlbmRlclRhc2sgPSB2bS5fcGFnZS5yZW5kZXIocmVuZGVyQ29udGV4dCk7XG4gICAgcmVuZGVyVGFzay5wcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgY2FudmFzLnRvQmxvYihibG9iID0+IHtcbiAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5vbmxvYWQgPSBvbkZpbmlzaDtcbiAgICAgICAgaW1nLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgIHZtLl9pbWFnZUNhY2hlLnNhdmVJbWFnZShzcmMsIHBhZ2UsIGltZyk7XG4gICAgICAgIHZtLl9pbWFnZSA9IGltZztcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG4iXX0=