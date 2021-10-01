import { db_get, firebaseConfig } from "./firebase-util.js";

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const search_bar = document.querySelector("nav input");
let suggestions = await db_get(db, "suggestions/");
const suggestions_cont = document.querySelector(".suggestions-cont");
suggestions = suggestions.val();
console.log(suggestions);
const suggestors = [];
let carouselFlag=true;

for (const key in suggestions) {
  suggestors.push(key);
  let temp_arr=[];
  for(const keyer in suggestions[key]){
    temp_arr.push(keyer);
  }
  suggestions[key]=temp_arr;
}

console.log(suggestions);

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

console.log(suggestors);

search_bar.addEventListener("input", () => {
  let regexer = new RegExp(search_bar.value, "gi");
  suggestions_cont.classList.remove("none");
  suggestions_cont.innerHTML = "";
  currElement = null;
  highlighter = 0;
  suggestors.forEach((data, index) => {
    if (data.match(regexer) !== null) {
      suggestions_cont.innerHTML += `<div class="suggestions-list">${suggestors[index]}</div>`;
      suggestions_select();
    }
  });
});

function suggestions_select() {
  [...document.querySelectorAll(".suggestions-list")].forEach((data) => {
    data.addEventListener("click", () => {
      suggestions_cont.classList.add("none");
      search_bar.value = data.textContent;
      document.querySelector("main").classList.remove("blurrer");
      main_div_loader(data.textContent);
    });
  });
}

function date_splitter(date) {
  date = date.split("-");
  console.log(date);
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
  console.log(txt);
  return txt;
}

async function cardUpdater(p_id) {
  let data = await db_get(db, `product/${p_id}`);
  data = await data.val();
  console.log(data);
  document.querySelector("main").innerHTML += `
    <div class="card" data-id="${p_id}"">
    <div class="prodcut_img_wrap">
    <img class="product_icon" src=${data["profile-img"]} alt="">
    </div>
    <ul class="card_main_text">
        <li><h3 class="product_name">${data["name"]}</h3></li>
        <li><h3 class="price">Rs. ${data["price"]}</h3></li>
    </ul>
    <ul class="card_body_text">
        <li>
            <img src="../assets/icons/capacity.svg" alt="">
            <h4 class="quantity">${data["remaining"]}/${data["quantity"]}</h4>
        </li>
        <li>
            <img src="../assets/icons/location.svg" alt="">
            <h4 class="address">${data["street"]},${data["area"]}</h4>
        </li>
        <li>
            <img src="../assets/icons/info.svg" alt="">
            <h4 class="category">${data["type"]}</h4>
        </li>
    </ul>
    <div class="end_time_div">
        <img src="../assets/icons/timer.svg" alt="">
        <h4 class="due_date">Ends in: ${date_splitter(data["due-date"])}</h4>
    </div>
    <div class="badges">
        ${
          data["delivery-available"] === "Yes"
            ? `<img src="../assets/icons/delivery_icon.svg" alt="">`
            : ``
        }
    </div>
    <div class="ribbons">
        <p>Featured</p>
    </div>
</div>
    `;
  redirector();
}

function redirector() {
  document.querySelectorAll(".card").forEach((d) => {
    d.addEventListener("click", () => {
      search_bar.value=null;
      window.location = `/pages/landing_page.html?id=${d.dataset.id}`;
    });
  });
}

function main_div_loader(txt) {
  const main_tag = document.querySelector("main");
  main_tag.style.flexDirection='unset';
  carouselFlag=false;
  main_tag.innerHTML = "";
  suggestions[txt].forEach((data) => {
    cardUpdater(data);
  });
}

let highlighter = 0;

let prev;
let currElement = null;
let prevElement = null;
window.addEventListener("keydown", (e) => {
  if (
    suggestions_cont.classList.contains("none") ||
    suggestions_cont.childElementCount === 0
  )
    return;
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    if (prev === "up" && e.key === "ArrowDown") {
      highlighter += 2;
    }
    if (prev === "down" && e.key === "ArrowUp") {
      highlighter -= 2;
    }
    if (highlighter === suggestions_cont.childElementCount) {
      prevElement.style.backgroundColor = "initial";
      highlighter = 0;
    }
    if (highlighter < 0) {
      prevElement.style.backgroundColor = "initial";
      highlighter = suggestions_cont.childElementCount - 1;
    }
    if (prevElement !== null) {
      prevElement.style.backgroundColor = "initial";
    }
    suggestions_cont.querySelectorAll("div")[
      highlighter
    ].style.backgroundColor = "#e6e6e6";
    currElement = suggestions_cont.querySelectorAll("div")[highlighter];
    prevElement = currElement;
    if (e.key === "ArrowDown") {
      if (
        currElement.offsetTop + currElement.offsetHeight >=
        suggestions_cont.offsetHeight
      ) {
        suggestions_cont.scrollTop += currElement.offsetHeight + 8;
      }
      if (highlighter >= suggestions_cont.childElementCount - 1) {
        suggestions_cont.scrollTop = suggestions_cont.scrollHeight;
      }
      if (highlighter <= 0) {
        suggestions_cont.scrollTop = 0;
      }
      highlighter++;
      prev = "down";
    } else if (e.key === "ArrowUp") {
      if (
        currElement.offsetTop + currElement.offsetHeight >=
        suggestions_cont.offsetHeight
      ) {
        suggestions_cont.scrollTop -= currElement.offsetHeight + 8;
      }
      if (highlighter >= suggestions_cont.childElementCount - 1) {
        suggestions_cont.scrollTop = suggestions_cont.scrollHeight;
      }
      if (highlighter <= 0) {
        suggestions_cont.scrollTop = 0;
      }
      highlighter--;
      prev = "up";
    }
  } else if (e.key === "Enter" && currElement !== null) {
    suggestions_cont.classList.add("none");
    search_bar.value = currElement.textContent;
    document.querySelector("main").classList.remove("blurrer");
    main_div_loader(currElement.textContent);
  } else {
    return;
  }
});

window.addEventListener("click", (e) => {
  if (e.target.classList.contains("search_box")) {
    suggestions_cont.classList.remove("none");
    document.querySelector("main").classList.add("blurrer");
    currElement = null;
    highlighter = 0;
    prevElement !== null ? (prevElement.style.backgroundColor = "initial") : "";
  } else {
    suggestions_cont.classList.add("none");
    document.querySelector("main").classList.remove("blurrer");
    currElement = null;
    highlighter = 0;
    prevElement !== null ? (prevElement.style.backgroundColor = "initial") : "";
  }
});

/********************************Drag Functionality for cards in home page*********************************** */


let svgi=1;


function carousel(){
  if(!carouselFlag) return;
  const banner=document.querySelector('.banner-card img');
  banner.style.animation='blinker 5s ease infinite';
  banner.src=`../assets/images/banner${svgi}.svg`;
  svgi++;
  if(svgi>3){
    svgi=1;
  }
}

const category_cont=document.querySelectorAll('.main-category-wrapper');
category_cont.forEach(data=>{
  console.log(data.scrollWidth);
  let crdCont=data.querySelector('.category-wrapper');
  let leftBtn=data.querySelector('.left-arrow');
  let rightBtn=data.querySelector('.right-arrow');
  let dragFlag=false;
  let prevX=0;
  let scrollLeft;
  leftBtn.addEventListener("click",()=>{
    crdCont.scrollLeft-=280;
    if(crdCont.scrollLeft<=0){
      crdCont.scrollLeft=0;
    }
  });
  rightBtn.addEventListener('click',()=>{
    crdCont.scrollLeft+=280;
    if(crdCont.scrollLeft+crdCont.offsetWidth>=crdCont.scrollWidth){
      crdCont.scrollLeft=crdCont.scrollWidth;
    }
  });
  crdCont.addEventListener("mousedown",(e)=>{
    dragFlag=true;
    prevX=e.pageX-crdCont.offsetLeft;
    scrollLeft=crdCont.scrollLeft;
    crdCont.style.cursor="grabbing";
    crdCont.querySelectorAll('.card').forEach(d=>{
      d.style.cursor="grabbing";
    });
  })
  crdCont.addEventListener("mouseup",(e)=>{
    dragFlag=false;
    crdCont.style.cursor="grab";
    crdCont.querySelectorAll('.card').forEach(d=>{
      d.style.cursor="pointer";
    });
  })
  crdCont.addEventListener("mousemove",(e)=>{
    if(!dragFlag) return;
    console.log(e);
    const x=e.pageX-crdCont.offsetLeft;
    const walk=(Math.ceil(x)-prevX);
    crdCont.scrollLeft=scrollLeft-walk;
    crdCont.style.cursor="grabbing";
    crdCont.scrollLeft+=-(e.screenX-prevX)/40;
    if(crdCont.scrollLeft<0){crdCont.scrollLeft=0;}
    if(crdCont.scrollLeft>crdCont.scrollWidth){crdCont.scrollLeft=crdCont.scrollWidth;}
  })
  crdCont.addEventListener("mouseleave",()=>{
    dragFlag=false;
    crdCont.style.cursor="grab";
  });
})

carousel();
setInterval(carousel,5000);