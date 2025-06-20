import { Component, ElementRef, ViewChild } from '@angular/core';
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

  @ViewChild('header') headerRef!: ElementRef;

  log() {
    console.log('swipy close')
  }
}
