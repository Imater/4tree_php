(function($) {
	$.fn.inputDefualts = function(options) {
		// дефолтные значения
		var defaults = {
 			cl: 'inactive', // имя класса для неактивного состояния
 			text: this.val()   // значение берется из самого инпута
  		}, 	opts = $.extend(defaults, options);	
  		
  		console.info(opts);
  		
  		this.addClass(opts['cl']); 	// добавляем класс к инпуту
  		this.val(opts['text']);			// ставим значение по умолчанию
  		
  		// обрабатываем события фокуса на поле
  		this.focus(function() {
  			if($(this).val() == opts['text']) $(this).val(''); // обнуляем его, если надо
  			$(this).removeClass(opts['cl']); // убираем класс
  		});
  		
  		// теперь очередь блюра
  		this.blur(function() {
  			if($(this).val() == '') {
  				$(this).val(opts['text']); 			// возвращаем значение
  				$(this).addClass(opts['cl']); 	// и класс, если надо
  			}
  		});
	};
	
})(jQuery);