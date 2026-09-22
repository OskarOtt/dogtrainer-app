# Flink (dogtrainer-app)

Mobile app for tracking dog training sessions, plans, and progress. Built with Expo (SDK 57) + expo-router.

## Run locally

```bash
npm install
npx expo start
```

Then pick a target from the CLI output: iOS simulator, Android emulator, web, or a development build.

API base URL is read from `EXPO_PUBLIC_API_URL` (see `.env.example`), default `http://localhost:8080/api/v1`.

## Lint

```bash
npm run lint
```

## EAS

Build and submit production iOS build:

```bash
eas build --platform ios --profile production --auto-submit
```

Other useful commands:

```bash
eas build --platform ios --profile development     # dev client build
eas build --platform android --profile preview      # internal test build
eas submit --platform ios                           # submit an existing build
```
