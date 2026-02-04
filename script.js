let state = {
  location: "forest",
  health: 100,
  sanity: 100,
  inventory: [],
  endings: []
};

const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const imgEl = document.getElementById("scene-image");
const whisperAudio = document.getElementById("whispers");
const overlay = document.getElementById("overlay");

const locations = {
  forest: {
    image: "images/forest.jpg",
    text: "The forest breathes. Someone is standing behind you.",
    choices: [
      { text: "Run", effect: () => changeStats(-10, -5), go: "road" },
      { text: "Investigate", effect: () => changeStats(0, -15), go: "house" }
    ]
  },
  house: {
    image: "images/house.jpg",
    text: "A man inside the house whispers your name.",
    npc: {
      name: "The Watcher",
      talk: () => changeStats(0, -20)
    },
    choices: [
      { text: "Talk to him", effect: () => addItem("Key"), go: "basement" },
      { text: "Flee", effect: () => changeStats(-5, 0), go: "forest" }
    ]
  },
  basement: {
    image: "images/glitch.png",
    text: "The walls are breathing. The door locks.",
    choices: [
      { text: "Scream", effect: () => changeStats(-20, -30), ending: 12 },
      { text: "Accept it", effect: () => changeStats(0, -50), ending: 27 }
    ]
  },
  road: {
    image: "images/road.jpg",
    text: "The road loops forever.",
    choices: [
      { text: "Keep walking", effect: () => changeStats(-10, -10), ending: 3 },
      { text: "Turn back", effect: () => changeStats(0, -5), go: "forest" }
    ]
  }
};

// 🔚 60+ Endings
const endings = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  text: `ENDING ${i}: You were never alone.`
}));

function render() {
  const loc = locations[state.location];
  imgEl.src = loc.image;
  textEl.textContent = loc.text;
  choicesEl.innerHTML = "";

  loc.choices.forEach(c => {
    const btn = document.createElement("button");
    btn.textContent = c.text;
    btn.onclick = () => {
      c.effect?.();
      if (c.ending !== undefined) return triggerEnding(c.ending);
      state.location = c.go;
      render();
    };
    choicesEl.appendChild(btn);
  });

  updateUI();
}

function changeStats(h, s) {
  state.health += h;
  state.sanity += s;
  sanityEffects();
}

function sanityEffects() {
  document.body.classList.toggle("low-sanity", state.sanity < 40);
  overlay.style.opacity = state.sanity < 30 ? 0.4 : 0;

  if (state.sanity < 35) {
    whisperAudio.src = "sounds/whisper1.mp3";
    whisperAudio.play();
  } else {
    whisperAudio.pause();
  }
}

function addItem(item) {
  if (!state.inventory.includes(item)) {
    state.inventory.push(item);
  }
}

function updateUI() {
  document.getElementById("health").textContent = state.health;
  document.getElementById("sanity").textContent = state.sanity;

  const inv = document.getElementById("inventory");
  inv.innerHTML = "";
  state.inventory.forEach(i => {
    const li = document.createElement("li");
    li.textContent = i;
    inv.appendChild(li);
  });
}

function triggerEnding(id) {
  const ending = endings.find(e => e.id === id);
  textEl.textContent = ending.text;
  choicesEl.innerHTML = "<button onclick='location.reload()'>RESTART</button>";
  whisperAudio.pause();
}

function goTo(place) {
  if (locations[place]) {
    state.location = place;
    render();
  }
}

render();
