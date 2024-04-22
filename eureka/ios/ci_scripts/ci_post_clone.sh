#!/bin/sh

echo "$CI_WORKFLOW"

# disable homebrew auto update
export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_INSTALL_CLEANUP=1
# fix issue (dyld[8788]: Library not loaded: /usr/local/opt/icu4c/lib/libicui18n.73.dylib)
brew install icu4c.rb
# add node yourself
brew install node@16
# link it to the path
brew link node@16
# Install React dependencies
npm install --legacy-peer-deps
# Fix YogaKit compatibility with Xcode 15
sed -i '' "s/getLayout().hadOverflow() |/getLayout().hadOverflow() ||/g" ../../node_modules/react-native/ReactCommon/yoga/yoga/Yoga.cpp

# Install CocoaPods using Homebrew
brew install cocoapods
# Install dependencies you manage with CocoaPods
pod install
# Fix boost pod compatibility with Xcode 15
sed -i '' 's/std::unary_function/std::__unary_function/g' ../Pods/boost/boost/container_hash/hash.hpp
