# SmartAction Tai Chi Practice Game v4

A downloadable static practice game for GitHub Pages. Defaults: Weiwuying, Kaohsiung; Cheng Man-ching's 37 named sections. Includes 13 curricula, 131 practice nodes, 18 interface/curriculum languages and a photo-backed virtual park walk.

**繁體中文完整教學：[README_ZH.md](README_ZH.md) · [HTML 手冊](docs/guide.html)**

## Quick start

Extract the entire `SmartAction_Taichi_Game_v4.zip`, keeping all directories beside `index.html`. Opening `index.html` directly runs the core game. For models, camera, geolocation, media and offline caching, use HTTPS or the included local server:

```bash
# macOS, from the extracted game directory
bash Start_Mac.command
# Linux
bash Start_Linux.sh
```

Windows: open `Start_Windows.bat`. Python 3 is required; no Python packages are needed. Default address: `http://localhost:8088/`. Keep the server terminal open; Ctrl+C stops it. Add `--port 8090` if necessary. Phones should use the deployed HTTPS site; your desktop's localhost is not a phone URL.

## What changed in v4

- Speech handling addresses idle cancellation, stale asynchronous callbacks and duplicate requests. Fixed phrases can fall back to local audio when system speech fails or stalls. A screenshot saying “blocked” does not identify the browser/OS cause.
- Eight Kokoro natural synthesized voice banks cover Mandarin (two masculine and two feminine voices) and English (two of each), with 37 Cheng movement names and a test phrase per bank. Source selection, voice-type filtering, remembered rate, replay and direct audio tests are available.
- UI and full curriculum data now cover 18 languages, adding Russian, Turkish and Dutch. Each language has 38 eSpeak fallback clips.
- The practice scene and bottom controls stay adjacent, with safe-area handling, expandable settings and viewport/orientation resizing. Main touch targets are designed for at least 44 px.
- Existing v3 features remain: six-exchange partner practice, 60-second rhythm sparring, three difficulty levels and perspectives, and a nearby walk that preserves in-page practice state.
- The catalog remains 158 distinct locations, 155 licensed photos including five verified 360° panoramas, and two 12-second flat real-world clips.
- Qwen3 CPU coaching, body tracking and both-site deployment remain. The 15-part Qwen model format is unchanged; the association homepage keeps its game entry.

## Difficulty

| Level | Total score | Minimum hands/feet/body | Hold | Position scoring scale |
|---|---:|---:|---:|---:|
| Basic | 78 | 65 each | 1.0 s | 0.29 m |
| Pro | 88 | 78 each | 1.6 s | 0.21 m |
| Master | 94 | 88 each | 2.2 s | 0.15 m |

Master hides the target outline and disables assistance. The position scale is a parameter of the avatar score, not a hard acceptance radius or a human skill certificate. Both total and component thresholds must be met.

The scene stays next to the bottom control dock. Expand settings as needed; viewport/orientation changes and safe areas are handled by the layout module. Main controls target at least 44 px, while small screens can scroll settings. Actual Safari/Android browser-bar and keyboard behavior still needs device verification.

Practice controls: WASD feet, arrows hands, Q/E switch leg/hand, F/B reach/retract, J/K lift/lower foot, Z/C waist, X/T crouch/rise, V/N stretch/relax. Space pauses, R replays, H assists, 1/2/3 select views. Rhythm sparring: P strikes, hold G to block. Touch controls support concurrent presses.

## Languages, voices and playback

Traditional Chinese, Simplified Chinese, English, Japanese, Korean, Spanish, French, German, Portuguese, Italian, Indonesian, Vietnamese, Thai, Arabic, Hindi, Russian, Turkish and Dutch are supported. First launch follows `navigator.languages`; a manual override is saved. GPS does not determine a person's language. Maps links use the selected language where supported.

UI strings and all curriculum names, descriptions, sources, cues and movement objectives are covered, including the three newly added languages. Some cues are localized from the same target-pose adapter rather than sentence-for-sentence translations of the Chinese/English prose. Proper names may remain transliterated. Coverage does not establish native-instructor review or guarantee generated answers.

Tap **Start practice** or **Enable / test voice** to unlock playback synchronously from a user gesture. A saved “on” preference is not evidence that sound played. Select a source/voice and rate, then test or replay. Automatic mode prefers available natural recordings for their exact Mandarin/English phrases, otherwise uses a matching system voice and fixed mechanical fallback where available. Source/language status reports what actually plays. System stalls and errors can trigger local fallback for phrases that have recordings.

| Source | Included content | Scope |
|---|---|---|
| Kokoro natural synthesized recordings | Eight banks × (37 movement names + one test phrase) = 304 MP3 clips | Mandarin: two masculine/two feminine; English: two masculine/two feminine |
| eSpeak mechanical recordings | 18 languages × 38 fixed phrases = 684 MP3 clips | Fixed Cheng names and test sentences; not human narration or native-reviewed pronunciation |
| Browser/OS speech synthesis | Voices installed or supplied by the user's device | Arbitrary text, including new Qwen answers; available languages and offline behavior vary |

The Mandarin voices are synthesized standard Mandarin, not a guarantee of a Taiwanese accent. Bank IDs are `zm_yunxi`, `zm_yunjian`, `zf_xiaobei`, `zf_xiaoyi`, `am_michael`, `am_puck`, `af_heart` and `af_bella`; see `data/natural-voices-v4.js` and `assets/audio-natural/`. Kokoro-82M was used to render these recordings during production. Its roughly 340 MB synthesis weights are not shipped or run in this website. Fixed recordings do not provide live arbitrary-text Kokoro synthesis.

Male/female filtering uses declared metadata for bundled voices. The browser's system-voice API has no reliable gender field, so unknown system voices are not guessed from their names. The selected rate is remembered in the same browser. **Audio test** explicitly tests a known local phrase; replay can repeat the last utterance. An arbitrary Qwen answer still needs an appropriate system voice, even if a natural bank is selected; otherwise text remains available with a status message.

If the page says “blocked”, tap a playback control and compare the direct audio test, then check media volume and output. That message alone cannot diagnose an OS setting. Playback events do not prove the listener heard sound. Returning from a background tab may require another tap. Some system voices and speech recognition require a network; these are separate from local Qwen text generation.

## Scenes, maps and walking

The scene combines real photographs with a procedural 3D park and avatars. Ground and objects provide camera parallax; a flat photo cannot provide unseen geometry. Five sources are true 360° panoramas; the other photos and the two video clips are flat. These are not exact digital twins or continuous reconstructed street walks.

Walking increases horizontal field of view by about 5%. The virtual scene is bounded to approximately ±60 m on each horizontal axis. Coordinates are calculated from the avatar's virtual offset from a representative location; they are not live GPS tracking or surveyed navigation. Residents use scripted greetings.

Google Maps and Street View open external Google views at the virtual coordinate. Street View availability is controlled by Google; its imagery is not downloaded or rehosted. Nearby search uses browser geolocation, the bundled catalog and available OpenStreetMap results, with an external dojo-search link. It is not an exhaustive directory.

Three requested parks lack verified reusable photos: Mengli Forest Park, Shuanghu Park and Renwu Park. Mengli also lacks a sufficiently reliable coordinate here and provides a place-name map search instead. No unrelated photo is substituted. Credits and license details must remain attached; see `docs/PHOTO_CREDITS.html`.

## Models

| Component | Purpose |
|---|---|
| Qwen3 0.6B Q4_K_M | Local text generation through Wllama/WASM, single CPU thread; no GPU required |
| MediaPipe Pose Landmarker Lite | Optional camera-based 33-point body estimate and rough frontal 2D comparison |
| Three.js procedural avatars | Animation, controls and camera; not neural motion capture |

Qwen is neither a face-animation model nor a body detector. It receives text/numeric context, not camera images. This project does not use LivePortrait. Camera matching does not automatically pass an avatar lesson and cannot assess joint safety, full depth, force or Tai Chi quality.

The 484,220,320-byte Qwen model is distributed separately as 15 parts. The small MediaPipe `.task` is included. Place Qwen parts in `models/` beside `models/manifest.json`, preserving `models/pose/`. The separate `SmartAction_Qwen3_CPU_Weights/models/` folder may remain a sibling installation source; the upload script imports valid parts from it.

```bash
python3 tools/download_model.py
```

Then open the game via localhost/HTTPS, expand the coach/model panel and load the downloaded model. Browser downloads go to browser storage, not automatically to project files or GitHub. The core game remains available without Qwen. Responses can be incorrect; the small general language model is not a validated martial-arts coach.

For offline use, first cache scenes with **Download offline scenes** and separately acquire/load the model. Bundled natural and mechanical MP3 recordings can play offline once downloaded. Maps, live nearby queries and some system voices still require a network. Browsers may evict stored content.

## Deploy both sites

Prerequisites: Bash 3.2+, Git, Python 3.8+, and a fine-grained GitHub token with **Contents: Read and write** for both `kuonanhong/SmartAction` and `kuonanhong/taichi`. Windows users can run the script in Git Bash. See `docs/UPLOAD_PAT.html` for account setup.

From the complete v4 game directory:

```bash
bash Upload_Both_Sites.sh --fresh-login
```

For a full project extracted in macOS Downloads, use this complete path from any directory:

```bash
bash "$HOME/Downloads/SmartAction_Taichi_Game_v4/Upload_Both_Sites.sh" --fresh-login
```

Keep the script beside the game’s `index.html`; a standalone script in Downloads does not contain the project.

The default includes model verification/import/download and uploads. To update only web assets and preserve existing remote weights:

```bash
bash Upload_Both_Sites.sh --web-only --fresh-login
```

| Repository | Destination | Public game URL |
|---|---|---|
| `kuonanhong/SmartAction` | `taichi/` plus a small home-page entry | https://kuonanhong.github.io/SmartAction/taichi/ |
| `kuonanhong/taichi` | repository root | https://kuonanhong.github.io/taichi/ |

Upload the contents, not an extra enclosing game directory. Relative model paths work for both URLs. The game links back to the association home page. The script compares files, verifies commits and supports reruns after partial success; it does not delete unrelated remote content or force-push. `--fresh-login` bypasses old credentials for this invocation, but cannot grant missing permissions.

Website batches are at most 96 MiB; models remain at most two parts / 64 MiB. A roughly 110–150 MB website normally takes two batches plus eight model batches per site. Earlier Pages builds in the same hour can still consume the per-site soft limit, and the last deployment must be checked.

Configure each repository's Pages source separately and wait for successful Pages Actions. Existing custom publishing workflows must include the game directory. No actual account login or GitHub push was performed for this delivery.

## Evidence and limitations

The 37 names/numbering follow the cited Shizhong handbook. Each game section is one authored target pose; 24 connecting/repeated/closing movements are metadata, not all fully animated. Other curricula remain introductory samples, not complete certified forms.

Logic, data and deployment checks are documented in `docs/TEST_REPORT.md`. Physical iPhone/iPad/Android tests and real browser WebGL/speech/camera QA have not been completed. Do not interpret automated or DOM tests as device certification. Use `docs/DEVICE_TESTS.html` to record local observations.

## Development

Players do not need npm. After editing `js/` or `data/`, rebuild the bundled script consumed by `index.html`:

```bash
npm install
npm run build
npm test
npm run check
python3 tools/package.py
```

Core archives exclude the large Qwen parts. Code, third-party runtimes, models, images and videos retain their respective included licenses.
