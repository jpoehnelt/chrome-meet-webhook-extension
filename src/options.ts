function getHtmlInputElement(id: string): HTMLInputElement {
  return document.getElementById(id) as HTMLInputElement;
}

function saveOptions() {
  var activeWebhookUrl = getHtmlInputElement("activeWebhookUrl").value;
  var inactiveWebhookUrl = getHtmlInputElement("inactiveWebhookUrl").value;

  chrome.storage.sync.set(
    {
      activeWebhookUrl,
      inactiveWebhookUrl,
    },
    () => {
      document.getElementById("status").classList.remove("d-none");
      setTimeout(() => {
        document.getElementById("status").classList.add("d-none");
      }, 3000);
    }
  );
}

function restoreOptions() {
  chrome.storage.sync.get(
    {
      activeWebhookUrl: "",
      inactiveWebhookUrl: "",
    },
    function (items) {
      getHtmlInputElement("activeWebhookUrl").value = items.activeWebhookUrl;
      getHtmlInputElement("inactiveWebhookUrl").value =
        items.inactiveWebhookUrl;
    }
  );
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
