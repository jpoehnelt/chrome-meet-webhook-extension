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
        cors: "no-cors",
      },
      change: {
        url: "POST https://foo.bar.com?active=${input.camera === 'active' ? true : false}",
        cors: "no-cors",
      },
      "input.camera.active": {
        url: "https://foo.bar.com",
        cors: "cors",
      },
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
          "cors": "no-cors",
          "method": "POST",
          "url": "https://foo.bar.com?active=\${input.camera === 'active' ? true : false}",
        },
        "input.active": {
          "cors": "no-cors",
          "url": "",
        },
        "input.camera.active": {
          "cors": "cors",
          "url": "https://foo.bar.com",
        },
        "input.camera.change": {
          "cors": "no-cors",
          "url": "",
        },
        "input.camera.inactive": {
          "cors": "no-cors",
          "url": "",
        },
        "input.change": {
          "cors": "no-cors",
          "url": "https://foo.bar.com?active=\${input.camera === 'active' ? true : false}",
        },
        "input.inactive": {
          "cors": "no-cors",
          "url": "",
        },
        "input.microphone.active": {
          "cors": "no-cors",
          "url": "",
        },
        "input.microphone.change": {
          "cors": "no-cors",
          "url": "",
        },
        "input.microphone.inactive": {
          "cors": "no-cors",
          "url": "",
        },
      },
    }
  `);
});
