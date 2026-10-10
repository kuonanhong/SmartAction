# SmartAction 聰動太極拳遊戲 v2

此套件是可下載、可部署到 GitHub Pages 的互動教學原型。預設衛武營場景、鄭曼青 37 式；13 類課程共 131 個練習節點，九種語言（繁中、簡中、英、日、韓、西、法、德、葡），依瀏覽器語言自動選擇，可手動切換。

## 先讓遊戲動起來

1. 完整解壓縮 `SmartAction_Taichi_Game_v2.zip`，不要只抽出 index.html。
2. 電腦直接雙擊 `index.html` 即可操作核心遊戲；v2 以已打包的 `js/game.js` 載入，不再靠 file:// 不允許的 ES module 匯入。
3. 如需 CPU 對話模型、攝影機、定位或離線快取，請使用本地啟動檔或 HTTPS 網址。

Mac（解壓到下載資料夾）：
```bash
bash "$HOME/Downloads/SmartAction_Taichi_Game_v2/Start_Mac.command"
```
Windows：雙擊 `Start_Windows.bat`。Linux：`bash Start_Linux.sh`。啟動檔使用 Python 3 標準函式庫，不必 pip install。缺少 Python 時，請先從 https://www.python.org/downloads/ 安裝。伺服器啟動後保留終端機，關閉時按 Ctrl+C。手機請使用部署完成的 HTTPS 網址；電腦的 localhost 不能直接當成手機的網址。

## 操作

左控制盤移動腳、右控制盤移動手；各自的換腳／換手按鈕支援觸控。鍵盤 W/A/S/D 控制腳、方向鍵控制手；Q/E 換脚／換手，F/B 手前伸／收回，J/K 抬腳／落腳，Z/C 轉腰，X/T 蹲下／站起，V/N 伸展／放鬆。空白鍵暫停、R 老師再示範、H 動作輔助，1/2/3 切換視角。對打 P 出手、G 按住格擋。

按開始，老師示範一式後會等玩家。基本／專業／大師級分別要求不同角色姿態吻合度與保持時間；各部位也有最低門檻。輔助完成有標記，大師級不提供輔助。專注模式仍有「返回選單」。觸控可同時按住兩個控制鍵；抬手、切換頁面及視窗失焦時釋放按鍵，避免卡住。

## 37 式的範圍

預設編號依鄭曼青紀念館同網域的時中學社《學員手冊》：https://www.37taichi.org.tw/shizhong/學員手冊 。第1式為預備式，37式為彎躬射虎。名稱分組可能與其他教學版本不同。

3D 人物使用程序骨架與姿態插值，非拳師動作捕捉。37 個主式各有目標姿勢；拳譜另列的 24 個重複、銜接、收式存於 `continuations`，目前不逐段演示或評分。其餘拳種也屬遊戲練習編排。不可當作完整、經拳師驗證的套路教材。詳見 `docs/CURRICULUM_SOURCES.md`。

## 三種不同技術

| 模組 | 用途 | 權重與執行方式 |
|---|---|---|
| Qwen3 0.6B Q4_K_M | 依當前教材、問題、角色分數及有效的攝影機摘要產生文字 | 484,220,320 bytes，15 個分片；Wllama / WASM，單 CPU 執行緒，無 GPU |
| MediaPipe Pose Landmarker Lite | 從攝影機估算 33 個身體關鍵點，顯示粗略手腳比對及調整提示 | 5,777,746-byte `.task` 真實權重已內含；CPU Worker |
| 程序 3D 人物 | 老師、玩家、同好、手腳控制與視角 | 無神經網路權重；Three.js 與 IK |

Qwen 不是臉部表情模型，也不是身體動作辨識或動畫生成模型。本專案沒有使用 LivePortrait。身體辨識由獨立 MediaPipe 模型負責；教練只收到數值摘要，不收到攝影機畫面。

### Qwen 模型是否已經包含？

上一版約 11 MB 核心 ZIP 沒有包含 484 MB 權重。此 v2 核心 ZIP 也刻意分開大型 Qwen 權重，但人體辨識權重已內含。本次已實際下載 Qwen 全部15片並核對 SHA256；另提供 `SmartAction_Qwen3_CPU_Weights.zip`，將其中 `models` 內的15片複製進遊戲的 `models/`（保留原有 `pose/` 等檔案）。

也可直接執行 `Download_Model.command`（Mac）、`Download_Model.bat`（Windows）或 `python3 tools/download_model.py`。固定模型來源與各片雜湊在 `models/manifest.json`。完整檔 SHA256：`9acfc1e001311f34b4252001b626f2e466d592a42065f66571bff3790d4e1b14`。

開啟本地啟動網址或 HTTPS 網站後，展開「與練拳教練對話」→「離線生成式模型」→「載入已下載模型」。也可在網頁按「下載並啟用」直接從來源下載。看到 CPU / Qwen3 就緒才是生成式回答；尚未載入時明確標示「課程資料提示（非生成式）」。

網頁下載的權重放在瀏覽器儲存空間，**不會自動出現在你電腦專案的 models 資料夾，也不會自動上傳 GitHub**。要發布模型檔，使用下載腳本或上傳腳本 `--with-model`。GitHub Pages 只供應檔案，推論在訪客裝置執行。首次需網路；檔案與模型快取完成後才可離線。瀏覽器可能清除快取，CPU AI 也可能因手機記憶體不足而載入失敗。

### 對話及語音

輸入問題按送出。可勾選朗讀回答、重播答案、停止朗讀，或在支援的瀏覽器按語音輸入。朗讀使用作業系統／瀏覽器的語音；能否離線取決於是否安裝對應語音。語音輸入可能使用瀏覽器線上服務，並非 Qwen 本地語音辨識。文字與本地生成式模型不必把問題送給 AI 雲端服務。

小模型不是經驗證的太極專家。實測曾出現語義錯誤；請以顯示的教材及現場老師為準，不把生成內容當成醫療或動作安全判定。

### 真人動作比對

在 HTTPS 或 localhost 點「真人肢體比對」→「啟用攝影機」。相機只在按鈕操作後請求權限；請讓全身、手腕、腳踝入鏡並面向鏡頭。影像在本機 CPU Worker 處理，不錄影、不上傳；停止、離開頁面或切到背景會關閉攝影機。

分數只比對經身體比例正規化的正面 2D 手腕／腳踝位置；它與遊戲角色分數分開，不會讓角色自動過關。無人、低可信度、腳部被裁切、側身或目標需明顯轉腰時不提供分數。不能評估深度、完整腰轉、受力、膝關節安全或拳術品質。缺少 Worker、OffscreenCanvas、createImageBitmap 或攝影機 API 的瀏覽器會提示無法啟用，核心按鍵仍可玩。詳見 `docs/BODY_TRACKING.md`。

## 地圖、照片與環境

內附9張有出處、作者和授權的實景照。預設位置為衛武營；預設背景照是衛武營自然探索區，不宣稱是榕園的精密掃描。日光、氣候、天氣、季節是視覺模擬，不是即時氣象。Google 地圖與附近查詢需網路；定位只在按「尋找附近」後要求授權。沒有查到可用授權照片時，顯示虛擬場景，不用其他地點照片冒充。來源見 `docs/PHOTO_CREDITS.md`。

## 一個指令上傳

在完整解壓後的專案根目錄已附 `Upload_SmartAction.sh`。Mac：
```bash
bash "$HOME/Downloads/SmartAction_Taichi_Game_v2/Upload_SmartAction.sh" --with-model
```
此選項會下載／驗證缺少的 Qwen 權重，先上傳網站，再分批上傳模型，成功批次不必重傳。只想先發布遊戲：
```bash
bash "$HOME/Downloads/SmartAction_Taichi_Game_v2/Upload_SmartAction.sh" --web-only
```
Linux 也可用 bash；Windows 安裝 Git for Windows 和 Python 3 後在 Git Bash 執行 `bash Upload_SmartAction.sh --with-model`。不需 Git LFS、不把大型完整 `.gguf` 直接 git add、不將 Token 寫入檔案。Git 與 Python 必須先存在。

預設目標 `https://github.com/kuonanhong/SmartAction.git` 的 `taichi/`；保留根首頁與其他遠端檔案，不 force push。上傳腳本會比較內容、驗證檔案與遠端 SHA；有變更才提交。上傳中斷可重跑同一指令。這不會自動改 GitHub Pages 的發佈設定。

請完整閱讀 `docs/UPLOAD_PAT.html`，內有 PAT 申請、Pages 設定、分批上傳及錯誤排除。最終網址應是 https://kuonanhong.github.io/SmartAction/taichi/ ，只有你執行上傳且 Pages 部署成功後才存在新版。

## 測試的實際範圍

已執行：48 項 Node 邏輯／DOM 回歸、模型與附件雜湊、CPU 原生 Qwen 生成測試，以及本地 bare-Git 上傳／續傳整合測試。DOM 測試使用 Canvas 替身，非真實瀏覽器畫面測試；原生 CPU 結果不能推算手機或 WASM 速度。

未完成：iPhone/iPad/Android 實機、真實 WebGL 畫面、各手機瀏覽器的攝影機推論與語音測試。環境沒有實體裝置，也缺少 Sites 技能所要求的 control-browser，因此不得宣稱實機全部通過。附 `docs/DEVICE_TESTS.html` 可在各裝置填寫20项測試、記錄版本並匯出 JSON；初始結果全部未測。

## 給開發者

一般使用者不需 npm。修改 js/data 後，需 `npm install`、`npm run build`，重新生成已打包的核心與 classic CPU worker；只改 source 不重建，index.html 仍會載入旧 game.js。`npm test` 執行回歸，`npm run check` 核對依賴，`python3 tools/package.py` 重新打包核心（不含大型 Qwen 分片）。

所有相對路徑支援 `/SmartAction/taichi/`，不需要後端 AI API 金鑰。自己的程式 MIT；Qwen、MediaPipe、Three.js、Wllama 與照片各按隨附授權使用。
