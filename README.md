# TubeBouncer
Firefox browser extension that tries to stop you from watching too much YouTube.

After you've been on the YouTube site (presumably watching videos) for 1 hour in any given day, you will be redirected to a different site.

This is purely to help me not binge watch youtube as often and is not really intended to be production quality (still can't believe `setInterval` is the only way to check for changes to `location.href`...)

## Installation

For official releases, download .xpi file from the latest GitHub release, and firefox should immediately prompt to install the extension.
If you were not prompted, first navigate to [about:addons](about:addons) in your Firefox browser.
Then click the cog in the top right, then select "Install Add-on from file.." and choose the .xpi file you downloaded.

To install locally for testing use `npm start` to auto-build and install local ext code into [about:debugging](about:debugging) to install the extension until next browser restart. (if getting ECONNREFUSED, try running in a different terminal app. It seems web-ext doesn't like the VSCode terminal.)

## Automation

There is a manual dispatch GitHub Action to automatically bump the extension version and release it to github and AMO [here](https://github.com/niehusst/TubeBouncer/actions/workflows/release.yml). The next version number is automatically deduced based on commit messages since the previous release following the conventional commits guidelines.

It is recommended to always run the release automation from `main`, but it should also work for any other branch as well.

## Debugging

You can run lint checks with `npm run lint` that also check for web-ext specific issues.

You can run the current extension code in a fresh browser using `npm start`. To debug issues in
the action popup, follow this [SO post](https://stackoverflow.com/a/39583033/9718199):

1. enter about:debugging in the URL bar.

2. In the left-hand menu, click This Firefox (or This Nightly).

3. click Inspect next to your extension to open the "Extension Toolbox".

4. Check the option to "Disable Popup Auto-Hide" in the Extension Toolbox

5. then you select which HTML document you mean to debug (in this case it would be your popup HTML code) using the context switcher ("select an iframe as the currently targeted document")
