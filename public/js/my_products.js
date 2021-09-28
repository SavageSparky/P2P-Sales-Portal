
// card click
const cards = document.querySelectorAll('.card');
const sidePanel = document.querySelector('.side_panel');
cards.forEach((card) => {
    card.addEventListener('click', () => {
        sidePanel.classList.toggle('triggered');
    })
})

// side panel
const buyers = document.querySelectorAll('.buyer');
buyers.forEach( (buyer)=> {
    buyer.addEventListener('click', () => {
        buyer.querySelector('.buyer_expand').classList.toggle('triggered');
    })
})

// new order link
cosnt new_order = document.querySelector('.card_new_order');