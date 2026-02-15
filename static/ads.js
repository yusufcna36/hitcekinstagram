function watchAd() {
    // AdMob Rewarded Web (test mode)
    const rewarded = new google.ads.mediation.test.RewardedAd({
        adUnitId: 'ca-app-pub-3940256099942544/5224354917'
    });
    rewarded.on('reward', () => {
        fetch('/add_credit', { method: 'POST' })
            .then(() => location.reload())
            .catch(err => console.error(err));
    });
    rewarded.load();
    rewarded.show();
}