import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserGroup } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersServiceStub {
  loadUsers(page = 1): Observable<void> {
    return of(undefined);
  }

  processUsers(
    groupBy: 'nat' | 'alpha',
    filterTerm: string = ''
  ): Observable<{ groupedUsers: UserGroup[] }> {
    return of({ groupedUsers: [] });
  }

  getTotalLoadedUsers(): number {
    return 0;
  }

  getLoadedPages(): number[] {
    return [];
  }

  clearCache(): void {}
}
