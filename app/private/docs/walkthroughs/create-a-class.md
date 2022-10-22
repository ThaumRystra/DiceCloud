# Create a Class

This is a guide on creating a custom class in a character sheet. If possible, it is always faster to use an existing library that contains the class you want to use. Before continuing, check the #libraries channel of the [official discord](https://discord.gg/qEvdfeB) to see if a library exists with the class you are creating.

This guide assumes you are using the ruleset provided in the [5e System Reference Document library](/library/qkv8aptJH2fCXARcJ). If you are using a different ruleset for your character, there may be some discrepancies.

## Adding the class property

On the build tab of your character, in the card labeled **Slots**, expand the rulset, then click the slot where you would like to place the custom class, if it is your starting class in an SRD character, this would be the Class slot. Be sure to click the name of the slot, not the **+** button.

![Screenshot of Build Tab > Slots > Ruleset > Class](/images/docs/walkthroughs/create-a-class-1.png)

This opens the slot in detail view, showing you how the slot expected to be filled from a library, instead of filling the slot, we will be manually adding a class to the slot that we create ourselves.

Click the **Edit** button in the top right of the slot detail dialog.

![Screenshot of slot detail dialog](/images/docs/walkthroughs/create-a-class-2.png)

Expand the children of the class slot, and click the plus button to add a child property.

![Screenshot of adding a child property](/images/docs/walkthroughs/create-a-class-3.png)

This brings up the create a property dialog, we are creating a class, so select the class property type.

![Screenshot of choosing a class property](/images/docs/walkthroughs/create-a-class-4.png)

Now that we have selected the class property type, the create tab is selected where we can enter the details of our class, fill in the form and click **Create**.

![Screenshot of the class form](/images/docs/walkthroughs/create-a-class-5.png)

Now that our custom class is created, we can close the class slot dialog.

On the Build tab, in the card with the title **Level**, you will see your new class, with a button to **Level Up**, clicking the level up button would usually search your libraries for class levels that match the variable name of the class, however, since it's a custom class, it will probably not find any levels.

Instead, as we did with the class slot, click on the class name to bring up the class detail dialog, click **Edit**, expand children and click the **+** button to add a child to the class. Here we will add all of the things our class gives the character.

Add an [Effect](/docs/property/effect) which targets `hitPoints` to add the starting hitpoints of the class. Add a [proficiencies](/docs/property/proficiency) for all the skill and saving throw proficiencies the class gives. Add  [skills](/docs/property/skill) for all the tool and weapon proficiencies of the class, making sure to set the base proficiency of those skills to proficient. Add any text [features](/docs/property/feature) the class gives you, along with [actions](/docs/property/action) which may be children of those features, or direct children of the class.

Once you have added Everything the class gives you, it's time to add class levels. As a child of the class, add a [class level](/docs/property/class-level) property. Set the level to 1 and the name and variable name to match the variable name of the class.

Once the class level is created, open the class level and edit it. Use the **+** button in the children of the class level to add all the properties the class level gives your character.

Repeat this for every level of the class until your character is at the correct level.

You can use a separate character with levels in a class that is available in your libraries as an example of what properties you may want to add to your class and class levels.

![Example wizard class](/images/docs/walkthroughs/create-a-class-6.png)
