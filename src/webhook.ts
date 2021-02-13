import { State } from "./runner";

export interface Webhook {
  url: string;
  method?: string;
  cors: boolean;
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
        mode: "no-cors",
      };
      break;
    case "POST":
    default:
      options = {
        method: "POST",
        body: renderBody(state),
        mode: webhook.cors ? "cors" : "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
      };
  }

  return fetch(url, options);
}
