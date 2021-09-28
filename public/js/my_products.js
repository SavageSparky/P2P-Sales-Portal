import { db_get, firebaseConfig } from "./firebase-util.js";

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    document.querySelector(".loading-cont").style.display = "none";
    let user_id = user.uid;
    let adone = await db_get(firebase.database(), `user/${user_id}`);
    adone = adone.val();
    console.log(adone);
    if (adone === null) {
      location.href = "/index.html";
    }
  } else {
    document.querySelector(".loading-cont").style.display = "flex";
    location.href = "/index.html";
  }
});


// card click
const cards = document.querySelectorAll('.card');
const mainPanel = document.querySelector('.main_panel');
const sidePanel = document.querySelector('.side_panel');
cards.forEach((card) => {
    card.addEventListener('click', () => {
        sidePanel.classList.toggle('triggered');
        mainPanel.classList.toggle('side_panel_space');
    })
})

// side panel
const buyers = document.querySelectorAll('.buyer');
buyers.forEach( (buyer)=> {
    buyer.addEventListener('click', () => {
        buyer.querySelector('.buyer_expand').classList.toggle('triggered');
    })
})
