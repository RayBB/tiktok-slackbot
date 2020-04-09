/*

This is just an example to see if you can successfully download then Tweet using your API keys

*/


require('dotenv').config()
let tok_to_tweet = require('./tok_to_tweet');
tok_to_tweet.getTwitterUrl("https://www.tiktok.com/@its.meghanag/video/6802683077941316869")