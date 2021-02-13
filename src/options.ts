import { getConfig, setConfig, EVENTS, Config, DEFAULT_CONFIG } from "./config";

const EVENT_DESCRIPTIONS = {
  check:
    "The extension has checked the Meet state. <strong>(Not Recommended)</strong>",
  change: "Any state has changed. <strong>(Not Recommended)</strong>",
  "input.change": "An input status has changed.",
  "input.active": "An input has changed to active.",
  "input.inactive": "An input has changed to inactive.",
  "input.camera.change": "The camera status has changed.",
  "input.camera.active": "The camera has changed to active.",
  "input.camera.inactive": "The camera has changed to inactive.",
  "input.microphone.change": "The microphone status has changed.",
  "input.microphone.active": "The microphone has changed to active.",
  "input.microphone.inactive": "The microphone has changed to inactive.",
};

function getHtmlInputElement(id: string): HTMLInputElement {
  return document.getElementById(id) as HTMLInputElement;
}

function saveOptions(): void {
  const config: Config = DEFAULT_CONFIG;

  EVENTS.forEach((e: string) => {
    // @ts-ignore-next-line
    config.webhooks[e].url = getHtmlInputElement(`${e}.url`).value;
    // @ts-ignore-next-line
    config.webhooks[e].cors = getHtmlInputElement(`${e}.cors`).checked;
  });

  setConfig(config);
}

async function restoreOptions(): Promise<void> {
  const config = await getConfig();

  EVENTS.forEach((e) => {
    // @ts-ignore-next-line
    getHtmlInputElement(`${e}.url`).value = config.webhooks[e].url;
    // @ts-ignore-next-line
    getHtmlInputElement(`${e}.cors`).checked = config.webhooks[e].cors;
  });
}

EVENTS.forEach((e) => {
  // @ts-ignore-next-line
  const description = EVENT_DESCRIPTIONS[e] as string;
  document.getElementById("form").insertAdjacentHTML(
    "beforeend",
    `
    <div class="form-group">
      <label for="${e}.url">Event: <code>${e}</code></label>
      <input type="url" class="form-control" id="${e}.url" placeholder="Webhook Url">
      <small id="${e}.help" class="form-text text-muted">${description}</small>
      <label for="${e}.cors">CORS</label>
      <input type="checkbox" class="form-control" id="${e}.cors" placeholder="CORS">
    </div>`
  );
  document.getElementById(`${e}.url`).addEventListener("change", () => {
    saveOptions();
  });

  document.getElementById(`${e}.cors`).addEventListener("change", () => {
    saveOptions();
  });
});

document.getElementById("payload").innerText = JSON.stringify(
  {
    input: {
      camera: "active",
      microphone: "inactive",
    },
    id: "aaa-bbb-ccc",
    timestamp: 123456789,
    previous: {
      input: {
        camera: "inactive",
        microphone: "unknown",
      },
      id: "aaa-bbb-ccc",
      timestamp: 123456789,
    },
  },
  null,
  4
);

document.addEventListener("DOMContentLoaded", () => {
  restoreOptions();
});
