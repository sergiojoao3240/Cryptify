import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasskeyService } from '../../../services/passkey';
import { Category, Vault } from '../../../models/interfaces';
import { CategoryService } from '../../../services/category';

@Component({
  selector: 'app-add-passkey-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-passkey-modal.component.html',
  styleUrl: './add-passkey-modal.component.css',
})
export class AddPasskeyModalComponent {
  @Input() isOpen: boolean = false;
  @Input() activeVault?: Vault;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  formData = {
    name: '',
    username: '',
    password: '',
    categoryId: '',
  };

  categories: Category[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  showPassword: boolean = false;
  newCategoryName: string = '';
  creatingCategory: boolean = false;

  constructor(private passkeyService: PasskeyService, private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategoriesOfVault(this.activeVault?._id || '').subscribe({
        next: (response) => {
            this.categories = response.results;
        },
        error: (err) => {
            console.error('Error fetching categories:', err);
        }
    });
  };

  generatePassword() {
    const length = 16;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.formData.password = password;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.formData.name || !this.formData.username || !this.formData.password) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    if (!this.activeVault) {
      this.errorMessage = 'No vault selected';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';


    this.passkeyService.createPasskey(
        this.formData.name,
        this.activeVault._id,
        this.formData.username,
        this.formData.password,
        this.formData.categoryId || undefined,
    ).subscribe({
      next: () => {
        this.successMessage = 'Password saved successfully!';
        setTimeout(() => {
          this.resetForm();
          this.saved.emit();
          this.closeModal();
        }, 1500);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Error saving password. Please try again.';
        this.isLoading = false;
      }
    });
  }

  createCategory() {
    const name = this.newCategoryName && this.newCategoryName.trim();
    if (!name) {
      this.errorMessage = 'Category name cannot be empty';
      return;
    }

    if (!this.activeVault) {
      this.errorMessage = 'No vault selected';
      return;
    }

    this.creatingCategory = true;
    this.errorMessage = '';

    console.log(this.activeVault._id);

    this.categoryService.createCategory(name, this.activeVault._id).subscribe({
      next: (resp: any) => {
        console.log('Category created:', resp);
        const created = resp.results || resp.data || resp;
        const cat = { _id: created._id || created.id || created, name: created.name || name } as Category;
        this.categories = [cat, ...this.categories];
        this.formData.categoryId = cat._id;
        this.newCategoryName = '';
        this.creatingCategory = false;
      },
      error: (err: any) => {
        console.error('Error creating category', err);
        this.errorMessage = err.error?.message || 'Could not create category';
        this.creatingCategory = false;
      }
    });
  }

  resetForm() {
    this.formData = {
      name: '',
      username: '',
      password: '',
      categoryId: '',
    };
    this.errorMessage = '';
    this.successMessage = '';
    this.showPassword = false;
  }

  closeModal() {
    this.close.emit();
  }
}
