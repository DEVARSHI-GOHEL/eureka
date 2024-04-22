# README #

### Setting up React Native development environment ###
https://reactnative.dev/docs/environment-setup  
Follow instructions and setup Android or(and) iOS dev environment on Windows or Mac computer.

####  Prerequisites briefly ####
- Android Studio Electric Eel or older
- cocoapods, Xcode
- react native
- nodejs 16 or 18
- JDK < 16

### Checkout project and install dependencies ###
* start terminal from `eureka` subfolder
* run command `npm install --legacy-peer-deps` once to install React Native dependencies
* before iOS app first launch goto `ios` subfolder and run command `pod install` once to install Cocoapods dependencies

### Launch the app using React Native CLI ###
#### Android app ###
* launch simulator or connect a phone
* get device name from command output `adb devices`
* run project `npx react-native run-android --deviceId emulator-5554`
* or just `npx react-native run-android` to run by default
#### iOS app ####
* connect an iPhone or iPad
* get device or simulator name from command output `xcrun xctrace list devices`
* run project on device `npx react-native run-ios --device "Max's iPhone"`
* or on simulator `npx react-native run-ios --simulator "iPhone SE"`

### Launch Android app using Android Studio ###
* open Android project from `eureka\android` folder
* start a metro server `npx react-native start`
* launch the project in usual way from Android Studio or with Gradle task

### Launch iOS app using Xcode ###
* open iOS project from `eureka\ios` folder
* metro server will start automatically at the end of successful build
* launch the project in usual way from Xcode on device or simulator

## Faster way how to start app ##

If you already run application before, just:
* open your emulator/simulator
* start metro by command 'npm run start'
* open your application in emulator/simulator. It should connect to metro automatically

## Debug ##

* In simulator/emulator open menu (menu button in android, Control + Command + z in iOS) and pick "debug".
* This will open the debugger page in chrome. Close it and run: `npm run debug`.
* This will open debugger tools for react native.

#### Show network communication ####
* To show network communication just "right click" the debugger tools on the (usually) left panel and in menu pick "Enable Network Inspect".
