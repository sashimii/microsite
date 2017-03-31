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
		let alexaCompliantItems = items.map((item, index, array) => {
			if(item.state === 'published') {
				return {
					uid: item._id,
					updateDate: item.publishedDate,
					titleText: item.title,
					mainText: strip(item.content.brief).replace(/&nbsp;/gi,'').replace(/&rsquo;/gi,`'`),
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

		let sponsoredContentNotice = {
			uid: 'ad-notice-0001',
			updateDate: new Date().toISOString(),
			titleText: 'Sponsored Content Notice',
			mainText: 'A message from our sponsor!',
			redirectionUrl: `https://microsite-torstar.herokuapp.com/`
		}
		let sampleAd = {
			uid: 'ad-0001',
			updateDate: new Date().toISOString(),
			titleText: 'Real Fake Doors!',
			mainText: 'Now, a message from our sponsor',
			streamUrl: 'https://github.com/sashimii/microsite/raw/master/fakedoors.wav',
			redirectionUrl: `https://microsite-torstar.herokuapp.com/`
		}
		alexaCompliantItems.push(sponsoredContentNotice)
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
