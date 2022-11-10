# TubeBouncer
Firefox browser extension that tries to stop you from watching too much YouTube.

After you've watched 2 youtube videos in a row and start a 3rd one, an alert motivates you to do something else. This alert can just be closed, and it's very simple to game the system, so this is not meant to be a hard stop (like a child lock), in case you were intentionally watching many youtube videos in a row.

This is purely to help me not binge watch youtube as often and is not really intended to be production quality (still can't believe `setInterval` is the only way to check for changes to `location.href`...)

## Installation

Download .xpi file from GitHub release, then navigate to [about:addons](about:addons) in your Firefox browser.
Click the cog in the top right, then select "Install Add-on from file.." and choose the .xpi file you downloaded.
