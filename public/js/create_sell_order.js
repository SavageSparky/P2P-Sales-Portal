import { firebaseConfig } from "./firebase-util.js";
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
        location.href='/public/index.html';
    }
  });


  function firebase_img_uploader(file,type,index){
    let file_name=(type==='profile')?`${user_id}-product-profile`:`${user_id}-product-${index}`;
    file_name+=`.${imgTypeFinder(file.type)}`;
    console.log(file_name);
    const imagesRef = firebase.storage().ref(`images/${file_name}`);
    imagesRef.delete().then(() => {
        
      }).catch((error) => {
         console.log("NO image found");
      });
      imagesRef.put(file).then((snapshot)=>{
          console.log('Uploaded');
      })
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
  return type.replace(/image\//g,"");
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

clicker();