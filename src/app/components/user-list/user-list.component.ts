import { Component, input, OnChanges, SimpleChanges } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { User, UserGroup } from '../../models/user.model';
import { UserItemComponent } from '../user-item/user-item.component';

type ListItem =
  | { type: 'header'; title: string }
  | { type: 'user'; user: User };

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  imports: [UserItemComponent, ScrollingModule],
})
export class UserListComponent implements OnChanges {
  userGroups = input.required<UserGroup[]>();

  virtualItems: ListItem[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userGroups'] && this.userGroups()) {
      this.flattenData();
    }
  }

  private flattenData() {
    const flat: ListItem[] = [];

    this.userGroups().forEach((group) => {
      flat.push({ type: 'header', title: group.title });

      group.users.forEach((user) => {
        flat.push({ type: 'user', user: user });
      });
    });

    this.virtualItems = flat;
  }
}
