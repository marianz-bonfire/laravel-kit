import { App } from "vue";

type ConnectionOpenProjectResponse =
  | {
      success: true;
      output: string;
      basename: string;
    }
  | { success: false };

type LocalFolderConnectionOptions = {
    type: "LocalFolder";
    dir: string;
    php: string;
  };

type ConnectionFactoryOptions = LocalFolderConnectionOptions;

declare global {
  interface Window {
    kit: ElectronInterface;
    store: StoreInterface;
    app: App<Element>;
  }

  interface ElectronInterface {
    dialogPhpNotFound(): void;
    dialogError(message: string): void;
    dialogFolder(): Promise<any>;
    kill(pid: number): void;
    showItemInFolder(fullPath: string): void;
    openInEditor(dir: string): void;
    openExternal(fullPath: string): void;
    choosePhpExecutable(): Promise<void>;
    getPhpVersion(): Promise<string>;
    buildMenu(isProject: boolean): void;
    tinker(code: string): Promise<string>;
    artisan(fullCommand: string): Promise<string>;
    openProject(options: ConnectionFactoryOptions): Promise<ConnectionOpenProjectResponse>;
    startServe(): Promise<number>;
    killSync(serve: number): void;
  }

  interface StoreInterface {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
  }
}

export { ConnectionOpenProjectResponse, ConnectionFactoryOptions, LocalFolderConnectionOptions };
