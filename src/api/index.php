<?php
$f3 = require ('lib/base.php');

require_once 'lib/underscore.php/src/Underscore/Underscore.php';
require_once 'lib/underscore.php/src/Underscore/Bridge.php';

if ((float)PCRE_VERSION < 7.9) trigger_error('PCRE version is out of date');

$f3->config('config.ini');

// date_default_timezone_set($f3->get('TIMEZONE')); // TODO: ver el tema de zonas horarias; http://php.net/manual/es/timezones.php; en config.ini

$f3->run();
 