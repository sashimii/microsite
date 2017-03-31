var keystone = require('keystone');

exports = module.exports = function (req, res) {


	var view = new keystone.View(req, res);
	var locals = res.locals;
	const contentType = getContentType(req.path);

	// Set locals
	locals.section = 'articles';
	locals.filters = {
		post: req.params.post,
	};
	locals.data = {
		posts: [],
	};
	locals.render = contentType;

	// Load the current post
	view.on('init', function (next) {

		var q = keystone.list('Post').model.findOne({
			state: 'published',
			slug: locals.filters.post,
		}).populate('author categories');

		q.exec(function (err, result) {
			locals.data.post = result;
			next(err);
		});

	});

	// Load other posts
	view.on('init', function (next) {

		var q = keystone.list('Post').model.find().where('state', 'published').sort('-publishedDate').populate('author').limit('4');

		q.exec(function (err, results) {
			locals.data.posts = results;
			next(err);
		});

	});
	console.log(res);

	// Render the view
	view.render(`post.${contentType}.hbs`);
};

function getContentType(path) {
	const firstSection = path.split('/')[1];
	switch(firstSection) {
		case 'amp':
			return 'amp';
			break;
		case 'ia':
			return 'ia';
			break;
		default:
			return 'html';
			break;
	}

}
