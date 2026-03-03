使用aria2c下載器對相同的hfs3服務器進行地毯式的鏡像備份，目前仍在測試完善中。
因爲我正在備份一個3000萬個文件的巨大網站，所以仍需要時間測試以及改善。
這個插件的運行機制類似大自然裏面的黏菌生存機制，多分支節點備份比對數據完整性。
僅限於hfs3與hfs3之間的數據鏡像備份，傳統的數據備份估計不行，因爲用到了hfs3的getfilelist列表讀取。

Using the aria2c downloader to perform a comprehensive mirror backup of the same HFS3 server, currently still in testing and refinement.
Because I am backing up a massive website with 30 million files, it still requires time for testing and improvement.
The operating mechanism of this plugin is similar to the survival mechanism of slime molds in nature, using multi-branch node backup to compare data integrity.
Limited to data mirror backup between HFS3 and HFS3, traditional data backup probably won't work because it uses HFS3's getfilelist reading.
