
const state_closed = 0;
const state_opened = 1;
const state_flagged = 2;
const empty = 0;
const mine = -1;

class Minesweeper {
    constructor(canvas, textures) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.images = textures;
        this.pxX = canvas.clientWidth
        this.pxY = canvas.clientHeight;
        this.blockX = 30;
        this.blockY = 30;
        this.h = 15;
        this.w = 15;
        this.mines = 30;
        this.board = [];
        this.state = []; // closed = 0, opened = 1, flagged = 2
        this.gameState = 0;
        this.winCallback = null;
        this.gameOverCallback = null;
    }

    usePreset(preset) {
        this.h = preset.height;
        this.w = preset.width;
        this.mines = preset.mines;
    }

    inBounds(x, y) {
        return x >= 0 && y >= 0 && x < this.w && y < this.h;
    }

    countMinesAround(x, y) {
        let count = 0;
        for (let dx = -1; dx < 2; dx++) {
            for (let dy = -1; dy < 2; dy++) {
                if (dx != 0 || dy != 0) {
                    let a = y + dy;
                    let b = x + dx;
                    if (this.inBounds(b, a))
                        if (this.board[a][b] == -1)
                            count++;
                }
            }
        }
        return count;
    }

    getTexture(x, y) {
        switch (this.board[y][x]) {
            case empty:
                return this.images.empty;
            case 1:
                return this.images.block1;
            case 2:
                return this.images.block2;
            case 3:
                return this.images.block3;
            case 4:
                return this.images.block4;
            case 5:
                return this.images.block5;
            case 6:
                return this.images.block6;
            case 7:
                return this.images.block7;
            case 8:
                return this.images.block8;
            case mine:
                return this.images.mineClicked;
            default:
                return this.images.mine;
        }
    }

    renderBlock(x, y) {
        let x1 = x * this.blockX;
        let y1 = y * this.blockY;
        switch(this.state[y][x]) {
            case state_opened:
                this.context.drawImage(this.getTexture(x, y), x1, y1, this.blockX, this.blockY);
                break;
            case state_flagged:
                this.context.drawImage(this.images.flagged, x1, y1, this.blockX, this.blockY);
                break;
            default:
                this.context.drawImage(this.images.covered, x1, y1, this.blockX, this.blockY);
                break;
        }
    }

    render() {
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                if (this.state[y][x] == state_closed && this.board[y][x] == mine) {
                    switch (this.gameState) {
                        case 1:
                            this.state[y][x] = state_flagged;
                            break;
                        case -1:
                            this.state[y][x] = state_opened;
                            break;
                    }
                }
                this.renderBlock(x, y);
            }
        }
    }

    clear() {
        this.context.clearRect(0, 0, this.pxX, this.pxY);
    }

    start() {
        this.blockX = this.pxX / this.w;
        this.blockY = this.pxY / this.h;
        this.init();
        let that = this;
        this.canvas.addEventListener("click", function (e) {
            if (!that.gameState != 0) {
                let rect = e.target.getBoundingClientRect();
                let x = Math.floor((e.clientX - rect.left) / that.blockX);
                let y = Math.floor((e.clientY - rect.top) / that.blockY);
                that.openBlock(x, y, false);
            } else that.restart();
        });
        this.canvas.addEventListener("contextmenu", function (e) {
            if (!that.gameState != 0) {
                e.preventDefault();
                let rect = e.target.getBoundingClientRect();
                let x = Math.floor((e.clientX - rect.left) / that.blockX);
                let y = Math.floor((e.clientY - rect.top) / that.blockY);
                that.openBlock(x, y, true);
            }
        });
    }

    restart() {
        this.gameState = 0;
        this.blockX = this.pxX / this.w;
        this.blockY = this.pxY / this.h;
        this.clear();
        this.init();
    }

    init() {
        for (let y = 0; y < this.h; y++) {
            this.board[y] = [];
            this.state[y] = [];
            for (let x = 0; x < this.w; x++) {
                this.board[y][x] = empty;
                this.state[y][x] = state_closed;
            }
        }
        for (let i = 0; i < this.mines; i++) {
            let x, y;
            do {
                y = Math.floor(Math.random() * this.h);
                x = Math.floor(Math.random() * this.w);
                break;
            } while (this.board[y][x] == mine);
            this.board[y][x] = mine;
        }
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                if (this.board[y][x] != mine)
                    this.board[y][x] = this.countMinesAround(x, y);
            }
        }
        this.render();
    }

    win() {
        this.gameState = 1;
        alert("You won!");
        if (this.winCallback != null)
            this.winCallback();
    }

    gameOver() {
        this.gameState = -1;
        alert("Game Over!");
        if (this.gameOverCallback != null)
            this.gameOverCallback();
    }

    openBlock(x, y, flag) {
        switch(this.state[y][x]) {
            case state_closed:
                if (flag)
                    this.state[y][x] = state_flagged;
                else {
                    this.state[y][x] = state_opened;
                    if (this.board[y][x] == mine) {
                        this.gameOver();
                        this.render();
                        return;
                    } else if (this.board[y][x] == empty) {
                        for (let dx = -1; dx < 2; dx++) {
                            for (let dy = -1; dy < 2; dy++) {
                                let xx = x + dx;
                                let yy = y + dy;
                                if (this.inBounds(xx, yy))
                                    if (this.state[yy][xx] == state_closed)
                                        this.openBlock(xx, yy);
                            }
                        }
                    }
                }
                break;
            case state_flagged:
                if (flag)
                    this.state[y][x] = state_closed;
                else return;
                break;
            default:
                return;
        }
        if (this.checkWin())
            this.win();
        this.render();
    }

    checkWin() {
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                if (this.state[y][x] != state_opened) {
                    if (this.board[y][x] != mine)
                        return false;
                }
            }
        }
        return true;
    }
}