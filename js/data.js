/**
 * ゲームデータ管理
 */

const GameData = {
    // プレイヤー初期データ
    initialPlayer: {
        name: "旅人",
        level: 1,
        hp: 100,
        maxHp: 100,
        mp: 30,
        maxMp: 30,
        exp: 0,
        nextExp: 100,
        
        // 英語レベル
        englishLevel: 1,
        englishExp: 0,
        englishNextExp: 50,
        
        // 中国語レベル
        chineseLevel: 1,
        chineseExp: 0,
        chineseNextExp: 50,
        
        // ステータス
        str: 10,  // 力
        def: 8,   // 守備
        spd: 10,  // 素早さ
        int: 8,   // 賢さ
        
        // 装備
        weapon: null,
        armor: null,
        accessory: null,
        
        // 所持品
        items: [
            { id: 'potion', count: 3 },
            { id: 'ether', count: 1 }
        ],
        
        // 習得スキル
        skills: ['attack', 'heal'],
        
        // 位置
        x: 10,
        y: 10,
        map: 'village',
        direction: 'down'
    },

    // 敵データ
    enemies: {
        'slime': {
            id: 'slime',
            name: 'スライム',
            nameEn: 'Slime',
            nameCn: '史莱姆',
            hp: 30,
            maxHp: 30,
            mp: 0,
            str: 8,
            def: 5,
            spd: 8,
            exp: 10,
            gold: 5,
            weakness: 'en',  // 英語が弱点
            resistance: null,
            sprite: 'slime',
            level: 1
        },
        'goblin': {
            id: 'goblin',
            name: 'ゴブリン',
            nameEn: 'Goblin',
            nameCn: '哥布林',
            hp: 50,
            maxHp: 50,
            mp: 10,
            str: 12,
            def: 8,
            spd: 12,
            exp: 20,
            gold: 12,
            weakness: 'cn',  // 中国語が弱点
            resistance: null,
            sprite: 'goblin',
            level: 2
        },
        'wolf': {
            id: 'wolf',
            name: 'ウルフ',
            nameEn: 'Wolf',
            nameCn: '狼',
            hp: 70,
            maxHp: 70,
            mp: 0,
            str: 15,
            def: 10,
            spd: 18,
            exp: 35,
            gold: 20,
            weakness: 'en',
            resistance: null,
            sprite: 'wolf',
            level: 3
        },
        'skeleton': {
            id: 'skeleton',
            name: 'スケルトン',
            nameEn: 'Skeleton',
            nameCn: '骷髅',
            hp: 90,
            maxHp: 90,
            mp: 20,
            str: 18,
            def: 12,
            spd: 14,
            exp: 50,
            gold: 30,
            weakness: 'cn',
            resistance: null,
            sprite: 'skeleton',
            level: 4
        },
        'orc': {
            id: 'orc',
            name: 'オーク',
            nameEn: 'Orc',
            nameCn: '兽人',
            hp: 120,
            maxHp: 120,
            mp: 15,
            str: 22,
            def: 15,
            spd: 12,
            exp: 70,
            gold: 45,
            weakness: 'both',  // 両方弱点
            resistance: null,
            sprite: 'orc',
            level: 5
        },
        'dragon': {
            id: 'dragon',
            name: 'ドラゴン',
            nameEn: 'Dragon',
            nameCn: '龙',
            hp: 500,
            maxHp: 500,
            mp: 100,
            str: 50,
            def: 30,
            spd: 25,
            exp: 500,
            gold: 500,
            weakness: 'both',
            resistance: null,
            sprite: 'dragon',
            level: 10,
            boss: true
        }
    },

    // エンカウント設定
    encounters: {
        'field': [
            { enemy: 'slime', weight: 40 },
            { enemy: 'goblin', weight: 30 },
            { enemy: 'wolf', weight: 20 },
            { enemy: 'skeleton', weight: 10 }
        ],
        'dungeon': [
            { enemy: 'goblin', weight: 25 },
            { enemy: 'wolf', weight: 30 },
            { enemy: 'skeleton', weight: 25 },
            { enemy: 'orc', weight: 20 }
        ]
    },

    // アイテムデータ
    items: {
        'potion': {
            id: 'potion',
            name: '薬草',
            nameEn: 'Herb',
            nameCn: '药草',
            type: 'consumable',
            effect: 'heal',
            value: 50,
            price: 20,
            description: 'HPを50回復する'
        },
        'high_potion': {
            id: 'high_potion',
            name: 'いい薬草',
            nameEn: 'Good Herb',
            nameCn: '好药草',
            type: 'consumable',
            effect: 'heal',
            value: 100,
            price: 50,
            description: 'HPを100回復する'
        },
        'ether': {
            id: 'ether',
            name: 'エーテル',
            nameEn: 'Ether',
            nameCn: '以太',
            type: 'consumable',
            effect: 'mp',
            value: 30,
            price: 40,
            description: 'MPを30回復する'
        },
        'antidote': {
            id: 'antidote',
            name: 'どくけし',
            nameEn: 'Antidote',
            nameCn: '解毒药',
            type: 'consumable',
            effect: 'cure_poison',
            price: 30,
            description: '毒を治す'
        },
        'wood_sword': {
            id: 'wood_sword',
            name: '木の剣',
            nameEn: 'Wooden Sword',
            nameCn: '木剑',
            type: 'weapon',
            atk: 5,
            price: 100,
            description: '初心者用の木の剣'
        },
        'iron_sword': {
            id: 'iron_sword',
            name: '鉄の剣',
            nameEn: 'Iron Sword',
            nameCn: '铁剑',
            type: 'weapon',
            atk: 12,
            price: 300,
            description: '鉄で作られた剣'
        },
        'leather_armor': {
            id: 'leather_armor',
            name: '皮の鎧',
            nameEn: 'Leather Armor',
            nameCn: '皮甲',
            type: 'armor',
            def: 5,
            price: 150,
            description: '皮で作られた軽い鎧'
        },
        'iron_armor': {
            id: 'iron_armor',
            name: '鉄の鎧',
            nameEn: 'Iron Armor',
            nameCn: '铁甲',
            type: 'armor',
            def: 12,
            price: 400,
            description: '鉄で作られた頑丈な鎧'
        }
    },

    // スキルデータ
    skills: {
        'attack': {
            id: 'attack',
            name: 'こうげき',
            nameEn: 'Attack',
            nameCn: '攻击',
            type: 'physical',
            mp: 0,
            power: 1.0,
            description: '通常攻撃'
        },
        'heal': {
            id: 'heal',
            name: 'ホイミ',
            nameEn: 'Heal',
            nameCn: '治疗术',
            type: 'magic',
            mp: 5,
            power: 40,
            description: 'HPを回復する'
        },
        'fire': {
            id: 'fire',
            name: 'メラ',
            nameEn: 'Frizz',
            nameCn: '火球术',
            type: 'magic',
            mp: 8,
            power: 25,
            element: 'fire',
            description: '火の魔法攻撃'
        },
        'ice': {
            id: 'ice',
            name: 'ヒャド',
            nameEn: 'Crack',
            nameCn: '冰结术',
            type: 'magic',
            mp: 8,
            power: 25,
            element: 'ice',
            description: '氷の魔法攻撃'
        },
        'thunder': {
            id: 'thunder',
            name: 'ギラ',
            nameEn: 'Sizz',
            nameCn: '雷电术',
            type: 'magic',
            mp: 10,
            power: 30,
            element: 'thunder',
            description: '雷の魔法攻撃'
        },
        'english_slash': {
            id: 'english_slash',
            name: '英語斬り',
            nameEn: 'English Slash',
            nameCn: '英语斩',
            type: 'special',
            mp: 8,
            power: 1.5,
            language: 'en',
            description: '英語の力を込めた斬撃'
        },
        'chinese_punch': {
            id: 'chinese_punch',
            name: '中国拳',
            nameEn: 'Chinese Punch',
            nameCn: '中国拳',
            type: 'special',
            mp: 8,
            power: 1.5,
            language: 'cn',
            description: '中国語の力を込めた拳'
        },
        'bilingual_strike': {
            id: 'bilingual_strike',
            name: 'バイリンガルストライク',
            nameEn: 'Bilingual Strike',
            nameCn: '双语打击',
            type: 'special',
            mp: 15,
            power: 2.0,
            language: 'both',
            description: '両言語の力を込めた必殺技'
        }
    },

    // 単語データ
    vocabulary: {
        en: [
            { word: 'apple', meaning: 'りんご', learned: false },
            { word: 'book', meaning: '本', learned: false },
            { word: 'cat', meaning: '猫', learned: false },
            { word: 'dog', meaning: '犬', learned: false },
            { word: 'eat', meaning: '食べる', learned: false },
            { word: 'friend', meaning: '友達', learned: false },
            { word: 'good', meaning: '良い', learned: false },
            { word: 'house', meaning: '家', learned: false },
            { word: 'love', meaning: '愛', learned: false },
            { word: 'water', meaning: '水', learned: false },
            { word: 'sword', meaning: '剣', learned: false },
            { word: 'magic', meaning: '魔法', learned: false },
            { word: 'dragon', meaning: '竜', learned: false },
            { word: 'hero', meaning: '勇者', learned: false },
            { word: 'monster', meaning: '怪物', learned: false }
        ],
        cn: [
            { word: '苹果', pinyin: 'píngguǒ', meaning: 'りんご', learned: false },
            { word: '书', pinyin: 'shū', meaning: '本', learned: false },
            { word: '猫', pinyin: 'māo', meaning: '猫', learned: false },
            { word: '狗', pinyin: 'gǒu', meaning: '犬', learned: false },
            { word: '吃', pinyin: 'chī', meaning: '食べる', learned: false },
            { word: '朋友', pinyin: 'péngyou', meaning: '友達', learned: false },
            { word: '好', pinyin: 'hǎo', meaning: '良い', learned: false },
            { word: '房子', pinyin: 'fángzi', meaning: '家', learned: false },
            { word: '爱', pinyin: 'ài', meaning: '愛', learned: false },
            { word: '水', pinyin: 'shuǐ', meaning: '水', learned: false },
            { word: '剑', pinyin: 'jiàn', meaning: '剣', learned: false },
            { word: '魔法', pinyin: 'mófǎ', meaning: '魔法', learned: false },
            { word: '龙', pinyin: 'lóng', meaning: '竜', learned: false },
            { word: '英雄', pinyin: 'yīngxióng', meaning: '勇者', learned: false },
            { word: '怪物', pinyin: 'guàiwu', meaning: '怪物', learned: false }
        ]
    },

    // NPCデータ
    npcs: {
        'village_elder': {
            id: 'village_elder',
            name: '村長',
            sprite: 'elder',
            dialogues: [
                'ようこそ、若者よ。この世界では英語と中国語の力が重要だ。',
                'モンスターの弱点を見極めて、適切な言語で攻撃するのだ。',
                '東のフィールドにはスライムが出る。英語が弱点だぞ。'
            ],
            x: 12,
            y: 8
        },
        'shop_owner': {
            id: 'shop_owner',
            name: '店主',
            sprite: 'merchant',
            dialogues: [
                'いらっしゃい！良いものがあるぞ。',
                '冒険には薬草が必須だ。',
                '武器も防具も揃えておくといい。'
            ],
            shop: true,
            x: 8,
            y: 12
        },
        'innkeeper': {
            id: 'innkeeper',
            name: '宿屋の主人',
            sprite: 'innkeeper',
            dialogues: [
                '一泊10ゴールドだ。休んでいくかい？',
                '宿屋で休むとHPとMPが全回復するぞ。',
                '冒険の前にしっかり休むことだな。'
            ],
            inn: true,
            price: 10,
            x: 15,
            y: 12
        }
    },

    // レベルアップテーブル
    levelTable: [
        { level: 1, exp: 0 },
        { level: 2, exp: 100 },
        { level: 3, exp: 250 },
        { level: 4, exp: 450 },
        { level: 5, exp: 700 },
        { level: 6, exp: 1000 },
        { level: 7, exp: 1350 },
        { level: 8, exp: 1750 },
        { level: 9, exp: 2200 },
        { level: 10, exp: 2700 },
        { level: 11, exp: 3250 },
        { level: 12, exp: 3850 },
        { level: 13, exp: 4500 },
        { level: 14, exp: 5200 },
        { level: 15, exp: 5950 },
        { level: 16, exp: 6750 },
        { level: 17, exp: 7600 },
        { level: 18, exp: 8500 },
        { level: 19, exp: 9450 },
        { level: 20, exp: 10500 }
    ]
};

// グローバルに公開
window.GameData = GameData;
