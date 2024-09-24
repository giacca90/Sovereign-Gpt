import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		document.body.classList.add('modo-oscuro');
	}
