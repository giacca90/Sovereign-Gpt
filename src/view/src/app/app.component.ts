/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IpcService } from './services/ipc-service.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  
  status:number = 0;

  constructor(public IPC:IpcService, private cdr: ChangeDetectorRef) {
    IPC.send("Start");
    IPC.on("StatusStart", (_event: any, status:number) => {
      this.status = status;
      this.cdr.detectChanges();
    })
  }

  InstallDocker() {
    this.IPC.send("InstallDocker");
  }

  InstallOllama() {
    this.IPC.send("InstallOllama");
  }
}
