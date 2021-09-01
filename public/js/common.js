import { db_get,firebaseConfig} from "./firebase-util.js";


document.querySelector('header > img').addEventListener('click', ()=>{
    document.querySelector('.profile_menu').classList.toggle('none');
})