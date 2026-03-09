import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AppState } from './store';
import * as AuthActions from './store/auth/auth.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styles: [`
    .app-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .main-content {
      flex: 1;
    }
  `],
})
export class AppComponent implements OnInit {
  private store = inject(Store<AppState>);
  private router = inject(Router);

  showFooter = true;
  hideFooterRoutes = ['/exam/taking', '/auth/'];

  ngOnInit(): void {
    this.store.dispatch(AuthActions.restoreSession());

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEnd = event as NavigationEnd;
        this.showFooter = !this.hideFooterRoutes.some((route) =>
          navEnd.urlAfterRedirects.includes(route)
        );
        window.scrollTo(0, 0);
      });
  }
}
