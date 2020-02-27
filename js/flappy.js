function newElement(tagName, className) {
    const element = document.createElement(tagName)
    element.className = className
    return element
}

function Barrier(reverse =false) {
    this.element = newElement('div', 'barrier')

    const border = newElement('div', 'border')
    const body = newElement('div', 'body')
    this.element.appendChild(reverse ? body : border)
    this.element.appendChild(reverse ? border : body)

    this.setHeigth = height => body.style.height = `${height}px`
}

function Barriers(height, gap, x) {
    this.element = newElement('div', 'barriers')

    this.superior = new Barrier(true)
    this.inferior = new Barrier()

    this.element.appendChild(this.superior.element)
    this.element.appendChild(this.inferior.element)

    this.randomGap = () => {
        const superiorHeight = Math.random() * (height - gap)
        const inferiorHeight = height - gap - superiorHeight
        this.superior.setHeigth(superiorHeight)
        this.inferior.setHeigth(inferiorHeight)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.randomGap()
    this.setX(x)
}

function MoveBarriers(height, width, gap, space, notifyPoint) {
    this.pairs = [
        new Barriers(height, gap, width), 
        new Barriers(height, gap, width + space),
        new Barriers(height, gap, width + space * 2), 
        new Barriers(height, gap, width + space * 3)
    ]

    const displacement = 3
    this.animate = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement)

            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + space * this.pairs.length)
                pair.randomGap()
            }

            const middle = width / 2
            const crossedTheMiddle = pair.getX() + displacement >= middle
                && pair.getX() < middle
            crossedTheMiddle && notifyPoint()
        })
    }
}

function Bird(heightGame) {
    let flying = false

    this.element = newElement('img', 'bird')
    this.element.src = 'imgs/bird.png'
    
    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false

    this.animate = () => {
        const newY = this.getY() + (flying ? 8 : -6)
        const maxHeight = heightGame - this.element.clientHeight

        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= maxHeight) {
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        }
    }
    this.setY(heightGame / 2)
}

function Progress() {
    this.element = newElement('span', 'progress')
    this.updatePoints = points => {
        this.element.innerHTML = points
    }
    this.updatePoints(0)
}

function areOverlapping(Aelement, Belement) {
    const a = Aelement.getBoundingClientRect()
    const b = Belement.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function collided(bird, barriers) {
    let collided = false
    barriers.pairs.forEach(Barriers => {
        if (!collided) {
            const superior = Barriers.superior.element
            const inferior = Barriers.inferior.element
            collided = areOverlapping(bird.element, superior) 
                || areOverlapping(bird.element, inferior)
        }
    })
    return collided
}

function FlappyBird() {
    let points = 0

    const gameArea = document.querySelector('[flappy]')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth

    const progress = new Progress()
    const barriers = new MoveBarriers(height, width, 200, 400, 
        () => progress.updatePoints(++points))
    const bird = new Bird(height)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))

    this.start = () => {
        
        const timer = setInterval(() => {
           barriers.animate()
           bird.animate() 

           if(collided(bird, barriers)) {
               clearInterval(timer)
           }
        }, 20);
    }
}

let game = new FlappyBird()
let startGameCounter = 0
window.onkeypress = e => {
    
    e = e || window.event
    let key = e.keyCode || e.which

    if (key == 32 && startGameCounter == 0) {
        startGameCounter = 1
        game.start()
    }
}
