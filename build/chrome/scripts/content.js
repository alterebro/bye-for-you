(function () {
	const LANG_MAP = {
		'en': { forYou: 'For you', following: 'Following' },
		'es': { forYou: 'Para ti', following: 'Siguiendo' },
		'fr': { forYou: 'Pour vous', following: 'Abonnements' },
	};

	const getLanguage = () => {
		const lang = document.documentElement.lang || navigator.language || 'en';
		return lang.split('-')[0]; 
	};

	const getLabels = () => {
		const langCode = getLanguage();
		return LANG_MAP[langCode] || LANG_MAP['en'];
	};

	const removeForYouAndSelectFollowing = () => {
		const { forYou, following } = getLabels();
		const navTabs = document.querySelectorAll('a[role="tab"]');
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
