import { db_get,firebaseConfig,db_insert} from "./firebase-util.js";

firebase.initializeApp(firebaseConfig);
const db=firebase.database();
const params = new URLSearchParams(window.location.search);
const id = params.get("id");


firebase.auth().onAuthStateChanged(async (user) => {
    if(user){
        document.querySelector('.loading-cont').style.display='none';
    }
    else{
        document.querySelector('.loading-cont').style.display='flex';
        location.href='/index.html';
    }
});


// image select and preview
const image_wrap = document.querySelector(".image_preview_wrap>img");
const image_select = document.querySelector('.image_select');

image_select.addEventListener('click', (e)=>{
    if(e.target.parentElement.className == 'image_select_wrap'){
        const selected_img = e.target.src;
        console.log(selected_img);
        image_wrap.src = selected_img;
    }
})