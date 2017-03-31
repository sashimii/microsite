var keystone = require('keystone');
var async = require('async');
var Post = keystone.list('Post');
var Category = keystone.list('PostCategory');
var strip = require('strip');

/**
 * List Posts
 */
module.exports = function getPosts(req, res) {
	Post.model.find(function(err, items) {

		if (err) return res.apiError('database error', err);

		const getCategoriesList = () => {
			return new Promise((resolve, reject) => {
				let categories = {};
				items.forEach((item) => {
					Category.model.findById(item.categories[0], (err, categoryItems) => {
						categories[item.categories[0]] = categoryItems.name;
					});

				});
				resolve(categories);
			});
		};

		getCategoriesList().then((categories) => {
			let finalJsonOutput = [];



			let intro = {
				uid: 'intro-0001',
				updateDate: new Date().toISOString(),
				titleText: 'Introduction',
				mainText: 'Your Daily New Biefing',
				streamUrl: 'https://s3.ca-central-1.amazonaws.com/alexa-torstar/Intro.wav',
				redirectionUrl: `https://microsite-torstar.herokuapp.com/`
			}
			finalJsonOutput.push(intro);

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

			let sponsoredContentNotice = {
				uid: 'ad-notice-0001',
				updateDate: new Date().toISOString(),
				titleText: 'Sponsored Content Notice',
				mainText: 'A message from our sponsor!',
				streamUrl: 'https://s3.ca-central-1.amazonaws.com/alexa-torstar/Transition+5.wav',
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
			finalJsonOutput.push(sponsoredContentNotice)
			finalJsonOutput.push(sampleAd);

			res.send(finalJsonOutput);
		});



	});
}

function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}
