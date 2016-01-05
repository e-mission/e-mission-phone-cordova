#!/usr/bin/env node
 
//
// This hook copies various resource files 
// from our version control system directories 
// into the appropriate platform specific location
//
 
 
// configure all the files to copy.  
// Key of object is the source file, 
// value is the destination location.  
// It's fine to put all platforms' icons 
// and splash screen files here, even if 
// we don't build for all platforms 
// on each developer's box.
 
var filestocopy = [{
    "extra_native_src/android/NativeSettings.java": 
    "platforms/android/src/com/ionicframework/referencesidebarapp565061/NativeSettings.java"
}, {
    "extra_native_src/android/strings_activity_native_settings.xml": 
    "platforms/android/res/values/strings_activity_native_settings.xml"
}, {
    "extra_native_src/android/pref_general.xml": 
    "platforms/android/res/xml/pref_general.xml"
}, {
    "extra_native_src/android/pref_headers.xml": 
    "platforms/android/res/xml/pref_headers.xml"
}, {
    "extra_native_src/android/pref_data_sync.xml": 
    "platforms/android/res/xml/pref_data_sync.xml"
}, {
    "extra_native_src/android/pref_notification.xml": 
    "platforms/android/res/xml/pref_notification.xml"
}, {
    "extra_native_src/ios/NativeSettings.m": 
    "platforms/ios/referenceSidebarApp/Classes/NativeSettings.m"
}, {
    "extra_native_src/ios/NativeSettings.h": 
    "platforms/ios/referenceSidebarApp/Classes/NativeSettings.h"
}, {
    "extra_native_src/ios/NativeSettings.xib": 
    "platforms/ios/referenceSidebarApp/Classes/NativeSettings.xib"
}];
 
var fs = require('fs');
var path = require('path');
 
// no need to configure below
var rootdir = process.argv[2];
 
filestocopy.forEach(function(obj) {
    Object.keys(obj).forEach(function(key) {
        var val = obj[key];
        var srcfile = path.join(rootdir, key);
        var destfile = path.join(rootdir, val);
        console.log("copying "+srcfile+" to "+destfile);
        var destdir = path.dirname(destfile);
        if (fs.existsSync(srcfile) && fs.existsSync(destdir)) {
            fs.createReadStream(srcfile).pipe(
               fs.createWriteStream(destfile));
        }
    });
});
