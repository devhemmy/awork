import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { ApiResult } from '../models/api-result.model';
import { UserGroup } from '../models/user.model';
import { UserResult } from '../models/api-result.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = 'https://randomuser.me/api';
  private worker: Worker | undefined;

  private rawDataCache: UserResult[] = [];

  constructor(private httpClient: HttpClient) {
    this.initWorker();
  }

  private initWorker() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('../app.worker', import.meta.url));
    }
  }

  loadUsers(page = 1): Observable<void> {
    const loadedSubject = new Subject<void>();

    this.httpClient
      .get<ApiResult>(`${this.apiUrl}?results=5000&seed=awork&page=${page}`)
      .subscribe({
        next: (res) => {
          this.rawDataCache = res.results;
          loadedSubject.next();
          loadedSubject.complete();
        },
        error: (err) => loadedSubject.error(err),
      });

    return loadedSubject.asObservable();
  }

  processUsers(
    groupBy: 'nat' | 'alpha',
    filterTerm: string = ''
  ): Observable<{ groupedUsers: UserGroup[] }> {
    const resultSubject = new Subject<{ groupedUsers: UserGroup[] }>();

    if (this.worker && this.rawDataCache.length) {
      this.worker.postMessage({
        action: 'PROCESS_USERS',
        users: this.rawDataCache,
        groupBy: groupBy,
        filterTerm: filterTerm,
      });

      this.worker.onmessage = ({ data }) => {
        resultSubject.next(data);
      };
    }

    return resultSubject.asObservable();
  }
}
