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

//main panel fetch
async function fetchPdtIds(user_id) {
  let userProducts = await db.ref(`user/${user_id}/products`).get();
  userProducts = userProducts.val();
  // console.log(userProducts);
  for(let key in userProducts) {
    await cardUpdater(userProducts[key]);
  }
  enableCardEvents();
}


async function cardUpdater(p_id) {
  let data = await db_get(db, `product/${p_id}`);
  data = await data.val();
  // console.log(data);
  cardSection.innerHTML += `
    <div class="card" data-id="${p_id}">
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
}

// card click
function enableCardEvents() {
  const cards = document.querySelectorAll('.card');
  cards.forEach((card)=> {
      card.addEventListener('click', (e)=>{
        sidePanel.classList.toggle('triggered');
        mainPanel.classList.toggle('side_panel_space');
        const productId = e.target.dataset.id;
        buyerUpdater(productId);
      })
  });
  mainPanel.addEventListener('click', (e)=>{
    if(sidePanel.classList.contains('triggered') && !(e.target.classList.contains('card')) ) {
      sidePanel.classList.toggle('triggered');
      mainPanel.classList.toggle('side_panel_space');
    }
  });
    
}


// side panel
async function buyerUpdater(productId){
  let reqProduct = await db.ref(`product/${productId}/price`).get();
  reqProduct = reqProduct.val();
  let buyRequests = await db.ref(`product/${productId}/buy_requests`).get();
  buyRequests = buyRequests.val();
  // console.log(buyRequests);
  sidePanel.innerHTML = "";
  for( let buyRequest in buyRequests) {
    const buyerId = buyRequests[buyRequest].buyer;
    const qty = buyRequests[buyRequest].quantity;
    let buyerDetails = await db.ref(`user/${buyerId}`).get();
    buyerDetails = buyerDetails.val();
    
    sidePanel.innerHTML += `
      <div class="buyer" data-request-id=${buyRequest}>
        <div class="buyer_overview">
            <div class="buyer_details_container">
                <div class="img_container">
                    <img class="profile_img" src=${buyerDetails.profileImgUrl} alt="">
                </div>
                <div class="name_container">
                    <h3 class="name">${buyerDetails.Name}</h3>
                    <h5 class="place">${buyerDetails.area}</h5>
                </div>
            </div>
            <div class="buy_size">
                <h4 class="buy_amount">Rs. ${(+reqProduct) * (+qty)}</h4>
                <h4 class="buy_units">${qty} units</h4>
            </div>
        </div>
        <div class="buyer_expand">
            <div class="buyer_expand_details">
                <div class="buyer_phone_container">
                    <img src="../assets/icons/phone.svg" alt="">
                    <h5 class="buyer_phone">${buyerDetails.phNo}</h5>
                </div>
                <div class="buyer_address_container">
                    <img src="../assets/icons/location.svg" alt="">
                    <h5 class="buyer_address">${buyerDetails.street}, ${buyerDetails.subArea}, ${buyerDetails.area}</h5>
                </div>
            </div>
            <div class="buyer_actions">
                <div class='accept'>Accept</div>
                <div class="reject">Reject</div>
            </div>
        </div>
      </div>  
    `;
  }
  const buyers = document.querySelectorAll('.buyer');
  // console.log(buyers);
  buyers.forEach(async (buyer)=> {
    const buyRequestId = buyer.dataset.requestId;
    // console.log(buyRequestId);
    let buyRequest = await db.ref(`product/${productId}/buy_requests/${buyRequestId}`).get();
    buyRequest = buyRequest.val();
    // console.log(buyRequest);
    let flag = true;
    buyer.addEventListener('click', () => {
        buyer.querySelector('.buyer_expand').classList.toggle('triggered');
        if(flag) {
          buyer.querySelector('.accept').addEventListener('click', async ()=> {
            let remaining = await db.ref(`product/${productId}/remaining`).get();
            remaining = remaining.val();
            remaining = (+remaining) - (+buyRequest.quantity);
            // console.log(remaining);
            db.ref(`product/${productId}`).update({
              "remaining": remaining.toString()
            });
            db.ref(`product/${productId}/buy_requests/${buyRequestId}`).remove();
            db.ref(`user/${buyRequest.buyer}/my_orders/${buyRequestId}`).remove();
            sidePanel.removeChild(buyer);
            let data = await db.ref(`product/${productId}`).get();
            data = data.val();
            let selectedCard = document.querySelector(`[data-id=${productId}]`);
            selectedCard.querySelector('.quantity').innerHTML = `${data["remaining"]}/${data["quantity"]}`
          })
          buyer.querySelector('.reject').addEventListener('click', ()=> {
            db.ref(`product/${productId}/buy_requests/${buyRequestId}`).remove();
            db.ref(`user/${buyRequest.buyer}/my_orders/${buyRequestId}`).remove();
            sidePanel.removeChild(buyer);
          })
          flag = false;
        }
    })
  })
}


