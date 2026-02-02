import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import Aura from '@primeuix/themes/aura';

/**
 * Global application configuration.
 * Configures core services including HTTP client, error handling, UI component library (PrimeNG),
 * and messaging service for displaying notifications to users.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /** Enables global error event listeners for uncaught errors */
    provideBrowserGlobalErrorListeners(),
    /** Provides HTTP client for making API requests */
    provideHttpClient(),
    /** Configures PrimeNG UI component library with Aura theme */
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    /** Service for displaying toast notifications and messages */
    MessageService,
  ],
};
