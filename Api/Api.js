var resume = include.pause();
atma
	.server
	.Application({
		base: include.location
	})
	.done(resume);
