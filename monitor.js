var querystring = require('querystring')
  , https = require('https')
  , config = require('config')
  , FeedParser = require('feedparser')
  , parser = new FeedParser()
  ;


var conseillers = require('./public/data/conseillers.json');

//Atom Feeds
var monitorFeed = function () {
  function feedCallback (error, meta, articles){
    if (error) console.error(error);
    else {
      console.log('Feed info');
      console.log('%s - %s - %s', meta.title, meta.link, meta.xmlUrl);
      console.log('Articles');
      articles.forEach(function (article){
        console.log('%s - %s (%s)', article.date, article.title, article.link);
      });
    }
  }

  //Website
  conseillers.forEach(function(conseiller) {
    if (conseiller.feed == undefined) { return; }
    parser.parseUrl(conseiller.feed, feedCallback);
  });

  //Google News
  var googleNewsUrl = 'http://news.google.ca/news?';
  var googleNewsParams = {
      pz: 1
    , output: 'atom'
    , hl: 'fr'
    , num: 100
    , scoring: 'n'
    , ned: 'fr_ca'
    , as_drrb: 'q'
    , as_qdr: 'a'
    , q: "Maxime Pedneaud-Jobin"
  };
  var googleNewsParams = querystring.stringify(googleNewsParams);
  parser.parseUrl(googleNewsUrl + googleNewsParams, myCallback);
};

//Twitter Feeds
var monitorTwitter = function() {
  var options = {
      host: 'api.twitter.com'
    , path: '/1/statuses/user_timeline/MPedneaudJobin.json'
  };
  https.get(options, function(res) {
    res.setEncoding('utf8');
    console.log("Got response: " + res.statusCode);
    var buff = '';
    res.on('data', function(chunk) {
      buff += chunk.toString();
    });
    res.on('end', function() {
      var tweets = JSON.parse(buff);
      tweets.forEach(function(tweet){
        console.log('@' + tweet.user.screen_name + ': ' + tweet.text);
      });
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
};

//Facebook Feeds
var monitorFacebook = function() {
  var options = {
      host: 'graph.facebook.com'
    , path: '/pedneaudjobin/feed?access_token=' + config.facebook.access_token
  };
  https.get(options, function(res) {
    res.setEncoding('utf8');
    console.log("Got response: " + res.statusCode);
    var buff = '';
    res.on('data', function(chunk) {
      buff += chunk.toString();
    });
    res.on('end', function() {
      var posts = JSON.parse(buff);
      posts.data.forEach(function(post){
        console.log(post.message);
      });
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
};

//TODO move these function above in separate libraries
