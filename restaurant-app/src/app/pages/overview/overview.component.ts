import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MockSessionService } from '../../services/mock-session.service';
import { ThemeService } from '../../services/theme.service';
import { TableCardComponent } from '../../components/table-card/table-card.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
  imports: [TableCardComponent],
})
export class OverviewComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly sessionService = inject(MockSessionService);
  readonly themeService = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentUserId = 'user-1';
  readonly currentUserName = 'Anna';

  readonly now = signal(Date.now());
  readonly fabOpen = signal(false);

  private readonly sessions = computed(() =>
    this.sessionService.sessions().filter(s => s.status !== 'completed')
  );

  readonly indoorSessions = computed(() =>
    this.sessions().filter(s => s.zoneId === 'indoor')
  );
  readonly outdoorSessions = computed(() =>
    this.sessions().filter(s => s.zoneId === 'outdoor')
  );
  readonly takeawaySessions = computed(() =>
    this.sessions().filter(s => s.zoneId === 'takeaway')
  );

  ngOnInit(): void {
    const id = setInterval(() => this.now.set(Date.now()), 60_000);
    this.destroyRef.onDestroy(() => clearInterval(id));
  }

  toggleFab(): void {
    this.fabOpen.update(v => !v);
  }

  closeFab(): void {
    this.fabOpen.set(false);
  }

  readonly toast = signal<string | null>(null);

  navigateTo(path: string): void {
    this.fabOpen.set(false);
    this.router.navigateByUrl(path);
  }

  startTakeaway(): void {
    this.fabOpen.set(false);
    const occupied = new Set(
      this.sessions()
        .filter(s => s.zoneId === 'takeaway')
        .map(s => s.tableKey)
    );
    for (let i = 1; i <= 5; i++) {
      if (!occupied.has(`M${i}`)) {
        this.router.navigate(['/table', `M${i}`]);
        return;
      }
    }
    this.toast.set('Alle Mitnehmen-Plätze belegt');
    setTimeout(() => this.toast.set(null), 3000);
  }
}
