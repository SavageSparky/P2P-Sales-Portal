import { db_get, signIn, firebaseConfig, db_insert, regex_rem } from "./firebase-util.js";

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const provider = new firebase.auth.GoogleAuthProvider();
const signIn_icon = document.querySelectorAll(".sign_in_btn");
const popup_tag = document.querySelector(".popup");
const main_tag = document.querySelector("main");
const pincode_tag = document.querySelector(".pincode");
const pincode_error = document.querySelector(".wrong-one");
const submit_btn = document.querySelector("form button");
const name_input = document.querySelectorAll("form input")[0];
const nav=document.querySelector('nav');
const popup_close_icon=document.querySelector('.popup .close_icon');
let user_signin_flag = false;
let submit_flag = false;
let user_id;
let authFlag = 0;
let allCompleted = false;

/**************************DB  Driver Functions**************************** */

firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    /*If user is signed in then execute */
    user_signin_flag = true;
    user_id = user.uid;
    let temp =
      await detCheck(); /* This checks that if the user  data is in db*/
    console.log(temp);
    if (temp === true) {
      location.href =
        "/pages/home.html"; /* If data is in db then redirect to main page */
    }
  } else {
    user_signin_flag = false;
  }
  if (authFlag === 1) {
    /*This is triggered upon first signup from the user by showing popup */
    signiner();
  }
});

async function detCheck() {
  /*This one checks wether the data is found in the db or not */
  let data = await db_get(db, `user/${user_id}`);
  data = await data.val();
  if (data !== null) {
    return true;
  }
  return false;
}

function popupHandler() {
  /*This one gives the blurrery background and makes the popup box visible */
  main_tag.classList.add("blurrer");
  popup_tag.style.display = "flex";
}

/**********************************************************************/

submit_btn.addEventListener("click", (e) => {
  /*This one is triggered on clicking the submit button in the popup by adding user details to the db */
  e.preventDefault();
  if (!submit_flag) return;
  name_input.value=name_input.value.trim();
  let obj={
    'Name':regex_rem(name_input.value),
    'Pincode':pincode_tag.value,
    'AllDone':'false',
    'profileImgUrl':'../assets/images/user_image.png'
  }
  // db_insert(db, `user/${user_id}/Name`, name_input.value);
  // db_insert(db, `user/${user_id}/Pincode`, pincode_tag.value);
  // db_insert(db, `user/${user_id}/AllDone`, false);
  db_insert(db,`user/${user_id}`,obj);
  location.href = "/pages/home.html";
});

name_input.addEventListener("input",()=>{
  if(name_input.value.trim()===''){
    name_input.value=null;
  }
})

pincode_tag.addEventListener("input", async () => {
  if (pincode_tag.value.length === 6) {
    /*This one checks for the correct pincode using api */
    let url = `https://api.postalpincode.in/pincode/${pincode_tag.value}`;
    let data = await fetch(url);
    data = await data.json();
    if (data[0]["Status"] === "Success") {
      pincode_error.style.display = "none";
      submit_flag = true;
    } else {
      pincode_error.style.display = "block";
      submit_flag = false;
    }
  } else {
    pincode_error.style.display = "block";
  }
});

/*This function drives the signin functionality */
async function signiner() {
  if (user_signin_flag === true) {
    /*This one checks wether the user has already filled the details if yes then it will be redirected to main page*/
    if ((await detCheck()) === true) {
      location.href = "/pages/home.html";
    } else {
      popupHandler(); /*If the user hasnt filled any details the popup will be shown */
    }
  } else {
  /*If the user hasnt signed in  then it will be called for popup signin */
    signIn(auth, provider);
  }
}

/* This one calls the siginer function upon clicking any one of the  signin button */
signIn_icon.forEach((signin) => {
  signin.addEventListener("click", async () => {
    signiner();
    authFlag++; /*This flag helps to show the popup for the new users upon signin*/
  });
});

popup_close_icon.addEventListener("click",()=>{
    main_tag.classList.remove("blurrer");
    popup_tag.style.display = "none";
})
nav.style.display="none";

const loader=document.querySelector('.loading-cont');
window.onload = function(){
  setTimeout(function(){
    loader.style.opacity = "0";
    setTimeout(function(){
      loader.style.display = "none";
    }, 200);
  },1000);
}