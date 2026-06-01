import {
	Component,
	Input,
	Output,
	EventEmitter,
	signal,
	inject,
	ViewChild,
	ElementRef,
	AfterViewInit,
	OnChanges,
	SimpleChanges,
} from "@angular/core";
import { Category } from "../../../../core/services/activities.service";
import { CategoriesService } from "../../../../core/services/categories.service";

@Component({
	selector: "aef-filter-panel",
	standalone: true,
	imports: [],
	templateUrl: "./filter-panel.component.html",
	styleUrl: "./filter-panel.component.scss",
})
export class FilterPanelComponent implements AfterViewInit, OnChanges {
	@Input() categories: Category[] = [];
	@Input() resultCount = 0;

	@Output() categoriesChange = new EventEmitter<string[]>();
	@Output() freeChange = new EventEmitter<boolean>();
	@Output() zoneChange = new EventEmitter<string>();
	@Output() accessibleChange = new EventEmitter<boolean>();

	@ViewChild("chipsScroll") chipsScroll!: ElementRef<HTMLDivElement>;

	private readonly categoriesService = inject(CategoriesService);

	readonly activeCategories = signal<string[]>([]);
	readonly onlyFree = signal(false);
	readonly activeZone = signal<string>("");
	readonly onlyAccessible = signal(false);
	readonly canScrollLeft = signal(false);
	readonly canScrollRight = signal(false);
	readonly drawerOpen = signal(false);

	ngAfterViewInit(): void {
		setTimeout(() => this.updateScrollButtons(), 0);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["categories"]) {
			setTimeout(() => this.updateScrollButtons(), 0);
		}
	}

	toggleCategory(id: string): void {
		const current = this.activeCategories();
		const updated = current.includes(id) ? current.filter(c => c !== id) : [...current, id];
		this.activeCategories.set(updated);
		this.categoriesChange.emit(updated);
	}

	isCategoryActive(id: string): boolean {
		return this.activeCategories().includes(id);
	}

	toggleFree(): void {
		const next = !this.onlyFree();
		this.onlyFree.set(next);
		this.freeChange.emit(next);
	}

	selectZone(zone: string): void {
		const current = this.activeZone();
		const next = current === zone ? "" : zone;
		this.activeZone.set(next);
		this.zoneChange.emit(next);
	}

	isZoneActive(zone: string): boolean {
		return this.activeZone() === zone;
	}

	toggleAccessible(): void {
		const next = !this.onlyAccessible();
		this.onlyAccessible.set(next);
		this.accessibleChange.emit(next);
	}

	scrollChips(direction: "left" | "right"): void {
		if (!this.chipsScroll) return;
		const scrollContainer = this.chipsScroll.nativeElement;
		const scrollAmount = 280;
		const newPosition =
			direction === "left"
				? scrollContainer.scrollLeft - scrollAmount
				: scrollContainer.scrollLeft + scrollAmount;

		scrollContainer.scrollTo({
			left: newPosition,
			behavior: "smooth",
		});

		// Actualizar estados de botones después del scroll
		setTimeout(() => this.updateScrollButtons(), 300);
	}

	private updateScrollButtons(): void {
		if (!this.chipsScroll) return;
		const scrollContainer = this.chipsScroll.nativeElement;
		this.canScrollLeft.set(scrollContainer.scrollLeft > 0);
		this.canScrollRight.set(
			scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth - 10,
		);
	}

	onScroll(): void {
		this.updateScrollButtons();
	}

	openDrawer(): void {
		this.drawerOpen.set(true);
	}

	closeDrawer(): void {
		this.drawerOpen.set(false);
	}

	clearFilters(): void {
		this.activeCategories.set([]);
		this.activeZone.set("");
		this.onlyFree.set(false);
		this.onlyAccessible.set(false);
		this.categoriesChange.emit([]);
		this.zoneChange.emit("");
		this.freeChange.emit(false);
		this.accessibleChange.emit(false);
	}

	iconUrl(icon: string): string {
		return this.categoriesService.iconUrl(icon ?? "");
	}
}

