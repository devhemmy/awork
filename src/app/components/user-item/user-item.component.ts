import { Component, input, signal } from '@angular/core';
import { User } from '../../models/user.model';
import { DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrl: './user-item.component.scss',
  imports: [DatePipe, TitleCasePipe],
})
export class UserItemComponent {
  user = input.required<User>();
  isExpanded = signal(false);

  toggle() {
    this.isExpanded.update((v) => !v);
  }
}
