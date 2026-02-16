/* ============================================
   語源の旅人 - データファイル
   ゲームデータの定義と管理
   ============================================ */

const GameData = {
    // ============================================
    // クラス定義
    // ============================================
    classes: {
        warrior: {
            id: 'warrior',
            name: '語学戦士',
            description: '英語に特化した攻撃型クラス',
            icon: '⚔️',
            stats: {
                hpMultiplier: 1.15,
                mpMultiplier: 1.0,
                enBonus: 0.20,
                cnBonus: -0.10,
                defBonus: 0.0
            },
            skills: ['power_attack', 'en_boost', 'word_slash']
        },
        mage: {
            id: 'mage',
            name: '文字術師',
            description: '中国語に特化した魔法型クラス',
            icon: '🔮',
            stats: {
                hpMultiplier: 1.0,
                mpMultiplier: 1.20,
                enBonus: -0.10,
                cnBonus: 0.20,
                defBonus: 0.0
            },
            skills: ['magic_blast', 'cn_boost', 'character_spell']
        },
        bard: {
            id: 'bard',
            name: '語り部',
            description: 'バランス型の支援クラス',
            icon: '🎵',
            stats: {
                hpMultiplier: 1.05,
                mpMultiplier: 1.10,
                enBonus: 0.10,
                cnBonus: 0.10,
                defBonus: 0.05,
                expBonus: 0.10,
                itemBonus: 0.15
            },
            skills: ['inspire', 'heal_melody', 'exp_song']
        },
        scholar: {
            id: 'scholar',
            name: '言語学者',
            description: '防御重視の知識型クラス',
            icon: '📚',
            stats: {
                hpMultiplier: 1.0,
                mpMultiplier: 1.15,
                enBonus: 0.05,
                cnBonus: 0.05,
                defBonus: 0.25,
                learningBonus: 0.20,
                mpCostReduction: 0.15
            },
            skills: ['analyze', 'defend_stance', 'wisdom_shield']
        }
    },

    // ============================================
    // エリア定義（15エリア）
    // ============================================
    areas: {
        forest_start: {
            id: 'forest_start',
            name: '始まりの森',
            description: '言葉の力が宿る神秘の森。新たな旅人を優しく迎え入れる。',
            icon: '🌲',
            level: 1,
            enemies: ['slime', 'small_fairy'],
            connections: { north: 'village_home', east: 'forest_deep' },
            bgm: 'peaceful'
        },
        village_home: {
            id: 'village_home',
            name: '言葉の郷',
            description: '語学の里。旅人たちが集まる平和な村。',
            icon: '🏘️',
            level: 1,
            enemies: [],
            npcs: ['elder', 'shopkeeper', 'teacher'],
            connections: { south: 'forest_start', north: 'plains_wind', east: 'library_ruins' },
            isSafe: true,
            bgm: 'town'
        },
        forest_deep: {
            id: 'forest_deep',
            name: '深淵の樹海',
            description: '光が差し込まない暗い森。危険な魔物が潜む。',
            icon: '🌳',
            level: 3,
            enemies: ['goblin', 'wolf', 'dark_sprite'],
            connections: { west: 'forest_start', east: 'cave_crystal' },
            bgm: 'tension'
        },
        plains_wind: {
            id: 'plains_wind',
            name: '語源の平原',
            description: '風が語りかける広大な平原。古代の言葉が風に乗る。',
            icon: '🌾',
            level: 4,
            enemies: ['wind_spirit', 'wild_boar', 'bandit'],
            connections: { south: 'village_home', north: 'mountain_foot', east: 'lake_mirrors' },
            bgm: 'field'
        },
        library_ruins: {
            id: 'library_ruins',
            name: '忘却の図書館',
            description: '失われた知識が眠る古代図書館の遺跡。',
            icon: '📖',
            level: 5,
            enemies: ['book_wraith', 'paper_golem', 'librarian_ghost'],
            connections: { west: 'village_home', north: 'tower_sage' },
            bgm: 'mystery'
        },
        cave_crystal: {
            id: 'cave_crystal',
            name: '水晶の洞窟',
            description: '輝く結晶が無数に生える美しい洞窟。',
            icon: '💎',
            level: 6,
            enemies: ['crystal_slime', 'bat', 'miner_ghost'],
            connections: { west: 'forest_deep', north: 'mountain_foot' },
            bgm: 'cave'
        },
        lake_mirrors: {
            id: 'lake_mirrors',
            name: '鏡の湖',
            description: '水面に言葉が映る神秘の湖。',
            icon: '🏞️',
            level: 7,
            enemies: ['water_sprite', 'lake_serpent', 'reflection'],
            connections: { west: 'plains_wind', north: 'temple_water', east: 'swamp_fog' },
            bgm: 'water'
        },
        mountain_foot: {
            id: 'mountain_foot',
            name: '語山の麓',
            description: '聖なる言葉が刻まれた山のふもと。',
            icon: '⛰️',
            level: 8,
            enemies: ['rock_golem', 'mountain_eagle', 'goat'],
            connections: { south: 'plains_wind', west: 'cave_crystal', north: 'mountain_peak' },
            bgm: 'mountain'
        },
        tower_sage: {
            id: 'tower_sage',
            name: '賢者の塔',
            description: '古代の賢者たちが知識を蓄えた塔。',
            icon: '🏰',
            level: 10,
            enemies: ['apprentice_wizard', 'magic_book', 'golem_guard'],
            connections: { south: 'library_ruins', north: 'sky_garden' },
            bgm: 'magic'
        },
        temple_water: {
            id: 'temple_water',
            name: '水の神殿',
            description: '流れるような言葉を祀る神殿。',
            icon: '⛲',
            level: 11,
            enemies: ['water_priest', 'temple_guardian', 'flow_spirit'],
            connections: { south: 'lake_mirrors', east: 'desert_oasis' },
            boss: 'water_temple_boss',
            bgm: 'temple'
        },
        swamp_fog: {
            id: 'swamp_fog',
            name: '霧の沼',
            description: '言葉が濁る不気味な沼地。',
            icon: '🌫️',
            level: 12,
            enemies: ['swamp_zombie', 'fog_wraith', 'mud_golem'],
            connections: { west: 'lake_mirrors', north: 'ruins_dark' },
            bgm: 'horror'
        },
        mountain_peak: {
            id: 'mountain_peak',
            name: '語山の頂',
            description: '最も純粋な言葉が流れる山頂。',
            icon: '🏔️',
            level: 13,
            enemies: ['ice_elemental', 'snow_wolf', 'peak_guardian'],
            connections: { south: 'mountain_foot', north: 'sky_bridge' },
            boss: 'mountain_boss',
            bgm: 'peak'
        },
        sky_garden: {
            id: 'sky_garden',
            name: '天空庭園',
            description: '雲の上に浮かぶ美しい庭園。',
            icon: '🌸',
            level: 14,
            enemies: ['cloud_sprite', 'sky_knight', 'wind_dragon'],
            connections: { south: 'tower_sage', west: 'sky_bridge' },
            bgm: 'heaven'
        },
        ruins_dark: {
            id: 'ruins_dark',
            name: '闇の遺跡',
            description: '禁忌の言葉が封印された古代遺跡。',
            icon: '🏛️',
            level: 15,
            enemies: ['dark_knight', 'shadow_mage', 'forbidden_construct'],
            connections: { south: 'swamp_fog', east: 'castle_final' },
            boss: 'dark_ruins_boss',
            bgm: 'dark'
        },
        castle_final: {
            id: 'castle_final',
            name: '語源城',
            description: 'すべての言葉の源たる伝説の城。',
            icon: '👑',
            level: 20,
            enemies: ['royal_guard', 'word_master', 'language_sage'],
            connections: { west: 'ruins_dark' },
            boss: 'final_boss',
            isFinal: true,
            bgm: 'final'
        }
    },

    // ============================================
    // NPC定義
    // ============================================
    npcs: {
        elder: {
            id: 'elder',
            name: '長老アルファ',
            description: '言葉の郷の長老。古代語の知識を持つ。',
            icon: '👴',
            dialogues: {
                default: [
                    { text: 'ようこそ、語源の旅人よ。', options: ['continue'] },
                    { text: 'この世界では言葉が力となる。英語と中国語の知識があなたの武器になるだろう。', options: ['quest', 'bye'] }
                ],
                quest_given: [
                    { text: '森の奥に潜む魔物を退治してくれないか？', options: ['accept', 'decline'] }
                ]
            }
        },
        shopkeeper: {
            id: 'shopkeeper',
            name: '商人ベータ',
            description: '道具屋の店主。珍しい品を取り揃えている。',
            icon: '👩‍💼',
            shopItems: ['potion_small', 'ether_small', 'scroll_return']
        },
        teacher: {
            id: 'teacher',
            name: '語学教師ガンマ',
            description: '語学の基礎を教える先生。',
            icon: '👨‍🏫',
            isTeacher: true
        },
        hermit: {
            id: 'hermit',
            name: '隠者デルタ',
            description: '山にこもる賢者。高級スキルを教えてくれる。',
            icon: '🧙',
            requiredLevel: 10
        }
    },

    // ============================================
    // スキル定義
    // ============================================
    skills: {
        // 英語スキル
        power_attack: {
            id: 'power_attack',
            name: 'パワーアタック',
            description: '英語の力を込めた強力な攻撃',
            type: 'english',
            power: 1.5,
            mpCost: 15,
            icon: '⚔️',
            requiredLevel: 1
        },
        en_boost: {
            id: 'en_boost',
            name: '英気高揚',
            description: '英語スキルの威力を一時的に上昇',
            type: 'english',
            effect: 'buff',
            buffType: 'enPower',
            buffValue: 0.3,
            duration: 3,
            mpCost: 20,
            icon: '🔥',
            requiredLevel: 5
        },
        word_slash: {
            id: 'word_slash',
            name: 'ワードスラッシュ',
            description: '言葉の刃で敵を斬る',
            type: 'english',
            power: 2.0,
            mpCost: 25,
            icon: '🗡️',
            requiredLevel: 10
        },
        
        // 中国語スキル
        magic_blast: {
            id: 'magic_blast',
            name: '魔法爆発',
            description: '中国語の魔力を放つ',
            type: 'chinese',
            power: 1.5,
            mpCost: 15,
            icon: '💥',
            requiredLevel: 1
        },
        cn_boost: {
            id: 'cn_boost',
            name: '中気充実',
            description: '中国語スキルの威力を一時的に上昇',
            type: 'chinese',
            effect: 'buff',
            buffType: 'cnPower',
            buffValue: 0.3,
            duration: 3,
            mpCost: 20,
            icon: '🌀',
            requiredLevel: 5
        },
        character_spell: {
            id: 'character_spell',
            name: '漢字呪術',
            description: '漢字の力で敵を呪う',
            type: 'chinese',
            power: 2.0,
            mpCost: 25,
            icon: '漢',
            requiredLevel: 10
        },
        
        // 共通スキル
        inspire: {
            id: 'inspire',
            name: '激励',
            description: '味方の攻撃力を上昇',
            type: 'common',
            effect: 'buff',
            buffType: 'attack',
            buffValue: 0.2,
            duration: 3,
            mpCost: 15,
            icon: '🎵',
            requiredLevel: 1
        },
        heal_melody: {
            id: 'heal_melody',
            name: '癒しの旋律',
            description: 'HPを回復する',
            type: 'common',
            effect: 'heal',
            healAmount: 50,
            mpCost: 20,
            icon: '💚',
            requiredLevel: 5
        },
        exp_song: {
            id: 'exp_song',
            name: '経験の歌',
            description: '獲得経験値を増加',
            type: 'common',
            effect: 'buff',
            buffType: 'exp',
            buffValue: 0.5,
            duration: 5,
            mpCost: 30,
            icon: '⭐',
            requiredLevel: 15
        },
        analyze: {
            id: 'analyze',
            name: '分析',
            description: '敵の弱点を見抜く',
            type: 'common',
            effect: 'analyze',
            mpCost: 10,
            icon: '🔍',
            requiredLevel: 1
        },
        defend_stance: {
            id: 'defend_stance',
            name: '防御態勢',
            description: '防御力を大幅に上昇',
            type: 'common',
            effect: 'buff',
            buffType: 'defense',
            buffValue: 0.5,
            duration: 2,
            mpCost: 15,
            icon: '🛡️',
            requiredLevel: 5
        },
        wisdom_shield: {
            id: 'wisdom_shield',
            name: '知恵の盾',
            description: 'ダメージを軽減するバリアを展開',
            type: 'common',
            effect: 'barrier',
            barrierValue: 30,
            mpCost: 25,
            icon: '🔰',
            requiredLevel: 15
        }
    },

    // ============================================
    // アイテム定義（50種類以上）
    // ============================================
    items: {
        // 回復アイテム
        potion_small: {
            id: 'potion_small',
            name: '小さな回復薬',
            description: 'HPを30回復する',
            type: 'consumable',
            effect: { type: 'heal', value: 30 },
            icon: '🧪',
            buyPrice: 50,
            sellPrice: 25
        },
        potion_medium: {
            id: 'potion_medium',
            name: '回復薬',
            description: 'HPを60回復する',
            type: 'consumable',
            effect: { type: 'heal', value: 60 },
            icon: '🧪',
            buyPrice: 100,
            sellPrice: 50
        },
        potion_large: {
            id: 'potion_large',
            name: '大きな回復薬',
            description: 'HPを120回復する',
            type: 'consumable',
            effect: { type: 'heal', value: 120 },
            icon: '🧪',
            buyPrice: 200,
            sellPrice: 100
        },
        potion_full: {
            id: 'potion_full',
            name: '完全回復薬',
            description: 'HPを全回復する',
            type: 'consumable',
            effect: { type: 'heal', value: 'full' },
            icon: '🧪',
            buyPrice: 500,
            sellPrice: 250
        },
        ether_small: {
            id: 'ether_small',
            name: '小さなエーテル',
            description: 'MPを20回復する',
            type: 'consumable',
            effect: { type: 'restore_mp', value: 20 },
            icon: '💧',
            buyPrice: 60,
            sellPrice: 30
        },
        ether_medium: {
            id: 'ether_medium',
            name: 'エーテル',
            description: 'MPを40回復する',
            type: 'consumable',
            effect: { type: 'restore_mp', value: 40 },
            icon: '💧',
            buyPrice: 120,
            sellPrice: 60
        },
        ether_large: {
            id: 'ether_large',
            name: '大きなエーテル',
            description: 'MPを80回復する',
            type: 'consumable',
            effect: { type: 'restore_mp', value: 80 },
            icon: '💧',
            buyPrice: 240,
            sellPrice: 120
        },
        elixir: {
            id: 'elixir',
            name: 'エリクサー',
            description: 'HPとMPを全回復する',
            type: 'consumable',
            effect: { type: 'heal_full' },
            icon: '✨',
            buyPrice: 1000,
            sellPrice: 500
        },
        
        // 強化アイテム
        power_boost: {
            id: 'power_boost',
            name: '力の粉末',
            description: '攻撃力を一時的に上昇',
            type: 'consumable',
            effect: { type: 'buff', stat: 'attack', value: 0.2, duration: 3 },
            icon: '💪',
            buyPrice: 80,
            sellPrice: 40
        },
        defense_boost: {
            id: 'defense_boost',
            name: '守りの粉末',
            description: '防御力を一時的に上昇',
            type: 'consumable',
            effect: { type: 'buff', stat: 'defense', value: 0.2, duration: 3 },
            icon: '🛡️',
            buyPrice: 80,
            sellPrice: 40
        },
        speed_boost: {
            id: 'speed_boost',
            name: '速さの粉末',
            description: '素早さを一時的に上昇',
            type: 'consumable',
            effect: { type: 'buff', stat: 'speed', value: 0.2, duration: 3 },
            icon: '⚡',
            buyPrice: 80,
            sellPrice: 40
        },
        
        // 特殊アイテム
        scroll_return: {
            id: 'scroll_return',
            name: '帰還の巻物',
            description: '最後に訪れた安全地帯に戻る',
            type: 'consumable',
            effect: { type: 'return' },
            icon: '📜',
            buyPrice: 150,
            sellPrice: 75
        },
        scroll_escape: {
            id: 'scroll_escape',
            name: '脱出の巻物',
            description: '戦闘から必ず逃げられる',
            type: 'consumable',
            effect: { type: 'escape' },
            icon: '📜',
            buyPrice: 200,
            sellPrice: 100
        },
        antidote: {
            id: 'antidote',
            name: '解毒薬',
            description: '毒状態を回復',
            type: 'consumable',
            effect: { type: 'cure', status: 'poison' },
            icon: '💊',
            buyPrice: 50,
            sellPrice: 25
        },
        eye_drops: {
            id: 'eye_drops',
            name: '目薬',
            description: '暗闇状態を回復',
            type: 'consumable',
            effect: { type: 'cure', status: 'blind' },
            icon: '👁️',
            buyPrice: 50,
            sellPrice: 25
        },
        smelling_salts: {
            id: 'smelling_salts',
            name: '嗅ぎ薬',
            description: '混乱状態を回復',
            type: 'consumable',
            effect: { type: 'cure', status: 'confuse' },
            icon: '👃',
            buyPrice: 50,
            sellPrice: 25
        },
        
        // 武器
        sword_rusty: {
            id: 'sword_rusty',
            name: '錆びた剣',
            description: '初心者用の剣',
            type: 'weapon',
            slot: 'weapon',
            stats: { attack: 5 },
            icon: '🗡️',
            buyPrice: 100,
            sellPrice: 50
        },
        sword_iron: {
            id: 'sword_iron',
            name: '鉄の剣',
            description: '標準的な剣',
            type: 'weapon',
            slot: 'weapon',
            stats: { attack: 12 },
            icon: '⚔️',
            buyPrice: 300,
            sellPrice: 150
        },
        sword_steel: {
            id: 'sword_steel',
            name: '鋼の剣',
            description: '鋼で作られた頑丈な剣',
            type: 'weapon',
            slot: 'weapon',
            stats: { attack: 25 },
            icon: '⚔️',
            buyPrice: 800,
            sellPrice: 400
        },
        sword_magic: {
            id: 'sword_magic',
            name: '魔法剣',
            description: '魔力を帯びた剣',
            type: 'weapon',
            slot: 'weapon',
            stats: { attack: 35, magic: 10 },
            icon: '🔮',
            buyPrice: 1500,
            sellPrice: 750
        },
        sword_legend: {
            id: 'sword_legend',
            name: '伝説の剣',
            description: '古の英雄が使った剣',
            type: 'weapon',
            slot: 'weapon',
            stats: { attack: 50, magic: 20 },
            icon: '⚔️',
            buyPrice: 5000,
            sellPrice: 2500
        },
        staff_wood: {
            id: 'staff_wood',
            name: '木の杖',
            description: '初心者用の杖',
            type: 'weapon',
            slot: 'weapon',
            stats: { attack: 3, magic: 5 },
            icon: '🦯',
            buyPrice: 100,
            sellPrice: 50
        },
        staff_crystal: {
            id: 'staff_crystal',
            name: '水晶の杖',
            description: '魔力を増幅する杖',
            type: 'weapon',
            slot: 'weapon',
            stats: { attack: 8, magic: 20 },
            icon: '🔮',
            buyPrice: 1000,
            sellPrice: 500
        },
        staff_sage: {
            id: 'staff_sage',
            name: '賢者の杖',
            description: '大賢者が使っていた杖',
            type: 'weapon',
            slot: 'weapon',
            stats: { attack: 15, magic: 40 },
            icon: '🔮',
            buyPrice: 3000,
            sellPrice: 1500
        },
        
        // 防具
        armor_cloth: {
            id: 'armor_cloth',
            name: '布の服',
            description: '普通の衣服',
            type: 'armor',
            slot: 'armor',
            stats: { defense: 3 },
            icon: '👕',
            buyPrice: 50,
            sellPrice: 25
        },
        armor_leather: {
            id: 'armor_leather',
            name: '革の鎧',
            description: '革で作られた軽い鎧',
            type: 'armor',
            slot: 'armor',
            stats: { defense: 8 },
            icon: '🦺',
            buyPrice: 200,
            sellPrice: 100
        },
        armor_chain: {
            id: 'armor_chain',
            name: '鎖かたびら',
            description: '鎖で編まれた鎧',
            type: 'armor',
            slot: 'armor',
            stats: { defense: 15 },
            icon: '👔',
            buyPrice: 600,
            sellPrice: 300
        },
        armor_plate: {
            id: 'armor_plate',
            name: '板金鎧',
            description: '金属板で作られた重い鎧',
            type: 'armor',
            slot: 'armor',
            stats: { defense: 25 },
            icon: '🛡️',
            buyPrice: 1200,
            sellPrice: 600
        },
        armor_magic: {
            id: 'armor_magic',
            name: '魔法の鎧',
            description: '魔力で強化された鎧',
            type: 'armor',
            slot: 'armor',
            stats: { defense: 20, magic: 10 },
            icon: '✨',
            buyPrice: 2000,
            sellPrice: 1000
        },
        armor_legend: {
            id: 'armor_legend',
            name: '伝説の鎧',
            description: '古の英雄が纏った鎧',
            type: 'armor',
            slot: 'armor',
            stats: { defense: 40, magic: 15 },
            icon: '👑',
            buyPrice: 5000,
            sellPrice: 2500
        },
        
        // アクセサリ
        ring_power: {
            id: 'ring_power',
            name: '力の指輪',
            description: '攻撃力が上昇する指輪',
            type: 'accessory',
            slot: 'accessory',
            stats: { attack: 5 },
            icon: '💍',
            buyPrice: 500,
            sellPrice: 250
        },
        ring_guard: {
            id: 'ring_guard',
            name: '守りの指輪',
            description: '防御力が上昇する指輪',
            type: 'accessory',
            slot: 'accessory',
            stats: { defense: 5 },
            icon: '💍',
            buyPrice: 500,
            sellPrice: 250
        },
        ring_wisdom: {
            id: 'ring_wisdom',
            name: '知恵の指輪',
            description: 'MPが上昇する指輪',
            type: 'accessory',
            slot: 'accessory',
            stats: { mp: 20 },
            icon: '💍',
            buyPrice: 600,
            sellPrice: 300
        },
        ring_life: {
            id: 'ring_life',
            name: '生命の指輪',
            description: 'HPが上昇する指輪',
            type: 'accessory',
            slot: 'accessory',
            stats: { hp: 30 },
            icon: '💍',
            buyPrice: 600,
            sellPrice: 300
        },
        amulet_exp: {
            id: 'amulet_exp',
            name: '経験の護符',
            description: '獲得経験値が増加する',
            type: 'accessory',
            slot: 'accessory',
            stats: { expBonus: 0.1 },
            icon: '📿',
            buyPrice: 1000,
            sellPrice: 500
        },
        amulet_luck: {
            id: 'amulet_luck',
            name: '幸運の護符',
            description: 'アイテムドロップ率が上昇',
            type: 'accessory',
            slot: 'accessory',
            stats: { luck: 10 },
            icon: '🍀',
            buyPrice: 800,
            sellPrice: 400
        },
        
        // 素材
        herb: {
            id: 'herb',
            name: '薬草',
            description: '回復薬の材料',
            type: 'material',
            icon: '🌿',
            sellPrice: 10
        },
        magic_stone: {
            id: 'magic_stone',
            name: '魔石',
            description: '魔力を帯びた石',
            type: 'material',
            icon: '💎',
            sellPrice: 50
        },
        iron_ore: {
            id: 'iron_ore',
            name: '鉄鉱石',
            description: '鉄を含む鉱石',
            type: 'material',
            icon: '⛏️',
            sellPrice: 30
        },
        crystal_shard: {
            id: 'crystal_shard',
            name: '結晶の欠片',
            description: '魔法の結晶のかけら',
            type: 'material',
            icon: '✨',
            sellPrice: 100
        },
        monster_fang: {
            id: 'monster_fang',
            name: '魔物の牙',
            description: '魔物から取れた牙',
            type: 'material',
            icon: '🦷',
            sellPrice: 40
        },
        ancient_page: {
            id: 'ancient_page',
            name: '古びたページ',
            description: '古代の文献の一部',
            type: 'material',
            icon: '📄',
            sellPrice: 80
        }
    },

    // ============================================
    // クラフトレシピ
    // ============================================
    recipes: {
        potion_small: {
            result: 'potion_small',
            count: 1,
            materials: { herb: 2 }
        },
        potion_medium: {
            result: 'potion_medium',
            count: 1,
            materials: { herb: 3, magic_stone: 1 }
        },
        ether_small: {
            result: 'ether_small',
            count: 1,
            materials: { magic_stone: 2 }
        },
        power_boost: {
            result: 'power_boost',
            count: 1,
            materials: { herb: 2, monster_fang: 1 }
        },
        sword_iron: {
            result: 'sword_iron',
            count: 1,
            materials: { iron_ore: 5, monster_fang: 2 }
        },
        armor_leather: {
            result: 'armor_leather',
            count: 1,
            materials: { monster_fang: 3, herb: 2 }
        }
    },

    // ============================================
    // 経験値テーブル
    // ============================================
    expTable: {
        getRequiredExp(level) {
            return Math.floor(100 * Math.pow(1.2, level - 1));
        },
        getMaxLevel() {
            return 50;
        }
    }
};

// グローバルにエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameData;
}
