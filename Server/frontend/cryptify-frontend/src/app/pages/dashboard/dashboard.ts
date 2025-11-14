import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { VaultService } from '../../services/vault';
import { PasskeyService } from '../../services/passkey';
import { Router, RouterLink } from '@angular/router';
import { Passkey, Vault } from '../../models/interfaces';
import { HttpResponse } from '@angular/common/http';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  vaults: Vault[] = [];
  activeVault?: Vault;
  passkeys: Passkey[] = [];
  filteredPasskeys: Passkey[] = [];
  searchQuery: string = '';
  userMenuOpen: boolean = false;
  exporting: boolean = false;
  visiblePasswords: { [key: string]: boolean } = {}; 
  
  get activeVault$(): Vault | undefined {
    return this.activeVault;
  }
  
  constructor(
    private authService: AuthService,
    private vaultService: VaultService,
    private passkeyService: PasskeyService,
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

    let ownerId = localStorage.getItem('userId') || '';

    this.vaultService.getAllVaults({name: 'My Vault', ownerId: ownerId}).subscribe({
      next: (response) => {
        this.activeVault = response.results.data[0];
        this.loadPasskeys();
      },
      error: (err) => {
        console.error('Error fetching vault:', err);
      }
    });
  }

  loadPasskeys() {
    if (!this.activeVault) {
      console.warn('Active vault not defined yet');
      return;
    }

    this.passkeyService.getAllPasskeysOfVault(this.activeVault._id).subscribe({
      next: (response) => {
        const data = response.results || response.data || [];
        this.passkeys = Array.isArray(data) ? data : [];
        this.filterPasswords();
      },
      error: (err) => {
        console.error('Error fetching passkeys:', err);
        this.passkeys = [];
        this.filteredPasskeys = [];
      }
    });
  }

  filterPasswords() {
    this.filteredPasskeys = this.passkeys.filter(p =>
      p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  selectVault(vault: Vault) {
    this.activeVault = vault;
    this.visiblePasswords = {};
    this.loadPasskeys();
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  goToAccount() {
    this.userMenuOpen = false;
    this.router.navigate(['/profile']);
  }

  // Precisa de melhorias
  editPasskey(id: string) {
    this.router.navigate([`/passkey/edit/${id}`]);
  }

  // Precisa de melhorias
  viewPasskey(id: string) {
    this.router.navigate([`/passkey/view/${id}`]);
  }

  deletePasskey(id: string) {
    if (confirm('Are you sure you want to delete this password?')) {
      this.passkeyService.deletePasskeyByID(id).subscribe({
        next: () => {
          this.loadPasskeys();
        },
        error: (err: any) => {
          console.error('Error deleting passkey:', err);
        }
      });
    }
  }

  addPasskey() {
    this.router.navigate(['/passkey/add']);
  }

  exportPasskeys() {
    if (!this.activeVault) return;

    this.passkeyService.exportPasskeysOfVault(this.activeVault._id).subscribe({
      next: (response: HttpResponse<Blob>) => {
        const blob = response.body!;
        const filename = this.getFileNameFromContentDisposition(response) || `passkeys-${this.activeVault!._id}.json`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        this.exporting = false;
      },
      error: (err) => {
        console.error('Export failed', err);
        this.exporting = false;
      }
        
    });
  }

    private getFileNameFromContentDisposition(resp: HttpResponse<Blob>): string | null {
    const cd = resp.headers.get('Content-Disposition') || resp.headers.get('content-disposition');
    if (!cd) return null;
    const match = /filename\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/.exec(cd);
    if (match) {
      const encoded = match[1] || match[2];
      try {
        return decodeURIComponent(encoded);
      } catch {
        return encoded;
      }
    }
    return null;
  }

  togglePasswordVisibility(passkeyId: string, passkey: Passkey) {
    if (this.visiblePasswords[passkeyId]) {
      this.visiblePasswords[passkeyId] = false;
    } else {
      this.passkeyService.getPasskeysById(passkeyId).subscribe({
        next: (response: any) => {
          const decryptedPasskey = response.results || response;
          passkey.password = decryptedPasskey.password;
          this.visiblePasswords[passkeyId] = true;
        },
        error: (err: any) => {
          console.error('Error fetching passkey:', err);
        }
      });
    }
  }

  getDisplayPassword(passkeyId: string, password: string): string {
    if (this.visiblePasswords[passkeyId]) {
      return password;
    }
    return '*'.repeat(8);
  }

  logout() {
    const userId = localStorage.getItem('userId');
    localStorage.clear();
    this.authService.logout(userId!).subscribe({
      next: () => {
        console.log('Logged out successfully');
      },
      error: (err: any) => {
        console.error('Error during logout:', err);
      }
    });
    this.router.navigate(['/login']);
  }
}
