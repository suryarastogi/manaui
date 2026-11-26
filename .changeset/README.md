# Changesets

Run `npm run changeset` when a pull request touches `packages/core`, choose
the bump (patch, minor or major) and describe the change. Merging the pull
request releases that version to npm straight away: there is no separate
versioning pull request. The docs app and the registry are not versioned:
they deploy from `main`.
