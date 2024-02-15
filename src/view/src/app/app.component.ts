/* eslint-disable @typescript-eslint/no-unused-vars */
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
  chat:string = '';

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

  pregunta() {
    const pregunta:string = (document.getElementById('pregunta') as HTMLInputElement).value;
    const chat = document.getElementById('chat');
    console.log('Pregunta: '+pregunta);
    this.chat = '<p>Pregunta: '+pregunta+'</p>\n'+this.chat;
    if(chat) 
      chat.innerHTML = this.chat
    this.IPC.send('pregunta', pregunta);
    this.IPC.on('respuesta', (_event:any, respuesta:string) => {
      const jsonObject = JSON.parse(respuesta);
      const resp:string = jsonObject.response;
      const fin:boolean = jsonObject.done;
      console.log('Respuesta: '+resp);
      
      if(!fin) {
        let index:number = this.chat.indexOf('\n');
        const firstLine:string = this.chat.substring(0,index);
        if(firstLine.includes('Respuesta')) {
          index = this.chat.indexOf('</p>');
          this.chat = this.chat.substring(0,index)+resp+this.chat.substring(index);
        }else{
          this.chat = '<p>Respuesta: '+resp+'</p>\n'+this.chat;
        }
        if(chat) 
          chat.innerHTML = this.chat;
      }else{
        this.IPC.clear();
      }
    });
  }
}
