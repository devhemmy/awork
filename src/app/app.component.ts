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

  ngOnInit(): void {
    this.usersService.loadUsers().subscribe(() => {
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

  setGrouping(type: 'nat' | 'alpha') {
    this.currentGroupBy = type;
    this.updateList();
  }
}

if (typeof Worker !== 'undefined') {
  // Create a new
  const worker = new Worker(new URL('./app.worker', import.meta.url));
  worker.onmessage = ({ data }) => {
    console.log(`page got message: ${data}`);
  };
  worker.postMessage('hello');
} else {
  // Web Workers are not supported in this environment.
  // You should add a fallback so that your program still executes correctly.
}
