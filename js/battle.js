/* ============================================
   語源の旅人 - バトルシステム
   ターン制バトル、スキル、アイテム使用
   ============================================ */

class BattleSystem {
    constructor(game) {
        this.game = game;
        this.player = null;
        this.enemy = null;
        this.isPlayerTurn = true;
        this.battleLog = [];
        this.battleActive = false;
        this.turnCount = 0;
        this.buffs = {
            player: [],
            enemy: []
        };
    }

    // バトル開始
    startBattle(enemyId) {
        // 敵データの取得
        const enemyData = this.getEnemyData(enemyId);
        if (!enemyData) {
            console.error('Enemy not found:', enemyId);
            return false;
        }

        // 敵の初期化
        this.enemy = {
            ...enemyData,
            currentHp: enemyData.hp,
            maxHp: enemyData.hp,
            currentPattern: enemyData.patterns[0],
            phase: 0
        };

        // プレイヤーの参照
        this.player = this.game.player;

        // バトル状態の初期化
        this.isPlayerTurn = this.player.speed >= this.enemy.speed;
        this.battleActive = true;
        this.turnCount = 0;
        this.buffs = { player: [], enemy: [] };
        this.battleLog = [];

        // バトル開始ログ
        this.addLog(`${this.enemy.name}が現れた！`);
        if (this.enemy.isBoss) {
            this.addLog('ボス戦開始！');
            this.game.showNotification('ボス戦開始！', 'warning');
        }

        // UI更新
        this.updateBattleUI();

        // 敵の先攻の場合
        if (!this.isPlayerTurn) {
            setTimeout(() => this.enemyTurn(), 1000);
        }

        return true;
    }

    // 敵データの取得
    getEnemyData(enemyId) {
        // EnemyDataから敵を検索
        if (typeof EnemyData !== 'undefined' && EnemyData[enemyId]) {
            return EnemyData[enemyId];
        }
        // フォールバック: 基本的な敵データ
        return this.getDefaultEnemy(enemyId);
    }

    // デフォルト敵データ
    getDefaultEnemy(enemyId) {
        const defaults = {
            slime: {
                id: 'slime',
                name: 'スライム',
                description: '言葉の力を失った存在',
                icon: '💧',
                level: 1,
                hp: 30,
                attack: 8,
                defense: 3,
                speed: 5,
                exp: 10,
                gold: 5,
                weakness: 'english',
                drops: []
            },
            goblin: {
                id: 'goblin',
                name: 'ゴブリン',
                description: '暗い森に潜む小さな魔物',
                icon: '👺',
                level: 3,
                hp: 50,
                attack: 15,
                defense: 8,
                speed: 10,
                exp: 18,
                gold: 12,
                weakness: 'chinese',
                drops: []
            }
        };
        return defaults[enemyId] || defaults.slime;
    }

    // プレイヤーのターン処理
    playerAction(action, data = null) {
        if (!this.battleActive || !this.isPlayerTurn) return false;

        switch (action) {
            case 'attack_en':
                return this.playerAttack('english');
            case 'attack_cn':
                return this.playerAttack('chinese');
            case 'skill':
                return this.playerUseSkill(data);
            case 'item':
                return this.playerUseItem(data);
            case 'defend':
                return this.playerDefend();
            case 'escape':
                return this.playerEscape();
            default:
                return false;
        }
    }

    // プレイヤーの攻撃
    playerAttack(language) {
        // クイズを開始
        this.game.startQuiz(language, (correct) => {
            if (correct) {
                // 正解: 攻撃成功
                const damage = this.calculatePlayerDamage(language);
                this.dealDamageToEnemy(damage);
                this.addLog(`${this.player.name}の${language === 'english' ? '英語' : '中国語'}攻撃！`);
                this.addLog(`${this.enemy.name}に${damage}のダメージ！`);
                
                // クリティカル判定
                if (Math.random() < 0.1) {
                    this.addLog('クリティカルヒット！');
                }
            } else {
                // 不正解: 攻撃失敗
                this.addLog(`${this.player.name}の攻撃は外れた！`);
            }

            // ターン終了
            this.endPlayerTurn();
        });

        return true;
    }

    // プレイヤーのダメージ計算
    calculatePlayerDamage(language) {
        let baseAttack = this.player.attack;
        
        // 言語ボーナス
        const languageBonus = language === 'english' ? 
            this.player.enBonus : this.player.cnBonus;
        baseAttack *= (1 + languageBonus);

        // 敵の弱点
        let weaknessMultiplier = 1;
        if (this.enemy.weakness === language) {
            weaknessMultiplier = 1.5;
        } else if (this.enemy.weakness === 'both') {
            weaknessMultiplier = 1.3;
        }

        // バフ効果
        const buffMultiplier = this.getBuffMultiplier('player', 'attack');

        // 最終ダメージ計算
        let damage = Math.floor(
            (baseAttack * weaknessMultiplier * buffMultiplier) - 
            (this.enemy.defense * 0.5)
        );

        // クリティカル判定
        if (Math.random() < 0.1) {
            damage = Math.floor(damage * 1.5);
        }

        // 最低ダメージ保証
        return Math.max(1, damage);
    }

    // スキル使用
    playerUseSkill(skillId) {
        const skill = GameData.skills[skillId];
        if (!skill) return false;

        // MPチェック
        if (this.player.currentMp < skill.mpCost) {
            this.addLog('MPが足りない！');
            return false;
        }

        // MP消費
        this.player.currentMp -= skill.mpCost;

        // スキル効果
        switch (skill.effect) {
            case 'damage':
                const damage = this.calculateSkillDamage(skill);
                this.dealDamageToEnemy(damage);
                this.addLog(`${skill.name}！ ${this.enemy.name}に${damage}のダメージ！`);
                break;
            case 'heal':
                const healAmount = this.healPlayer(skill.healAmount || 50);
                this.addLog(`${skill.name}！ HPが${healAmount}回復した！`);
                break;
            case 'buff':
                this.addBuff('player', skill.buffType, skill.buffValue, skill.duration);
                this.addLog(`${skill.name}！ ${this.getBuffName(skill.buffType)}が上昇！`);
                break;
            default:
                // 通常攻撃型スキル
                const skillDamage = this.calculateSkillDamage(skill);
                this.dealDamageToEnemy(skillDamage);
                this.addLog(`${skill.name}！ ${skillDamage}のダメージ！`);
        }

        this.updatePlayerUI();
        this.endPlayerTurn();
        return true;
    }

    // スキルダメージ計算
    calculateSkillDamage(skill) {
        let power = skill.power || 1.5;
        let baseDamage = this.player.attack * power;
        
        // 言語タイプによるボーナス
        if (skill.type === 'english') {
            baseDamage *= (1 + this.player.enBonus);
        } else if (skill.type === 'chinese') {
            baseDamage *= (1 + this.player.cnBonus);
        }

        return Math.max(1, Math.floor(baseDamage - this.enemy.defense * 0.3));
    }

    // アイテム使用
    playerUseItem(itemId) {
        const item = this.game.inventory.getItem(itemId);
        if (!item || item.count <= 0) {
            this.addLog('アイテムを持っていない！');
            return false;
        }

        // アイテム効果
        switch (item.effect.type) {
            case 'heal':
                const healAmount = item.effect.value === 'full' ? 
                    this.player.maxHp : item.effect.value;
                const actualHeal = this.healPlayer(healAmount);
                this.addLog(`${item.name}を使った！ HPが${actualHeal}回復！`);
                break;
            case 'restore_mp':
                const mpAmount = item.effect.value;
                const actualMp = this.restorePlayerMp(mpAmount);
                this.addLog(`${item.name}を使った！ MPが${actualMp}回復！`);
                break;
            case 'escape':
                this.addLog(`${item.name}を使って逃げ出した！`);
                this.endBattle('escape');
                return true;
            default:
                this.addLog(`${item.name}を使った！`);
        }

        // アイテム消費
        this.game.inventory.removeItem(itemId, 1);
        this.endPlayerTurn();
        return true;
    }

    // 防御
    playerDefend() {
        this.addBuff('player', 'defense', 0.5, 1);
        this.addLog(`${this.player.name}は防御姿勢をとった！`);
        this.endPlayerTurn();
        return true;
    }

    // 逃走
    playerEscape() {
        const escapeChance = 0.5 + (this.player.speed - this.enemy.speed) * 0.02;
        if (Math.random() < escapeChance) {
            this.addLog('逃げ切った！');
            this.endBattle('escape');
        } else {
            this.addLog('逃げられなかった！');
            this.endPlayerTurn();
        }
        return true;
    }

    // 敵にダメージ
    dealDamageToEnemy(damage) {
        this.enemy.currentHp -= damage;
        
        // ボスのフェーズチェック
        if (this.enemy.isBoss && this.enemy.phases) {
            const hpPercent = this.enemy.currentHp / this.enemy.maxHp;
            for (const phase of this.enemy.phases) {
                if (hpPercent <= phase.hpThreshold && this.enemy.phase < phase.hpThreshold) {
                    this.enemy.phase = phase.hpThreshold;
                    this.addLog(phase.message);
                    this.enemy.currentPattern = phase.pattern;
                }
            }
        }

        // 撃破チェック
        if (this.enemy.currentHp <= 0) {
            this.enemy.currentHp = 0;
            this.enemyDefeated();
        }

        this.updateEnemyUI();
    }

    // プレイヤーを回復
    healPlayer(amount) {
        const oldHp = this.player.currentHp;
        this.player.currentHp = Math.min(this.player.maxHp, this.player.currentHp + amount);
        this.updatePlayerUI();
        return this.player.currentHp - oldHp;
    }

    // プレイヤーのMP回復
    restorePlayerMp(amount) {
        const oldMp = this.player.currentMp;
        this.player.currentMp = Math.min(this.player.maxMp, this.player.currentMp + amount);
        this.updatePlayerUI();
        return this.player.currentMp - oldMp;
    }

    // プレイヤーターン終了
    endPlayerTurn() {
        this.isPlayerTurn = false;
        this.updateBattleUI();

        // バフのターン経過
        this.processBuffs('player');

        // 敵のターン
        if (this.battleActive) {
            setTimeout(() => this.enemyTurn(), 1000);
        }
    }

    // 敵のターン
    enemyTurn() {
        if (!this.battleActive) return;

        this.turnCount++;

        // 敵の行動パターンに基づく行動選択
        const action = this.selectEnemyAction();
        
        switch (action) {
            case 'attack':
                this.enemyAttack();
                break;
            case 'skill':
                this.enemySkill();
                break;
            case 'buff':
                this.enemyBuff();
                break;
            case 'heal':
                this.enemyHeal();
                break;
            default:
                this.enemyAttack();
        }

        // バフのターン経過
        this.processBuffs('enemy');

        // プレイヤーターン開始
        if (this.battleActive) {
            this.isPlayerTurn = true;
            this.addLog(`${this.player.name}のターン！`);
            this.updateBattleUI();
        }
    }

    // 敵の行動選択
    selectEnemyAction() {
        const pattern = this.enemy.currentPattern;
        const hpPercent = this.enemy.currentHp / this.enemy.maxHp;

        // HPが低い時は回復を優先
        if (hpPercent < 0.3 && Math.random() < 0.4) {
            return 'heal';
        }

        // パターンに基づく行動
        switch (pattern) {
            case 'aggressive':
                return Math.random() < 0.7 ? 'attack' : 'skill';
            case 'defensive':
                return Math.random() < 0.4 ? 'buff' : 'attack';
            case 'magic':
                return Math.random() < 0.6 ? 'skill' : 'attack';
            case 'heal':
                return hpPercent < 0.5 ? 'heal' : 'attack';
            default:
                return Math.random() < 0.8 ? 'attack' : 'skill';
        }
    }

    // 敵の攻撃
    enemyAttack() {
        const damage = this.calculateEnemyDamage();
        this.player.currentHp -= damage;
        this.addLog(`${this.enemy.name}の攻撃！`);
        this.addLog(`${this.player.name}に${damage}のダメージ！`);

        // プレイヤー撃破チェック
        if (this.player.currentHp <= 0) {
            this.player.currentHp = 0;
            this.playerDefeated();
        }

        this.updatePlayerUI();
    }

    // 敵のダメージ計算
    calculateEnemyDamage() {
        let baseDamage = this.enemy.attack;
        
        // プレイヤーの防御
        const defenseMultiplier = this.getBuffMultiplier('player', 'defense');
        const playerDefense = this.player.defense * defenseMultiplier;
        
        let damage = Math.floor(baseDamage - playerDefense * 0.5);
        
        // バリア効果
        const barrier = this.getBuffValue('player', 'barrier');
        if (barrier > 0) {
            damage = Math.max(0, damage - barrier);
            this.removeBuff('player', 'barrier');
            this.addLog('バリアがダメージを防いだ！');
        }

        return Math.max(1, damage);
    }

    // 敵のスキル
    enemySkill() {
        const damage = Math.floor(this.calculateEnemyDamage() * 1.3);
        this.player.currentHp -= damage;
        this.addLog(`${this.enemy.name}の特殊攻撃！`);
        this.addLog(`${this.player.name}に${damage}のダメージ！`);

        if (this.player.currentHp <= 0) {
            this.player.currentHp = 0;
            this.playerDefeated();
        }

        this.updatePlayerUI();
    }

    // 敵のバフ
    enemyBuff() {
        this.addBuff('enemy', 'attack', 0.2, 3);
        this.addLog(`${this.enemy.name}は力を溜めている！`);
    }

    // 敵の回復
    enemyHeal() {
        const healAmount = Math.floor(this.enemy.maxHp * 0.2);
        this.enemy.currentHp = Math.min(this.enemy.maxHp, this.enemy.currentHp + healAmount);
        this.addLog(`${this.enemy.name}は回復した！`);
        this.updateEnemyUI();
    }

    // 敵撃破
    enemyDefeated() {
        this.addLog(`${this.enemy.name}を倒した！`);
        
        // 経験値獲得
        const expBonus = this.getBuffMultiplier('player', 'exp');
        const expGain = Math.floor(this.enemy.exp * expBonus);
        this.game.gainExp(expGain);
        this.addLog(`${expGain}の経験値を獲得！`);

        // ゴールド獲得
        this.game.gainGold(this.enemy.gold);
        this.addLog(`${this.enemy.gold}Gを獲得！`);

        // アイテムドロップ
        if (this.enemy.drops) {
            for (const drop of this.enemy.drops) {
                if (Math.random() < drop.chance) {
                    this.game.inventory.addItem(drop.item, 1);
                    const itemName = GameData.items[drop.item]?.name || drop.item;
                    this.addLog(`${itemName}を手に入れた！`);
                }
            }
        }

        // ボス撃破の場合
        if (this.enemy.isBoss) {
            this.game.onBossDefeated(this.enemy.id);
        }

        setTimeout(() => this.endBattle('victory'), 1500);
    }

    // プレイヤー撃破
    playerDefeated() {
        this.addLog(`${this.player.name}は倒れた...`);
        setTimeout(() => this.endBattle('defeat'), 1500);
    }

    // バトル終了
    endBattle(result) {
        this.battleActive = false;
        this.game.onBattleEnd(result);
    }

    // バフ追加
    addBuff(target, type, value, duration) {
        // 既存の同種バフを削除
        this.buffs[target] = this.buffs[target].filter(b => b.type !== type);
        
        // 新しいバフを追加
        this.buffs[target].push({
            type,
            value,
            duration
        });
    }

    // バフのターン経過
    processBuffs(target) {
        this.buffs[target] = this.buffs[target].map(buff => ({
            ...buff,
            duration: buff.duration - 1
        })).filter(buff => buff.duration > 0);
    }

    // バフ倍率取得
    getBuffMultiplier(target, type) {
        const buff = this.buffs[target].find(b => b.type === type);
        return buff ? (1 + buff.value) : 1;
    }

    // バフ値取得
    getBuffValue(target, type) {
        const buff = this.buffs[target].find(b => b.type === type);
        return buff ? buff.value : 0;
    }

    // バフ削除
    removeBuff(target, type) {
        this.buffs[target] = this.buffs[target].filter(b => b.type !== type);
    }

    // バフ名取得
    getBuffName(type) {
        const names = {
            attack: '攻撃力',
            defense: '防御力',
            speed: '素早さ',
            enPower: '英語威力',
            cnPower: '中国語威力',
            exp: '経験値',
            barrier: 'バリア'
        };
        return names[type] || type;
    }

    // ログ追加
    addLog(message) {
        this.battleLog.push(message);
        if (this.battleLog.length > 20) {
            this.battleLog.shift();
        }
        this.updateLogUI();
    }

    // UI更新
    updateBattleUI() {
        this.updatePlayerUI();
        this.updateEnemyUI();
        this.updateLogUI();
    }

    updatePlayerUI() {
        // プレイヤーUI更新（game.jsで実装）
        if (this.game.updatePlayerUI) {
            this.game.updatePlayerUI();
        }
    }

    updateEnemyUI() {
        // 敵UI更新
        const enemyNameEl = document.getElementById('enemy-name');
        const enemyHpFill = document.getElementById('enemy-hp-fill');
        const enemyDescEl = document.getElementById('enemy-desc');
        const enemySprite = document.getElementById('enemy-sprite');

        if (enemyNameEl) enemyNameEl.textContent = this.enemy.name;
        if (enemyDescEl) enemyDescEl.textContent = this.enemy.description;
        if (enemySprite) enemySprite.textContent = this.enemy.icon;
        
        if (enemyHpFill) {
            const hpPercent = (this.enemy.currentHp / this.enemy.maxHp) * 100;
            enemyHpFill.style.width = `${hpPercent}%`;
        }
    }

    updateLogUI() {
        const logEl = document.getElementById('battle-log');
        if (logEl) {
            logEl.innerHTML = this.battleLog.map(msg => `<p>${msg}</p>`).join('');
            logEl.scrollTop = logEl.scrollHeight;
        }
    }
}

// グローバルにエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BattleSystem;
}
