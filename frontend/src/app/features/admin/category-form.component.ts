import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoriesService, CategoryPayload } from '../../core/services/categories.service';

function slugValidator(control: AbstractControl): ValidationErrors | null {
  const val = control.value as string;
  if (!val) return null;
  return /^[a-z0-9-]+$/.test(val) ? null : { slug: true };
}

@Component({
  selector: 'aef-category-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
})
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoriesService = inject(CategoriesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = false;
  private categoryId: string | null = null;

  loading = signal(true);
  saving = signal(false);
  uploading = signal(false);
  error = signal('');
  iconPreview = signal('');

  private slugTouched = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    slug: ['', [Validators.required, slugValidator]],
    color: ['#2a4d1e'],
    order: [0, [Validators.required, Validators.min(0)]],
    description: ['', Validators.maxLength(200)],
    icon: ['', Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.categoryId = id;
      this.categoriesService.getCategory(id).subscribe({
        next: (cat) => {
          this.form.patchValue({
            name: cat.name,
            slug: cat.slug,
            color: cat.color,
            order: cat.order,
            description: cat.description ?? '',
            icon: cat.icon,
          });
          if (cat.icon) {
            this.iconPreview.set(this.categoriesService.iconUrl(cat.icon));
          }
          this.slugTouched = true;
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar la categoría');
          this.loading.set(false);
        },
      });
    } else {
      this.loading.set(false);
    }
  }

  onNameInput(value: string): void {
    if (!this.slugTouched) {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      this.form.patchValue({ slug }, { emitEvent: false });
    }
  }

  onSlugFocus(): void {
    if (this.form.value.slug) this.slugTouched = true;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.error.set('');
    this.uploading.set(true);
    this.categoriesService.uploadIcon(file).subscribe({
      next: (res) => {
        this.form.patchValue({ icon: res.url });
        this.iconPreview.set(this.categoriesService.iconUrl(res.url));
        this.uploading.set(false);
      },
      error: () => {
        this.error.set('Error al subir el icono');
        this.uploading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const payload: CategoryPayload = {
      name: v.name!,
      slug: v.slug!,
      icon: v.icon!,
      color: v.color!,
      description: v.description || undefined,
      order: v.order ?? 0,
    };

    this.saving.set(true);
    this.error.set('');

    const request$ = this.isEditMode
      ? this.categoriesService.updateCategory(this.categoryId!, payload)
      : this.categoriesService.createCategory(payload);

    request$.subscribe({
      next: () => this.router.navigate(['/admin/categorias']),
      error: (err) => {
        this.error.set(err.error?.error ?? 'Error al guardar la categoría');
        this.saving.set(false);
      },
    });
  }

  get nameCtrl() { return this.form.get('name')!; }
  get slugCtrl() { return this.form.get('slug')!; }
  get orderCtrl() { return this.form.get('order')!; }
  get descriptionCtrl() { return this.form.get('description')!; }
  get iconCtrl() { return this.form.get('icon')!; }
}
