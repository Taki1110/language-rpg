/**
 * オーディオ管理システム
 */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = false;
        this.bgm = null;
        this.sounds = {};
        this.volume = 0.5;
        this.bgmOscillators = [];
    }

    // 初期化
    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.enabled = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }

    // BGM再生（ドラクエ風8bit音楽）
    playBGM(type) {
        if (!this.enabled || !this.ctx) return;

        this.stopBGM();

        const melodies = {
            'title': this.createTitleMelody(),
            'field': this.createFieldMelody(),
            'battle': this.createBattleMelody(),
            'victory': this.createVictoryMelody(),
            'dungeon': this.createDungeonMelody()
        };

        const melody = melodies[type];
        if (melody) {
            this.playMelody(melody);
        }
    }

    // BGM停止
    stopBGM() {
        this.bgmOscillators.forEach(osc => {
            try {
                osc.stop();
                osc.disconnect();
            } catch (e) {}
        });
        this.bgmOscillators = [];
    }

    // メロディ再生
    playMelody(notes) {
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        
        notes.forEach((note, index) => {
            if (note.frequency > 0) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = 'square';
                osc.frequency.value = note.frequency;
                
                gain.gain.setValueAtTime(this.volume * 0.1, now + note.time);
                gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start(now + note.time);
                osc.stop(now + note.time + note.duration);
                
                this.bgmOscillators.push(osc);
            }
        });
    }

    // タイトルメロディ
    createTitleMelody() {
        const baseFreq = 440;
        const notes = [];
        const melody = [
            1, 0, 3, 0, 5, 0, 8, 0,
            5, 0, 3, 0, 1, 0, 0, 0,
            3, 0, 5, 0, 6, 0, 5, 0,
            3, 0, 1, 0, 0, 0, 0, 0
        ];
        
        const scale = [0, 2, 4, 5, 7, 9, 11, 12];
        
        melody.forEach((note, i) => {
            if (note > 0) {
                const semitones = scale[note - 1];
                const freq = baseFreq * Math.pow(2, semitones / 12);
                notes.push({
                    frequency: freq,
                    time: i * 0.25,
                    duration: 0.2
                });
            }
        });
        
        return notes;
    }

    // フィールドメロディ
    createFieldMelody() {
        const baseFreq = 330;
        const notes = [];
        
        for (let i = 0; i < 32; i++) {
            const pattern = [0, 4, 7, 4, 0, 5, 9, 5];
            const semitones = pattern[i % pattern.length];
            const freq = baseFreq * Math.pow(2, semitones / 12);
            
            notes.push({
                frequency: freq,
                time: i * 0.5,
                duration: 0.3
            });
        }
        
        return notes;
    }

    // 戦闘メロディ
    createBattleMelody() {
        const baseFreq = 220;
        const notes = [];
        
        for (let i = 0; i < 16; i++) {
            const pattern = [0, 3, 6, 3, 0, 4, 7, 4];
            const semitones = pattern[i % pattern.length];
            const freq = baseFreq * Math.pow(2, semitones / 12);
            
            notes.push({
                frequency: freq,
                time: i * 0.25,
                duration: 0.15
            });
        }
        
        return notes;
    }

    // 勝利メロディ
    createVictoryMelody() {
        const baseFreq = 523.25; // C5
        const notes = [];
        const melody = [
            { semitones: 0, duration: 0.25 },
            { semitones: 0, duration: 0.25 },
            { semitones: 0, duration: 0.25 },
            { semitones: 4, duration: 0.5 },
            { semitones: 2, duration: 0.25 },
            { semitones: 4, duration: 0.75 }
        ];
        
        let time = 0;
        melody.forEach(note => {
            const freq = baseFreq * Math.pow(2, note.semitones / 12);
            notes.push({
                frequency: freq,
                time: time,
                duration: note.duration
            });
            time += note.duration;
        });
        
        return notes;
    }

    // ダンジョンメロディ
    createDungeonMelody() {
        const baseFreq = 196;
        const notes = [];
        
        for (let i = 0; i < 24; i++) {
            const pattern = [0, 3, 0, 5, 0, 3, 0, 6];
            const semitones = pattern[i % pattern.length];
            const freq = baseFreq * Math.pow(2, semitones / 12);
            
            notes.push({
                frequency: freq,
                time: i * 0.6,
                duration: 0.4
            });
        }
        
        return notes;
    }

    // SE再生
    playSE(type) {
        if (!this.enabled || !this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        switch (type) {
            case 'cursor':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                break;
                
            case 'confirm':
                osc.type = 'square';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                break;
                
            case 'cancel':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                break;
                
            case 'attack':
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                break;
                
            case 'damage':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                break;
                
            case 'heal':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.linearRampToValueAtTime(800, now + 0.3);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
                break;
                
            case 'levelup':
                osc.type = 'square';
                const levelUpNotes = [523.25, 659.25, 783.99, 1046.50];
                levelUpNotes.forEach((freq, i) => {
                    const noteOsc = this.ctx.createOscillator();
                    const noteGain = this.ctx.createGain();
                    noteOsc.type = 'square';
                    noteOsc.frequency.value = freq;
                    noteGain.gain.setValueAtTime(0.1, now + i * 0.15);
                    noteGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.2);
                    noteOsc.connect(noteGain);
                    noteGain.connect(this.ctx.destination);
                    noteOsc.start(now + i * 0.15);
                    noteOsc.stop(now + i * 0.15 + 0.2);
                });
                return;
                
            case 'victory':
                osc.type = 'square';
                const victoryNotes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
                victoryNotes.forEach((freq, i) => {
                    const noteOsc = this.ctx.createOscillator();
                    const noteGain = this.ctx.createGain();
                    noteOsc.type = 'square';
                    noteOsc.frequency.value = freq;
                    noteGain.gain.setValueAtTime(0.1, now + i * 0.1);
                    noteGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.15);
                    noteOsc.connect(noteGain);
                    noteGain.connect(this.ctx.destination);
                    noteOsc.start(now + i * 0.1);
                    noteOsc.stop(now + i * 0.1 + 0.15);
                });
                return;
        }

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
    }

    // 音量設定
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }
}

// グローバルに公開
window.AudioManager = AudioManager;
