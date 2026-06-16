import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WaiterNameService } from '../../services/waiter-name.service';

@Component({
  selector: 'app-name-dialog',
  imports: [FormsModule],
  templateUrl: './name-dialog.component.html',
  styleUrl: './name-dialog.component.scss',
})
export class NameDialogComponent {
  readonly waiterName = inject(WaiterNameService);

  name = this.waiterName.name() ?? '';

  get canConfirm(): boolean {
    return this.name.trim().length > 0;
  }

  confirm(): void {
    if (!this.canConfirm) return;
    this.waiterName.setName(this.name);
  }

  cancel(): void {
    this.waiterName.cancelEditing();
  }
}
