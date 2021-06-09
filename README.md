DiceCloud
========

This is the repo for [DiceCloud](dicecloud.com).

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

Now, visiting [](http://localhost:3000/) should show you an empty instance of
DiceCloud running.

Docker Instructions
-------------------

To build and run DiceCloud locally with docker, you will need docker-compose. 
You will also need at least 4GB of RAM to build.

Copy the docker-compose.yml file to docker-compose.override.yml and proceed
to make it look as follows:

```
version: "3.7"
services:
  web:
    environment:
      - MONGO_URL="mongodb://dice:dice@dicecloud_mongodb_1:27017"
      - ROOT_URL=http://127.0.0.1
  mongodb:
    environment:
      - MONGO_INITDB_ROOT_USERNAME=dice
      - MONGO_INITDB_ROOT_PASSWORD=dice
```

This is to ensure in future updates, should you pull from git, that your config
stays the same. Afterwards, change `ROOT_URL` to be the IP of the machine or a 
DNS resolvable name. e.g:

```
ROOT_URL=https://dicecloud.example.com
or
ROOT_URL=http://192.168.1.100
```

If you plan on having the instance be public, change the mongodb root user
and password (presently set to dice) to something more secure. e.g:

```
MONGO_URL="mongodb://waffle:house@dicecloud_mongodb_1:27017"
...
MONGO_INITDB_ROOT_USERNAME=waffle
MONGO_INITDB_ROOT_PASSWORD=house
```

**Note**: After the first run, the root user and password of the mongodb 
container will be set and can't be changed via the docker-compose.override.yml
file and will instead have to be changed manually through the CLI tool `mongo` or 
via a GUI tool `MongoDB Compass` or similar. If you do change the password, 
do update the `MONGO_URL` passage.

Once you've finished editing the docker-compose.override.yml file to your needs, 
you can run:

```
docker-compose up --build
```

Building the image will take time, but once built it will take considerably less time 
to (re)start instances. DiceCloud will be reachable over port 3000, so long as the domain 
name resolved or IP address entered matches `ROOT_URL`. MongoDB can be reached over its 
standard 27017 port.

**Note**: You should rebuild the image often in order to keep the Ubuntu base up to date.