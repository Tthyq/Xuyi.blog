// Scroll-triggered animations using IntersectionObserver
document.addEventListener('astro:page-load', () => {
	// Respect reduced motion
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const observerOptions = {
		root: null,
		rootMargin: '0px 0px -50px 0px',
		threshold: 0.1,
	};

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('animate-in');
				observer.unobserve(entry.target);
			}
		});
	}, observerOptions);

	// Elements to animate
	const selectors = [
		'.portal-card',
		'.post-list li',
		'.game-card',
		'.page-title',
		'article .title',
		'.hero-image',
	];

	selectors.forEach((selector) => {
		document.querySelectorAll(selector).forEach((el, index) => {
			el.classList.add('animate-target');
			el.style.setProperty('--delay', `${index * 0.1}s`);
			observer.observe(el);
		});
	});
});
