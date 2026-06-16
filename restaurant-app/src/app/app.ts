import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { WaiterNameService } from './services/waiter-name.service';
import { NameDialogComponent } from './components/name-dialog/name-dialog.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NameDialogComponent],
  template: `
    <router-outlet />
    @if (auth.session() && (!waiterName.hasName || waiterName.isEditing())) {
      <app-name-dialog />
    }
  `,
})
export class App {
  readonly auth = inject(AuthService);
  readonly waiterName = inject(WaiterNameService);

  constructor() {
    inject(ThemeService);
  }
}
