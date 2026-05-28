import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService, ActivityPayload } from '../../core/services/admin.service';
import { Category } from '../../core/services/activities.service';

// Transformación lat/lng → posición SVG
const A_LNG = 0.00358282;
const B_LNG = -7.183398;
const A_LAT = -0.00170741;
const B_LAT = 43.781844;
const SVG_W = 777.74173;
const SVG_H = 413.26299;

function latLngToMap(lat: number, lng: number) {
  return {
    mapLeft: ((lng - B_LNG) / A_LNG / SVG_W) * 100,
    mapTop: ((lat - B_LAT) / A_LAT / SVG_H) * 100,
  };
}

const LANGUAGES = ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués'];
const ZONES = [
  { value: 'oriente', label: 'Oriente' },
  { value: 'centro', label: 'Centro' },
  { value: 'occidente', label: 'Occidente' },
] as const;

@Component({
  selector: 'aef-activity-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './activity-form.component.html',
  styleUrl: './activity-form.component.scss',
})
export class ActivityFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private admin = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly zones = ZONES;
  readonly availableLanguages = LANGUAGES;

  categories = signal<Category[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal('');

  editId = signal<string | null>(null);
  get isEditMode() { return !!this.editId(); }

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    shortDescription: [''],
    description: [''],
    category: ['', Validators.required],
    zone: ['', Validators.required],
    municipality: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    accessible: [false],
    languages: [[] as string[]],
    lat: [null as number | null, Validators.required],
    lng: [null as number | null, Validators.required],
    website: [''],
    phone: [''],
    address: [''],
    schedule: [''],
    tips: [''],
  });

  ngOnInit(): void {
    this.admin.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      this.loading.set(true);
      this.admin.getActivity(id).subscribe({
        next: (activity) => {
          const [lng, lat] = activity.location?.coordinates ?? [null, null];
          this.form.patchValue({
            name: activity.name,
            shortDescription: (activity as any).shortDescription ?? '',
            description: activity.description,
            category: typeof activity.category === 'object' ? activity.category._id : activity.category,
            zone: activity.zone,
            municipality: activity.municipality ?? '',
            price: activity.price,
            accessible: activity.accessible,
            languages: activity.languages ?? [],
            lat,
            lng,
            website: (activity as any).website ?? '',
            phone: (activity as any).phone ?? '',
            address: (activity as any).address ?? '',
            schedule: (activity as any).schedule ?? '',
            tips: (activity as any).tips ?? '',
          });
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar la actividad');
          this.loading.set(false);
        },
      });
    }
  }

  toggleLanguage(lang: string): void {
    const current = this.form.value.languages ?? [];
    const updated = current.includes(lang)
      ? current.filter((l) => l !== lang)
      : [...current, lang];
    this.form.patchValue({ languages: updated });
  }

  isLangSelected(lang: string): boolean {
    return (this.form.value.languages ?? []).includes(lang);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const lat = v.lat!;
    const lng = v.lng!;
    const { mapLeft, mapTop } = latLngToMap(lat, lng);

    const payload: ActivityPayload = {
      name: v.name!,
      shortDescription: v.shortDescription ?? undefined,
      description: v.description ?? undefined,
      category: v.category!,
      zone: v.zone as 'oriente' | 'centro' | 'occidente',
      municipality: v.municipality ?? undefined,
      price: v.price ?? 0,
      accessible: v.accessible ?? false,
      languages: v.languages ?? [],
      location: { type: 'Point', coordinates: [lng, lat] },
      mapLeft,
      mapTop,
      website: v.website ?? undefined,
      phone: v.phone ?? undefined,
      address: v.address ?? undefined,
      schedule: v.schedule ?? undefined,
      tips: v.tips ?? undefined,
    };

    this.saving.set(true);
    this.error.set('');

    const request$ = this.isEditMode
      ? this.admin.updateActivity(this.editId()!, payload)
      : this.admin.createActivity(payload);

    request$.subscribe({
      next: () => this.router.navigate(['/admin']),
      error: () => {
        this.error.set('Error al guardar la actividad');
        this.saving.set(false);
      },
    });
  }

  get nameCtrl() { return this.form.get('name')!; }
  get categoryCtrl() { return this.form.get('category')!; }
  get zoneCtrl() { return this.form.get('zone')!; }
  get priceCtrl() { return this.form.get('price')!; }
  get latCtrl() { return this.form.get('lat')!; }
  get lngCtrl() { return this.form.get('lng')!; }
}
