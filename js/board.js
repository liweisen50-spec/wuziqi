/**
 * Board — Canvas 棋盘渲染 & 鼠标交互
 */
const CELL_SIZE = 45;
const PADDING = 35;
const STONE_RADIUS = 18.9;
const BOARD_PX = PADDING * 2 + (BOARD_SIZE - 1) * CELL_SIZE;
const STAR_POINTS = [
    [3, 3], [3, 9], [3, 15],
    [9, 3], [9, 9], [9, 15],
    [15, 3], [15, 9], [15, 15],
];

class BoardRenderer {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = game;
        this.hoverPos = null;
        this.playerColor = BLACK;

        // 启用高 DPI
        const dpr = window.devicePixelRatio || 1;
        canvas.width = BOARD_PX * dpr;
        canvas.height = BOARD_PX * dpr;
        canvas.style.width = BOARD_PX + 'px';
        canvas.style.height = BOARD_PX + 'px';
        this.ctx.scale(dpr, dpr);

        this._bindEvents();
        this.draw();
    }

    _bindEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.hoverPos = this._posFromPixel(x, y);
            this.draw();
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.hoverPos = null;
            this.draw();
        });

        this.canvas.addEventListener('click', (e) => {
            if (this.game.gameOver) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const pos = this._posFromPixel(x, y);
            if (pos && typeof this.onClick === 'function') {
                this.onClick(pos.row, pos.col);
            }
        });
    }

    _posFromPixel(px, py) {
        const col = Math.round((px - PADDING) / CELL_SIZE);
        const row = Math.round((py - PADDING) / CELL_SIZE);
        if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return null;
        // 判断点击是否在交叉点附近
        const cx = PADDING + col * CELL_SIZE;
        const cy = PADDING + row * CELL_SIZE;
        const dist = Math.hypot(px - cx, py - cy);
        return dist < CELL_SIZE * 0.45 ? { row, col } : null;
    }

    draw() {
        const ctx = this.ctx;
        const W = BOARD_PX;

        // —— Premium Wood Board with Enhanced Texture —
        // Base gradient with refined wood tones
        const woodBase = ctx.createLinearGradient(0, 0, W * 0.3, W);
        woodBase.addColorStop(0, '#a68a5e');
        woodBase.addColorStop(0.4, '#8b6f47');
        woodBase.addColorStop(1, '#6b5435');
        ctx.fillStyle = woodBase;
        ctx.fillRect(0, 0, W, W);

        // Enhanced wood grain with directional variance
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < W; i += 2) {
            const offset = Math.sin(i * 0.02) * 0.5;
            const shade = (i + offset) % 4 < 2 ? '#6b5435' : '#8b6f47';
            ctx.fillStyle = shade;
            ctx.fillRect(i, 0, 1.5, W);
        }
        ctx.globalAlpha = 1;

        // Directional lighting from top-left
        const lighting = ctx.createLinearGradient(0, 0, W, W);
        lighting.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
        lighting.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        lighting.addColorStop(1, 'rgba(0, 0, 0, 0.12)');
        ctx.fillStyle = lighting;
        ctx.fillRect(0, 0, W, W);

        // Ambient occlusion in corners
        const vignette = ctx.createRadialGradient(W / 2, W / 2, W * 0.25, W / 2, W / 2, W * 0.75);
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, W, W);

        // —— Refined Grid Lines with Subtle Neon Accent —
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';

        for (let i = 0; i < BOARD_SIZE; i++) {
            const x = PADDING + i * CELL_SIZE;
            const y = PADDING + i * CELL_SIZE;

            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(PADDING, y);
            ctx.lineTo(PADDING + (BOARD_SIZE - 1) * CELL_SIZE, y);
            ctx.stroke();

            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(x, PADDING);
            ctx.lineTo(x, PADDING + (BOARD_SIZE - 1) * CELL_SIZE);
            ctx.stroke();
        }

        // Subtle grid glow overlay
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i < BOARD_SIZE; i++) {
            const x = PADDING + i * CELL_SIZE;
            const y = PADDING + i * CELL_SIZE;

            ctx.beginPath();
            ctx.moveTo(PADDING, y);
            ctx.lineTo(PADDING + (BOARD_SIZE - 1) * CELL_SIZE, y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, PADDING);
            ctx.lineTo(x, PADDING + (BOARD_SIZE - 1) * CELL_SIZE);
            ctx.stroke();
        }

        // —— Enhanced Star Points —
        for (const [r, c] of STAR_POINTS) {
            const x = PADDING + c * CELL_SIZE;
            const y = PADDING + r * CELL_SIZE;

            // Outer glow with cyan tint
            const starGlow = ctx.createRadialGradient(x, y, 0, x, y, 8);
            starGlow.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
            starGlow.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
            starGlow.addColorStop(0.8, 'rgba(0, 212, 255, 0.1)');
            starGlow.addColorStop(1, 'rgba(0, 212, 255, 0)');
            ctx.fillStyle = starGlow;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();

            // Solid star point
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Subtle highlight
            ctx.fillStyle = 'rgba(0, 212, 255, 0.15)';
            ctx.beginPath();
            ctx.arc(x - 1, y - 1, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // —— Premium Stone Rendering with Advanced Lighting —
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const val = this.game.board[r][c];
                if (val === EMPTY) continue;
                const x = PADDING + c * CELL_SIZE;
                const y = PADDING + r * CELL_SIZE;
                const radius = STONE_RADIUS;

                if (val === BLACK) {
                    // Black Obsidian Stone - Deep glossy finish
                    // Layered shadow system for dramatic depth
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                    ctx.shadowBlur = 16;
                    ctx.shadowOffsetX = 3;
                    ctx.shadowOffsetY = 6;

                    // Main obsidian gradient
                    const blackGrad = ctx.createRadialGradient(x - 6, y - 6, 0, x, y, radius);
                    blackGrad.addColorStop(0, '#4a4a4a');
                    blackGrad.addColorStop(0.25, '#2a2a2a');
                    blackGrad.addColorStop(0.55, '#1a1a1a');
                    blackGrad.addColorStop(0.85, '#0a0a0a');
                    blackGrad.addColorStop(1, '#000000');

                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fillStyle = blackGrad;
                    ctx.fill();

                    // Reset shadow
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;

                    // Inner shadow for depth
                    ctx.globalCompositeOperation = 'multiply';
                    const innerShadowBlack = ctx.createRadialGradient(x + 3, y + 3, 0, x + 3, y + 3, radius * 0.8);
                    innerShadowBlack.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
                    innerShadowBlack.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
                    innerShadowBlack.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    ctx.fillStyle = innerShadowBlack;
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalCompositeOperation = 'source-over';

                    // Specular highlight from top-left
                    const specular = ctx.createRadialGradient(x - 7, y - 7, 0, x - 4, y - 4, radius * 0.5);
                    specular.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
                    specular.addColorStop(0.4, 'rgba(255, 255, 255, 0.08)');
                    specular.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    ctx.fillStyle = specular;
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fill();

                    // Fresnel rim light effect
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(x - 1, y - 1, radius - 1, Math.PI * 0.8, Math.PI * 1.7);
                    ctx.stroke();

                } else {
                    // White Pearl Stone - Lustrous finish
                    // Soft shadow
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                    ctx.shadowBlur = 16;
                    ctx.shadowOffsetX = 3;
                    ctx.shadowOffsetY = 6;

                    // Pearl gradient
                    const whiteGrad = ctx.createRadialGradient(x - 6, y - 6, 0, x, y, radius);
                    whiteGrad.addColorStop(0, '#ffffff');
                    whiteGrad.addColorStop(0.25, '#fafafa');
                    whiteGrad.addColorStop(0.55, '#f0f0f0');
                    whiteGrad.addColorStop(0.85, '#e0e0e0');
                    whiteGrad.addColorStop(1, '#c8c8c8');

                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fillStyle = whiteGrad;
                    ctx.fill();

                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;

                    // Inner shadow for depth
                    ctx.globalCompositeOperation = 'multiply';
                    const innerShadow = ctx.createRadialGradient(x + 2, y + 2, 0, x + 2, y + 2, radius * 0.7);
                    innerShadow.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
                    innerShadow.addColorStop(0.6, 'rgba(0, 0, 0, 0.05)');
                    innerShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    ctx.fillStyle = innerShadow;
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalCompositeOperation = 'source-over';

                    // Bright specular highlight
                    const pearlHighlight = ctx.createRadialGradient(x - 7, y - 7, 0, x - 4, y - 4, radius * 0.6);
                    pearlHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                    pearlHighlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
                    pearlHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    ctx.fillStyle = pearlHighlight;
                    ctx.beginPath();
                    ctx.arc(x - 4, y - 4, radius * 0.6, 0, Math.PI * 2);
                    ctx.fill();

                    // Iridescent hint (subtle blue-pink shift)
                    const iridescence = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, radius * 0.4);
                    iridescence.addColorStop(0, 'rgba(200, 220, 255, 0.05)');
                    iridescence.addColorStop(1, 'rgba(255, 200, 220, 0.03)');
                    ctx.fillStyle = iridescence;
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fill();

                    // Edge definition
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        }

        // —— Enhanced Last Move Indicator —
        const last = this.game.getLastMove();
        if (last) {
            const x = PADDING + last.col * CELL_SIZE;
            const y = PADDING + last.row * CELL_SIZE;

            // Primary neon glow ring
            const primaryGlow = ctx.createRadialGradient(x, y, 0, x, y, 12);
            primaryGlow.addColorStop(0, 'rgba(0, 212, 255, 0.6)');
            primaryGlow.addColorStop(0.5, 'rgba(0, 212, 255, 0.3)');
            primaryGlow.addColorStop(1, 'rgba(0, 212, 255, 0)');
            ctx.fillStyle = primaryGlow;
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();

            // Secondary glow layer
            const secondaryGlow = ctx.createRadialGradient(x, y, 0, x, y, 20);
            secondaryGlow.addColorStop(0, 'rgba(0, 212, 255, 0.2)');
            secondaryGlow.addColorStop(0.6, 'rgba(0, 212, 255, 0.1)');
            secondaryGlow.addColorStop(1, 'rgba(0, 212, 255, 0)');
            ctx.fillStyle = secondaryGlow;
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.fill();

            // Center marker with glow
            ctx.fillStyle = '#00d4ff';
            ctx.shadowColor = 'rgba(0, 212, 255, 0.8)';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Bright center dot
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // —— Enhanced Hover Preview with Premium Effects —
        if (this.hoverPos && !this.game.gameOver && this.game.currentPlayer === this.playerColor) {
            const { row, col } = this.hoverPos;
            if (this.game.board[row][col] === EMPTY) {
                const x = PADDING + col * CELL_SIZE;
                const y = PADDING + row * CELL_SIZE;
                const radius = STONE_RADIUS;

                // Interactive spotlight effect
                const spotlight = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.5);
                spotlight.addColorStop(0, 'rgba(0, 212, 255, 0.15)');
                spotlight.addColorStop(0.4, 'rgba(0, 212, 255, 0.08)');
                spotlight.addColorStop(0.7, 'rgba(0, 212, 255, 0.03)');
                spotlight.addColorStop(1, 'rgba(0, 212, 255, 0)');
                ctx.fillStyle = spotlight;
                ctx.beginPath();
                ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
                ctx.fill();

                // Primary hover glow
                const hoverGlow = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.6);
                hoverGlow.addColorStop(0, 'rgba(0, 212, 255, 0.25)');
                hoverGlow.addColorStop(0.5, 'rgba(0, 212, 255, 0.15)');
                hoverGlow.addColorStop(1, 'rgba(0, 212, 255, 0)');
                ctx.fillStyle = hoverGlow;
                ctx.beginPath();
                ctx.arc(x, y, radius * 1.6, 0, Math.PI * 2);
                ctx.fill();

                // Semi-transparent stone preview with enhanced material
                ctx.globalAlpha = 0.6;

                if (this.playerColor === BLACK) {
                    // Black stone preview
                    const previewGrad = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, radius);
                    previewGrad.addColorStop(0, '#4a4a4a');
                    previewGrad.addColorStop(0.3, '#2a2a2a');
                    previewGrad.addColorStop(0.7, '#1a1a1a');
                    previewGrad.addColorStop(1, '#000000');
                    ctx.fillStyle = previewGrad;
                } else {
                    // White stone preview
                    const previewGrad = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, radius);
                    previewGrad.addColorStop(0, '#ffffff');
                    previewGrad.addColorStop(0.4, '#f5f5f5');
                    previewGrad.addColorStop(0.8, '#e0e0e0');
                    previewGrad.addColorStop(1, '#c8c8c8');
                    ctx.fillStyle = previewGrad;
                }

                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();

                // Subtle highlight on preview
                ctx.globalAlpha = 0.3;
                const previewHighlight = ctx.createRadialGradient(x - 6, y - 6, 0, x - 3, y - 3, radius * 0.5);
                previewHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
                previewHighlight.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
                previewHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = previewHighlight;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();

                // Neon edge glow
                ctx.globalAlpha = 0.85;
                ctx.strokeStyle = '#00d4ff';
                ctx.lineWidth = 2.5;
                ctx.shadowColor = 'rgba(0, 212, 255, 0.6)';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(x, y, radius + 1, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Secondary glow ring
                ctx.globalAlpha = 0.5;
                ctx.strokeStyle = '#00d4ff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
                ctx.stroke();

                ctx.globalAlpha = 1;
            }
        }
    }

    /** 从外部触发重绘（AI 走完后） */
    redraw() {
        this.hoverPos = null;
        this.draw();
    }
}
