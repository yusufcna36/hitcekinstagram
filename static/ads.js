document.addEventListener("DOMContentLoaded", function () {

    const watchBtn = document.getElementById("watchBtn");
    const adBox = document.getElementById("adBox");

    let adCooldown = false;

    watchBtn.addEventListener("click", function () {

        if (adCooldown) {
            alert("Lütfen biraz bekleyin.");
            return;
        }

        if (!adBox) {
            console.error("adBox bulunamadı!");
            return;
        }

        adCooldown = true;

        // Reklamı göster
        adBox.style.display = "block";

        // 5 saniye sonra kredi ekle
        setTimeout(() => {

            fetch('/add_credit', {
                method: 'POST',
                credentials: 'same-origin'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Unauthorized");
                }
                return response.text();
            })
            .then(() => {
                location.reload();
            })
            .catch(error => {
                console.error("Hata:", error);
                alert("Kredi eklenemedi.");
            });

        }, 5000);

        // 30 saniye cooldown
        setTimeout(() => {
            adCooldown = false;
        }, 30000);

    });

});
