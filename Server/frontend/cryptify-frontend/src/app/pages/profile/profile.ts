import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../models/interfaces';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  user?: User;
  userMenuOpen: boolean = false;
  userId: string = localStorage.getItem('userId') || '';
  oldPassword: string = '';
  newPassword: string = ''
  formattedDate: string = '';

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.userService.getUserByID(this.userId).subscribe({
      next: (response) => {
        console.log(response.results);
        this.user = response.results;
        if (this.user?.createdAt) {
          const date = new Date(this.user.createdAt);
          this.formattedDate = `${date.getDate().toString().padStart(2,'0')}/${
            (date.getMonth()+1).toString().padStart(2,'0')}/${
            date.getFullYear()} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
        }
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      }
    });
  }

  changePassword() {
    this.userService.changePassword(this.userId, this.oldPassword, this.newPassword).subscribe({
      next: (response) => { 
        alert('Password changed successfully!');
        this.oldPassword = '';
        this.newPassword = '';
      },
      error: (err) => {
        console.error('Error changing password:', err);
        alert('Error changing password: ' + err.error.message);
      }
    });
  }

  editProfile() {
    if (!this.user) return;

    this.userService.updateUserByID(this.userId, { name: this.user.name, email: this.user.email }).subscribe({
      next: (response) => { 
        alert('Profile updated successfully!');
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        alert('Error updating profile: ' + err.error.message);
      }
    });
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
