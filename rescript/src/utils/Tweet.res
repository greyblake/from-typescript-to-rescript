open Types.TweetView

let shortenTweetText = (TweetText(text)) => {
  if Js.String.length(text) > 140 {
    Js.String2.substring(text, ~from=0, ~to_=140) ++ "..."
  } else {
    text
  }
}

let tweetUrl = (Types.TweetId.TweetId(id)): string => {
  `https://twitter.com/i/web/status/${id}`
}
