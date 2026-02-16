/* ============================================
   語源の旅人 - ストーリーシステム
   会話、クエスト管理、イベント処理
   ============================================ */

class StorySystem {
    constructor(game) {
        this.game = game;
        this.currentDialogue = null;
        this.currentQuest = null;
        this.completedQuests = [];
        this.activeQuests = [];
        this.storyFlags = {};
    }

    // ============================================
    // 会話システム
    // ============================================

    startDialogue(npcId) {
        const npc = this.getNPCData(npcId);
        if (!npc) return false;

        this.currentDialogue = {
            npc: npc,
            currentIndex: 0,
            dialogues: this.getDialogues(npc)
        };

        this.showDialogue();
        return true;
    }

    getNPCData(npcId) {
        // NPCデータを取得
        if (typeof StoryData !== 'undefined' && StoryData.characters[npcId]) {
            return StoryData.characters[npcId];
        }
        // デフォルトNPC
        return {
            id: npcId,
            name: '村人',
            description: '普通の村人',
            icon: '👤'
        };
    }

    getDialogues(npc) {
        // クエスト状態に応じた会話を選択
        if (npc.dialogues) {
            // クエスト関連の会話を優先
            for (const quest of this.activeQuests) {
                if (quest.giver === npc.id && npc.dialogues.quest_given) {
                    return npc.dialogues.quest_given;
                }
            }
            return npc.dialogues.default || [];
        }
        
        // デフォルト会話
        return [
            { text: 'こんにちは、旅人さん。', options: ['bye'] }
        ];
    }

    showDialogue() {
        const dialogue = this.currentDialogue;
        if (!dialogue || dialogue.currentIndex >= dialogue.dialogues.length) {
            this.endDialogue();
            return;
        }

        const current = dialogue.dialogues[dialogue.currentIndex];
        
        // UI更新
        const npcNameEl = document.getElementById('npc-name');
        const dialogueTextEl = document.getElementById('dialogue-text');
        const npcSprite = document.getElementById('npc-sprite');
        const dialogueOptions = document.getElementById('dialogue-options');

        if (npcNameEl) npcNameEl.textContent = dialogue.npc.name;
        if (dialogueTextEl) dialogueTextEl.textContent = current.text;
        if (npcSprite) npcSprite.textContent = dialogue.npc.icon;

        // 選択肢表示
        if (dialogueOptions) {
            dialogueOptions.innerHTML = '';
            
            if (current.options) {
                for (const option of current.options) {
                    const btn = document.createElement('button');
                    btn.className = 'dialogue-option';
                    btn.textContent = this.getOptionText(option);
                    btn.onclick = () => this.selectOption(option);
                    dialogueOptions.appendChild(btn);
                }
            } else {
                // 次へボタン
                const btn = document.createElement('button');
                btn.className = 'dialogue-option';
                btn.textContent = '次へ';
                btn.onclick = () => this.nextDialogue();
                dialogueOptions.appendChild(btn);
            }
        }

        // 会話ビューを表示
        this.game.showView('dialogue');
    }

    getOptionText(option) {
        const texts = {
            'continue': '続ける',
            'quest': 'クエストについて',
            'bye': 'さようなら',
            'accept': '引き受ける',
            'decline': '断る',
            'shop': '買い物をする',
            'talk': '話す'
        };
        return texts[option] || option;
    }

    selectOption(option) {
        switch (option) {
            case 'continue':
                this.nextDialogue();
                break;
            case 'bye':
                this.endDialogue();
                break;
            case 'accept':
                this.acceptQuest();
                break;
            case 'decline':
                this.nextDialogue();
                break;
            case 'shop':
                this.openShop();
                break;
            default:
                this.nextDialogue();
        }
    }

    nextDialogue() {
        if (this.currentDialogue) {
            this.currentDialogue.currentIndex++;
            this.showDialogue();
        }
    }

    endDialogue() {
        this.currentDialogue = null;
        this.game.showView('exploration');
    }

    // ============================================
    // クエストシステム
    // ============================================

    acceptQuest() {
        const npc = this.currentDialogue?.npc;
        if (!npc) return;

        // NPCからクエストを取得
        const quest = this.getQuestFromNPC(npc.id);
        if (quest) {
            this.startQuest(quest);
            this.addLog(`クエスト「${quest.title}」を受注した！`);
        }

        this.endDialogue();
    }

    getQuestFromNPC(npcId) {
        // StoryDataからクエストを検索
        if (typeof StoryData !== 'undefined') {
            // メインクエスト
            for (const quest of StoryData.mainQuests) {
                if (quest.objectives.some(o => o.text.includes(npcId))) {
                    return { ...quest, type: 'main' };
                }
            }
            // サブクエスト
            for (const quest of StoryData.subQuests) {
                if (quest.giver === npcId && !this.isQuestActive(quest.id) && !this.isQuestCompleted(quest.id)) {
                    return { ...quest, type: 'sub' };
                }
            }
        }
        return null;
    }

    startQuest(quest) {
        const activeQuest = {
            ...quest,
            acceptedAt: Date.now(),
            progress: quest.objectives.map(o => ({
                ...o,
                completed: false,
                current: o.current || 0
            }))
        };

        this.activeQuests.push(activeQuest);
        this.game.showNotification(`クエスト開始: ${quest.title}`, 'success');
    }

    updateQuestProgress(target, amount = 1) {
        let updated = false;

        for (const quest of this.activeQuests) {
            for (const obj of quest.progress) {
                if (!obj.completed && obj.target === target) {
                    obj.current += amount;
                    if (obj.current >= obj.count) {
                        obj.current = obj.count;
                        obj.completed = true;
                        this.addLog(`クエスト目標達成: ${obj.text}`);
                    }
                    updated = true;
                }
            }

            // クエスト完了チェック
            if (this.isQuestComplete(quest)) {
                this.completeQuest(quest);
            }
        }

        if (updated) {
            this.updateQuestUI();
        }
    }

    isQuestComplete(quest) {
        return quest.progress.every(o => o.completed);
    }

    completeQuest(quest) {
        // アクティブから削除
        this.activeQuests = this.activeQuests.filter(q => q.id !== quest.id);
        
        // 完了リストに追加
        this.completedQuests.push({
            ...quest,
            completedAt: Date.now()
        });

        // 報酬付与
        if (quest.reward) {
            if (quest.reward.exp) {
                this.game.gainExp(quest.reward.exp);
            }
            if (quest.reward.gold) {
                this.game.gainGold(quest.reward.gold);
            }
            if (quest.reward.items) {
                for (const item of quest.reward.items) {
                    this.game.inventory.addItem(item, 1);
                }
            }
        }

        this.game.showNotification(`クエスト完了: ${quest.title}`, 'success');
        this.addLog(`クエスト「${quest.title}」を完了した！`);

        // メインクエストの場合、次の章を解放
        if (quest.type === 'main' && quest.unlockArea) {
            this.game.unlockArea(quest.unlockArea);
        }

        this.updateQuestUI();
    }

    isQuestActive(questId) {
        return this.activeQuests.some(q => q.id === questId);
    }

    isQuestCompleted(questId) {
        return this.completedQuests.some(q => q.id === questId);
    }

    // ============================================
    // メインクエスト進行
    // ============================================

    checkMainQuestProgress() {
        // 現在のメインクエストをチェック
        const currentMainQuest = this.getCurrentMainQuest();
        if (!currentMainQuest) return;

        // 自動進行する条件をチェック
        for (const obj of currentMainQuest.progress) {
            if (!obj.completed) {
                switch (obj.target) {
                    case 'level':
                        if (this.game.player.level >= obj.count) {
                            this.updateQuestProgress('level');
                        }
                        break;
                    case 'talk':
                        // 会話は手動で更新
                        break;
                    default:
                        // 敵討伐などはバトルシステムから更新
                        break;
                }
            }
        }
    }

    getCurrentMainQuest() {
        return this.activeQuests.find(q => q.type === 'main');
    }

    // ============================================
    // ストーリーフラグ
    // ============================================

    setFlag(flag, value = true) {
        this.storyFlags[flag] = value;
    }

    getFlag(flag) {
        return this.storyFlags[flag] || false;
    }

    // ============================================
    // ショップ
    // ============================================

    openShop() {
        const npc = this.currentDialogue?.npc;
        if (npc && npc.shopItems) {
            this.game.openShop(npc.shopItems);
        }
        this.endDialogue();
    }

    // ============================================
    // UI更新
    // ============================================

    updateQuestUI() {
        const questList = document.getElementById('quest-list');
        if (!questList) return;

        // タブ状態を取得
        const activeTab = document.querySelector('.quest-tab.active');
        const filter = activeTab ? activeTab.dataset.filter : 'active';

        let quests = [];
        if (filter === 'active') {
            quests = this.activeQuests;
        } else {
            quests = this.completedQuests;
        }

        questList.innerHTML = quests.map(quest => {
            const progress = quest.progress.map(o => {
                const status = o.completed ? '✓' : `${o.current}/${o.count}`;
                return `<li>${o.text} (${status})</li>`;
            }).join('');

            return `
                <div class="quest-item ${quest.type} ${filter === 'completed' ? 'completed' : ''}">
                    <h4>${quest.title}</h4>
                    <p>${quest.description}</p>
                    <ul class="quest-progress">${progress}</ul>
                </div>
            `;
        }).join('');

        if (quests.length === 0) {
            questList.innerHTML = `<p style="text-align: center; color: var(--text-muted);">クエストがありません</p>`;
        }
    }

    // ============================================
    // ユーティリティ
    // ============================================

    addLog(message) {
        if (this.game.addLog) {
            this.game.addLog(message);
        }
    }

    // セーブデータ
    getSaveData() {
        return {
            activeQuests: this.activeQuests,
            completedQuests: this.completedQuests,
            storyFlags: this.storyFlags
        };
    }

    loadSaveData(data) {
        if (data.activeQuests) this.activeQuests = data.activeQuests;
        if (data.completedQuests) this.completedQuests = data.completedQuests;
        if (data.storyFlags) this.storyFlags = data.storyFlags;
    }
}

// グローバルにエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorySystem;
}
