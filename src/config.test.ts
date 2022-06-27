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

import { it, expect, vi } from "vitest";

import { Config, getConfig } from "./config";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      chrome: unknown;
    }
  }
}

it("should parse method correctly", async () => {
  const config = {
    webhooks: {
      "input.change": {
        url: "https://foo.bar.com?active=${input.camera === 'active' ? true : false}",
      },
      change: {
        url: "POST https://foo.bar.com?active=${input.camera === 'active' ? true : false}",
      },
      "input.camera.active": { url: "https://foo.bar.com" },
    },
  } as Partial<Config>;

  global.chrome = {
    storage: {
      sync: {
        get: vi.fn().mockImplementation((_, callback) => {
          callback({ config });
        }),
      } as unknown as chrome.storage.SyncStorageArea,
    } as unknown as typeof chrome.storage,
  } as unknown as typeof global.chrome;

  await expect(getConfig()).resolves.toMatchInlineSnapshot(`
    {
      "webhooks": {
        "change": {
          "method": "POST",
          "url": "https://foo.bar.com?active=\${input.camera === 'active' ? true : false}",
        },
        "input.active": {
          "url": "",
        },
        "input.camera.active": {
          "url": "https://foo.bar.com",
        },
        "input.camera.change": {
          "url": "",
        },
        "input.camera.inactive": {
          "url": "",
        },
        "input.change": {
          "url": "https://foo.bar.com?active=\${input.camera === 'active' ? true : false}",
        },
        "input.inactive": {
          "url": "",
        },
        "input.microphone.active": {
          "url": "",
        },
        "input.microphone.change": {
          "url": "",
        },
        "input.microphone.inactive": {
          "url": "",
        },
      },
    }
  `);
});
