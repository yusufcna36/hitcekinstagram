function watchAd() {
    console.log("Reklam butonu tıklandı - RichAds push başlatılıyor");

    // RichAds push'u manuel tetiklemek için (butonla çalışsın)
    // RichAds otomatik başlatır ama biz etkileşimle tetikleyelim
    if (typeof RichPush !== 'undefined' && RichPush.show) {
        RichPush.show();  // RichAds push'u göster (eğer SDK yüklendiyse)
        console.log("RichPush.show() çağrıldı");
    } else {
        console.log("RichAds SDK henüz yüklenmedi, 1 sn bekleniyor...");
        setTimeout(() => {
            if (typeof RichPush !== 'undefined' && RichPush.show) {
                RichPush.show();
            } else {
                console.error("RichAds SDK yüklenemedi veya show fonksiyonu yok");
            }
        }, 1000);  // 1 saniye bekle, script yüklenmesini bekle
    }

    // Push gösterildikten sonra kredi ekle (RichAds callback'i yoksa 5 sn sonra otomatik ekle)
    setTimeout(() => {
        console.log("Reklam etkileşimi tamamlandı varsayılıyor - kredi ekleniyor");
        fetch('/add_credit', { method: 'POST' })
            .then(response => response.text())
            .then(() => {
                console.log("Kredi +1 eklendi");
                location.reload();  // Sayfayı yenile, krediyi göster
            })
            .catch(err => console.error("Kredi ekleme hatası:", err));
    }, 5000);  // 5 saniye bekle (push gösterilsin diye)
}