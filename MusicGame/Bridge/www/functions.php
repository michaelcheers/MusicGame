<?php

function query($query, $username, $password)
{
	$db = mysql_connect('localhost', 'lcheers', 'qweriop[') or die('Could not connect: ' . mysql_error());
	mysql_select_db('lcheers_michael') or die('Could not select database');
	$query2 = "SELECT 1 FROM accounts WHERE username='$username' AND password='$password'";
	$good = mysql_query($query2) or die('Query failed: ' . mysql_error()) ;
	mysql_fetch_row($good) or die("no PASSWORD");
	$result = mysql_query($query);
	$result or die('Query failed: ' . mysql_error()) ;
	return $result;
}

function queryNoPassword ($query)
{
	$db = mysql_connect('localhost', 'lcheers', 'qweriop[') or die('Could not connect: ' . mysql_error());
	mysql_select_db('lcheers_michael') or die('Could not select database');
	$result = mysql_query($query);
	$result or die('Query failed: ' . mysql_error()) ;
	return $result;
}