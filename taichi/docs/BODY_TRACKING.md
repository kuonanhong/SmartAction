# 真人身體辨識：CPU 實驗功能

本版隨附 **MediaPipe Pose Landmarker Lite** 的實際權重，檔案位置為 `models/pose/pose_landmarker_lite.task`，大小 **5,777,746 bytes**。它不是下載連結、Git LFS 指標或模擬偵測資料。CPU 推論需要的 JavaScript、SIMD / 非 SIMD WebAssembly 也已放在 `vendor/pose/`。

## 三種模型的工作不同

| 名稱 | 接收內容 | 產生內容 | 在本專案的用途 |
|---|---|---|---|
| Qwen3 0.6B | 文字問題、課程名稱、可用的數值回饋 | 新生成的文字回答 | 生成式文字教練。不是表情辨識、影片理解或骨架模型。484,220,320 bytes 的 GGUF 屬於另一份大型選配權重；請依專案模型下載說明取得。 |
| MediaPipe Pose Landmarker Lite | 使用者明確開啟的攝影機畫面 | 33 個身體關鍵點、可見度及估計座標 | 新增的真人身體位置辨識與粗略 2D 分數。不是生成影片或生成武術動作的模型。 |
| LivePortrait | 人像與驅動訊號 / 影像 | 動態人像 | 先前人像博物館相關。不是太極全身正確性判斷模型；本遊戲未使用。 |

語音朗讀使用瀏覽器的 Speech Synthesis 和作業系統語音。它與以上模型相互獨立；可用聲線、語言及能否完全離線，依裝置而異。

## 使用方法

1. 使用專案啟動檔，從 `http://localhost:8088` 開啟，或使用 GitHub Pages 的 HTTPS 網址。
2. 點選頁面中的攝影機按鈕，再同意瀏覽器的攝影機權限。錄音不是身體辨識的必要權限。
3. 將手機固定，拍到頭、雙手、髖部、膝蓋及腳踝；畫面內維持一位玩家。保持正面、明亮、無遮擋，讓全身距離畫面邊緣留有空間。
4. 觀察「真人 2D」的獨立分數與文字提示。這個分數不會冒充遊戲人物的按鍵操作分數，也不會自動替遊戲人物通關。
5. 按停止會關閉所有攝影機軌道；切到其他分頁或鎖定畫面也會停止，回來後需自行再開啟。

直接雙擊 `index.html` 的 `file://` 模式可使用遊戲核心；**攝影機模型功能會要求改用 localhost / HTTPS**。這是為了模型載入、Worker 與瀏覽器安全來源要求。局域網的 `http://192.168.x.x` 通常不符合手機攝影機的安全來源要求；請用 HTTPS 網址。拒絕權限、缺少 Worker / OffscreenCanvas、模型讀取失敗時，核心按鍵遊戲仍可操作。

## 分數實際代表什麼

- 使用 MediaPipe 輸出的**真人**左右手腕、腳踝、肩膀與髖部座標，不從按鍵位置冒充真人資料。
- 先檢查全身關鍵點可見度；被裁切、太遠、可信度不足或身體明顯側向時，顯示「無可用分數」，不以 0 分或舊分數代替。
- 以肩膀到髖部的長度正規化，降低身高、鏡頭距離及畫面比例的影響；再比較手腕 / 腳踝相對於程序化示範人物的**正面 2D 投影**。
- 提示中的左 / 右是玩家的**身體左 / 右**，不是螢幕像素的左 / 右。顯示鏡像攝影機預覽不會交換左右關節身分。
- `hands` 與 `feet` 分別取兩側的平均，`total` 是兩者等權平均。容差採軀幹長度的 0.38；這是本遊戲的啟發式參數，沒有專業師資校正資料集。
- 額外顯示的肘 / 膝角度也是 2D 投影角度，未納入「安全」判斷。
- 轉腰超過示範值約 0.70 rad 的目標不作正面 2D 比較；其他動作的前後深度、真實重心、足底受力、呼吸、關節受力、連貫招式與太極功法正確性均未評量。
- 100 分只表示本次幾何比較接近，不是動作經老師驗證正確。不同身材、衣物、鏡頭角度、遮擋及模型估計誤差會影響結果。正式教學應由師資標註的多視角動作資料與實測來校正。

本版是可操作的電腦視覺原型，不是醫療診斷或人體動作安全認證工具。若動作不適，應停止。

## CPU 與手機效能

明確設定 `delegate: 'CPU'`。模型在獨立 Web Worker 執行，畫面傳為 `ImageBitmap`，預設最多每秒 8 次辨識，未使用多個推論工作同時搶 CPU。畫面預處理與遊戲 3D 繪圖可能使用瀏覽器的圖形功能；「CPU 模型」並不表示整個 3D 網頁完全禁用圖形硬體。

選擇 Lite 是為了較小的體積與 CPU 負擔，不代表它是精度最高的模型。實際速度、溫度、電池及準確率必須在使用者裝置上測量。官方 Web 文件以 Chrome / Safari 為支援平台；本套件**沒有宣稱所有 iOS、Android、Firefox 或廠商瀏覽器均已做過實機測試**。缺少必要功能時會停用攝影機選配功能。

本次完成：純函式評分測試、缺點拒評測試、目標深度不被錯當成可觀測值的測試、攝影機權限拒絕 / 取消競態 / 背景釋放的模擬測試，以及下載來源及 SHA-256 檢查。這些不是攝影機實機測試，也不能證明 Safari / Android 相機推論的端到端成功。

## 開發介面

```js
const tracker = new BodyTracker({
  onStatus: ({code, message}) => { /* permission/loading/ready/stopped/error */ },
  onFrame: ({landmarks, worldLandmarks, metrics, inferenceMs}) => { /* 更新 UI */ }
});
tracker.setTarget(currentMove.pose);
await tracker.start(videoElement); // 必須由使用者點按觸發
tracker.stop();
```

純評分 API：`evaluateBodyPose(landmarks, targetPose, {width, height, worldLandmarks})`。

有效結果：`{valid:true,total,hands,feet,angles,corrections,experimental:true,scope:'frontal-2d'}`。

`corrections` 的 `part` 是 `leftHand / rightHand / leftFoot / rightFoot`，`direction` 是 `up / down / left / right`；`amount` 是以軀幹長度正規化的差距。不要把它顯示成精確公分。

無效結果：`{valid:false,total:null,reason}`。`reason` 為 `no-person / low-confidence / full-body / too-small / face-camera / no-target / target-turn`。

本專案程式不錄影、不儲存原始畫面、不上傳攝影機畫面或骨架。模型與執行程式從同一網站的本地檔案載入。提供給文字教練的是可用的摘要數值，不是攝影機影像。

## 固定版本、授權及原始資料

- 執行套件：`@mediapipe/tasks-vision@0.10.21`，Apache-2.0；npm tarball 的 SHA-512 integrity 已檢查。
- 模型：`pose_landmarker_lite/float16/1`；SHA-256 `59929e1d1ee95287735ddd833b19cf4ac46d29bc7afddbbf6753c459690d574a`。
- 模型下載：https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task
- 模型卡（本套件也附 PDF；第 2 頁列明 Apache License 2.0）：https://storage.googleapis.com/mediapipe-assets/Model%20Card%20BlazePose%20GHUM%203D.pdf
- 官方模型說明：https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker
- Web API 與主執行緒同步阻塞說明：https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js
- CPU / GPU delegate 與平台說明：https://developers.google.com/edge/mediapipe/solutions/setup_web
- Qwen3 官方模型：https://huggingface.co/Qwen/Qwen3-0.6B
- 原始套件來源與每個檔案雜湊：`vendor/pose/manifest.json`。

可執行 `node --test tests/body*.test.mjs` 重跑模擬測試。實際攝影機、效能及觸控仍須執行 `docs/DEVICE_TESTS.html` 的裝置驗收步驟（若另有更新版測試報告，請以該報告列出的已測裝置為準）。
