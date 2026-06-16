# Deployment Notes

This repository keeps the current GitHub Pages + Google Apps Script architecture.

## GitHub Pages

Pull requests and pushes to `main` run:

- `npm run validate`
- `npm run build`
- `npm run validate`
- official GitHub Pages artifact upload from `dist`

Only pushes to `main` deploy the Pages artifact. Pull requests validate and build the same artifact without deploying it.

## Apps Script Deployment

Apps Script production deployment is currently manual and browser-based.

This workflow does not require local npm, local node, or local clasp.

This workflow does not enable automatic production Apps Script deployment.

### Manual Deployment Steps

1. Open the GitHub commit that should be deployed.
2. Copy the Git commit SHA.
3. Open the Apps Script project in the Apps Script web editor.
4. Open the tracker source files from the repository under `tracker/`.
5. Manually copy the approved tracker source into the Apps Script editor.
6. Update only the intended Apps Script files, for example:
   - `Code.gs`
   - `appsscript.json`
   - other tracker source files, if present
7. Save the Apps Script project.
8. Create or update the manual Apps Script deployment from the Apps Script UI:
   - `Deploy > Manage deployments`
   - or `Deploy > New deployment`
9. Record the Git commit SHA in the Apps Script deployment description or version note.

Example:

```text
Deployed from Git commit: <commit-sha>
```

10. Test the deployed Apps Script endpoint after deployment.
11. Confirm that the status dashboard still receives and displays the expected aggregate data.

### Do Not Commit Secrets Or Deployment Files

Never commit any of the following:

- `.clasp.json`
- `.clasprc.json`
- OAuth tokens
- service account credentials
- deployment credentials
- spreadsheet ids
- Apps Script secrets
- Apps Script project ids
- Apps Script deployment ids

### Local Clasp Is Not Required

Because local npm cannot be used on this machine, local clasp is not part of the production workflow.

Do not add local clasp installation, login, or push steps for this manual deployment process.

### Future Automation

Future automated or semi-automated Apps Script deployment may use GitHub Actions, GitHub secrets, or another controlled build environment.

That future workflow must be designed separately.

The current production Apps Script deployment remains manual through the Apps Script web UI.
