<?php

$db_link = mysql_connect($config['database'][ENV]['hostname'], $config['database'][ENV]['username'], $config['database'][ENV]['password'])
	or die(mysql_error());

mysql_select_db($config['database'][ENV]['database']) or die(mysql_error());