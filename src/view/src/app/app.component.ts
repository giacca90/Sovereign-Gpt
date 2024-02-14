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
  terminal:boolean = true;
  terminalMessage:string = '';

  constructor(public IPC:IpcService, private cdr: ChangeDetectorRef) {
    IPC.send("Start");
    IPC.on("StatusStart", (_event: any, status:number) => {
      this.status = status;
      this.cdr.detectChanges();
    })

    IPC.on("terminalMessage", (_event: any, message:string) => {
      this.terminalMessage = message;
      this.cdr.detectChanges();
    })
  }

  InstallDocker() { 
    document.getElementById('button')?.setAttribute("unable", 'true');
    this.IPC.send("InstallDocker");
    this.cdr.detectChanges();
  }

  InstallOllama() {
    document.getElementById('button')?.setAttribute("unable", 'true');
    this.terminal === true;
    this.IPC.send("InstallOllama");
    this.cdr.detectChanges();
  }

  closeTerminal() {
    this.terminal = false;
    this.cdr.detectChanges();
  }
}
