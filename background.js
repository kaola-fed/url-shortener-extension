let pingable = true;

function copy(text) {
  let copyFrom, body;
  copyFrom = document.createElement("textarea");
  copyFrom.textContent = text;
  body = document.getElementsByTagName('body')[0];
  body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand('copy');
  body.removeChild(copyFrom);
}

function notify(url) {
  const notification = new Notification(url, {
    icon: 'images/icon48.png',
    body: 'Copied to clipboard'
  });
  setTimeout(() => {
    notification.close()
  }, 2000);
}

function isUrl(str = '') {
  const regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return regexp.test(str);
}

function ping() {
  fetch('https://url.kaolafed.com/ping').then(res => {
    pingable = true;
  }).catch(e => {
    pingable = false;
  });
}

function updateIcon() {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, tab => {
    const isActive = pingable && isUrl(tab[0].url || '');
    const icon = `images/icon32${isActive ? '': '_off'}.png`;
    chrome.browserAction.setIcon({
      path: icon
    });
  });
}

chrome.browserAction.onClicked.addListener( tab => {
  if (!pingable || !isUrl(tab.url)) return;

  fetch('https://url.kaolafed.com/shorten', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'url=' + tab.url,
  }).then(response => {
    return response.text();
  }).then(text => {
    copy(text);
    notify(text);
  }).catch(e => {
    console.log(e);
  });
});

chrome.tabs.onActivated.addListener(() => {
  updateIcon();
});

chrome.tabs.onUpdated.addListener(() => {
  updateIcon();
});

ping();
setInterval(ping, 60 * 60 * 1000);