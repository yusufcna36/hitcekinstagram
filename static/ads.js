function watchAd() {
    console.log("Reklam butonu tıklandı - RichAds push başlatılıyor");

    // RichAds push script'i (zaten https, ama emin olalım)
    var script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://richinfo.co/richpartners/push/js/rp-cl-ob.js?pubid=1002390&siteid=388020&niche=33';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.onload = function() {
        console.log("RichAds script yüklendi");
    };
    script.onerror = function() {
        console.error("RichAds script yüklenemedi");
    };
    document.head.appendChild(script);

    // Push gösterildikten sonra kredi ekle (RichAds callback yoksa 5 sn sonra otomatik)
    setTimeout(() => {
        console.log("Reklam etkileşimi tamamlandı varsayılıyor - kredi ekleniyor");
        fetch('/add_credit', { method: 'POST' })
            .then(() => {
                console.log("Kredi +1 eklendi");
                location.reload();
            })
            .catch(err => console.error("Kredi hatası:", err));
    }, 5000); // 5 sn bekle
}