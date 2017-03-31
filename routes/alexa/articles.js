var keystone = require('keystone');
var async = require('async');
var Post = keystone.list('Post');
var Category = keystone.list('PostCategory');
var strip = require('strip');

/**
 * List Posts
 */
module.exports = function getPosts(req, res) {
	Post.model.find().sort('order').exec(function(err, items) {

		if (err) return res.apiError('database error', err);

			let finalJsonOutput = [];

			let alexaCompliantItems = items.map((item, index, array) => {
				let compliantJson = {};
				if(item.state === 'published') {
					compliantJson = {
						uid: item._id,
						updateDate: item.publishedDate,
						titleText: item.title,
						mainText: strip(item.content.brief).replace(/&nbsp;/gi,'').replace(/&rsquo;/gi,`'`),
						redirectionUrl: `https://microsite-torstar.herokuapp.com/articles/post/${item.slug}`
					};
				}

				if(req.params.audio === 'stream') {
					compliantJson.streamUrl = item.content.voice;
				}
				return compliantJson;
			});


			for(let i = 0; i < alexaCompliantItems.length; i++) {
				if(!alexaCompliantItems[i]) {
					alexaCompliantItems.splice(i,1);
					i--;
				}
			}

			finalJsonOutput = finalJsonOutput.concat(alexaCompliantItems);

			res.send(finalJsonOutput);
	});
}

function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}
