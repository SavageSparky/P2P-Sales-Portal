import { db_get, signIn,firebaseConfig, db_insert } from "./firebase-util.js";

firebase.initializeApp(firebaseConfig);
const auth=firebase.auth();
const db=firebase.database();
const provider = new firebase.auth.GoogleAuthProvider();
const signIn_icon=document.querySelector('.profile_icon');
const popup_tag=document.querySelector('popup');
const main_tag=document.querySelector('main');
const pincode_tag=document.querySelector('.pincode');
const pincode_error=document.querySelector('.wrong-one');
const submit_btn=document.querySelector('form button');
const name_input=document.querySelectorAll('form input')[0];
let user_signin_flag=false;
let submit_flag=false;
let user_id;


/***************************DB  Driver Functions**************************** */
auth.onAuthStateChanged((user)=>{
    if(user){
        user_signin_flag=true;
        user_id=user.uid;
    }
    else{
        user_signin_flag=false;
    }
})

async function detCheck(){
    const data=await db_get(db,`user/${user_id}`);
    data=data.val();
    if(data){
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
    let user_det={
        "Name":`${name_input.value}`,
        "Pincode":`${pincode_tag.value}`
    }
    db_insert(db,`user/${user_id}/${user_det}`);
})

pincode_tag.addEventListener('input',async ()=>{
    if(pincode_tag.value.length===6){
        let url=`https://api.postalpincode.in/pincode/${pincode_tag.value}`;
        let data=await fetch(url);
        data=await data.json();
        console.log(data);
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

signIn_icon.addEventListener("click",()=>{
    if(user_signin_flag){
        if(detCheck()){
            location.href('#');
        }
        else{
            popupHandler();
        }
    }
    else{
        signIn(auth,provider);
    }
})