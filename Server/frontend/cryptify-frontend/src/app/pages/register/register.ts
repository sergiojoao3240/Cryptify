import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  email: string = '';
  name: string = '';
  password: string = '';
  confirmPassword: string = '';
  error: string = '';
  message: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.authService.register(this.email, this.name, this.password).subscribe({
      next: (response) => {
        this.message = response.message || 'Registration successful! Please log in.';
        this.router.navigate(['/login']);
      },
      error: () => {
        this.error = 'Registration failed. Please try again.';
      },
    });
  }
}
