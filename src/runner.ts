import { Config, getConfig } from "./config";
import { send } from "./webhook";

export type Status = "active" | "inactive" | "unknown";

export interface InputState {
  microphone: Status;
  camera: Status;
}

export interface State {
  input: InputState;
  id: string;
  timestamp: number;
}

export function getInputElementStatus(element: Element): Status {
  try {
    return element.getAttribute("data-is-muted") === "false"
      ? "active"
      : "inactive";
  } catch (e) {
    console.error("[chrome-meet-webhook-extension] " + String(e));
    return "unknown";
  }
}

export function getInputState(document: HTMLDocument): InputState {
  if (window.location.pathname) {
    const inputs = (document.querySelectorAll(
      "[role=button][data-is-muted]"
    ) as unknown) as Element[];

    if (inputs.length == 2) {
      return {
        microphone: getInputElementStatus(inputs[0]),
        camera: getInputElementStatus(inputs[1]),
      };
    }
    console.log(
      "[chrome-meet-webhook-extension] could not read camera and microphone input button state"
    );
    return { microphone: "unknown", camera: "unknown" };
  }
  return { microphone: "inactive", camera: "inactive" };
}

export interface RunnerOptions {
  callback?: (state: State) => void;
  delay?: number;
}

export class Runner implements RunnerOptions {
  previous: State = {
    id: "",
    timestamp: 0,
    input: {
      camera: "unknown",
      microphone: "unknown",
    },
  };
  current: State;
  delay: number;
  callback?: (state: State) => void | null;
  config: Config;

  constructor({ delay = 1000, callback }: RunnerOptions) {
    this.delay = delay;
    this.callback = callback;
  }

  async start(): Promise<void> {
    this.config = await getConfig();

    const loop = async (): Promise<void> => {
      this.update();
      this.config = await getConfig();
      this.process();

      setTimeout(loop, this.delay);
    };

    loop();
  }

  update(): void {
    if (this.current) this.previous = this.current;
    this.current = {
      input: getInputState(document),
      id: window.location.pathname.substring(1),
      timestamp: Date.now(),
    };
  }

  process(): void {
    if (
      JSON.stringify(this.previous.input) !== JSON.stringify(this.current.input)
    ) {
      this.send("change");
    }

    let inputHasChanged = false;
    ["camera", "microphone"].forEach((s) => {
      const input = s as keyof InputState;

      if (this.previous.input[input] !== this.current.input[input]) {
        this.send(`input.${input}.change`);
        this.send(`input.${input}.${this.current.input[input]}`);
        inputHasChanged = true;
      }
    });

    if (inputHasChanged) {
      this.send("input.change");

      if (
        this.current.input.camera === "active" ||
        this.current.input.microphone === "active"
      ) {
        this.send("input.active");
      }

      if (
        this.current.input.camera === "inactive" &&
        this.current.input.microphone === "inactive"
      ) {
        this.send("input.inactive");
      }
    }
  }

  send(e: string): void {
    if (this.config.webhooks[e] && this.config.webhooks[e].url) {
      console.log("[chrome-meet-webhook-extension] triggered " + e);
      send(
        { ...this.current, ...{ previous: this.previous } },
        this.config.webhooks[e]
      );
    } else {
      console.log("[chrome-meet-webhook-extension] ignored " + e);
    }
  }
}
