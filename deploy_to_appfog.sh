#!/usr/bin/env bash
export CLOUDFOUNDRY_USERNAME=kristsauders@gmail.com
export CLOUDFOUNDRY_PASSWORD=HowIsThis?
if [ -z "$CLOUDFOUNDRY_PASSWORD" ]; then
    echo "CLOUDFOUNDRY_PASSWORD must be set to $CLOUDFOUNDRY_USERNAME's cloudfoundry password "
    echo "==== Your current environment====="
    env
    exit 1
fi
gem install af
af target https://api.appfog.com
af login --email $CLOUDFOUNDRY_USERNAME --passwd $CLOUDFOUNDRY_PASSWORD
af update attjs
