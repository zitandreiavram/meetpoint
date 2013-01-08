<?php

if ($_SERVER['SERVER_NAME'] == 'localhost') {
	define('ENV', 'dev');
}
else {
	define('ENV', 'test');
}

require_once 'config.php';
require_once 'db.php';

$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';
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
			$long = isset($_REQUEST['long']) ? (float) $_REQUEST['long'] : '';
			$lat = isset($_REQUEST['lat']) ? (float) $_REQUEST['lat'] : '';
			$query = "UPDATE users SET long = {$long}, lat = {$lat}, online = 1 WHERE id = {$row->id}";
			mysql_query($query);
			$response['user'] = $row->id;
			$response['result'] = 1;
		}
		else
		{
			$response['message'] = 'Bad login data.';
		}
	}
}

if ($action == 'logout')
{
	$user = isset($_GET['user']) ? (int) $_GET['user'] : 0;

	if ($user)
	{
		$query = "UPDATE users SET online = 0 WHERE id = {$user}";
		mysql_query($query);
	}
}

if ($action == 'location')
{
	$user = isset($_POST['user']) ? (int) $_POST['user'] : 0;
	$position = isset($_POST['position']) ? $_POST['position'] : '';

	if ($user > 0 && $position)
	{
		$query = "
			UPDATE users
			SET `long` = {$position['longitude']}, `lat` = {$position['latitude']}, `update` = NOW(), `online` = 1
			WHERE id = {$user}";
		mysql_query($query);
		$response['result'] = 1;
	}
}

if ($action == 'get')
{
	$user = isset($_GET['user']) ? (int) $_GET['user'] : 0;
	$query = "SELECT id, `email` username, `long`, `lat` FROM users WHERE id <> {$user} AND online";
	$result = mysql_query($query);
	$data = array();

	while ($row = mysql_fetch_object($result))
	{
			$data []= $row;
	}

	mysql_free_result($result);
	$response['points'] = $data;
	$response['result'] = 1;
}

if ($action == 'send_message')
{
	$from = isset($_POST['from']) ? (int) $_POST['from'] : 0;
	$to = isset($_POST['to']) ? (int) $_POST['to'] : 0;
	$message = isset($_POST['message']) ? trim($_POST['message']) : '';

	if ($from && $to && $message)
	{
		$query = "INSERT INTO chat (`from`, `to`, message, `date`) VALUES ({$from}, {$to}, '{$message}', NOW())";
		mysql_query($query);
		$response['messages'] = get_chat($from, $to);
		$response['result'] = 1;
	}
}

if ($action == 'chat')
{
	$from = isset($_GET['from']) ? (int) $_GET['from'] : 0;
	$to = isset($_GET['to']) ? (int) $_GET['to'] : 0;
	$response['messages'] = get_chat($from, $to);
	$response['result'] = 1;
}

function get_chat($from, $to) {
	$query = "
		SELECT `from`, `to`, message
		FROM chat
		WHERE (`from` = {$from} AND `to` = {$to}) OR (`from` = {$to} AND `to` = {$from})
		ORDER BY id DESC
	";
	$result = mysql_query($query);
	$messages = array();

	while ($row = mysql_fetch_object($result))
	{
			$messages []= $row;
	}

	mysql_free_result($result);
	return $messages;
}

die(json_encode($response));
