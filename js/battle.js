/**
 * 戦闘システム
 */

class BattleSystem {
    constructor() {
        this.active = false;
        this.player = null;
        this.enemy = null;
        this.turn = 'player'; // 'player' or 'enemy'
        this.command = null;
        this.selectedSkill = null;
        this.selectedItem = null;
        this.messageQueue = [];
        this.processing = false;
        this.result = null;
        this.escapeAttempts = 0;
        
        // UI参照
        this.ui = null;
    }

    // 戦闘開始
    start(player, enemyId) {
        this.active = true;
        this.player = player;
        this.enemy = { ...GameData.enemies[enemyId] };
        this.turn = 'player';
        this.command = null;
        this.messageQueue = [];
        this.processing = false;
        this.result = null;
        this.escapeAttempts = 0;
        
        // 敵のスプライト設定
        this.enemy.sprite = this.getEnemySprite(enemyId);
        
        // 開始メッセージ
        this.queueMessage(`${this.enemy.name}があらわれた！`);
        this.queueMessage(`弱点: ${this.getWeaknessText(this.enemy.weakness)}`);
        
        return true;
    }

    // 敵スプライト取得
    getEnemySprite(enemyId) {
        const sprites = {
            'slime': { emoji: '🟢', color: '#4ade80' },
            'goblin': { emoji: '👺', color: '#22c55e' },
            'wolf': { emoji: '🐺', color: '#6b7280' },
            'skeleton': { emoji: '💀', color: '#9ca3af' },
            'orc': { emoji: '👹', color: '#16a34a' },
            'dragon': { emoji: '🐲', color: '#dc2626' }
        };
        return sprites[enemyId] || { emoji: '👾', color: '#888' };
    }

    // 弱点テキスト
    getWeaknessText(weakness) {
        const texts = {
            'en': '英語',
            'cn': '中国語',
            'both': '英語・中国語両方'
        };
        return texts[weakness] || 'なし';
    }

    // メッセージをキューに追加
    queueMessage(text) {
        this.messageQueue.push(text);
    }

    // 次のメッセージを取得
    getNextMessage() {
        return this.messageQueue.shift() || null;
    }

    // コマンド選択
    selectCommand(cmd) {
        if (this.processing || this.turn !== 'player') return false;
        
        this.command = cmd;
        
        switch (cmd) {
            case 'attack':
                this.executeAttack();
                return true;
            case 'skill':
                return 'skill_select';
            case 'item':
                return 'item_select';
            case 'escape':
                this.tryEscape();
                return true;
        }
        
        return false;
    }

    // スキル選択
    selectSkill(skillId) {
        if (this.processing) return false;
        
        const skill = GameData.skills[skillId];
        if (!skill) return false;
        
        // MPチェック
        if (this.player.data.mp < skill.mp) {
            this.queueMessage('MPが足りない！');
            return false;
        }
        
        this.selectedSkill = skillId;
        this.executeSkill(skillId);
        return true;
    }

    // アイテム選択
    selectItem(itemId) {
        if (this.processing) return false;
        
        const item = GameData.items[itemId];
        if (!item) return false;
        
        this.selectedItem = itemId;
        this.executeItem(itemId);
        return true;
    }

    // 通常攻撃実行
    executeAttack() {
        this.processing = true;
        
        const damage = this.player.calculateDamage('attack', this.enemy);
        this.enemy.hp = Math.max(0, this.enemy.hp - damage);
        
        this.queueMessage(`${this.player.data.name}のこうげき！`);
        this.queueMessage(`${this.enemy.name}に${damage}のダメージ！`);
        
        // 弱点でなければ言語経験値少なめ
        if (this.enemy.weakness !== 'en') {
            this.player.gainEnglishExp(1);
        }
        if (this.enemy.weakness !== 'cn') {
            this.player.gainChineseExp(1);
        }
        
        this.checkBattleEnd();
        
        if (this.active) {
            setTimeout(() => this.enemyTurn(), 1000);
        }
    }

    // スキル実行
    executeSkill(skillId) {
        this.processing = true;
        
        const skill = GameData.skills[skillId];
        this.player.data.mp -= skill.mp;
        
        if (skill.type === 'magic' && skill.effect === 'heal') {
            // 回復魔法
            const healAmount = skill.power + this.player.data.int;
            const actualHeal = this.player.heal(healAmount);
            this.queueMessage(`${this.player.data.name}は${skill.name}をとなえた！`);
            this.queueMessage(`HPが${actualHeal}回復した！`);
        } else {
            // 攻撃スキル
            const damage = this.player.calculateDamage(skillId, this.enemy);
            this.enemy.hp = Math.max(0, this.enemy.hp - damage);
            
            this.queueMessage(`${this.player.data.name}は${skill.name}を使った！`);
            
            // 弱点チェック
            let isWeak = false;
            if (skill.language && this.enemy.weakness) {
                if (skill.language === this.enemy.weakness || 
                    skill.language === 'both' || 
                    this.enemy.weakness === 'both') {
                    isWeak = true;
                }
            }
            
            if (isWeak) {
                this.queueMessage(`弱点をついた！${this.enemy.name}に${damage}のダメージ！`);
                
                // 弱点言語の経験値UP
                if (skill.language === 'en' || skill.language === 'both') {
                    this.player.gainEnglishExp(5);
                    this.learnVocabulary('en');
                }
                if (skill.language === 'cn' || skill.language === 'both') {
                    this.player.gainChineseExp(5);
                    this.learnVocabulary('cn');
                }
            } else {
                this.queueMessage(`${this.enemy.name}に${damage}のダメージ！`);
            }
        }
        
        this.checkBattleEnd();
        
        if (this.active) {
            setTimeout(() => this.enemyTurn(), 1000);
        }
    }

    // アイテム実行
    executeItem(itemId) {
        this.processing = true;
        
        const result = this.player.useItem(itemId);
        
        if (result) {
            const item = GameData.items[itemId];
            this.queueMessage(`${this.player.data.name}は${item.name}を使った！`);
            
            if (result.type === 'heal') {
                this.queueMessage(`HPが${result.amount}回復した！`);
            } else if (result.type === 'mp') {
                this.queueMessage(`MPが${result.amount}回復した！`);
            }
        }
        
        setTimeout(() => this.enemyTurn(), 1000);
    }

    // 逃げる
    tryEscape() {
        this.processing = true;
        this.escapeAttempts++;
        
        // ボス戦は逃げられない
        if (this.enemy.boss) {
            this.queueMessage('逃げられない！');
            setTimeout(() => this.enemyTurn(), 1000);
            return;
        }
        
        // 逃げ成功率計算
        const baseRate = 0.5;
        const speedDiff = this.player.data.spd - this.enemy.spd;
        const escapeRate = Math.min(0.9, baseRate + speedDiff * 0.05 - this.escapeAttempts * 0.1);
        
        if (Math.random() < escapeRate) {
            this.queueMessage('うまく逃げ切れた！');
            this.result = 'escape';
            setTimeout(() => this.end(), 1000);
        } else {
            this.queueMessage('逃げられなかった！');
            setTimeout(() => this.enemyTurn(), 1000);
        }
    }

    // 敵のターン
    enemyTurn() {
        if (!this.active) return;
        
        this.turn = 'enemy';
        
        // 敵の行動選択
        const actions = ['attack'];
        if (this.enemy.mp >= 5) {
            actions.push('skill');
        }
        
        const action = actions[Math.floor(Math.random() * actions.length)];
        
        if (action === 'attack') {
            // 通常攻撃
            const damage = Math.max(1, this.enemy.str - this.player.data.def * 0.5);
            const actualDamage = this.player.takeDamage(damage);
            
            this.queueMessage(`${this.enemy.name}のこうげき！`);
            this.queueMessage(`${this.player.data.name}は${actualDamage}のダメージを受けた！`);
        } else {
            // 魔法攻撃（簡易版）
            const skillDamage = 15;
            this.enemy.mp -= 5;
            const actualDamage = this.player.takeDamage(skillDamage);
            
            this.queueMessage(`${this.enemy.name}は魔法をとなえた！`);
            this.queueMessage(`${this.player.data.name}は${actualDamage}のダメージを受けた！`);
        }
        
        // プレイヤー死亡チェック
        if (this.player.data.hp <= 0) {
            this.queueMessage(`${this.player.data.name}は力尽きた...`);
            this.result = 'defeat';
            setTimeout(() => this.end(), 1500);
        } else {
            this.turn = 'player';
            this.processing = false;
        }
    }

    // 戦闘終了チェック
    checkBattleEnd() {
        if (this.enemy.hp <= 0) {
            this.queueMessage(`${this.enemy.name}を倒した！`);
            
            // 経験値とゴールド
            this.player.gainExp(this.enemy.exp);
            this.queueMessage(`${this.enemy.exp}の経験値を得た！`);
            this.queueMessage(`${this.enemy.gold}ゴールドを手に入れた！`);
            
            this.result = 'victory';
            setTimeout(() => this.end(), 1500);
        }
    }

    // 単語を覚える
    learnVocabulary(lang) {
        const vocabList = GameData.vocabulary[lang];
        const unlearned = vocabList.filter(v => !v.learned);
        
        if (unlearned.length > 0 && Math.random() < 0.3) {
            const word = unlearned[Math.floor(Math.random() * unlearned.length)];
            word.learned = true;
            
            const wordText = lang === 'en' ? word.word : `${word.word}(${word.pinyin})`;
            this.queueMessage(`「${wordText}」を覚えた！`);
        }
    }

    // 戦闘終了
    end() {
        this.active = false;
        
        if (this.result === 'defeat') {
            // ゲームオーバー処理
            this.player.data.hp = 1;
            this.player.data.mp = 0;
            // 村に戻る
            this.player.data.map = 'village';
            this.player.data.x = 10;
            this.player.data.y = 10;
        }
        
        return this.result;
    }

    // 描画
    render(ctx, canvasWidth, canvasHeight) {
        if (!this.active) return;
        
        // 背景
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // 敵スプライト
        const enemyX = canvasWidth / 2;
        const enemyY = canvasHeight * 0.3;
        
        // 敵の円形背景
        ctx.fillStyle = 'rgba(233, 69, 96, 0.3)';
        ctx.beginPath();
        ctx.arc(enemyX, enemyY, 80, 0, Math.PI * 2);
        ctx.fill();
        
        // 敵絵文字
        ctx.font = '80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.enemy.sprite.emoji, enemyX, enemyY);
        
        // 敵名
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(this.enemy.name, enemyX, enemyY - 100);
        
        // 敵の外国語名
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText(`${this.enemy.nameEn} / ${this.enemy.nameCn}`, enemyX, enemyY - 75);
        
        // HPバー
        const barWidth = 200;
        const barHeight = 20;
        const barX = enemyX - barWidth / 2;
        const barY = enemyY + 60;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const hpPercent = this.enemy.hp / this.enemy.maxHp;
        ctx.fillStyle = hpPercent > 0.5 ? '#4ade80' : hpPercent > 0.25 ? '#fbbf24' : '#ef4444';
        ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // プレイヤースプライト（左下）
        const playerX = canvasWidth * 0.2;
        const playerY = canvasHeight * 0.6;
        
        ctx.fillStyle = '#533483';
        ctx.fillRect(playerX - 30, playerY - 30, 60, 60);
        ctx.fillStyle = '#7b68ee';
        ctx.fillRect(playerX - 20, playerY - 40, 40, 20);
        
        // プレイヤー名
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.player.data.name, playerX, playerY + 50);
    }
}

// グローバルに公開
window.BattleSystem = BattleSystem;
