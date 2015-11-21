<?php
	header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
	header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
	$db = mysql_connect('localhost', 'lcheers', 'qweriop[') or die('Could not connect: ' . mysql_error()); 
	include "functions.php";
	$user = $_GET['user'];
	$password = $_GET['password'];
	$query = "SELECT gold FROM accounts WHERE username='$user'";
	$result = query($query, $user, $password);
	$printed = false;
	if (!$result)
	{
		$printed = true;
		echo "no READ";
	}
	else
	{
	  // output data of each row
	  while($row = mysql_fetch_assoc($result))
	  {
		echo $row["gold"];
		$printed = true;
	  }
	}
	 if (!$printed){
		 echo "no READ";
	}