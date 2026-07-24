(function () {
	const LANG_MAP = {
		'en': { forYou: 'For you', following: 'Following' },
		'es': { forYou: 'Para ti', following: 'Siguiendo' },
		'fr': { forYou: 'Pour vous', following: 'Abonnements' },
		'pt': { forYou: 'Para você', following: 'Seguindo' },
		'zh-hant': { forYou: '為你推薦', following: '正在跟隨' },
		'zh-tw': { forYou: '為你推薦', following: '正在跟隨' },
		'zh': { forYou: '為你推薦', following: '正在跟隨' },
		'ja': { forYou: 'おすすめ', following: 'フォロー中' }
	};

	const getLanguage = () => {
		const lang = document.documentElement.lang || navigator.language || 'en';
		return lang.toLowerCase();
	};

	const getLabels = () => {
		const fullLang = getLanguage();
		const baseLang = fullLang.split('-')[0];

		return LANG_MAP[fullLang] || LANG_MAP[baseLang] || LANG_MAP['en'];
	};

	const removeForYouAndSelectFollowing = () => {
		const { forYou, following } = getLabels();
		const navTabs = document.querySelectorAll('div[role="tablist"] div[role="tab"]');
		let selectFollowing = false;

		navTabs.forEach(tab => {
			const label = tab.textContent.trim();

			if (label.toLowerCase() === forYou.toLowerCase()) {
				const parent = tab.closest('div[role="presentation"]');
				const isSelected = tab.getAttribute('aria-selected') === 'true';
				if (parent) {
					if (isSelected) selectFollowing = true;
					parent.remove();
				}
			}
		});

		if (selectFollowing) {
			navTabs.forEach(tab => {
				const label = tab.textContent.trim();
				if (label.toLowerCase() === following.toLowerCase()) {
					tab.click();
				}
			});
		}
	};

	const waitForTabs = () => {
		const tabsExist = document.querySelectorAll('a[role="tab"]').length > 0;
		if (tabsExist) {
			removeForYouAndSelectFollowing();
		} else {
			setTimeout(waitForTabs, 500); 
		}
	};

	waitForTabs();

	const observer = new MutationObserver(() => {
		removeForYouAndSelectFollowing();
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
})();
