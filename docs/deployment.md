# Deployment Notes

This repository keeps the current GitHub Pages + Google Apps Script architecture.

## GitHub Pages

Pull requests and pushes to `main` run:

- `npm run validate`
- `npm run build`
- `npm run validate`
- official GitHub Pages artifact upload from `dist`

Only pushes to `main` deploy the Pages artifact. Pull requests validate and build the same artifact without deploying it.

## Apps Script

Apps Script production deployment remains manual.

1. Install clasp locally if needed: `npm install -g @google/clasp`.
2. Copy `tracker/.clasp.json.example` to `tracker/.clasp.json`.
3. Put the Apps Script project id in `tracker/.clasp.json`.
4. Authenticate with clasp outside the repository.
5. Push only the tracker source intentionally: `clasp push` from `tracker`.
6. Create or update a manual Apps Script deployment in the Apps Script UI or with clasp.
7. Record the Git commit SHA in the Apps Script deployment description or version note.

Do not commit `.clasp.json`, `.clasprc.json`, OAuth tokens, service account credentials, deployment credentials, spreadsheet ids, or Apps Script secrets.

Future automated Apps Script deployment can use GitHub secrets for clasp credentials, but this workflow does not enable automatic production Apps Script deployment.
