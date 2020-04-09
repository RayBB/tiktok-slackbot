# TikTok to Twitter Slackbot

Wish you could watch TikToks in Slack? Me too. I made a Slackbot fix that by uploading TikToks to Twitter and then posting the Tweets back in a Slack [thread](media/reply.gif).

![Slackbot replying to TikTok](media/reply.gif)

## How it works  

I hope to use the [unfurl api](https://api.slack.com/docs/message-link-unfurling) to attach the video. Unforunately, that's not possible and Slack only shows [previews](https://slack.com/help/articles/204399343-Share-links-and-set-preview-preferences) from whitelisted apps. The good news is that Twitter is whitelisted. So we can upload a to Twitter and then let Slack unfurl that.

![Software Flow Diagram Here](media/flow.svg)

### General Flow:  
Slack -> TikTok -> Twitter -> Slack

1. Recieve a `link_shared` [event](https://api.slack.com/events/link_shared) from Slack for a TikTok
2. Download the MP4 from TikTok
3. Tweet the MP4
4. Reply to original Slack message with Tweet


## Setup 

See `.env.sample` for what your `.env` file shoud look like.

1. Create a [Twitter developer account](https://developer.twitter.com/en/apply-for-access) and put the credentials in your `.env` file.
2. Create a Slackbot (follow instructions in src/slackbot.js) and put credentials in `.env` file.  
3. Run `npm start` 
4. Add your server address to the **Event Subscriptions** page. ex: `https://example.com/slack/events`  
    * Your bot must be running before you an add the URL
    * You can use ngrok for local testing
    * See [Bolt docs](https://api.slack.com/tutorials/hello-world-bolt) for help setting up a Slackbot.
5. Add the Slackbot to any channel you want it to respond in.

### Hosting  

This could live on Google App Engine or a cloud function. However, the easiest free option is glitch.com.