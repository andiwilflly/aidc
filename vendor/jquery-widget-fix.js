/*
 * Empty file that fix r.js problem with jQuery and jQuery UI libraries.
 *
 * The problem: jQuery and jQuery UI load from commonJs.html file.
 * Then jQuery load automatically by jquery.mousewheel factory.
 * This cause problem when $.widget (that was defined in commonJs.html/jQuery UI file) becomes undefined.
 *
 * To fix this problem we just change "jquery" path of icad-config.js to jquery-widget-fix.js file
 *
 */