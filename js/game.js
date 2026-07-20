/**
 * Game — 游戏状态管理 & 胜负判定
 */
const BOARD_SIZE = 19;
const EMPTY = 0;
const BLACK = 1; // 玩家
const WHITE = 2; // AI

class Game {
    constructor() {
        this.reset();
    }

    reset() {
        this.board = Array.from({ length: BOARD_SIZE }, () =>
            Array(BOARD_SIZE).fill(EMPTY)
        );
        this.currentPlayer = BLACK;
        this.moveHistory = [];
        this.winner = null;
        this.isDraw = false;
        this.gameOver = false;
    }

    place(row, col) {
        if (this.gameOver) return null;
        if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return null;
        if (this.board[row][col] !== EMPTY) return null;

        this.board[row][col] = this.currentPlayer;
        this.moveHistory.push({ row, col, player: this.currentPlayer });

        // 检查胜负
        if (this.checkWin(row, col, this.currentPlayer)) {
            this.winner = this.currentPlayer;
            this.gameOver = true;
            return 'win';
        }

        // 检查平局
        if (this.moveHistory.length === BOARD_SIZE * BOARD_SIZE) {
            this.isDraw = true;
            this.gameOver = true;
            return 'draw';
        }

        // 切换玩家
        this.currentPlayer = this.currentPlayer === BLACK ? WHITE : BLACK;
        return 'continue';
    }

    checkWin(row, col, player) {
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

        for (const [dx, dy] of directions) {
            let count = 1;

            // 正方向
            let r = row + dx, c = col + dy;
            while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && this.board[r][c] === player) {
                count++;
                r += dx;
                c += dy;
            }

            // 负方向
            r = row - dx;
            c = col - dy;
            while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && this.board[r][c] === player) {
                count++;
                r -= dx;
                c -= dy;
            }

            if (count >= 5) return true;
        }

        return false;
    }

    getLastMove() {
        return this.moveHistory.length > 0
            ? this.moveHistory[this.moveHistory.length - 1]
            : null;
    }
}
