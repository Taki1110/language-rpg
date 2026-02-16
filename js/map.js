/**
 * マップ管理システム
 */

class GameMap {
    constructor() {
        this.currentMap = null;
        this.tileSize = 32;
        this.maps = {};
        this.camera = { x: 0, y: 0 };
        this.tileset = null;
    }

    // マップデータの読み込み
    async loadMap(mapName) {
        if (this.maps[mapName]) {
            this.currentMap = this.maps[mapName];
            return this.currentMap;
        }

        try {
            const response = await fetch(`data/maps/${mapName}.json`);
            const mapData = await response.json();
            this.maps[mapName] = mapData;
            this.currentMap = mapData;
            return mapData;
        } catch (e) {
            console.error('マップ読み込みエラー:', e);
            // デフォルトマップを生成
            this.currentMap = this.generateDefaultMap(mapName);
            return this.currentMap;
        }
    }

    // デフォルトマップ生成
    generateDefaultMap(name) {
        const width = 30;
        const height = 20;
        const map = {
            name: name,
            width: width,
            height: height,
            tileSize: 32,
            layers: [],
            events: [],
            encounters: name === 'village' ? false : true
        };

        // 地面レイヤー
        const groundLayer = [];
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                if (name === 'village') {
                    // 村マップ
                    if (x >= 8 && x <= 22 && y >= 6 && y <= 14) {
                        row.push(2); // 床
                    } else {
                        row.push(1); // 草
                    }
                } else if (name === 'field') {
                    // フィールドマップ
                    row.push(1); // 草
                } else if (name === 'dungeon') {
                    // ダンジョンマップ
                    row.push(4); // 床
                } else {
                    row.push(1);
                }
            }
            groundLayer.push(row);
        }
        map.layers.push({ name: 'ground', data: groundLayer });

        // 障害物レイヤー
        const objectLayer = [];
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                row.push(0);
            }
            objectLayer.push(row);
        }

        // マップ固有のオブジェクト配置
        if (name === 'village') {
            // 家
            this.placeHouse(objectLayer, 10, 8);
            this.placeHouse(objectLayer, 18, 8);
            this.placeHouse(objectLayer, 10, 12);
            this.placeHouse(objectLayer, 18, 12);
            
            // 木
            this.placeTree(objectLayer, 5, 5);
            this.placeTree(objectLayer, 25, 5);
            this.placeTree(objectLayer, 5, 15);
            this.placeTree(objectLayer, 25, 15);
            
            // 出口
            objectLayer[19][15] = 99; // フィールドへ
        } else if (name === 'field') {
            // 木をランダムに配置
            for (let i = 0; i < 15; i++) {
                const tx = Math.floor(Math.random() * (width - 4)) + 2;
                const ty = Math.floor(Math.random() * (height - 4)) + 2;
                this.placeTree(objectLayer, tx, ty);
            }
            
            // 村への入口
            objectLayer[5][5] = 98;
            
            // ダンジョンへの入口
            objectLayer[15][15] = 97;
        } else if (name === 'dungeon') {
            // 壁で囲む
            for (let x = 0; x < width; x++) {
                objectLayer[0][x] = 5;
                objectLayer[height - 1][x] = 5;
            }
            for (let y = 0; y < height; y++) {
                objectLayer[y][0] = 5;
                objectLayer[y][width - 1] = 5;
            }
            
            // 内部の壁
            for (let i = 0; i < 20; i++) {
                const wx = Math.floor(Math.random() * (width - 4)) + 2;
                const wy = Math.floor(Math.random() * (height - 4)) + 2;
                objectLayer[wy][wx] = 5;
            }
            
            // 出口
            objectLayer[1][1] = 96; // フィールドへ
        }

        map.layers.push({ name: 'objects', data: objectLayer });

        // イベント設定
        map.events = this.generateEvents(name);

        return map;
    }

    // 家を配置
    placeHouse(layer, x, y) {
        // 2x2の家
        layer[y][x] = 6;
        layer[y][x + 1] = 6;
        layer[y + 1][x] = 6;
        layer[y + 1][x + 1] = 7; // ドア
    }

    // 木を配置
    placeTree(layer, x, y) {
        layer[y][x] = 3;
    }

    // イベント生成
    generateEvents(mapName) {
        const events = [];
        
        if (mapName === 'village') {
            events.push({
                x: 12, y: 8,
                type: 'npc',
                npcId: 'village_elder'
            });
            events.push({
                x: 8, y: 12,
                type: 'shop',
                npcId: 'shop_owner'
            });
            events.push({
                x: 15, y: 12,
                type: 'inn',
                npcId: 'innkeeper',
                price: 10
            });
        }
        
        return events;
    }

    // 指定位置のタイルを取得
    getTile(layerName, x, y) {
        if (!this.currentMap) return 0;
        
        const layer = this.currentMap.layers.find(l => l.name === layerName);
        if (!layer) return 0;
        
        if (y < 0 || y >= this.currentMap.height || x < 0 || x >= this.currentMap.width) {
            return 0;
        }
        
        return layer.data[y][x];
    }

    // 通行可能かチェック
    isPassable(x, y) {
        const tile = this.getTile('objects', x, y);
        // 0は通行可能、それ以外は障害物
        return tile === 0 || tile >= 96; // 96以上はイベント/移動ポイント
    }

    // イベントチェック
    checkEvent(x, y) {
        if (!this.currentMap || !this.currentMap.events) return null;
        
        return this.currentMap.events.find(e => e.x === x && e.y === y);
    }

    // 移動先チェック
    checkTransition(x, y) {
        const tile = this.getTile('objects', x, y);
        
        // 移動ポイント
        const transitions = {
            96: { map: 'field', x: 5, y: 6 },      // ダンジョン→フィールド
            97: { map: 'dungeon', x: 2, y: 2 },    // フィールド→ダンジョン
            98: { map: 'village', x: 15, y: 18 },  // フィールド→村
            99: { map: 'field', x: 5, y: 4 }       // 村→フィールド
        };
        
        return transitions[tile] || null;
    }

    // エンカウントチェック
    checkEncounter(x, y) {
        if (!this.currentMap || !this.currentMap.encounters) return null;
        
        // エンカウント率（歩数に応じて増加）
        const encounterRate = 0.05; // 5%
        
        if (Math.random() < encounterRate) {
            const encounters = GameData.encounters[this.currentMap.name] || 
                              GameData.encounters['field'];
            
            // 重み付きランダム選択
            const totalWeight = encounters.reduce((sum, e) => sum + e.weight, 0);
            let random = Math.random() * totalWeight;
            
            for (const enc of encounters) {
                random -= enc.weight;
                if (random <= 0) {
                    return enc.enemy;
                }
            }
        }
        
        return null;
    }

    // カメラ位置の更新
    updateCamera(playerX, playerY, canvasWidth, canvasHeight) {
        const mapPixelWidth = this.currentMap.width * this.tileSize;
        const mapPixelHeight = this.currentMap.height * this.tileSize;
        
        // プレイヤーを中心に
        let camX = playerX * this.tileSize - canvasWidth / 2;
        let camY = playerY * this.tileSize - canvasHeight / 2;
        
        // マップ境界内に制限
        camX = Math.max(0, Math.min(camX, mapPixelWidth - canvasWidth));
        camY = Math.max(0, Math.min(camY, mapPixelHeight - canvasHeight));
        
        this.camera.x = camX;
        this.camera.y = camY;
    }

    // マップ描画
    render(ctx, canvasWidth, canvasHeight) {
        if (!this.currentMap) return;
        
        // カメラ範囲内のタイルのみ描画
        const startCol = Math.floor(this.camera.x / this.tileSize);
        const endCol = startCol + Math.ceil(canvasWidth / this.tileSize) + 1;
        const startRow = Math.floor(this.camera.y / this.tileSize);
        const endRow = startRow + Math.ceil(canvasHeight / this.tileSize) + 1;
        
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // 各レイヤーを描画
        for (const layer of this.currentMap.layers) {
            for (let row = Math.max(0, startRow); row < Math.min(endRow, this.currentMap.height); row++) {
                for (let col = Math.max(0, startCol); col < Math.min(endCol, this.currentMap.width); col++) {
                    const tile = layer.data[row][col];
                    if (tile !== 0) {
                        this.drawTile(ctx, tile, col, row);
                    }
                }
            }
        }
        
        ctx.restore();
    }

    // タイル描画
    drawTile(ctx, tileId, x, y) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;
        
        // タイルタイプに応じた色と形状
        const colors = {
            1: '#4a7c59', // 草
            2: '#8b7355', // 床
            3: '#2d5016', // 木
            4: '#4a4a4a', // 石床
            5: '#666666', // 壁
            6: '#8b4513', // 家
            7: '#654321', // ドア
        };
        
        const color = colors[tileId] || '#333';
        ctx.fillStyle = color;
        
        if (tileId === 3) {
            // 木
            ctx.fillRect(px + 8, py + 8, 16, 16);
            ctx.fillStyle = '#1a3d0a';
            ctx.fillRect(px + 4, py + 4, 24, 20);
        } else if (tileId === 6) {
            // 家
            ctx.fillRect(px, py, this.tileSize * 2, this.tileSize * 2);
            // 屋根
            ctx.fillStyle = '#8b0000';
            ctx.beginPath();
            ctx.moveTo(px - 4, py);
            ctx.lineTo(px + this.tileSize, py - 16);
            ctx.lineTo(px + this.tileSize * 2 + 4, py);
            ctx.fill();
        } else if (tileId === 7) {
            // ドア
            ctx.fillStyle = '#4a3728';
            ctx.fillRect(px + 4, py, this.tileSize - 8, this.tileSize);
        } else if (tileId >= 96) {
            // 移動ポイント（見えない）
        } else {
            // 通常タイル
            ctx.fillRect(px, py, this.tileSize, this.tileSize);
            
            // ハイライト
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(px, py, this.tileSize, this.tileSize / 2);
        }
    }
}

// グローバルに公開
window.GameMap = GameMap;
