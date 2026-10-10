# SmartAction v2 實際驗證報告

日期：2026-10-10。環境：Linux x86_64，Node 24.19.0，Python 3.12.14。

- 48/48 Node 測試：課程等待/保持/難度、肢體控制、對打邏輯、37式可達目標、九語系資料、人體比對公式、相機生命週期模擬，以及實際 classic bundle 的 DOM 操作。
- DOM 測試使用 happy-dom、受控 requestAnimationFrame 與 Canvas 替身；測試 file:// 和 HTTPS 的 URL 情境。它不是 Safari/Chrome 的渲染測試。
- 上傳腳本 v2.1：10/10 本地 bare-Git 整合測試。包括新建、更新、no-op、保留原首頁、LFS過濾覆蓋、第二批失敗續傳、奇數片尾批次、不安全路徑/錯誤模型拒絕；新增獨立 taichi 根目錄、拒絕覆寫 SmartAction 根目錄、預檢拒絕時不下載、不沿用 askpass/HTTP認證標頭、全域設定不變、臨時認證目錄清除、旁邊模型分片合併與 pose 保留。沒有實際對使用者 GitHub 寫入。
- Qwen3：實際下載15分片、整體484,220,320 bytes和各片SHA-256通過。同版本llama.cpp单CPU、GPU=0，繁中/英文生成成功；速度與回答問題詳見 MODEL_VERIFICATION.md。
- MediaPipe：下載12個 runtime/模型附件的雜湊通過；.task 中含真實 TFLite 人體偵測及關鍵點權重。沒有執行真人攝影機推論。
- 發佈檢查器核對 HTML/JS/CSS 相對附件、入口、語系、照片授權/雜湊、Wllama/MediaPipe runtime/模型、離線快取清單與Qwen15片。以隨附驗證輸出為準。

## 尚未執行

實體 iPhone/iPad/Android、macOS/Windows 真實瀏覽器、WebGL畫面、手機CPU/WASM生成、真人相機推論、實體雙指、系統語音、GPS權限/附近API、真實GitHub部署。不能把程式測試或API存在檢查寫成上述實機通過。

依 Sites 技能，managed 環境缺少 control-browser 時不可啟動替代瀏覽器測試；本次遵守此限制。可使用 DEVICE_TESTS.html 在實際裝置逐項記錄並匯出JSON。

## 重跑

```bash
npm install
npm run build
npm test
python3 tests/deploy_fixture_test.py
python3 tools/package.py
node tools/check.mjs --require-model
```

若沒有安裝大型Qwen分片，最後一行改成 `node tools/check.mjs`，會明列0/15模型而不是宣稱權重已包含。
