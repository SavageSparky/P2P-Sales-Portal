document.querySelector('header > img').addEventListener('click', ()=>{
    document.querySelector('.profile_menu').classList.toggle('none');
})

document.querySelector('.log_out').addEventListener('click',()=>{
    firebase.auth().signOut();
});