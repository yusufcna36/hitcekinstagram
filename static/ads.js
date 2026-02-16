let adCooldown = false;

function watchAd() {

    if (adCooldown) {
        alert("Lütfen 30 saniye bekleyin.");
        return;
    }

    adCooldown = true;

    // ✅ SADECE DIRECT LINK
    const adLink = "https://11745.xml.4armn.com/direct-link?pubid=1002390&siteid=388020";

    // Reklamı yeni sekmede aç
    window.open(adLink, "_blank");

    // 3 sn sonra kredi ekle
    setTimeout(() => {
        fetch('/add_credit', { method: 'POST' })
            .then(res => {
                if (!res.ok) throw new Error("Rate limit");
                return res.text();
            })
            .then(() => location.reload())
            .catch(() => alert("Çok hızlısın, bekle."));
    }, 3000);

    // 30 sn cooldown
    setTimeout(() => {
        adCooldown = false;
    }, 30000);
}
