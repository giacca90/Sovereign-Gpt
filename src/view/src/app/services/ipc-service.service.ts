/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from "@angular/core";
import { IpcRenderer } from "electron";

@Injectable({
  providedIn: "root"
})
export class IpcService {
  private _ipc: IpcRenderer | undefined;

  constructor() {
    if (window.require) {
        this._ipc = window.require('electron').ipcRenderer;

    } else {
      console.warn('Electron\'s IPC was not loaded');
    }
  }

  public on(channel: string, listener: any): void {
    if (!this._ipc) {
      return;
    }
    this._ipc.on(channel, listener);
  }

  public send(channel: string, ...args: any[]): void {
    if (!this._ipc) {
      return;
    }
    this._ipc.send(channel, ...args);
  }

  public isElectron():boolean {
    if(!this._ipc) {
      return false;
    }
    return true;
  }

  public clear() {
    if(!this._ipc) {
      return;
    }
    this._ipc.removeAllListeners("pregunta");
    this._ipc.removeAllListeners("respuesta");
  }
}