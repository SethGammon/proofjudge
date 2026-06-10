# ProofJudge — Video Production Document

> **v4 (FINAL): `docs/social/video/proofjudge-promo-v4.mp4`** — the sound-redesign cut.
> Exactly 60.0s. **No voice-over** (the kinetic type is the narration; muted-safe by design).
> Film retimed to an **80 BPM grid** (3.0s bars, 20 bars): Hook 1 · Question 1 · Case 2 ·
> TEE 3 · Receipt 3 · Verified 2 · Drop 4 · Flash 2 · Close 2. Score rewritten as a
> "settlement pulse": heartbeat kick on 1 & 3, pure sine sub bass, FM Rhodes-style keys,
> warm pads, soft dark shaker — no claps, no saw stabs, nothing bright. Music ramps to
> **true digital silence** at 35.7s; the sub drop hits at **39.0s** with a dry paper-crack
> and a new *elegant alarm* (two falling bell partials + airy swoosh, `cue-alarm.wav`).
> Master: −16.5 LUFS integrated, −1.5 dBTP, manual linear gain + true-peak limiter (no
> dynamic loudnorm pumping). Rebuild in `.planning/promo/`: `node gen-cues.mjs` →
> `node music.mjs` → `node mix.mjs` →
> `npx remotion render src/index.ts ProofPromo render-v4.mp4 --codec h264 --crf 16` → mux with
> `ffmpeg -i render-v4.mp4 -i master.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 320k -movflags +faststart -shortest out.mp4`
> (the explicit `-map` flags are required — Remotion renders carry a silent audio track that
> ffmpeg will otherwise pick over master.wav).
> v3 audio pipeline preserved as `music-v3.mjs` / `mix-v3.mjs` / `track-v3.wav` / `master-v3.wav`.
>
> **v3 (superseded): `docs/social/video/proofjudge-promo-v3.mp4`** — v2 plus: all strobe/flash
> overlays removed (photosensitivity), continuous push-ins so no frame ever freezes,
> **Kokoro-82M neural narration** (am_michael, 8 lines, EQ/comp polish chain, sidechain-ducked
> music), punchier kick / tamed hats / stab echoes, eased pre-drop silence, master at −15 LUFS.
> Regenerate VO: `node gen-vo-kokoro.mjs`; track: `node music.mjs`; mix: `node mix.mjs`;
> film: `npx remotion render src/index.ts ProofPromo render-v3.mp4 --codec h264 --crf 16`.
>
> **v2 (superseded): `docs/social/video/proofjudge-promo-v2.mp4`** — 54s motion-graphics film,
> 1080p60, no VO, beat-locked to a coded 120 BPM track (every cut on a bar, stamps on downbeats,
> music drops dead at "CHANGE ONE BYTE."). Built with Remotion in `.planning/promo/` (scenes in
> `src/scenes.tsx`, track in `music.mjs`, mix in `mix.mjs`); re-render with
> `npx remotion render src/index.ts ProofPromo render.mp4 --codec h264 --crf 16` then `node mix.mjs`
> and mux. Receipt data in the film = the real artifact sealed by the live judge.
> Thumbnail: `thumbnail-promo.png` (the red-stamp drop frame).
>
> **v1 (superseded):** `docs/social/video/proofjudge-proof-v1.mp4` (88.6s, 1080p30, −14 LUFS) and
> `thumbnail-tamper.png` were built from this document on Jun 10 — recorded against the **live
> Code Judge deployment** (real LLM verdict 78/pass, HMAC-SHA256, `eigencompute` attestation)
> with neural VO (en-US-Andrew) and a fully synthesized SFX palette. The pipeline lives in
> `.planning/video/` (gen-vo → record → build-audio → encode) and can re-render a new take
> end-to-end in ~5 minutes.

The 60–90s demo video for EigenCloud's Thursday post. This is the production bible: what we
record, what is said, what is heard, and how it's mixed. Companion: `docs/social/post-kit.md`
(tweet copy, thumbnail, honesty checklist).

**Framing (from Mustafa):** the video exists to show developers/founders *what you can build
with TEEs*. ProofJudge is the proof of that, not just the product being sold.

---

## 1. What we record

The **Stage** ("Run the proof"), driven **manually with the `→` key**, paced to the voice-over.
Autoplay exists, but manual pacing lets each act breathe under the VO and lets us hold the
tamper frame. The on-screen captions double as burned-in subtitles — the video reads fully muted.

- **Record against a live deployment** (LLM mode → varied scores, `eigencompute` attestation).
  Local heuristic mode is the fallback; it works but scores read 100/100.
- One pre-roll bonus shot before the Stage: 3 seconds of the **threshold** (floating specimen,
  ticker drifting) as the cold-open background, then click *Watch the proof*.
- One post-roll bonus shot: after the close card, click *Open the console* and let the
  **station assembly** play (cards docking in) — this is the "it's a real product" outro beat.

### Capture settings
| Setting | Value |
|---|---|
| Window | 1920×1080, clean browser profile, no bookmarks bar, 100% zoom |
| Frame rate | 60 fps capture, deliver 30 or 60 |
| Cursor | Visible — the tamper click must read as a human act. Move deliberately, no jitter. |
| Tool | OBS (display capture) or ScreenFlow; disable notifications/Do Not Disturb |
| Safe area | Keep awareness of a center-crop: key captions sit low-center and survive 1:1 crop |

---

## 2. Master timeline — picture · voice · sound

Total target ≈ 70 seconds. VO ≈ 150 words (~130 wpm, unhurried). Advance each act on the
VO cue marked **[→]**.

| # | Time | On screen | Voice-over | Sound |
|---|---|---|---|---|
| 0 | 0:00–0:03 | Threshold: floating receipt, ticker | — (beat of silence, then music fades in) | Room tone + music bed enters at −24 dB, rising |
| 1 | 0:03–0:10 | Act 1 title card: "Agents are deciding who gets paid." / *Who verifies the judge?* | "Agents are starting to decide who gets paid. Which raises a question nobody's answering — **who verifies the judge?**" | Music settles into pulse. Soft sub swell under the italic question. **[→]** on "judge?" |
| 2 | 0:10–0:19 | Act 2: three case sheets assemble | "Here's a real case. The terms that were promised. The rubric that defines *done*. And the work that actually arrived." | Three soft paper-slide ticks, one per sheet (sync to their stagger). **[→]** |
| 3 | 0:19–0:29 | Act 3: identity bar + pipeline runs (real API call) | "ProofJudge runs the judgment inside an EigenCompute TEE — attested compute, under an app identity anyone can inspect. Hashed, scored, sealed, signed." | Five quiet telemetry ticks ascending with the pipeline steps; low processing hum under. **[→]** when "Sign receipt" completes |
| 4 | 0:29–0:38 | Act 4: the paper prints, score counts up, seal stamps | "The verdict prints as a signed receipt. Settlement action. Hashes. Judge identity. Locked." | **Hero SFX:** thermal-printer chirr (0.6s) as the paper drops in → count-up tick roll → felt **stamp thud** on the seal. **[→]** |
| 5 | 0:38–0:47 | Act 5: VERIFIED + six checks cascade (real verify) | "And anyone can re-verify it against the live judge. Schema. Hashes. Signature. Identity. All checked." | Three-note ascending chime motif (the "verify motif"), then one soft tick per check row. **[→]** |
| 6 | 0:47–1:00 | Act 6: cursor moves to the score, clicks. Red VERIFICATION FAILED slams, seal cracks, hashes mismatch. **Hold this frame 2 extra seconds.** | "Now watch what happens if anyone touches it after sealing. One point. *(click — pause 1.5s, let the slam land)* The hash breaks. The signature breaks. Money doesn't move." | **Music drops to silence on the click.** Dry sub-thump + paper-crack layered (no alarm, no riser — the silence is the impact). Checks fail with dull ticks. |
| 7 | 1:00–1:08 | Act 7: "Proof, not promises." + *Built on EigenCompute* | "ProofJudge doesn't make AI judgment perfect. It makes it **accountable**. Proof — not promises." | Music returns warm, one final low resolve note. |
| 8 | 1:08–1:12 | Click *Open the console* → station assembles, four judges dock in | — (no VO; let the product breathe) | Four soft dock ticks with the cards; music tail rings out. |

**The thumbnail frame** is the held moment in beat 6 — red stamp over green ACCEPTED.

### Alt cut — 30 seconds (if Eigen wants a short)
Beats 1 → 4 → 6 → 7 only. VO: "Agents are deciding who gets paid — so who verifies the judge?
/ Every verdict becomes a signed receipt, sealed in an EigenCompute TEE. / Change one field —
verification fails. / Proof, not promises."

---

## 3. Voice-over direction

- **Tone:** calm, dry, certain. A court clerk who has seen everything — not a crypto hype reel.
  Think documentary narrator at conversational volume, slight smile on "who verifies the judge?"
- **Pace:** ~130 wpm. Leave real silence around the click in beat 6 — the cut depends on it.
- **Pronunciations:** EigenCompute = "EYE-gen-com-pyoot". TEE = letters, "tee-ee-ee" is wrong —
  say "T-E-E" or "trusted execution environment" never both. HMAC = "aitch-mac".
- **Emphasis:** the four bolded phrases in the table; everything else flat and even.
- **Recording:** 48 kHz/24-bit, large-diaphragm condenser or a clean dynamic (SM7B-class),
  10–15 cm off-axis, treated room or closet. Three full takes + safety lines for beats 1, 6, 7.
- If no human VO is available: a premium TTS voice (e.g. a low, measured male/female read) is
  acceptable — but regenerate beat 6 until the pause around the click feels human.

## 4. Sound design palette

Character: **paper, felt, glass, and electricity.** Everything small and physical; nothing
"whoosh-cinematic." Mono-compatible. Suggested sources: any pro SFX library or Freesound
equivalents; synth the ticks if needed (short filtered sine/noise bursts).

| Cue | Character | Notes |
|---|---|---|
| Music bed | 80–90 BPM, dark analog pulse, slate-grey mood, no melody hook | Sidechain/duck −6 dB under VO. Must die instantly at the tamper click (cut, not fade) |
| Sheet ticks | Paper slide + soft thock | 3×, −18 dB, pitch-varied |
| Pipeline ticks | Tiny telemetry blips, ascending pitch | 5×, sync to steps lighting |
| Printer chirr | Thermal receipt printer, 0.5–0.7s | The signature sound of the product |
| Count-up roll | Faint mechanical counter ticks | Under the score animation only |
| Seal stamp | Felt-on-paper thud, low, dry | Single, −10 dB, slight room |
| Verify motif | Three ascending soft sine/marimba notes | Reuse nowhere else — it means "proven" |
| Check ticks | Soft affirmative blips | 6×, quieter than verify motif |
| **Tamper hit** | Sub thump (50–60 Hz) + dry paper crack, no reverb tail | The only loud moment. Music is already silent. |
| Fail ticks | Dull, damped versions of check ticks | For the failing rows |
| Dock ticks | Soft cartridge-seat clicks | 4×, outro only |

## 5. Mix & delivery

- **Loudness:** master −14 LUFS integrated (X/Twitter), true peak −1.5 dBTP. VO −16 LUFS
  short-term, SFX peaking −10 to −18 dB relative.
- **EQ:** high-pass music at 90 Hz except during the tamper sub (the thump owns the low end
  precisely because nothing else does).
- **Deliverables:** 1) master 1920×1080 H.264 ~16 Mbps, AAC 320k; 2) muted-safe check — watch
  it silent once, it must fully work; 3) thumbnail PNG (held tamper frame, full res);
  4) the 30s alt cut if requested; 5) tweet copy from `post-kit.md`.
- **QC pass:** no OS notifications, no cursor idle-jitter, ticker not paused, runtime pill says
  online, attestation reads `eigencompute` (live deployment), all seven acts present, hold on
  tamper ≥ 2.5s, captions legible at 50% playback size, audio sync within 1 frame at beats 4/6.

## 6. Shot protocol (do this exactly)

1. Live deployment URL → `/agents/code`. Confirm runtime pill **online**.
2. Clear ledger if it's cluttered (`localStorage.clear()` in devtools, reload) — Recent
   Receipts should show 0–2 rows max for the outro.
3. Start capture. Navigate to `/` (threshold). Hands off 4 seconds.
4. Click **Watch the proof**. Follow the timeline above with `→`, reading VO silently as the
   pacing track (record VO separately later; don't talk over the capture).
5. At Act 6, move the cursor in one smooth arc to the score row, hover 0.5s, click once.
   Do not move the cursor for 3 seconds afterward.
6. Act 7 → click **Open the console**, let the station finish assembling, hold 2s, stop capture.
7. Do three full takes. Pick the one with the cleanest cursor work in take review.
