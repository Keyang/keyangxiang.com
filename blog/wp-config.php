<?php
/**
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, WordPress Language, and ABSPATH. You can find more information
 * by visiting {@link http://codex.wordpress.org/Editing_wp-config.php Editing
 * wp-config.php} Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'keyangxiang');

/** MySQL database username */
define('DB_USER', 'keyangxiang');

/** MySQL database password */
define('DB_PASSWORD', '861031');

/** MySQL hostname */
define('DB_HOST', 'mysql.jjhost.net');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         '89_nh=$J/#L6vu(-ev[@FcIwFVT)kjCfWO!ls*jjbys8p+,nvx-VP+&+/J<Dd*a*');
define('SECURE_AUTH_KEY',  'bRXeJ1vk;Gy <+@9PeTp$ ;+JNp>{IDEI$)bw%p|EWYYgNph75>u;SI1%,<qr,t+');
define('LOGGED_IN_KEY',    '+,9;<@zGa;+I>3Wj%eeReGtD(PN#Y~7-3o~UGs^3A$vV!:n{Fn|mOE)nGi|J@AqP');
define('NONCE_KEY',        '76/BJO2#.EMQq8R]-=ib!(+T)T,5ry!(y:_0o6XZ{vmIsJmNJ:E&Dc0y}b)1#MD>');
define('AUTH_SALT',        'z_7<;a=i+NU.?V8vQp:G=iYE$`,nC l&51j&A,DfhWn7%3GA-Dw7YIoWkZR!CZ|%');
define('SECURE_AUTH_SALT', '8=6{iwD]Fa+$7MF(S(Wx)6p+(<CU%R@T=P:#9~.7!;`[ w{$]ItGm]-~^zH`4/u~');
define('LOGGED_IN_SALT',   'xK5fQce4._H36su-R%eZU3<eO,|_Hu;$ZxWdXdV|n*i>)cQ0Zy`&t6h%US`8@D+A');
define('NONCE_SALT',       '6O-oI[o]pE]7Z:P#|5zv}4^*PxlanCef6K1r>`S~a/lHZrh[7x4&t*6cm~XL]hrv');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * WordPress Localized Language, defaults to English.
 *
 * Change this to localize WordPress. A corresponding MO file for the chosen
 * language must be installed to wp-content/languages. For example, install
 * de_DE.mo to wp-content/languages and set WPLANG to 'de_DE' to enable German
 * language support.
 */
define('WPLANG', '');

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
