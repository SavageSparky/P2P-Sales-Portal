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
let profile_idx=0;
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

function clicker(){  
    profile_pic_cont.addEventListener("click",()=>{
        if(!user_signin_flag) return;
        inp_tag_profile.click();
    })

    description_pic_cont.addEventListener("click",()=>{
        if(!user_signin_flag) return;
        description_pic_main_cont
        console.log("entwerr");
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
                console.log(imagesArr);
            }
    });
})

inp_tag_des.addEventListener('change',()=>{
    const currFiles=[...inp_tag_des.files];
    if(currFiles.length>3) return;
    console.log("Entering Here");
        currFiles.forEach((file,index)=>{
            if(validFileType(file)){
                if(index===0){
                    description_pic_cont.style.backgroundImage=`url(${URL.createObjectURL(file)})`;
                }
                else{
                    description_pic_main_cont.innerHTML+=` <div class="description_images_container"></div>`;
                    console.log(description_pic_main_cont.querySelectorAll('.description_images_container'));
                    [...description_pic_main_cont.querySelectorAll('.description_images_container')][index].style.backgroundImage=`url(${URL.createObjectURL(file)})`;
                    description_pic_cont=document.querySelectorAll('.description_images')[0];
                    console.log(description_pic_cont);
                    clicker();
                }
            }
            imagesArr.push(file);
            console.log(imagesArr);
    });
})

clicker();