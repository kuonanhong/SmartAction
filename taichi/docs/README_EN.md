# SmartAction Tai Chi Game v2

Unzip the full package. The supplied classic `js/game.js` runs the core game by opening `index.html` directly; no npm installation is needed. For camera, the CPU language model, location and offline caching, use the included Start script (Python 3 required), localhost, or an HTTPS GitHub Pages URL.

The default is the Shizhong handbook numbering of Cheng Man-ching's **37 forms**, in a Weiwuying setting. Thirteen courses contain 131 practice nodes. The nine complete interface/course locales are Traditional Chinese, Simplified Chinese, English, Japanese, Korean, Spanish, French, German and Portuguese. Browser language preferences select the initial locale.

A teacher demonstrates a procedural pose and waits for the player's avatar to match. Use two touch pads; Q/E switch foot/hand, WASD move the selected foot, arrows move the selected hand. Additional controls adjust depth, lift, waist, crouch and extension. Three difficulties, three views, follow/partner/rhythm-sparring modes, replay, assist and focus view remain available.

These are game-authored 3D endpoints, not certified motion capture. The 24 unnumbered repeats/transitions/closing actions in the referenced 37-form chart remain as continuation metadata; they are not fully performed or graded. Other courses are introductory game selections. Consult an instructor for the complete physical routine.

Qwen3 0.6B Q4_K_M generates **text** on the visitor's CPU through bundled Wllama/WASM. It is not a facial or body model. The 484,220,320-byte model is provided separately and can be downloaded with `python3 tools/download_model.py`. The UI labels non-generated course guidance until the model is ready. A small model can make factual or semantic mistakes; do not treat it as a qualified instructor.

The core package includes the actual 5,777,746-byte MediaPipe Pose Landmarker Lite model and local CPU runtime. Camera is opt-in, processed locally in a classic worker, and stopped when the page is hidden. A separate experimental frontal 2D wrist/ankle score is shown. It cannot assess depth, waist rotation, force or physical safety. Missing, occluded, distant or turned bodies/targets are not scored. It does not automatically move the game avatar or advance lessons.

Questions can be typed, read aloud or dictated when supported. Browser speech recognition may contact a speech service. Offline TTS requires an installed local voice; it is separate from Qwen. Photos, credits, Google Maps links, opt-in geolocation and environment settings are included. Weather effects are simulated; the default licensed photo is a Weiwuying nature area, not a measured Banyan Grove scan.

Upload from the project root with `bash Upload_SmartAction.sh --with-model`; `--web-only` sends the website without Qwen weights. The default destination is the `taichi/` folder of `kuonanhong/SmartAction`, preserving the association homepage. After successful Git upload and Pages deployment, the expected URL is https://kuonanhong.github.io/SmartAction/taichi/ . Read `UPLOAD_PAT.html` for fine-grained PAT and publishing settings.

Actual verification: 48 Node logic/DOM tests, asset and model SHA checks, a native one-thread CPU Qwen inference test and local bare-Git deployment tests. DOM tests use a Canvas stub. No physical phone, actual browser WebGL, camera inference or mobile voice test was performed. `DEVICE_TESTS.html` provides a manual report with all device cases initially untested. No claim is made that every phone/browser works.

Developer edits require `npm install`, `npm run build`, `npm test` and `npm run check`. End users use the supplied bundle. Code is MIT; third-party models/runtime and photos retain their supplied licenses.
