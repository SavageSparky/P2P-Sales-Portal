import { db_get, signIn,firebaseConfig, db_insert } from "./firebase-util.js";

firebase.initializeApp(firebaseConfig);
const auth=firebase.auth();
const db=firebase.database();
const provider = new firebase.auth.GoogleAuthProvider();
const signIn_icon=document.querySelector('.profile_icon');
const popup_tag=document.querySelector('.popup');
const main_tag=document.querySelector('main');
const pincode_tag=document.querySelector('.pincode');
const pincode_error=document.querySelector('.wrong-one');
const submit_btn=document.querySelector('form button');
const name_input=document.querySelectorAll('form input')[0];
let user_signin_flag=false;
let submit_flag=false;
let user_id;
let authFlag=0;
let allCompleted=false;
/***************************DB  Driver Functions**************************** */
firebase.auth().onAuthStateChanged(async (user)=>{
    if(user){
        user_signin_flag=true;
        user_id=user.uid;
        let temp=await detCheck();
        console.log(temp);
        if(temp===true){
            location.href='www.google.com';
        }
    }
    else{
        user_signin_flag=false;
    }
    if(authFlag===1){
        signiner();
    }
})

async function detCheck(){
    let data=await db_get(db,`user/${user_id}`);
    data=await data.val();
    if(data!==null){
        return true;
    }
    return false;
}

function popupHandler(){
    main_tag.classList.add('blurrer');
    popup_tag.style.display='flex';
}
/***********************************************************************/
submit_btn.addEventListener('click',(e)=>{
    e.preventDefault();
    if(!submit_flag) return;
    db_insert(db,`user/${user_id}/Name`,name_input.value);
    db_insert(db,`user/${user_id}/Pincode`,pincode_tag.value);
    location.href="#";
})

pincode_tag.addEventListener('input',async ()=>{
    if(pincode_tag.value.length===6){
        let url=`https://api.postalpincode.in/pincode/${pincode_tag.value}`;
        let data=await fetch(url);
        data=await data.json();
        if(data[0]['Status']==='Success'){
            pincode_error.style.display='none';
            submit_flag=true;
        }
        else{
            pincode_error.style.display='block';
            submit_flag=false;
        }
    }
    else{
        pincode_error.style.display='block';
    }
});

async function signiner(){
    if(user_signin_flag===true){
        if(await detCheck()===true){
            location.href='#';
        }
        else{
            popupHandler();
        }
    }
    else{
        signIn(auth,provider);
    }
}

signIn_icon.addEventListener("click",async ()=>{
    signiner();
    authFlag++;
});