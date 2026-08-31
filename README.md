# Circuit Logic — Drosophila Neuroscience Game (Proof of Concept)

This is a simple browser game built with plain HTML, CSS, and
JavaScript — no game engine, no build tools, no backend. It runs
by opening a web page, and it can be hosted for free on Vercel.

## 1. What's in this folder

```
drosophila-game/
├── index.html          <- the page itself (structure)
├── css/
│   └── style.css       <- all visual styling
├── js/
│   ├── levels.js        <- ALL your level/neuron content lives here
│   └── game.js          <- the game engine (you shouldn't need to edit this)
└── assets/
    ├── videos/          <- put all your .mp4 files here
    ├── audio/            <- put all your music/sfx .mp3 files here
    └── images/           <- (optional) any images you use later
```

**The rule of thumb:** to add or change game content, edit
`js/levels.js` and drop files into `assets/`. You should almost
never need to touch `index.html`, `style.css`, or `game.js`.

## 2. Before you do anything: file names matter

The game finds your videos and music by exact file path. The
`escape_response` level that's already built expects these files
to exist (they don't yet — you'll create them):

```
assets/videos/escape_intro.mp4          (Phase 1 — the scenario video)
assets/videos/lplc4_demo.mp4             (neuron demo video)
assets/videos/giant_fiber_demo.mp4      (neuron demo video)
assets/videos/ttmn_demo.mp4             (neuron demo video)
assets/videos/p1_demo.mp4               (neuron demo video)
assets/videos/grooming_demo.mp4         (neuron demo video)
assets/videos/escape_success.mp4        (Phase 3 — correct-answer video)
assets/videos/escape_failure.mp4        (Phase 3 — wrong-answer video)

assets/audio/escape_music.mp3           (this level's main background music)
assets/audio/escape_success_music.mp3   (music that plays under the success video)
assets/audio/escape_failure_music.mp3   (music that plays under the failure video)

assets/audio/click.mp3                  (general click sound — neuron cards, PLAY, Restart)
assets/audio/submit_click.mp3           (distinct sound just for the Submit Answer button)
assets/audio/bird_call.mp3              (plays alongside the click sound on PLAY/Restart)
```

Until real video files exist at those paths, the video frame will
just appear black and the "Skip ▸" button is how you move forward
during testing — this is expected and not a bug.

**Tip:** Keep video files reasonably small (compressed .mp4, ideally
under ~20MB each) so the game loads quickly, especially once you
have many levels. Most video editing software has an "export for
web" or "compress" option.

## 3. How to test it on your own computer

Because this game loads video/audio files from disk, you can't
just double-click `index.html` in most browsers — it needs to be
served by a very simple local web server, or some browsers will
block the media files for security reasons.

The easiest way if you have Python installed (Mac and most
Windows installs have it, or you can install it for free):

1. Open a terminal (Mac: Terminal app. Windows: Command Prompt).
2. Navigate into the project folder, e.g.:
   ```
   cd path/to/drosophila-game
   ```
3. Run:
   ```
   python3 -m http.server 8000
   ```
   (On some Windows setups the command is `python` instead of `python3`.)
4. Open your browser and go to: `http://localhost:8000`

You should see the game load. Press Ctrl+C in the terminal to stop
the server when you're done testing.

**Alternative (no terminal):** Install the free "Live Server"
extension in the VS Code text editor, open this folder in VS Code,
right-click `index.html`, and choose "Open with Live Server."

## 4. How to add a new level

Open `js/levels.js`. Everything you need is explained in the
comments at the top of that file. In short:

1. Copy one whole level object (from `{` to `}`) inside the
   `LEVELS` array.
2. Paste it as a new entry, with a comma separating it from the
   previous one.
3. Change the `id`, `behaviorName`, `prompt`, video/music paths,
   the list of `neurons`, and `correctNeuronIds` to match your new
   behavior.
4. Add your new video/audio files into `assets/videos` and
   `assets/audio`.
5. Save the file and refresh the page — no other code changes
   needed. The new level automatically plays after the previous
   one finishes.

The game always plays levels in the order they appear in the
`LEVELS` array.

## 5. How grading works (correct vs incorrect)

A level is marked "correct" only if the player selects **exactly**
the neurons listed in that level's `correctNeuronIds` — not more,
not fewer. If you'd rather allow "correct + some extra harmless
selections" to still count as correct, that's a small change to
the `arraysHaveSameContents` function in `js/game.js` — ask
whoever helps you with code changes to switch it to a "does the
selection include all required neurons" check instead of an exact
match, if you decide you want that.

## 6. Audio behavior (as built)

- **Background music** starts the moment a level begins (once the
  player presses PLAY) and keeps playing without restarting
  through the intro video and the neuron selection screen.
- **The instant the player submits an answer**, that music fades
  out over about half a second, then immediately switches to
  either `successMusic` or `failureMusic` (whichever matches their
  answer) and plays that under the outcome video.
  - If they got it **right**, the next level then starts its own
    music normally.
  - If they got it **wrong**, the music fades again back to the
    level's main track (`musicTrack`) as they return to try the
    selection screen again.
- **Sound effects embedded in your videos** need no code — they
  just play as part of the video file itself.
- **Four separate interactive sound effects**, all controlled in
  JavaScript and independent of the music:
  - `click.mp3` — plays when a neuron card is selected/deselected,
    and also when PLAY or Restart is pressed.
  - `submit_click.mp3` — plays only when Submit Answer is pressed,
    so it feels distinct from a regular neuron click.
  - `bird_call.mp3` — plays alongside `click.mp3` whenever PLAY or
    Restart is pressed.
- **Mute button** (top right) mutes everything at once — music,
  all sound effects, and any video's own audio track.
- **Volume slider** controls the background music's (and sound
  effects') volume live.

## 7. The start screen and the central fly diagram

**Start screen:** the game now opens on a PLAY button instead of
starting immediately. This is deliberate, not just cosmetic —
browsers block video/audio from starting on their own before the
player has clicked anything on the page. Requiring a PLAY click
means the very first video and music playback are triggered by a
real click, which browsers always allow. You shouldn't see
autoplay-blocked warnings in the browser console anymore because
of this.

**Central fly diagram:** the neuron selection screen now shows a
stylized top-down diagram of the fly's brain and nerve cord in the
middle, with candidate neuron cards arranged on either side. Each
neuron that has a `diagramPosition` in `levels.js` gets a small dot
on the diagram; hovering (or keyboard-focusing) its card lights up
that dot. Selected neurons stay lit at a medium brightness even
without hovering, so the player can see their current picks on the
diagram at a glance.

The brain/cord artwork itself is plain SVG shapes defined directly
in `index.html` — no image file needed. If you'd rather use your
own hand-drawn top-down brain illustration instead of this
generated diagram, that's a separate small change (swapping the
SVG shapes for an `<img>`); mention it if you'd like that instead.

## 8. Deploying to Vercel (free static hosting)

1. Create a free account at https://vercel.com if you don't have
   one (you can sign up with GitHub, GitLab, or email).
2. The simplest path: create a free GitHub account (if you don't
   have one), create a new repository, and upload this entire
   `drosophila-game` folder to it (GitHub's website lets you drag
   and drop files to upload — you don't need to know git commands
   for a proof of concept).
3. In Vercel, click "Add New… → Project," choose "Import Git
   Repository," and select the repository you just created.
4. Vercel will detect it's a static site — you don't need to
   change any build settings. Click "Deploy."
5. After a minute, Vercel gives you a public URL
   (something like `your-project.vercel.app`) that anyone can open
   in a browser to play the game.

Any time you push changes to that GitHub repository (e.g. after
adding a new level), Vercel automatically redeploys the updated
version.

## 9. Common issues

- **Videos don't play automatically.** Browsers block
  autoplay-with-sound until the player has clicked somewhere on
  the page first. This is normal and is why there's a "Skip ▸"
  button — it always works even if autoplay is blocked. Once the
  player has interacted with the page once (e.g. clicked mute or
  a neuron card), autoplay for subsequent videos generally works.
- **"0 selected" and the Submit button won't light up.** This is
  correct behavior — the player must select at least one neuron
  before submitting.
- **Nothing changes when I edit levels.js.** Make sure you saved
  the file, and do a hard refresh in the browser (Ctrl+Shift+R or
  Cmd+Shift+R) in case it's using a cached copy.
- **A level's videos are black / silent.** Double check the exact
  file name and folder in `levels.js` matches the real file in
  `assets/` exactly, including capitalization and the `.mp4` /
  `.mp3` extension.

## 10. What this proof of concept intentionally does NOT include

Per the project brief, this build has no backend, no database, no
user accounts, no multiplayer, and no game engine. Progress is not
saved between visits — refreshing the page always restarts from
Level 1. If you later want to save progress (e.g. "remember which
level the player was on"), that's a separate, small feature to add
using the browser's local storage — let your developer/assistant
know if you want that added.
