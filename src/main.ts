/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { app, BrowserWindow, screen, Menu, ipcMain } from "electron";
import * as path from 'path';
import * as os from "os";
import { exec, spawn } from "child_process";
import * as sudoPrompt from "sudo-prompt";
import * as http from 'http';

interface RequestData {
  model: string;
  prompt: string;
  stream: boolean;
}

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
  //  mainWindow.loadFile("../src/view/dist/browser/index.html");
  mainWindow.loadFile(path.join(__dirname, '../src/view/dist/browser/index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  mainWindow.webContents.on("did-frame-finish-load", () => {
    mainWindow.webContents.setZoomFactor(1.5);
  });

  ipcMain.on("Start", (_event: any) => {
    exec("docker --version", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error en la ejecución del comando docker --version: ${error}`);
        sendMessage(`Error en la ejecución del comando docker --version: ${error}`);
        return;
      }
      console.log("Resultado docker --version:");
      console.log(stdout);
      sendMessage(stdout);
      mainWindow.webContents.send("StatusStart", 1);
      exec("docker ps -a", (error, stdout, stderr) => {
        if (error) {
          console.error(`Error en la ejecución del comando docker ps -a: ${error}`);
          sendMessage(`Error en la ejecución del comando docker ps -a: ${error}`);
          return;
        }
        console.log("Resultado docker ps -a:");
        console.log(stdout);
        sendMessage(stdout);
        if(stdout.includes("ollama")) {
          mainWindow.webContents.send("StatusStart", 2);
          const spa = spawn('docker', ['start', 'ollama']);
          spa.stdout.on('data', (data) => {
            console.log('stdout: '+data.toString());
            sendMessage(data.toString());
          });
          spa.stderr.on('data', (data) => {
            console.error('stderr: '+data.toString());
            sendMessage(data.toString());
          });
          spa.on('exit', (code) => {
            if (code === 0) {
              console.log('El modelo base se ejecutó correctamente.');
              sendMessage('El modelo base se ejecutó correctamente.');
              const spa = spawn('docker', ['exec', 'ollama', 'ollama', 'run', 'llama2']);
              spa.stdout.on('data', (data) => {
                console.log(data.toString());
                sendMessage(data.toString());
              });
              spa.stderr.on('data', (data) => {
                console.error(data.toString());
                sendMessage(data.toString());
              });
              spa.on('exit', (code) => {
                if (code === 0) {
                  console.log('El modelo se ejecutó correctamente.');
                  sendMessage('El modelo Docker se ejecutó correctamente.');
                  mainWindow.webContents.send("StatusStart", 3);
                } else {
                  console.error(`Error al ejecutar el contenedor Docker: código de salida ${code}`);
                  sendMessage(`Error al ejecutar el contenedor Docker: código de salida ${code}`)
                }
              });
            } else {
              console.error(`Error al ejecutar el modelo: código de salida ${code}`);
              sendMessage(`Error al ejecutar el modelo: código de salida ${code}`)
            }
          })
        }
      })
    });
  });  

  ipcMain.on("InstallDocker", (_event) => {
    if (os.platform() === "win32") {
      const spa = spawn('wsl', ['--install']);
      spa.stdin.write("user\n");
      spa.stdin.write("user\n");
      spa.stdin.write("user\n");
      spa.stdout.on('data', (data) => {
        console.log('stdout: '+data.toString());
        sendMessage(data.toString());
      });
      spa.stderr.on('data', (data) => {
        console.error('stderr: '+data.toString());
        sendMessage(data.toString());
      });
      spa.on('exit', (code) => {
        if(code === 0) {
          console.log("WSL instalado sin problemas!!");
          sendMessage("WSL instalado sin problemas!!");
          const spa = spawn('curl', ['-L', 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe', '-o', `${process.env.USERPROFILE}\\DockerDesktopInstaller.exe`], { shell: true });
          spa.stdout.on('data', (data) => {
            console.log('stdout: '+data.toString());
            sendMessage(data.toString());
          });
          spa.stderr.on('data', (data) => {
            console.error('stderr: '+data.toString());
            sendMessage(data.toString());
          });
          spa.on('exit', (code) => {
            if (code === 0) {
              console.log('Docker se ha descargado correctamente.');
              sendMessage('Docker se ha descargado correctamente.');
              const spa = spawn ('start',['/wait', '""','"'+process.env.USERPROFILE+'\\DockerDesktopInstaller.exe"']);
              spa.stdout.on("data", (data) => {
                console.log('stdout: '+data.toString());
                sendMessage(data.toString());
              });
              spa.stderr.on("data", (data) => {
                console.error('stderr: '+data.toString());
                sendMessage(data.toString());
              });
              spa.on('exit', (code:number) => {
                if(code === 0) {
                  sendMessage('Reiniciar el Equipo despues de Instalar Docker!!!');
                }else{
                  console.error('Error en instalar Docker. '+code);
                  sendMessage('Error en instalar Docker. '+code)
                }
              })
            } else {
              console.error("Error en descargar Docker: "+code);
              sendMessage("Error en descargar Docker: "+code);
            }
          })
        } else {
          console.error("Error en instalar WSL: "+code);
          sendMessage("Error en instalar WSL: "+code);
        }
      })
    } else if (os.platform() === "linux") {
      sendMessage('Esparando permisos...');
      sudoPrompt.exec(
        "apt update; sudo apt install apt-transport-https ca-certificates curl software-properties-common",
        { name: "SovereignGPT" },
        (error, stdout, stderr) => {
          if (error) {
            console.error(
              "Error en sudo apt update y instalación de dependencias: " + error
            );
            sendMessage("Error en sudo apt update y instalación de dependencias: " + error);
          } else {
            console.log("Respuesta a sudo apt update:\n" + stdout);
            sendMessage('Esparando permisos...');
            sudoPrompt.exec(
              'curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo -y gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg; sudo echo "deb [signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu lunar stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null',
              { name: "SovereignGPT" },
              (error, stdout, stderr) => {
                if (error) {
                  console.error(
                    "Error al configurar el repositorio de Docker: " + error
                  );
                } else {
                  console.log(
                    "Respuesta al configurar el repositorio de Docker:\n" +
                      stdout
                  );
                  sendMessage('Esparando permisos...');
                  sudoPrompt.exec(
                    "apt update; sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin; sudo usermod -aG docker $USER",
                    { name: "SovereignGPT" },
                    (error, stdout, stderr) => {
                      if (error) {
                        console.error("Error al instalar Docker: " + error);
                      } else {
                        console.log("Respuesta de instalar Docker:\n" + stdout);
                        mainWindow.webContents.send("StatusStart", 1);
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  });

// docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
  ipcMain.on("InstallOllama", (_event) => {
    const spa = spawn('docker', ['run', '-d', '-v', 'ollama:/root/.ollama', '-p', '11434:11434', '--name', 'ollama', 'ollama/ollama']);
    spa.stdout.on('data', (data) => {
      console.log('stdout: '+data.toString());
      sendMessage(data.toString());
    });
    spa.stderr.on('data', (data) => {
      console.error('stderr: '+data.toString());
      sendMessage(data.toString());
    });
    spa.on('exit', (code) => {
      if (code === 0) {
        console.log('El contenedor Docker se configuó correctamente.');
        sendMessage('El contenedor Docker se configuró correctamente.');
        mainWindow.webContents.send("StatusStart", 2);
        const spa = spawn('docker', ['exec', 'ollama', 'ollama', 'run', 'llama2']);
        spa.stdout.on('data', (data) => {
          console.log('stdout: '+data.toString());
          sendMessage(data.toString());
        });
        spa.stderr.on('data', (data) => {
          console.error('stderr: '+data.toString());
          sendMessage(data.toString());
        });
        spa.on('exit', (code) => {
          if (code === 0) {
            console.log('El modelo se ejecutó correctamente.');
            sendMessage('El modelo se ejecutó correctamente.');
            mainWindow.webContents.send("StatusStart", 3);
          } else {
            console.error(`Error al ejecutar el contenedor Docker: código de salida ${code}`);
            sendMessage(`Error al ejecutar el contenedor Docker: código de salida ${code}`);
          }
        }); 
      } else {
        console.error(`Error al ejecutar el contenedor Docker: código de salida ${code}`);
        sendMessage(`Error al ejecutar el contenedor Docker: código de salida ${code}`);
      }
    });
  });

  ipcMain.on("pregunta", (_event:any, pregunta:string) => {

    const apiUrl = 'http://localhost:11434/api/generate';
    const requestData: RequestData = {
      model: 'llama2',
      prompt: pregunta,
      stream: true,
    };
    // Convierte el objeto de datos en una cadena JSON
    const dataString:string = JSON.stringify(requestData);

    // Configura las opciones de la solicitud
    const options: http.RequestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString),
      },
    };

    const request: http.ClientRequest = http.request(apiUrl, options, (response) => {
      // Manejar el flujo de datos en tiempo real
      response.on('data', (chunk) => {
        console.log(chunk.toString());
        mainWindow.webContents.send('respuesta', chunk.toString());
      });
    
      // Manejar la finalización de la solicitud
      response.on('end', () => {
        console.log('Solicitud completada');
      });
    });
    // Enviar datos en el cuerpo de la solicitud
    request.write(dataString);

    // Finalizar la solicitud
    request.end();
  })

  function sendMessage(message:string) {
    const mex:string = message.replace(/\033\[[0-9;?]*[a-zA-Z0-9]/g, '')
    mainWindow.webContents.send("terminalMessage", mex);
  }

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
