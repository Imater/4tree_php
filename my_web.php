<!DOCTYPE html>
<html>
  <head>
    <title>Bootstrap 101 Template</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Bootstrap -->
    <link href="bootstrap-2.3/css/bootstrap.min.css" rel="stylesheet" media="screen">
    <link href="bootstrap-2.3/css/bootstrap-responsive.css" rel="stylesheet">
  </head>
  <body>
    <h1 class="">Hello, world!</h1>

<body>

<div class="container-fluid">
<div class="tabbable"> <!-- Only required for left/right tabs -->
  <ul class="nav nav-tabs">
    <li class="active"><a href="#tab1" data-toggle="tab">Section 1</a></li>
    <li><a href="#tab2" data-toggle="tab">Section 2</a></li>
  </ul>
  <div class="tab-content">
    <div class="tab-pane active" id="tab1">
      <p>I'm in Section 1.</p>
    </div>
    <div class="tab-pane" id="tab2">
      <p>Howdy, I'm in Section 2.</p>
    </div>
  </div>
</div>

<div class="navbar navbar-static-top">
  <div class="navbar-inner">
    <a class="brand" href="#">Title</a>
    <ul class="nav">
      <li class="active"><a href="#">Home</a></li>
      <li><a href="#">Link</a></li>
      <li><a href="#">Link</a></li>
    </ul>
  </div>
</div>

<div class="alert">
  <button type="button" class="close" data-dismiss="alert">&times;</button>
  <strong>Warning!</strong> Best check yo self, you're not looking too good.
</div>

  <div class="row-fluid">
    <div class="span2">

<ul class="nav nav-list">
  <li class="nav-header">List header</li>
  <li class="active"><a href="#">Home</a>
  
  <ul class="nav nav-list">
  <li class="nav-header">List header</li>
  <li class="active"><a href="#">Home</a>
<ul class="nav nav-list">
  <li class="nav-header">List header</li>
  <li class="active"><a href="#">Home</a></li>
  <li><a href="#">Library</a></li>
  ...
</ul>  
  </li>
  <li><a href="#">Library</a></li>
  ...
</ul>
  
  </li>
  <li><a href="#">Library</a></li>
  ...
</ul>

    </div>
    <div class="span10">
    
    <p class="lead">Within the download you'll find the following file structure and contents, logically grouping common assets and providing both compiled and minified variations.</p>

<p>Once downloaded, unzip the compressed folder to see the structure of (the compiled) Bootstrap. You'll see something like this:</p>
<small>
  bootstrap/
  ├── css/
  │   ├── bootstrap.css
  │   ├── bootstrap.min.css
  ├── js/
  │   ├── bootstrap.js
  │   ├── bootstrap.min.js
  └── img/
      ├── glyphicons-halflings.png
      └── glyphicons-halflings-white.png
</small>
<p class="text-right">This is the most basic form of Bootstrap: compiled files for quick drop-in usage in nearly any web project. We provide compiled CSS and JS (bootstrap.*), as well as compiled and minified CSS and JS (bootstrap.min.*). The image files are compressed using ImageOptim, a Mac app for compressing PNGs.</p>

Please note that all JavaScript plugins require jQuery to be included.

<blockquote class="pull-right">
3. What's included
Bootstrap comes equipped with HTML, CSS, and JS for all sorts of things, but they can be summarized with a handful of categories visible at the top of the Bootstrap documentation.
<small>Someone famous <cite title="Source Title">Source Title</cite></small>
</blockquote>

Docs sections
Scaffolding

Global styles for the body to reset type and background, link styles, grid system, and two simple layouts.

Base CSS

Styles for common HTML elements like typography, code, tables, forms, and buttons. Also includes Glyphicons, a great little icon set.

Components

Basic styles for common interface components like tabs and pills, navbar, alerts, page headers, and more.

JavaScript plugins

Similar to Components, these JavaScript plugins are interactive components for things like tooltips, popovers, modals, and more.


    </div>
  </div>
</div>

</body>

	<script src="js/jquery-1.10.1.min.js"></script>
    <script src="bootstrap-2.3/js/bootstrap.min.js"></script>
  </body>
</html>