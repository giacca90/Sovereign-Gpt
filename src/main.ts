/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { app, BrowserWindow , screen, Menu, ipcMain} from "electron";
import * as path from "path";
import * as os from "os";
import { exec } from 'child_process';
import * as sudoPrompt from 'sudo-prompt';

function createWindow() {
  // Create the browser window.
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
//    icon: path.join(__dirname, 'favicon.ico'),
    webPreferences: {
      zoomFactor: 1.5,
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("../src/view/dist/browser/index.html");

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
  mainWindow.webContents.on('did-frame-finish-load', () => {
    mainWindow.webContents.setZoomFactor(1.5); 
  });

  ipcMain.on("Start",(_event:any) => {
    if(os.platform() === "win32"){
      exec('dir', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error en la ejecución del comando (Windows): ${error}`);
          return;
        }
      
        console.log('Resultado (Windows):');
        console.log(stdout);
      });
    }else if(os.platform() === "linux") {
      exec('docker -v', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error en la ejecución del comando (Linux): ${error}`);
          return;
        }
      
        console.log('Resultado (Linux):');
        console.log(stdout);
      });
    }
  })

  ipcMain.on("Install", (_event) => {
    if(os.platform() === "win32") {
      sudoPrompt.exec("")
    }else if(os.platform() === "linux") {
      sudoPrompt.exec("apt update; sudo apt install apt-transport-https ca-certificates curl software-properties-common", {name: "SovereignGPT"}, (error, stdout, stderr) => {
        if(error) {
          console.error("Error en sudo apt update y instalación de dependencias: "+error);
        }else{
          console.log("Respuesta a sudo apt update:\n"+stdout);
          sudoPrompt.exec('curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg; sudo echo "deb [signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu lunar stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null', {name: "SovereignGPT"}, (error, stdout, stderr) => {
            if(error) {
              console.error("Error al configurar el repositorio de Docker: "+error);
            }else{
              console.log("Respuesta al configurar el repositorio de Docker:\n"+stdout);
              sudoPrompt.exec('apt update; sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin', {name: "SovereignGPT"}, (error, stdout, stderr) => {
                if(error) {
                  console.error("Error al instalar Docker: "+error);
                }else{
                  console.log("Respuesta de instalar Docker:\n"+stdout);
                }
              })
            }
          })

        }
      })
    }
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
Menu.setApplicationMenu(null);
