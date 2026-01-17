import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User, UserGroup } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersServiceStub {
  getUsers(
    page = 1
  ): Observable<{ allUsers: User[]; groupedUsers: UserGroup[] }> {
    return of({ allUsers: [], groupedUsers: [] });
  }
}
