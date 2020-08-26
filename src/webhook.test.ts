import { interpolate, send } from "./webhook";
declare global {
  namespace NodeJS {
    interface Global {
      fetch: any;
    }
  }
}

it("should interpolate url given state", () => {
  const url = "https://foo.bar.com?active=${input.camera ? true : false}";
  expect(
    interpolate(url, {
      id: "foo",
      timestamp: 0,
      input: { camera: "active", microphone: "active" },
    })
  ).toEqual("https://foo.bar.com?active=true");
});

it("should send POST", () => {
  global.fetch = jest.fn().mockReturnValue(Promise.resolve());
  const webhook = { url: "https://foo.bar.com", method: "POST" };
  send(
    {
      id: "foo",
      timestamp: 0,
      input: { camera: "active", microphone: "active" },
    },
    webhook
  );

  expect(global.fetch.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "https://foo.bar.com",
      Object {
        "body": "{\\"id\\":\\"foo\\",\\"timestamp\\":0,\\"input\\":{\\"camera\\":\\"active\\",\\"microphone\\":\\"active\\"}}",
        "headers": Object {
          "Content-Type": "application/json",
        },
        "method": "POST",
        "mode": "no-cors",
      },
    ]
  `);
});

it("should send POST", () => {
  global.fetch = jest.fn().mockReturnValue(Promise.resolve());
  const webhook = { url: "https://foo.bar.com", method: "GET" };
  send(
    {
      id: "foo",
      timestamp: 0,
      input: { camera: "active", microphone: "active" },
    },
    webhook
  );

  expect(global.fetch.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "https://foo.bar.com",
      Object {
        "method": "GET",
        "mode": "no-cors",
      },
    ]
  `);
});
