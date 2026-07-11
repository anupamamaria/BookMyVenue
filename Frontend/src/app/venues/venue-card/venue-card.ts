import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserDashboardVenueDTO } from '../../shared/models/venue';
import { MatIconModule } from '@angular/material/icon';
import { SearchService } from '../../shared/search.service';

@Component({
  selector: 'app-venue-card',
  imports: [CommonModule, RouterLink,MatIconModule],
  templateUrl: './venue-card.html',
  styleUrl: './venue-card.scss',
})
export class VenueCard {
  @Input() venue!: UserDashboardVenueDTO;
}
