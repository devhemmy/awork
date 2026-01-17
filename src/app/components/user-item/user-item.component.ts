import { Component, input } from '@angular/core';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrl: './user-item.component.scss',
})
export class UserItemComponent {
  user = input.required<User>();
}
