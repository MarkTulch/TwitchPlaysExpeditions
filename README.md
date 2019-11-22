# TwitchPlaysExpeditions
A lightweight application designed to allow Twitch users to vote on which cards get drafted next in a Streamer's Expedition run.

### Requires:
- npm  https://www.npmjs.com/
- Twitch Developer Rig: https://dev.twitch.tv/docs/extensions/rig
- ngrok: https://www.ngrok.com/

#### NPM Install and Setup
Once you download, simple `npm install` should take care of all dependencies.


#### Twitch Developer Rig Install and Setup
Go to https://dev.twitch.tv/ and create an extension there. You can use a simple test extension. Once you have the extension on the dev site, there's still a couple more things we need to configure.

Go to your extension page on the twitch dev site and navigate to whatever the version number you're using is. From there, you should see a bunch of dev options. The top left will say `extension-name/Versions/your.version.here`. Below that will be a pipeline diagram and below that will be some options.

Head to `Capabilities` and check Yes for Request Identity Link. Then head to `Asset Hosting`. `Set Video - Fullscreen Viewer Path` to `overlay/index.html`. Set `Live Config Path` (this is all the way at the bottom) to `dashboard/index.html`.

You are now ready to import into Twitch Developer Rig. Go to top left of the Rig and select `Add Project` -> `Create Project`. For `Select Existing or Create New Extension` select the extension you set up on the twitch dev site and press next.

For `Select the local folder where your extensions files will be located during development`, use the root directory of the Git repo. For `Add Code to your Project` select `None - I'll use my own code` and press next.

On `Project Details` page, set Host your front-end files to `frontend`. We have no host command for this
For `Back-end Files location` set it to `backend`. For `Run your back-end service locally with the Developer Rig`, you need your extension clientId, clientSecret, and ownerId. The command is `node config -c "<clientId>" -s "<clientSecret>" -o "<ownerId>"` and yes please include the quotes when you configure.

The clientId and clientSecret can be found on the twitch dev dashboard for the extension. Your ownerId can be found using this chrome extension and typing in your twitch username.

#### ngrok Install
Download and follow the instructions for setup and installation at https://www.ngrok.com/.


#### Testing with Legends of Runeterra
In Legends of Runeterra under `Settings`-> `Third Party Tools`, make sure `Enable Third Party Endpoints` is checked and the port number is `21337` (the default).

Once ngrok is installed, find your `ngrok.exe` and launch the executable. Then run the command `ngrok.exe http 8081` to start ngrok. Take note of the forwarding url. It will be something like `https://abcde.ngrok.io`. Note: you need the `https://` not `http://`.

In the Twitch Developer Rig under the `Extension Views` page, configure whatever views you would like. You will want 1 dashboard to perform setup for the voting, and at least 1 overlay to view the overlay on a stream. Press `Run Back End` and then press `Run Front End`. In the dashboard view, you will see an input `API Host`. This is where you will put your `https://` ngrok url and then press `Update Configuration`. Then press `Enable Voting` and start your Expedition.
