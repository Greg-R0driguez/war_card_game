//variables
let deckId = ""
let remainingCards = 52
let cpuScore = 0
let userScore = 0
let hasWar = false
const cardsEl = document.getElementById('cards')
const displayResults = document.getElementById('display')
const drawBtn = document.getElementById('draw-btn')
const deckBtn = document.getElementById('deck-btn')
const cardsLeft = document.getElementById('cards-left')
const displayWinner = document.getElementById('display-winner')
const warEl = document.getElementById('war-container')
const warWinner = document.getElementById('war-winner')
const cpuScoreEl = document.getElementById('cpu-score-display')
const userScoreEl = document.getElementById('user-score-display')

//button event listeners
deckBtn.addEventListener('click', newDeck)
drawBtn.addEventListener('click', drawCards)

//game puts back to default positions
function resetGame() { 
    cpuScore = 0
    userScore = 0
    remainingCards = 52
    displayResults.textContent = "War Game"
    cardsEl.innerHTML = `
        <img class="red-card" src="./red_card.jpg">
        <img class="red-card" src="./red_card.jpg">
    `
    displayWinner.textContent = ""
    warEl.innerHTML = ""
}

//starts new game
function newDeck() {
    resetGame()
    fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
        .then(response => {
            if(!response.ok) {
                throw Error ("Card API not available")
            }
            return response.json()
        })
        .then(data => {
            deckId = data.deck_id
            updateCards() 
        })
        //alert user to reload page if promise rejected
        .catch(err => alert("Something went wrong, please refresh the page."))
        //prevent draw button being pressed at the start of the game
        drawBtn.classList.remove('hide-btn')
        drawBtn.classList.add('show-btn')
        drawBtn.disabled = false //reset draw button
        hasWar = false
}

//updating count of cards to DOM
function updateCards() {
    cardsLeft.textContent = `Cards Remaining: ${remainingCards} `
}

function drawCards() {
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
    .then(res => res.json())
    .then(data => {
        remainingCards = data.remaining
        updateCards()
        warEl.innerHTML = ""
        //assigning cards to variables
        const cpuCard1 = data.cards[0]
        const userCard1 = data.cards[1] 
        cardValue(cpuCard1, userCard1)
        //adding both images to the DOM 
        cardsEl.innerHTML = `
            <img src=${cpuCard1.image}>
            <img src=${userCard1.image}> 
            `
        //disable draw button after cards run out
        if(remainingCards === 0) {
            drawBtn.disabled = true
            determineWinner()
        }
    })       
}

//function to compare values
function cardValue(cpuCard, userCard) {
    // storing card values in an array to match index number
    const valueOptions = [
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", 
        "10", "JACK", "QUEEN", "KING", "ACE"
    ]
    //assigning values to variable
    const cpuCardValueIndex = valueOptions.indexOf(cpuCard.value) 
    const userCardValueIndex = valueOptions.indexOf(userCard.value) 

    handResults(cpuCardValueIndex, userCardValueIndex)

    if(cpuCardValueIndex === userCardValueIndex) {
        hasWar = true
        warCards()
    } 
}

//determine who won hand and update DOM
function handResults(cpuCard1, userCard1) {
    let result = ""
    if (cpuCard1 > userCard1) {
        cpuScore++
        result = "Computer Wins Hand!"
        if (hasWar) {
            cpuScore++
        }
    } else if (userCard1 > cpuCard1) {
        userScore++
        result = "You Win Hand!"
        if (hasWar) {
            userScore++
        }
    } 
    hasWar = false
    displayResults.textContent = result
    cpuScoreEl.textContent = cpuScore
    userScoreEl.textContent = userScore
}

//draw new set of cards if war is true
function warCards() {
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
        .then(res => res.json())
        .then(data => {
            cardsLeft.textContent = `Cards Remaining: ${data.remaining}`
            //assigning cards to variables
            const cpuCard2 = data.cards[0]
            const userCard2 = data.cards[1]
            warEl.innerHTML = `
            <img src=${cpuCard2.image}>
            <img src=${userCard2.image}>
            `
            cardValue(cpuCard2, userCard2)
        })
}

function determineWinner() {
    if (cpuScore > userScore) {
        displayWinner.textContent = "The Computer won the game!"
    } else if (cpuScore < userScore) {
        displayWinner.textContent = "You won the game!"
    } else {
        displayWinner.textContent = "Its a tie, play again!"
    }
}

