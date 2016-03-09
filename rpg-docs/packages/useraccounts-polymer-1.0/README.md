[![Build Status](https://travis-ci.org/meteor-useraccounts/polymer.svg?branch=master)](https://travis-ci.org/meteor-useraccounts/polymer)
useraccounts:polymer
=====================================

 WORK IN PROGRESS - let us know about any problem you might encounter ;)

## TODOs

Add the following input types:

  - checkbox input
  - select input
  - radio input

Find the proper solution for inheriting AT events for paper-button elements



This package depends on [useraccounts:core](https://atmospherejs.com/useraccounts/core)

Learn more [here](http://useraccounts.meteor.com) or have a look at the full [documentation](https://github.com/meteor-useraccounts/core).


## Bring Your Own Polymer

Adding this package with `meteor add useraccounts:polymer` does not add any other packages providing Polymer .This is to let you choose the flavour you prefer! Or using an Atmosphere package, or straight up with bower!


## ADD theses imports manually

This package does not automatically add the imports for the elements needed. If you don't have them imported already you should copy/paste these imports :

	 ```HTML

		<link rel="import" href="bower_components/paper-input/paper-input.html">
		<link rel="import" href="bower_components/paper-button/paper-button.html">
		<link rel="import" href="bower_components/paper-checkbox/paper-checkbox.html">

	 ```




## Contributing

Anyone is welcome to contribute. Fork, make your changes, and then submit a pull request.

Thanks to all those who have contributed code changes to [this package](https://github.com/meteor-useraccounts/unstyled/graphs/contributors) as well as to the [core package](https://github.com/meteor-useraccounts/core/graphs/contributors) and all who have helped by submitting bug reports and feature ideas.
