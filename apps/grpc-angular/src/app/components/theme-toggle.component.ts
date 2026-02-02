import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ThemeService } from '../services/theme.service';

/**
 * Theme toggle button component for switching between dark and light modes.
 * Displays the current theme and allows users to toggle between modes.
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <p-button
      [icon]="isDarkMode() ? 'pi pi-sun' : 'pi pi-moon'"
      [label]="isDarkMode() ? 'Light Mode' : 'Dark Mode'"
      severity="secondary"
      (onClick)="toggle()"
      [attr.aria-label]="
        isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'
      "
    ></p-button>
  `,
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);

  protected readonly isDarkMode = computed(
    () => this.themeService.mode() === 'dark',
  );

  protected toggle(): void {
    this.themeService.toggle();
  }
}
