function watchAd() {
    console.log("Reklam butonu tıklandı - RichAds Popunder başlatılıyor");

    // Popunder script'ini dinamik yükle (butonla tetiklemek için)
    var script = document.createElement('script');
    script.src = 'https://richinfo.co/richpartners/pops/js/richads-pu-ob.js';
    script.setAttribute('data-pubid', '1002390');
    script.setAttribute('data-siteid', '388021');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.onload = function() {
        console.log("Popunder script yüklendi - tetikleniyor");
        // Manuel tetikleme (eğer RichAds destekliyorsa, yoksa otomatik bekle)
        if (typeof richAdsPopTrigger !== 'undefined') {
            richAdsPopTrigger();  // Varsa manuel tetikle
        } else {
            console.log("Manuel tetikleme yok, otomatik gösterim bekleniyor");
        }
    };
    script.onerror = function() {
        console.error("Popunder script yüklenemedi");
    };
    document.head.appendChild(script);

    // Kredi ekleme: Gerçek gösterim için 5 sn bekle ve sayfa odak kontrolü ekle
    setTimeout(() => {
        if (!document.hidden) {  // Sayfa arka planda değilse (kullanıcı gördü varsayalım)
            console.log("Popunder gösterildi varsayılıyor - kredi ekleniyor");
            fetch('/add_credit', { method: 'POST' })
                .then(response => response.text())
                .then(() => {
                    console.log("Kredi +1 eklendi (popunder gösterimi)");
                    location.reload();  // Sayfayı yenile
                })
                .catch(err => console.error("Kredi ekleme hatası:", err));
        } else {
            console.log("Sayfa arka planda, kredi eklenmedi (gerçek etkileşim yok)");
        }
    }, 5000);  // 5 sn bekle (popunder açılması + kullanıcı görmesi için)

    // RichAds callback varsa kullan (gösterim/tıklama sonrası)
    window.richAdsPopCallback = function() {
        console.log("RichAds popunder etkileşimi tamamlandı - kredi ekleniyor");
        fetch('/add_credit', { method: 'POST' })
            .then(() => location.reload())
            .catch(err => console.error(err));
    };
}