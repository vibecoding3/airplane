// Paper Nosedive — Android app only (copied into app/www by copy-web.js, never part of the website).
// Loaded after main.js, so the game's globals are ready.
'use strict';

(() => {
  const plugins = window.Capacitor && window.Capacitor.Plugins;
  const App = plugins && plugins.App;
  if (!App) return;
  // the phone's Back button: one step back through the screens (goBack in main.js); on the start menu, close the app
  App.addListener('backButton', () => { if (!goBack()) App.exitApp(); });
})();
