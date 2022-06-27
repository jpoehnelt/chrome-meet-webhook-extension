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

import { State } from "./runner";

export interface Webhook {
  url: string;
  method?: string;
  cors: RequestMode;
}

export const PLACEHOLDER_WEBHOOK = { url: "" };

export const interpolate = (url: string, state: State) => {
  const names = Object.keys(state);
  const vals = Object.values(state);
  return new Function(...names, `return \`${url}\`;`)(...vals);
};

export function renderBody(state: State): string {
  return JSON.stringify(state);
}

export function send(state: State, webhook: Webhook): Promise<Response> {
  let options: RequestInit;

  const url = interpolate(webhook.url, state);

  switch (webhook.method) {
    case "GET":
      options = {
        method: "GET",
        mode: webhook.cors,
      };
      break;
    case "POST":
    default:
      options = {
        method: "POST",
        body: renderBody(state),
        mode: webhook.cors,
        headers: {
          "Content-Type": "application/json",
        },
      };
  }

  return fetch(url, options);
}
