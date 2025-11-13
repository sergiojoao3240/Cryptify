import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';
import { VaultService } from '../../services/vault';
import { CategoryService } from '../../services/category';
import { PasskeyService } from '../../services/passkey';
import { VaultUserService } from '../../services/vault-user';
import { Router, RouterLink } from '@angular/router';
import { Passkey, Vault, Category, VaultUser } from '../../models/interfaces';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  vaults: Vault[] = [];
  selectedVault?: Vault;
  passkeys: Passkey[] = [];
  searchQuery: string = '';
  showUserMenu: boolean = false;
  
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private vaultService: VaultService,
    private categoryService: CategoryService,
    private passkeyService: PasskeyService,
    private vaultUserService: VaultUserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.vaultService.getAllMyVaults().subscribe({
      next: (response) => {
        this.vaults = response.results;
      },
      error: (err) => {
        console.error('Error fetching vaults:', err);
      }
    });
  }

  loadPasskeys() {
    if (!this.selectedVault) return;

    this.passkeyService.getAllPasskeysOfVault(this.selectedVault._id).subscribe({
      next: (response) => {
        this.passkeys = response.results;
      },
      error: (err) => {
        console.error('Error fetching passkeys:', err);
      }
    });
  }

  filteredPasskeys(): Passkey[] {
    return this.passkeys.filter(p =>
      p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  selectVault(vault: Vault) {
    this.selectedVault = vault;
    this.loadPasskeys();
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    const userId = localStorage.getItem('userId');
    localStorage.clear();
    this.authService.logout(userId!).subscribe({
      next: () => {
        console.log('Logged out successfully')  ;
      },
      error: (err) => {
        console.error('Error during logout:', err);
      }
    });
    this.router.navigate(['/login']);
  }
}
