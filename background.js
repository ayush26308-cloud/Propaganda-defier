chrome.runtime.onInstalled.addListener(function () {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(function (err) { console.error("sidePanel setup error:", err); });
});

chrome.action.onClicked.addListener(async function (tab) {
  try {
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (e) {
    console.error("Failed to open side panel:", e);
  }
});
