import { ConnectionOpenProjectResponse } from "../../shared/types.js";

export interface Connection {
  openProject(): Promise<ConnectionOpenProjectResponse>;
  artisan(fullCommand: string): Promise<string>;
  startServe(): number | undefined;
  tinker(code: string): Promise<string>;
}
