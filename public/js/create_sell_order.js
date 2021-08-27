import { firebaseConfig, pushKey } from "./firebase-util.js";
/*******************************FireBase Functions************************************ */
firebase.initializeApp(firebaseConfig);
let user_id;
let user_signin_flag=false;
let firstClick=false;
let imagesArr=[];
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        user_id=user.uid;
        user_signin_flag=true;
    }
    else{
        user_signin_flag=false;
        location.href='/index.html';
    }
  });


  function firebase_img_uploader(file,type,pid,index){
    const file_name=(type==='profile')?`${pid}-product-profile`:`${pid}-product-${index}`;
    console.log(user_id,pid);
    const imagesRef = firebase.storage().ref(`images/${user_id}/products/${pid}`);
    let upload_task=imagesRef.child(file_name).put(file);

    upload_task.on('state_changed',
    (snapshot) => {}, 
    (error) => {
        console.log(error);
    },
     ()=>{
            imagesRef.child(file_name).getDownloadURL().then((url)=>{
                console.log(url);
                return url;
            });
      }
    );   
}

/*************************************************************************************** */
const profile_pic_cont=document.querySelector('.profile-img-cont');
const inp_tag_profile=document.querySelector('#profile-pic-upload');
let description_pic_cont=document.querySelector('.description_images_container');
const inp_tag_des=document.querySelector('#des-pic-upload');
const description_pic_main_cont=document.querySelector('.description_images');
let profile_idx=null;
const pincode_tag=document.querySelector('#pincode');
const area_drop_down=document.querySelector('#area');
const submit_btn=document.querySelector('#submit');

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
    description_pic_cont.addEventListener("click",()=>{
        if(!user_signin_flag) return;
        let len=document.querySelectorAll('.description_images_container').length;
        if(len>1){
            while(len>1){
                console.log("Entereing here");
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
}

inp_tag_profile.addEventListener('change',()=>{
    const currFiles=[...inp_tag_profile.files];
        currFiles.forEach((file,index)=>{
            if(validFileType(file)){
                profile_pic_cont.style.backgroundImage=`url(${URL.createObjectURL(file)})`;
                // firebase_img_uploader(file,"profile",index);
                imagesArr.push(file);
                profile_idx=imagesArr.length-1;
                firebase_img_uploader(file,"profile",'123456');
            }
    });
})

inp_tag_des.addEventListener('change',()=>{
    const currFiles=[...inp_tag_des.files];
    if(currFiles.length>3) return;
        currFiles.forEach((file,index)=>{
            if(validFileType(file)){
                if(index===0){
                    description_pic_cont.style.backgroundImage=`url(${URL.createObjectURL(file)})`;
                }
                else{
                    description_pic_main_cont.innerHTML+=` <div class="description_images_container"></div>`;
                    [...description_pic_main_cont.querySelectorAll('.description_images_container')][index].style.backgroundImage=`url(${URL.createObjectURL(file)})`;
                    description_pic_cont=document.querySelectorAll('.description_images_container')[0];
                    clicker();
                }
            }
            imagesArr.push(file);
            console.log(imagesArr);
    });
})

pincode_tag.addEventListener('input',async ()=>{
    if(pincode_tag.value.length===6){
        let url=`https://api.postalpincode.in/pincode/${pincode_tag.value}`;
        let pincode_json=await fetch(url);
        pincode_json=await pincode_json.json();
        console.log(pincode_json);
        if(pincode_json[0].Status==="Error"){
            area_drop_down.innerHTML=`   <option disabled selected value=${null}>No area Found</option>`;
        }
        else{
            area_drop_down.innerHTML=``;
            pincode_json[0].PostOffice.forEach(d=>{
                area_drop_down.innerHTML+=` <option value=${d.Name}>${d.Name}</option>`;
            })
        }
        console.log(area_drop_down.value);
    }
    else{
        area_drop_down.innerHTML=`   <option disabled selected value=${null}>No area Found</option>`
    }
})

submit_btn.addEventListener("click",(e)=>{
    e.preventDefault();
    if(profile_idx===null) return;
    if(imagesArr.length<2) return;
    const input_elements=document.querySelectorAll('.input_area');
    const profile_img_url=firebase_img_uploader(imagesArr[profile_idx],'profile',pid,0);
    const product_des_img_arr=[];
    imagesArr.forEach(async(data,index)=>{
        if(index!=profile_idx)
            product_des_img_arr.push(await firebase_img_uploader(data,"abc",pid,index));
    })
    const pid=pushKey(firebase.database(),'/product',`${user_id}`);

    let main_data_obj={
        pid,
        "user-id":user_id,
        "name":input_elements[0].value,
        "price":input_elements[1].value,
        "quantity":input_elements[2].value,
        "type":input_elements[3].value,
        "due-date":input_elements[4].value,
        "pincode":input_elements[5].value,
        "area":input_elements[6].value,
        "street":input_elements[7].value,
        "delivery-available":input_elements[8].value,
        "description":input_elements[11].value
    };
})

clicker();
clicker();

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
    document.getElementById(event.target.id).parentElement.remove();
})


