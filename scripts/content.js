(function () {
	const removeForYouAndSelectFollowing = () => {
		const navTabs = document.querySelectorAll('a[role="tab"]');

		navTabs.forEach(tab => {
			const label = tab.textContent.trim();

			if (/^For you$/i.test(label)) {
				const parent = tab.closest('div[role="presentation"]');
				if (parent) {
					parent.style.display = 'none';
				}
			}

			if (/^Following$/i.test(label)) {
				if (!tab.getAttribute('aria-selected')) {
					tab.click();
				}
			}
		});
	};

	// Initial run
	removeForYouAndSelectFollowing();

	// Mutation observer to handle client-side routing/dynamic changes
	const observer = new MutationObserver(() => {
		removeForYouAndSelectFollowing();
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
})();