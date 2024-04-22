if [ "$BITBUCKET_BRANCH" = "main" ]; then
  echo private beta build
  ./gradlew bundleRelease assembleRelease appDistributionUploadRelease --groups="lifeplus-team"
else
  echo QA build
  ./gradlew assembleRelease appDistributionUploadRelease --releaseNotes="$BITBUCKET_BRANCH"
fi
