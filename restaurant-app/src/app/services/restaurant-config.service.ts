import { Injectable } from '@angular/core';
import restaurantConfig from '@config/restaurant.config.json';

@Injectable({ providedIn: 'root' })
export class RestaurantConfigService {
  readonly config = restaurantConfig;
}
