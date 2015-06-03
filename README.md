This is the repo for the cross-platform UI, which we will build using apache
cordova. The UI screens from here will be used to build the UI for the hybrid
app stored in https://github.com/e-mission/e-mission-phone. Since we are
embedding the cordova views, we need to create them in the context of a regular
cordova app, and then copy them to the appropriate directory in the native app.

## Installation

In order to build in the code in this directory, you need to first install apache cordova.
We will use ionic for the UI, so we will install both the ionic and the cordova command line tools.
http://ionicframework.com/getting-started/

Add the sqlite plugin to ensure that we can access the database from the javascript

    $ ionic plugin add https://github.com/brodysoft/Cordova-SQLitePlugin

The checked in version does not have the default ionic plugins installed, so on
checking this out, you also need to install the following plugins

    $ ionic plugin add com.ionic.keyboard
    $ ionic plugin add org.apache.cordova.console
    $ ionic plugin add org.apache.cordova.device
    $ ionic plugin add org.apache.cordova.statusbar

In order to have this project work correctly on android, you need to have a
recent version of the old ant-based SDK build tools available. The easiest way
to do this is to use the SDK manager to install the most recent build tools.

## Development

Unlike a classic cordova app that has a single webview with all the screens, we
can potentially have multiple screens, one for each webview. In order to create
multiple top level screens in the same webview, we use the following structure
for the `www` directory.

    www
        - screen1.html
        - screen1-js/
        - screen2.html
        - screen2-js/
        ....

Then, we can create `CordovaActivity` and `EmbeddedCordovaView` screens in the main app that load `screen1.html`, `screen2.html` etc.

In order to create a new screen, the steps are:

1. create `screen_new.html` and `screen-new-js/` in the `www` directory
1. edit config.xml to display `screen_new.html`
1. develop away

## Embedding

As described in https://github.com/e-mission/e-mission-phone/blob/master/README.md, after the screens are ready, the `update_cordova_sources.sh` script can be run with this directory as the second argument. That will copy over the files to the appropriate locations on the native app repo, e.g.

    $ ./update_cordova_sources.sh ~/e-mission/e-mission-phone-cordova/eMission
