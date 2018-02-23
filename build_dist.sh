#!/bin/bash
set -e #Set errors to fail explicitly

# build dist
grunt dist

# I only want to build and commit if I'm on master
if [ "${TRAVIS_BRANCH}" == "master" ]
then
  # initialize and commit everything in pages
  cd dist
  git init
  git config user.name "Travis"
  git config user.email "Travis"
  git add .
  git commit -m "Built dist assets [ci skip]"

  # hide my output for security reasons
  # force it because we want this to just actually work
  # note, I'm pushing to a remote branch for the dist assets from master
  git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master 2>&1
else
  echo "Current branch is not master and dist will not be built or committed."
fi