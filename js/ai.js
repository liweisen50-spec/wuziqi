/**
 * AI — 基于位置评分的五子棋 AI
 */
const SCORE_TABLE = {
    FIVE:      1000000,
    LIVE_FOUR: 100000,
    RUSH_FOUR: 10000,
    LIVE_THREE:10000,
    SLEEP_THREE:1000,
    LIVE_TWO:  1000,
    SLEEP_TWO: 100,
    LIVE_ONE:  100,
    SLEEP_ONE: 10,
};

class AI {
    /**
     * 返回 AI 认为最佳落子位置 { row, col }
     * @param {number[][]} board
     * @param {number} aiPlayer — AI 的棋子颜色
     */
    getMove(board, aiPlayer) {
        const opponent = aiPlayer === BLACK ? WHITE : BLACK;
        const candidates = this._getCandidates(board);

        if (candidates.length === 0) {
            // 棋盘为空，下天元
            const center = Math.floor(BOARD_SIZE / 2);
            return { row: center, col: center };
        }

        let bestScore = -Infinity;
        let bestMove = candidates[0];

        for (const { row, col } of candidates) {
            // 进攻分
            board[row][col] = aiPlayer;
            const attackScore = this._evaluatePoint(board, row, col, aiPlayer);
            board[row][col] = EMPTY;

            // 防守分
            board[row][col] = opponent;
            const defenseScore = this._evaluatePoint(board, row, col, opponent);
            board[row][col] = EMPTY;

            // 综合：进攻略优先
            const total = attackScore * 1.1 + defenseScore;

            if (total > bestScore) {
                bestScore = total;
                bestMove = { row, col };
            }
        }

        return bestMove;
    }

    /** 收集候选位置：已有棋子周围 2 格内的空位 */
    _getCandidates(board) {
        const set = new Set();
        const range = 2;

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (board[r][c] === EMPTY) continue;
                for (let dr = -range; dr <= range; dr++) {
                    for (let dc = -range; dc <= range; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === EMPTY) {
                            set.add(nr * BOARD_SIZE + nc);
                        }
                    }
                }
            }
        }

        return Array.from(set).map(key => ({
            row: Math.floor(key / BOARD_SIZE),
            col: key % BOARD_SIZE,
        }));
    }

    /** 评估在 (row, col) 落子的价值（对 player 而言） */
    _evaluatePoint(board, row, col, player) {
        const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
        let totalScore = 0;

        for (const [dx, dy] of dirs) {
            let count = 1;
            let openEnds = 0;

            // 正方向
            let r = row + dx, c = col + dy;
            while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
                count++;
                r += dx;
                c += dy;
            }
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === EMPTY) {
                openEnds++;
            }

            // 负方向
            r = row - dx;
            c = col - dy;
            while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
                count++;
                r -= dx;
                c -= dy;
            }
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === EMPTY) {
                openEnds++;
            }

            totalScore += this._patternScore(count, openEnds);
        }

        return totalScore;
    }

    _patternScore(count, openEnds) {
        if (count >= 5) return SCORE_TABLE.FIVE;
        if (count === 4) {
            if (openEnds === 2) return SCORE_TABLE.LIVE_FOUR;
            if (openEnds === 1) return SCORE_TABLE.RUSH_FOUR;
            return 0;
        }
        if (count === 3) {
            if (openEnds === 2) return SCORE_TABLE.LIVE_THREE;
            if (openEnds === 1) return SCORE_TABLE.SLEEP_THREE;
            return 0;
        }
        if (count === 2) {
            if (openEnds === 2) return SCORE_TABLE.LIVE_TWO;
            if (openEnds === 1) return SCORE_TABLE.SLEEP_TWO;
            return 0;
        }
        if (count === 1) {
            if (openEnds === 2) return SCORE_TABLE.LIVE_ONE;
            if (openEnds === 1) return SCORE_TABLE.SLEEP_ONE;
            return 0;
        }
        return 0;
    }
}
