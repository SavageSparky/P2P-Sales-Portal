import { firebaseConfig } from "./firebase-util.js";

/*******************************FireBase Functions************************************ */
firebase.initializeApp(firebaseConfig);
let user_id;
let user_signin_flag=false;
let firstClick=false;
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


  function firebase_img_uploader(file){
    const storage=getStorage();
    const imagesRef = ref(storage, 'images');

  }
/*************************************************************************************** */
const profile_pic_cont=document.querySelector('.profile-img-cont');
const inp_tag_profile=document.querySelector('#profile-pic-upload');
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

function validFileType(file) {
    return fileTypes.includes(file.type);
  }

profile_pic_cont.addEventListener("click",()=>{
    if(!user_signin_flag) return;
    console.log("Entering here");
    inp_tag_profile.click();
})

inp_tag_profile.addEventListener('change',()=>{
    const currFiles=[...inp_tag_profile.files];
    console.log(currFiles);
        currFiles.forEach((file,index)=>{
            if(validFileType(file)){
                profile_pic_cont.style.background=`url(${URL.createObjectURL(file)}) no-repeat`;
                profile_pic_cont.style.backgroundSize=`350px`;
                firebase_img_uploader(file,"profile",index);
            }
    });
})

