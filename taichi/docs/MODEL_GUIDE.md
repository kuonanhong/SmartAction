# v2 更新：文字模型與真人肢體模型分離

本版實測與下載狀態請見 [MODEL_VERIFICATION.md](MODEL_VERIFICATION.md)，人體模型限制見 [BODY_TRACKING.md](BODY_TRACKING.md)。核心 ZIP 已內附人体模型；484 MB Qwen 分片另附。

# CPU 離線生成式教練

採用 **Qwen3-0.6B Q4_K_M**，約 484 MB；由 wllama 3.8.1 / llama.cpp 在瀏覽器的 CPU 以 WebAssembly 執行。GitHub Pages 提供 HTML、JavaScript、WASM 與選用模型檔案；推論發生在開啟網頁的手機或電腦上，不是在 GitHub 伺服器執行。

Qwen3 是免費開源的多語言文字模型。本套件使用 bartowski 的 Q4_K_M 量化版本，固定來源版本與 SHA-256，並保留 Qwen 的 Apache-2.0 授權。官方 Qwen GGUF 頁面提供的是 Q8_0；本包沒有把第三方量化誤稱為官方量化。

這是手機、CPU、中文與英語對話品質之間的取捨，沒有證據可稱為「全球最準」。Qwen 本身不看攝影機、不偵測身體；v2 由另一個 MediaPipe CPU 模組測量粗略手腳位置，只將有效摘要傳給 Qwen。提供給模型的是目前課程、招式名稱、教材要領、遊戲虛擬角色分數、有效時的正面 2D 真人比對摘要、天氣與輸入的問題。示意動畫尚須由授課老師核定，模型不能替代武術老師或醫療人員。

## 三種使用方式

1. **直接開始玩**：不載入模型仍可用。對話區會明確顯示「課程提示」，回覆来自本套課程要領，不是生成式 AI。
2. **網頁按「下載 CPU 模型」**：初次需要網路下載約 484 MB。每個分片校驗後嘗試儲存在瀏覽器 IndexedDB。下載成功且瀏覽器允許持久儲存時，下次可按「載入已部署模型」使用快取；網站本體也須已快取，才能完全斷網開啟。隱私瀏覽、儲存不足或系統清除快取時可能需要重抓。下載來源是 Hugging Face；問題內容不會傳給下載來源。
3. **下載到自己電腦再部署**：在此套件目錄執行以下指令。程式只用 Python 3 標準庫，不需要 Homebrew、Rust、GPU 或額外 pip 套件。

   ```bash
   python3 tools/download_model.py
   ```

   Mac 可執行 `bash tools/Download_Model.command`；Windows 可雙擊 `tools/Download_Model.bat`。程式建立 `models/qwen3-0.6b-q4km.part01` 到 `.part15`。它們与 `models/manifest.json` 放一起，整個 `models/` 與 `index.html` 同層。切勿只上傳 manifest 而宣稱模型已部署。

若已經下載完整原始 GGUF，可在網頁選擇本機檔案，或用：

```bash
python3 tools/download_model.py --file "/完整路徑/Qwen_Qwen3-0.6B-Q4_K_M.gguf"
```

程式會驗證固定檔案大小、完整 SHA-256 與各分片 SHA-256；檔案來源不符會拒絕。網頁本機選檔也逐片驗證，且不會上傳該檔案。

## 附件、效能與部署

- **標準程式 ZIP 不包含 484 MB 模型權重**，但包含所有 CPU 執行器 WASM、Safari 相容檔、下載程式、模型清單與授權。模型是明確選用，頁面不會一開啟就自動下载這 484 MB。
- 模型實體已於 2026-10-09 下載並驗證；清單記錄固定來源 revision、完整 SHA-256 及 15 片 SHA-256。最大分片 32 MiB，最後一片約 14.46 MB。另使用與此 WASM 執行器相同版本的原生 llama.cpp b11364，在單一 CPU 執行緒驗證生成繁中與英文回答；此原生測試不代表已在每款手機瀏覽器完成 WASM 效能測試。可透過普通 Git 上傳，不需 Git LFS；請用 Git 指令或部署工作流程，GitHub 網頁上傳有較小檔案限制。
- 採 **單一 CPU 執行緒、1024 token 上下文、最多 140 token 回覆、禁止 WebGPU**。Qwen3 關閉思考模式 `enable_thinking:false` 並附 `/no_think`，避免把漫長推理過程顯示為教練答案。這些參數偏向降低手機負擔與縮短回覆，並非模型能力上限。
- 即使檔案約 484 MB，推論與檔案驗證還需要額外記憶體。低記憶體手機可能無法載入；可以繼續用教材提示。快慢依裝置而定，本包沒有宣稱特定手機的秒數或每秒 token。
- 問題不包含完整對話歷史，每次以目前招式教材重新建立上下文，避免超過小型 CPU 上下文。模型仍可能錯誤或混用字形；教材要領才是可核對的來源。
- 必須用 HTTPS 或 `http://localhost` 開啟網站；不可透過 `file://` 執行瀏覽器 Worker 模型。地理定位也通常要求 HTTPS。`http://192.168.x.x` 等普通區網網址不是安全來源，模型載入會受瀏覽器限制。
- GitHub Pages 是靜態網站，模型在訪客端執行，所以不需要將 Python 推論伺服器上傳到 Pages。此網站加上模型通常小於 Pages 的 1 GB 已發佈網站大小上限；請仍以打包後實際總量與 GitHub 現行政策確認。

## 固定模型來源

- 原始模型與說明：https://huggingface.co/Qwen/Qwen3-0.6B
- 官方 GGUF（Q8_0）：https://huggingface.co/Qwen/Qwen3-0.6B-GGUF
- 本包 Q4_K_M 量化：https://huggingface.co/bartowski/Qwen_Qwen3-0.6B-GGUF
- 固定下載：https://huggingface.co/bartowski/Qwen_Qwen3-0.6B-GGUF/resolve/60b85c0e3d8fe0f6474f406922a26d12aca4550d/Qwen_Qwen3-0.6B-Q4_K_M.gguf?download=true
- 模型大小：`484220320` bytes
- 完整 SHA-256：`9acfc1e001311f34b4252001b626f2e466d592a42065f66571bff3790d4e1b14`
- 執行器：https://github.com/ngxson/wllama/releases/tag/3.8.1

## English

This package uses Qwen3-0.6B Q4_K_M (484 MB), quantized by bartowski, with a pinned revision and SHA-256. Official Qwen GGUF currently supplies Q8_0. It is a practical size/quality trade-off, not a claim of global accuracy leadership.

The optional model runs locally in the browser using self-hosted wllama 3.8.1, WebAssembly, one CPU thread, a 1024-token context, and disabled GPU and thinking mode. The standard app ZIP includes runtime files and download tools, but excludes the 484 MB weights. Press Download CPU model to fetch and verify them, or run `python3 tools/download_model.py` and deploy the resulting 15 segments in `models/`. Each segment is at most 32 MiB and can use ordinary Git. Without loaded weights, replies are clearly labeled course guides rather than generated answers.

Questions remain on the device. Downloading contacts Hugging Face for model bytes only. Browser caching and available memory vary; persistent offline access requires both cached model bytes and cached website files. Use HTTPS or localhost; `file://` and plain HTTP LAN addresses cannot reliably run this model. This assistant receives course text, avatar scores and, only when valid, coarse 2D body metrics from the separate local MediaPipe module. It never receives camera images. It is not a certified martial-arts instructor or a medical professional.
