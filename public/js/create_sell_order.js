import { db_get, db_insert, firebaseConfig, pushKey } from "./firebase-util.js";
/*******************************FireBase Functions************************************ */
firebase.initializeApp(firebaseConfig);
let user_id;
let user_signin_flag=false;
let firstClick=false;
let imagesArr=[];
let district;

firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        user_id=user.uid;
        user_signin_flag=true;
        let adone=await db_get(firebase.database(),`user/${user_id}/AllDone`);
        adone=adone.val();
        document.querySelector('.loading-cont').style.display='none';
        defaultPincodeFiller();
        if(adone===null || adone==='false' || adone===false){
            user_signin_flag=false;
            location.href='/pages/home.html';
        }
    }
    else{
        user_signin_flag=false;
        location.href='/index.html';
        document.querySelector('.loading-cont').style.display='flex';
    }
  });

  let cnt=0;
  function firebase_img_uploader(file,type,pid){
    const file_name=(type==='profile')?`${pid}-product-profile`:`${pid}-product-${cnt}`;
    const imagesRef = firebase.storage().ref(`images/${user_id}/products/${pid}`);
    let upload_task=imagesRef.child(file_name).put(file);

    upload_task.on('state_changed',
    (snapshot) => {}, 
    (error) => {},
    ()=>{
            imagesRef.child(file_name).getDownloadURL().then((url)=>{
                if(type==='profile'){
                    db_insert(firebase.database(),`product/${pid}/profile-img`,url);
                    all_done_arr++;
                }
                else{
                    db_insert(firebase.database(),`product/${pid}/product-des-imgs/${cnt}`,url);
                    cnt++;
                    all_done_arr++;
                }
            });
      }
    );
  }
/*************************************************************************************** */
const profile_pic_cont=document.querySelector('.profile-img-cont');
const inp_tag_profile=document.querySelector('#profile-pic-upload');
let description_pic_cont=document.querySelectorAll('.description_images_container');
const inp_tag_des=document.querySelector('#des-pic-upload');
const description_pic_main_cont=document.querySelector('.description_images');
let profile_idx=null;
const pincode_tag=document.querySelector('#pincode');
const area_drop_down=document.querySelector('#area');
const submit_btn=document.querySelector('#submit');
const date_inp=document.querySelector('input[type=date]');
let all_done_arr=0;
let area;
const fileTypes = [
    "image/apng",
    "image/bmp",
    "image/gif",
    "image/jpeg",
    "image/pjpeg",
    "image/png",
    "image/svg+xml",
    "image/tiff",
    "image/webp",
    "image/x-icon"
  ];

function imgTypeFinder(type){
  return type.match(/\..*/i);
}

function validFileType(file) {
    return fileTypes.includes(file.type);
}

profile_pic_cont.addEventListener("click",()=>{
    if(!user_signin_flag) return;
    inp_tag_profile.click();
})

function clicker(){  
    description_pic_cont.forEach(d=>{
    d.addEventListener("click",()=>{
        if(!user_signin_flag) return;
        let len=document.querySelectorAll('.description_images_container').length;
        if(len>1){
            while(len>1){
                document.querySelectorAll('.description_images_container')[len-1].remove();
                len--;
            }
            document.querySelector('.description_images_container').style.backgroundImage='';
        }
        if(profile_idx!==null){
            let temp=imagesArr[profile_idx];
            let i=imagesArr.length
            while(i>0){
                imagesArr.pop();
                i--;
            }
            imagesArr.push(temp);
            profile_idx=0;
        }
        else{
            let i=imagesArr.length
            while(i>0){
                imagesArr.pop();
                i--;
            }
        }
        inp_tag_des.click();
    })
});
}

async function defaultPincodeFiller(){
    let temp=await db_get(firebase.database(),`user/${user_id}/Pincode`);
    let street=await db_get(firebase.database(),`user/${user_id}/street`);
    street=street.val();
    document.querySelectorAll('.input_area')[7].value=street;
    area=await db_get(firebase.database(),`user/${user_id}/area`);
    area=area.val();
    temp=temp.val();
    pincode_tag.value=temp;
    PincodeFiller();
}

async function PincodeFiller(){
    let url=`https://api.postalpincode.in/pincode/${pincode_tag.value}`;
    if(pincode_tag.value.match(/\./)){
        pincode_tag.value=null;
        return;
    }
    let pincode_json=await fetch(url);
    pincode_json=await pincode_json.json();
    if(pincode_json[0].Status==="Error"){
        console.log("Pincode not found");
        pincode_tag.value=null;
        area_drop_down.innerHTML=`<option disabled selected value=${null}>No area Found</option>`;
    }
    else{
        area_drop_down.innerHTML=``;
        pincode_json[0].PostOffice.forEach(d=>{
            if(d.Name===area){
                area_drop_down.innerHTML+=` <option value=${d.Name} selected>${d.Name}</option>`;
            }
            else{
                area_drop_down.innerHTML+=` <option value=${d.Name}>${d.Name}</option>`;
            }
            district=d.District;
        })
    }
}


inp_tag_profile.addEventListener('change',()=>{
    const currFiles=[...inp_tag_profile.files];
        currFiles.forEach((file,index)=>{
            if(validFileType(file)){
                profile_pic_cont.style.backgroundImage=`url(${URL.createObjectURL(file)})`;
                // firebase_img_uploader(file,"profile",index);
                imagesArr.push(file);
                profile_idx=imagesArr.length-1;
            }
    });
})

date_inp.addEventListener("input",(e)=>{
    const today = new Date();
    const currdate = today.getFullYear()+'-'+(((today.getMonth()+1<=9)?`0${today.getMonth()+1}`:today.getMonth()+1))+'-'+(((today.getDate()<=9)?`0${today.getDate()}`:today.getDate()));
    if(date_inp.value < currdate){
        date_inp.value=null;
        e.target.setCustomValidity(`Due date must not be less than today's date`);
    }
    else{
        e.target.setCustomValidity('');
    }
})

inp_tag_des.addEventListener('change',()=>{
    const currFiles=[...inp_tag_des.files];
    if(currFiles.length>3) return;
        currFiles.forEach((file,index)=>{
            if(validFileType(file)){
                if(index===0){
                    description_pic_cont[0].style.backgroundImage=`url(${URL.createObjectURL(file)})`;
                }
                else{
                    description_pic_main_cont.innerHTML+=` <div class="description_images_container"></div>`;
                    [...description_pic_main_cont.querySelectorAll('.description_images_container')][index].style.backgroundImage=`url(${URL.createObjectURL(file)})`;
                    description_pic_cont=document.querySelectorAll('.description_images_container');
                    clicker();
                }
            }
            imagesArr.push(file);
    });
})

pincode_tag.addEventListener('input',async ()=>{
    if(pincode_tag.value.length===6){
        PincodeFiller();
    }
    else if(pincode_tag.value.length>6){
        pincode_tag.value=null;
        area_drop_down.innerHTML=`   <option disabled selected value=${null}>No area Found</option>`;
    }
    else{
        area_drop_down.innerHTML=`   <option disabled selected value=${null}>No area Found</option>`
    }
})

submit_btn.addEventListener("click",async (e)=>{
    // e.preventDefault();
    if(profile_idx===null) return;
    if(imagesArr.length<2) return;
    const pid=pushKey(firebase.database(),'/product',`${user_id}`);
    const input_elements=document.querySelectorAll('.input_area');
    let returner=0;
    await input_elements.forEach((data,indexx)=>{
        if(data.value===null || data.value==="" && indexx!==8)
        returner=1;
    })
    if(returner===1) return;
    firebase_img_uploader(imagesArr[profile_idx],'profile',pid);
    const product_des_img_arr=[];
    let suggestions=[...document.querySelector('.selected_suggestions').querySelectorAll('div')];
    suggestions=suggestions.map((data)=>{
        return data.querySelector('p').textContent;
    })
    suggestions.push(input_elements[0].value);
    imagesArr.forEach((data,index)=>{
        if(index!=profile_idx)
            product_des_img_arr.push(firebase_img_uploader(data,"abc",pid));
    })
    let radio_val;
    document.querySelectorAll('input[type=radio]').forEach(data=>{
        if(data.checked){
            radio_val=data.value;
        }
    })

    
    let main_data_obj={
        pid,
        "user-id":user_id,
        "name":input_elements[0].value,
        "price":input_elements[1].value,
        "quantity":input_elements[2].value,
        "remaining":input_elements[2].value,
        "type":input_elements[3].value,
        "due-date":input_elements[4].value,
        "pincode":input_elements[5].value,
        "area":input_elements[6].value,
        "street":input_elements[7].value,
        "delivery-available":radio_val,
        "description":input_elements[9].value,
        "suggestions":suggestions,
        "district":district
    };
    let p=await db_get(firebase.database(),`user/${user_id}/products`)
    suggestions.forEach(async d=>{
        let temp=await db_get(firebase.database(),`suggestions/${d}`);
        temp=temp.val();
        let sug_arr;
        if(temp!==null){
            sug_arr=[...temp];
        }
        else{
            sug_arr=[];
        }
        sug_arr.push(pid);
        db_insert(firebase.database(),`suggestions/${d}`,sug_arr);
    })
    let user_products;
    p=p.val();
    if(p!==null){
        user_products=[...p];
    }
    else{
        user_products=[];
    }
    user_products.push(pid);
    db_insert(firebase.database(),`user/${user_id}/products`,user_products);
    db_insert(firebase.database(),`product/${pid}`,main_data_obj);
    document.querySelector('.loading-cont').style.display='flex';
    setInterval(pageRedirector,550);
})

clicker();

function pageRedirector(){
    if(imagesArr.length===all_done_arr){
        location.href='/pages/home.html';
    }
}

const suggestion_input = document.querySelector('#search_suggestions');
const selected_suggestions = document.querySelector('.selected_suggestions');
let newDiv_option;
let suggestion_counter = 0;
suggestion_input.addEventListener('keydown', (e)=>{
    if(e.key=="Enter"){
        e.preventDefault();
        if(suggestion_input.value == ""){
            return;
        }
        const newDiv = document.createElement("div");
        const p_element = document.createElement("p");
        const close_img = document.createElement("img");
        close_img.src = '../assets/icons/close_icon.svg';
        close_img.id = `close_icon${suggestion_counter}`;
        close_img.className = 'close_icon';
        suggestion_counter++;
        const text_content = document.createTextNode(suggestion_input.value);
        p_element.append(text_content);
        newDiv.appendChild(p_element);
        newDiv.appendChild(close_img);
        selected_suggestions.appendChild(newDiv);
        suggestion_input.value = "";
    }
})

selected_suggestions.addEventListener('click',(event)=>{
    if(event.target.className=='close_icon'){
        document.getElementById(event.target.id).parentElement.remove();
    }
})
















