const gameStart = document.querySelector("#gameStart");
const gameStart2 = document.querySelector("#gameStart2");
const gameStart3 = document.querySelector("#gameStart3");
let tdArr = [];
let startTime;
let minesPlaced = false;

const MINE_COLOR = "red";
const COLORS = ["black", "green", "blue", "purple", "maroon", "turquoise", "black", "gray"];

gameStart.addEventListener("click", () => setGame(9, 9, 10, 1));
gameStart2.addEventListener("click", () => setGame(12, 12, 40, 2));
gameStart3.addEventListener("click", () => setGame(16, 16, 70, 3));

function setGame(row, col, mines, point) {
    minesPlaced = false;
    document.querySelector("#mineBoard").innerHTML = '';
    generateBoard(row, col);
    tdArr = Array.from(document.querySelectorAll("#mineBoard td"));

    for (let i = 0; i < tdArr.length; i++) {
        tileEvent(i, getAroundArr(i, row, col), row, col, mines, point);
    }

    startTime = new Date();
}

function generateBoard(row, col) {
    let board = '<table border="1">';
    for (let i = 0; i < col; i++) {
        board += '<tr>';
        for (let j = 0; j < row; j++) {
            board += '<td></td>';
        }
        board += '</tr>';
    }
    board += '</table>';
    document.querySelector("#mineBoard").innerHTML = board;
}

function createAndPlaceMines(excludeIndex, mineNum, totalTiles, row, col) {
    let mineArr = generateRandomMines(mineNum, totalTiles, excludeIndex, row, col);
    putMineInBoard(mineArr);
}

function generateRandomMines(mineNum, totalTiles, excludeIndex, row, col) {
    let mineArr = [];
    while (mineArr.length < mineNum) {
        const randomNum = Math.floor(Math.random() * totalTiles);
        if (!mineArr.includes(randomNum) && randomNum !== excludeIndex && !getAroundArr(excludeIndex, row, col).includes(randomNum)) {
            mineArr.push(randomNum);
        }
    }
    return mineArr;
}

function putMineInBoard(mines) {
    for (let i = 0; i < tdArr.length; i++) {
        if (mines.includes(i)) {
            tdArr[i].classList.add("mines");
        }
    }
}

function getAroundArr(num, row, col) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    const currRow = Math.floor(num / col);
    const currCol = num % col;
    const aroundArr = [];

    for (let i = 0; i < directions.length; i++) {
        const newRow = currRow + directions[i][0];
        const newCol = currCol + directions[i][1];

        if (newRow >= 0 && newRow < row && newCol >= 0 && newCol < col) {
            aroundArr.push(newRow * col + newCol);
        }
    }

    return aroundArr;
}

function handleTileClick(targetNum, aroundArr, row, col, mines, point) {
    const tile = tdArr[targetNum];
    
    // 지뢰가 배치되지 않았다면
    if (!minesPlaced) {
        // 지뢰를 생성하고 배치합니다. 여기서는 mines 파라미터를 직접 사용합니다.
        createAndPlaceMines(targetNum, mines, row * col, row, col);
        minesPlaced = true;
    }
    
    // 타일이 이미 열려 있거나 깃발, 물음표가 있는 상태라면 클릭을 무시합니다.
    if (tile.dataset.isOpen === "true" || tile.classList.contains("flag") || tile.classList.contains("qmark")) return;

    // 클릭한 타일에 지뢰가 있다면 게임 오버 처리합니다.
    if (tile.classList.contains("mines")) {
        tile.style.backgroundColor = MINE_COLOR;
        tile.textContent = "X";
        gameOver(point);
    } else {
        // 주변에 지뢰가 몇 개 있는지 계산합니다.
        const mineCount = aroundArr.filter((num) => tdArr[num].classList.contains("mines")).length;

        // 주변에 지뢰가 없다면
        if (mineCount === 0) {
            openTile(tile, "");
            
            // 주변 타일들을 재귀적으로 엽니다.
            aroundArr.forEach((num) => {
                const adjacentTile = tdArr[num];
                if (!adjacentTile.dataset.isOpen) {
                    handleTileClick(num, getAroundArr(num, row, col), row, col);
                }
            });
        } else {
            // 주변에 지뢰가 있다면 해당 숫자를 표시합니다.
            openTile(tile, mineCount);
        }
    }
}

function handleRightClick(tile, point) {
    if (tile.dataset.isOpen === "true") return; // 이미 열린 타일은 처리하지 않음

    const hasFlag = tile.classList.contains("flag"); // 깃발 여부 확인

    if (hasFlag) {
        tile.classList.remove("flag"); // 깃발 제거
        tile.classList.add("qmark"); // 물음표 아이콘 추가
        tile.innerHTML = "❓"; // 물음표 아이콘 표시
    } else if (tile.classList.contains("qmark")) {
        tile.classList.remove("qmark"); // 물음표 아이콘 제거
        tile.innerHTML = ""; // 아이콘 삭제
        tile.style.backgroundColor = ""; // 배경색 초기화
    } else {
        tile.classList.add("flag"); // 깃발 아이콘 추가
        tile.innerHTML = "🚩"; // 깃발 아이콘 표시
        tile.style.backgroundColor = "rgb(255, 255, 160)"; // 배경색 변경
    }

    checkWin(point);
}

function openTile(tile, count) {
   tile.dataset.isOpen = "true";
    tile.style.color = COLORS[count];
    tile.textContent = count || "";
    tile.style.backgroundColor = "rgb(225, 250, 173)";
}

function tileEvent(targetNum, aroundArr, row, col, mines, point) {
    const tile = tdArr[targetNum];
    tile.addEventListener("click", () => {
        handleTileClick(targetNum, aroundArr, row, col, mines, point); // mines 추가
    });

    tile.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        handleRightClick(tile, point);
    });
}

function gameOver(point) {
    const elapsedTime = calculateElapsedTime();
    document.querySelector('#game-over').textContent = `Game Over! 게임이 끝났습니다!, 걸린 시간: ${elapsedTime} 초!!!`;
    document.querySelector('#game-point').value = `${point}` + elapsedTime;
    tdArr.forEach((tile, idx) => {
        if (tile.classList.contains("mines")) {
            tile.style.backgroundColor = MINE_COLOR;
            tile.textContent = "X";
        }
    });
}

function calculateScore(elapsedTime, point) {
    let baseScore = 1000 - elapsedTime;
    if (baseScore < 0) baseScore = 0;
    const bonusScore = point * 500;

    return baseScore + bonusScore;
}

function checkWin(point) {
    const unopenedTiles = tdArr.filter((tile) => !tile.dataset.isOpen && !tile.classList.contains("mines"));
    const unopenedMineTiles = tdArr.filter((tile) => !tile.dataset.isOpen && tile.classList.contains("mines"));
    
    // 깃발이 표시된 타일 중에서 지뢰가 있는 타일만 필터링
    const correctlyFlagged = tdArr.filter((tile) => tile.classList.contains("flag") && tile.classList.contains("mines")).length;
    const mines = tdArr.filter((tile) => tile.classList.contains("mines")).length;

    if (unopenedTiles.length === 1 && unopenedMineTiles.length === 1) {
        const lastTile = unopenedMineTiles[0];
        lastTile.classList.add("flag");
        lastTile.innerHTML = "🚩";
        lastTile.style.backgroundColor = "rgb(255, 255, 160)";
    }

    if ((correctlyFlagged === mines && correctlyFlagged === tdArr.filter(tile => tile.classList.contains("flag")).length)) {
        const elapsedTime = calculateElapsedTime();
        const score = calculateScore(elapsedTime, point);
        document.querySelector('#game-win').textContent = `You Win! 걸린 시간: ${elapsedTime} 초 !!! 점수: ${score}점`;
        document.querySelector('#game-point').value = `${point}` + elapsedTime;
    }
}

function calculateElapsedTime() {
    const currentTime = new Date();
    const elapsedTime = (currentTime - startTime) / 1000;
    return Math.round(elapsedTime);
}

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
