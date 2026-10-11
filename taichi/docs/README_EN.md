# SmartAction Tai Chi Practice Game v3

A downloadable static practice game for GitHub Pages. Defaults: Weiwuying, Kaohsiung; Cheng Man-ching's 37 named sections. Includes 13 curricula, 131 practice nodes, 15 interface/curriculum languages and a photo-backed virtual park walk.

**繁體中文完整教學：[README_ZH.md](README_ZH.md) · [HTML 手冊](guide.html)**

## Quick start

Extract the entire `SmartAction_Taichi_Game_v3.zip`, keeping all directories beside `index.html`. Opening `index.html` directly runs the core game. For models, camera, geolocation, media and offline caching, use HTTPS or the included local server:

```bash
# macOS, from the extracted game directory
bash Start_Mac.command
# Linux
bash Start_Linux.sh
```

Windows: open `Start_Windows.bat`. Python 3 is required; no Python packages are needed. Default address: `http://localhost:8088/`. Keep the server terminal open; Ctrl+C stops it. Add `--port 8090` if necessary. Phones should use the deployed HTTPS site; your desktop's localhost is not a phone URL.

## What changed in v3

- Mobile speech uses explicit **Enable / test voice**, playback status, and an available-device voice selector. A default “on” preference alone is not evidence of sound. Tap to activate; check media volume. For fixed Cheng 37 names and the test sentence, missing matching system voices can use explicitly labeled synthesized recordings. Async coach replies can be replayed with a direct tap.
- Partner practice has six alternating demonstrations and responses. Response windows are 24/18/14 seconds for Basic/Pro/Master. Failed attempts repeat more slowly.
- Rhythm sparring has a 60-second round, Strike/Block cues, cooldown, stamina and results. It is a non-contact game against a computer avatar, not network multiplayer or physical sparring instruction.
- Nearby walk preserves the current in-page practice state. Left pad moves, right pad looks, Q jumps, E greets and holding X crouches. Resume practice restores the saved state. Reloading the page does not preserve this complete mid-round snapshot.
- Real-location catalog: 158 distinct entries, 155 bundled licensed photos including five verified 360° panoramas, plus two 12-second flat real-world video clips.
- One script updates both repositories and adds a small game entry to the existing SmartAction home page.

## Difficulty

| Level | Total score | Minimum hands/feet/body | Hold | Position scoring scale |
|---|---:|---:|---:|---:|
| Basic | 78 | 65 each | 1.0 s | 0.29 m |
| Pro | 88 | 78 each | 1.6 s | 0.21 m |
| Master | 94 | 88 each | 2.2 s | 0.15 m |

Master hides the target outline and disables assistance. The position scale is a parameter of the avatar score, not a hard acceptance radius or a human skill certificate. Both total and component thresholds must be met.

Practice controls: WASD feet, arrows hands, Q/E switch leg/hand, F/B reach/retract, J/K lift/lower foot, Z/C waist, X/T crouch/rise, V/N stretch/relax. Space pauses, R replays, H assists, 1/2/3 select views. Rhythm sparring: P strikes, hold G to block. Touch controls support concurrent presses.

## Languages and speech

Traditional Chinese, Simplified Chinese, English, Japanese, Korean, Spanish, French, German, Portuguese, Italian, Indonesian, Vietnamese, Thai, Arabic and Hindi. First launch follows `navigator.languages`; a manual override is saved. GPS does not determine a person's language. Maps links use the selected language where supported.

All curriculum fields and movement/continuation names are covered. The six added languages use localized endpoint-derived cues, following the existing adapter approach, with movement safety limits retained. They are not sentence-for-sentence translations of the Chinese/English prose and have not been reviewed by native-speaking instructors. Place proper names may remain transliterated.

Speech prefers installed browser/OS voices; not every device supplies every language. The package also includes **570 local MP3 clips**: 15 languages × (37 Cheng movement names + one test sentence), about 7.6 MB. These are explicitly labeled eSpeak mechanical recordings, not human narration or native-speaker-reviewed pronunciation. They provide fallback for those fixed phrases; arbitrary Qwen answers and other curricula still need an appropriate OS voice. Some system voices and speech recognition require a network. Media volume/output remains under device control. Text remains usable if speech is unavailable.

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

For offline use, first cache scenes with **Download offline scenes** and separately acquire/load the model. Bundled MP3 recordings can play offline once downloaded. Maps, live nearby queries and some system voices still require a network. Browsers may evict stored content.

## Deploy both sites

Prerequisites: Bash 3.2+, Git, Python 3.8+, and a fine-grained GitHub token with **Contents: Read and write** for both `kuonanhong/SmartAction` and `kuonanhong/taichi`. Windows users can run the script in Git Bash. See `docs/UPLOAD_PAT.html` for account setup.

From the complete v3 game directory:

```bash
bash Upload_Both_Sites.sh --fresh-login
```

The default includes model verification/import/download and uploads. To update only web assets and preserve existing remote weights:

```bash
bash Upload_Both_Sites.sh --web-only --fresh-login
```

| Repository | Destination | Public game URL |
|---|---|---|
| `kuonanhong/SmartAction` | `taichi/` plus a small home-page entry | https://kuonanhong.github.io/SmartAction/taichi/ |
| `kuonanhong/taichi` | repository root | https://kuonanhong.github.io/taichi/ |

Upload the contents, not an extra enclosing game directory. Relative model paths work for both URLs. The game links back to the association home page. The script compares files, verifies commits and supports reruns after partial success; it does not delete unrelated remote content or force-push. `--fresh-login` bypasses old credentials for this invocation, but cannot grant missing permissions.

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
