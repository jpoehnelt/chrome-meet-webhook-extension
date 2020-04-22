import { State } from "./runner";

export interface Webhook {
  url: string;
}

export const PLACEHOLDER_WEBHOOK = { url: "" };

export function renderBody(state: State): string {
  return JSON.stringify(state);
}

export function send(state: State, webhook: Webhook): Promise<Response> {
  return fetch(webhook.url, {
    method: "POST",
    body: renderBody(state),
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
    },
  });
}
