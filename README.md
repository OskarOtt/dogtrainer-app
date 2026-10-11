# Flink (dogtrainer-app)

Mobile app for tracking dog training sessions, plans, and progress. Built with Expo (SDK 57) + expo-router.

## Run locally

```bash
npm install
npx expo start
```

Then pick a target from the CLI output: iOS simulator, Android emulator, web, or a development build.

API base URL is read from `EXPO_PUBLIC_API_URL` (see `.env.example`), default `http://localhost:8080/api/v1`.

## Apple sign-in

Social sign-in exchanges a native provider ID token for the backend's own access and refresh tokens. Provider credentials are never persisted by the app.

Enable Sign in with Apple for the iOS bundle ID in Apple Developer. The Expo config enables the capability in EAS builds.

Apple sign-in uses native code and does not run in Expo Go. Use a development client:

```bash
eas build --platform ios --profile developmentClient
```

## Push notifications

Push notifications require a native build on a physical device. Expo Go is not supported for remote push notifications with `expo-notifications`.

Use a development client when testing:

```bash
eas build --platform ios --profile developmentClient
eas build --platform android --profile developmentClient
```

- iOS: upload an APNs key with `eas credentials`.
- Android: configure FCM v1 with a service account and provide your own `google-services.json`.
- After adding `google-services.json`, point `android.googleServicesFile` at it in `app.json` or `app.config.*`.

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
eas build --platform ios --profile developmentClient # dev client build
eas build --platform android --profile preview      # internal test build
eas submit --platform ios                           # submit an existing build
```
