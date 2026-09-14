# Releasing

HACS installs the file attached to the latest GitHub release, named by
`filename` in `hacs.json` (`open-tides-card.js`). `dist/` is gitignored;
the release workflow builds it fresh and attaches it.

1. Update `CHANGELOG.md`.
2. Bump `version` in `package.json` on a branch, PR, merge.
3. Tag: `git tag vX.Y.Z && git push origin vX.Y.Z`.
4. `.github/workflows/release.yml` checks the tag matches `package.json`,
   runs the tests, builds, and creates a release with
   `dist/open-tides-card.js` attached and generated notes.

The tag must match the `package.json` version or the workflow refuses.

## Compatibility

Note in the changelog which open-tides version each release tracks. The
card degrades on shape mismatches rather than failing, but a contract
change in the integration should be a minor bump here with the new
minimum called out.
