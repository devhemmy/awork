import { Component, input, OnChanges, SimpleChanges, ViewChild, signal } from '@angular/core';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
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
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  userGroups = input.required<UserGroup[]>();

  virtualItems: ListItem[] = [];
  showScrollTop = signal(false);

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

  onScroll() {
    const offset = this.viewport?.measureScrollOffset('top') || 0;
    this.showScrollTop.set(offset > 300);
  }

  scrollToTop() {
    this.viewport?.scrollToIndex(0, 'smooth');
  }
}
