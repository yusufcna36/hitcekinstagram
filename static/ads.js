// static/ads.js
document.addEventListener("DOMContentLoaded", function() {
    const watchBtn = document.getElementById("watchBtn");
    const adBox = document.getElementById("adBox");

    // Debug için elementleri konsola yazdır
    console.log("watchBtn:", watchBtn);
    console.log("adBox:", adBox);

    if (!watchBtn || !adBox) {
        console.error("❌ Button veya adBox bulunamadı. ID'leri kontrol edin.");
        return;
    }

    // HTML'de varsa eski onclick'i temizle (güvenlik)
    watchBtn.onclick = null;

    let cooldown = false;

    watchBtn.addEventListener("click", function(event) {
        // Varsayılan davranışı engelle (nadiren gerekir)
        // event.preventDefault();

        if (cooldown) {
            alert("Lütfen 30 saniye bekleyin.");
            return;
        }

        cooldown = true;

        // Reklam kutusunu görünür yap
        adBox.style.display = "block";

        // 5 saniye sonra kredi ekle
        setTimeout(function() {
            fetch("/add_credit", {
                method: "POST",
                credentials: "same-origin"
            })
            .then(res => {
                if (!res.ok) throw new Error("Yetkisiz erişim veya sunucu hatası");
                return res.text();
            })
            .then(() => {
                // Başarılı → sayfayı yenile
                location.reload();
            })
            .catch(err => {
                console.error("Kredi eklenirken hata:", err);
                alert("Kredi eklenemedi. Lütfen tekrar deneyin.");
                // Hata olursa cooldown'u kaldır ki tekrar deneyebilsin
                cooldown = false;
            });
        }, 5000); // 5 saniye

        // 30 saniye cooldown
        setTimeout(function() {
            cooldown = false;
        }, 30000);
    });
});