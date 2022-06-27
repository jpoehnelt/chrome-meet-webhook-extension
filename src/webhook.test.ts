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

import { it, expect, vi, Mock } from "vitest";
import { interpolate, send } from "./webhook";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      fetch: unknown;
    }
  }
}

it("should interpolate url given state", () => {
  const url =
    "https://foo.bar.com?active=${input.camera === 'active' ? true : false}";
  expect(
    interpolate(url, {
      id: "foo",
      timestamp: 0,
      input: { camera: "active", microphone: "active" },
    })
  ).toEqual("https://foo.bar.com?active=true");
});

it("should send POST", () => {
  global.fetch = vi.fn().mockReturnValue(Promise.resolve());
  const webhook = {
    url: "https://foo.bar.com",
    method: "POST",
    cors: "no-cors" as const,
  };
  send(
    {
      id: "foo",
      timestamp: 0,
      input: { camera: "active", microphone: "active" },
    },
    webhook
  );

  expect((global.fetch as Mock).mock.calls[0]).toMatchInlineSnapshot(`
    [
      "https://foo.bar.com",
      {
        "body": "{\\"id\\":\\"foo\\",\\"timestamp\\":0,\\"input\\":{\\"camera\\":\\"active\\",\\"microphone\\":\\"active\\"}}",
        "headers": {
          "Content-Type": "application/json",
        },
        "method": "POST",
        "mode": "no-cors",
      },
    ]
  `);
});

it("should send GET", () => {
  global.fetch = vi.fn().mockReturnValue(Promise.resolve());
  const webhook = {
    url: "https://foo.bar.com",
    method: "GET",
    cors: "no-cors" as const,
  };
  send(
    {
      id: "foo",
      timestamp: 0,
      input: { camera: "active", microphone: "active" },
    },
    webhook
  );

  expect((global.fetch as Mock).mock.calls[0]).toMatchInlineSnapshot(`
    [
      "https://foo.bar.com",
      {
        "method": "GET",
        "mode": "no-cors",
      },
    ]
  `);
});
