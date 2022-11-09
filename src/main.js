// TODO: isolate tab history via session id??
const historyPrev = "tb.history.0";
const historyPrevPrev = "tb.history.1";

function parseDomainFromUrl(url) {
  return (new URL(url)).hostname;
}

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

function setLatestUrl(url) {
  const domain = parseDomainFromUrl(url);
  advanceHistory(domain);
}

/**
 * Give the user an `alert` to remind them not to waste their
 * life
 */
function alertUser() {
  // motivational quotes
  const messages = [
    'touch grass',
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
 * Returns `true` if the last 2 domains visited were
 * YouTube domains, else `false`
 */
function didWatchTooMuchYouTube() {
  const recentHistory = [
    window.localStorage.get(historyPrev),
    window.localStorage.get(historyPrevPrev),
  ];
  console.log(`DEBUG: ${recentHistory}`);

  return recent.reduce((accumulator, value) => {
    accumulator = accumulator &&
      (value.includes('youtube.com') || value.includes('youtu.be'));
    return accumulator;
  }, true);
}

function main() {
  setLatestUrl(window.location.href);
  console.log('DEBUG: about to check');
  if (didWatchTooMuchYouTube()) {
    alertUser();
  }
}

console.log('DEBUG: we starting');
main();
