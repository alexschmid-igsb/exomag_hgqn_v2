#!/bin/bash

read -sp "Password for MongoDB user 'hgqn_dev': " pwd_hgqn_dev
echo
read -sp "Password for MongoDB user 'hgqn_production': " pwd_hgqn_production
echo

mongosh \
   -u root \
   --eval "use hgqn_dev;" \
   --eval "try { db.dropDatabase(); } catch(err) { console.log(err.message) }" \
   --eval "try { db.dropUser('hgqn_dev'); } catch(err) { console.log(err.message) }" \
   --eval "use hgqn_dev;" \
   --eval "db.createUser({ user:'hgqn_dev', pwd: '$pwd_hgqn_dev', roles:[{db:'hgqn_dev', role:'readWrite'}]});" \
   --eval "db.createCollection('dummy');" \
   --eval "use hgqn_production;" \
   --eval "try { db.dropDatabase(); } catch(err) { console.log(err.message) }" \
   --eval "try { db.dropUser('hgqn_production'); } catch(err) { console.log(err.message) }" \
   --eval "use hgqn_production;" \
   --eval "db.createUser({ user:'hgqn_production', pwd: '$pwd_hgqn_production', roles:[{db:'hgqn_production', role:'readWrite'}]});" \
   --eval "db.createCollection('dummy');" \


