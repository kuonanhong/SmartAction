# SmartAction Taichi v3 驗證紀錄

日期：2026-10-11。測試環境：Linux / Node.js / Python。原始碼已重新打包為 `js/game.js`，不是沿用 v2 bundle。

## 本次完成

- `npm run build`：成功產生 classic 核心 bundle 與人體辨識 Worker；核心 bundle 約 2.51 MB。只有預設照片內嵌，其他 154 組場景照片按需載入，避免首次解析全部圖片。
- `npm test`：115 項全部通過。範圍包含真正 bundled entry 在模擬 `file:` 與 `https:` 環境啟動、按鈕接線、多指控制、分數與最低部位門檻、六回合對練、60 秒節奏對打、散步保存/恢復、三視角與 +5% 水平視野、影像切換、360 投影方向、地圖空座標處理、15 語覆蓋、語音點擊/錯誤/預錄備援、模型未載時提示。
- Safari 型態音訊範圍請求：另以 Service Worker 模擬測試快取 MP3 的 HTTP 206 位元組切片、尾段與 416 超界回應。這是協定邏輯驗證，不是 Safari 實機播放驗證。
- `tests/deploy_fixture_test.py`：18 項本地 Git fixture。
- `tests/dual_deploy_fixture_test.py`：11 項雙站/首頁/分批 fixture；150 MiB 網站只分成 2 次 push。雙站共用憑證快取以 mock 驗證，此執行環境不允許 Unix socket，沒有把它當成 macOS 憑證快取實測。
- 158 個不同地點、155 組真實照片、5 組來源證明為 360×180 的全景、2 段 12 秒平面影片；核對作者、授權、大小與 SHA256。原預設衛武營照片保留「自然探索區，非榕園精確镜位」說明。
- 570 段機械合成 MP3：15 語各 37 式名稱＋1 試聽句，共 7,549,394 bytes；逐檔雜湊檢查，15 語試聽檔另以 ffmpeg 解碼核對非靜音。不是母語者校聽或真人配音。
- 三個指定地點沒有可用授權照片：夢裡森林公園、雙湖森林公園、仁武運動公園。夢裡座標尚未確認，只提供地名查詢，不虛構 0,0。
- 原本 13 課程、131 動作節點、24 銜接名稱補齊新增六語；全 15 語文字欄位完整。新語要領依同姿勢端點詞庫及安全條件產生，不是逐句翻譯或拳師認證。

## 沒有完成或沒有宣稱

- 沒有 iPhone、iPad、Android 實體裝置測試，也沒有 Safari / Chrome / Firefox / Samsung Internet 真實音效、WebGL 畫面或長時間效能測試。DOM 使用 Happy DOM 與 Canvas 替身。
- 本環境沒有網站流程要求的 control-browser；未啟動預覽伺服器或用替代方式偽稱瀏覽器 QA。`docs/DEVICE_TESTS.html` 的 26 項裝置記錄全部預設「未測」。
- 沒有在使用者 GitHub 實際推送或修改 Pages 設定。須由使用者執行附帶腳本並等待兩個 Pages 部署完成。
- v3 本次沒有重新下載並推論完整 Qwen 權重；沿用與 v2 相同的固定 manifest、15 片總長與 SHA256。v2 原生 CPU 實測歷史保留於 `MODEL_VERIFICATION.md`，不代替本次 WASM/手機測試。
- 程序人物、地面、樹木與居民不是實景掃描。一般照片僅作背景，全景提供旋轉視角；所有自由步行都是明確標示的虛擬位移。Google 街景從官方頁面另開，不把其影像下載、快取或冒作本地數位雙生。
- 原生語音取決於裝置。預錄只覆蓋鄭曼青 37 式與試聽，任意生成答案與其他拳種需已安裝的相符 OS 語音。播放事件只證明 API 進入播放，不證明音量未靜音。

## 發布前檔案核對

`python3 tools/package.py` 產生 ZIP、離線清單及 `PACKAGE_SHA256.json`；`npm run check` 核對 HTML/JS/CSS 相對依賴、ID、語系、場景授權/雜湊、WASM、人體模型與 Qwen 分片 manifest。Qwen 分片未含於核心 ZIP，不應將選用權重的 0/15 本地數量誤報成全部權重已交付。

資料與功能證據以附帶測試、manifest、來源圖錄及本文件的明確範圍為準。
