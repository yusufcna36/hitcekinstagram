function watchAd() {
    console.log("Reklam butonu tıklandı - RichAds Popunder başlatılıyor");

    // Popunder'ı manuel tetiklemek için script'i zaten head'de yüklü tuttuk
    // RichAds popunder genellikle otomatik başlar ama etkileşimle (buton click) daha iyi çalışır

    // Buton tıklamasını logla ve kredi ekle (popunder gösterimi için 3 sn bekle)
    console.log("Popunder tetikleniyor - reklam gösterimi bekleniyor");

    setTimeout(() => {
        console.log("Popunder gösterildi varsayılıyor - kredi ekleniyor");
        fetch('/add_credit', { method: 'POST' })
            .then(response => response.text())
            .then(() => {
                console.log("Kredi +1 eklendi (popunder gösterimi)");
                location.reload();  // Sayfayı yenile, krediyi göster
            })
            .catch(err => console.error("Kredi ekleme hatası:", err));
    }, 3000);  // 3 saniye bekle (popunder yeni sekmede açılsın diye)

    // Eğer RichAds callback destekliyorsa (gösterim/tıklama sonrası) ekstra log
    window.richAdsPopCallback = function() {
        console.log("RichAds popunder etkileşimi tamamlandı - kredi ekleniyor");
        fetch('/add_credit', { method: 'POST' })
            .then(() => location.reload())
            .catch(err => console.error(err));
    };
}