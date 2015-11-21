<?php
include "functions.php";
$user = $_GET['user'];
$password = $_GET['password'];
$amount = $_GET['amount'];
$query = "UPDATE accounts SET gold=$amount WHERE username='$user'";
query($query, $user, $password);