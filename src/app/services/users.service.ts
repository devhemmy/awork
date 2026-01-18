import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ApiResult } from '../models/api-result.model';
import { UserGroup } from '../models/user.model';
import { UserResult } from '../models/api-result.model';

interface CacheEntry {
  page: number;
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

  private readonly DB_NAME = 'awork_users_db';
  private readonly STORE_NAME = 'users_cache';
  private readonly DB_VERSION = 1;
  private readonly CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

  private db: IDBDatabase | null = null;
  private dbReady: Promise<void>;

  constructor(private httpClient: HttpClient) {
    this.initWorker();
    this.dbReady = this.initIndexedDB();
  }

  private initWorker() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('../app.worker', import.meta.url));
    }
  }

  private initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        resolve();
        return;
      }

      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.warn('IndexedDB not available, caching disabled');
        resolve();
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.loadCacheFromDB().then(resolve);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'page' });
        }
      };
    });
  }

  private async loadCacheFromDB(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(this.STORE_NAME, 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result as CacheEntry[];
        const now = Date.now();

        entries.forEach((entry) => {
          if (now - entry.timestamp < this.CACHE_DURATION_MS) {
            this.pageCache.set(entry.page, entry);
          } else {
            this.deleteFromDB(entry.page);
          }
        });
        resolve();
      };

      request.onerror = () => resolve();
    });
  }

  private saveToDB(entry: CacheEntry): void {
    if (!this.db) return;

    const transaction = this.db.transaction(this.STORE_NAME, 'readwrite');
    const store = transaction.objectStore(this.STORE_NAME);
    store.put(entry);
  }

  private deleteFromDB(page: number): void {
    if (!this.db) return;

    const transaction = this.db.transaction(this.STORE_NAME, 'readwrite');
    const store = transaction.objectStore(this.STORE_NAME);
    store.delete(page);
  }

  private isCacheValid(page: number): boolean {
    const entry = this.pageCache.get(page);
    if (!entry) return false;

    const now = Date.now();
    return now - entry.timestamp < this.CACHE_DURATION_MS;
  }

  loadUsers(page = 1): Observable<void> {
    const loadedSubject = new Subject<void>();

    this.dbReady.then(() => {
      if (this.isCacheValid(page)) {
        this.currentPageData = this.pageCache.get(page)!.data;
        loadedSubject.next();
        loadedSubject.complete();
        return;
      }

      this.httpClient
        .get<ApiResult>(`${this.apiUrl}?results=5000&seed=awork&page=${page}`)
        .subscribe({
          next: (res) => {
            const entry: CacheEntry = {
              page,
              data: res.results,
              timestamp: Date.now(),
            };
            this.pageCache.set(page, entry);
            this.currentPageData = res.results;

            this.saveToDB(entry);

            loadedSubject.next();
            loadedSubject.complete();
          },
          error: (err) => loadedSubject.error(err),
        });
    });

    return loadedSubject.asObservable();
  }

  clearCache() {
    this.pageCache.clear();

    if (this.db) {
      const transaction = this.db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      store.clear();
    }
  }

  private getAllCachedUsers(): UserResult[] {
    const allUsers: UserResult[] = [];

    const sortedPages = Array.from(this.pageCache.keys()).sort((a, b) => a - b);

    for (const page of sortedPages) {
      const entry = this.pageCache.get(page);
      if (entry && this.isCacheValid(page)) {
        allUsers.push(...entry.data);
      }
    }

    return allUsers;
  }

  getTotalLoadedUsers(): number {
    return this.getAllCachedUsers().length;
  }

  getLoadedPages(): number[] {
    return Array.from(this.pageCache.keys())
      .filter((page) => this.isCacheValid(page))
      .sort((a, b) => a - b);
  }

  processUsers(
    groupBy: 'nat' | 'alpha',
    filterTerm: string = ''
  ): Observable<{ groupedUsers: UserGroup[] }> {
    const resultSubject = new Subject<{ groupedUsers: UserGroup[] }>();

    const usersToProcess = filterTerm.trim()
      ? this.getAllCachedUsers()
      : this.currentPageData;

    if (this.worker && usersToProcess.length) {
      this.worker.postMessage({
        action: 'PROCESS_USERS',
        users: usersToProcess,
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
