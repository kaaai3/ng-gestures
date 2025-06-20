import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SwipeDownDirective } from 'gestures';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SwipeDownDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'demo';

  log() {
    console.log('swipy close')
  }
}
