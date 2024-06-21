# TubeBouncer
Firefox browser extension that tries to stop you from watching too much YouTube.

After you've been on the YouTube site (presumably watching videos) for 1 hour in any given day, you will be redirected to a different site.

This is purely to help me not binge watch youtube as often and is not really intended to be production quality (still can't believe `setInterval` is the only way to check for changes to `location.href`...)

## Installation

For official releases, download .xpi file from the latest GitHub release, and firefox should immediately prompt to install the extension.
If you were not prompted, first navigate to [about:addons](about:addons) in your Firefox browser.
Then click the cog in the top right, then select "Install Add-on from file.." and choose the .xpi file you downloaded.

To install locally for testing use `npm start` to auto-build and install local ext code into [about:debugging](about:debugging) to install the extension until next browser restart.

## Automation

There is a manual dispatch GitHub Action to automatically bump the extension version and release it to github and AMO [here](https://github.com/niehusst/TubeBouncer/actions/workflows/release.yml). The next version number is automatically deduced based on commit messages since the previous release following the conventional commits guidelines.

It is recommended to always run the release automation from `main`, but it should also work for any other branch as well.

