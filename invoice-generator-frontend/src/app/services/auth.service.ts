import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private currentUserSubject = new BehaviorSubject<any>(null);
    public currentUser$ = this.currentUserSubject.asObservable();
    private readonly TOKEN_KEY = 'auth_token';

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.loadUserFromToken();
    }

    private loadUserFromToken() {
        if (isPlatformBrowser(this.platformId)) {
            const token = localStorage.getItem(this.TOKEN_KEY);
            if (token) {
                // We'll just set it to non-null to unblock the UI instantly,
                // but typically you'd decode the JWT or call /api/auth/me to get real profile
                this.currentUserSubject.next({ token });

                // Optionally fetch real user data
                this.http.get(`${this.apiUrl}/me`).subscribe({
                    next: (res: any) => {
                        if (res.success) {
                            this.currentUserSubject.next(res.data);
                        }
                    },
                    error: () => {
                        this.logout();
                    }
                });
            }
        }
    }

    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData).pipe(
            tap((res: any) => {
                if (res.success && res.data.token) {
                    this.setToken(res.data.token);
                    this.currentUserSubject.next(res.data);
                }
            })
        );
    }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((res: any) => {
                if (res.success && res.data.token) {
                    this.setToken(res.data.token);
                    this.currentUserSubject.next(res.data);
                }
            })
        );
    }

    logout() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(this.TOKEN_KEY);
        }
        this.currentUserSubject.next(null);
    }

    isLoggedIn(): boolean {
        if (isPlatformBrowser(this.platformId)) {
            return !!localStorage.getItem(this.TOKEN_KEY);
        }
        return false;
    }

    getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem(this.TOKEN_KEY);
        }
        return null;
    }

    private setToken(token: string) {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.TOKEN_KEY, token);
        }
    }
}
