let adCooldown = false;

function watchAd() {

    if (adCooldown) {
        alert("Lütfen bekleyin.");
        return;
    }

    adCooldown = true;

    const adLink = "https://11745.xml.4armn.com/direct-link?pubid=1002390&siteid=388020";

    // Reklamı aç
    window.open(adLink, "_blank");

    // 3 saniye sonra kredi isteği
    setTimeout(() => {
        fetch('/add_credit', {
            method: 'POST',
            credentials: 'same-origin' // 🔥 EN KRİTİK SATIR
        })
        .then(res => {
            if (!res.ok) throw new Error("Unauthorized / Rate limit");
            return res.text();
        })
        .then(() => {
            location.reload();
        })
        .catch(err => {
            console.error(err);
            alert("Kredi eklenemedi, lütfen sayfayı yenileyip tekrar dene.");
        });
    }, 3000);

    // 30 saniye cooldown
    setTimeout(() => {
        adCooldown = false;
    }, 30000);
}
