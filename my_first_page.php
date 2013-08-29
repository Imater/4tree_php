<script>
	$(document).ready(function() {
        $('#carousel-example-generic').carousel({
			interval: 12000
		});

  });
</script>

<div id="carousel-example-generic" class="carousel slide" data-interval="12000" data-pause="hover">
  <!-- Indicators -->
  <ol class="carousel-indicators">
    <li data-target="#carousel-screen1" data-slide-to="0" class="active"></li>
    <li data-target="#carousel-screen2" data-slide-to="1"></li>
    <li data-target="#carousel-screen3" data-slide-to="2"></li>
    <li data-target="#carousel-screen4" data-slide-to="3"></li>
    <li data-target="#carousel-screen5" data-slide-to="4"></li>
    <li data-target="#carousel-screen6" data-slide-to="5"></li>
    <li data-target="#carousel-screen7" data-slide-to="6"></li>
    <li data-target="#carousel-screen8" data-slide-to="7"></li>
  </ol>

  <!-- Wrapper for slides -->
  <div class="carousel-inner">

    <div class="item active">
      <div class="image_inner">
      <img src="img/web/screen-1.jpg" alt="...">
      </div>
      <div class="carousel-caption">
        Дела, заметки, календарь и дневник...
      </div>
    </div>

    <div class="item">
      <div class="image_inner">
      <img src="img/web/screen-2.png" alt="...">
      </div>
      <div class="carousel-caption">
        Карта ума, редактор с вложенными комментариями...
      </div>
    </div>

    <div class="item">
      <div class="image_inner">
      <img src="img/web/screen-3.jpg" alt="...">
      </div>
      <div class="carousel-caption">
        Календарь с SMS напоминаниями...
      </div>
    </div>

    <div class="item">
      <div class="image_inner">
      <img src="img/web/screen-4.jpg" alt="...">
      </div>
      <div class="carousel-caption">
        Встроенная [[Wiki]]. Вставка картинок из буфера обмена...
      </div>
    </div>

    <div class="item">
      <div class="image_inner">
      <img src="img/web/screen-5.png" alt="...">
      </div>
      <div class="carousel-caption">
        Система сворачивающихся дневников с календарём...<br>
        Делитесь заметками ссылками вида <a href="https://4tree.ru/7d62" target="_blank">4tree.ru/7d62</a>.
      </div>
    </div>

    <div class="item">
      <div class="image_inner">
      <img src="img/web/screen-6.jpg" alt="...">
      </div>
      <div class="carousel-caption">
        Теги с вложенной структурой для контекстного планирования.<br>
        Таймер с вcтроенной системой "Pomodorro".
      </div>
    </div>

    <div class="item">
      <div class="image_inner">
      <img src="img/web/screen-7.png" alt="...">
      </div>
      <div class="carousel-caption">
       120 иконок для оформления папок.<br>
       Анализ ввода дат на русском языке.
      </div>
    </div>

    <div class="item">
      <div class="image_inner">
      <img src="img/web/screen-8.png" alt="...">
      </div>
      <div class="carousel-caption">
       <a href="login.php?reg"><button type="button" class="btn btn-success">Регистрация в 2 клика</button></a>
      </div>
    </div>

  </div>

  <!-- Controls -->
  <a class="left carousel-control" href="#carousel-example-generic" data-slide="prev">
    <span class="icon-prev"></span>
  </a>
  <a class="right carousel-control" href="#carousel-example-generic" data-slide="next">
    <span class="icon-next"></span>
  </a>
</div>


    <!-- Marketing messaging and featurettes
    ================================================== -->
    <!-- Wrap the rest of the page in another container to center all the content. -->

    <div class="container marketing">

      <!-- Three columns of text below the carousel -->
      <div class="row">
        <div class="col-lg-4">
          <img class="img-circle" src="img/web/screen-round-1.png" data-src="bootstrap-3/js/holder.js/140x140" alt="Generic placeholder image">
          <h2>Карты ума</h2>
          <p>Размышляйте при помощи карт ума. Создавайте новые ветки горячими клавишами. Перетаскивайте элементы мышкой по карте или на второе дерево. Фокусируйтесь на части карты двойным кликом.</p>
          <p><a class="btn btn-default" style="display:none" href="#">Поробнее &raquo;</a></p>
        </div><!-- /.col-lg-4 -->
        <div class="col-lg-4">
          <img class="img-circle" src="img/web/screen-round-2.jpg" data-src="bootstrap-3/js/holder.js/140x140" alt="Generic placeholder image">
          <h2>Дерево</h2>
          <p>Отображайте дерево любым из трёх видов: обычное дерево, панели или карта ума. Наводите порядок, открывая два дерева одновременно и перетаскивая дела и заметки между ними.</p>
          <p><a class="btn btn-default" style="display:none" href="#">Поробнее &raquo;</a></p>
        </div><!-- /.col-lg-4 -->
        <div class="col-lg-4">
          <img class="img-circle" src="img/web/screen-round-3.jpg" data-src="bootstrap-3/js/holder.js/140x140" alt="Generic placeholder image">
          <h2>Календарь</h2>
          <p>Перетаскивайте любые дела в большой календарь и отображайте их любым из пяти видов. Переносите дела внутри календаря мышкой. Ставьте себе SMS напоминания.</p>
          <p><a class="btn btn-default"  style="display:none" href="#">Поробнее &raquo;</a></p>
        </div><!-- /.col-lg-4 -->
      </div><!-- /.row -->


      <!-- START THE FEATURETTES -->

      <hr class="featurette-divider">

	<p><b>Видео демонстрирующее добавление заметки и вставку картинок в редактор:</b>
			<div class="flex-video">
			<iframe src="http://www.youtube.com/embed/V-9tJDpVNVc?&vq=hd1080" frameborder="0" allowfullscreen></iframe>
			</div>
	  
      <hr class="featurette-divider">

      <div class="row featurette">
        <div class="col-md-6">
          <h2 class="featurette-heading">Тайм-менеджмент, <span class="text-muted">когда всё под рукой</span></h2>
          <p class="lead">Как не запутаться в делах, заметках, календарях, контактах, файлах, картинках, дневниках и программах для их хранения? Храните всё важное в одном месте и управляйте всем этим так, как вам хочется.</p>
          <p class="lead">Getting Things Done, система Кови, контекстное планирование, система Pomodorro, традиционное планирование в календаре, списки дел, система сворачивающихся дневников, карты ума — всё это легко.</p>
        </div>
        <div class="col-md-6">
          <img class="featurette-image img-responsive" src="img/web/screen-words-1.jpg" data-src="bootstrap-3/js/holder.js/500x500/auto" alt="Generic placeholder image">
        </div>
      </div>

      <hr class="featurette-divider">

      <div class="row featurette">
        <div class="col-md-6">
          <img class="featurette-image img-responsive" src="img/web/screen-words-2.png" data-src="bootstrap-3/js/holder.js/500x500/auto" alt="Generic placeholder image">
        </div>
        <div class="col-md-6">
          <h2 class="featurette-heading">Ведите дневник. <span class="text-muted">Запоминайте всё.</span></h2>
          <p class="lead">Вести дневник очень легко. Вы можете записывать события дня, недели, месяца, квартала и года. Переносите всё самое важное, что у вас произошло вверх. Вспоминайте даты событий при помощи поиска или календарика.</p>
          <p class="lead">
	          Открывайте несколько заметок одновременно и редактируйте их вместе. Если вы устали от тайм-менеджмента, планируйте прямо в дневнике. Пишите списки дел и ставьте галочки при выполнении. 
          </p>
        </div>
      </div>

      <hr class="featurette-divider">

      <div class="row featurette">
        <div class="col-md-6">
          <h2 class="featurette-heading">C чего начать <span class="text-muted">и как изучить?</span></h2>
          <p class="lead">Чтобы ничего не пропустить, нужно 2 шага:</p>
		  <a href="login.php?reg"><button type="button" class="btn btn-success">Регистрация</button></a>
		  <a href="./getting_started"><button type="button" class="btn btn-info">Пройти курс молодого бойца</button></a>
        </div>
        <div class="col-md-6">
          <img class="featurette-image img-responsive" src="img/web/screen-last.png" data-src="bootstrap-3/js/holder.js/500x500/auto" alt="Generic placeholder image">
        </div>
      </div>

      <hr class="featurette-divider">

      <!-- /END THE FEATURETTES -->


	  <? include "my_footer.php"; ?>
	  
    </div><!-- /.container -->