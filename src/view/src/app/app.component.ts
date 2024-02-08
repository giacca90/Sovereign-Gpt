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
  docker:boolean = false;
  ollama:boolean = false;

  constructor(public IPC:IpcService, private cdr: ChangeDetectorRef) {
    IPC.send("Start");
    IPC.on("StatusStart", (_event: any, status:number) => {
      if(status === 1) {
        this.docker = true;
        this.cdr.detectChanges();
      }else if (status === 2) {
        this.docker = true;
        this.ollama = true;
        this.cdr.detectChanges();
      }
    })
  }

  InstallDocker() {
    this.IPC.send("InstallDocker");
  }

  InstallOllama() {
    this.IPC.send("InstallOllama");
  }
}
