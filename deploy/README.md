# MatchPulse Staging Deployment

This deploys the Next.js 15 standalone build to Cloud Run in the staging project:

- Project: `matchpulse-staging-da54c`
- Service: `matchpulse-stage`
- Region: `europe-west3`
- Artifact Registry repository: `matchpulse`
- Image: `matchpulse-web`

Firebase Admin uses Cloud Run Application Default Credentials. Do not add service account private keys to staging env files.

## 1. Select Project

```bash
gcloud config set project matchpulse-staging-da54c
```

## 2. Enable Required APIs

```bash
gcloud services enable \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  firestore.googleapis.com \
  firebase.googleapis.com \
  identitytoolkit.googleapis.com
```

## 3. Create Artifact Registry Repository

Run this once if the repository does not already exist:

```bash
gcloud artifacts repositories create matchpulse \
  --repository-format=docker \
  --location=europe-west3 \
  --description="MatchPulse staging container images"
```

## 4. Grant Deployment IAM

For first-time Cloud Build deployments, grant the Cloud Build service account permission to push images and deploy Cloud Run:

```bash
PROJECT_NUMBER="$(gcloud projects describe matchpulse-staging-da54c --format='value(projectNumber)')"
CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding matchpulse-staging-da54c \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding matchpulse-staging-da54c \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding matchpulse-staging-da54c \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/iam.serviceAccountUser"
```

## 5. Deploy Firestore Rules

`firebase.json` already points to `firestore.rules`.

```bash
npx firebase deploy --only firestore:rules --project matchpulse-staging-da54c
```

## 6. Create Staging Env File

```bash
cp deploy/staging.env.yaml.example deploy/staging.env.yaml
```

Fill these values from the Firebase web app config for `matchpulse-staging-da54c`:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_APP_URL`

Do not add local emulator values to staging:

- `NEXT_PUBLIC_FIREBASE_USE_EMULATORS`
- `FIREBASE_AUTH_EMULATOR_HOST`
- `FIRESTORE_EMULATOR_HOST`

Do not add service account key values to staging:

- `FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL`
- `FIREBASE_SERVICE_ACCOUNT_PROJECT_ID`

## 7. First Deployment Flow

Cloud Run URL is not known until the first deploy. For the first deploy, set:

```yaml
NEXT_PUBLIC_APP_URL: "https://matchpulse-stage-placeholder"
```

Then submit the build:

```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions "_REGION=europe-west3,_SERVICE=matchpulse-stage,_REPOSITORY=matchpulse,_IMAGE=matchpulse-web,_ENV_FILE=deploy/staging.env.yaml,_TAG=latest"
```

Get the deployed Cloud Run URL:

```bash
gcloud run services describe matchpulse-stage \
  --region=europe-west3 \
  --format="value(status.url)"
```

Update `deploy/staging.env.yaml`:

```yaml
NEXT_PUBLIC_APP_URL: "<actual-cloud-run-url>"
```

## 8. Add Firebase Auth Authorized Domain

In Firebase Console for `matchpulse-staging-da54c`:

1. Open Authentication.
2. Open Settings.
3. Open Authorized domains.
4. Add the Cloud Run hostname from the service URL, without `https://`.

Example:

```text
matchpulse-stage-xxxxx-ew.a.run.app
```

## 9. Redeploy With Final App URL

Next.js public env values are used during `npm run build`, so redeploy after `NEXT_PUBLIC_APP_URL` is set:

```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions "_REGION=europe-west3,_SERVICE=matchpulse-stage,_REPOSITORY=matchpulse,_IMAGE=matchpulse-web,_ENV_FILE=deploy/staging.env.yaml,_TAG=latest"
```

## 10. Check Health

```bash
curl "$(gcloud run services describe matchpulse-stage \
  --region=europe-west3 \
  --format="value(status.url)")/api/health"
```

Expected response:

```json
{"ok":true,"service":"matchpulse","environment":"production"}
```

Cloud Run sets `NODE_ENV=production`; app environment is controlled by `APP_ENV=staging`.

## Notes

- `deploy/staging.env.yaml` is intentionally not committed.
- `cloudbuild.yaml` reads the `_ENV_FILE` Cloud Build substitution for Docker build args because Firebase public browser config must be available during `next build`.
- `cloudbuild.yaml` uses `_TAG=latest` by default for manual builds. Override `_TAG` with a release identifier when needed.
- The same env file is passed to Cloud Run with `--env-vars-file`.
- No Firebase emulator variables should be present in staging.
- No secrets are required for the current mock sports provider staging deployment.
