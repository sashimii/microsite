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


		let alexaCompliantItems = items.map((item, index, array) => {
			if(item.state === 'published') {
				return {
					uid: item._id,
					updateDate: item.publishedDate,
					titleText: item.title,
					mainText: encode_utf8(strip(item.content.brief)),
					redirectionUrl: `https://microsite-torstar.herokuapp.com/articles/post/${item.slug}`
				};
			}
		});

		for(let i = 0; i < alexaCompliantItems.length; i++) {
			if(!alexaCompliantItems[i]) {
				alexaCompliantItems.splice(i,1);
				i--;
			}
		}

		let sampleAd = {
			uid: 'ad-0001',
			updateDate: new Date().toISOString(),
			titleText: 'Real Fake Doors!',
			mainText: 'A message from our sponsor',
			streamUrl: 'https://github.com/sashimii/microsite/raw/master/fakedoors.ogg',
			redirectionUrl: `https://microsite-torstar.herokuapp.com/`
		}
		alexaCompliantItems.push(sampleAd);

		res.send(alexaCompliantItems);

	});
}

function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}
