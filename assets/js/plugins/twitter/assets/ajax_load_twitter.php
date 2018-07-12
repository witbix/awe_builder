<?php
require_once('includes/twitteroauth.inc');

$consumer_key = (isset($_REQUEST['consumer_key']) && $_REQUEST['consumer_key'] !== '')?$_REQUEST['consumer_key']:'j8kVnnnHFqPD4J24nOXuW4BiN';
$consumer_secret = (isset($_REQUEST['consumer_secret']) && $_REQUEST['consumer_secret'] !== '')?$_REQUEST['consumer_secret']:'vurIlwKpXtceYHD0LHevEEwYzCKQjorw5NMiXTuranD5D6udvQ';
$access_token = (isset($_REQUEST['access_token']) && $_REQUEST['access_token'] !== '')?$_REQUEST['access_token']:'709944559212453888-c6qMpjZzvSRnwBdHgun3ruvrKV1rWmG';
$access_secret = (isset($_REQUEST['access_secret']) && $_REQUEST['access_secret'] !== '')?$_REQUEST['access_secret']:'MGJj3tjAmd18XVsdNqglqG1XyVHuu0It3wkyRrYuoGAtK';

//$username = filter_input(INPUT_GET, 'username', FILTER_SANITIZE_SPECIAL_CHARS);
$username = (isset($_REQUEST['twitter_user']) && $_REQUEST['twitter_user'] !== '')?$_REQUEST['twitter_user']:'fifacom';
$number = filter_input(INPUT_GET, 'count', FILTER_SANITIZE_NUMBER_INT);
$exclude_replies = filter_input(INPUT_GET, 'exclude_replies', FILTER_SANITIZE_SPECIAL_CHARS);
$list_slug = filter_input(INPUT_GET, 'list_slug', FILTER_SANITIZE_SPECIAL_CHARS);
$hashtag = filter_input(INPUT_GET, 'hashtag', FILTER_SANITIZE_SPECIAL_CHARS);
if ($consumer_key === '' || $consumer_secret === '' || $consumer_key === 'CONSUMER_KEY_HERE' || $consumer_secret === 'CONSUMER_SECRET_HERE') {
  echo 'You need a consumer key and secret keys. Get one from <a href="https://dev.twitter.com/apps">dev.twitter.com/apps</a>';
  exit;
}


$connection = new TwitterOAuth($consumer_key, $consumer_secret, $access_token, $access_secret);
if (!empty($list_slug)) {
  $params = array(
    'owner_screen_name' => $username,
    'slug' => $list_slug,
    'per_page' => $number
  );
  $url = '/lists/statuses';
}
else {
  if ($hashtag) {
    $params = array(
      'count' => $number,
      'q' => '#' . $hashtag
    );

    $url = '/search/tweets';
  }
  else {
    $params = array(
      'count' => $number,
      'exclude_replies' => $exclude_replies,
      'screen_name' => $username
    );

    $url = '/statuses/user_timeline';
  }
}
$tweets = $connection->get($url, $params);

header('Content-Type: application/json');
$tweets = json_encode($tweets);
echo $tweets;
exit;