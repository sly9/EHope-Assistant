<?php
$cmd='/usr/bin/simc armory=us,illidan,'.$_GET['id'].' html=/var/www/html/simc/results/'.$_GET['id'].'.html 2>&1';
echo $cmd;
$output = shell_exec($cmd);
echo "<pre>$output</pre>";

?>