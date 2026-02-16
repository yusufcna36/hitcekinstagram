let adCooldown = false;

function watchAd() {

    if (adCooldown) {
        alert("Lütfen bekleyin.");
        return;
    }

    adCooldown = true;

    const adLink = "https://11745.xml.4armn.com/direct-link?pubid=1002390&siteid=388020";

    // 🔥 Bu satır HER ZAMAN çalışır
    window.open(adLink, "_blank");

    setTimeout(() => {
        fetch('/add_credit', { method: 'POST' })
            .then(() => location.reload())
            .catch(console.error);
    }, 3000);

    setTimeout(() => {
        adCooldown = false;
    }, 30000);
}
