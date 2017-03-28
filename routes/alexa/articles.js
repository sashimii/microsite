var keystone = require('keystone');
var async = require('async');
var Post = keystone.list('Post');
var strip = require('strip');

/**
 * List Posts
 */
module.exports = function getPosts(req, res) {
	Post.model.find(function(err, items) {

		if (err) return res.apiError('database error', err);
		console.log(items);
		var alexaCompliantItems = items.map((item) => {
			return {
				uid: item._id,
				updateDate: item.publishedDate,
				titleText: item.title,
				mainText: encode_utf8(strip(item.content.brief)),
				redirectionUrl: `https://microsite-torstar.herokuapp.com/articles/post/${item.slug}`
			}
		});

		res.send(alexaCompliantItems);

	});
}

function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}
