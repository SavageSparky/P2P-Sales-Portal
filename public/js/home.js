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
    currElement=null;
    highlighter=0;
    suggestors.forEach((data,index)=>{
        if(data.match(regexer)!==null){
            suggestions_cont.innerHTML+=`<div class="suggestions-list">${suggestors[index]}</div>`;
            suggestions_select();
        }
    })
})

function suggestions_select(){
    [...document.querySelectorAll('.suggestions-list')].forEach(data=>{
        data.addEventListener("click",()=>{
            suggestions_cont.classList.add('none');
            document.querySelector('main').classList.remove('blurrer');
            main_div_loader(data.textContent);
        })
    })
}

async function cardUpdater(p_id){
    let data=await db_get(db,`product/${p_id}`);
    console.log(data);
    data=await data.val();
    console.log(data);
    document.querySelector('main').innerHTML+=`
    <div class="card">
    <img class="product_icon" src=${data["profile-img"]} alt="">
    <ul class="card_main_text">
        <li><h3 class="product_name">${data["name"]}</h3></li>
        <li><h3 class="price">Rs. ${data["price"]}/${data["name"]}</h3></li>
    </ul>
    <ul class="card_body_text">
        <li>
            <img src="../assets/icons/capacity.svg" alt="">
            <h4 class="quantity">${data["quantity"]}/${data["quantity"]}</h4>
        </li>
        <li>
            <img src="../assets/icons/location.svg" alt="">
            <h4 class="address">${data["street"]},${data["area"]}</h4>
        </li>
        <li>
            <img src="../assets/icons/info.svg" alt="">
            <h4 class="category">${data["type"]}</h4>
        </li>
    </ul>
    <div class="end_time_div">
        <img src="../assets/icons/timer.svg" alt="">
        <h4 class="due_date">Ends in: ${data["due-date"]}</h4>
    </div>
    <div class="badges">
        ${(data["delivery-available"]==="Yes")?`<img src="../assets/icons/delivery_icon.svg" alt="">`:``}
    </div>
    <div class="ribbons">
        <p>Featured</p>
    </div>
</div>
    `
}

function main_div_loader(txt){
    const main_tag=document.querySelector('main');
    main_tag.innerHTML='';
    suggestions[txt].forEach(data=>{
        cardUpdater(data);
    })
}

let highlighter=0;

function borderRemover(index){
    suggestions_cont.querySelectorAll('div').forEach((data,i)=>{
        if(i===index) return;
        data.style.backgroundColor=`initial`;
    })
}

let prev;
let currElement=null;
window.addEventListener("keydown",(e)=>{
    if(suggestions_cont.classList.contains('none')|| suggestions_cont.childElementCount===0) return;
    if(e.key==='ArrowDown' || e.key==='ArrowUp'){
        if(prev==='up' && e.key==='ArrowDown'){
            highlighter+=2;
        }
        if(prev==='down' && e.key==='ArrowUp'){
            highlighter-=2;
        }
        if(highlighter===suggestions_cont.childElementCount){
            borderRemover(highlighter-1);
            highlighter=0;
        }
        if(highlighter<0){
            borderRemover(highlighter+1);
            highlighter=suggestions_cont.childElementCount-1;
        }
        suggestions_cont.querySelectorAll('div')[highlighter].style.backgroundColor='#e6e6e6';
        currElement=suggestions_cont.querySelectorAll('div')[highlighter];
        borderRemover(highlighter);
        if(e.key==='ArrowDown'){
            highlighter++;
            prev='down';
        }
        else if(e.key==='ArrowUp'){
            highlighter--;
            prev='up';
        }
    }
    else if(e.key==='Enter' && currElement!==null){
        suggestions_cont.classList.add('none');
        document.querySelector('main').classList.remove('blurrer');
        main_div_loader(currElement.textContent);
    }
    else{
        return;
    }
});

window.addEventListener("click",(e)=>{
    if(e.target.classList.contains('search_box')){
        suggestions_cont.classList.remove('none');
        document.querySelector('main').classList.add('blurrer');
        currElement=null;
        highlighter=0;
        borderRemover(-1);
    }
    else{
        suggestions_cont.classList.add('none');
        document.querySelector('main').classList.remove('blurrer');
        currElement=null;
        highlighter=0;
        borderRemover(-1);
    }
})
