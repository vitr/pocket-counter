/**
 * Get the URL of the tab that launched this popup.
 * @return A Promise that resolves to the URL.
 */
function getURL() {
  return new Promise(function(resolve, reject) {
    chrome.tabs.query({currentWindow:true, active:true}, function(tabs) {
      var url = null;
      for (var i = 0, tab; tab = tabs[i]; i++) {
        if (tab.url) {
          resolve(tab.url);
          return;
        }
      }
      reject(Error("Couldn't get active tab URL"));
    });
  });
}

/**
 * Set the popup status content to a string.
 * @param text Status string.
 */
function setStatus(text) {
  document.body.innerText = text;
  chrome.browserAction.setBadgeBackgroundColor({color:'#696969'});
  chrome.browserAction.setBadgeText({text:text.toString()});
}

/**
 * Report an error to the user.
 * @param err An Error object.
 */
function logError(err) {
  console.log(err);
  window.err = err;
  setStatus(err.toString() + '. ' +
            '!!!!See the "err" variable in the JS console for details.');
}

/**
 * main popup control flow.
 */
function main() {
  if (Auth.isNeeded()) {
    setStatus('Authorizing...');
    Auth.go().catch(logError);
    // The auth flow will open a new tab, which closes this popup.
    // There's no reason to try to add a .then() to catch it.
    return;
  }

  getURL()
    .then(function(url) {
      // setStatus('!!!!!!!!Saving ' + url + '...');
      setStatus('...');
      return url;
    })
    .then(API.add)
    .then(function(data) {
      // setStatus('Saved ' + data.title + '.\n' + data.excerpt);
      // setStatus(JSON.stringify(data));
      // setStatus(JSON.stringify(data.list));
      setStatus(Object.keys(data.list).length);

      // setStatus(data.list.length);
    })
    .catch(logError);
}
main();
