<?php
include 'simpleimage.php';
ini_set('memory_limit', '1024M');
$image = new SimpleImage();
$image->load('uploads/47c9f956828a8df9e557954ef687e27f.jpg');
$image->resizeToWidth(250);
$image->save('uploads/47c9f956828a8df9e557954ef687e27f.jpg');