/*
================================================================
LEVELS.JS

This file is the ONLY file you should need to touch to add,
remove, or edit levels. The game code (game.js) just reads
whatever is in the LEVELS array below — it doesn't know or
care how many levels there are, or what they're about.

------------------------------------------------------------
HOW TO ADD A NEW LEVEL
------------------------------------------------------------
1. Copy one whole level object (everything between one pair of
   matching { and } inside the LEVELS array below).
2. Paste it as a new entry in the array, with a comma between
   entries.
3. Change every value to match your new behavior (courtship,
   feeding, landing, grooming, etc).
4. Give it a unique "id" (no spaces — use underscores).
5. Drop your new video/audio files into the assets/ folders and
   point to them with the correct file paths.
6. Make sure "correctNeuronIds" exactly lists the id(s) of the
   neuron(s) that are actually necessary for the behavior — the
   game checks the player's selection against this list.

That's it — the new level will automatically show up after the
previous one, in the order it appears in this array.

------------------------------------------------------------
FIELD REFERENCE
------------------------------------------------------------
id                 - unique short name for this level (string, no spaces)
behaviorName       - shown in the top bar, e.g. "Escape Response"
prompt             - the question shown above the neuron selection screen
introVideo         - path to the scenario-setup video (Phase 1)
musicTrack         - path to this level's main background music file,
                     playing during the intro video and the whole
                     selection phase
successMusic       - background music that fades in the instant the
                     player submits a CORRECT answer, playing under
                     the success video
failureMusic       - background music that fades in the instant the
                     player submits an INCORRECT answer, playing
                     under the failure video (the game then fades
                     back to musicTrack once the player returns to
                     try the selection again)
neurons            - array of neuron objects (see below)
correctNeuronIds   - array of neuron "id" values that are the
                     correct answer (order doesn't matter)
successVideo       - path to the video shown on a correct answer
failureVideo       - path to the video shown on a wrong answer

Each neuron object looks like:
  id             - unique short id, used internally (no spaces)
  name           - full display name of the neuron, shown on its card
  shortLabel     - a short label (1-2 words) shown next to its dot
                   on the central fly-brain diagram, e.g. "LGMD"
  function       - one or two sentences on what it does
  connections    - one or two sentences on what it connects to
  demoVideo      - path to the short "activate this neuron" video
  diagramPosition - where this neuron's glowing dot sits on the
                   central fly diagram. The diagram's coordinate
                   space is 400 wide by 640 tall, roughly laid out
                   like this:
                     x=80,  y=120   -> left optic lobe
                     x=320, y=120   -> right optic lobe
                     x=200, y=60-150 -> central brain
                     x=200, y=330-440 -> thoracic ganglion (legs/wings)
                     x=200, y=500-580 -> abdominal ganglion
                   Fields:
                     x, y      - dot position (required)
                     labelDx   - horizontal offset for the text label,
                                 in case it would otherwise overlap
                                 something (optional, default 0)
                     labelDy   - vertical offset for the text label
                                 (optional, default -16, i.e. just
                                 above the dot)
                   If you leave diagramPosition off a neuron entirely,
                   that neuron just won't get a dot on the diagram —
                   its card still works normally.
================================================================
*/

const LEVELS = [
  {
    id: "escape_response",
    behaviorName: "Escape Response",
    prompt: "A chickadee is diving toward the fly. Which neurons need to be activated for the escape response?",

    introVideo: "assets/videos/escape_intro.mp4",
    musicTrack: "assets/audio/escape_music.mp3",
    successMusic: "assets/audio/escape_success_music.mp3",
    failureMusic: "assets/audio/escape_failure_music.mp3",

    neurons: [
      {
        id: "lplc4",
        name: "Lobula Plate-lobula Columnar Neuron (LPLC4)",
        shortLabel: "LPLC4",
        function: "Detects fast-looming visual stimuli, like an approaching predator, and signals imminent collision.",
        connections: "Receives input from the visual system (lobula); outputs to the Giant Fiber neuron.",
        demoVideo: "assets/videos/lplc4_demo.mp4",
        diagramPosition: { x: 75, y: 115, labelDy: -20 }
      },
      {
        id: "giant_fiber",
        name: "Giant Fiber (GF) Neuron",
        shortLabel: "GF",
        function: "Integrates threat signals and rapidly triggers the jump-and-flight escape sequence.",
        connections: "Receives input from visual and mechanosensory pathways; outputs to the tergotrochanteral muscle (jump) and flight motor circuits.",
        demoVideo: "assets/videos/giant_fiber_demo.mp4",
        diagramPosition: { x: 200, y: 175, labelDy: -16 }
      },
      {
        id: "ttm_motor_neuron",
        name: "Tergotrochanteral Motor Neuron (TTMn)",
        shortLabel: "TTMn",
        function: "Directly triggers the 'jump muscle' that extends the leg explosively, launching the fly into the air.",
        connections: "Downstream of the Giant Fiber neuron; connects directly to the tergotrochanteral (jump) muscle.",
        demoVideo: "assets/videos/ttmn_demo.mp4",
        diagramPosition: { x: 200, y: 385, labelDy: -18 }
      },
      {
        id: "courtship_p1",
        name: "P1 Neuron",
        shortLabel: "P1",
        function: "Drives male courtship behavior in response to female cues — not involved in escape responses.",
        connections: "Part of the courtship circuit; connects to song-production and approach circuits.",
        demoVideo: "assets/videos/p1_demo.mp4",
        diagramPosition: { x: 250, y: 90, labelDy: -16 }
      },
      {
        id: "grooming_command",
        name: "Grooming Command Neuron",
        shortLabel: "Groom",
        function: "Triggers leg-sweeping grooming movements in response to irritants on the body — not involved in escape.",
        connections: "Receives mechanosensory input from bristles; outputs to leg motor circuits for grooming.",
        demoVideo: "assets/videos/grooming_demo.mp4",
        diagramPosition: { x: 158, y: 415, labelDx: -38, labelDy: 4 }
      }
    ],

    // The escape jump requires the full detection-to-motor chain:
    // lplc4 detects the threat, the Giant Fiber relays it, and the
    // TTM motor neuron fires the jump muscle. All three are needed.
    correctNeuronIds: ["lplc4", "giant_fiber", "ttm_motor_neuron"],

    successVideo: "assets/videos/escape_success.mp4",
    failureVideo: "assets/videos/escape_failure.mp4"
},
{
id: "courtship",
    behaviorName: "Courtship",
    prompt: "Love at first... mite? Which neurons need to be activated for courtship? [unfinished]",
    introVideo: "assets/videos/courtship_intro.mp4",
    musicTrack: "assets/audio/courtship_music.mp3",
    successMusic: "assets/audio/courtship_success_music.mp3",
    failureMusic: "assets/audio/courtship_failure_music.mp3",

    neurons: [
      {
        id: "lplc4",
        name: "Lobula Plate-lobula Columnar Neuron (LPLC4)",
        shortLabel: "LPLC4",
        function: "Detects fast-looming visual stimuli, like an approaching predator, and signals imminent collision.",
        connections: "Receives input from the visual system (lobula); outputs to the Giant Fiber neuron.",
        demoVideo: "assets/videos/lplc4_demo.mp4",
        diagramPosition: { x: 75, y: 115, labelDy: -20 }
      },
      {
        id: "pip10",
        name: "pIP10 Neuron",
        shortLabel: "pIP10",
        function: "Initiates motor program for courtship song.",
        connections: "Receives input from courtship circuitry (P1); outputs to thoracic motor circuitry.",
        demoVideo: "assets/videos/pip10_demo.mp4",
        diagramPosition: { x: 200, y: 175, labelDy: -16 }
      },
      {
        id: "hg1",
        name: "hg1 Motoneuron",
        shortLabel: "hg1",
        function: "Directly triggers wing movement for generating song.",
        connections: "Downstream of the pIP10 neuron; connects directly to the hg1 wing muscle.",
        demoVideo: "assets/videos/hg1_demo.mp4",
        diagramPosition: { x: 200, y: 385, labelDy: -18 }
      },
      {
        id: "p1",
        name: "P1 Neuron",
        shortLabel: "P1",
        function: "Drives male courtship behavior in response to female cues.",
        connections: "Receives input on female-related olfactory and gustatory cues; connects to song-production and approach circuits.",
        demoVideo: "assets/videos/p1_demo.mp4",
        diagramPosition: { x: 250, y: 90, labelDy: -16 }
      },
      {
        id: "grooming_command",
        name: "Grooming Command Neuron",
        shortLabel: "Groom",
        function: "Triggers leg-sweeping grooming movements in response to irritants on the body — not involved in escape.",
        connections: "Receives mechanosensory input from bristles; outputs to leg motor circuits for grooming.",
        demoVideo: "assets/videos/grooming_demo.mp4",
        diagramPosition: { x: 158, y: 415, labelDx: -38, labelDy: 4 }
      }
    ],

    // The escape jump requires the full detection-to-motor chain:
    // lplc4 detects the threat, the Giant Fiber relays it, and the
    // TTM motor neuron fires the jump muscle. All three are needed.
    correctNeuronIds: ["p1", "pip10", "hg1"],

    successVideo: "assets/videos/courtship_success.mp4",
    failureVideo: "assets/videos/courtship_failure.mp4"
  }

  // ---------------------------------------------------------
  // Add your next level here, e.g. courtship, feeding, landing,
  // or grooming. Just copy the object above, paste a comma
  // after it, and paste a new one below with your own content.
  // ---------------------------------------------------------
];
