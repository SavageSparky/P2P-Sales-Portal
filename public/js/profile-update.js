import { firebaseConfig,db_get } from "./firebase-util.js";

firebase.initializeApp(firebaseConfig);
const auth=firebase.auth();
const db=firebase.database();
const profile_pic_cont=document.querySelector('.profile-img-cont');
const input_ele=document.querySelectorAll('input');
const select_tag=document.querySelector('select');
let user_id;
let user_det;
const btn=document.querySelectorAll('button');
firebase.auth().onAuthStateChanged(async (user)=>{
    if(!user){
        location.href='/index.html';
    }
    else{
        user_id=user.uid;
        user_det=await db_get(db,`/user/${user_id}`);
        user_det=await user_det.val();
        console.log(user_det);
        if(user_det['profileImgUrl']!==null){
            profile_pic_cont.style.background=user_det['profileImgUrl'];
        }
        if(user_det['Name']!==null){
            input_ele[1].value=user_det['Name'];
        }
        if(user_det['Pincode']!==null){
            input_ele[5].value=user_det['Pincode'];
            pinCodeAreaFiller();
        }
        if(user_det['phNo']!==undefined){
            input_ele[2].value=user_det['phNo'];
        }
        if(user_det['street']!==undefined){
            input_ele[3].value=user_det['street'];
        }
        if(user_det['subArea']!==undefined){
            input_ele[4].value=user_det['subArea'];
        }
    }
});

async function pinCodeAreaFiller(){
    if(input_ele[5].value.length>6){
        return;
    }
    let url= `https://api.postalpincode.in/pincode/${input_ele[5].value}`;
    let data=await fetch(url);
    data=await data.json();
    if (data[0]["Status"] === "Success") {
        input_ele[6].value=data[0]['PostOffice'][0]["District"];
        input_ele[7].value=data[0]['PostOffice'][0]["State"];
        select_tag.innerHTML='';
        data[0].PostOffice.forEach(d=>{
            if(user_det['area']!==undefined && user_det['area']===d.Name){
            select_tag.innerHTML+=`  <option value="${d.Name}" selected>${d.Name}</option>`;
            }
            else{
                select_tag.innerHTML+=`  <option value="${d.Name}">${d.Name}</option>`;
            }
        });
    }
    else{
        input_ele[6].value=null;
        input_ele[7].value=null;
        select_tag.innerHTML=` <option value="${null}">No Area Found</option>`;
    }
}

input_ele[5].addEventListener('input',()=>{
    if(input_ele[5].value.length>6){
        input_ele[5].value=null;
        input_ele[6].value=null;
        input_ele[7].value=null;
        select_tag.innerHTML=` <option value="${null}">No Area Found</option>`;
    }
    if(input_ele[5].value.length<6){
        input_ele[6].value=null;
        input_ele[7].value=null;
        select_tag.innerHTML=` <option value="${null}">No Area Found</option>`;
    }
    if(input_ele[5].value.length===6){
        pinCodeAreaFiller();
    }
});

profile_pic_cont.addEventListener("click",()=>{
    input_ele[0].click();
})

input_ele[0].addEventListener('change',()=>{
    const currFiles=[...input_ele[0].files];
    currFiles.forEach(file=>{
        profile_pic_cont.style.background=`url(${URL.createObjectURL(file)}) no-repeat center center / cover`;
    })
})

