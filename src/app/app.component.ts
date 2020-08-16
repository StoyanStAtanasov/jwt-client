import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { localStorageJwtKey } from './app.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isLoggedIn = false;
  email = 'test@domain';
  password = '123456';
  jwt = '';
  isJwtExpired = false;
  jwtExpiresIn = 0;
  jwtExpireTimerId?: number;
  users = [];

  constructor(private http: HttpClient) {}

  getNewJWT(jwt: string, expiresIn: number): void {
    this.jwt = jwt;
    localStorage.setItem(localStorageJwtKey, jwt);
    this.jwtExpiresIn = expiresIn;
    // If we had an old timer clear it
    if (this.jwtExpireTimerId !== undefined) {
      clearInterval(this.jwtExpireTimerId);
      this.jwtExpireTimerId = undefined;
    }
    // Create a new timer
    this.jwtExpireTimerId = setInterval(() => {
      if (this.jwtExpiresIn <= 0) {
        clearInterval(this.jwtExpireTimerId);
        this.jwtExpireTimerId = undefined;
      } else {
        this.jwtExpiresIn--;
      }
    }, 1000);
  }

  login(): void {
    this.http
      .post('http://localhost:8080/api/login', {
        email: this.email,
        password: this.password,
      })
      .toPromise()
      .then((response) => {
        this.isLoggedIn = true;
        const resp = response as { jwt?: string; expiresIn: number };
        if (resp.jwt) {
          this.getNewJWT(resp.jwt, resp.expiresIn);
        }
        console.log(resp);
      })
      .catch((error) => {
        this.isLoggedIn = false;
        this.jwt = '';
        console.log(error);
      });
  }

  logout(): void {
    this.isLoggedIn = false;
    this.jwt = '';
    this.isJwtExpired = false;
    this.jwtExpiresIn = 0;
    clearInterval(this.jwtExpireTimerId);
    this.jwtExpireTimerId = undefined;
  }

  getUsers(): void {
    this.http
      .get('http://localhost:8080/test/users')
      // .post('http://localhost:8080/api/users', { jwt: this.jwt })
      .toPromise()
      .then((response) => {
        const resp = response as { users?: []; jwt: string; expiresIn: number };
        if (resp.jwt) {
          this.getNewJWT(resp.jwt, resp.expiresIn);
        }

        if (resp.users) {
          this.users = resp.users;
        }
        console.log(resp);
      })
      .catch((error) => {
        this.logout();
        this.users = [];
        console.log(error);
      });
  }
}
