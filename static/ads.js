function watchAd() {
    // Adsterra Rewarded Video entegrasyonu
    var zoneId = 5609057;  // <-- Dashboard'dan aldığın gerçek Zone ID (eğer farklıysa değiştir)
    var userId = 'yusuf_' + Date.now();  // Benzersiz user ID (Publisher ID + zaman damgası)

    // Adsterra rewarded tag'ini yükle (eğer dashboard sana özel script verdiyse onu kullan)
    var script = document.createElement('script');
    script.src = 'https://adsterra.com/js/' + zoneId + '.js';
    script.async = true;
    script.onload = function() {
        console.log('Adsterra script yüklendi');
        // Adsterra rewarded'i başlat (bazı durumlarda manuel çağrı gerekir)
        if (typeof adsterraRewarded !== 'undefined') {
            adsterraRewarded.init({ zoneId: zoneId, userId: userId });
            adsterraRewarded.show();
        } else {
            console.error('Adsterra SDK yüklendi ama init fonksiyonu yok');
        }
    };
    document.head.appendChild(script);

    // Adsterra callback'i tanımla (dashboard'da gösterilen callback adını kullan)
    window.adsterraRewardGranted = function(rewardAmount) {
        console.log('Reklam tamamlandı, ödül:', rewardAmount);
        fetch('/add_credit', { method: 'POST' })
            .then(response => response.text())
            .then(() => {
                console.log('Kredi +1 eklendi');
                location.reload();  // Sayfayı yenile, krediyi göster
            })
            .catch(err => console.error('Kredi ekleme hatası:', err));
    };
}