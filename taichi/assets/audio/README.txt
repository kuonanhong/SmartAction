SmartAction v3 — fixed offline speech recordings

570 local MP3 files: 15 interface languages × (37 Cheng movement names + 1 voice-test phrase).
Generated on 2026-10-11 with eSpeak NG 1.51. Original, game-authored translated text.
These are mechanical synthesized recordings, not recordings of a teacher or a cloned person.
Only fixed labels and the test phrase are covered. Qwen-generated conversation requires a
system/browser TTS voice. No arbitrary response is substituted by a prerecorded phrase.

Mandarin (both zh-TW/zh-CN UI): cmn-latn-pinyin engine; Mandarin pronunciation, no claim of
Taiwan-accent speech. Tone-number input is explicitly listed in manifest.json.
Japanese: kana input, because eSpeak NG 1.51 does not correctly pronounce these kanji labels.
Other languages use the named language engine in the manifest. Naturalness and pronunciation
vary; these files have not been reviewed by native-speaker martial-arts instructors.

Use 'Enable / test voice' after opening the page. Native device voices are preferred. If no
matching device voice exists, supported fixed text uses the corresponding local MP3.
The voice picker also exposes 'eSpeak NG · 37' to manually test the recording when a device
voice is silent. Audio playback still needs a user tap and audible device/media volume.
No mobile physical-device or hearing test is implied by automated unit tests.

Provenance: https://github.com/espeak-ng/espeak-ng
Engine license: GPL-3.0-or-later. Engine executables, libraries and voice dictionaries are not
bundled in this application. Only generated audio is included; upstream GPL section 2
specifies the conditions under which output itself is a covered work.
https://github.com/espeak-ng/espeak-ng/blob/master/COPYING
The project-generated recordings and text are supplied under the project's MIT license.
No copyrighted music, external human performance or third-party voice clone is used.

Every clip has source text, actual synthesis text, engine voice, byte length and SHA-256 in
manifest.json. Regenerate with installed espeak-ng + ffmpeg:
  python3 tools/generate_recorded_speech.py
The generator can run without internet once its two command-line tools are installed.
