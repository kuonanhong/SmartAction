# 模型實際下載與 CPU 驗證紀錄

驗證日期：2026-10-10。這份紀錄區分「權重已下載」、「原生 CPU 能生成文字」與「手機瀏覽器已實測」，三者不能互相替代。

## 各模組的工作

| 模組 | 輸入與用途 | 本版交付 |
| --- | --- | --- |
| Qwen3-0.6B Q4_K_M | 文字生成：依本回合課程要領、提問、虛擬角色分數，以及有提供時的粗略攝影機指標，產生簡短說明。不是臉部表情模型，也不是肢體辨識模型。 | 484,220,320 bytes，分成 15 片；另附權重包，主程式也提供固定來源下載器。 |
| MediaPipe Pose Landmarker Lite | 由相機畫面估計身體關鍵點。模型本身可輸出 33 個關鍵點；本遊戲只用可靠且可見的正面手腕、腳踝等資料做粗略比對。 | `models/pose/pose_landmarker_lite.task`，5,777,746 bytes，含於主程式包。 |
| Three.js 與關節動畫 | 顯示老師、玩家與同好；由程式的姿態資料及反向運動學控制。 | 隨附原始碼與函式庫；沒有把程序動畫說成真人動作捕捉。 |
| 瀏覽器語音 | 唸招式與對話答案；可選語音輸入。 | 使用系統／瀏覽器提供的語音能力；不是 Qwen 的聲音，也沒有另附聲音模型。離線可用性取決於已安裝的語音與瀏覽器，語音輸入可能使用網路服務。 |

MediaPipe 是姿態估計模型，不是「已學會鄭曼青 37 式正確程度」的分類器。本版攝影機分數是實驗性正面 2D 手腳位置比對，不能判斷前後深度、腰轉、重心力學或練習安全；不能稱為經老師驗證的真人太極評分。Qwen 收到的是文字指標，不會取得影像，也不會自行從影像認出玩家的動作。

## 已下載檔案的驗證

- Qwen 原始模型：`Qwen/Qwen3-0.6B`；量化作者：`bartowski`。
- 固定量化來源 revision：`60b85c0e3d8fe0f6474f406922a26d12aca4550d`。
- 檔名：`Qwen_Qwen3-0.6B-Q4_K_M.gguf`。
- 15 個分片的位元組數與 SHA-256 全部符合 `models/manifest.json`。
- 合併後大小：`484220320` bytes（約 484.2 MB／461.8 MiB）。
- 合併 SHA-256：`9acfc1e001311f34b4252001b626f2e466d592a42065f66571bff3790d4e1b14`。
- 每個完整分片 32 MiB，最後一片 14,458,272 bytes；這些是普通位元組分段，載入前合成一個 Blob，並非可各自推論的 GGUF 模型。

舊版的小型主程式 ZIP 並未包含這 484 MB 權重；只有 WASM 執行器、下載器與模型清單。新版另外提供實體權重附件，避免把「有清單」誤認成「已上傳模型」。下載到本機、把附件合併至本機資料夾、上傳至 GitHub、GitHub Pages 發佈完成，仍是四個不同狀態。

## 本次真正執行的生成測試

測試機是 Linux x86_64，CPU 顯示 AMD EPYC 9V74。使用官方 llama.cpp `b11364` 原生 CPU 程式，commit `46ca246de`；隨附 Wllama 3.8.1 的 JavaScript 記錄相同 libllama 版本 `b11364-46ca246`。官方下載壓縮檔的 SHA-256 亦符合 GitHub release metadata：

`7ccbd9c9e3220a5cfb9d4f87abc6c62824ee6461d480eb764aee110310ac43c0`

設定：1 個推論執行緒、1 個 prompt 處理執行緒、0 GPU layers、禁用 KV offload、1024 token 上下文、64 batch／ubatch、最多 140 回覆 tokens、seed 42、temperature 0.7、top-k 20、top-p 0.8、min-p 0、presence penalty 1.5，關閉 thinking。

測試直接由本版 `Coach.ask()` 擷取實際 system／user prompt，沒有手寫一個比較容易的替代 prompt。攝影機指標是明確註記為 synthetic test 的人工測試值；這項測試不使用真人相機。

| 測試 | 程序結果 | 含載入總耗時 | 原生程式回報生成速率 |
| --- | --- | --- | --- |
| 繁中：「我的手應該放哪裡？」 | 成功，exit 0 | 4.538 秒 | 26.8 tokens／秒 |
| 英文：「Where should my hands be?」 | 成功，exit 0 | 5.179 秒 | 30.2 tokens／秒 |

繁中實際回答：

> 我手應該放在胸前，保持自然呼吸和注意力。

英文實際回答：

> Your hands should be raised slowly in front of the chest with soft elbows, and your knees should not be shrugged. The camera data provided shows that the left wrist is below target and the right ankle is too narrow, so your position may need adjustment.

英文結果將「勿聳肩」錯誤連到 knees，繁中也沒有完全遵守兩句要求。這證明模型有實際產生文字，也顯示小模型並不總是準確：上述句子是測試紀錄，不應作為正確的練拳教材。畫面中的可核對教材要領與現場老師指導優先，不能宣稱這個 0.6B 模型是最準確或專業評鑑模型。

以上速率只屬於這一台原生 Linux CPU 測試機。瀏覽器 WASM、Safari 相容模式、手機記憶體與 CPU 都會改變表現，不能把上述秒數當成手機承諾。

## 瀏覽器程式的靜態核對

- `coach.js` 使用本地 `vendor/wllama/main/esm/index.js`，不是在回答時呼叫雲端文字生成服務。
- `n_gpu_layers:0` 在隨附 Wllama source 會設定 `noWebGPU`；`n_threads:1` 會使用單執行緒。
- `setCompat({wasm,worker}, 'firefox_safari')` 與 `createChatCompletion()` 的串流 `onData` 參數符合隨附 3.8.1 API；Safari／Firefox 相容 WASM 與 worker 路徑指向本地檔案。
- 首次下載接觸 Hugging Face 的模型網址；提問和文字生成留在使用者裝置。網頁模型快取使用 IndexedDB，儲存不足、隱私模式或系統清除快取都可能導致下次必須重新下載。
- 模型功能需要 HTTPS 或 localhost、安全來源、WebAssembly SIMD／exception handling 等能力；不能因一般遊戲畫面可直接雙擊 HTML，就推論模型 Worker 也可在 `file://` 下啟動。
- 1024-token 上下文不代表可做無限長對話；本版每次只傳目前一回合的精簡教材與問題。

未完成的驗證：實體 iPhone／iPad Safari、Android Chrome／Samsung Internet／Firefox、各手機瀏覽器 WASM 端到端載入與效能、實體相機姿態偵測精度、手機語音可用性。此文件沒有將原生 CPU 文字測試冒充上述測試。

## 一手來源

- [Qwen 官方模型卡](https://huggingface.co/Qwen/Qwen3-0.6B)
- [本包固定量化模型](https://huggingface.co/bartowski/Qwen_Qwen3-0.6B-GGUF/tree/60b85c0e3d8fe0f6474f406922a26d12aca4550d)
- [Wllama 官方程式庫](https://github.com/ngxson/wllama)
- [llama.cpp 官方 b11364 release](https://github.com/ggml-org/llama.cpp/releases/tag/b11364)
- [Google MediaPipe Pose Landmarker 說明](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker)

Qwen 權重及 MediaPipe 相應檔案保留其各自授權；第三方函式庫與模型的授權不會因本遊戲程式使用 MIT 而改變。
