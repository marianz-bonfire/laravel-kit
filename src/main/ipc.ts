import { exec } from "child_process";
import { ipcMain, dialog, shell } from "electron";
import kill from "tree-kill";
import which from "which";
import { execa } from "execa";
import killSync from "./tree-kill-sync.js";
import { store } from "./store.js";
import { connectionFactory, Connection } from "./connections/index.js";

let activeConnection: Connection | null = null;

function getActiveConnection(): Connection {
  if (!activeConnection) {
    throw new Error("No active connection. Open a project first.");
  }
  return activeConnection;
}

export default async function () {
  ipcMain.on("killSync", (e, pid) => {
    killSync(pid, "SIGKILL");
  });

  ipcMain.on("dialogError", (e, message) => {
    if (message === "phpNotFound") {
      message = "php executable not found.\r\nGo to Settings and choose an executable.";
    }
    dialog.showErrorBox("Error", message);
  });

  ipcMain.handle("dialogFolder", async () => {
    const result = await dialog.showOpenDialog({
      title: "Open project...",
      buttonLabel: "Open",
      properties: ["openDirectory"]
    });
    return result;
  });

  ipcMain.handle("kill", async (e, pid) => {
    kill(pid, "SIGKILL");
  });

  ipcMain.on("showItemInFolder", (e, message) => {
    shell.showItemInFolder(message);
  });

  ipcMain.on("openInEditor", (e, dir) => {
    exec(store.get("editor"), { cwd: dir });
  });

  ipcMain.on("openExternal", (e, message) => {
    shell.openExternal(message);
  });

  ipcMain.handle("choosePhpExecutable", async () => {
    const result = await dialog.showOpenDialog({ title: "Select php executable", properties: ["openFile"] });
    return result;
  });

  ipcMain.handle("getPhpVersion", async () => {
    try {
      const { stdout } = await execa(store.get("php"), ["-v"]);
      return stdout;
    } catch (e) {
      return "PHP detection failed.";
    }
  });

  ipcMain.handle("getStore", (e, key) => {
    return store.get(key);
  });

  ipcMain.handle("setStore", (e, { key, value }) => {
    return store.set(key, value);
  });

  ipcMain.handle("openProject", async (e, factoryOptions) => {
    activeConnection = connectionFactory(factoryOptions);
    return await activeConnection.openProject();
  });

  ipcMain.handle("artisan", async (e, { fullCommand }) => {
    return await getActiveConnection().artisan(fullCommand);
  });

  ipcMain.handle("tinker", async (e, { code }) => {
    return await getActiveConnection().tinker(code);
  });

  ipcMain.handle("startServe", () => {
    return getActiveConnection().startServe();
  });

  if (store.get("php") === "") {
    try {
      const resolvedPath = await which("php");
      store.set("php", resolvedPath);
    } catch (e) {
      dialog.showErrorBox("Error", "php executable not found.\r\nGo to Settings and choose an executable.");
    }
  }
}
