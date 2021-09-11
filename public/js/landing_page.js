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



const image_wrap = document.querySelector(".image_preview_wrap");