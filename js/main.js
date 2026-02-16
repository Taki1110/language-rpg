/**
 * メインエントリーポイント
 */

// DOMが読み込まれたらゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
});
