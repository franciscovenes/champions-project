// javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  update,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";

const appSettings = {
  databaseURL:
    "https://realtime-database-dcd31-default-rtdb.europe-west1.firebasedatabase.app/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const endorsementsListInDB = ref(database, "endorsementsList");

const endorsementTextAreaEl = document.getElementById("endorsement-textarea");
const publishBtnEl = document.getElementById("publish-btn");
const endorsementsListEl = document.getElementById("endorsements-list");

// From and to input info
const fromInputEl = document.getElementById("from-input");
const toInputEl = document.getElementById("to-input");

publishBtnEl.addEventListener("click", function () {
  let data = {
    from: fromInputEl.value,
    to: toInputEl.value,
    text: endorsementTextAreaEl.value,
    count: 0,
  };

  if (fromInputEl.value || toInputEl.value || endorsementTextAreaEl.value)
    push(endorsementsListInDB, data);
  clearInputElements();
});

onValue(endorsementsListInDB, function (snapshot) {
  if (snapshot.exists()) {
    let entriesArray = Object.entries(snapshot.val()).reverse();
    clearEndorsementsListEl();
    for (let i = 0; i < entriesArray.length; i++) {
      let currentEntry = entriesArray[i];
      appendEntryToEndorsementListEl(currentEntry);
    }
  } else {
    endorsementsListEl.innerHTML = "Please write your 1st endorsement above 😊";
  }
});

function appendEntryToEndorsementListEl(entry) {
  const entryText = entry[1].text;
  const entryFrom = entry[1].from;
  const entryTo = entry[1].to;
  const itemID = entry[0];
  let likesCount = entry[1].count;

  const newEl = document.createElement("li");
  newEl.innerHTML = `<p class="bold-p">To ${entryTo}</p>
                    <p>${entryText}</p>`;

  const divEl = document.createElement("div");
  divEl.innerHTML = `<span class="bold-p">From ${entryFrom}</span>`;

  const countEl = document.createElement("span");
  countEl.addEventListener("click", function () {
    let exactLocationOfEntryInDB = ref(database, `endorsementsList/${itemID}`);

    let likedArray = JSON.parse(localStorage.getItem("likedPosts"));

    if (likedArray === null) {
      update(exactLocationOfEntryInDB, { count: ++likesCount });
      localStorage.setItem("likedPosts", JSON.stringify([itemID]));
    } else if (!likedArray.includes(itemID)) {
      update(exactLocationOfEntryInDB, { count: ++likesCount });
      likedArray.push(itemID);
      localStorage.setItem("likedPosts", JSON.stringify(likedArray));
    }
  });
  countEl.innerHTML = `❤️ ${likesCount}`;

  divEl.append(countEl);
  newEl.append(divEl);
  endorsementsListEl.append(newEl);
}

function clearInputElements() {
  endorsementTextAreaEl.value = "";
  toInputEl.value = "";
  fromInputEl.value = "";
}

function clearEndorsementsListEl() {
  endorsementsListEl.innerHTML = "";
}
