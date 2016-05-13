var recipeArr;

function RecipeArray() {
    this.recipes = [];
    this.init = function(r) {
        for (var i = 0; i < r['count']; i++) {
            this.recipes.push(new Recipe(r['recipes'][i]));
        }
    };
    this.output_recipes = function() {
        for (var i = 0; i < this.recipes.length; i++) {
            $('#recipeDivHolder').append(this.recipes[i].get_div());
        }
    }
}

// Recipe Object
function Recipe(recipeObject) {
    this.publisher = recipeObject['publisher'];
    this.title = s.unescapeHTML(recipeObject['title']);
    this.social_rank = recipeObject['social_rank'];
    this.f2f_url = recipeObject['f2f_url'];
    this.publisher_url = recipeObject['publisher_url'];
    this.source_url = recipeObject['source_url'];
    this.image_url = recipeObject['image_url'];
    this.recipe_id = recipeObject['recipe_id'];
    this.ingredients = [];
    this.state = 0; // 0 is picture; 1 is card
	this.context = 0;
    this.flipper = function(ctx) {
		if (ctx == undefined) {
			ctx = this.context;
		}
        if (this.state == 0) {
			_.each(recipeArr.recipes,function (recipe) {
				if(recipe.state == 1){
					recipe.flipper();
				}
			});
            $(ctx).empty();
            $(ctx).toggleClass('recipe-card recipeDiv');
            var recipe_card_ingredients_list = $('<ul></ul>');
            for (var i = 0; i < this.ingredients.length; i++) {
                recipe_card_ingredients_list.append('<li>' + this.ingredients[i] + '</li>');
            }
            var recipe_card_ingredients_list_container = $('<div></div>');
            recipe_card_ingredients_list_container.append(recipe_card_ingredients_list);
            $(ctx).append(recipe_card_ingredients_list_container);
            recipe_card_ingredients_list_container.addClass('recipe-card-ingredients');
            $(ctx).css('background-image', 'none');
            recipe_card_ingredients_list.addClass('ingredient-card-list');
            var sourceBtn = $('<div>Go to Source</div>');
            sourceBtn.addClass('source-btn');
            sourceBtn.click(function() {
                window.open(this.source_url);
            });
            $(ctx).append(sourceBtn);
			this.state = 1;
        } else if (this.state == 1) {
            $(ctx).empty();
			$(ctx).toggleClass('recipe-card recipeDiv');
            $(ctx).css('backgroundRepeat', "no-repeat");
            var recipeNameDiv = $('<div>' + this.title + '</div>');
            recipeNameDiv.addClass('recipeNameDiv');
            $(ctx).append(recipeNameDiv);
            $(ctx).css('background-image', "url(" + this.image_url + ")");
			this.state = 0;
        }
    }
    this.get_div = function() {
        var self = this;
        var div = $('<div></div>');
        div.addClass('recipeDiv');
        div.css('background-image', "url(" + this.image_url + ")");
        div.css('backgroundRepeat', "no-repeat");
        var recipeNameDiv = $('<div></div>');
        recipeNameDiv.addClass('recipeNameDiv');
        recipeNameDiv.text(this.title);
        div.append(recipeNameDiv);
		this.context = div;
        div.click(function(e) {
            var that = this;
            if (e.target.className !== 'save-btn' && e.target.className !== 'source-btn') {
                if (self.ingredients == 0) {
                    $.post({
                        url: '/getIngredients',
                        data: {
                            'rId': self.recipe_id
                        },
                        beforeSend: function() {
                            let img = $('<span class="icon-spinner2 spinner"></span>');
                            img.css({
                                'position': 'absolute',
                                'margin-left': '50%',
                                'left': '-50px',
                                'margin-top': '150px',
                                'width': '100px',
                                'font-size': '100px',
                                'height': '100px'
                            });
                            $(that).append(img);
                        },
                        complete: function() {
                            $(that).children('img').remove();
                        },
                        success: function(response) {
                            var r = JSON.parse(response);
                            self.ingredients = r['recipe']['ingredients'];
                            self.flipper();
                        },
                        error: function(error) {
                            alert(`There was an error with ingredients retrieval\nStatus: ${error.status}\nResponse: ${error.responseText}`);
                        }
                    });
                } else {
                    self.flipper();
                }
            }
        });
        return div;
    }
}

function getRecipes() {
    $.post({
        url: '/getRecipes',
        data: $('#ingredientsForm').serialize(),
        complete: function() {
            $("body, html").animate({
                scrollTop: $('#recipeDivHolder').offset().top
            }, 600);
            $('.to-top-button').css({
                'display': 'block'
            });
        },
        success: function(response) {
            $('#recipeDivHolder').empty();
            recipes = [];
            var r = JSON.parse(response);
            recipeArr = new RecipeArray();
            recipeArr.init(r);
            recipeArr.output_recipes();
        },
        error: function(error) {
            alert(`There was an error with recipe retrieval\nStatus: ${error.status}\nResponse: ${error.responseText}`);
        }
    });
}

$('#getRecipes').click(function() {
    $('#ingredientsForm').submit();
});

$('#ingredientsForm').keypress(function(event) {
    if (event.which == 13) {
    	$('#ingredientsForm').submit();
        event.preventDefault();
    }
});

$('#ingredientsForm').submit(function(event) {
    compress();
    getRecipes();
    event.preventDefault();
});
$('.to-top-button').click(function() {
    $("body, html").animate({
        scrollTop: $('.page-one').offset().top
    }, 600);
    // $('.to-top-button').css({
    // 	'display':'none'
    // });
});
// $(window).scroll(function(){
// 	$('.to-top-button').css({
// 		'display':'block'
// 	})
//
// });
