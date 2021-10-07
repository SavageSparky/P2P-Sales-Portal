import { db_get, firebaseConfig } from "./firebase-util.js";

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const search_bar = document.querySelector("nav input");
// let suggestions = await db_get(db, "suggestions/");
const suggestions_cont = document.querySelector(".suggestions-cont");
// suggestions = suggestions.val();
// console.log(suggestions);
// const suggestors = [];
let suggestions={};
let carouselFlag = true;
const filterIcon=document.querySelector('nav .filter-icon img');
const area_filter=document.querySelector('.side-nav #area');
const sub_area_filter=document.querySelector('.side-nav #sub_area');
const district_filter=document.querySelector('.side-nav #district');
const type_filter=document.querySelector('.side-nav #type');
const date_Sort=document.querySelector('.side-nav #date_sort');
const price_Sort=document.querySelector('.side-nav #price_sort');
let enterArr=[];
let winLoc=window.location.href.toString().match(/([a-z]{4,5}:\/{2}[a-z:0-9\.-]{1,}\/)/gm);
let  windowLocationForImg=winLoc[0];
filterIcon.disabled=true;
// for (const key in suggestions) {
//   suggestors.push(key);
//   let temp_arr = [];
//   for (const keyer in suggestions[key]) {
//     temp_arr.push(keyer);
//   }
//   suggestions[key] = temp_arr;
// }

let client = new Typesense.Client({
  nearestNode: {
    host: "ld70jsxocqtimzbep-1.a1.typesense.net",
    port: "443",
    protocol: "https",
  }, // This is the special Nearest Node hostname that you'll see in the Typesense Cloud dashboard if you turn on Search Delivery Network
  nodes: [
    {
      host: "ld70jsxocqtimzbep-1.a1.typesense.net",
      port: "443",
      protocol: "https",
    },
  ],
  apiKey: "PpRn06qkFR4LiBcINGgtCSmf2wKg7lM8",
  connectionTimeoutSeconds: 2,
});

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


async function inputTriggerer(){
  filterIcon.disabled=true;
  suggestions={};
  suggestions_cont.classList.remove("none");
  suggestions_cont.innerHTML = "";
  currElement = null;
  highlighter = 0;
  let search = {
    q: `${search_bar.value}`,
    query_by: "product_suggestions,product_type,product_location",
    highlight_start_tag: "",
    highlight_end_tag: "",
    sort_by:"product_end_date:asc,product_price:asc",
    num_typos:"0"
  };
  
  let data = await client.collections("product").documents().search(search);
  
  if(data["found"] > 0) {
    data["hits"].forEach((d) => {

      d["highlights"].forEach((tmp) => {
        if(tmp['snippet']){
          if(!suggestions[tmp['snippet']]){
            suggestions[tmp['snippet']]=[];
            suggestions_cont.innerHTML+=`<div class="suggestions-list">${tmp['snippet']}</div>`;
          }
          suggestions[tmp['snippet']].push(d['document']['product_id']);
        }
        else{
          let snippets=tmp['snippets'];
          snippets.forEach((txt)=>{
            if(!suggestions[txt]){
              suggestions[txt]=[];
              suggestions_cont.innerHTML+=`<div class="suggestions-list">${txt}</div>`;
            }
          })
          snippets.forEach((txt)=>{
            suggestions[txt].push(d['document']['product_id']);
          })
        }
      });

    });
    suggestions_select();
  }
}


search_bar.addEventListener("input", () => {
  setTimeout(inputTriggerer,100);
});

search_bar.addEventListener('keypress',async (e)=>{
  if(e.key!=='Enter') return;
  console.log('input enter trigger');
  let search = {
    q: `${search_bar.value}`,
    query_by: "product_suggestions,product_type,product_location",
    highlight_start_tag: "",
    highlight_end_tag: "",
    sort_by:"product_end_date:asc,product_price:asc",
    num_typos:"0"
  };
  let data = await client.collections("product").documents().search(search);
  enterArr=[];
  filterFiller(data);
  console.log(data);
  data['hits'].forEach((d)=>{
    enterArr.push(d['document']['id']);
  });
  carouselFlag=false;
  sideNav.style.transform=`translateX(-400px)`;
  document.querySelector("main").classList.remove("shrinker");
  filterIcon.src=`${windowLocationForImg}/assets/icons/filter_off_outline.svg`;
  document.querySelector('main').style.flexDirection='unset';
  document.querySelector('main').innerHTML='';
  enterArr.forEach(pid=>{
    cardUpdater(pid);
  });
  document.querySelector("main").classList.remove("blurrer");
  suggestions_cont.classList.add("none");
  currElement = null;
  highlighter = 0;
  prevElement !== null ? (prevElement.style.backgroundColor = "initial") : "";
})

search_bar.addEventListener('click',()=>{})

function filterFiller(data){
  filterIcon.disabled=false;
  area_filter.innerHTML=`<option selected value="${null}">Any Area</option>`;
  sub_area_filter.innerHTML=`<option selected value="${null}">Any Sub Area</option>`;
  district_filter.innerHTML=`<option selected value="${null}">Any District</option>`;
  type_filter.innerHTML=`<option selected value="${null}">Any Type</option>`;

  enterArr=[];
  let areaArr=[];
  let sareaArr=[];
  let dArr=[];
  let tArr=[];
  data["hits"].forEach((d) => {
      areaArr.push(d['document']['product_location'][0]);
      sareaArr.push(d['document']['product_location'][1]);
      dArr.push(d['document']['product_location'][2]);
      tArr.push(d['document']['product_type']);
  });
  
  areaArr=[...new Set(areaArr)];
  sareaArr=[...new Set(sareaArr)];
  dArr=[...new Set(dArr)];
  tArr=[...new Set(tArr)];

  areaArr.forEach(t=>{
    area_filter.innerHTML+=`<option value="${t}">${t}</option>`
  });
  
  sareaArr.forEach(t=>{
    sub_area_filter.innerHTML+=`<option value="${t}">${t}</option>`
  });

  dArr.forEach(t=>{
    district_filter.innerHTML+=`<option value="${t}">${t}</option>`
  });

  tArr.forEach(t=>{
    type_filter.innerHTML+=`<option value="${t}">${t}</option>`
  });

}

function suggestions_select() {
  [...document.querySelectorAll(".suggestions-list")].forEach((data) => {
    data.addEventListener("click",async () => {
      suggestions_cont.classList.add("none");
      search_bar.value = data.textContent;
      let search = {
        q: `${search_bar.value}`,
        query_by: "product_suggestions,product_type,product_location",
        highlight_start_tag: "",
        highlight_end_tag: "",
        sort_by:"product_end_date:asc,product_price:asc",
        num_typos:"0"
      };
      let d=await client.collections("product").documents().search(search);
      filterFiller(d);
      document.querySelector("main").classList.remove("blurrer");

      main_div_loader(data.textContent);
    });
  });
}

function date_splitter(date) {
  date = date.split("-");
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
  return txt;
}

async function cardUpdater(p_id) {
  let data = await db_get(db, `product/${p_id}`);
  data = await data.val();
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
      search_bar.value = null;
      window.location = `/pages/landing_page.html?id=${d.dataset.id}`;
    });
  });
}

function main_div_loader(txt) {
  const main_tag = document.querySelector("main");
  main_tag.style.flexDirection = "unset";
  carouselFlag = false;
  main_tag.innerHTML = "";
  suggestions[txt]=[...new Set(suggestions[txt])];
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

let svgi = 1;

function carousel() {
  if (!carouselFlag) return;
  const banner = document.querySelector(".banner-card img");
  banner.style.animation = "blinker 5s ease infinite";
  banner.src = `../assets/images/banner${svgi}.svg`;
  svgi++;
  if (svgi > 3) {
    svgi = 1;
  }
}

function cardScroller(){
  const category_cont = document.querySelectorAll(".main-category-wrapper");
  category_cont.forEach((data) => {
    console.log(data.scrollWidth);
    let crdCont = data.querySelector(".category-wrapper");
    let leftBtn = data.querySelector(".left-arrow");
    let rightBtn = data.querySelector(".right-arrow");
    let dragFlag = false;
    let prevX = 0;
    let scrollLeft;
    leftBtn.addEventListener("click", () => {
      crdCont.scrollLeft -= 340;
      if (crdCont.scrollLeft <= 0) {
        crdCont.scrollLeft = 0;
      }
    });
    rightBtn.addEventListener("click", () => {
      crdCont.scrollLeft += 340;
      if (crdCont.scrollLeft + crdCont.offsetWidth >= crdCont.scrollWidth) {
        crdCont.scrollLeft = crdCont.scrollWidth;
      }
    });
    crdCont.addEventListener("mousedown", (e) => {
      dragFlag = true;
      prevX = e.pageX - crdCont.offsetLeft;
      scrollLeft = crdCont.scrollLeft;
      crdCont.style.cursor = "grabbing";
      crdCont.querySelectorAll(".card").forEach((d) => {
        d.style.cursor = "grabbing";
      });
    });
    crdCont.addEventListener("mouseup", (e) => {
      dragFlag = false;
      crdCont.style.cursor = "grab";
      crdCont.querySelectorAll(".card").forEach((d) => {
        d.style.cursor = "pointer";
      });
    });
    crdCont.addEventListener("mousemove", (e) => {
      if (!dragFlag) return;
      console.log(e);
      const x = e.pageX - crdCont.offsetLeft;
      const walk = Math.ceil(x) - prevX;
      crdCont.scrollLeft = scrollLeft - walk;
      crdCont.style.cursor = "grabbing";
      crdCont.scrollLeft += -(e.screenX - prevX) / 40;
      if (crdCont.scrollLeft < 0) {
        crdCont.scrollLeft = 0;
      }
      if (crdCont.scrollLeft > crdCont.scrollWidth) {
        crdCont.scrollLeft = crdCont.scrollWidth;
      }
    });
    crdCont.addEventListener("mouseleave", () => {
      dragFlag = false;
      crdCont.style.cursor = "grab";
    });
  });
}

/********************************************Default Product Loader**************************************/

async function defaultDataLoader(){
  let dbData=await db_get(db,'/product');
  dbData=await dbData.val();
  let categoryProducts={};

  for(const k in dbData){
    if(!categoryProducts[dbData[k]['type']]){
      categoryProducts[dbData[k]['type']]=[];
    }
    categoryProducts[dbData[k]['type']].push(dbData[k]);
  }
  console.log(categoryProducts);
  for(const k in categoryProducts){
    document.querySelector('main').innerHTML+=`<h2 class="category-heading">${k} Products</h2>`;
    let mcategoryWrapper=document.createElement('div');
    mcategoryWrapper.className='main-category-wrapper';
    let categoryWrapper=document.createElement('div');
    categoryWrapper.className='category-wrapper';
    mcategoryWrapper.appendChild(categoryWrapper);
    categoryProducts[k].forEach(product=>{
      categoryWrapper.innerHTML+=` <div class="card" data-id="${product['pid']}">
      <div class="prodcut_img_wrap">
      <img class="product_icon" src="${product['profile-img']}" alt="">
      </div>
      <ul class="card_main_text">
          <li><h3 class="product_name">${product['name']}</h3></li>
          <li><h3 class="price">Rs. ${product['price']}</h3></li>
      </ul>
      <ul class="card_body_text">
          <li>
              <img src="../assets/icons/capacity.svg" alt="">
              <h4 class="quantity">${product['remaining']}/${product['quantity']}</h4>
          </li>
          <li>
              <img src="../assets/icons/location.svg" alt="">
              <h4 class="address">${product['subArea']},${product['area']},${product['district']}</h4>
          </li>
          <li>
              <img src="../assets/icons/info.svg" alt="">
              <h4 class="category">${k}</h4>
          </li>
      </ul>
      <div class="end_time_div">
          <img src="../assets/icons/timer.svg" alt="">
          <h4 class="due_date">Ends in: ${date_splitter(product['due-date'])}</h4>
      </div>
      <div class="badges">
      ${
        product["delivery-available"] === "Yes"
          ? `<img src="../assets/icons/delivery_icon.svg" alt="">`
          : ``
      }
      </div>
      <div class="ribbons">
          <p>Featured</p>
      </div>
      </div>`
    })
    mcategoryWrapper.innerHTML+=`  <div class="nav-arrow-cont">
    <div class="left-arrow"><img src="../assets/icons/nav_arrow.svg" alt=""></div>
    <div class="right-arrow"><img src="../assets/icons/nav_arrow.svg" alt=""></div>
    </div>`;
    document.querySelector('main').appendChild(mcategoryWrapper);
  }
  cardScroller();
  redirector();
  carousel();
  setInterval(carousel, 5000);
}

defaultDataLoader();
/************************************************************************************************/

const sideNav=document.querySelector('.side-nav');
const filterTick=document.querySelector('.side-nav .tick_svg');
const filterClose=document.querySelector('.side-nav .close_svg');

filterTick.addEventListener("click",async ()=>{
  let filterArr=[sub_area_filter.value,area_filter.value,district_filter.value,type_filter.value];
  let str='';
  filterArr.forEach((t,i)=>{
    if(i<3&& t!==null && t!=='null'){
      str+=`product_location:${t}&&`;
    }
  });
  let search;
  if(filterArr[3]!=='null'){
    str+=`product_type:${filterArr[3]}&&`;
  }
  str=str.split('');
  str.splice(str.length-2,2);
  str=str.join('');
  console.log(str);
  if(str.length!==0){
    search = {
      q: `${search_bar.value}`,
      query_by: "product_suggestions,product_type,product_location",
      highlight_start_tag: "",
      highlight_end_tag: "",
      sort_by:`product_end_date:${date_Sort.value},product_price:${price_Sort.value}`,
      filter_by:`${str}`,
      num_typos:"0"
    };
  }
  else{
    search = {
      q: `${search_bar.value}`,
      query_by: "product_suggestions,product_type,product_location",
      highlight_start_tag: "",
      highlight_end_tag: "",
      sort_by:`product_end_date:${date_Sort.value},product_price:${price_Sort.value}`,
      num_typos:"0"
    };
  }
  console.log(search);
  let data = await client.collections("product").documents().search(search);

  enterArr=[];
  data["hits"].forEach((d) => {
      enterArr.push(d['document']['id']);
  });
  console.log(enterArr);
  carouselFlag=false;
  document.querySelector('main').style.flexDirection='unset';
  document.querySelector('main').innerHTML='';
  enterArr.forEach(pid=>{
    cardUpdater(pid);
  })
  sideNav.style.transform=`translateX(-400px)`;
  document.querySelector("main").classList.remove("shrinker");
  filterIcon.src=`${windowLocationForImg}/assets/icons/filter_outline.svg`
});

filterClose.addEventListener('click',async()=>{
  let  search = {
    q: `${search_bar.value}`,
    query_by: "product_suggestions,product_type,product_location",
    highlight_start_tag: "",
    highlight_end_tag: "",
    sort_by:`product_end_date:${date_Sort.value},product_price:${price_Sort.value}`,
    num_typos:"0"
  };
  console.log(search);
  let data = await client.collections("product").documents().search(search);

  enterArr=[];
  data["hits"].forEach((d) => {
      enterArr.push(d['document']['id']);
  });
  console.log(enterArr);
  carouselFlag=false;
  document.querySelector('main').style.flexDirection='unset';
  document.querySelector('main').innerHTML='';
  enterArr.forEach(pid=>{
    cardUpdater(pid);
  })
  sideNav.style.transform=`translateX(-400px)`;
  document.querySelector("main").classList.remove("shrinker");
  filterIcon.src=`${windowLocationForImg}/assets/icons/filter_off_outline.svg`
})

filterIcon.addEventListener("click",()=>{
  if(filterIcon.disabled) return;
  if(sideNav.style.transform==='translateX(-400px)'){
    sideNav.style.transform='translateX(0px)';
    document.querySelector("main").classList.add("shrinker");
  }
  else{
    sideNav.style.transform='translateX(-400px)';
    document.querySelector("main").classList.remove("shrinker");
  }
})