rm caveau.apk
cordova build --release android
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore release.keystore /Users/luca/ibanApp/platforms/android/ant-build/CordovaApp-release-unsigned.apk alias_name
/Users/luca/Downloads/adt-bundle-mac-x86_64-20140702/sdk/build-tools/android-4.4W/zipalign -v 4 /Users/luca/ibanApp/platforms/android/ant-build/CordovaApp-release-unsigned.apk caveau.apk
