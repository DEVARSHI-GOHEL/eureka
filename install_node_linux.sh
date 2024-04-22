VERSION=v16.20.2
DISTRO=linux-x64
curl https://nodejs.org/dist/$VERSION/node-$VERSION-$DISTRO.tar.xz --output node-$VERSION-$DISTRO.tar.xz
mkdir -p /usr/local/lib/nodejs
tar -xJf node-$VERSION-$DISTRO.tar.xz -C /usr/local --strip-components=1 --no-same-owner
ln -s /usr/local/bin/node /usr/local/bin/nodejs
node -v