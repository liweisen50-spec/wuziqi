/**
 * Main — 入口：绑定游戏、棋盘、AI
 */
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("board");
    const game = new Game();
    const board = new BoardRenderer(canvas, game);
    const ai = new AI();

    const turnIndicator = document.getElementById("turn-indicator");
    const winnerOverlay = document.getElementById("winner-overlay");
    const winnerText = document.getElementById("winner-text");
    const colorPicker = document.getElementById("color-picker-overlay");
    const moveCount = document.getElementById("move-count");

    let playerColor, aiColor;

    /** 用户选好颜色后开始游戏 */
    function startGame(color) {
        playerColor = color;
        aiColor = color === BLACK ? WHITE : BLACK;
        game.reset();
        board.playerColor = playerColor;
        colorPicker.style.display = "none";
        winnerOverlay.classList.add("hidden");
        board.redraw();
        moveCount.textContent = "0";

        if (playerColor === BLACK) {
            turnIndicator.innerHTML = `<span class="stone-icon black"></span>黑棋走`;
        } else {
            turnIndicator.innerHTML = `<span class="stone-icon white"></span>AI 思考中…`;
            setTimeout(() => aiMove(), 300);
        }
    }

    /** 玩家点击棋盘 */
    board.onClick = (row, col) => {
        if (game.gameOver) return;
        if (game.currentPlayer !== playerColor) return;
        if (game.board[row][col] !== EMPTY) return;
        const result = game.place(row, col);
        board.draw();
        handleMove(result);
    };

    function updateUI() {
        if (game.gameOver) return;
        const isPlayerTurn = game.currentPlayer === playerColor;
        const displayColor = isPlayerTurn ? playerColor : aiColor;
        turnIndicator.innerHTML = `
            <span class="stone-icon ${displayColor === BLACK ? "black" : "white"}"></span>
            ${isPlayerTurn ? "你的回合" : "AI 思考中…"}
        `;
        moveCount.textContent = `第 ${game.moveHistory.length} 手`;
    }

    function showWinner(winner) {
        if (winner === playerColor) {
            winnerText.textContent = "🎉 你赢了！";
        } else if (winner === aiColor) {
            winnerText.textContent = "🤖 AI 赢了！";
        } else {
            winnerText.textContent = "🤝 平局";
        }
        winnerOverlay.classList.remove("hidden");
        turnIndicator.innerHTML = `<span>游戏结束</span>`;
    }

    function handleMove(result) {
        switch (result) {
            case "win":
                showWinner(game.winner);
                return;
            case "draw":
                showWinner(null);
                return;
            case "continue":
                updateUI();
                if (game.currentPlayer === aiColor && !game.gameOver) {
                    setTimeout(() => aiMove(), 200);
                }
                break;
        }
    }

    function aiMove() {
        if (game.gameOver || game.currentPlayer !== aiColor) return;
        const move = ai.getMove(game.board, aiColor);
        if (!move) return;
        const result = game.place(move.row, move.col);
        board.redraw();
        handleMove(result);
    }

    /** 重新开始：弹出颜色选择 */
    function restart() {
        colorPicker.style.display = "flex";
        winnerOverlay.classList.add("hidden");
    }

    // —— 颜色选择按钮 ——
    document.querySelectorAll(".picker-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            startGame(btn.dataset.color === "black" ? BLACK : WHITE);
        });
    });

    // —— 重新开始按钮 ——
    document.getElementById("restart-btn").addEventListener("click", restart);
    document.getElementById("restart-btn-small").addEventListener("click", restart);
});
