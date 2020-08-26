import { Config, DEFAULT_CONFIG, getConfig } from "./config";

declare global {
  namespace NodeJS {
    interface Global {
      chrome: any;
    }
  }
}

it("should parse method correctly", async () => {
  const config = {
    webhooks: {
      "input.change": {
        url:
          "https://foo.bar.com?active=${input.camera === 'active' ? true : false}",
      },
      change: {
        url:
          "POST https://foo.bar.com?active=${input.camera === 'active' ? true : false}",
      },
      "input.camera.active": { url: "https://foo.bar.com" },
    },
  } as Partial<Config>;

  global.chrome = {
    storage: {
      sync: {
        get: jest.fn().mockImplementation((_, callback) => {
          callback({ config });
        }),
      },
    },
  };

  await expect(getConfig()).resolves.toMatchInlineSnapshot(`
          Object {
            "webhooks": Object {
              "change": Object {
                "method": "POST",
                "url": "https://foo.bar.com?active=\${input.camera === 'active' ? true : false}",
              },
              "input.active": Object {
                "url": "",
              },
              "input.camera.active": Object {
                "url": "https://foo.bar.com",
              },
              "input.camera.change": Object {
                "url": "",
              },
              "input.camera.inactive": Object {
                "url": "",
              },
              "input.change": Object {
                "url": "https://foo.bar.com?active=\${input.camera === 'active' ? true : false}",
              },
              "input.inactive": Object {
                "url": "",
              },
              "input.microphone.active": Object {
                "url": "",
              },
              "input.microphone.change": Object {
                "url": "",
              },
              "input.microphone.inactive": Object {
                "url": "",
              },
            },
          }
        `);
});
