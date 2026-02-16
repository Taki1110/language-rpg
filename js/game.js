/**
 * メインゲームクラス
 */

class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.ui = null;
        this.audio = null;
        this.map = null;
        this.player = null;
        this.battle = null;
        
        this.state = 'title'; // title, field, battle, menu, message, shop, inn
        this.lastTime = 0;
        this.messageQueue = [];
        this.currentMessage = null;
        this.messageCallback = null;
        
        this.keys = {};
        this.touchStartX = 0;
        this.touchStartY = 0;
    }

    // ゲーム初期化
    async init() {
        // Canvas設定
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // コンポーネント初期化
        this.ui = new UI();
        this.ui.init();
        this.ui.onCommand((type, value) => this.handleUICommand(type, value));
        
        this.audio = new AudioManager();
        this.audio.init();
        
        this.map = new GameMap();
        this.player = new Player();
        this.battle = new BattleSystem();
        
        // イベントリスナー
        this.setupEventListeners();
        
        // タイトル画面表示
        this.ui.showTitleScreen();
        this.audio.playBGM('title');
        
        // ゲームループ開始
        requestAnimationFrame((t) => this.loop(t));
    }

    // Canvasリサイズ
    resizeCanvas() {
        const container = document.getElementById('game-container');
        const aspectRatio = 4 / 3;
        let width = container.clientWidth;
        let height = container.clientHeight;
        
        if (width / height > aspectRatio) {
            width = height * aspectRatio;
        } else {
            height = width / aspectRatio;
        }
        
        this.canvas.width = 640;
        this.canvas.height = 480;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
    }

    // イベントリスナー設定
    setupEventListeners() {
        // キーボード
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // タッチ
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // リサイズ
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // バトルコマンド
        this.ui.setupBattleCommands((cmd) => this.handleBattleCommand(cmd));
    }

    // キー入力処理
    handleKeyDown(e) {
        this.keys[e.key] = true;
        
        if (this.state === 'field') {
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                    this.tryMove(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                    this.tryMove(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                    this.tryMove(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                    this.tryMove(1, 0);
                    break;
                case ' ':
                case 'Enter':
                    this.checkAction();
                    break;
                case 'Escape':
                case 'Backspace':
                    this.openMenu();
                    break;
            }
        } else if (this.state === 'message') {
            if (e.key === ' ' || e.key === 'Enter') {
                this.advanceMessage();
            }
        } else if (this.state === 'menu') {
            switch (e.key) {
                case 'ArrowUp':
                    this.ui.handleKeyNavigation('up');
                    break;
                case 'ArrowDown':
                    this.ui.handleKeyNavigation('down');
                    break;
                case 'Enter':
                    this.ui.handleKeyNavigation('confirm');
                    break;
                case 'Escape':
                case 'Backspace':
                    this.closeMenu();
                    break;
            }
        } else if (this.state === 'battle') {
            // 戦闘中のキー入力はUIで処理
        }
    }

    handleKeyUp(e) {
        this.keys[e.key] = false;
    }

    // タッチ入力処理
    handleTouchStart(e) {
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    }

    handleTouchEnd(e) {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - this.touchStartX;
        const dy = touch.clientY - this.touchStartY;
        const minSwipe = 30;
        
        if (this.state === 'field') {
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > minSwipe) this.tryMove(1, 0);
                else if (dx < -minSwipe) this.tryMove(-1, 0);
            } else {
                if (dy > minSwipe) this.tryMove(0, 1);
                else if (dy < -minSwipe) this.tryMove(0, -1);
            }
        }
    }

    // UIコマンド処理
    handleUICommand(type, value) {
        this.audio.playSE('cursor');
        
        if (type === 'title') {
            if (value === 'new') {
                this.startNewGame();
            } else if (value === 'continue') {
                this.loadGame();
            }
        } else if (type === 'dpad') {
            if (this.state === 'field') {
                const dirs = {
                    'up': [0, -1],
                    'down': [0, 1],
                    'left': [-1, 0],
                    'right': [1, 0]
                };
                const [dx, dy] = dirs[value] || [0, 0];
                this.tryMove(dx, dy);
            }
        } else if (type === 'button') {
            if (value === 'a') {
                if (this.state === 'field') this.checkAction();
                else if (this.state === 'message') this.advanceMessage();
            } else if (value === 'b') {
                if (this.state === 'field') this.openMenu();
                else if (this.state === 'menu') this.closeMenu();
            }
        }
    }

    // 新規ゲーム開始
    async startNewGame() {
        this.ui.hideTitleScreen();
        this.ui.showVirtualController();
        
        this.player.init();
        await this.map.loadMap('village');
        
        this.state = 'field';
        this.audio.playBGM('field');
        
        this.showMessage('語源の旅人へようこそ！', () => {
            this.showMessage('英語と中国語の力を使って冒険しよう！', null);
        });
    }

    // ゲーム読み込み
    loadGame() {
        const saveData = localStorage.getItem('language_rpg_save');
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                this.player.loadSaveData(data);
                this.map.loadMap(data.map);
                
                this.ui.hideTitleScreen();
                this.ui.showVirtualController();
                this.state = 'field';
                this.audio.playBGM('field');
            } catch (e) {
                alert('セーブデータが破損しています。');
            }
        } else {
            alert('セーブデータがありません。');
        }
    }

    // ゲーム保存
    saveGame() {
        const saveData = this.player.getSaveData();
        localStorage.setItem('language_rpg_save', JSON.stringify(saveData));
        this.showMessage('セーブしました！', null);
    }

    // 移動処理
    tryMove(dx, dy) {
        if (this.player.move(dx, dy, this.map)) {
            this.audio.playSE('cursor');
        }
    }

    // アクション確認
    checkAction() {
        const facingX = this.player.x + (this.player.direction === 'right' ? 1 : 
                                        this.player.direction === 'left' ? -1 : 0);
        const facingY = this.player.y + (this.player.direction === 'down' ? 1 : 
                                        this.player.direction === 'up' ? -1 : 0);
        
        const event = this.map.checkEvent(facingX, facingY);
        if (event) {
            this.handleEvent(event);
        }
    }

    // イベント処理
    handleEvent(event) {
        if (event.type === 'npc') {
            const npc = GameData.npcs[event.npcId];
            if (npc) {
                const dialogue = npc.dialogues[Math.floor(Math.random() * npc.dialogues.length)];
                this.showMessage(`${npc.name}: 「${dialogue}」`, null);
            }
        } else if (event.type === 'shop') {
            this.openShop();
        } else if (event.type === 'inn') {
            this.openInn(event.price);
        }
    }

    // メニュー開く
    openMenu() {
        this.state = 'menu';
        this.ui.showCommandMenu([
            { id: 'status', name: 'ステータス' },
            { id: 'items', name: '道具' },
            { id: 'skills', name: '特技' },
            { id: 'vocab', name: '単語帳' },
            { id: 'save', name: 'セーブ' },
            { id: 'close', name: '閉じる' }
        ], (cmd) => this.handleMenuCommand(cmd));
    }

    // メニューコマンド処理
    handleMenuCommand(cmd) {
        this.audio.playSE('confirm');
        
        switch (cmd) {
            case 'status':
                this.showStatus();
                break;
            case 'items':
                this.showItems();
                break;
            case 'skills':
                this.showSkills();
                break;
            case 'vocab':
                this.ui.showVocabularyBook();
                break;
            case 'save':
                this.saveGame();
                this.closeMenu();
                break;
            case 'close':
                this.closeMenu();
                break;
        }
    }

    // メニュー閉じる
    closeMenu() {
        this.ui.hideCommandMenu();
        this.ui.hideSubMenu();
        this.state = 'field';
    }

    // ステータス表示
    showStatus() {
        const p = this.player.data;
        this.showMessage(
            `${p.name} Lv.${p.level}\n` +
            `HP: ${p.hp}/${p.maxHp} MP: ${p.mp}/${p.maxMp}\n` +
            `力:${p.str} 守:${p.def} 速:${p.spd} 賢:${p.int}\n` +
            `英語Lv.${p.englishLevel} 中国語Lv.${p.chineseLevel}`,
            null
        );
    }

    // アイテム表示
    showItems() {
        const items = this.player.data.items.map(i => {
            const item = GameData.items[i.id];
            return { id: i.id, name: `${item.name} x${i.count}` };
        });
        
        if (items.length === 0) {
            this.showMessage('アイテムを持っていません。', null);
            return;
        }
        
        this.ui.showSubMenu(items, (id) => {
            const result = this.player.useItem(id);
            if (result) {
                this.audio.playSE('heal');
                this.showMessage('アイテムを使いました。', null);
                this.ui.updateStatus(this.player);
            }
        });
    }

    // スキル表示
    showSkills() {
        const skills = this.player.data.skills.map(s => {
            const skill = GameData.skills[s];
            return { id: s, name: `${skill.name} (${skill.mp}MP)` };
        });
        
        this.ui.showSubMenu(skills, (id) => {
            this.showMessage(GameData.skills[id].description, null);
        });
    }

    // ショップ開く
    openShop() {
        const items = [
            { id: 'potion', name: '薬草 (20G)' },
            { id: 'high_potion', name: 'いい薬草 (50G)' },
            { id: 'ether', name: 'エーテル (40G)' },
            { id: 'wood_sword', name: '木の剣 (100G)' },
            { id: 'leather_armor', name: '皮の鎧 (150G)' }
        ];
        
        this.ui.showSubMenu(items, (id) => {
            const item = GameData.items[id];
            if (this.player.data.gold >= item.price) {
                this.player.data.gold -= item.price;
                
                const existing = this.player.data.items.find(i => i.id === id);
                if (existing) {
                    existing.count++;
                } else {
                    this.player.data.items.push({ id: id, count: 1 });
                }
                
                this.audio.playSE('confirm');
                this.showMessage(`${item.name}を買いました！`, null);
            } else {
                this.showMessage('お金が足りません。', null);
            }
        });
    }

    // 宿屋
    openInn(price) {
        this.showMessage(`一泊${price}Gです。休みますか？`, () => {
            if (this.player.data.gold >= price) {
                this.player.data.gold -= price;
                this.player.data.hp = this.player.data.maxHp;
                this.player.data.mp = this.player.data.maxMp;
                this.audio.playSE('heal');
                this.saveGame();
                this.showMessage('ゆっくり休んでHPとMPが回復しました！', null);
            } else {
                this.showMessage('お金が足りません。', null);
            }
        });
    }

    // メッセージ表示
    showMessage(text, callback) {
        this.messageQueue.push({ text, callback });
        if (this.state !== 'message') {
            this.processMessageQueue();
        }
    }

    // メッセージキュー処理
    processMessageQueue() {
        if (this.messageQueue.length === 0) {
            this.state = 'field';
            this.ui.hideMessage();
            return;
        }
        
        this.state = 'message';
        const msg = this.messageQueue.shift();
        this.currentMessage = msg;
        
        this.ui.showMessage(msg.text, () => this.advanceMessage());
    }

    // メッセージ進行
    advanceMessage() {
        if (this.currentMessage?.callback) {
            this.currentMessage.callback();
        }
        this.processMessageQueue();
    }

    // 戦闘開始
    startBattle(enemyId) {
        this.state = 'battle';
        this.battle.start(this.player, enemyId);
        this.ui.showBattleScreen();
        this.audio.playBGM('battle');
        
        this.processBattleMessages();
    }

    // 戦闘メッセージ処理
    processBattleMessages() {
        const msg = this.battle.getNextMessage();
        if (msg) {
            this.ui.showMessage(msg, () => this.processBattleMessages());
        } else if (!this.battle.active) {
            this.endBattle();
        }
    }

    // 戦闘コマンド処理
    handleBattleCommand(cmd) {
        if (this.battle.processing) return;
        
        this.audio.playSE('confirm');
        
        if (cmd === 'attack') {
            this.battle.selectCommand('attack');
            setTimeout(() => this.processBattleMessages(), 500);
        } else if (cmd === 'skill') {
            this.showBattleSkills();
        } else if (cmd === 'item') {
            this.showBattleItems();
        } else if (cmd === 'escape') {
            this.battle.selectCommand('escape');
            setTimeout(() => this.processBattleMessages(), 500);
        }
    }

    // 戦闘スキル表示
    showBattleSkills() {
        const skills = this.player.data.skills.map(s => {
            const skill = GameData.skills[s];
            return { id: s, name: `${skill.name} (${skill.mp}MP)` };
        });
        
        this.ui.showSubMenu(skills, (id) => {
            this.ui.hideSubMenu();
            if (this.battle.selectSkill(id)) {
                setTimeout(() => this.processBattleMessages(), 500);
            }
        });
    }

    // 戦闘アイテム表示
    showBattleItems() {
        const items = this.player.data.items.map(i => {
            const item = GameData.items[i.id];
            return { id: i.id, name: `${item.name} x${i.count}` };
        });
        
        if (items.length === 0) {
            this.ui.showMessage('アイテムを持っていません。', null);
            return;
        }
        
        this.ui.showSubMenu(items, (id) => {
            this.ui.hideSubMenu();
            if (this.battle.selectItem(id)) {
                setTimeout(() => this.processBattleMessages(), 500);
            }
        });
    }

    // 戦闘終了
    endBattle() {
        this.ui.hideBattleScreen();
        this.state = 'field';
        
        if (this.battle.result === 'victory') {
            this.audio.playBGM('victory');
            setTimeout(() => {
                this.audio.playBGM(this.map.currentMap.name === 'dungeon' ? 'dungeon' : 'field');
            }, 3000);
        } else if (this.battle.result === 'defeat') {
            this.audio.playBGM('title');
            this.showMessage('ゲームオーバー...', () => {
                this.map.loadMap('village');
                this.audio.playBGM('field');
            });
        } else {
            this.audio.playBGM(this.map.currentMap.name === 'dungeon' ? 'dungeon' : 'field');
        }
    }

    // ゲームループ
    loop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((t) => this.loop(t));
    }

    // 更新処理
    update(deltaTime) {
        if (this.state === 'field') {
            this.player.update(deltaTime);
            
            // カメラ更新
            this.map.updateCamera(
                this.player.x + (this.player.moving ? (this.player.targetX - this.player.x) * this.player.moveProgress : 0),
                this.player.y + (this.player.moving ? (this.player.targetY - this.player.y) * this.player.moveProgress : 0),
                this.canvas.width,
                this.canvas.height
            );
            
            // 移動完了時の処理
            if (!this.player.moving) {
                // マップ移動チェック
                const transition = this.map.checkTransition(this.player.x, this.player.y);
                if (transition) {
                    this.map.loadMap(transition.map);
                    this.player.x = transition.x;
                    this.player.y = transition.y;
                    this.player.data.map = transition.map;
                    this.audio.playBGM(transition.map === 'dungeon' ? 'dungeon' : 'field');
                }
                
                // エンカウントチェック
                const encounter = this.map.checkEncounter(this.player.x, this.player.y);
                if (encounter) {
                    this.startBattle(encounter);
                }
            }
            
            // UI更新
            this.ui.updateStatus(this.player);
        }
    }

    // 描画処理
    render() {
        // 画面クリア
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.state === 'battle') {
            // 戦闘画面描画
            this.battle.render(this.ctx, this.canvas.width, this.canvas.height);
        } else if (this.map.currentMap) {
            // マップ描画
            this.map.render(this.ctx, this.canvas.width, this.canvas.height);
            
            // プレイヤー描画
            this.player.render(this.ctx, this.map.camera.x, this.map.camera.y);
        }
    }
}

// グローバルに公開
window.Game = Game;
