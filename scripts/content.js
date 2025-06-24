(function () {
	const removeForYouAndSelectFollowing = () => {
		const navTabs = document.querySelectorAll('a[role="tab"]');
		let selectFollowing = false;

		navTabs.forEach(tab => {
			const label = tab.textContent.trim();

			if (/^For you$/i.test(label)) {
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
				if (/^Following$/i.test(tab.textContent.trim())) {
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
