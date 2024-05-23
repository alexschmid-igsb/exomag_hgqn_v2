#!/bin/bash

read -sp "Password for MongoDB user 'exomag_dev': " pwd_exomag_dev
echo
read -sp "Password for MongoDB user 'exomag_production': " pwd_exomag_production
echo

mongosh \
   -u root \
   -quiet \
   --eval "use exomag_dev;" \
   --eval "db.dropDatabase();" \
   --eval "try { db.dropUser('exomag_dev'); } catch(err) {}" \
   --eval "use exomag_dev;" \
   --eval "db.createUser({ user:'exomag_dev', pwd: '$pwd_exomag_dev', roles:[{db:'exomag_dev', role:'readWrite'}]});" \
   --eval "db.createCollection('dummy');" \
   --eval "use exomag_production;" \
   --eval "db.dropDatabase();" \
   --eval "try { db.dropUser('exomag_production'); } catch(err) {}" \
   --eval "use exomag_production;" \
   --eval "db.createUser({ user:'exomag_production', pwd: '$pwd_exomag_production', roles:[{db:'exomag_production', role:'readWrite'}]});" \
   --eval "db.createCollection('dummy');" \

