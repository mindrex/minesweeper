<!DOCTYPE html>
<html>

<head>
    <link rel="icon" href="./src/mine.png" />
    <title>Minesweeper</title>
    <script type="text/javascript">
        var gameBoard = null;
        var pxX = 900,
            pxY = 900;
        var blockX = 30,
            blockY = 30;

        var h = 15,
            w = 15,
            mines = 30;
        var board = [];
        var state = []; // closed = 0, opened = 1, flagged = 2
        var context = null;
        var playing = false;
        var isGameOver = false;

        const util = {
            inBounds: function(x, y) {
                return x >= 0 && y >= 0 && x < w && y < h;
            },

            countMinesAround: function(x, y) {
                var count = 0;
                for (var dx = -1; dx < 2; dx++) {
                    for (var dy = -1; dy < 2; dy++) {
                        if (dx != 0 || dy != 0) {
                            const a = y + dy;
                            const b = x + dx;
                            if (util.inBounds(b, a))
                                if (board[a][b] == -1)
                                    count++;
                        }
                    }
                }
                return count;
            }
        }

        const render = {
            renderBlock: function(x, y) {
                const x1 = x * blockX;
                const y1 = y * blockY;
                var image = null;
                var a = false;
                if (state[y][x] == 1) {
                    const a = board[y][x];
                    if (a == 0) image = images.empty();
                    else if (a == 1) image = images.block1();
                    else if (a == 2) image = images.block2();
                    else if (a == 3) image = images.block3();
                    else if (a == 4) image = images.block4();
                    else if (a == 5) image = images.block5();
                    else if (a == 6) image = images.block6();
                    else if (a == 7) image = images.block7();
                    else if (a == 8) image = images.block8();
                    else if (a == -1) image = images.mine_clicked();
                    else image = images.mine();
                } else if (state[y][x] == 2)
                    image = images.flagged();
                else image = images.covered();
                image.onload = function() {
                    context.drawImage(image, x1, y1, blockX, blockY);
                }
            },

            render: function() {
                for (var y = 0; y < h; y++) {
                    for (var x = 0; x < w; x++) {
                        render.renderBlock(x, y);
                    }
                }
            },

            clear: function() {
                context.fillStyle = "white";
                context.fillRect(0, 0, pxX, pxY);
            }
        }

        const images = {
            empty: function() {
                const a = new Image();
                a.src = "./src/empty.png";
                return a;
            },

            block1: function() {
                const a = new Image();
                a.src = "./src/block_1.png";
                return a;
            },

            block2: function() {
                const a = new Image();
                a.src = "./src/block_2.png";
                return a;
            },

            block3: function() {
                const a = new Image();
                a.src = "./src/block_3.png";
                return a;
            },

            block4: function() {
                const a = new Image();
                a.src = "./src/block_4.png";
                return a;
            },

            block5: function() {
                const a = new Image();
                a.src = "./src/block_5.png";
                return a;
            },

            block6: function() {
                const a = new Image();
                a.src = "./src/block_6.png";
                return a;
            },

            block7: function() {
                const a = new Image();
                a.src = "./src/block_7.png";
                return a;
            },

            block8: function() {
                const a = new Image();
                a.src = "./src/block_8.png";
                return a;
            },

            covered: function() {
                const a = new Image();
                a.src = "./src/covered.png";
                return a;
            },

            flagged: function() {
                const a = new Image();
                a.src = "./src/flagged.png";
                return a;
            },

            mine: function() {
                const a = new Image();
                a.src = "./src/mine.png";
                return a;
            },

            mine_clicked: function() {
                const a = new Image();
                a.src = "./src/mine_clicked.png";
                return a;
            },
        }

        function preInit() {
            gameBoard = document.getElementById("canvas");
            pxX = gameBoard.clientWidth;
            pxY = gameBoard.clientHeight;
            gameBoard.style.visibility = "hidden";
            document.getElementById("inputHeight").value = h;
            document.getElementById("inputWidth").value = w;
            document.getElementById("inputMines").value = mines;
        }

        function start() {
            h = parseInt(document.getElementById("inputHeight").value);
            w = parseInt(document.getElementById("inputWidth").value);
            mines = parseInt(document.getElementById("inputMines").value);
            const menu = document.getElementsByClassName("menu")[0];
            menu.parentNode.removeChild(menu);
            gameBoard.style.visibility = "visible";
            if (h <= 0 || w <= 0 || h > 50 || w > 50) {
                console.log("Invalid game board size");
                return null;
            }
            if (mines >= h * w) {
                console.log("Invalid mine count");
                return null;
            }
            context = gameBoard.getContext("2d");
            blockX = pxX / w;
            blockY = pxY / h;
            init();
            gameBoard.addEventListener("click", function(e) {
                if (playing) {
                    if (isGameOver) {
                        render.clear();
                        init();
                        isGameOver = false;
                    } else {
                        const x = Math.floor((e.clientX - canvas.offsetLeft) / blockX);
                        const y = Math.floor((e.clientY - canvas.offsetTop) / blockY);
                        openBlock(x, y, false);
                    }
                }
            });
            gameBoard.addEventListener("contextmenu", function(e) {
                if (playing && !isGameOver) {
                    e.preventDefault();
                    const x = Math.floor((e.clientX - canvas.offsetLeft) / blockX);
                    const y = Math.floor((e.clientY - canvas.offsetTop) / blockY);
                    openBlock(x, y, true);
                }
            });
            playing = true;
        }

        function init() {
            for (var y = 0; y < h; y++) {
                board.push([]);
                state.push([]);
                for (var x = 0; x < w; x++) {
                    board[y][x] = 0;
                    state[y][x] = 0; // state_closed
                }
            }
            for (var i = 0; i < mines; i++) {
                var x, y;
                do {
                    y = Math.floor(Math.random() * h);
                    x = Math.floor(Math.random() * w);
                    break;
                } while (board[y][x] == -1);
                board[y][x] = -1; // mine block
            }
            for (var y = 0; y < h; y++) {
                for (var x = 0; x < w; x++) {
                    if (board[y][x] != -1) {
                        board[y][x] = util.countMinesAround(x, y);
                    }
                }
            }
            render.render();
        }

        function gameOver() {
            isGameOver = true;
            context.fillStyle = "red";
            context.strokeStyle = "white";
            context.font = "bold 36px sans-serif";
            const a = "Game Over";
            const w = context.measureText(a).width;
            context.fillText(a, (canvas.width / 2) - (w / 2), 100);
            context.strokeText(a, (canvas.width / 2) - (w / 2), 100);
        }

        function openBlock(x, y, flag) {
            if (state[y][x] == 0) {
                if (flag) state[y][x] = 2;
                else {
                    state[y][x] = 1;
                    if (board[y][x] == -1) {
                        render.renderBlock(x, y);
                        gameOver();
                        return null;
                    } else if (board[y][x] == 0) {
                        for (var dx = -1; dx < 2; dx++) {
                            for (var dy = -1; dy < 2; dy++) {
                                const a = x + dx;
                                const b = y + dy;
                                if (util.inBounds(a, b))
                                    if (state[b][a] == 0)
                                        openBlock(a, b);
                            }
                        }
                    }
                    render.render();
                }
            } else if (state[y][x] == 2 && flag)
                state[y][x] = 0;
            render.render();
        }
    </script>
</head>

<body onload="preInit()">
    <noscript>
        <p style="height: fit-content; width: 100%; background-color: red;">
            This game requires JavaScript enabled, please enable it in the browser settings.</p>
    </noscript>
    <div class="container" style="height: 100%; width: 100%; position: relative;">
        <div class="menu" style="width: 10%; height: auto; margin: auto; display: block;">
            <input id="inputHeight" name="Height" type="number" placeholder="Height" />
            <input id="inputWidth" name="Width" type="number" placeholder="Width" />
            <input id="inputMines" name="Mines" type="number" placeholder="Mines" />
            <button id="play" name="Play" onclick="start()">Play</button>
        </div>
        <canvas id="canvas" width="600" height="600" style="margin: auto; display: block;">
            <p style="height: fit-content; width: 100%; background-color: orange;">
                Your browser does not support html5 canvas, please try with another browser.</p>
        </canvas>
    </div>
    <script type="text/javascript">

    </script>
</body>

</html>