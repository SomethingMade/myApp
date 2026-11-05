

### `script.js`

```javascript
// Import Firebase modular SDK modules via CDN ESM
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

// ---------- Firebase Configuration ----------
const firebaseConfig = {
  apiKey: "AIzaSyBOyZ3As4GTuNvjemvPF_SpsC6m6vqtNhc",
  authDomain: "fire-b-a8878.firebaseapp.com",
  databaseURL: "https://fire-b-a8878.firebaseio.com",
  projectId: "fire-b-a8878",
  storageBucket: "fire-b-a8878.firebasestorage.app",
  messagingSenderId: "658673187627",
  appId: "1:658673187627:web:32699cbc33e85f4bafa36e",
  measurementId: "G-2505EVBRWX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ---------- Google Auth Elements ----------
const googleSigninBtn = document.getElementById("google-signin-btn");
const googleSignoutBtn = document.getElementById("google-signout-btn");
const userProfileDiv = document.getElementById("user-profile");
const userNameSpan = document.getElementById("user-name");

// Handle Google Sign-In / Sign-Up
googleSigninBtn.addEventListener("click", () => {
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      const user = result.user;
      console.log("Logged in as:", user.displayName);
    })
    .catch((error) => {
      console.error("Auth error:", error.message);
    });
});

// Handle Sign Out
googleSignoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    console.log("Signed out successfully");
  }).catch((error) => {
    console.error("Sign out error:", error);
  });
});

// Monitor Auth State Changes (Sync UI)
onAuthStateChanged(auth, (user) => {
  if (user) {
    googleSigninBtn.classList.add("hidden");
    userProfileDiv.classList.remove("hidden");
    userNameSpan.textContent = `Hi, ${user.displayName || user.email.split('@')[0]}`;
    
    // Pre-fill booking name if available
    const nameInput = document.getElementById("book-form")?.elements?.name;
    if (nameInput && !nameInput.value) {
      nameInput.value = user.displayName || "";
    }
  } else {
    googleSigninBtn.classList.remove("hidden");
    userProfileDiv.classList.add("hidden");
    userNameSpan.textContent = "";
  }
});

// ---------- Age Verification Modal Gate ----------
const modal = document.getElementById("age-modal");
const btnYes = document.getElementById("age-yes");
const btnNo = document.getElementById("age-no");
const ageError = document.getElementById("age-error");

if (localStorage.getItem("shaka_age_verified") === "true") {
  modal.classList.add("hidden");
}

btnYes.addEventListener("click", () => {
  localStorage.setItem("shaka_age_verified", "true");
  modal.classList.add("hidden");
});

btnNo.addEventListener("click", () => {
  ageError.textContent = "Sorry, you must be 18 or older to view this site.";
});

// ---------- Menu data (prices in rand)[cite: 2] ----------
const MENU = {
  food: [
    { name: "Shaka flame-grilled ribs", desc: "Slow-cooked, finished over coals, sticky glaze, chips.", price: 195 },
    { name: "Boerewors roll", desc: "Coiled wors, tomato-onion smoor, toasted roll.", price: 85 },
    { name: "Lamb chops", desc: "Rosemary and garlic, pap and chakalaka.", price: 215 },
    { name: "Peri-peri chicken", desc: "Half bird, hot or mild, side of your choice.", price: 140 },
    { name: "Grilled halloumi stack", desc: "Roast veg, balsamic, toasted seeds.", price: 110 }
  ],
  cocktails: [
    { name: "Shaka Sour", desc: "Bourbon, lemon, honey, egg white.", price: 85 },
    { name: "Smoked Old Fashioned", desc: "Rye, demerara, bitters, oak smoke.", price: 95 },
    { name: "Rooibos Collins", desc: "Gin, cold rooibos, lemon, soda.", price: 75 },
    { name: "Spicy Paloma", desc: "Tequila, grapefruit, chilli salt.", price: 80 },
    { name: "Virgin Mule", desc: "Ginger beer, lime, mint. No alcohol.", price: 45 }
  ],
  spirits: [
    { name: "Single malt whisky", desc: "Ask for today's pours. Neat, rocks or with water.", price: 70 },
    { name: "Craft gin and tonic", desc: "Three local gins, premium tonic, garnish to match.", price: 65 },
    { name: "Local draught beer", desc: "Lager or pale ale, 500 ml.", price: 40 },
    { name: "Wine by the glass", desc: "Red, white or bubbly from the Cape.", price: 55 },
    { name: "Shot of the day", desc: "Chalked on the board behind the bar.", price: 35 }
  ]
};

// ---------- Opening hours (24h clock; close above 24 runs past midnight)[cite: 2] ----------
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = [
  { open: 10, close: 22 }, // Sun
  { open: 11, close: 23 }, // Mon
  { open: 11, close: 23 }, // Tue
  { open: 11, close: 23 }, // Wed
  { open: 11, close: 23 }, // Thu
  { open: 11, close: 26 }, // Fri (until 2am)
  { open: 11, close: 26 }  // Sat (until 2am)
];

const pad = n => String(n % 24).padStart(2, "0") + ":00";
const money = n => "R" + n;

// ---------- Menu tabs[cite: 2] ----------
const list = document.getElementById("menu-list");
const tabs = document.querySelectorAll(".tabs button");

function renderMenu(key) {
  list.innerHTML = MENU[key].map(item => `
    <li>
      <h3>${item.name}</h3>
      <span class="price">${money(item.price)}</span>
      <p>${item.desc}</p>
    </li>`).join("");
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.setAttribute("aria-selected", t === tab));
    renderMenu(tab.dataset.tab);
  });
});
renderMenu("food");

// ---------- Hours list + open/closed status[cite: 2] ----------
function renderHours() {
  const today = new Date().getDay();
  const order = [1, 2, 3, 4, 5, 6, 0];
  document.getElementById("hours-list").innerHTML = order.map(d => `
    <li class="${d === today ? "today" : ""}">
      <span>${DAYS[d]}</span>
      <span>${pad(HOURS[d].open)} – ${pad(HOURS[d].close)}</span>
    </li>`).join("");
}

function updateStatus() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes() / 60;
  const prev = (day + 6) % 7;

  const openToday = hour >= HOURS[day].open && hour < Math.min(HOURS[day].close, 24);
  const openFromYesterday = HOURS[prev].close > 24 && hour < HOURS[prev].close - 24;
  const isOpen = openToday || openFromYesterday;

  const el = document.getElementById("open-status");
  el.className = "status " + (isOpen ? "open" : "closed");
  el.textContent = isOpen ? "Open now" : `Closed. Opens ${pad(HOURS[day].open)} ${hour < HOURS[day].open ? "today" : "tomorrow"}`;
  if (!isOpen && hour >= HOURS[day].open) {
    el.textContent = `Closed. Opens ${pad(HOURS[(day + 1) % 7].open)} tomorrow`;
  }
}

renderHours();
updateStatus();
setInterval(updateStatus, 60000);

// ---------- Mobile nav[cite: 2] ----------
const toggle = document.querySelector(".nav-toggle");
const links = document.getElementById("menu-links");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
  toggle.textContent = open ? "Close" : "Menu";
});
links.addEventListener("click", e => {
  if (e.target.tagName === "A" && !e.target.closest('#auth-container')) {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Menu";
  }
});

// ---------- Booking form[cite: 2] ----------
const form = document.getElementById("book-form");
const errorBox = document.getElementById("form-error");
const confirmBox = document.getElementById("form-confirm");
const dateInput = form.elements.date;

dateInput.min = new Date().toISOString().split("T")[0];

form.addEventListener("submit", e => {
  e.preventDefault();
  confirmBox.textContent = "";
  errorBox.textContent = "";
  form.querySelectorAll("input").forEach(i => i.classList.remove("invalid"));

  const f = form.elements;
  const problems = [];
  const flag = (field, msg) => { f[field].classList.add("invalid"); problems.push(msg); };

  if (f.name.value.trim().length < 2) flag("name", "Enter your name.");
  if (!/^[+\d\s()-]{9,15}$/.test(f.phone.value.trim())) flag("phone", "Enter a phone number we can reach.");
  if (!f.date.value) flag("date", "Choose a date.");
  if (!f.time.value) flag("time", "Choose a time.");
  const guests = Number(f.guests.value);
  if (!guests || guests < 1 || guests > 12) flag("guests", "Guests must be between 1 and 12. Call us for bigger groups.");

  if (problems.length) {
    errorBox.textContent = problems[0];
    form.querySelector(".invalid").focus();
    return;
  }

  const when = new Date(`${f.date.value}T${f.time.value}`).toLocaleString("en-ZA", { dateStyle: "full", timeStyle: "short" });
  confirmBox.textContent = `Thanks, ${f.name.value.trim()}. We've noted a table for ${guests} on ${when}. We'll call to confirm.`;
  form.reset();
  f.guests.value = 2;
});

document.getElementById("year").textContent = new Date().getFullYear();

```

