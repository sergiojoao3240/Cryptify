import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-verify-pin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './verify-pin.html',
  styleUrl: './verify-pin.css',
})
export class VerifyPin {
  pin: string = '';
  email: string = localStorage.getItem('email') || ''; 
  error: string = '';
  message: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.authService.verifyPin(this.email, this.pin).subscribe({
      next: (response) => {
        this.message = response.message || 'Pin verified successfully!';
        localStorage.setItem('token', response.results.refresh_token);
        localStorage.setItem('userId', response.results._id);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Invalid pin. Please try again.';
      },
    });
  }

}
