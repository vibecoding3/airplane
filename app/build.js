// Builds the Android app: copies the game into www, syncs Capacitor, builds a debug APK with Gradle.
//   node app/build.js             builds app/android/app/build/outputs/apk/debug/app-debug.apk
//   node app/build.js --install   ...and installs it on the phone connected over USB (USB debugging on)
// Needs JDK 21 and the Android SDK; by default from %LOCALAPPDATA%\Android (jdk-21, Sdk), or set
// JAVA_HOME_21 and ANDROID_HOME. Setup steps: README section 18.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const APP = __dirname, ANDROID = path.join(APP, 'android');
const local = path.join(process.env.LOCALAPPDATA || '', 'Android');
const JDK = process.env.JAVA_HOME_21 || path.join(local, 'jdk-21');
const SDK = process.env.ANDROID_HOME || path.join(local, 'Sdk');
const win = process.platform === 'win32';

for (const [what, dir] of [['JDK 21', JDK], ['Android SDK', SDK]]) {
  if (!fs.existsSync(dir)) throw new Error(`${what} not found at ${dir} (see README section 18)`);
}
const env = { ...process.env, JAVA_HOME: JDK, ANDROID_HOME: SDK };
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, env, stdio: 'inherit', shell: win });

// Gradle reads the SDK location from local.properties (git ignores it: the path is per machine)
fs.writeFileSync(path.join(ANDROID, 'local.properties'), 'sdk.dir=' + SDK.replace(/\\/g, '/') + '\n');

run('node', ['copy-web.js'], APP);
run('npx', ['cap', 'sync', 'android'], APP);
// full path: Windows may be set not to run programs from the current folder
run(path.join(ANDROID, win ? 'gradlew.bat' : 'gradlew'), ['assembleDebug', '--quiet'], ANDROID);
const apk = path.join(ANDROID, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
console.log('built ' + apk);

if (process.argv.includes('--install')) {
  run(path.join(SDK, 'platform-tools', win ? 'adb.exe' : 'adb'), ['install', '-r', apk], APP);
  console.log('installed on the phone');
}
