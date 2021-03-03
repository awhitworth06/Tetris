document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid')
  let squares = Array.from(document.querySelectorAll('.grid div'))
  const scoreDisplay = document.querySelector('#score')
  const levelDisplay = document.querySelector('#level')
  const startBtn = document.querySelector('#start-button')
  //const restartBtn = document.querySelector('#restart-button')
  
  
  //The Tetrominoes
  const width = 10
  const colors = [
    'rgba(96,0,230,0.8)',
    'rgb(0,134,230,0.8)',
    'rgba(238,130,238,0.8)',
    'rgb(0,179,0,0.8)',
    'rgba(230,211,0,0.8) ',
    'rgba(255,0,0,0.8)',
    'rgba(255,97,0,0.8)'
  ]

  const jTetromino = [
    [1,width+1,width*2+1,2],
    [width,width+1,width+2,width*2+2],
    [1,width+1,width*2+1,width*2],
    [width,width*2,width*2+1,width*2+2]
  ]

  const lTetromino = [
    [1,2,width+2,width*2+2],
    [2,width,width+1,width+2],
    [0,width,width*2,width*2+1],
    [width,width+1,width+2,width*2]
  ]

  const sTetromino = [
    [0,width,width+1,width*2+1],
    [width+1,width+2,width*2,width*2+1],
    [0,width,width+1,width*2+1],
    [width+1,width+2,width*2,width*2+1]
  ]

  const zTetromino = [
    [1,width,width+1,width*2],
    [0,1,width+1,width+2],
    [1,width,width+1,width*2],
    [0,1,width+1,width+2]
  ]

  const tTetromino = [
    [1,width,width+1,width+2],
    [1,width+1,width+2,width*2+1],
    [width,width+1,width+2,width*2+1],
    [1,width,width+1,width*2+1]
  ]

  const oTetromino = [
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1]
  ]

  const iTetromino = [
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3],
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3]
  ]

  const theTetrominoes = [jTetromino, lTetromino, sTetromino, zTetromino, tTetromino, oTetromino, iTetromino]

  let timerId
  let interval = 1000
  let currentPosition = 4
  let currentRotation = 0
  let nextRandom = 0
  let score = 0
  let level = 1

  //randomly select a Tetromino and its first rotation
  function randomTetromino() {
    return Math.floor(Math.random() * theTetrominoes.length)
  }

  let random = randomTetromino()
  let current = theTetrominoes[random][currentRotation]

  //draw the Tetromino
  function draw() {
    current.forEach(index => {
      squares[currentPosition + index].style.backgroundColor = colors[random]
      squares[currentPosition + index].classList.add('tetromino')
    })
  }

  //undraw the Tetromino
  function undraw() {
    current.forEach(index => {
      squares[currentPosition + index].style.backgroundColor = ''
      squares[currentPosition + index].classList.remove('tetromino')
    })
  }

  //assign functions to keyCodes
  function control(e) {
    if (e.keyCode === 37) {
      moveLeft()
    } else if (e.keyCode === 38) {
      rotate()
    } else if (e.keyCode === 39) {
      moveRight()
    } else if (e.keyCode === 40) {
      moveDown()
    }
  }
  document.addEventListener('keyup', control)

  //move down function
  function moveDown() {
    undraw()
    currentPosition += width
    draw()
    freeze()
  }

  //freeze function
  function freeze() {
    if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
      current.forEach(index => squares[currentPosition + index].classList.add('taken'))
      //start a new tetromino falling
      random = nextRandom
      nextRandom = randomTetromino()
      current = theTetrominoes[random][currentRotation]
      currentPosition = 4
      addScore()
      gameOver()
      draw()
      displayShape()
    }
  }

  //move the Tetromino left, unless it's at the edge or there is a blockage
  function moveLeft() {
    undraw()
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
    if (!isAtLeftEdge) currentPosition -= 1
    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      currentPosition += 1
    }
    draw()
  }

  //move the Tetromino right, unless it's at the edge or there is a blockage
  function moveRight() {
    undraw()
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)
    if (!isAtRightEdge) currentPosition += 1
    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      currentPosition -= 1
    }
    draw()
  }

  ///FIX ROTATION OF TETROMINOS AT THE EDGE 
  function isAtRight() {
    return current.some(index => (currentPosition + index + 1) % width === 0) |
      current.some(index => squares[currentPosition + index + 1].classList.contains('taken'))
  }

  function isAtLeft() {
    return current.some(index => (currentPosition + index) % width === 0) |
      current.some(index => squares[currentPosition + index].classList.contains('taken'))
  }
  
  function checkRotatedPosition(P){
    P = P || currentPosition       //get current position.  Then, check if the piece is near the left side.
    if ((P+1) % width < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
      if (isAtRight()){            //use actual position to check if it's flipped over to right side
        currentPosition += 1    //if so, add one to wrap it back around
        checkRotatedPosition(P) //check again.  Pass position from start, since long block might need to move more.
        }
    }
    else if (P % width > 5) {
      if (isAtLeft()){
        currentPosition -= 1
      checkRotatedPosition(P)
      }
    }
  }

  //rotate the Tetromino
  function rotate() {
    undraw()
    currentRotation ++
    if (currentRotation === current.length) { //if the current rotation gets to 4, make it go back to 0
      currentRotation = 0
    }
    current = theTetrominoes[random][currentRotation]
    checkRotatedPosition()
    draw()
  }

  //show up-next Tetromino in mini-grid display
  const displaySquares = document.querySelectorAll('.mini-grid div')
  const displayWidth = 4
  let displayIndex = 0

  //the Tetrominoes without rotations
  const upNextTetrominoes = [
    [1, displayWidth+1, displayWidth*2+1, 2], //jTetromino
    [1, 2, displayWidth+2, displayWidth*2+2], //lTetromino
    [1, displayWidth+1, displayWidth+2, displayWidth*2+2], //sTetromino
    [2, displayWidth+1, displayWidth+2, displayWidth*2+1], //zTetromino
    [displayWidth+1, displayWidth*2, displayWidth*2+1, displayWidth*2+2], //tTetromino
    [displayWidth+1, displayWidth+2, displayWidth*2+1, displayWidth*2+2], //oTetromino
    [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1] //iTetromino
  ]

  //display the shape in the mini-grid display
  function displayShape() {
    //remove any trace of a tetromino from the entire grid
    displaySquares.forEach(square => {
      square.style.backgroundColor = ''
      square.classList.remove('tetromino')
    })
    upNextTetrominoes[nextRandom].forEach(index => {
      displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
      displaySquares[displayIndex + index].classList.add('tetromino')
    })
  }

  //add functionality to the start button
  startBtn.addEventListener('click', () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    } else {
      draw()
      timerId = setInterval(moveDown, interval)
      nextRandom = randomTetromino()
      displayShape()
    }
  })

  //add score
  function addScore() {
    for (let i = 0; i < 199; i +=width) {
      const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]
      if (row.every(index => squares[index].classList.contains('taken'))) {
        score += 10
        scoreDisplay.innerHTML = score
        row.forEach(index => {
          squares[index].classList.remove('taken')
          squares[index].classList.remove('tetromino')
          squares[index].style.backgroundColor = ''
        })
        const squaresRemoved = squares.splice(i, width)
        squares = squaresRemoved.concat(squares)
        squares.forEach(cell => grid.appendChild(cell))
        addLevel()
      }
    }
  }

  //add level
  function addLevel() {
    if (!document.getElementById("levels").checked) { //check if levels are disabled
      if (score > 0 & score % 100 === 0) { //increase level every time player scores 100 points
        level++
        levelDisplay.innerHTML = level
        clearInterval(timerId)
        interval -= 100
        timerId = setInterval(moveDown, interval)
      }
    }
  }

  //game over
  function gameOver() {
    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      clearInterval(timerId)
    }
  }
})
