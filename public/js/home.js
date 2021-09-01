import { db_get,firebaseConfig} from "./firebase-util.js";

firebase.initializeApp(firebaseConfig);
const db=firebase.database();
const search_bar=document.querySelector('nav input');
let suggestions=await db_get(db,'suggestions/');
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
    suggestors.forEach((data,index)=>{
        if(data.match(regexer)!==null){
            console.log(suggestors[index]);
        }
    })
})
