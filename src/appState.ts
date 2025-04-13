import fs, { mkdir } from "node:fs/promises";
import path from "node:path";

export type AppState = {
  accessToken: string;
  refreshToken: string;
  apiKeys: Record<string, string>;
};

const DEFAULT_APP_STATE: AppState = {
  accessToken: "",
  refreshToken: "",
  apiKeys: {},
};

const home = process.env.HOME || process.env.USERPROFILE;

if (!home) {
  throw new Error("Could not find home directory");
}

const STORAGE_PATH = path.join(home, ".algolia-mcp");
const APP_STATE_PATH = path.join(STORAGE_PATH, "state.json");

export class AppStateManager {
  #appState: AppState;

  static async load() {
    await mkdir(STORAGE_PATH, { recursive: true });

    let content: Partial<AppState> = {};

    try {
      content = JSON.parse(
        await fs.readFile(APP_STATE_PATH, "utf-8")
      ) as Partial<AppState>;
    } catch {}

    return new AppStateManager({ ...DEFAULT_APP_STATE, ...content });
  }

  constructor(initialState: AppState) {
    this.#appState = initialState;
  }

  get<K extends keyof AppState>(key: K): AppState[K] {
    return this.#appState[key];
  }

  async update(update: Partial<AppState>) {
    this.#appState = { ...this.#appState, ...update };
    await fs.writeFile(APP_STATE_PATH, JSON.stringify(this.#appState));
  }
}
