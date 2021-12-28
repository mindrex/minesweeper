
class Minesweeper {
    constructor(canvas, textures, height = 15, width = 15, mines = 30) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.images = textures;
        this.pxX = canvas.clientWidth
        this.pxY = canvas.clientHeight;
        this.blockX = 30;
        this.blockY = 30;
        this.h = height;
        this.w = width;
        this.mines = mines;
        this.board = [];
        this.state = []; // closed = 0, opened = 1, flagged = 2
        this.isGameOver = false;
        this.gameOverCallback = null;
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

    getTexture(i) {
        switch (i) {
            case 0:
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
            case -1:
                return this.images.mineClicked;
            default:
                return this.images.mine;
        }
    }

    renderBlock(x, y) {
        let x1 = x * this.blockX;
        let y1 = y * this.blockY;
        if (this.state[y][x] == 1) {

            this.context.drawImage(this.getTexture(this.board[y][x]), x1, y1, this.blockX, this.blockY);
        }
        else if (this.state[y][x] == 2)
            this.drawImage(this.images.flagged, x1, y1, this.blockX, this.blockY);
        else this.context.drawImage(this.images.covered, x1, y1, this.blockX, this.blockY);
    }

    render() {
        for (let y = 0; y < this.h; y++)
            for (let x = 0; x < this.w; x++)
                this.renderBlock(x, y);
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
            if (that.isGameOver) {
                that.clear();
                that.init();
                that.isGameOver = false;
            } else {
                let x = Math.floor((e.clientX - that.canvas.offsetLeft) / that.blockX);
                let y = Math.floor((e.clientY - that.canvas.offsetTop) / that.blockY);
                that.openBlock(x, y, false);
            }
        });
        this.canvas.addEventListener("contextmenu", function (e) {
            if (!isGameOver) {
                e.preventDefault();
                let x = Math.floor((e.clientX - that.canvas.offsetLeft) / that.blockX);
                let y = Math.floor((e.clientY - that.canvas.offsetTop) / that.blockY);
                that.openBlock(x, y, true);
            }
        });
        this.render();
    }

    init() {
        for (let y = 0; y < this.h; y++) {
            this.board.push([]);
            this.state.push([]);
            for (let x = 0; x < this.w; x++) {
                this.board[y][x] = 0;
                this.state[y][x] = 0; // state_closed
            }
        }
        for (let i = 0; i < this.mines; i++) {
            let x, y;
            do {
                y = Math.floor(Math.random() * this.h);
                x = Math.floor(Math.random() * this.w);
                break;
            } while (this.board[y][x] == -1);
            this.board[y][x] = -1; // mine block
        }
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                if (this.board[y][x] != -1)
                    this.board[y][x] = this.countMinesAround(x, y);
            }
        }
        this.render();
    }

    gameOver() {
        this.isGameOver = true;
        if (this.gameOverCallback != null)
            this.gameOverCallback();
        this.context.fillStyle = "red";
        this.context.strokeStyle = "white";
        this.context.font = "bold 36px sans-serif";
        const a = "Game Over";
        const w = context.measureText(a).width;
        this.context.fillText(a, (canvas.width / 2) - (w / 2), 100);
        this.context.strokeText(a, (canvas.width / 2) - (w / 2), 100);
    }

    openBlock(x, y, flag) {
        if (this.state[y][x] == 0) {
            if (flag)
                this.state[y][x] = 2;
            else {
                this.state[y][x] = 1;
                if (this.board[y][x] == -1) {
                    this.renderBlock(x, y);
                    this.gameOver();
                } else if (this.board[y][x] == 0) {
                    for (var dx = -1; dx < 2; dx++) {
                        for (var dy = -1; dy < 2; dy++) {
                            const a = x + dx;
                            const b = y + dy;
                            if (this.inBounds(a, b))
                                if (this.state[b][a] == 0)
                                    this.openBlock(a, b);
                        }
                    }
                }
                this.render();
            }
        } else if (this.state[y][x] == 2 && flag)
            this.state[y][x] = 0;
        this.render();
    }
}