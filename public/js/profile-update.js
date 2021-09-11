import { firebaseConfig,db_get,db_insert} from "./firebase-util.js";

firebase.initializeApp(firebaseConfig);
const auth=firebase.auth();
const db=firebase.database();
const profile_pic_cont=document.querySelector('.profile-img-cont');
const input_ele=document.querySelectorAll('main input');
const select_tag=document.querySelector('select');
let user_id;
let user_det;
const btn=document.querySelectorAll('.button-cont button');
const otp_send_btn=document.querySelector('.phone-no-wrap button');
const otp_cont=document.querySelector('.otp-cont');
let otp_num;
const otp_verify_btn=document.querySelector('.check-otp-btn');
let otp_verified_flag=false;
let profile_pic;
let profile_pic_click_flag=false;

function otpGenerator(){
    return Math.floor(Math.random()*(9999-1111)+1111);
}

firebase.auth().onAuthStateChanged(async (user)=>{
    if(!user){
        document.querySelector('.loading-cont').style.display='flex';
        location.href='/index.html';
    }
    else{
        document.querySelector('.loading-cont').style.display='none';
        user_id=user.uid;
        user_det=await db_get(db,`/user/${user_id}`);
        user_det=await user_det.val();
        console.log(user_det);
        if(user_det['profileImgUrl']!==null){
            profile_pic_cont.style.background=`url(${user_det['profileImgUrl']}) no-repeat center center / cover`;
        }
        if(user_det['Name']!==null){
            input_ele[1].value=user_det['Name'];
        }
        if(user_det['Pincode']!==null){
            input_ele[6].value=user_det['Pincode'];
            pinCodeAreaFiller();
        }
        if(user_det['phNo']!==undefined){
            input_ele[2].value=user_det['phNo'];
            otp_verified_flag=false;
        }
        if(user_det['street']!==undefined){
            input_ele[4].value=user_det['street'];
        }
        if(user_det['subArea']!==undefined){
            input_ele[5].value=user_det['subArea'];
        }
    }
});

async function pinCodeAreaFiller(){
    if(input_ele[6].value.length>6){
        return;
    }
    let url= `https://api.postalpincode.in/pincode/${input_ele[6].value}`;
    let data=await fetch(url);
    data=await data.json();
    if (data[0]["Status"] === "Success") {
        input_ele[7].value=data[0]['PostOffice'][0]["District"];
        input_ele[8].value=data[0]['PostOffice'][0]["State"];
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
        input_ele[7].value=null;
        input_ele[8].value=null;
        select_tag.innerHTML=` <option value="${null}">No Area Found</option>`;
    }
}

input_ele[6].addEventListener('input',()=>{
    if(input_ele[6].value.length>6){
        input_ele[6].value=null;
        input_ele[7].value=null;
        input_ele[8].value=null;
        select_tag.innerHTML=` <option value="${null}">No Area Found</option>`;
    }
    if(input_ele[6].value.length<6){
        input_ele[7].value=null;
        input_ele[8].value=null;
        select_tag.innerHTML=` <option value="${null}">No Area Found</option>`;
    }
    if(input_ele[6].value.length===6){
        pinCodeAreaFiller();
    }
});

profile_pic_cont.addEventListener("click",()=>{
    profile_pic_click_flag=true;
    input_ele[0].click();
})

input_ele[0].addEventListener('change',()=>{
    const currFiles=[...input_ele[0].files];
    currFiles.forEach(file=>{
        profile_pic=file;
        profile_pic_cont.style.background=`url(${URL.createObjectURL(file)}) no-repeat center center / cover`;
    })
})

input_ele[2].addEventListener('input',()=>{
    otp_verified_flag=false;
    if(input_ele[2].value.length===10 && input_ele[2].value!==user_det['phNo']){
        input_ele[2].style.width='125px';
        otp_send_btn.style.display='block';
    }
    else{
        input_ele[2].style.width='190px';
        otp_send_btn.textContent='Send OTP';
        otp_cont.style.display='none';
        otp_send_btn.style.display='none';
    }
});

otp_send_btn.addEventListener('click',()=>{
    otp_send_btn.textContent='Resend';
    input_ele[2].disabled=true;
    otp_send_btn.style.backgroundColor='#dadada';
    otp_send_btn.disabled=true;
    otp_cont.style.display='flex';
    otp_num=otpGenerator();
    // fetch(`https://2factor.in/API/V1/934cf869-104d-11ec-a13b-0200cd936042/SMS/${input_ele[2].value}/${otp_num}/P2P Sales Portal`,{
    //     method: 'POST'
    // });
    console.log(otp_num);
    setTimeout(()=>{
        otp_send_btn.disabled=false;
        input_ele[2].disabled=false;
        otp_send_btn.style.backgroundColor='var(--green-light)';
    },30000);
});

otp_verify_btn.addEventListener('click',()=>{
    if(+document.querySelector('#otp').value===otp_num){
        input_ele[2].style.width='190px';
        input_ele[2].disabled=true;
        otp_send_btn.style.display='none';
        otp_cont.style.display='none';
        otp_verified_flag=true;
    }
    else{
        document.querySelector('#otp').value=null;
        otp_verify_btn.disabled=true;
        otp_verify_btn.style.backgroundColor='#dadada';
        setTimeout(()=>{
            otp_verify_btn.disabled=false;
            otp_verify_btn.style.backgroundColor='var(--green-light)';
        },2000);
    }
})

btn[1].addEventListener('click',()=>{
    location.href='/pages/home.html'
});


function firebase_img_uploader(file){
    const imagesRef = firebase.storage().ref(`images/${user_id}/`);
    let upload_task=imagesRef.child('profile-img').put(file);

    upload_task.on('state_changed',
    (snapshot) => {}, 
    (error) => {},
    ()=>{
            imagesRef.child('profile-img').getDownloadURL().then((url)=>{
                    db_insert(firebase.database(),`user/${user_id}/profileImgUrl`,url);
                    location.href='/pages/home.html'
            });
      }
    );
  }

btn[0].addEventListener('click',()=>{
    let retun_var=0;
    console.log('Entering here');
    input_ele.forEach((data,index)=>{
        if(data.value===null || data.value.length===0 && index!==3 && index!==0){
            data.value=null;
            console.log(data);
            retun_var=1;
            return;
        }
    })
    if(otp_verified_flag===false && input_ele[2].value!==user_det['phNo']){
        input_ele[2].setCustomValidity(`Please Verify your phone Number`);
        retun_var=1;
    }
    else{
        input_ele[2].setCustomValidity(``);
    }
    if(input_ele[0].value.length===0 && user_det['profileImgUrl']===undefined){
        profile_pic_cont.style.border='1px solid red';
        retun_var=1;
    }
    if(retun_var===1) return;
    let upload_obj={
        'Name':`${input_ele[1].value}`,
        'phNo':`${input_ele[2].value}`,
        'street':`${input_ele[4].value}`,
        'subArea':`${input_ele[5].value}`,
        'Pincode':`${input_ele[6].value}`,
        'area':`${select_tag.value}`,
        'AllDone':`true`
    }
    document.querySelector('.loading-cont').style.display='flex';
    if(profile_pic_click_flag===true && input_ele[0].value!==null && input_ele[0].value.length!==0){
        firebase_img_uploader(profile_pic);
        db_insert(db,`user/${user_id}`,upload_obj);
        if(user_det['products']!==undefined && user_det['products']!==null && user_det['products'].length!==0){
            db_insert(db,`user/${user_id}/products`,user_det['products']);
        }
    }
    else{
        upload_obj['profileImgUrl']=user_det['profileImgUrl'];
        db_insert(db,`user/${user_id}`,upload_obj);
        console.log(user_det['products']);
        if(user_det['products']!==undefined && user_det['products']!==null && user_det['product'].length!==0){
            db_insert(db,`user/${user_id}/products`,user_det['products']);
        }
        location.href='/pages/home.html';
    }
})