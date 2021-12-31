let gdlQueue = window.FDX.GDL;

function sendPageView(pageId) {
  gdlQueue = returnGDL(gdlQueue);
  gdlQueue.push(['event:publish', [
    'page', 'pageinfo', {
      pageId: pageId
    }
  ]]);
}

function setDebugging(enableDebug, env) {
  const cookieGdlDebugging = getCookie('gdl-debugging');
  gdlQueue = returnGDL(gdlQueue);
  if (cookieGdlDebugging === undefined && enableDebug) {
    if (env !== 'production') {
      if (gdlQueue.length === 0) {
        setTimeout(() => {
          gdlQueue = returnGDL(gdlQueue);
          gdlQueue.debug.enable();
        }, 1000);
      }
      else {
        gdlQueue.debug.enable();
      }
    } else {
      // This is not recognized in dev environment
      if (gdlQueue.length === 0) {
        setTimeout(() => {
          gdlQueue = returnGDL(gdlQueue);
          gdlQueue.push(['debug:enable']);
        }, 1000);
      }
      else {
        gdlQueue.push(['debug:enable']);
      }
    }
  } else if (cookieGdlDebugging !== undefined && !enableDebug) {
    if (env !== 'production') {
      gdlQueue.debug.disable();
    }
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function returnGDL(gdlQueue) {
  return gdlQueue.about ? gdlQueue : window.FDX.GDL;
}