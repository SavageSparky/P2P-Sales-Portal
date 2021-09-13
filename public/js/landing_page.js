import { db_get,firebaseConfig,db_insert} from "./firebase-util.js";

firebase.initializeApp(firebaseConfig);
const db=firebase.database();
const params = new URLSearchParams(window.location.search);
console.log(params);
const id = params.get("id");


firebase.auth().onAuthStateChanged(async (user) => {
    if(user){
        document.querySelector('.loading-cont').style.display='none';
    }
    else{
        document.querySelector('.loading-cont').style.display='flex';
        location.href='/index.html';
    }
});

let data = await db_get(db, `product/${id}`);
data = await data.val();
console.log(data);
document.querySelector('.basic_details').innerHTML = `
<div class="img_container">
    <div class="image_preview_wrap">
        <img src=${data["profile-img"]} alt="" class="image_preview">
    </div>
    <div class="image_select">
        <div class="image_nav_arrow">
            <img src="../assets/icons/nav_arrow.svg" alt="" id="image_nav_arrow_left">
        </div>
        <div class="image_select_wrap">
            <img class="img0" src=${data["profile-img"]} alt="">
        </div>
        <div class="image_select_wrap">
            <img class="img1" src=${data["product-des-imgs"][0]} alt="">
        </div>
        <div class="image_select_wrap">
            <img class="img2" src=${data["product-des-imgs"][1]} alt="">
        </div>
        <div class="image_select_wrap">
            <img class="img3" src=${data["product-des-imgs"][2]} alt="">
        </div>
        <div class="image_nav_arrow">
            <img src="../assets/icons/nav_arrow.svg" alt="" id="image_nav_arrow_right">
        </div>
    </div>
</div>
<div class="product_details">
    <h1 class="product_name">${data["name"]}</h1>
    <h3 class="product_price">Rs. ${data["price"]}</h3>
    <h3 class="product_due">Ends in: 30th September, 2021</h3>
    <hr>
    <ul class="detail_list">
        <li>
            <h4 class="detail_list_elements">Available: </h4>
            <h4 id="detail_quantiy">${data["remaining"]}/${data["quantity"]}</h4>
        </li>
        <li>
            <h4 class="detail_list_elements">Min-order: </h4>
            <h4 id="detail_quantiy"> 10 units</h4>
        </li>
        <li>
            <h4 class="detail_list_elements">Delivery:</h4>
            <h4 id="delivery"> ${data["delivery-available"]}</h4>
        </li>
        <li>
            <h4 class="detail_list_elements">Category: </h4>
            <h4 id="detail_type"> ${data["type"]}</h4>
        </li>
        <li>
            <h4 class="detail_list_elements">Manufact. date: </h4>
            <h4 id="detail_type"> March, 2021</h4>
        </li>
    </ul>
    <hr>
    
    <form class="product_buy">
        <div class="quantity_wrapper">
            <label for="quanity">Quantity</label>
            <input type="number"
            id="quantity" 
            name="quantity" 
            min="1"
            required
            >
        </div> 
        <h4 class="estimated_price">Estimated Price: Rs. 10,000</h4>
        <button type="submit" class="buy_button">
            Place Buy Request
        </button>
    </form>
</div>
`;

document.querySelector('.description').innerHTML = `
<div class="product_address">
    <h3 class="product_address_label">Address: </h4>
    <h4 id="product_address_text">${data["street"]}, ${data["area"]}, ${data["district"]}, ${data["pincode"]}</h4>
    <div class="google_map">
        <h3>Map:</h3>
        <div class="map_wrapper">
            
        </div>
    </div>
</div>
<div class="description_text">
    <h3>About:</h3>
    <h4>
        ${data["description"]}
    </h4>
</div>
`;


document.querySelector('.seller_details').innerHTML = `
<div class="seller_img_wrap">
    <img class="seller_img" src="../assets/images/beluga.jpg" alt="">
</div>
<div class="seller_name">
    <h3>Beluga</h3>
</div>
<div class="seller_contact">
    <div class="seller_phone_no">
        <img src="../assets/icons/phone.svg" alt="">
        <h4 class="phone_no_text">9876543210</h4>
    </div>
    <div class="seller_address">
        <img src="../assets/icons/location.svg" alt="">
        <h4 class="seller_address">Street, Area, asadd, District, Pincode, State.</h4>
    </div>
</div>
`;

// image select and preview
const image_wrap = document.querySelector(".image_preview_wrap>img");
const image_select = document.querySelector('.image_select');

image_select.addEventListener('click', (e)=>{
    if(e.target.parentElement.className == 'image_select_wrap'){
        const selected_img = e.target.src;
        image_wrap.src = selected_img;
    }
    if(e.target.parentElement.className == 'image_nav_arrow') {
        //  Code to be done later
    }
})

