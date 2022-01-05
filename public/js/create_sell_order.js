import { db_get, db_insert, firebaseConfig, pushKey, regex_rem } from "./firebase-util.js";
/*******************************FireBase Functions************************************ */
firebase.initializeApp(firebaseConfig);
let user_id;
let user_signin_flag=false;
let firstClick=false;
let imagesArr=[];
let district;
document.querySelector('nav').style.display='none';
const loading_not=document.querySelector('.message-txt');
loading_not.style.display='none';

let client = new Typesense.Client({
  'nearestNode': { 'host': 'fz1ownpx60rl9tjgp-1.a1.typesense.net', 'port': '443', 'protocol': 'https' }, // This is the special Nearest Node hostname that you'll see in the Typesense Cloud dashboard if you turn on Search Delivery Network
  'nodes': [
    { 'host': 'fz1ownpx60rl9tjgp-1.a1.typesense.net', 'port': '443', 'protocol': 'https' },
  ],
  'apiKey': 'tLRRS6eytcqObFf83I743GYJOODVb55k',
  'connectionTimeoutSeconds': 2
})


firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        user_id=user.uid;
        user_signin_flag=true;
        let adone=await db_get(firebase.database(),`user/${user_id}/AllDone`);
        adone=adone.val();
        document.querySelector('.loading-cont').style.display='none';
        defaultPincodeFiller();
        console.log(adone);
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
  let scnt=0;
  let profileImgUrl;
  let desImgsUrl=[];
  function firebase_img_uploader(file,type,pid){
    const file_name=(type==='profile')?`${pid}-product-profile`:`${pid}-product-${scnt}`;
    const imagesRef = firebase.storage().ref(`images/${user_id}/products/${pid}`);
    let upload_task=imagesRef.child(file_name).put(file);
    scnt++;
    loading_not.textContent="Images are Uploading...Please Wait";
    upload_task.on('state_changed',
    (snapshot) => {}, 
    (error) => {
        console.log(error);
        loading_not.textContent="Error in Uploading the Image...Please Try Again";
        setTimeout(()=>{
            loading_not.textContent=''
            document.querySelector('.loading-cont').style.display='none';
        },2000);
    },
    ()=>{
            imagesRef.child(file_name).getDownloadURL().then((url)=>{
                if(type==='profile'){
                    profileImgUrl=url;
                    all_done_arr++;
                }
                else{
                    desImgsUrl.push(url);
                    cnt++;
                    all_done_arr++;
                }
                if(all_done_arr===imagesArr.length){
                    loading_not.textContent="Datas are Uploading...Please Wait"
                    dbUploader();
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
const description=document.querySelector('.textarea');
const pid=pushKey(firebase.database(),'/product',`${user_id}`);
const input_elements=document.querySelectorAll('.input_area');

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
    let sub_area=await db_get(firebase.database(),`user/${user_id}/subArea`);
    street=street.val();
    sub_area=sub_area.val();
    document.querySelectorAll('.input_area')[9].value=sub_area;
    document.querySelectorAll('.input_area')[10].value=street;
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


document.querySelectorAll('.input_area')[2].addEventListener('input',(e)=>{
    document.querySelectorAll('.input_area')[4].max=+e.srcElement.value;
})

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




function dbUploader(){
    let suggestions=[...document.querySelector('.selected_suggestions').querySelectorAll('div')];
    suggestions=suggestions.map((data)=>{
        return regex_rem(data.querySelector('p').textContent.toLowerCase());
    })
    suggestions.push(regex_rem(input_elements[0].value.toLowerCase()));
    console.log(suggestions);
    let radio_val;
    document.querySelectorAll('input[type=radio]').forEach(data=>{
        if(data.checked){
            radio_val=data.value;
        }
    })

    
    let main_data_obj={
        pid,
        "profile-img":profileImgUrl,
        "product-des-imgs":desImgsUrl,
        "user-id":user_id,
        "name":regex_rem(input_elements[0].value),
        "price":regex_rem(input_elements[1].value),
        "quantity":regex_rem(input_elements[2].value),
        "remaining":regex_rem(input_elements[2].value),
        'productScale':regex_rem(input_elements[3].value),
        'minOrders':regex_rem(input_elements[4].value),
        "type":regex_rem(input_elements[5].value),
        "due-date":regex_rem(input_elements[6].value),
        "pincode":regex_rem(input_elements[7].value),
        "area":regex_rem(input_elements[8].value),
        "subArea":regex_rem(input_elements[9].value),
        "street":regex_rem(input_elements[10].value),
        "delivery-available":radio_val,
        "description":input_elements[12].innerHTML,
        "suggestions":suggestions,
        "district":district
    };


    let typeSenseJson={
        "id":pid,
        "product_id":pid,
        "product_name":regex_rem(input_elements[0].value),
        "product_price":+regex_rem(input_elements[1].value),
        "product_location":[input_elements[8].value,regex_rem(input_elements[9].value),district],
        "product_end_date":input_elements[6].valueAsNumber,
        "product_type":input_elements[5].value.toLowerCase(),
        "product_suggestions":suggestions
    }

    client.collections("product").documents().create(typeSenseJson);

    console.log(main_data_obj);

    suggestions.forEach(async d=>{
        db_insert(firebase.database(),`suggestions/${d}/${pid}`,pid);
    });

    db_insert(firebase.database(),`user/${user_id}/products/${pid}`,pid);
    firebase.database().ref(`product/${pid}`).set(main_data_obj,(error)=>{
        if(error){
            loading_not.textContent="Error in Uploading Data...Please Try again";
            setTimeout(()=>{
                loading_not.textContent="";
                document.querySelector('.loading-cont').style.display='none';
            },1000);
        }else{
            loading_not.textContent="Product added Successfully....Redirecting";
            setTimeout(()=>{
                location.href='/pages/home.html';    
            },1000);       
        }
    });
}


submit_btn.addEventListener("click",async (e)=>{
    console.log('triggered 0');
    // e.preventDefault();
    if(profile_idx===null){
        profile_pic_cont.style.boxShadow='0 0 5px red';
        setTimeout(()=>{
            profile_pic_cont.style.boxShadow='0 0 5px var(--primary-color)';
        },3000);
        return;
    } 
    console.log('triggered 1');
    if(imagesArr.length<2){
        description_pic_cont[0].style.boxShadow='0 0 5px red'
        setTimeout(()=>{
            description_pic_cont[0].style.boxShadow='0 0 5px var(--blue-light)';
        },3000)
        return;
    }
    console.log('triggered 2');
    let returner=0;
    await input_elements.forEach((data,indexx)=>{
        if(data.value===null || data.value==='null' || data.value==="" && indexx!==11){
            returner=1;
            console.log('triggered 3');
            if(data.value==='null'){
                pincode_tag.value=null;
                returner=1;
            }
        }
    })
    if(input_elements[12].textContent.trim().length===0 || input_elements[12].textContent.trim()==="Please Fill Out this Field"){
        returner=1;
        console.log('triggered 4');
        input_elements[12].style.boxShadow='0 0 5px rgb(255, 0, 0)';
        setTimeout(()=>{
            input_elements[12].style.boxShadow='0 0 5px rgb(184, 184, 184)';
        },3000);
        input_elements[12].textContent="Please Fill Out this Field";
    }
    
    if(+input_elements[1].value<=0 || +input_elements[2].value<=0 || +input_elements[4].value<=0 || +input_elements[2].value < +input_elements[4].value){

        console.log('triggered 5');
        returner=1;
    }
    if(returner===1) return;
    document.querySelector('.loading-cont').style.display='flex';
    loading_not.style.display='unset';
    firebase_img_uploader(imagesArr[profile_idx],'profile',pid);
    const product_des_img_arr=[];
    imagesArr.forEach((data,index)=>{
        if(index!=profile_idx)
            product_des_img_arr.push(firebase_img_uploader(data,"abc",pid));
    })
    // setInterval(pageRedirector,550);
    console.log('triggered last');
})

clicker();

// function pageRedirector(){
//     if(imagesArr.length===all_done_arr){
//         setTimeout(()=>{
//             location.href='/pages/home.html';
//         },100);
//     }
// }

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
















