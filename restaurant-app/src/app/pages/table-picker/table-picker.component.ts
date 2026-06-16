import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TablesConfigService } from '../../services/tables-config.service';
import { SessionService } from '../../services/session.service';
import { ResolvedTable } from '../../models/table.model';

@Component({
  selector: 'app-table-picker',
  templateUrl: './table-picker.component.html',
  styleUrl: './table-picker.component.scss',
})
export class TablePickerComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly tablesConfig = inject(TablesConfigService);
  private readonly sessionService = inject(SessionService);

  readonly mode = inject(ActivatedRoute).snapshot.data['mode'] as 'tables' | 'takeaway';

  readonly title = this.mode === 'takeaway' ? 'Mitnehmen' : 'Tisch wählen';

  readonly indoorTables = this.tablesConfig.getTablesForZone('indoor');
  readonly outdoorTables = this.tablesConfig.getTablesForZone('outdoor');
  readonly takeawayTables = this.tablesConfig.getTablesForZone('takeaway');

  readonly occupiedKeys = computed(() =>
    new Set(
      this.sessionService.sessions()
        .filter(s => s.status !== 'completed')
        .map(s => s.tableKey)
    )
  );

  isOccupied(key: string): boolean {
    return this.occupiedKeys().has(key);
  }

  selectTable(table: ResolvedTable): void {
    this.router.navigate(['/table', table.key]);
  }

  back(): void {
    this.location.back();
  }
}
