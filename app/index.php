<?php

if ($_SERVER['SERVER_NAME'] == 'localhost') {
	define('ENV', 'dev');
}
else {
	define('ENV', 'test');
}

require_once 'config.php';
require_once 'db.php';

$action = isset($_POST['action']) ? $_POST['action'] : '';
$email = isset($_POST['email']) ? mysql_real_escape_string(trim($_POST['email'])) : '';
$password = isset($_POST['password']) ? mysql_real_escape_string($_POST['password']) : '';
$response = array(
	'result' => 0,
	'message' => ''
);

if ($action == 'register')
{
	if ($email && $password)
	{
		$query = "INSERT INTO users (email, password) VALUES('{$email}', '{$password}')";
		mysql_query($query);
		$response['message'] = 'Thank you!';
		$response['result'] = 1;
	}
}

if ($action == 'login')
{
	if ($email && $password)
	{
		$query = "SELECT * FROM users WHERE email = '{$email}' AND password = '{$password}' LIMIT 1";
		$result = mysql_query($query);
		$row = mysql_fetch_object($result);
		mysql_free_result($result);

		if ($row)
		{
			$response['result'] = 1;
		}
		else
		{
			$response['message'] = 'Bad login data.';
		}
	}
}

if ($action == 'send_message')
{
	$message = isset($_POST['message']) ? trim($_POST['message']) : '';

	if ($message)
	{
		$message = nl2br($message);
		mail(TO, 'MeetPoint Message', $message);
		$response['message'] = 'Your message has been sent!';
		$response['result'] = 1;
	}
}

die(json_encode($response));
