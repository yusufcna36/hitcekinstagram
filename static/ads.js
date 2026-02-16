// static/ads.js
(function() {
    // DOM tamamen yüklendiğinde çalış
    document.addEventListener("DOMContentLoaded", function() {
        "use strict";

        const watchBtn = document.getElementById("watchBtn");
        const adBox = document.getElementById("adBox");

        // Elementleri kontrol et, yoksa konsola yaz ve butonu devre dışı bırak
        if (!watchBtn) {
            console.error("❌ HATA: 'watchBtn' ID'li buton bulunamadı. HTML'i kontrol edin.");
            // Yine de bir buton varsa onu bulmaya çalış (belki id farklıdır)
            // ama genelde yoksa kullanıcıya bildirelim
            return;
        }

        if (!adBox) {
            console.error("❌ HATA: 'adBox' ID'li div bulunamadı. HTML'i kontrol edin.");
            // Buton varsa ama adBox yoksa butonu devre dışı bırakalım
            watchBtn.disabled = true;
            watchBtn.textContent = "Reklam alanı bulunamadı";
            return;
        }

        // Her ihtimale karşı varsa eski onclick'i temizle
        watchBtn.onclick = null;

        let cooldown = false;

        watchBtn.addEventListener("click", function(event) {
            // Buton tıklanabilir mi?
            if (watchBtn.disabled) return; // güvenlik
            if (cooldown) {
                alert("Lütfen 30 saniye bekleyin.");
                return;
            }

            cooldown = true;

            // Reklam kutusunu göster
            adBox.style.display = "block";

            // 5 saniye sonra kredi ekleme isteği
            setTimeout(function() {
                fetch("/add_credit", {
                    method: "POST",
                    credentials: "same-origin"
                })
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Sunucu hatası: ${res.status}`);
                    }
                    return res.text();
                })
                .then(() => {
                    // Başarılı: sayfayı yenile
                    location.reload();
                })
                .catch(err => {
                    console.error("Kredi eklenirken hata:", err);
                    alert("Kredi eklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.");
                    // Hata durumunda cooldown'u kaldır ki tekrar deneyebilsin
                    cooldown = false;
                });
            }, 5000); // 5 saniye

            // 30 saniye cooldown süresi (arka planda)
            setTimeout(function() {
                cooldown = false;
            }, 30000);
        });

        // Butonun başlangıçta etkin olduğundan emin ol
        watchBtn.disabled = false;
        console.log("✅ ads.js başarıyla yüklendi, buton ve adBox bulundu.");
    });
})();