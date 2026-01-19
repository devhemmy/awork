import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersService } from './services/users.service';
import { UserGroup } from './models/user.model';
import { UserListComponent } from './components/user-list/user-list.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [UserListComponent, FormsModule],
})
export class AppComponent implements OnInit {
  usersService = inject(UsersService);

  userGroups: UserGroup[] = [];
  isLoading = true;

  searchTerm = '';
  currentGroupBy: 'nat' | 'alpha' = 'nat';
  currentPage = 1;
  totalPages = 5;

  ngOnInit(): void {
    this.loadPage(this.currentPage);
  }

  loadPage(page: number) {
    this.isLoading = true;
    this.usersService.loadUsers(page).subscribe(() => {
      this.updateList();
    });
  }

  updateList() {
    this.usersService
      .processUsers(this.currentGroupBy, this.searchTerm)
      .subscribe((result) => {
        this.userGroups = result.groupedUsers;
        this.isLoading = false;
      });
  }

  get hasResults(): boolean {
    return (
      this.userGroups.length > 0 &&
      this.userGroups.some((group) => group.users.length > 0)
    );
  }

  setGrouping(type: 'nat' | 'alpha') {
    this.currentGroupBy = type;
    this.updateList();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadPage(page);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }
}
