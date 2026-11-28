import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Ride } from '../../../../core/models/ride.model';

@Component({
  selector: 'app-match-suggestions',
  imports: [DatePipe],
  templateUrl: './match-suggestions.component.html',
})
export class MatchSuggestionsComponent {
  readonly rides = input<Ride[]>([]);
  readonly loading = input<boolean>(false);
  readonly error = input<string | null>(null);
  readonly viewRide = output<string>();

  readonly state = computed<'loading' | 'error' | 'empty' | 'loaded'>(() => {
    if (this.loading()) {
      return 'loading';
    }
    if (this.error()) {
      return 'error';
    }
    return this.rides().length > 0 ? 'loaded' : 'empty';
  });

  onViewRide(rideId: string): void {
    this.viewRide.emit(rideId);
  }
}
