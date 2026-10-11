SmartAction 太極遊戲 v3 實景素材集 / 2026-10-11

158 個不同地點：臺灣82處、海外76處。155 處附可再散布的真實攝影（其中5處真360全景、2處影片封面），3處僅保留地點資料。所有攝影來自 Wikimedia Commons，保留作者、來源檔案頁、授權與授權連結。圖片與影片的個別授權不被主程式授權取代。

實際素材大小 39,032,356 bytes（約37.2 MiB）。普通圖片多為960px縮圖。5幅球面環景為1280×640，來源明確標示360×180等距柱狀投影；2段影片各12秒，768×432，H.264 MP4、無音訊。影片是平面拍摄而非360影片。原始照片包含地面視角與俯瞰視角，以原拍攝內容為準，沒有生成圖像冒充實景。

檔案：
- places.json：完整資料陣列；names['zh-Hant']/names.en、lat/lng、country、region、regionCode、city、kind、photo、video、mapUrl。
- credits.json：每張照片/影片的個別作者、CC或公眾領域授權、来源、變更、SHA256。
- ASSET_CREDITS.html：可離線打開的授權與來源圖錄。
- photoAssets/：本地圖片。
- videoAssets/：本地MP4。
- coverage.json：覆蓋數、授權種類、已知缺項。
- restore_assets.py：缺檔時按固定清單重新下載，普通圖片只需Python3；重建影片另需FFmpeg。已附完整素材時無須重建。

資料精度：157處有代表座標，並非園區每條路徑的測繪模型。Google Maps 連結指向代表點，不能把遊戲中的模擬步行視作真實GPS導航。僅用到2個 OpenStreetMap 點位（雙湖森林公園、草悟道），相關座標在資料中註明 © OpenStreetMap contributors / ODbL 1.0：https://www.openstreetmap.org/copyright 。其餘座標來自Wikipedia/Wikidata、Commons拍攝資訊或官方景點地圖。

三處未找到可再散布的對應照片：夢裡森林公園、雙湖森林公園、仁武運動公園。不可把別處照片當成這三處。夢裡森林公園亦未核得精確代表座標，lat/lng=null，Google地圖採名稱搜尋；目前開放狀態應查主管機關，不宣稱已正式開放。

僅5處資料的 photo.projection='equirectangular'、panoramaVerified=true，可使用真正球面360投影；一般照片projection='rectilinear'。一般照片平移或景深效果只是視覺模擬，並非該地點的完整3D重建。無下載、截取或再散布任何Google街景/地圖圖磚。若要即時街景請使用Google官方入口/合法API。

影像條款：CC BY要求保留作者及授權、註明修改；CC BY-SA還要求適用衍生影像以相容授權分享。縮圖、顯示裁切、影片截短、移除音軌與重新編碼均已在個別modifications中註明。
