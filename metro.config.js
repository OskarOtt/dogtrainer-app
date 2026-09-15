// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// `@lexical/*` packages (used by the Lexical DOM notes editor, see
// `src/components/rich-text/lexical-notes-editor.dom.tsx`) ship a `"node"` package.json
// export condition intended for React Server Components tooling. That variant isn't valid
// for Metro's bundler/minifier and breaks Expo Router's static web rendering (which resolves
// modules with the `"node"` condition for its SSR bundle) with a `ReferenceError: await is not
// defined`. These packages only ever run inside the DOM component's client-side WebView/web
// bundle, never on the server, so it's safe to always resolve them without the `"node"`
// condition.
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'lexical' || moduleName.startsWith('@lexical/')) {
    const conditionNames = (context.unstable_conditionNames ?? []).filter((name) => name !== 'node');
    const nextContext = { ...context, unstable_conditionNames: conditionNames };
    return defaultResolveRequest
      ? defaultResolveRequest(nextContext, moduleName, platform)
      : nextContext.resolveRequest(nextContext, moduleName, platform);
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
