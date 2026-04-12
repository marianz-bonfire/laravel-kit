import { ConnectionFactoryOptions } from "../../shared/types.js";
import { Connection } from "./connection.js";
import { LocalFolder } from "./local-folder.js";

export type { Connection };
export { LocalFolder };

export function connectionFactory(options: ConnectionFactoryOptions): Connection {
  switch (options.type) {
    case "LocalFolder":
      return new LocalFolder(options.dir, options.php);
    default:
      throw new Error(`Unknown connection type: ${(options as any).type}`);
  }
}
