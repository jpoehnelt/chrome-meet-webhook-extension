/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Webhook } from "./webhook";

export const CONFIG_STORAGE_KEY = "config";

export const HTTP_METHODS = ["GET", "HEAD", "POST", "PATCH", "PUT"];

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
  webhooks: Object.fromEntries(EVENTS.map((e) => [e, { url: "", cors: false }])),
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
          if (
            parts.length > 1 &&
            HTTP_METHODS.includes(parts[0].toUpperCase())
          ) {
            config.webhooks[key].method = parts[0].toUpperCase();
            config.webhooks[key].url = parts.slice(1, parts.length).join(" ");
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
