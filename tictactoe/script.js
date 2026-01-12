const board = document.querySelector('#board');
const main = document.querySelector('main');
const reset = document.querySelector('#reset');

let currPlayer = null;

const loadBoard = () => {
    // board.style.display = '';
    const cells = Array.from({ length: 9 }, (_,index) => {
      const cell = document.createElement('button');
      cell.classList.add('cell');
      cell.id = index;
      return cell;
    });

    board.append(...cells);
}

const chooseToken = () => {
    const container = document.createElement('div');

    container.classList.add('token-choice');
    container.textContent = 'Choose your token';
    const xBtn = document.createElement('button');
    xBtn.textContent = 'X';
    const oBtn = document.createElement('button');
    oBtn.textContent = 'O';

    xBtn.addEventListener('click', () => {
        currPlayer = 'X';
        container.remove();
    });

    oBtn.addEventListener('click', () => {
        currPlayer = 'O';
        container.remove();
    });

    container.append(xBtn, oBtn);
    main.prepend(container);
}

const changePlayer = () => {
    currPlayer = currPlayer === 'X' ? 'O' : 'X';
}

const updateBoard = (index, token) => {
    const cells = board.querySelectorAll('.cell');
    if (cells[index].textContent != '') return;
    cells[index].textContent = token;
    // changePlayer();
}

const checkWin = () => {
    const cells = board.querySelectorAll('.cell');
    const winCases = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ];

    for (const cases of winCases) {
        const [a,b,c] = cases;
        if (cells[a].textContent && cells[a].textContent === cells[b].textContent && cells[a].textContent === cells[c].textContent) {
            return true;
        }
    }
    return false;
}

window.onload = () => {
    chooseToken();
    loadBoard();
}

board.addEventListener('click', (e) => {
    updateBoard(e.target.id, currPlayer);
    if (checkWin()) {
        alert(`${currPlayer} wins!`);
    }
    changePlayer();
});

reset.addEventListener('click', () => {
    board.innerHTML = '';
    chooseToken();
    loadBoard();
});

// chooseToken();
// console.log(choice)
// loadBoard();