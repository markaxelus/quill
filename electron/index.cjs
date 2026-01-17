const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron")
const path = require("path")
const { spawn } = require("child_process")
const fs = require("fs")

let mainWindow = null;

function getPythonPath() {
  // Check for local venv
  const venvPath = path.join(path.dirname(__dirname), ".venv", "Scripts", "python.exe");
  if (fs.existsSync(venvPath)) {
    return venvPath;
  }
  return "python"; // Fallback to system python
}

function runPythonCommand(command, payload, onData) {
  return new Promise((resolve, reject) => {
    const pythonPath = getPythonPath();
    const scriptPath = path.join(path.dirname(__dirname), "src", "api.py");

    console.log(`Spawning Python: ${pythonPath} ${scriptPath}`);

    const pyProcess = spawn(pythonPath, [scriptPath]);

    // Send input
    const input = JSON.stringify({ command, payload }) + "\n";
    pyProcess.stdin.write(input);
    pyProcess.stdin.end(); // We only send one command per process for now

    let resultBuffer = "";

    pyProcess.stdout.on("data", (data) => {
      const lines = data.toString().split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.type === 'progress') {
            onData && onData(json);
          } else if (json.type === 'complete') {
            resolve(json);
          } else {
            // Standard response
            if (json.status === 'error') {
              reject(new Error(json.message));
            } else if (json.status === 'success') {
              resolve(json.data);
            }
          }
        } catch (e) {
          console.error("Failed to parse Python output:", line);
        }
      }
    });

    pyProcess.stderr.on("data", (data) => {
      console.error(`Python Error: ${data}`);
    });

    pyProcess.on("close", (code) => {
      if (code !== 0) {
        // If we haven't resolved yet
        // reject(new Error(`Python process exited with code ${code}`));
      }
    });
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs")
    }
  });

  mainWindow = win;

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    win.loadURL(devUrl);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "/gui/index.html"));
  }
}

app.whenReady().then(() => {
  ipcMain.handle("scan-inbox", async (event, config) => {
    try {
      return await runPythonCommand("scan", config);
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  ipcMain.handle("scan-local", async (event, config) => {
    try {
      return await runPythonCommand("scan-local", config);
    } catch (e) {
      console.error(e);
      throw e;
    }
  });

  ipcMain.handle("process-jobs", async (event, { items, options }) => {
    return await runPythonCommand("process", { items, ...options }, (progress) => {
      mainWindow.webContents.send("processing-update", progress);
    });
  });

  ipcMain.handle("open-file", async (event, filePath) => {
    return shell.openPath(filePath);
  });

  ipcMain.handle("open-folder", async (event, folderPath) => {
    return shell.openPath(folderPath);
  });

  ipcMain.handle("get-user", async () => {
    try {
      return await runPythonCommand("get-user", {});
    } catch (e) {
      console.error("Failed to get user:", e);
      return "Unknown User";
    }
  });

  ipcMain.handle("select-directory", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory']
    });
    if (result.canceled) return null;
    return result.filePaths[0];
  });

  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});