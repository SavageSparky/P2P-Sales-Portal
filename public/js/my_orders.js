import { db_get, firebaseConfig } from "./firebase-util.js";

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// variables
const mainPanel = document.querySelector('.main_panel');
const sidePanel = document.querySelector('.side_panel');
const cardSection = document.querySelector('.card_section');



firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    document.querySelector(".loading-cont").style.display = "none";
    let user_id = user.uid;
    let adone = await db_get(firebase.database(), `user/${user_id}`);
    adone = adone.val();
    // console.log(adone);
    if (adone === null) {
      location.href = "/index.html";
    }
    else {
      fetchPdtIds(user_id);
    }
  } else {
    document.querySelector(".loading-cont").style.display = "flex";
    location.href = "/index.html";
  }
});


function date_splitter(date) {
  date = date.split("-");
  // console.log(date);
  let txt;
  switch (+date[1]) {
    case 1:
      txt = `${date[2]} Jan ${date[0]}`;
      break;
    case 2:
      txt = `${date[2]} Feb ${date[0]}`;
      break;
    case 3:
      txt = `${date[2]} Mar ${date[0]}`;
      break;
    case 4:
      txt = `${date[2]} Apr ${date[0]}`;
      break;
    case 5:
      txt = `${date[2]} May ${date[0]}`;
      break;
    case 6:
      txt = `${date[2]} Jun ${date[0]}`;
      break;
    case 7:
      txt = `${date[2]} Jul ${date[0]}`;
      break;
    case 8:
      txt = `${date[2]} Aug ${date[0]}`;
      break;
    case 9:
      txt = `${date[2]} Sept ${date[0]}`;
      break;
    case 10:
      txt = `${date[2]} Oct ${date[0]}`;
      break;
    case 11:
      txt = `${date[2]} Nov ${date[0]}`;
      break;
    case 12:
      txt = `${date[2]} Dec ${date[0]}`;
      break;
  }
  // console.log(txt);
  return txt;
}

// Orders Fetch
const 