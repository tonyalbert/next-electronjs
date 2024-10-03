import { app, BrowserWindow, screen } from "electron";
import serve from "electron-serve";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appServe = app.isPackaged ? serve({
    directory: path.join(__dirname, "../out")
}) : null;

const createWindow = () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize; // Tamanho da tela principal
    const displays = screen.getAllDisplays();

    // Verifica se há um segundo monitor
    const targetDisplay = displays.length > 1 ? displays[0] : null;

    const win = new BrowserWindow({
        show: false,
        fullscreen: true,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        },
        ...(targetDisplay ? {
            x: targetDisplay.bounds.x,
            y: targetDisplay.bounds.y,
            width: targetDisplay.bounds.width,
            height: targetDisplay.bounds.height
        } : {})
    });

    win.maximize();

    if (app.isPackaged) {
        appServe(win).then(() => {
            win.loadURL("app://-");
        });
    } else {
        win.loadURL("http://localhost:3000");
        // Abre o console de desenvolvimento
        //win.webContents.openDevTools();
        win.webContents.on("did-fail-load", (e, code, desc) => {
            win.webContents.reloadIgnoringCache();
        });
    }

    win.show();
}

app.on("ready", () => {
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
