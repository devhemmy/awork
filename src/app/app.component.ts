import { Component, OnInit, inject } from '@angular/core';
import { UsersService } from './services/users.service';
import { UserGroup } from './models/user.model';
import { UserListComponent } from './components/user-list/user-list.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [UserListComponent],
})
export class AppComponent implements OnInit {
  usersService = inject(UsersService);

  userGroups: UserGroup[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.usersService.getUsers().subscribe({
      next: (result) => {
        this.userGroups = result.groupedUsers;
        this.isLoading = false;
        console.log('Worker finished processing:', result);
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.isLoading = false;
      },
    });
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
