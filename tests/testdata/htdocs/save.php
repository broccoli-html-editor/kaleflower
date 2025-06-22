<?php
require_once(__DIR__.'/../../../vendor/autoload.php');
$fs = new \tomk79\filesystem();


$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

$fs->save_file(__DIR__.'/../kflows/'.urlencode($_GET['file'] ?? "general").'.kflow', $input['data']);

echo json_encode(array(
	'result' => true,
	'message' => 'OK',
));
