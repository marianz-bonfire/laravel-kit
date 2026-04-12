import Store from "electron-store";

type ProjectType = {
  type: "LocalFolder";
  dir: string;
  php: string;
} | {
  type: "SSH";
  host: string;
  username: string;
  password: string;
  port: number;
  dir: string;
  php: string;
}

interface KitStore {
  recents: Array<ProjectType>;
  verbosity: number;
  env: string;
  editor: string;
  dark: boolean;
  php: string;
}

const defaults: KitStore = {
  recents: [],
  verbosity: 1,
  env: "",
  editor: "echo 'No command specified'",
  dark: true,
  php: ""
};

const store = new Store<KitStore>({ defaults });

export { KitStore, store };
