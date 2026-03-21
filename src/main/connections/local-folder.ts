import { execa } from "execa";
import { BrowserWindow, dialog } from "electron";
import { basename, join } from "path";
import { ConnectionOpenProjectResponse } from "../../shared/types.js";
import { spawn } from "child_process";
import { Connection } from "./connection.js";

export class LocalFolder implements Connection {
  dir: string;
  php: string;

  constructor(dir: string, php: string) {
    this.dir = dir;
    this.php = php;
  }

  async openProject(): Promise<ConnectionOpenProjectResponse> {
    try {
      const { all } = await execa(this.php, ["artisan", "--format=json"], { cwd: this.dir, all: true, buffer: true });
      if (all?.includes("Laravel")) {
        return { success: true, output: all, basename: basename(this.dir) };
      } else {
        console.log(`Error opening project in ${this.dir}`);
        console.error(all);
        if (all?.includes("Could not open input file: artisan")) {
          dialog.showErrorBox("Error opening project", `${this.dir} - This folder is not a Laravel project. Please create a Laravel project and then open it.`);
        } else {
          dialog.showErrorBox("Error opening project", all ?? "unknown");
        }
        return { success: false };
      }
    } catch (e: any) {
      console.warn(`Error opening project in ${this.dir}`);
      console.log(e);
      if (e.all.includes("Could not open input file: artisan")) {
        dialog.showErrorBox("Error opening project", `${this.dir} - This folder is not a Laravel project. Please create a Laravel project and then open it.`);
      } else {
        dialog.showErrorBox("Error opening project", e.all);
      }
      return { success: false };
    }
  }

  async artisan(fullCommand: string): Promise<string> {
    try {
      const { all } = await execa(this.php, ["artisan", ...fullCommand, "--no-interaction", "--ansi"], { cwd: this.dir, all: true, buffer: true });
      return all ?? "";
    } catch (e: any) {
      console.log(`Error executing artisan command in ${this.dir}: ${fullCommand}`);
      console.error(e);
      return e.all;
    }
  }

  startServe(): number | undefined {
    const serve = spawn(this.php, ["artisan", "serve"], { cwd: this.dir });
    serve.stdout.on("data", (data) => {
      if (data.includes("started")) {
        BrowserWindow.getAllWindows()[0].webContents.send("updateServeLink", data.toString().match(/(https?:\/\/[a-zA-Z0-9.]+(:[0-9]+)?)/g)[0]);
      }
    });
    return serve.pid;
  }

  async tinker(code: string): Promise<string> {
    try {
      const { stdout } = await execa(this.php, [join(__dirname, "tinker.php"), this.dir, code]);
      return stdout;
    } catch (e) {
      console.error(e);
      return e as string;
    }
  }
}
