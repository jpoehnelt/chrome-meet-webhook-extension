import { Webhook } from "./webhook";

export const CONFIG_STORAGE_KEY = "config";

export type Events =
  | "change"
  | "input.change"
  | "input.active"
  | "input.inactive"
  | "input.camera.change"
  | "input.camera.active"
  | "input.camera.inactive"
  | "input.microphone.change"
  | "input.microphone.active"
  | "input.microphone.inactive";

export const EVENTS = [
  "change",
  "input.change",
  "input.active",
  "input.inactive",
  "input.camera.change",
  "input.camera.active",
  "input.camera.inactive",
  "input.microphone.change",
  "input.microphone.active",
  "input.microphone.inactive",
];

export const DEFAULT_CONFIG = {
  webhooks: Object.fromEntries(EVENTS.map((e) => [e, { url: "" }])),
} as Config;

export interface Config {
  webhooks: { [key: string]: Webhook };
}

export function getConfig(): Promise<Config> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        config: DEFAULT_CONFIG,
      },
      (items) => {
        const config = { ...DEFAULT_CONFIG, ...items.config };
        config.webhooks = { ...DEFAULT_CONFIG.webhooks, ...config.webhooks };

        for (const key in config.webhooks) {
          const parts = config.webhooks[key].url.trim().split(" ");

          if (parts.length > 1) {
            config.webhooks[key].url = parts.slice(1, parts.length).join(" ");
            config.webhooks[key].method = parts[0].toUpperCase();
          }
        }
        
        resolve(config);
      }
    );
  });
}

export function setConfig(config: Config): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set(
      {
        config,
      },
      () => {
        resolve();
      }
    );
  });
}
