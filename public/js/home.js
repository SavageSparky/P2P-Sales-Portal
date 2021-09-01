import { db_get,firebaseConfig} from "./firebase-util.js";

firebase.initializeApp(firebaseConfig);
const db=firebase.database();
const search_bar=document.querySelector('nav input');
let suggestions=await db_get(db,'suggestions/');
const suggestions_cont=document.querySelector('.suggestions-cont');
suggestions=suggestions.val()
console.log(suggestions);
const suggestors=[];
for(const key in suggestions){
    suggestors.push(key);
};

firebase.auth().onAuthStateChanged(async (user) => {
    if(user){
        document.querySelector('.loading-cont').style.display='none';
    }
    else{
        document.querySelector('.loading-cont').style.display='flex';
        location.href='/index.html';
    }
});

console.log(suggestors);

search_bar.addEventListener('input',()=>{
    let regexer=new RegExp(search_bar.value,"gi");
    suggestions_cont.classList.remove('none');
    suggestions_cont.innerHTML='';
    suggestors.forEach((data,index)=>{
        if(data.match(regexer)!==null){
            suggestions_cont.innerHTML+=`<div class="suggestions-list" data-val=${suggestors[index]}>${suggestors[index]}</div>`;
            
        }
    })
})

window.addEventListener("click",(e)=>{
    if(e.target.classList.contains('search_box') || e.target.classList.contains('suggestions-list')){
        suggestions_cont.classList.remove('none');
        document.querySelector('main').classList.add('blurrer');
    }
    else{
        suggestions_cont.classList.add('none');
        document.querySelector('main').classList.remove('blurrer');
    }
})
