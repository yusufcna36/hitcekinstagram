let adCooldown = false;

function watchAd() {

    if (adCooldown) {
        alert("Lütfen biraz bekleyin.");
        return;
    }

    adCooldown = true;

    // Reklamı göster
    document.getElementById("adBox").style.display = "block";

    // 5 saniye sonra kredi ekle
    setTimeout(() => {
        fetch('/add_credit', {
            method: 'POST',
            credentials: 'same-origin'
        })
        .then(res => {
            if (!res.ok) throw new Error("Unauthorized");
            return res.text();
        })
        .then(() => {
            location.reload();
        })
        .catch(err => {
            console.error(err);
            alert("Kredi eklenemedi.");
        });
    }, 5000);

    // 30 saniye cooldown
    setTimeout(() => {
        adCooldown = false;
    }, 30000);
}
