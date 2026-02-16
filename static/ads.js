window.addEventListener("load", function () {

    const watchBtn = document.getElementById("watchBtn");
    const adBox = document.getElementById("adBox");

    if (!watchBtn || !adBox) {
        console.error("Button veya adBox bulunamadı.");
        return;
    }

    let cooldown = false;

    watchBtn.addEventListener("click", function () {

        if (cooldown) {
            alert("Lütfen bekleyin...");
            return;
        }

        cooldown = true;

        // Reklamı göster
        adBox.style.display = "block";

        // 5 saniye sonra kredi ekle
        setTimeout(function () {

            fetch("/add_credit", {
                method: "POST",
                credentials: "same-origin"
            })
            .then(res => {
                if (!res.ok) throw new Error("Unauthorized");
                return res.text();
            })
            .then(() => location.reload())
            .catch(err => {
                console.error(err);
                alert("Kredi eklenemedi.");
            });

        }, 5000);

        // 30 saniye cooldown
        setTimeout(function () {
            cooldown = false;
        }, 30000);

    });

});
