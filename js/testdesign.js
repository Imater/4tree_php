function jsDoFirst() {
	$(".tree_tab_menu").on("click","li",function(){
		$(".tree_tab_menu").find(".active").removeClass("active");
		$(this).addClass("active");
	})
}