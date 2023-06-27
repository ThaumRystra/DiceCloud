DiceCloud
========

This is the repo for [DiceCloud](https://dicecloud.com).

DiceCloud is a free, auditable, real-time character sheet for D&D 5e.

Philosophy
----------

Setting up your character on DiceCloud takes a little longer than
just filling it in on a paper character sheet would. The goal of using an
online sheet is to make actually playing the game more streamlined, and
ultimately more fun. So putting a little extra effort into setting up a
character now pays off over and over again once you're playing.

The idea is to track where each number comes from, and allow you to easily make
changes on the fly. Let's look at a hypothetical example.

> You need to swim through a sunken section of dungeon to fetch the quest's Thing.
> You'll need to take off your magical Plate Armor of +1 Constitution to swim
> without sinking, of course.
>
> Taking it off will take away that disadvantage on
> stealth checks, change your armor class, your speed and your constitution, and
> which in turn changes your hit points and your constitution saving throw.
> Working out all those changes in the middle of a game will drag the game to a
> halt.
>
> Fortunately you have DiceCloud, so it's a matter of dragging
> your Plate Armor +1 Con from your "equipment" box to your "backpack" box and
> you're done. Your hitpoints change correctly, your saving throws are up to date,
> your armor class goes back to reflecting the fact that you have natural armor
> from being a dragonborn. Your character sheet keeps up and you
> ultimately get more time to play the game. Huzzah!

Getting started
---------------

Running DiceCloud locally, either to host it yourself away from an internet
connection, or to contribute to developing it further, is fairly
straightforward and it should work on Linux, Windows, and Mac.

You'll need to have installed:

- [git](https://www.atlassian.com/git/tutorials/install-git)
- [Meteor](https://www.meteor.com/install)

Then, it's just a matter of cloning this repository into a folder, and running
`meteor` in the app directory.

`git clone https://github.com/ThaumRystra/DiceCloud dicecloud`  
`cd dicecloud`  
`cd app`  
`meteor npm install`  
`meteor`

You should see this:

```
=> Started proxy.
=> [HMR] Dev server listening on port 3003.
=> Started MongoDB.
=> Started your app.

=> App running at: http://localhost:3000/
```

Environmental Variables
-----------------------

```
MAIL_URL=smtp://<your smtp mail url>
METEOR_SETTINGS={ "public": { "environment": "production", "patreon": { "clientId": "<your patreon client ID>", "campaignId": "<your campaign id>" } }, "patreon": { "clientSecret": "<your client secret>", "creatorAccessToken": "<your creator access token>" } }
MONGO_OPLOG_URL=mongodb+srv://<your url for the oplog account of your mongo database>
MONGO_URL=mongodb+srv://<your url for the read/write account of your mongo database>
NPM_CONFIG_PRODUCTION=true
PROJECT_DIR=app
ROOT_URL=https://<url of your DiceCloud instance>
DEFAULT_LIBRARIES=<comma separated list of library ids that will be subscribed by default: "abc123,def456">
```

To disable Patreon features and unlock all paid restrictions for all users of your deployment, replace
`"patreon": { "clientId": ... }"` with `"disablePatreon": true` in the public key of the METEOR_SETTINGS environment variable.

Alternatively run `meteor run --settings exampleMeteorSettings.json` to start the app with the example settings that disable Patreon by default.

Now, visiting [](http://localhost:3000/) should show you an empty instance of
DiceCloud running.
