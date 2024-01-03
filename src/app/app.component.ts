import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { slideFromTopAnimation } from './animations';
import { DatabaseService } from './services/database.service';
import { HdrLoaderService } from './services/hdr-loader.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    slideFromTopAnimation
  ]
})
export class AppComponent {
  title = '7cs-skybox';

  constructor(
    private contexts: ChildrenOutletContexts, 
    private databaseService: DatabaseService,    
  ) {}

  ngOnInit() {
    // open database
    this.databaseService.openDatabase('sessionDatabase', 1)
      .then(() => {
        console.log('Database opened successfully');

        // Fetch the last session
        // this.databaseService.getLastSession().then((lastSession: Session | null) => {
        //   if (lastSession) {
        //     console.log('Last session retrieved:', lastSession);
        //     // Do something with the last session, e.g., update your UI
        //   } else {
        //     console.log('No previous session found.');
        //   }
        // });

        // this.databaseService.clearDatabase()

      })
      .catch(() => {
        console.error('Error opening database');
      });
    
  }

  
  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
