import { State, InputState } from "./runner";

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

export function renderUrlEncoded(state: State): string {
  return Object.entries(state.input).map((k, i) => `${k[0]}=${k[1]}`).join('&')
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
        body: webhook.cors ? renderBody(state) : renderUrlEncoded(state),
        mode: webhook.cors ? "cors" : "no-cors",
        headers: {
          "Content-Type": webhook.cors ? "application/json" : "application/x-www-form-urlencoded",
        },
      };
  }

  return fetch(url, options);
}
