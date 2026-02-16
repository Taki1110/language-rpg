/**
 * プレイヤー管理システム
 */

class Player {
    constructor() {
        this.data = null;
        this.x = 10;
        this.y = 10;
        this.direction = 'down';
        this.moving = false;
        this.moveProgress = 0;
        this.stepCount = 0;
        this.encounterSteps = 0;
        
        // アニメーション
        this.animFrame = 0;
        this.animTimer = 0;
        
        // スプライト
        this.sprite = {
            width: 32,
            height: 32,
            color: '#533483'
        };
    }

    // プレイヤー初期化
    init(data) {
        this.data = { ...GameData.initialPlayer, ...data };
        this.x = this.data.x;
        this.y = this.data.y;
        this.direction = this.data.direction;
        this.stepCount = 0;
        this.encounterSteps = Math.floor(Math.random() * 10) + 5;
    }

    // 移動処理
    move(dx, dy, gameMap) {
        if (this.moving) return false;
        
        // 方向更新
        if (dx > 0) this.direction = 'right';
        else if (dx < 0) this.direction = 'left';
        else if (dy > 0) this.direction = 'down';
        else if (dy < 0) this.direction = 'up';
        
        const newX = this.x + dx;
        const newY = this.y + dy;
        
        // 通行チェック
        if (!gameMap.isPassable(newX, newY)) {
            return false;
        }
        
        // 移動開始
        this.moving = true;
        this.moveProgress = 0;
        this.targetX = newX;
        this.targetY = newY;
        
        return true;
    }

    // 更新処理
    update(deltaTime) {
        // アニメーション更新
        this.animTimer += deltaTime;
        if (this.animTimer >= 200) {
            this.animFrame = (this.animFrame + 1) % 4;
            this.animTimer = 0;
        }
        
        // 移動処理
        if (this.moving) {
            this.moveProgress += deltaTime * 0.008; // 移動速度
            
            if (this.moveProgress >= 1) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.moving = false;
                this.moveProgress = 0;
                this.stepCount++;
                
                // データ更新
                this.data.x = this.x;
                this.data.y = this.y;
                this.data.direction = this.direction;
                
                return true; // 移動完了
            }
        }
        
        return false;
    }

    // 描画
    render(ctx, cameraX, cameraY) {
        const pixelX = this.x * 32;
        const pixelY = this.y * 32;
        
        // 移動中は補間
        let renderX = pixelX;
        let renderY = pixelY;
        
        if (this.moving) {
            const prevX = this.x * 32;
            const prevY = this.y * 32;
            const targetX = this.targetX * 32;
            const targetY = this.targetY * 32;
            
            renderX = prevX + (targetX - prevX) * this.moveProgress;
            renderY = prevY + (targetY - prevY) * this.moveProgress;
        }
        
        const screenX = renderX - cameraX;
        const screenY = renderY - cameraY;
        
        // プレイヤースプライト描画
        this.drawSprite(ctx, screenX, screenY);
    }

    // スプライト描画
    drawSprite(ctx, x, y) {
        const size = 28;
        const offset = (32 - size) / 2;
        
        // 体
        ctx.fillStyle = this.sprite.color;
        ctx.fillRect(x + offset, y + offset + 4, size, size - 4);
        
        // 頭
        ctx.fillStyle = '#7b68ee';
        ctx.fillRect(x + offset + 4, y + offset, size - 8, 12);
        
        // 目（方向によって変える）
        ctx.fillStyle = '#fff';
        const eyeSize = 3;
        let eyeOffsetX = 0;
        
        if (this.direction === 'right') eyeOffsetX = 4;
        else if (this.direction === 'left') eyeOffsetX = -4;
        
        // 歩行アニメーション
        let bounce = 0;
        if (this.moving) {
            bounce = Math.sin(this.moveProgress * Math.PI * 2) * 2;
        }
        
        ctx.fillRect(x + offset + 8 + eyeOffsetX, y + offset + 3 + bounce, eyeSize, eyeSize);
        ctx.fillRect(x + offset + 17 + eyeOffsetX, y + offset + 3 + bounce, eyeSize, eyeSize);
    }

    // 経験値獲得
    gainExp(amount) {
        this.data.exp += amount;
        
        // レベルアップチェック
        while (this.data.exp >= this.data.nextExp) {
            this.levelUp();
        }
    }

    // レベルアップ
    levelUp() {
        this.data.level++;
        this.data.nextExp = GameData.levelTable[this.data.level]?.exp || 
                           this.data.nextExp + this.data.level * 100;
        
        // ステータス上昇
        const hpGain = Math.floor(Math.random() * 5) + 3;
        const mpGain = Math.floor(Math.random() * 3) + 1;
        const strGain = Math.floor(Math.random() * 2) + 1;
        const defGain = Math.floor(Math.random() * 2) + 1;
        
        this.data.maxHp += hpGain;
        this.data.hp = this.data.maxHp;
        this.data.maxMp += mpGain;
        this.data.mp = this.data.maxMp;
        this.data.str += strGain;
        this.data.def += defGain;
        
        return {
            level: this.data.level,
            hp: hpGain,
            mp: mpGain,
            str: strGain,
            def: defGain
        };
    }

    // 英語経験値獲得
    gainEnglishExp(amount) {
        this.data.englishExp += amount;
        
        while (this.data.englishExp >= this.data.englishNextExp) {
            this.englishLevelUp();
        }
    }

    // 英語レベルアップ
    englishLevelUp() {
        this.data.englishLevel++;
        this.data.englishNextExp = this.data.englishLevel * 50;
        
        // 新スキル習得
        if (this.data.englishLevel === 3 && !this.data.skills.includes('english_slash')) {
            this.data.skills.push('english_slash');
            return { level: this.data.englishLevel, skill: 'english_slash' };
        }
        
        return { level: this.data.englishLevel };
    }

    // 中国語経験値獲得
    gainChineseExp(amount) {
        this.data.chineseExp += amount;
        
        while (this.data.chineseExp >= this.data.chineseNextExp) {
            this.chineseLevelUp();
        }
    }

    // 中国語レベルアップ
    chineseLevelUp() {
        this.data.chineseLevel++;
        this.data.chineseNextExp = this.data.chineseLevel * 50;
        
        // 新スキル習得
        if (this.data.chineseLevel === 3 && !this.data.skills.includes('chinese_punch')) {
            this.data.skills.push('chinese_punch');
            return { level: this.data.chineseLevel, skill: 'chinese_punch' };
        }
        
        return { level: this.data.chineseLevel };
    }

    // ダメージ計算
    calculateDamage(skill, target) {
        const skillData = GameData.skills[skill];
        if (!skillData) return 0;
        
        let damage = 0;
        
        if (skillData.type === 'physical') {
            damage = this.data.str * skillData.power;
        } else if (skillData.type === 'magic') {
            damage = this.data.int * skillData.power * 0.5;
        } else if (skillData.type === 'special') {
            damage = this.data.str * skillData.power;
        }
        
        // 武器補正
        if (this.data.weapon) {
            const weapon = GameData.items[this.data.weapon];
            if (weapon) damage += weapon.atk;
        }
        
        // 防御補正
        damage -= target.def * 0.5;
        
        // 弱点チェック
        if (skillData.language && target.weakness) {
            if (skillData.language === target.weakness || 
                (skillData.language === 'both' && target.weakness === 'both')) {
                damage *= 1.5;
            }
        }
        
        // ランダム変動
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        
        return Math.max(1, damage);
    }

    // 回復
    heal(amount) {
        const oldHp = this.data.hp;
        this.data.hp = Math.min(this.data.maxHp, this.data.hp + amount);
        return this.data.hp - oldHp;
    }

    // MP回復
    restoreMp(amount) {
        const oldMp = this.data.mp;
        this.data.mp = Math.min(this.data.maxMp, this.data.mp + amount);
        return this.data.mp - oldMp;
    }

    // ダメージ受ける
    takeDamage(damage) {
        // 防具補正
        let actualDamage = damage;
        if (this.data.armor) {
            const armor = GameData.items[this.data.armor];
            if (armor) actualDamage -= armor.def;
        }
        
        actualDamage = Math.max(1, Math.floor(actualDamage));
        this.data.hp = Math.max(0, this.data.hp - actualDamage);
        
        return actualDamage;
    }

    // アイテム使用
    useItem(itemId) {
        const item = GameData.items[itemId];
        if (!item) return null;
        
        // 所持チェック
        const itemSlot = this.data.items.find(i => i.id === itemId);
        if (!itemSlot || itemSlot.count <= 0) return null;
        
        let result = null;
        
        if (item.effect === 'heal') {
            const healed = this.heal(item.value);
            result = { type: 'heal', amount: healed };
        } else if (item.effect === 'mp') {
            const restored = this.restoreMp(item.value);
            result = { type: 'mp', amount: restored };
        }
        
        if (result) {
            itemSlot.count--;
            if (itemSlot.count <= 0) {
                this.data.items = this.data.items.filter(i => i.id !== itemId);
            }
        }
        
        return result;
    }

    // セーブデータ取得
    getSaveData() {
        return {
            ...this.data,
            x: this.x,
            y: this.y,
            direction: this.direction
        };
    }

    // セーブデータ読み込み
    loadSaveData(data) {
        this.data = { ...this.data, ...data };
        this.x = this.data.x;
        this.y = this.data.y;
        this.direction = this.data.direction;
    }
}

// グローバルに公開
window.Player = Player;
