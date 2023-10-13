// TODO: isolate tab history via session id??
const historyPrev = "tb.history.0";
const historyPrevPrev = "tb.history.1";

/**
 * Cycles `latestDomain` into the retained 2 entries of
 * browser history, popping the oldest entry of the 2 
 * from storage.
 *
 * latestDomain - str. domain name of the URL that was last visited
 */
function advanceHistory(latestDomain) {
  // use window.localStorage MDN browser object to hold state
  const prevValue = window.localStorage.getItem(historyPrev);
  window.localStorage.setItem(historyPrevPrev, prevValue);
  window.localStorage.setItem(historyPrev, latestDomain);
}

/**
 * Give the user an `alert` to remind them not to waste their
 * life
 */
function alertUser() {
  // motivational quotes
  const messages = [
    'touch grass, nerd!',
    'youre wasting your life!',
    'get off your ass and do something useful',
    'stop watching YouTube and notice the killer clown behind you',
    'if you dont stop watching YouTube, your incognito browser history will be sent to all your contacts',
    'youve lost 200 brain cells in the past hour [citation needed]',
  ];

  const randIndex = Math.floor(Math.random() * messages.length);
  const randMsg = messages[randIndex];
  alert(randMsg);
}

/**
 * Returns `true` if the last 2 domains visited
 * (within current tab session) were
 * YouTube domains, else `false`
 */
function didWatchTooMuchYouTube() {
  // TEMP: dont watch any youtube!
  return window.location.href.includes('youtube.com');

  const recentHistory = [
    window.localStorage.getItem(historyPrev),
    window.localStorage.getItem(historyPrevPrev),
  ];

  return recentHistory.reduce((accumulator, value) => {
    // only count /watch URLs so user can actually watch
    // a video before counter starts going up
    accumulator = accumulator && value.includes('youtube.com/watch');
    return accumulator;
  }, true);
}

function main() {
  // do check first so that alert is triggered on
  // (not before) 3rd youtube link
  if (didWatchTooMuchYouTube()) {
    alertUser();
  }
  advanceHistory(window.location.href);
}

// I cant believe this is the only way to "listen" for URL changes
// (╯°□°)╯︵ ┻━┻ 
let oldLocation = location.href;
setInterval(function() {
  if (location.href != oldLocation) {
    main();
    oldLocation = location.href
  }
}, 2000); // check every 2 seconds
