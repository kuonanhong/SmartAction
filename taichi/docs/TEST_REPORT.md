# SmartAction Taichi v4 驗證紀錄

日期：2026-10-11。環境：Linux、Node.js、Python。此報告記錄程式與素材驗證，不代替手機／桌機的實際發聲與畫面測試。

## 本次結果

- `npm run build` 成功；重新產生 v4 `js/game.js`（2,765,027 bytes）及人体辨識 Worker。使用 classic bundle，完整解壓後的 `file://` 基本遊戲不依賴網路載入 ES module。相機、模型與完整離線功能仍建議 localhost／HTTPS。
- `npm test`：**171 項通過，0 失敗、0 跳過**。包括分發 bundle 的啟動、按鈕、多指操作、語音介面接線、遊戲三模式、散步保存恢復、姿態評分、18 語覆蓋、3 個新增語言教練提示、全景投影，以及離線 HTTP Range。
- `tests/deploy_fixture_test.py`：**18 項通過**；`tests/dual_deploy_fixture_test.py`：**12 項通過**。使用本地 Git fixtures／mock，不是向使用者儲存庫推送。驗證兩站路徑、首頁入口、其他內容保留、重跑、拒絕後恢復、分批，以及新自然音訊與 layout 模組的遞迴收錄。
- `bash -n Upload_SmartAction.sh Upload_Both_Sites.sh` 通過。
- `npm run check` 核對相對依賴、重複／缺少 ID、18 語 UI 及狀態字串、音訊與照片授權清單、大小與 SHA-256、WASM／人體模型、離線清單、Qwen 分片描述；通過。Qwen 權重為選用 **0/15 本地分片**，沒有誤報為已含於 ZIP。

## 本次語音與控制盤修正的驗證

- 語音控制器 **21 項 v4 回歸案例**：閒置不取消、重複同句不打斷、原生朗讀永不開始／報錯後切已知音檔、兩種播放均遭阻擋時如實顯示、保留重試句、晚到系統聲音清單、頁面生命週期、來源 metadata、語速與明確重播等。
- 實際 bundle **6 項聲音 UI 整合案例**：8 聲線匯入、排隊不冒充播放、語言別聲線及速度記憶、過濾選單、尚未到位的 OS 聲線仍可辨認、自由教練答案改用系統聲音、固定音檔備援。
- 版面以 DOM 結構及 CSS／viewport 高度預算驗證：練習畫面緊接操作盤，原有 116 個 ID 保留；六種螢幕尺寸、旋轉／viewport 變動、左右盤 44 px 觸控鍵、短畫面可捲、設定面板退出專注時狀態同步。**不是實際瀏覽器排版截圖驗證**。
- `speechSynthesis.onstart`／`audio.onplaying` 只代表 API 進入播放，不證明喇叭音量、藍牙路由或靜音狀態。截圖中的「尚未開始播放」不能單独判定作業系統故障原因。

## 隨附語音與語系

- **8 種自然合成聲**：普通話與美式英文各 2 男、2 女；每種 37 式＋試聽，共 **304 MP3、7,712,112 bytes**。Kokoro CPU float32 實際產製。全檔 FFmpeg 解碼、有限非靜音樣本、雜湊與繁簡名稱對應檢查通過；8 個試聽雜湊不同。不是真人配音或母語者校聽證明。中文為 zh-CN 普通話，不宣稱臺灣口音。
- 產製來源、固定修訂、模型及軟體授權、聲線 metadata 與重製指令見 `NATURAL_VOICE_LICENSES.md`；不把 Kokoro 生成權重放入網頁，也不透過網頁執行任意自然 TTS。
- **18 語機械備援**：每語 37 式＋試聽，共 **684 MP3、9,106,552 bytes**。全檔大小／SHA-256 檢查；本次新增俄、土、荷三語的試聽另以 FFmpeg 解碼及 RMS 檢查，皆非靜音。原 15 語已於 v3 作同類驗證。
- 每語 **180 UI＋167 狀態字串**，插值欄位一致。新增俄文、土耳其文、荷蘭文涵蓋 13 課程、131 動作、24 銜接。原有 15 語與姿勢資料雜湊未改。課程提示非拳師認證，亦非各語母語者人工逐句審核；來源引文與地名可保留原文。
- 37 式以外的課程喊招、自由輸入的教練答案，仍需相符系統聲音。無可用聲音時保留文字及實際錯誤，不假稱生成語音。

## 保留的素材與功能

158 地點、155 組授權真實照片、5 組有來源證明的 360×180 全景、2 段 12 秒平面影片；來源與雜湊核對通過。衛武營照片保留「自然探索區，非榕園精確鏡位」說明。夢裡森林公園、雙湖森林公園、仁武運動公園沒有已核實授權照片；夢裡座標未確認時只作地名查詢，不使用虛構 0,0。

保留 13 課程、37 式預設、三難度、六回合對練、60 秒節奏攻防、附近走走與恢復練習、三視角、+5% 水平視野、可選相機姿態辨識與 CPU 文字教練。人物、地面、樹木是程序 3D；背景實景照片不是可自由走入的測繪數位雙生。Google 街景另開官方頁面。

## 尚未驗證與部署狀態

- 沒有 iPhone、iPad、Android 實體裝置，也未執行 Safari、Chrome、Firefox、Edge、Samsung Internet 真實瀏覽器的音效、WebGL 或長時間效能測試。DOM 使用 Happy DOM、Canvas／音訊事件替身；未以模擬宣稱實機通過。
- `DEVICE_TESTS.html` 29 個人工項目全部預設未測，含 v4 男女聲、桌機／手機備援及底部控制盤。需依實際裝置逐項填寫。
- 本次未下載／推論新的 Qwen 權重。沿用固定 Qwen3-0.6B Q4_K_M：484,220,320 bytes、15 片、完整及逐片 SHA-256。v2 CPU 測試歷史見 `MODEL_VERIFICATION.md`，不代替本次手機 WASM 驗證。
- 本次未推送使用者 GitHub，也未更動 Pages 設定。下載 ZIP 後由使用者執行 `Upload_Both_Sites.sh --fresh-login`，缺少權重會自動下載核對，再更新兩站。Git 成功與 Pages 發布成功須分別確認。

## 可重跑驗證

```bash
npm install
npm run build
npm test
python3 tests/deploy_fixture_test.py
python3 tests/dual_deploy_fixture_test.py
python3 tools/generate_natural_speech.py --verify-only
python3 tools/package.py
npm run check
```

一般使用者不需 Node 或重建即可使用附帶的 `js/game.js`。若已安裝完整模型，可另外執行 `node tools/check.mjs --require-model`。
