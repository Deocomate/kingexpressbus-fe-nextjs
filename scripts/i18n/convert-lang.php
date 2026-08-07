<?php
/**
 * One-shot converter: Laravel PHP lang array -> JSON for next-intl.
 * PHP evaluates the source file itself, so nested arrays, escaping, and
 * comments are all handled correctly instead of being re-parsed by regex.
 *
 * Usage: php convert-lang.php <src-lang-file.php> <dest.json>
 */

[$script, $srcPath, $destPath] = $argv;

$data = require $srcPath;

$json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);

file_put_contents($destPath, $json . "\n");

fwrite(STDOUT, "Wrote " . count($data, COUNT_RECURSIVE) . " nodes from $srcPath to $destPath\n");
