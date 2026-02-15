function watchAd() {
    console.log("Reklam butonu tıklandı");

    // RichAds push otomatik başlar, biz sadece etkileşim bekleyelim
    // Buton tıklamasını sadece loglamak için kullanıyoruz
    console.log("RichAds push otomatik olarak tetiklenecek (sayfa etkileşimiyle)");

    // Gerçek RichAds callback'i (eğer destekliyorsa) veya etkileşim algıla
    // RichAds push tıklandığında veya gösterildiğinde kredi ekle (gerçek callback yoksa alternatif)
    window.onRichAdsPushClick = function() {
        console.log("Push bildirimi tıklandı - kredi ekleniyor");
        fetch('/add_credit', { method: 'POST' })
            .then(() => {
                console.log("Kredi +1 eklendi (push tıklama)");
                location.reload();
            })
            .catch(err => console.error("Kredi hatası:", err));
    };

    // Alternatif: Sayfa etkileşimi sonrası (scroll, click vs.) push çıkarsa kredi ekle
    setTimeout(() => {
        if (document.hidden === false) { // Sayfa aktifse
            console.log("Sayfa etkileşimi algılandı - kredi ekleniyor (test için)");
            fetch('/add_credit', { method: 'POST' })
                .then(() => location.reload())
                .catch(err => console.error(err));
        }
    }, 10000); // 10 sn sonra etkileşim kontrol et
}