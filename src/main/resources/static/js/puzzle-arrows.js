const controls = document.querySelector('#controls');
const scoreBoard = document.querySelector('#score');
const timerBoard = document.querySelector('#timer');
const roundBoard = document.querySelector('#round');
const startBtn = document.querySelector('#startBtn');
const gameName = document.querySelector('#gameName');
const exStart = document.querySelector('#exStart');
const soundEffectBtn = document.querySelector('#toggleSoundEffect');
const bgMusicBtn = document.querySelector('#toggleBgMusic');
const endMessage = document.querySelector('#endMessage');

let score = 0;
let timer;
let timeLeft = 10;
let isPaused = false;
let round = 1;
let isSoundEffectMuted = false;
let isBgMusicMuted = false;
let combo = 0; // 연속 올바른 화살표 제거 카운트

const imageElements = [];
const directions = ['left', 'right', 'up', 'down'];
const bgAudio = new Audio('/sounds/runaway.mp3');
/**Song : Koari & MongBlin - Runaway
Follow Artist : http://bitly.ws/Q2KA
Music promoted by DayDreamSound : http://bitly.ws/Q2Km
*/
bgAudio.loop = true;

const restartBtn = document.createElement('button');
restartBtn.id = 'restartBtn';
restartBtn.textContent = "다시 시작";
restartBtn.addEventListener('click', restartGame);

startBtn.addEventListener('click', startGame);
exStart.style.display = 'none';
roundBoard.style.display = 'none';
soundEffectBtn.addEventListener('click', toggleSoundEffect);
bgMusicBtn.addEventListener('click', toggleBgMusic);

function startGame() {
    initializeGameState();
    timer = setInterval(updateGame, 1000);
    document.addEventListener('keydown', handleKeyDown);
    populateImages();

    gameName.style.display = 'none';
    roundBoard.style.display = 'block';
    startBtn.style.display = 'none';
    exStart.style.display = 'block';
    restartBtn.style.display = 'none';

    updateRoundDisplay();  // 라운드 표시 업데이트

    if (!isBgMusicMuted) {
        bgAudio.play();
    }
}

function initializeGameState() {
    timeLeft = Math.max(10 - round, 3);
    combo = 0;
    updateScore();
    updateTimer();
}

function populateImages() {
    const numOfArrows = Math.min(10 + round * 2, 30);
    for (let i = 0; i < numOfArrows; i++) {
        createImage(directions[Math.floor(Math.random() * directions.length)]);
    }
}

function handleKeyDown(event) {
    let direction;

    playSoundEffect();

    if (event.key.startsWith('Arrow')) {
        direction = event.key.toLowerCase().replace('arrow', '');
        if (removeImage(direction)) {
            combo++;
            score += combo;
        } else {
            combo = 0;
        }
        updateScore();
    }
}

function playSoundEffect() {
    if (!isSoundEffectMuted) {
        const audio = new Audio('/sounds/pew.mp3');
        audio.play();
    }
}

function removeImage(direction) {
    const directionImage = document.querySelector(`.${direction}:first-child`);
    if (directionImage) {
        if (imageElements.includes(directionImage)) {
            directionImage.remove();
            const index = imageElements.indexOf(directionImage);
            if (index > -1) {
                imageElements.splice(index, 1);
            }
            if (imageElements.length === 0) {
                round++; // 라운드 증가
                endGame();
            }
            score += 5 + round - 1;
            return true;
        }
    } else {
        score -= 5;
        return false;
    }
}

function updateScore() {
    scoreBoard.textContent = `점수: ${score}`;
}

function updateTimer() {
    timerBoard.textContent = `남은 시간 : ${Math.max(timeLeft, 0)}s`;
}

function updateRoundDisplay() {
    roundBoard.textContent = `라운드: ${round}`;
}

function createImage(direction) {
    const img = document.createElement('img');
    img.classList.add(direction);
    img.src = `/imgs/puzzle-arrows/${direction}.png`;
    img.style.margin = '5px';
    controls.appendChild(img);
    imageElements.push(img);
}

function updateGame() {
    if (isPaused) return;

    timeLeft--;
    updateTimer();
    if (timeLeft <= 0 || imageElements.length === 0) endGame();
}

function endGame() {
    clearInterval(timer);
    document.removeEventListener('keydown', handleKeyDown);
    bgAudio.pause();

    // 모든 이미지가 제거되면 새 라운드 시작
    if (imageElements.length === 0) {
        setTimeout(() => {
            restartGame();
        }, 1000); // 예: 2초 후에 새 라운드 시작
    } else {
        round = 1;
        score = 0;
        timeLeft = 10;
        controls.appendChild(restartBtn);
        restartBtn.style.display = 'block';
    }
}

function restartGame() {
    controls.innerHTML = '';
    imageElements.length = 0;
    initializeGameState();
    updateRoundDisplay();
    populateImages();
    timer = setInterval(updateGame, 1000);
    document.addEventListener('keydown', handleKeyDown);
    if (!isBgMusicMuted) {
        bgAudio.play();
    }
    endMessage.style.display = 'none';
    controls.removeChild(restartBtn);
}

function toggleSoundEffect() {
    isSoundEffectMuted = !isSoundEffectMuted;
    soundEffectBtn.textContent = isSoundEffectMuted ? '효과음 켜기' : '효과음 끄기';
}

function toggleBgMusic() {
    isBgMusicMuted = !isBgMusicMuted;
    if (isBgMusicMuted) {
        bgAudio.pause();
    } else {
        bgAudio.play();
    }
    bgMusicBtn.textContent = isBgMusicMuted ? '백그라운드 음악 켜기' : '백그라운드 음악 끄기';
}

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' || event.key === 'p') {
        isPaused = !isPaused;
    }
});

// "점수판 보기" 버튼을 클릭했을 때 호출되는 함수
function viewScoreboard() {
    const table = document.querySelector('table');
    const scoreboardButton = document.querySelector('#viewScoreboard');

    if (table.style.display === 'none' || table.style.display === '') {
        table.style.display = 'table'; // 숨겨져 있거나 초기에 숨겨져 있으면 보이도록 설정
        scoreboardButton.textContent = '점수 숨기기'; // 버튼 텍스트 변경
    } else {
        table.style.display = 'none'; // 이미 보이면 숨김
        scoreboardButton.textContent = '점수 보기'; // 버튼 텍스트 변경
    }
}