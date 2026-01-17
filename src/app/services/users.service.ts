import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ApiResult } from '../models/api-result.model';
import { User, UserGroup } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = 'https://randomuser.me/api';
  private worker: Worker | undefined;

  constructor(private httpClient: HttpClient) {
    this.initWorker();
  }

  private initWorker() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('../app.worker', import.meta.url));
    } else {
      console.warn('Web Workers are not supported in this environment.');
    }
  }

  getUsers(
    page = 1
  ): Observable<{ allUsers: User[]; groupedUsers: UserGroup[] }> {
    const resultSubject = new Subject<{
      allUsers: User[];
      groupedUsers: UserGroup[];
    }>();

    this.httpClient
      .get<ApiResult>(`${this.apiUrl}?results=5000&seed=awork&page=${page}`)
      .subscribe({
        next: (apiResult) => {
          if (this.worker) {
            this.worker.postMessage({
              action: 'PROCESS_USERS',
              users: apiResult.results,
              groupBy: 'nat',
            });

            this.worker.onmessage = ({ data }) => {
              resultSubject.next(data);
              resultSubject.complete();
            };
          }
        },
        error: (err) => resultSubject.error(err),
      });

    return resultSubject.asObservable();
  }
}
