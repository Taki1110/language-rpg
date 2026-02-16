/**
 * UI管理システム
 */

class UI {
    constructor() {
        this.elements = {};
        this.messageCallback = null;
        this.commandCallback = null;
        this.visible = false;
    }

    // 初期化
    init() {
        // UI要素の取得
        this.elements = {
            messageWindow: document.getElementById('message-window'),
            messageText: document.getElementById('message-text'),
            messageArrow: document.getElementById('message-arrow'),
            commandMenu: document.getElementById('command-menu'),
            subMenu: document.getElementById('sub-menu'),
            statusPanel: document.getElementById('status-panel'),
            battleScreen: document.getElementById('battle-screen'),
            vocabularyBook: document.getElementById('vocabulary-book'),
            titleScreen: document.getElementById('title-screen'),
            virtualController: document.getElementById('virtual-controller')
        };

        // ステータス要素
        this.statusElements = {
            hp: document.getElementById('status-hp'),
            mp: document.getElementById('status-mp'),
            lv: document.getElementById('status-lv'),
            enLv: document.getElementById('status-en-lv'),
            cnLv: document.getElementById('status-cn-lv')
        };

        this.setupEventListeners();
    }

    // イベントリスナー設定
    setupEventListeners() {
        // メッセージウィンドウクリック
        if (this.elements.messageWindow) {
            this.elements.messageWindow.addEventListener('click', () => {
                if (this.messageCallback) {
                    this.messageCallback();
                }
            });
        }

        // タイトルメニュー
        const titleItems = document.querySelectorAll('.title-item');
        titleItems.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                if (this.commandCallback) {
                    this.commandCallback('title', action);
                }
            });
        });

        // バーチャルコントローラー
        this.setupVirtualController();

        // 単語帳
        const closeVocab = document.getElementById('close-vocab');
        if (closeVocab) {
            closeVocab.addEventListener('click', () => {
                this.hideVocabularyBook();
            });
        }

        // 単語帳タブ
        const vocabTabs = document.querySelectorAll('.vocab-tab');
        vocabTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                vocabTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.updateVocabularyList(tab.dataset.lang);
            });
        });
    }

    // バーチャルコントローラー設定
    setupVirtualController() {
        const dPad = document.getElementById('d-pad');
        const btnA = document.getElementById('btn-a');
        const btnB = document.getElementById('btn-b');

        if (!dPad || !btnA || !btnB) return;

        // 方向キー
        const dButtons = dPad.querySelectorAll('.d-btn');
        dButtons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const dir = btn.dataset.dir;
                if (this.commandCallback) {
                    this.commandCallback('dpad', dir);
                }
            });
            btn.addEventListener('mousedown', (e) => {
                const dir = btn.dataset.dir;
                if (this.commandCallback) {
                    this.commandCallback('dpad', dir);
                }
            });
        });

        // Aボタン（決定）
        btnA.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.commandCallback) {
                this.commandCallback('button', 'a');
            }
        });
        btnA.addEventListener('mousedown', () => {
            if (this.commandCallback) {
                this.commandCallback('button', 'a');
            }
        });

        // Bボタン（キャンセル）
        btnB.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.commandCallback) {
                this.commandCallback('button', 'b');
            }
        });
        btnB.addEventListener('mousedown', () => {
            if (this.commandCallback) {
                this.commandCallback('button', 'b');
            }
        });
    }

    // メッセージ表示
    showMessage(text, callback) {
        if (!this.elements.messageWindow || !this.elements.messageText) return;

        this.elements.messageText.textContent = text;
        this.elements.messageWindow.classList.remove('hidden');
        this.messageCallback = callback;
        
        // 矢印アニメーション
        if (this.elements.messageArrow) {
            this.elements.messageArrow.style.display = callback ? 'block' : 'none';
        }
    }

    // メッセージ非表示
    hideMessage() {
        if (this.elements.messageWindow) {
            this.elements.messageWindow.classList.add('hidden');
        }
        this.messageCallback = null;
    }

    // コマンドメニュー表示
    showCommandMenu(commands, callback) {
        if (!this.elements.commandMenu) return;

        const menuWindow = this.elements.commandMenu.querySelector('.menu-window');
        if (!menuWindow) return;

        menuWindow.innerHTML = '';
        commands.forEach((cmd, index) => {
            const item = document.createElement('div');
            item.className = 'menu-item' + (index === 0 ? ' selected' : '');
            item.dataset.cmd = cmd.id;
            item.textContent = cmd.name;
            item.addEventListener('click', () => {
                if (callback) callback(cmd.id);
            });
            menuWindow.appendChild(item);
        });

        this.elements.commandMenu.classList.remove('hidden');
    }

    // コマンドメニュー非表示
    hideCommandMenu() {
        if (this.elements.commandMenu) {
            this.elements.commandMenu.classList.add('hidden');
        }
    }

    // サブメニュー表示
    showSubMenu(items, callback) {
        if (!this.elements.subMenu) return;

        const menuWindow = this.elements.subMenu.querySelector('.menu-window');
        if (!menuWindow) return;

        menuWindow.innerHTML = '';
        items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'menu-item' + (index === 0 ? ' selected' : '');
            div.dataset.id = item.id;
            div.textContent = item.name;
            div.addEventListener('click', () => {
                if (callback) callback(item.id);
            });
            menuWindow.appendChild(div);
        });

        this.elements.subMenu.classList.remove('hidden');
    }

    // サブメニュー非表示
    hideSubMenu() {
        if (this.elements.subMenu) {
            this.elements.subMenu.classList.add('hidden');
        }
    }

    // ステータス更新
    updateStatus(player) {
        if (!player || !this.statusElements) return;

        if (this.statusElements.hp) {
            this.statusElements.hp.textContent = `${player.data.hp}/${player.data.maxHp}`;
        }
        if (this.statusElements.mp) {
            this.statusElements.mp.textContent = `${player.data.mp}/${player.data.maxMp}`;
        }
        if (this.statusElements.lv) {
            this.statusElements.lv.textContent = player.data.level;
        }
        if (this.statusElements.enLv) {
            this.statusElements.enLv.textContent = player.data.englishLevel;
        }
        if (this.statusElements.cnLv) {
            this.statusElements.cnLv.textContent = player.data.chineseLevel;
        }
    }

    // ステータスパネル表示
    showStatusPanel() {
        if (this.elements.statusPanel) {
            this.elements.statusPanel.classList.remove('hidden');
        }
    }

    // ステータスパネル非表示
    hideStatusPanel() {
        if (this.elements.statusPanel) {
            this.elements.statusPanel.classList.add('hidden');
        }
    }

    // 戦闘画面表示
    showBattleScreen() {
        if (this.elements.battleScreen) {
            this.elements.battleScreen.classList.remove('hidden');
        }
    }

    // 戦闘画面非表示
    hideBattleScreen() {
        if (this.elements.battleScreen) {
            this.elements.battleScreen.classList.add('hidden');
        }
    }

    // バトルコマンド設定
    setupBattleCommands(callback) {
        const battleCommands = document.querySelectorAll('.battle-menu-item');
        battleCommands.forEach(cmd => {
            cmd.addEventListener('click', () => {
                const command = cmd.dataset.cmd;
                if (callback) callback(command);
            });
        });
    }

    // 単語帳表示
    showVocabularyBook() {
        if (this.elements.vocabularyBook) {
            this.elements.vocabularyBook.classList.remove('hidden');
            this.updateVocabularyList('en');
        }
    }

    // 単語帳非表示
    hideVocabularyBook() {
        if (this.elements.vocabularyBook) {
            this.elements.vocabularyBook.classList.add('hidden');
        }
    }

    // 単語リスト更新
    updateVocabularyList(lang) {
        const list = document.getElementById('vocab-list');
        if (!list) return;

        list.innerHTML = '';
        const vocabList = GameData.vocabulary[lang];
        
        vocabList.forEach(vocab => {
            const item = document.createElement('div');
            item.className = 'vocab-item';
            
            const wordSpan = document.createElement('span');
            wordSpan.className = 'vocab-word';
            wordSpan.textContent = lang === 'en' ? vocab.word : `${vocab.word} (${vocab.pinyin})`;
            
            const meaningSpan = document.createElement('span');
            meaningSpan.className = 'vocab-meaning';
            meaningSpan.textContent = vocab.learned ? vocab.meaning : '？？？';
            
            if (!vocab.learned) {
                item.style.opacity = '0.5';
            }
            
            item.appendChild(wordSpan);
            item.appendChild(meaningSpan);
            list.appendChild(item);
        });
    }

    // タイトル画面表示
    showTitleScreen() {
        if (this.elements.titleScreen) {
            this.elements.titleScreen.classList.remove('hidden');
        }
    }

    // タイトル画面非表示
    hideTitleScreen() {
        if (this.elements.titleScreen) {
            this.elements.titleScreen.classList.add('hidden');
        }
    }

    // バーチャルコントローラー表示
    showVirtualController() {
        if (this.elements.virtualController) {
            this.elements.virtualController.classList.remove('hidden');
        }
    }

    // バーチャルコントローラー非表示
    hideVirtualController() {
        if (this.elements.virtualController) {
            this.elements.virtualController.classList.add('hidden');
        }
    }

    // レベルアップエフェクト
    showLevelUpEffect(text) {
        const effect = document.createElement('div');
        effect.className = 'level-up-effect';
        effect.textContent = text;
        document.body.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 2000);
    }

    // ダメージ表示
    showDamage(x, y, damage, isPlayer = false) {
        const damageEl = document.createElement('div');
        damageEl.className = 'damage-number';
        damageEl.textContent = damage;
        damageEl.style.left = x + 'px';
        damageEl.style.top = y + 'px';
        damageEl.style.color = isPlayer ? '#ef4444' : '#fff';
        document.body.appendChild(damageEl);
        
        setTimeout(() => {
            damageEl.remove();
        }, 1000);
    }

    // コマンドコールバック設定
    onCommand(callback) {
        this.commandCallback = callback;
    }

    // キーボードナビゲーション
    handleKeyNavigation(key) {
        const activeMenu = document.querySelector('.menu-window:not(.hidden)');
        if (!activeMenu) return;

        const items = activeMenu.querySelectorAll('.menu-item, .battle-menu-item');
        const selected = activeMenu.querySelector('.selected');
        let index = Array.from(items).indexOf(selected);

        if (key === 'up') {
            index = Math.max(0, index - 1);
        } else if (key === 'down') {
            index = Math.min(items.length - 1, index + 1);
        } else if (key === 'confirm') {
            if (selected) {
                selected.click();
            }
        }

        items.forEach((item, i) => {
            item.classList.toggle('selected', i === index);
        });
    }
}

// グローバルに公開
window.UI = UI;
