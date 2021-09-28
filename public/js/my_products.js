
// card click
const cards = document.querySelectorAll('.card');
const sidePanel = document.querySelector('.side_panel');
console.log(cards);
cards.forEach((card) => {
    card.addEventListener('click', () => {
        sidePanel.classList.toggle('triggered');
    })
})

// side panel
