/* ============================================
   語源の旅人 - メインゲームシステム
   ゲームの中核ロジック、セーブ/ロード、UI管理
   ============================================ */

class Game {
    constructor() {
        this.player = null;
        this.currentArea = 'forest_start';
        this.inventory = null;
        this.battleSystem = null;
        this.storySystem = null;
        this.currentView = 'exploration';
        this.gold = 0;
        this.settings = {
            bgmVolume: 50,
            seVolume: 70,
            textSpeed: 'normal',
            animation: true
        };
        this.tutorialStep = 0;
        this.tutorialActive = false;
    }

    // ============================================
    // 初期化
    // ============================================

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.checkSaveData();
        this.showScreen('title-screen');
    }

    setupEventListeners() {
        // タイトル画面
        document.getElementById('btn-new-game')?.addEventListener('click', () => this.startNewGame());
        document.getElementById('btn-continue')?.addEventListener('click', () => this.loadGame());
        document.getElementById('btn-settings')?.addEventListener('click', () => this.showScreen('settings-screen'));
        document.getElementById('btn-credits')?.addEventListener('click', () => this.showScreen('credits-screen'));

        // クラス選択
        document.querySelectorAll('.class-card').forEach(card => {
            card.addEventListener('click', () => this.selectClass(card.dataset.class));
        });
        document.getElementById('btn-confirm-class')?.addEventListener('click', () => this.confirmClass());
        document.getElementById('btn-back-class')?.addEventListener('click', () => this.showScreen('title-screen'));

        // ゲーム画面
        document.getElementById('btn-menu')?.addEventListener('click', () => this.toggleMenu());
        document.getElementById('btn-save')?.addEventListener('click', () => this.openSaveScreen());
        
        // 探索アクション
        document.getElementById('btn-explore')?.addEventListener('click', () => this.explore());
        document.getElementById('btn-battle')?.addEventListener('click', () => this.startRandomBattle());
        document.getElementById('btn-talk')?.addEventListener('click', () => this.talkToNPC());

        // 移動
        ['north', 'south', 'east', 'west'].forEach(dir => {
            document.getElementById(`btn-move-${dir}`)?.addEventListener('click', () => this.move(dir));
        });

        // バトルアクション
        document.getElementById('btn-attack-en')?.addEventListener('click', () => this.battleAction('attack_en'));
        document.getElementById('btn-attack-cn')?.addEventListener('click', () => this.battleAction('attack_cn'));
        document.getElementById('btn-skill')?.addEventListener('click', () => this.openSkillModal());
        document.getElementById('btn-item')?.addEventListener('click', () => this.openItemModal());
        document.getElementById('btn-defend')?.addEventListener('click', () => this.battleAction('defend'));
        document.getElementById('btn-escape')?.addEventListener('click', () => this.battleAction('escape'));

        // フッターナビ
        document.querySelectorAll('.footer-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showView(btn.dataset.view));
        });

        // メニュー
        document.getElementById('menu-close')?.addEventListener('click', () => this.toggleMenu());
        document.getElementById('menu-title')?.addEventListener('click', () => this.returnToTitle());

        // 設定
        document.getElementById('btn-back-settings')?.addEventListener('click', () => {
            this.saveSettings();
            this.showScreen('title-screen');
        });

        // クレジット
        document.getElementById('btn-back-credits')?.addEventListener('click', () => this.showScreen('title-screen'));

        // チュートリアル
        document.getElementById('tutorial-next')?.addEventListener('click', () => this.nextTutorial());
        document.getElementById('tutorial-skip')?.addEventListener('click', () => this.skipTutorial());

        // キーボードショートカット
        document.addEventListener('keydown', (e) => this.handleKeyInput(e));
    }

    // ============================================
    // ゲーム開始
    // ============================================

    startNewGame() {
        this.showScreen('class-select-screen');
        this.selectedClass = null;
        document.getElementById('btn-confirm-class').disabled = true;
        document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
    }

    selectClass(classId) {
        this.selectedClass = classId;
        document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
        document.querySelector(`.class-card[data-class="${classId}"]`)?.classList.add('selected');
        document.getElementById('btn-confirm-class').disabled = false;
    }

    confirmClass() {
        if (!this.selectedClass) return;

        // プレイヤー初期化
        const classData = GameData.classes[this.selectedClass];
        this.player = {
            name: '旅人',
            class: this.selectedClass,
            className: classData.name,
            level: 1,
            exp: 0,
            maxHp: Math.floor(100 * classData.stats.hpMultiplier),
            currentHp: Math.floor(100 * classData.stats.hpMultiplier),
            maxMp: Math.floor(50 * classData.stats.mpMultiplier),
            currentMp: Math.floor(50 * classData.stats.mpMultiplier),
            attack: 10,
            defense: 5,
            speed: 10,
            enBonus: classData.stats.enBonus || 0,
            cnBonus: classData.stats.cnBonus || 0,
            skillPoints: 0,
            unlockedSkills: []
        };

        this.currentArea = 'forest_start';
        this.gold = 100;
        this.inventory = new Inventory();
        this.battleSystem = new BattleSystem(this);
        this.storySystem = new StorySystem(this);

        // 初期アイテム
        this.inventory.addItem('potion_small', 3);
        this.inventory.addItem('ether_small', 2);

        // ゲーム開始
        this.showScreen('game-screen');
        this.showView('exploration');
        this.updatePlayerUI();
        this.updateAreaDisplay();
        this.startTutorial();

        this.showNotification('ゲーム開始！', 'success');
    }

    // ============================================
    // チュートリアル
    // ============================================

    startTutorial() {
        this.tutorialActive = true;
        this.tutorialStep = 0;
        this.showTutorialStep();
    }

    showTutorialStep() {
        const steps = [
            { title: 'ようこそ！', text: '「語源の旅人」へようこそ。この世界では言葉の力が魔法となります。' },
            { title: 'バトルシステム', text: '敵と遭遇すると、英語または中国語のクイズが出題されます。正解すると攻撃が成功します。' },
            { title: '探索', text: '「探索する」ボタンで新しい発見や戦闘が発生します。様々なエリアを冒険しましょう。' },
            { title: 'スキル', text: 'レベルアップするとスキルポイントが貰えます。スキルツリーで新しい能力を覚えられます。' },
            { title: 'さあ、冒険へ！', text: 'それでは、言葉の力を使って世界を救いましょう！' }
        ];

        if (this.tutorialStep >= steps.length) {
            this.skipTutorial();
            return;
        }

        const step = steps[this.tutorialStep];
        document.getElementById('tutorial-title').textContent = step.title;
        document.getElementById('tutorial-text').textContent = step.text;
        document.getElementById('tutorial-overlay').classList.remove('hidden');
    }

    nextTutorial() {
        this.tutorialStep++;
        this.showTutorialStep();
    }

    skipTutorial() {
        this.tutorialActive = false;
        document.getElementById('tutorial-overlay').classList.add('hidden');
    }

    // ============================================
    // 探索システム
    // ============================================

    explore() {
        const area = GameData.areas[this.currentArea];
        const roll = Math.random();

        if (roll < 0.4) {
            // 戦闘発生
            this.showNotification('魔物が現れた！', 'warning');
            this.startRandomBattle();
        } else if (roll < 0.7) {
            // アイテム発見
            const items = ['herb', 'magic_stone', 'potion_small'];
            const found = items[Math.floor(Math.random() * items.length)];
            this.inventory.addItem(found, 1);
            const itemName = GameData.items[found]?.name || found;
            this.showNotification(`${itemName}を見つけた！`, 'success');
        } else {
            // 何もなし
            this.showNotification('何も見つからなかった...', 'info');
        }
    }

    move(direction) {
        const area = GameData.areas[this.currentArea];
        const nextArea = area.connections[direction];

        if (!nextArea) {
            this.showNotification('その方向には行けない', 'error');
            return;
        }

        const targetArea = GameData.areas[nextArea];
        if (targetArea.requiredLevel && this.player.level < targetArea.requiredLevel) {
            this.showNotification(`レベル${targetArea.requiredLevel}以上が必要です`, 'warning');
            return;
        }

        this.currentArea = nextArea;
        this.updateAreaDisplay();
        this.showNotification(`${targetArea.name}に到着！`, 'success');

        // クエスト進行チェック
        this.storySystem.updateQuestProgress('move', 1);
    }

    updateAreaDisplay() {
        const area = GameData.areas[this.currentArea];
        document.getElementById('area-name').textContent = area.name;
        document.getElementById('area-desc').textContent = area.description;
        document.getElementById('area-visual').textContent = area.icon;

        // 移動ボタンの有効/無効
        ['north', 'south', 'east', 'west'].forEach(dir => {
            const btn = document.getElementById(`btn-move-${dir}`);
            if (btn) {
                btn.disabled = !area.connections[dir];
            }
        });
    }

    talkToNPC() {
        const area = GameData.areas[this.currentArea];
        if (area.npcs && area.npcs.length > 0) {
            // 最初のNPCと会話
            this.storySystem.startDialogue(area.npcs[0]);
        } else {
            this.showNotification('ここには話せる相手がいない', 'info');
        }
    }

    // ============================================
    // バトルシステム
    // ============================================

    startRandomBattle() {
        const area = GameData.areas[this.currentArea];
        if (!area.enemies || area.enemies.length === 0) {
            this.showNotification('このエリアには敵がいない', 'info');
            return;
        }

        const enemyId = area.enemies[Math.floor(Math.random() * area.enemies.length)];
        this.startBattle(enemyId);
    }

    startBattle(enemyId) {
        if (this.battleSystem.startBattle(enemyId)) {
            this.showView('battle');
        }
    }

    battleAction(action) {
        this.battleSystem.playerAction(action);
    }

    onBattleEnd(result) {
        if (result === 'victory') {
            this.showView('exploration');
        } else if (result === 'defeat') {
            this.showNotification('敗北した...', 'error');
            // 復活処理
            this.player.currentHp = Math.floor(this.player.maxHp * 0.5);
            this.player.currentMp = Math.floor(this.player.maxMp * 0.5);
            this.currentArea = 'village_home';
            this.updateAreaDisplay();
            this.showView('exploration');
        } else if (result === 'escape') {
            this.showView('exploration');
        }
        this.updatePlayerUI();
    }

    onBossDefeated(bossId) {
        this.showNotification('ボスを倒した！', 'success');
        // ボス撃破時の特別処理
    }

    // ============================================
    // クイズシステム
    // ============================================

    startQuiz(language, callback) {
        const level = this.getPlayerWordLevel();
        const word = VocabularyData.getRandomWords(1, level)[0];
        
        if (!word) {
            callback(true); // 単語がない場合は正解扱い
            return;
        }

        const options = VocabularyData.generateQuizOptions(word, 4, level);
        
        // クイズUI表示
        document.getElementById('quiz-type').textContent = language === 'english' ? '英語→日本語' : '中国語→日本語';
        document.getElementById('quiz-difficulty').textContent = level === 'beginner' ? '初級' : level === 'intermediate' ? '中級' : '上級';
        document.getElementById('quiz-word').textContent = language === 'english' ? word.en : word.cn;
        document.getElementById('quiz-hint').textContent = `ヒント: ${word.hint}`;

        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = '';

        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = option.jp;
            btn.onclick = () => {
                const correct = option.jp === word.jp;
                btn.classList.add(correct ? 'correct' : 'wrong');
                
                // 正解/不正解のエフェクト
                if (correct) {
                    this.showNotification('正解！', 'success');
                } else {
                    this.showNotification('不正解...', 'error');
                }

                setTimeout(() => {
                    this.showView('battle');
                    callback(correct);
                }, 1000);
            };
            optionsContainer.appendChild(btn);
        });

        this.showView('quiz');

        // タイマー
        let timeLeft = 100;
        const timerBar = document.getElementById('timer-bar');
        const timerInterval = setInterval(() => {
            timeLeft -= 2;
            if (timerBar) timerBar.style.width = `${timeLeft}%`;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                this.showView('battle');
                callback(false);
            }
        }, 100);
    }

    getPlayerWordLevel() {
        if (this.player.level <= 5) return 'beginner';
        if (this.player.level <= 15) return 'intermediate';
        return 'advanced';
    }

    // ============================================
    // プレイヤー成長
    // ============================================

    gainExp(amount) {
        this.player.exp += amount;
        const required = GameData.expTable.getRequiredExp(this.player.level);

        if (this.player.exp >= required) {
            this.levelUp();
        }
        this.updatePlayerUI();
    }

    levelUp() {
        this.player.level++;
        this.player.exp = 0;
        this.player.skillPoints += 2;

        // ステータス上昇
        this.player.maxHp += 10;
        this.player.currentHp = this.player.maxHp;
        this.player.maxMp += 5;
        this.player.currentMp = this.player.maxMp;
        this.player.attack += 2;
        this.player.defense += 1;
        this.player.speed += 1;

        this.showNotification(`レベルアップ！ Lv.${this.player.level}`, 'success');
        this.showLevelUpEffect();
    }

    gainGold(amount) {
        this.gold += amount;
        this.updatePlayerUI();
    }

    // ============================================
    // UI管理
    // ============================================

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId)?.classList.add('active');
    }

    showView(viewId) {
        this.currentView = viewId;
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(`${viewId}-view`)?.classList.add('active');

        // フッターボタンの更新
        document.querySelectorAll('.footer-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewId);
        });

        // 特定ビューの初期化
        if (viewId === 'quest') {
            this.storySystem.updateQuestUI();
        } else if (viewId === 'inventory') {
            this.inventory.updateUI();
        } else if (viewId === 'skill-tree') {
            this.updateSkillTreeUI();
        }
    }

    updatePlayerUI() {
        if (!this.player) return;

        // 基本情報
        document.getElementById('player-name').textContent = this.player.name;
        document.getElementById('player-class').textContent = this.player.className;
        document.getElementById('player-level').textContent = this.player.level;

        // HP
        document.getElementById('hp-current').textContent = this.player.currentHp;
        document.getElementById('hp-max').textContent = this.player.maxHp;
        document.getElementById('hp-fill').style.width = `${(this.player.currentHp / this.player.maxHp) * 100}%`;

        // MP
        document.getElementById('mp-current').textContent = this.player.currentMp;
        document.getElementById('mp-max').textContent = this.player.maxMp;
        document.getElementById('mp-fill').style.width = `${(this.player.currentMp / this.player.maxMp) * 100}%`;

        // EXP
        const requiredExp = GameData.expTable.getRequiredExp(this.player.level);
        document.getElementById('exp-current').textContent = this.player.exp;
        document.getElementById('exp-max').textContent = requiredExp;
        document.getElementById('exp-fill').style.width = `${(this.player.exp / requiredExp) * 100}%`;
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-area');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        container.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }

    showLevelUpEffect() {
        // レベルアップエフェクト表示
        const effect = document.createElement('div');
        effect.className = 'level-up-effect';
        effect.innerHTML = `
            <h2>LEVEL UP!</h2>
            <div class="level-number">${this.player.level}</div>
        `;
        document.body.appendChild(effect);

        const light = document.createElement('div');
        light.className = 'level-up-light';
        document.body.appendChild(light);

        setTimeout(() => {
            effect.remove();
            light.remove();
        }, 2000);
    }

    // ============================================
    // セーブ/ロード
    // ============================================

    checkSaveData() {
        const hasSave = localStorage.getItem('ety_save_0') !== null;
        document.getElementById('btn-continue').disabled = !hasSave;
    }

    saveGame(slot = 0) {
        const saveData = {
            player: this.player,
            currentArea: this.currentArea,
            gold: this.gold,
            inventory: this.inventory?.getSaveData(),
            story: this.storySystem?.getSaveData(),
            timestamp: Date.now()
        };

        localStorage.setItem(`ety_save_${slot}`, JSON.stringify(saveData));
        this.showNotification('セーブ完了！', 'success');
    }

    loadGame(slot = 0) {
        const saveData = localStorage.getItem(`ety_save_${slot}`);
        if (!saveData) {
            this.showNotification('セーブデータがありません', 'error');
            return;
        }

        try {
            const data = JSON.parse(saveData);
            
            this.player = data.player;
            this.currentArea = data.currentArea;
            this.gold = data.gold;
            
            this.inventory = new Inventory();
            if (data.inventory) this.inventory.loadSaveData(data.inventory);
            
            this.battleSystem = new BattleSystem(this);
            
            this.storySystem = new StorySystem(this);
            if (data.story) this.storySystem.loadSaveData(data.story);

            this.showScreen('game-screen');
            this.showView('exploration');
            this.updatePlayerUI();
            this.updateAreaDisplay();
            
            this.showNotification('ロード完了！', 'success');
        } catch (e) {
            console.error('Load error:', e);
            this.showNotification('ロードに失敗しました', 'error');
        }
    }

    openSaveScreen() {
        this.showScreen('save-screen');
        this.updateSaveSlots();
    }

    updateSaveSlots() {
        const container = document.getElementById('save-slots');
        container.innerHTML = '';

        for (let i = 0; i < 3; i++) {
            const saveData = localStorage.getItem(`ety_save_${i}`);
            const slot = document.createElement('div');
            slot.className = `save-slot ${!saveData ? 'empty' : ''}`;
            
            if (saveData) {
                const data = JSON.parse(saveData);
                const date = new Date(data.timestamp).toLocaleString();
                slot.innerHTML = `
                    <h4>セーブデータ ${i + 1}</h4>
                    <p>${data.player.name} Lv.${data.player.level}</p>
                    <p>${date}</p>
                `;
            } else {
                slot.innerHTML = `
                    <h4>セーブデータ ${i + 1}</h4>
                    <p>空のスロット</p>
                `;
            }
            
            slot.onclick = () => this.selectSaveSlot(i);
            container.appendChild(slot);
        }
    }

    selectSaveSlot(slot) {
        document.querySelectorAll('.save-slot').forEach(s => s.classList.remove('selected'));
        document.querySelectorAll('.save-slot')[slot]?.classList.add('selected');
        this.selectedSaveSlot = slot;
    }

    // ============================================
    // 設定
    // ============================================

    loadSettings() {
        const saved = localStorage.getItem('ety_settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }

        // UIに反映
        document.getElementById('bgm-volume').value = this.settings.bgmVolume;
        document.getElementById('se-volume').value = this.settings.seVolume;
        document.getElementById('text-speed').value = this.settings.textSpeed;
        document.getElementById('animation-setting').value = this.settings.animation ? 'on' : 'off';
    }

    saveSettings() {
        this.settings.bgmVolume = parseInt(document.getElementById('bgm-volume').value);
        this.settings.seVolume = parseInt(document.getElementById('se-volume').value);
        this.settings.textSpeed = document.getElementById('text-speed').value;
        this.settings.animation = document.getElementById('animation-setting').value === 'on';

        localStorage.setItem('ety_settings', JSON.stringify(this.settings));
    }

    // ============================================
    // ユーティリティ
    // ============================================

    toggleMenu() {
        const modal = document.getElementById('menu-modal');
        modal.classList.toggle('active');
    }

    returnToTitle() {
        if (confirm('タイトルに戻りますか？セーブしていない進行状況は失われます。')) {
            this.showScreen('title-screen');
            this.toggleMenu();
        }
    }

    handleKeyInput(e) {
        // ESCキーでメニュー
        if (e.key === 'Escape') {
            this.toggleMenu();
        }
    }

    unlockArea(areaId) {
        this.showNotification(`新しいエリアが解放されました！`, 'success');
    }
}

// ============================================
// インベントリクラス
// ============================================

class Inventory {
    constructor() {
        this.items = {};
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };
    }

    addItem(itemId, count = 1) {
        if (!this.items[itemId]) {
            this.items[itemId] = 0;
        }
        this.items[itemId] += count;
    }

    removeItem(itemId, count = 1) {
        if (!this.items[itemId]) return false;
        
        this.items[itemId] -= count;
        if (this.items[itemId] <= 0) {
            delete this.items[itemId];
        }
        return true;
    }

    getItem(itemId) {
        return {
            id: itemId,
            count: this.items[itemId] || 0,
            ...GameData.items[itemId]
        };
    }

    getAllItems() {
        return Object.entries(this.items).map(([id, count]) => ({
            id,
            count,
            ...GameData.items[id]
        }));
    }

    updateUI() {
        const grid = document.getElementById('inventory-grid');
        if (!grid) return;

        const items = this.getAllItems();
        grid.innerHTML = items.map(item => `
            <div class="inventory-item" data-item="${item.id}">
                <span class="item-icon">${item.icon}</span>
                <span class="item-count">${item.count}</span>
            </div>
        `).join('');

        // アイテムクリックイベント
        grid.querySelectorAll('.inventory-item').forEach(el => {
            el.addEventListener('click', () => this.showItemDetail(el.dataset.item));
        });
    }

    showItemDetail(itemId) {
        const item = this.getItem(itemId);
        const detail = document.getElementById('item-detail');
        if (detail) {
            detail.innerHTML = `
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p>所持数: ${item.count}</p>
            `;
        }
    }

    getSaveData() {
        return {
            items: this.items,
            equipment: this.equipment
        };
    }

    loadSaveData(data) {
        this.items = data.items || {};
        this.equipment = data.equipment || { weapon: null, armor: null, accessory: null };
    }
}

// ============================================
// ゲーム初期化
// ============================================

let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    game.init();
});
