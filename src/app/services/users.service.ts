import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ApiResult } from '../models/api-result.model';
import { UserGroup } from '../models/user.model';
import { UserResult } from '../models/api-result.model';

interface CacheEntry {
  data: UserResult[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = 'https://randomuser.me/api';
  private worker: Worker | undefined;

  private pageCache = new Map<number, CacheEntry>();
  private currentPageData: UserResult[] = [];

  private readonly CACHE_KEY = 'awork_users_cache';
  private readonly CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

  constructor(private httpClient: HttpClient) {
    this.initWorker();
    this.loadCacheFromStorage();
  }

  private initWorker() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('../app.worker', import.meta.url));
    }
  }

  private loadCacheFromStorage() {
    try {
      const stored = localStorage.getItem(this.CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, CacheEntry>;
        const now = Date.now();

        Object.entries(parsed).forEach(([page, entry]) => {
          if (now - entry.timestamp < this.CACHE_DURATION_MS) {
            this.pageCache.set(Number(page), entry);
          }
        });
      }
    } catch {
      this.pageCache.clear();
    }
  }

  private saveCacheToStorage() {
    try {
      const cacheObj: Record<string, CacheEntry> = {};
      this.pageCache.forEach((entry, page) => {
        cacheObj[page] = entry;
      });
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheObj));
    } catch {
      // Storage might be full or disabled - continue without persistence
    }
  }

  private isCacheValid(page: number): boolean {
    const entry = this.pageCache.get(page);
    if (!entry) return false;

    const now = Date.now();
    return now - entry.timestamp < this.CACHE_DURATION_MS;
  }

  loadUsers(page = 1): Observable<void> {
    const loadedSubject = new Subject<void>();

    if (this.isCacheValid(page)) {
      this.currentPageData = this.pageCache.get(page)!.data;
      setTimeout(() => {
        loadedSubject.next();
        loadedSubject.complete();
      }, 0);
      return loadedSubject.asObservable();
    }

    this.httpClient
      .get<ApiResult>(`${this.apiUrl}?results=5000&seed=awork&page=${page}`)
      .subscribe({
        next: (res) => {
          const entry: CacheEntry = {
            data: res.results,
            timestamp: Date.now(),
          };
          this.pageCache.set(page, entry);
          this.currentPageData = res.results;

          this.saveCacheToStorage();

          loadedSubject.next();
          loadedSubject.complete();
        },
        error: (err) => loadedSubject.error(err),
      });

    return loadedSubject.asObservable();
  }

  clearCache() {
    this.pageCache.clear();
    localStorage.removeItem(this.CACHE_KEY);
  }

  processUsers(
    groupBy: 'nat' | 'alpha',
    filterTerm: string = ''
  ): Observable<{ groupedUsers: UserGroup[] }> {
    const resultSubject = new Subject<{ groupedUsers: UserGroup[] }>();

    if (this.worker && this.currentPageData.length) {
      this.worker.postMessage({
        action: 'PROCESS_USERS',
        users: this.currentPageData,
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
