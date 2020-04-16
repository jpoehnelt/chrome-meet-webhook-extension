function isInputActive() {
  let isActive = false;
  document.querySelectorAll("[role=button][data-is-muted]").forEach((el) => {
    if (el.getAttribute("data-is-muted") === "false") {
      isActive = true;
    }
  });
  return isActive;
}

function sendWebhook(isInputActive: boolean) {
  chrome.storage.sync.get(
    {
      activeWebhookUrl: "",
      inactiveWebhookUrl: "",
    },
    function ({ activeWebhookUrl, inactiveWebhookUrl }) {
      const webhookUrl = isInputActive ? activeWebhookUrl : inactiveWebhookUrl;

      // return if the webhook url has not been set by the user
      if (webhookUrl === "") {
        console.log("[chrome-meet-webhook-extension] no webhook defined!");
      } else {
        // send webhook
        fetch(webhookUrl, {
          method: "POST",
          body: JSON.stringify({ text: `is active ${isInputActive}` }),
        })
          .then(() => {
            console.log(
              `[chrome-meet-webhook-extension] sent webhook to ${webhookUrl}`
            );
          })
          .catch(() => {
            console.log(
              "[chrome-meet-webhook-extension] failed to send webhook"
            );
          });
      }
    }
  );
}

export function run(wasActive: boolean) {
  const isActive = isInputActive();

  if (isActive !== wasActive) {
    sendWebhook(isActive);
  }

  setTimeout(() => {
    run(isActive);
  }, 1000);
}
