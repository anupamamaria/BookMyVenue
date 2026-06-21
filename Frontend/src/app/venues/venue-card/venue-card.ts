import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Venue } from '../../shared/models/venue';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-venue-card',
  imports: [CommonModule, RouterLink,MatIconModule],
  templateUrl: './venue-card.html',
  styleUrl: './venue-card.scss',
})
export class VenueCard {
  @Input() venue!: Venue;
}
