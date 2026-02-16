# 語源の旅人 - Language RPG
# 英語と中国語を同時に学べるテキストRPG

import json
import random
from pathlib import Path

class LanguageRPG:
    def __init__(self):
        self.player = {
            "name": "",
            "level": 1,
            "exp": 0,
            "hp": 100,
            "max_hp": 100,
            "gold": 50,
            "english_exp": 0,
            "chinese_exp": 0,
            "inventory": [],
            "current_location": "始まりの村",
            "completed_quests": []
        }
        self.game_data = self._load_game_data()
        
    def _load_game_data(self):
        """ゲームデータを読み込む"""
        return {
            "locations": {
                "始まりの村": {
                    "name_en": "Starting Village",
                    "name_cn": "起始村庄",
                    "description": "英語と中国語が交じり合う不思議な村",
                    "npcs": ["村の長老", "言語の商人"],
                    "enemies": ["迷子のスライム"],
                    "connected": ["英語の森", "漢字の山"]
                },
                "英語の森": {
                    "name_en": "English Forest",
                    "name_cn": "英语森林",
                    "description": "英語の魔力が満ちた森",
                    "npcs": ["英語の妖精"],
                    "enemies": ["文法ゴブリン", "単語の狼"],
                    "connected": ["始まりの村", "文法の洞窟"]
                },
                "漢字の山": {
                    "name_cn": "汉字山",
                    "name_en": "Kanji Mountain",
                    "description": "古代の漢字が眠る山",
                    "npcs": ["書道の仙人"],
                    "enemies": ["難読ドラゴン", "四字熟語ゴーレム"],
                    "connected": ["始まりの村", "発音の谷"]
                }
            },
            "vocabulary": {
                "easy": [
                    {"jp": "水", "en": "water", "cn": "水 (shuǐ)", "theme": "nature"},
                    {"jp": "火", "en": "fire", "cn": "火 (huǒ)", "theme": "nature"},
                    {"jp": "木", "en": "tree", "cn": "木 (mù)", "theme": "nature"},
                    {"jp": "山", "en": "mountain", "cn": "山 (shān)", "theme": "nature"},
                    {"jp": "川", "en": "river", "cn": "河 (hé)", "theme": "nature"},
                    {"jp": "猫", "en": "cat", "cn": "猫 (māo)", "theme": "animal"},
                    {"jp": "犬", "en": "dog", "cn": "狗 (gǒu)", "theme": "animal"},
                    {"jp": "鳥", "en": "bird", "cn": "鸟 (niǎo)", "theme": "animal"},
                    {"jp": "食べる", "en": "eat", "cn": "吃 (chī)", "theme": "action"},
                    {"jp": "飲む", "en": "drink", "cn": "喝 (hē)", "theme": "action"},
                    {"jp": "行く", "en": "go", "cn": "去 (qù)", "theme": "action"},
                    {"jp": "来る", "en": "come", "cn": "来 (lái)", "theme": "action"},
                    {"jp": "大きい", "en": "big", "cn": "大 (dà)", "theme": "adjective"},
                    {"jp": "小さい", "en": "small", "cn": "小 (xiǎo)", "theme": "adjective"},
                    {"jp": "新しい", "en": "new", "cn": "新 (xīn)", "theme": "adjective"},
                    {"jp": "古い", "en": "old", "cn": "旧 (jiù)", "theme": "adjective"}
                ],
                "medium": [
                    {"jp": "図書館", "en": "library", "cn": "图书馆 (túshūguǎn)", "theme": "place"},
                    {"jp": "病院", "en": "hospital", "cn": "医院 (yīyuàn)", "theme": "place"},
                    {"jp": "郵便局", "en": "post office", "cn": "邮局 (yóujú)", "theme": "place"},
                    {"jp": "美術館", "en": "art museum", "cn": "美术馆 (měishùguǎn)", "theme": "place"},
                    {"jp": "冒険", "en": "adventure", "cn": "冒险 (màoxiǎn)", "theme": "concept"},
                    {"jp": "友情", "en": "friendship", "cn": "友谊 (yǒuyì)", "theme": "concept"},
                    {"jp": "挑戦", "en": "challenge", "cn": "挑战 (tiǎozhàn)", "theme": "concept"}
                ],
                "hard": [
                    {"jp": "責任感", "en": "sense of responsibility", "cn": "责任感 (zérèngǎn)", "theme": "abstract"},
                    {"jp": "創造力", "en": "creativity", "cn": "创造力 (chuàngzàolì)", "theme": "abstract"},
                    {"jp": "持続可能", "en": "sustainable", "cn": "可持续 (kěchíxù)", "theme": "abstract"}
                ]
            },
            "battles": {
                "文法ゴブリン": {
                    "hp": 30,
                    "weakness": "english",
                    "questions": [
                        {"q": "「私は学生です」の英語は？", "a": "I am a student", "type": "english"},
                        {"q": "「猫」の中国語は？", "a": "猫", "type": "chinese"}
                    ]
                },
                "単語の狼": {
                    "hp": 40,
                    "weakness": "chinese",
                    "questions": [
                        {"q": "「水」の英語は？", "a": "water", "type": "english"},
                        {"q": "Fire の中国語は？", "a": "火", "type": "chinese"}
                    ]
                }
            }
        }
    
    def start_game(self, player_name):
        """ゲーム開始"""
        self.player["name"] = player_name
        return f"""
🎮 語源の旅人 - Language RPG 🎮

ようこそ、{player_name}！
あなたは「語源の旅人」として、英語と中国語が交じり合う
不思議な世界を冒険します。

📍 現在の場所: {self.player['current_location']}
❤️ HP: {self.player['hp']}/{self.player['max_hp']}
⭐ Level: {self.player['level']}
💰 Gold: {self.player['gold']}
🇬🇧 英語経験値: {self.player['english_exp']}
🇨🇳 中国語経験値: {self.player['chinese_exp']}

【コマンド】
- explore: 周囲を探索
- study: 言語を勉強
- battle: モンスターと戦う
- move [場所名]: 移動する
- status: ステータス確認
- vocab: 単語帳を見る
"""
    
    def explore(self):
        """周囲を探索"""
        location = self.game_data["locations"][self.player["current_location"]]
        events = random.choice([
            "古い言語の石碑を見つけた！",
            "奇妙な音が聞こえる...",
            "光る単語が浮かんでいる！",
            "誰かの落とし物を見つけた"
        ])
        
        found = random.choice([
            {"item": "英語の辞書", "effect": "english_exp +10"},
            {"item": "中国語の字典", "effect": "chinese_exp +10"},
            {"item": "回復ポーション", "effect": "hp +20"},
            {"item": "言語の石", "effect": "exp +5"}
        ])
        
        self.player["inventory"].append(found["item"])
        
        return f"""
🔍 探索結果

{events}

手に入れた: {found['item']}
効果: {found['effect']}

周囲の情報:
- NPC: {', '.join(location['npcs'])}
- 危険: {', '.join(location['enemies'])}
- 行ける場所: {', '.join(location['connected'])}
"""
    
    def study(self, language="both"):
        """言語を勉強"""
        vocab_list = self.game_data["vocabulary"]["easy"]
        selected = random.sample(vocab_list, 3)
        
        result = "📚 言語学習セッション\n\n"
        
        for word in selected:
            result += f"""
━━━━━━━━━━━━━━━━
🇯🇵 {word['jp']}
🇬🇧 {word['en']}
🇨🇳 {word['cn']}
テーマ: {word['theme']}
━━━━━━━━━━━━━━━━
"""
        
        # 経験値獲得
        exp_gain = random.randint(5, 15)
        if language == "english" or language == "both":
            self.player["english_exp"] += exp_gain
        if language == "chinese" or language == "both":
            self.player["chinese_exp"] += exp_gain
        self.player["exp"] += exp_gain
        
        # レベルアップチェック
        level_up_msg = self._check_level_up()
        
        return result + f"\n✨ 経験値 +{exp_gain}！{level_up_msg}"
    
    def _check_level_up(self):
        """レベルアップチェック"""
        required_exp = self.player["level"] * 50
        if self.player["exp"] >= required_exp:
            self.player["level"] += 1
            self.player["max_hp"] += 20
            self.player["hp"] = self.player["max_hp"]
            return f"\n🎉 LEVEL UP! Lv.{self.player['level']}になった！"
        return ""
    
    def battle(self, enemy_name=None):
        """バトル開始"""
        location = self.game_data["locations"][self.player["current_location"]]
        
        if not enemy_name:
            if not location["enemies"]:
                return "この場所には敵がいないようだ..."
            enemy_name = random.choice(location["enemies"])
        
        if enemy_name not in self.game_data["battles"]:
            return f"{enemy_name}は見つからなかった..."
        
        enemy = self.game_data["battles"][enemy_name]
        enemy_hp = enemy["hp"]
        
        battle_log = f"""
⚔️ バトル開始！

{enemy_name} が現れた！
❤️ 敵HP: {enemy_hp}
弱点: {enemy['weakness']}

【問題に答えて攻撃！】
"""
        
        question = random.choice(enemy["questions"])
        battle_log += f"\n❓ {question['q']}"
        battle_log += f"\n💡 ヒント: これは{question['type']}の問題だ"
        
        return battle_log
    
    def answer_battle(self, answer, question_data):
        """バトルの回答判定"""
        if answer.lower() == question_data["a"].lower():
            damage = random.randint(15, 30)
            exp_gain = random.randint(10, 20)
            gold_gain = random.randint(5, 15)
            
            self.player["exp"] += exp_gain
            self.player["gold"] += gold_gain
            
            if question_data["type"] == "english":
                self.player["english_exp"] += 10
            else:
                self.player["chinese_exp"] += 10
            
            level_up_msg = self._check_level_up()
            
            return f"""
✅ 正解！

🗡️ {damage}ダメージ与えた！
⭐ 経験値 +{exp_gain}
💰 ゴールド +{gold_gain}
{level_up_msg}
"""
        else:
            damage_taken = random.randint(5, 15)
            self.player["hp"] -= damage_taken
            return f"""
❌ 不正解...
正解は「{question_data['a']}」だった

💔 {damage_taken}ダメージ受けた！
残りHP: {self.player['hp']}/{self.player['max_hp']}
"""
    
    def move(self, destination):
        """場所を移動"""
        current = self.game_data["locations"][self.player["current_location"]]
        
        if destination not in current["connected"]:
            return f"{destination}には直接行けない...\n行ける場所: {', '.join(current['connected'])}"
        
        if destination not in self.game_data["locations"]:
            return f"{destination}という場所は存在しない..."
        
        self.player["current_location"] = destination
        loc = self.game_data["locations"][destination]
        
        return f"""
🚶 {destination}に到着！

🇬🇧 {loc['name_en']}
🇨🇳 {loc['name_cn']}

{loc['description']}

ここにいるNPC: {', '.join(loc['npcs'])}
注意すべき敵: {', '.join(loc['enemies'])}
"""
    
    def get_status(self):
        """ステータス表示"""
        return f"""
📊 {self.player['name']} のステータス

❤️ HP: {self.player['hp']}/{self.player['max_hp']}
⭐ Level: {self.player['level']}
📈 経験値: {self.player['exp']}/{self.player['level'] * 50}
💰 Gold: {self.player['gold']}
📍 現在地: {self.player['current_location']}

🇬🇧 英語経験値: {self.player['english_exp']}
🇨🇳 中国語経験値: {self.player['chinese_exp']}

🎒 持ち物:
{chr(10).join(['- ' + item for item in self.player['inventory']]) if self.player['inventory'] else '- (なし)'}
"""
    
    def get_vocab_book(self):
        """単語帳を表示"""
        result = "📖 単語帳\n\n"
        
        for level in ["easy", "medium", "hard"]:
            result += f"\n【{level.upper()}】\n"
            for word in self.game_data["vocabulary"][level][:5]:
                result += f"{word['jp']} | {word['en']} | {word['cn']}\n"
        
        return result


# ゲームインスタンスを作成
game = LanguageRPG()

# 使用例（テスト）
if __name__ == "__main__":
    print(game.start_game("テストプレイヤー"))
    print("\n" + "="*50 + "\n")
    print(game.study())
