import { db_get,firebaseConfig,db_insert, db_del} from "./firebase-util.js";

firebase.initializeApp(firebaseConfig);
const db=firebase.database();
const params = new URLSearchParams(window.location.search);
console.log(params);
const id = params.get("id");
let user_id;
const myReviewCont=document.querySelector('.my_review');
const postButton=document.querySelector('.post_button');
postButton.disabled=true;
let prev_cmnt_heading='Product Review';
let prev_rating=1
let prev_cmnt_body='Review Description';
let user_cmt_data;
const ratings_reviews_cont=document.querySelector('.rating_reviews');
let postBtnArr=[0,0,0]
let prevCommentFilledFlag=false;

firebase.auth().onAuthStateChanged(async (user) => {
    if(user){
        user_id=user.uid;
        defaultUserCmntData();
        document.querySelector('.loading-cont').style.display='none';
    }
    else{
        document.querySelector('.loading-cont').style.display='flex';
        location.href='/index.html';
    }
});


function date_splitter(date){
    date=date.split('-');
    // console.log(date);
    let txt;
    switch (+date[1]){
        case 1:
            txt=`${date[2]} Jan ${date[0]}`;
            break;
        case 2:
            txt=`${date[2]} Feb ${date[0]}`;
            break;
        case 3:
            txt=`${date[2]} Mar ${date[0]}`;
            break;
        case 4:
            txt=`${date[2]} Apr ${date[0]}`;
            break;
        case 5:
            txt=`${date[2]} May ${date[0]}`;
            break;
        case 6:
            txt=`${date[2]} Jun ${date[0]}`;
            break;
        case 7:
            txt=`${date[2]} Jul ${date[0]}`;
            break;
        case 8:
            txt=`${date[2]} Aug ${date[0]}`;
            break;
        case 9:
            txt=`${date[2]} Sept ${date[0]}`;
            break;
        case 10:
            txt=`${date[2]} Oct ${date[0]}`;
            break;
        case 11:
            txt=`${date[2]} Nov ${date[0]}`;
            break;
        case 12:
            txt=`${date[2]} Dec ${date[0]}`;
            break;
    }
    // console.log(txt);
    return txt;
}

/*********************** Product details Fetch - Start ****************************/  

let data = await db_get(db, `product/${id}`);

data = await data.val();

const product_price = data['price'];
const product_minOrder = data["minOrders"];
const product_remaining = data["remaining"];
let final_price = product_minOrder * product_price;
let final_qty = product_minOrder;

const productImgArray = Object.keys(data["product-des-imgs"]).length;

const imageHolder = document.querySelector('.image_select');

function getDesImage(){
    let text = "";
    for(let i=0; i<productImgArray; i++) {
         text += `
            <div class="image_select_wrap">
                <img class="img${i}" src=${data["product-des-imgs"][i]} alt="">
            </div>
            `;
    }
    return text;
}
const imageHolderContent = getDesImage();

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
        ${imageHolderContent}
        <div class="image_nav_arrow">
            <img src="../assets/icons/nav_arrow.svg" alt="" id="image_nav_arrow_right">
        </div>
    </div>
</div>
<div class="product_details">
    <h1 class="product_name">${data["name"]}</h1>
    <h3 class="product_price">Rs. ${product_price}</h3>
    <h3 class="product_due">${date_splitter(data['due-date'])}</h3>
    <hr>
    <table class="detail_list">
        <tr>
            <td><h4 class="detail_list_elements">Available </h4></td>
            <td><h4>:</h4></td>
            <td><h4 id="detail_quantiy">${product_remaining}/${data["quantity"]}</h4></td>
        </tr>
        <tr>
            <td><h4 class="detail_list_elements">Min-order </h4></td>
            <td><h4>:</h4></td>
            <td><h4 id="detail_quantiy"> ${product_minOrder} ${data['productScale']}</h4></td>
        </tr>
        <tr>
            <td><h4 class="detail_list_elements">Delivery </h4></td>
            <td><h4>:</h4></td>
            <td><h4 id="delivery"> ${data["delivery-available"]}</h4></td>
        </tr>
        <tr>
            <td><h4 class="detail_list_elements">Category </h4></td>
            <td><h4>:</h4></td>
            <td><h4 id="detail_type"> ${data["type"]}</h4></td>
        </tr>
        <tr>
            <td><h4 class="detail_list_elements">Manufact. date </h4></td>
            <td><h4>:</h4></td>
            <td><h4 id="detail_type"> March, 2021</h4></td>
        </tr>
    </table>
    <hr>
    
    <form class="product_buy">
        <div class="quantity_wrapper">
            <label for="quanity">Quantity</label>
            <input type="number"
            id="quantity" 
            name="quantity" 
            min=${product_minOrder}
            max=${product_remaining}
            value= ${product_minOrder}
            required
            >
        </div> 
        <h5 class="quantity_warning"></h5>
        <h4 class="estimated_price">Estimated Price: Rs. ${product_price}</h4>
        <div class="buy_button">
            Place Buy Request
        </div>
    </form>
</div>
`;
/*********************** Product details Fetch - End ****************************/


document.getElementById('quantity').addEventListener('input', function (){
    final_qty = this.value;
    final_price = (this.value) * (product_price);
    document.querySelector('.estimated_price').innerHTML =
        `Estimated Price: Rs. ${final_price}`;

    if(final_qty < product_minOrder) {
        document.querySelector('.quantity_warning').innerHTML = 
         `Enter quantity greater or equal to ${product_minOrder}`;
    }
    else if( +final_qty > product_remaining) {
        document.querySelector('.quantity_warning').innerHTML = 
         `Enter quantity less than or equal to ${product_remaining}`;
    }
    else {
        document.querySelector('.quantity_warning').innerHTML = "";
    }
})

/**********************Confirm window ********************/
const buy_button = document.querySelector('.buy_button');
const confirm_window = document.querySelector('.confirm_window');
const confirm_section = document.querySelector('.confirm_section');
const confirm_success = document.querySelector('.order_successful_section');
const confirmWindow_cancel = document.getElementById("cancel");
const confirmWindow_confirm = document.getElementById('confirm');
const confirm_window_close = document.getElementById('close_button');
const main_div = document.querySelector("main");

buy_button.addEventListener("click", ()=>{
    if(final_qty >= product_minOrder && final_qty <= product_remaining) {
        confirm_window.classList.toggle('none');
        main_div.classList.toggle('background_disabled');
        main_div.style.filter = "blur(5px)";
        const cw_table = document.querySelector('.confirm_window > table');
        cw_table.innerHTML = `
        <tr>
            <td><h3 class="cw_product_name_label">Product</h3></td>
            <td><h3 class="cw_product_name cw_details">${data["name"]}</h3></td>
        </tr>
        <tr>
            <td><h3 class="cw_price_label">Price/ Unit</h3></td>
            <td><h3 class="cw_price cw_details">${product_price}</h3></td>
        </tr>
        <tr>
            <td><h3 class="cw_quantity_label">Quantity</h3></td>
            <td><h3 class="cw_quantity cw_details">${final_qty}</h3></td>
        </tr>
        <tr>
            <td><h3 class="cw_amount_label">Final Amount</h3></td>
            <td><h3 class="cw_amount cw_details">Rs.${final_price}</h3></td>
        </tr>
        `;
    }
    else {
        
    }
})

confirmWindow_cancel.addEventListener('click', ()=> {
    confirm_window.classList.toggle('none');
    main_div.classList.toggle('background_disabled');
    main_div.style.filter = "none";
})

/*************************** place Buy request **********************************/ 

confirmWindow_confirm.addEventListener('click', ()=> {
    let order_object = {
        "buyer": user_id,
        "quantity": final_qty
    }
    const order = db.ref(`product/${id}/buy_requests`).push(order_object);
    db.ref(`user/${user_id}/my_orders/${order.key}`).set(id);
    confirm_section.classList.toggle('none');
    confirm_success.classList.toggle('none');
})

confirm_window_close.addEventListener('click', ()=> {
    confirm_success.classList.toggle('none');
    confirm_window.classList.toggle('none');
    main_div.classList.toggle('background_disabled');
    main_div.style.filter = "none";
    confirm_section.classList.toggle('none');
})

/*************************** Address and Description ******************************/
document.querySelector('.description').innerHTML = `
<div class="product_address">
    <h3 class="product_address_label">Address: </h4>
    <h4 id="product_address_text">${data["street"]}, ${data["area"]}, ${data["district"]}, ${data["pincode"]}</h4>
    <div class="google_map">
        <h3>Map:</h3>
        <div class="map_wrapper">
        <div class="gmap_canvas">
        <iframe
          width="300"
          height="300"
          id="gmap_canvas"
          src="https://maps.google.com/maps?q=${data['subArea']},${data['area']},${data['district']}&ie=UTF8&iwloc=&output=embed"
          frameborder="0"
          scrolling="no"
          marginheight="0"
          marginwidth="0"
        ></iframe
        ><a href="https://yggtorrent-fr.com"></a><br /><style>
          .mapouter {
            position: relative;
            text-align: right;
            height: 300px;
            width: 300px;
          }</style
        ><a href="https://google-map-generator.com">embed google map</a
        ><style>
          .gmap_canvas {
            overflow: hidden;
            background: none !important;
            height: 300px;
            width: 300px;
            border-radius: 0.5rem;
            margin-bottom: 0.5rem;
          }
        </style>
      </div>
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

let seller_id = data["user-id"];
let seller = await db_get(db, `user/${seller_id}`);
seller = await seller.val();
// console.log(seller);
document.querySelector('.seller_details').innerHTML = `
<div class="seller_img_wrap">
    <img class="seller_img" src=${seller["profileImgUrl"]} alt="">
</div>
<div class="seller_name">
    <h3>${seller["Name"]}</h3>
</div>
<div class="seller_contact">
    <div class="seller_phone_no">
        <img src="../assets/icons/phone.svg" alt="">
        <h4 class="phone_no_text">${seller["phNo"]}</h4>
    </div>
    <div class="seller_address">
        <img src="../assets/icons/location.svg" alt="">
        <h4 class="seller_address">${seller["street"]}, ${seller["subArea"]}, ${seller["area"]}, ${seller["Pincode"]}</h4>
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
 

/********************User Star Hover Functionality***************************************************/

const star_cont=document.querySelector('.star_count_1');
let star_num=1;
function star_hover_highlighter(num){
    document.querySelectorAll('.star_count_1 img').forEach(d=>{
        if(+d.id<=+num){
            d.src=`../assets/icons/star_filled.svg`;
        }
        else{
            d.src=`../assets/icons/star_unfilled.svg`
        }
    })
}

function star_hover_eventListeners(){
    star_cont.addEventListener("mousedown",(e)=>{
        star_num=+e.target.id;
        if(star_num!==prev_rating){
                postBtnArr[0]=1;
        }
        else{
            postBtnArr[0]=0;
        }
        postButtonToggler(postBtnArr);
    })

    star_cont.addEventListener("mousemove",(e)=>{
        if(e.target.id.length===0) return; 
        star_hover_highlighter(e.target.id);
    })

    star_cont.addEventListener("mouseleave",(e)=>{
        star_hover_highlighter(star_num);
    })
}


/************************************************************************************************** */

/**************************************************User Comment Poster*****************************************/

// let comments_data=await db_get(db,`product/${id}/comments`);
// comments_data=comments_data.val();

// if(comments_data){
//     console.log(comments_data);
//     ratings_reviews_cont.innerHTML='';
//     for(const key in comments_data){
//         comment_filler(key,comments_data[key]);
//     }
// }
ratings_reviews_cont.innerHTML='';
let commnetsDbRef=db.ref(`product/${id}/comments`);

commnetsDbRef.on('child_added',(comments_data)=>{
    comments_data=comments_data.val();
    comment_filler(comments_data);
    console.log(prevCommentFilledFlag);
    // if(prevCommentFilledFlag===false){
    //     console.log("Entering here prev comment")
    //     postFirstCommentShower();
    // }
    // else{
    //     document.querySelector('.post_new_review').style.display='none';
    //     document.querySelector('.my_review').style.display='unset';
    // }
});

commnetsDbRef.on('child_changed',(data)=>{
    data=data.val();
    if(data['user_id']===user_id) return;
    comment_Modifier(data);
})

function starsReturner(num){
    let str='';
    for(let i=1;i<=num;i++){
        str+=`<img id="${i}" src="../assets/icons/star_filled.svg" alt="">`;
    }
    for(let i=num+1;i<=5;i++){
        str+=`<img id="${i}" src="../assets/icons/star_unfilled.svg" alt="">`;
    }
    return str;
}



/******************************Post a new review********************************* */
document.querySelector('.post_new_review button').addEventListener("click",()=>{
    document.querySelector('.post_new_review').style.display='none';
    document.querySelector('.my_review').style.display='unset';
    let tmp=window.location.href.toString().match(/([a-z]{4,5}:\/{2}[a-z:0-9\.-]{1,}\/)/gm);
    let imgSrc=tmp[0];
    const img_icon=myReviewCont.querySelector('.icon_cont img');
    img_icon.src=`${imgSrc}assets/icons/off_close.svg`;
    myReviewCont.querySelector('.review_subject').contentEditable="true";
    myReviewCont.querySelector('.main_review_cont').contentEditable="true";
    star_cont.style.pointerEvents="auto";
});

async function defaultUserCmntData(){
    let user_details=await db_get(db,`/user/${user_id}`);
    user_details=user_details.val();
    myReviewCont.querySelector('.user_det_cont').innerHTML=`<div class="user_pic_cont"><img src="${user_details['profileImgUrl']}" alt=""></div>
<div class="user_det">
    <h3 class="user_name">${user_details['Name']}</h3>
    <div class="date_cont">${date_splitter(new Date().toISOString().slice(0, 10))}, ${user_details['area']}</div>
    </div>`;
}

function like_dislike_filler(likes,dislikes){
    let ans=''
    if(likes===undefined){
        likes=[];
    }
    if(dislikes===undefined){
        dislikes=[];
    }
    let temp_likes=[];
    for(let key in likes){
        temp_likes.push(key);
    }
    likes=temp_likes;
    temp_likes=[];
    for(let key in dislikes){
        temp_likes.push(key);
    }
    dislikes=temp_likes;

    let like_arr=likes.filter((a)=>{
        return a===user_id
    });
    let dislike_arr=dislikes.filter((a)=>{
        return a===user_id
    });
    if(like_arr.length>=1){
        ans+=    `<div class="like_cont"><img class="like-icon active-btn" src="../assets/icons/like_checked.svg" alt="">
        <h4>${likes.length} likes</h4>
        </div>
        <div class="dislike_cont"><img class="dislike-icon" src="../assets/icons/dislike_unchecked.svg" alt="">
        <h4>${dislikes.length} dislikes</h4>
        </div>`
    }
    else if(dislike_arr.length>=1){
        ans+=    `<div class="like_cont"><img class="like-icon" src="../assets/icons/like_unchecked.svg" alt="">
        <h4>${likes.length} likes</h4>
        </div>
        <div class="dislike_cont active-btn"><img class="dislike-icon active-btn" src="../assets/icons/dislike_checked.svg" alt="">
        <h4>${dislikes.length} dislikes</h4>
        </div>`
    }
    else{
        ans+=    `<div class="like_cont"><img class="like-icon" src="../assets/icons/like_unchecked.svg" alt="">
        <h4>${likes.length} likes</h4>
        </div>
        <div class="dislike_cont"><img class="dislike-icon" src="../assets/icons/dislike_unchecked.svg" alt="">
        <h4>${dislikes.length} dislikes</h4>
        </div>`
    }
    return ans;
}


async function comment_filler(user_cmt_data){
    let user_details=await db_get(db,`/user/${user_cmt_data['user_id']}`);
    user_details=user_details.val();
    if(user_cmt_data['user_id']===user_id){
        myReviewCont.querySelector('.user_det_cont').innerHTML=`<div class="user_pic_cont"><img src="${user_details['profileImgUrl']}" alt=""></div>
        <div class="user_det">
            <h3 class="user_name">${user_details['Name']}</h3>
            <div class="date_cont">${user_cmt_data['date']}, ${user_details['area']}</div>
        </div>`
        star_num=+user_cmt_data['rating'];
        star_hover_highlighter(star_num);
        prev_cmnt_heading=user_cmt_data['heading'];
        prev_cmnt_body=user_cmt_data['comment'];
        prev_rating=user_cmt_data['rating'];
        myReviewCont.querySelector('.review_subject').textContent=user_cmt_data['heading'];
        myReviewCont.querySelector('.main_review_cont').innerHTML=user_cmt_data['comment'];
        document.querySelector('.post_new_review').style.display='none';
        document.querySelector('.my_review').style.display='unset';
    }
    else{
        ratings_reviews_cont.innerHTML+=`<div class="user_review" data-cmntid="${user_cmt_data['user_id']}">
        <div class="user_det_cont">
            <div class="user_pic_cont"><img src="${user_details['profileImgUrl']}" alt=""></div>
            <div class="user_det">
                <h3 class="user_name">${user_details['Name']}</h3>
                <div class="date_cont">${user_cmt_data['date']}, ${user_details['area']}</div>
            </div>
        </div>
        <div class="star_heading_cont">
            <div class="star_count">
                ${starsReturner(user_cmt_data['rating'])}
            </div>
            <h3 class="review_subject">${user_cmt_data['heading']}</h3>
        </div>
        <div class="main_review_cont">
            ${user_cmt_data['comment']}
        </div>
        <div class="like_dislike_cont">
        ${like_dislike_filler(user_cmt_data['likes'],user_cmt_data['dislikes'])}
    </div>`
    }
    liker();
}

async function comment_Modifier(user_cmt_data){
    const tag=document.querySelector(`.user_review[data-cmntid=${user_cmt_data['user_id']}`);
    let user_details=await db_get(db,`/user/${user_cmt_data['user_id']}`);
    user_details=user_details.val();
    tag.innerHTML = ` <div class="user_det_cont">
    <div class="user_pic_cont"><img src="${
      user_details["profileImgUrl"]
    }" alt=""></div>
    <div class="user_det">
        <h3 class="user_name">${user_details["Name"]}</h3>
        <div class="date_cont">${user_cmt_data["date"]}, ${
      user_details["area"]
    }</div>
    </div>
</div>
<div class="star_heading_cont">
    <div class="star_count">
        ${starsReturner(user_cmt_data["rating"])}
    </div>
    <h3 class="review_subject">${user_cmt_data["heading"]}</h3>
</div>
<div class="main_review_cont">
    ${user_cmt_data["comment"]}
</div>
<div class="like_dislike_cont">
  ${like_dislike_filler(user_cmt_data['likes'],user_cmt_data['dislikes'])}
</div>`;
}

myReviewCont.addEventListener("click",(e)=>{

    let head=myReviewCont.querySelector('.review_subject');
    let comment_review=myReviewCont.querySelector('.main_review_cont');

    if(head.textContent.trim().length===0){
        head.textContent=prev_cmnt_heading;
    }

    if(comment_review.textContent.trim().length===0){
        comment_review.innerHTML=prev_cmnt_body;
    }
})

myReviewCont.querySelector('.review_subject').addEventListener('input',()=>{
    let head=myReviewCont.querySelector('.review_subject');
    if(head.textContent.trim().length===0 || head.textContent.trim()===prev_cmnt_heading){
        postBtnArr[1]=0;
    }
    else{
        postBtnArr[1]=1;
    }
    postButtonToggler(postBtnArr);
})

myReviewCont.querySelector('.main_review_cont').addEventListener('input',()=>{
    let comment_review=myReviewCont.querySelector('.main_review_cont');
    if(comment_review.textContent.trim().length===0 || comment_review.innerHTML.trim()===prev_cmnt_body){
        postBtnArr[2]=0;
    }
    else{
        postBtnArr[2]=1;
    }
    postButtonToggler(postBtnArr);
})


function postButtonToggler(arr){
    let enabler=false;
    arr.forEach(d=>{
        if(d===1) enabler=true;
    });
    if(enabler===true){
        postButton.classList.remove('disabled_btn');
        postButton.disabled=false;
    }
    else{
        postButton.classList.add('disabled_btn');
        postButton.disabled=true;
    }
}

postButton.addEventListener('click',(e)=>{
    postButton.classList.add('disabled_btn');
    console.log(postButton);
    postButton.disabled=true;
    user_cmt_data={
        'rating':star_num,
        'heading':myReviewCont.querySelector('.review_subject').innerHTML.trim(),
        'comment':myReviewCont.querySelector('.main_review_cont').innerHTML.trim(),
        'user_id':user_id,
        'date':date_splitter(new Date().toISOString().slice(0, 10))
    }
    db_insert(db,`/product/${id}/comments/${user_id}`,user_cmt_data);
    prev_cmnt_heading=myReviewCont.querySelector('.review_subject').innerHTML.trim();
    prev_cmnt_body=myReviewCont.querySelector('.main_review_cont').innerHTML.trim();
    prev_rating=star_num;
    postBtnArr=[0,0,0];
    let tmp=window.location.href.toString().match(/([a-z]{4,5}:\/{2}[a-z:0-9\.-]{1,}\/)/gm);
    let imgSrc=tmp[0];
    const img_icon=myReviewCont.querySelector('.icon_cont img');
    img_icon.src=`${imgSrc}assets/icons/edit.svg`;
    myReviewCont.querySelector('.review_subject').contentEditable="false";
    myReviewCont.querySelector('.main_review_cont').contentEditable="false";
    star_cont.style.pointerEvents="none";
})

function liker(){
    document.querySelectorAll('.user_review').forEach(data=>{
        data.addEventListener("click",(e)=>{
            console.log(e.target);
            const user_cmt_id=e.path[3].dataset['cmntid'];
            if(e.target.classList.contains('like-icon')){
                if(e.target.classList.contains('active-btn')){
                    db_del(db,`/product/${id}/comments/${user_cmt_id}/likes/${user_id}`);
                }
                else{
                    db_insert(db,`/product/${id}/comments/${user_cmt_id}/likes/${user_id}`,'');
                    db_del(db,`/product/${id}/comments/${user_cmt_id}/dislikes/${user_id}`);   
                }
            }
            if(e.target.classList.contains('dislike-icon')){
                if(e.target.classList.contains('active-btn')){
                    db_del(db,`/product/${id}/comments/${user_cmt_id}/dislikes/${user_id}`);
                }
                else{
                    db_insert(db,`/product/${id}/comments/${user_cmt_id}/dislikes/${user_id}`,'');
                    db_del(db,`/product/${id}/comments/${user_cmt_id}/likes/${user_id}`);
                }
            }
        })
    })
}

/*************************************Edit a Review*********************************** */
myReviewCont.querySelector('.icon_cont').addEventListener("click",()=>{
    let tmp=window.location.href.toString().match(/([a-z]{4,5}:\/{2}[a-z:0-9\.-]{1,}\/)/gm);
    let imgSrc=tmp[0];
    const img_icon=myReviewCont.querySelector('.icon_cont img');

    if(img_icon.src===`${imgSrc}assets/icons/edit.svg`){
        img_icon.src=`${imgSrc}assets/icons/off_close.svg`;
        myReviewCont.querySelector('.review_subject').contentEditable="true";
        myReviewCont.querySelector('.main_review_cont').contentEditable="true";
        star_cont.style.pointerEvents="auto";
    }
    else{
        img_icon.src=`${imgSrc}assets/icons/edit.svg`;
        myReviewCont.querySelector('.review_subject').contentEditable="false";
        myReviewCont.querySelector('.main_review_cont').contentEditable="false";
        myReviewCont.querySelector('.review_subject').innerHTML=prev_cmnt_heading;
        myReviewCont.querySelector('.main_review_cont').innerHTML=prev_cmnt_body;
        star_num=prev_rating;
        star_hover_highlighter(star_num);
        postBtnArr=[0,0,0];
        postButtonToggler(postBtnArr);
        star_cont.style.pointerEvents="none";
    }
})

star_cont.style.pointerEvents='none';
star_hover_eventListeners();