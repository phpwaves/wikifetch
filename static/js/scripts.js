// Settings
var settings = {
	pageTransition: 'scroll-vertical', // page transition (fade, scale, scroll-vertical, scroll-horizontal)
	bodyBackgroundImage: false, // show body background image? (true, false)
	bodyBackgroundImagePath: 'img/background-1.jpg', // path to the background image
	twitterWidgetId: '355933225069187074' // your Twitter widget ID (see the documentation)
}

$(function() {

	var $html = $('html'),
		$body = $('body'),
		$sidenav = $('<nav id="sidenav"/>'),
		$pageContentWrapper = $('<div id="page-content-wrapper"/>'),
		$container = $('#container'),
		$header = $('#header'),
		$mainnav = $('#mainnav'),
		$mainnavItems = $mainnav.find('li'),
		$activeMainnavItem = $mainnavItems.filter('.active'),
		$footer = $('#footer'),
		localChrome = (window.location.protocol == 'file:' && !!window.chrome);

/* ==========================================================================
   Initial Animations
   ========================================================================== */

	var showContainer = function() {
		$container.add($header).add($footer).addClass('init');
		setTimeout(function() {
			$header.add($footer).addClass('visible');
		}, 400);
		setTimeout(function() {
			$container.addClass('visible');
		}, 400);
		setTimeout(function() {
			$container.add($header).add($footer).removeClass('init');
		}, 400);
		
		animateContent($('div.page-content[data-active]'));
		setTimeout(function() {
			initHomepageAnimations();
		}, 400);
	}
	
	var animateContent = function($content) {
		if ($content.find('div.progress-bar').length) {
			var t = 0;
			$('div.progress-bar').each(function() {
				var $bar = $(this).children();
				var w = $bar.css('width');
				$bar.css({ width: '0%' });
				setTimeout(function() {
					$bar.animate({
						width: w
					}, 1000);
				}, t);
				t += 200;
			});
		}
	}

/* ==========================================================================
   Body Background
   ========================================================================== */

	if (settings.bodyBackgroundImage) {
		$.backstretch(settings.bodyBackgroundImagePath, {
			centeredY: false,
			fade: 500
		});
		$(window).on('backstretch.after', function(e, instance, index) {
			showContainer();
		});
	} else {
		setTimeout(showContainer, 500);
	}

/* ==========================================================================
   Layout Helpers
   ========================================================================== */

	var initLayoutHelpers = function() {
		
		$mainnav.find('a').append('<span class="helper1"/><span class="helper2"/>');
		$sidenav.append($mainnav.children('ul').clone().removeAttr('style'));
		$body.prepend($sidenav);
		$body.wrapInner('<div id="wrapper"/>');
		
	}

/* ==========================================================================
   Content Helpers
   ========================================================================== */

	var initContentHelpers = function() {
	
		$('.section-heading, figure.photo, ul.extended li, figure.photo-small').append('<span class="helper"/>');
		$('.portfolio-item dt').prepend('<span class="helper"/>');
	
	}
	
	var toggleContentFooterHelper = function() {
	
		if ($('div.page-content[data-active] div.content-footer').length) {
			$html.addClass('w-content-footer');
		} else {
			$html.removeClass('w-content-footer');
		}
		
	}

/* ==========================================================================
   Tabs
   ========================================================================== */

	var initTabs = function() {
	
		$('ul.tabs, ul.tabs-vertical, div.filter-tabs ul').each(function() {
		
			if (!$(this).children('.active').length) {
				$(this).children(':first').addClass('active');
				if ($(this).parent().hasClass('filter-tabs') && !$(this).parent().hasClass('mixes')) {
					$(this).parent().next().children(':first').show();
				} else {
					$(this).next().children(':first').show();
				}
			}
			
			if ($(this).hasClass('tabs') || $(this).hasClass('tabs-vertical')) {
				var $wrapper = $('<div class="tabs-wrapper"/>');
				var $panes = $(this).next();
				$(this).wrap($wrapper);
				$panes.insertAfter($(this));
			}
			
		});
		
		$('ul.tabs a, ul.tabs-vertical a').click(function(e) {
			$(this).parent().addClass('active').siblings().removeClass('active');
			var $pane = $(this).closest('ul').next().children().eq($(this).parent().index());
			$pane.show().siblings().hide();
			
			var $parentSlider = $(this).closest('div.slider');
			if ($parentSlider.length) recalculateSliderHeight($parentSlider, $(this).closest('div.cycle-slide').index());
			
			updatePCWMinHeight();
			
			e.preventDefault();
		});
		
	}
	
/* ==========================================================================
   Accordions
   ========================================================================== */

	var initAccordions = function() {
	
		$('div.accordion').each(function() {
			if (!$(this).children('h2.active').length) {
				$(this).children('h2:first').addClass('active').next().show();
			}
			$(this).children('h2').append('<i/>');
		});
		
		$('div.accordion h2').click(function() {
			var $parentSlider = $(this).closest('div.slider');
			
			if ($(this).hasClass('active')) {
				$(this).removeClass('active').next().slideUp(250, function() {
					if ($parentSlider.length) {
						recalculateSliderHeight($parentSlider, $(this).closest('div.cycle-slide').index());
					}
				});
			} else {
				$(this).addClass('active').siblings('h2').removeClass('active');
				$(this).next().slideDown(250).siblings('div:visible').slideUp(250, function() {
					if ($parentSlider.length) {
						recalculateSliderHeight($parentSlider, $(this).closest('div.cycle-slide').index());
					}
				});
			}
			
			setTimeout(function() { updatePCWMinHeight(); }, 150);
		});
		
	}
	
/* ==========================================================================
   Filter Tabs
   ========================================================================== */

	var initFilterTabs = function() {
	
		$('div.filter-tabs').not('.mixes').find('li').click(function() {
			if (!$(this).hasClass('active')) {
				$(this).addClass('active').siblings().removeClass('active');
				var $pane = $('#'+$(this).data('pane'));
				$pane.show().siblings().hide();
				updatePCWMinHeight();	
			}
		});
		
	}

/* ==========================================================================
   Content Switch
   ========================================================================== */

	var initContentSwitch = function() {
	
		$('div.content-switch').each(function() {
		
			if (!$(this).find('div.controls li.active').length) {
				$(this).find('div.controls li:first').addClass('active');
				$(this).find('> .panes > div:first').show();
			}
			
		});
			
		$('div.content-switch div.controls li').click(function() {
			if (!$(this).hasClass('active')) {
				$(this).addClass('active').siblings().removeClass('active');
				$(this).closest('div.controls').next().children().eq($(this).index()).show().siblings().hide();
			}
		});
		
	}

/* ==========================================================================
   Sliders
   ========================================================================== */

	var initSliders = function() {
	
		$('div.slider').each(function() {
			var $slider = $(this),
				$items = $slider.children(':first');
			
			var $pager = $('<div class="pager"><div/></div>');
			$slider.append($pager);
			
			$items.cycle({
				slides: $items.children(),
				speed: 500,
				timeout: 0,
				fx: 'scrollHorz',
				pager: $pager.children()[0],
				pagerActiveClass: 'active',
				swipe: true,
				log: false
			});
			
			$slider.find('a.next-slide').click(function(e) {
				$items.cycle('next');
				e.preventDefault();
			});
			
			$pager.find('span').click(function() {
				$(this).addClass('active').siblings().removeClass('active');
			});
			
			$items.on('cycle-before', function(event, optionHash, outgoingSlideEl, incomingSlideEl, forwardFlag) {
				$items.height($(incomingSlideEl).height());
				updatePCWMinHeight();
			});
			
			if (!$slider.hasClass('.item-slider')) {
				$items.height($items.children(':first').height());
			}
			
		});
	
	}
	
	var recalculateSliderHeight = function($slider, activeSlideIndex) {
		var h = $slider.children('.items').children().eq(activeSlideIndex).outerHeight();
		$slider.children('.items').height(h);
	}
	
/* ==========================================================================
   Tooltips
   ========================================================================== */

	var initTooltips = function() {
	
		$('.tooltip').tooltipster({
			delay: 1,
			position: 'bottom',
			animation: 'grow',
			offsetY: -2
		});
	
	}

/* ==========================================================================
   Twitter Feed
   ========================================================================== */
	
	var initTwitterFeed = function() {
		
		var $twitterBox = $('#twitter-box');
		
		var handleTweets = function(tweets) {
	
			var x = tweets.length;
			var n = 0;
			var $feed = $('#twitter-feed');
			var html = '<div class="items">';
			var pagerHtml = '';
			while(n < x) {
				var item = tweets[n];
				item = item.replace('Posted ', '');
				html += '<p>' + item + '</p>';
				pagerHtml += '<span>'+(n+1)+'</span>';
				n++;
			}
			html += '</div>';
			$feed.append(html).append('<div class="pager"><div>'+pagerHtml+'</div></div>');
			
			$twitterBox.find('.items p:first').addClass('active');
			$twitterBox.find('div.items').height($twitterBox.find('div.items').children(':first').height());
				
			var tfShowItem = function(index) {
				$twitterBox.find('div.pager span').eq(index).addClass('active').siblings().removeClass('active');
				var $nextItem = $twitterBox.find('div.items p').eq(index);
				$twitterBox.find('div.items').height($nextItem.height());
				$nextItem.addClass('active').siblings().removeClass('active');
			}
			
			$twitterBox.find('div.pager span').click(function() {
				var index = $(this).index();
				tfShowItem(index);
			}).filter(':first').addClass('active');
			
			var tfCycle = setInterval(function() {
				var $activeItem = $twitterBox.find('div.items p.active');
				if ($activeItem.index() + 1 == $twitterBox.find('div.items p').length) {
					var index = 0;
				} else {
					var index = $activeItem.index() + 1;
				}
				tfShowItem(index);
			}, 5000);
			
		}
		
		if ($twitterBox.length) {
			
			twitterFetcher.fetch(settings.twitterWidgetId, '', 3, true, false, true, '', false, handleTweets);
			
		}
		
	}

/* ==========================================================================
   Homepage
   ========================================================================== */

	var $welcome = $('div.welcome-block'),
		$shortcuts = $('div.shortcuts'),
		$socialMedia = $('div.social-media-block'),
		$ribbon = $ribbon;
	
	var initHomepage = function() {
	
		if ($shortcuts.length) {
		
			$shortcuts.find('a').hover(function() {
				$(this).parent().parent().next().children().eq($(this).parent().index()).addClass('wo-shadow');
			}, function() {
				$(this).parent().parent().next().children().eq($(this).parent().index()).removeClass('wo-shadow');
			});
			
		}
	
	}
	
	//$welcome.add($shortcuts.find('div.span6')).add($socialMedia.children(':first')).add($socialMedia.find('li a')).addClass('init');
	
	var initHomepageAnimations = function() {
		
		if ($('div.page-content[data-active][data-menu-item=0]').length) {
			
			$welcome.add($shortcuts.find('div.span6')).add($socialMedia.children(':first')).addClass('visible');
			
			var i = 0;
			var interval = setInterval(function() {
				$socialMedia.find('li:eq('+i+') a').addClass('visible');
				i++;
				if (i > $socialMedia.find('li:last').index()) {
					clearInterval(interval);
				}
			}, 100);
			
			setTimeout(function() {
				$welcome.add($shortcuts.find('div.span6')).add($socialMedia.children(':first')).removeClass('init');
			}, 1000);
			
			setTimeout(function() {
				$socialMedia.find('li a').removeClass('init');
			}, 3000);
			
		}
		
	}

/* ==========================================================================
   Portfolio
   ========================================================================== */

	var initPortfolio = function() {
		
		var $portfolioGrid = $('#portfolio-grid'),
			$portfolioItems = $('#portfolio-items');
		
		var firstPortfolioFilter = $portfolioGrid.prev().find('li:first').data('filter');
		$portfolioGrid.find('img').after('<div class="overlay"/><div class="ind-open"/>').end().append('<li class="placeholder"/>').mixitup({
			transitionSpeed: 500,
			showOnLoad: firstPortfolioFilter,
			onMixStart: function() {
				$pageContentWrapper.css({ minHeight: 0 });
			},
			onMixEnd: function() {
				$pageContentWrapper.css({ minHeight: $pageContentWrapper.height() });
			}
		});
		
		$portfolioGrid.find('a').magnificPopup({
			gallery: {
				enabled: true,
				navigateByImgClick: false,
				tCounter: ''
			},
			removalDelay: 300,
			mainClass: 'mfp-anim',
			closeBtnInside: false,
			tLoading: '',
			retina: {
				ratio: 1
			},
			iframe: {
				markup: '<div class="mfp-iframe-wrapper"><div class="mfp-iframe-wrapper2"><div class="mfp-iframe-scaler">'+'<div class="mfp-close"></div>'+'<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>'+'</div></div></div>',
				patterns: {
					youtube: {
						src: 'http://www.youtube.com/embed/%id%?autoplay=1'
					},
					vimeo: {
						src: 'http://player.vimeo.com/video/%id%?autoplay=1'
					}
				}
			},
			callbacks: {
				buildControls: function() {
					this.contentContainer.append(this.arrowLeft.add(this.arrowRight));
				}
			}
		});
		
		$portfolioItems.children().addClass('mfp-hide');

	}

/* ==========================================================================
   Contact
   ========================================================================== */

	var initContact = function() {
		
		$('input, textarea').placeholder();
		
		$('form[data-validate="parsley"]').each(function() {
			$(this).parsley({
				errors: {
					errorsWrapper: ''
				}
			});
		});
		
		$('#contact-form').append('<div class="loader hidden">Sending…</div>').submit(function(e) {
			var $form = $(this);
			if ($form.parsley('validate')) {
				$form.find('fieldset').addClass('hidden').slideUp(500, function() {
					$form.find('.loader').removeClass('hidden');
					$.post($form.attr('action'), $form.serialize(), function(data) {
						$form.find('.loader').addClass('hidden');
						if (data == 'success') {
							$form.find('.alert.success').removeClass('hidden');
						} else {
							$form.find('.alert.error').removeClass('hidden');
						}
					});
				});
			}
			e.preventDefault();
		});
		
		$('#postcard form').submit(function(e) {
			var $form = $(this);
			if ($form.parsley('validate')) {
				$form.parent().addClass('hidden');
				setTimeout(function() {
					$form.parent().parent().slideUp(500, function() {
						$form.parent().parent().parent().find('.loader').removeClass('hidden');
						$.post($form.attr('action'), $form.serialize(), function(data) {
							$form.parent().parent().parent().find('.loader').addClass('hidden');
							if (data == 'success') {
								$form.parent().parent().parent().find('.alert.success').removeClass('hidden');
							} else {
								$form.parent().parent().parent().find('.alert.error').removeClass('hidden');
							}
						});
					});
				}, 500);
			}
			e.preventDefault();
		}).parent().parent().parent().append('<div class="loader hidden">Sending…</div>')
		
		$('a.popup-gmaps').magnificPopup({
			type: 'iframe',
			removalDelay: 300,
			mainClass: 'mfp-anim',
			closeBtnInside: false,
			tLoading: '',
			iframe: {
				markup: '<div class="mfp-iframe-wrapper"><div class="mfp-iframe-wrapper2"><div class="mfp-iframe-scaler">'+'<div class="mfp-close"></div>'+'<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>'+'</div></div></div>',
				patterns: {
					youtube: {
						src: 'http://www.youtube.com/embed/%id%?autoplay=1'
					},
					vimeo: {
						src: 'http://player.vimeo.com/video/%id%?autoplay=1'
					}
				}
			}
		});
		
		$('#postcard div.stamp').children(':first').show().end().click(function() {
			var curIndex = $(this).children(':visible').index();
			var nextIndex = $(this).children().length > curIndex + 1 ? curIndex + 1 : 0;
			$(this).children().eq(nextIndex).show().siblings().hide();
		});
		
	}

/* ==========================================================================
   Main Menu
   ========================================================================== */

	$mainnavItems.on({
		mousedown: function() {
			$(this).addClass('active').siblings('.active').data('prevActive', 1).removeClass('active');
		},
		click: function() {
			$(this).addClass('active').siblings().removeData('prevActive').filter('.active').removeClass('active');
		}
	});
	
	$(document).click(function() {
		var $prevActiveMnEl = $mainnavItems.filter(function() { return $(this).data('prevActive') });
		if ($prevActiveMnEl.length) {
			$prevActiveMnEl.removeData('prevActive').addClass('active').siblings().removeClass('active');
		}
	});
	
	var $sidenavTrigger = $('<a id="sidenav-trigger" href="#sidenav"/>'),
		$mobileNavHeader = $('<h1 id="mobile-nav-header">'+$header.find('h1').text()+'</h1>');
	$mainnav.append($sidenavTrigger.hide()).append($mobileNavHeader.hide());
	
	$sidenavTrigger.click(function(e) {
		setTimeout(function() {
			$body.toggleClass('no-scroll');
		}, 300);
		$('#wrapper').toggleClass('slide-right');
		e.preventDefault();
	});
	
	var toggleMobileNav = function(mode) {
		if (mode == 1) {
			$mainnav.addClass('mobile').children('ul').hide();
			$sidenavTrigger.add($mobileNavHeader).show();
			$container.children('.ribbon').hide();
			
		} else {
			$mainnav.removeClass('mobile').children('ul').show();
			$sidenavTrigger.add($mobileNavHeader).hide();
			$container.children('.ribbon').show();
		}
	}
	
	var adjustMenuItemWidth = function() {
		var w = $mainnav.width() - 20;
		if ($mainnavItems.length * 140 > w) {
			var nw = parseInt(w / $mainnavItems.length);
			if (nw > 95) {
				$mainnavItems.width(nw);
				toggleMobileNav(0);
			} else {
				toggleMobileNav(1);
			}
		}
	}
	
	$(window).resize(function()  {
		adjustMenuItemWidth();
	});
	
	adjustMenuItemWidth();
	setTimeout(function() {
		adjustMenuItemWidth();
	}, 1);

/* ==========================================================================
   Fullscreen Mode
   ========================================================================== */

	var $fullscreenTrigger = $('<div id="fullscreen-trigger"/>');
	$mainnav.append($fullscreenTrigger);
	
	$fullscreenTrigger.click(function() {
		if ($(this).hasClass('on')) {
			$html.removeClass('full');
			$header.css({ marginTop: 0 });
			$container.removeClass('full');
			setTimeout(function() {
				$container.removeClass('w-transition');
				$('div.main-content').css({ maxWidth: '' });
			}, 500);
		} else {
			$html.addClass('full');
			$header.css({ marginTop: -$header.outerHeight() });
			$('div.main-content').css({ maxWidth: $container.width() });
			$container.addClass('w-transition full');
		}
		setTimeout(function() {	
			$fullscreenTrigger.toggleClass('on');
		}, 500);
	});

/* ==========================================================================
   Mobile Devices Support
   ========================================================================== */

	if ('ontouchstart' in document.documentElement) { // is it a touch device?
		$html.addClass('touch-support');
	}
	
	document.addEventListener('touchstart', function() {}, true); // enables :active button state on mobile Safari

/* ==========================================================================
   IE Fixes
   ========================================================================== */

	var ie9 = false; /*@cc_on ie9 = (@_jscript_version == 9); @*/
	var ie10 = false; /*@cc_on ie10 = (@_jscript_version == 10); @*/
	
	if (ie9) $html.addClass('ie9');
	if (ie10) $html.addClass('ie10');

/* ==========================================================================
   Initialization
   ========================================================================== */

	var menuLinks = [],
		allRequests = [],
		pagesLoaded = 0;
	
	$mainnavItems.each(function() {
		menuLinks.push($(this).children().attr('href'));
	});
	
	var currentSubpageIndex = $mainnavItems.filter('.active').index();
	var $pageContent = $('<div class="page-content" data-menu-item="'+currentSubpageIndex+'" data-title="'+document.title+'" data-active="1"/>');
	$container.children().not($mainnav).wrapAll($pageContentWrapper).wrapAll($pageContent);
	$pageContentWrapper = $('#page-content-wrapper');
	
	$mainnavItems.not('.active').children('a').each(function() {
		var $link = $(this);
		var request = $.ajax({
			url: $link.attr('href'),
			dataType: 'html'
		}).done(function(html) {
			var subpageIndex = $link.parent().index(),
				$pageBody = $('<div>' + html.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '') + '</div>'),
				pageTitle = html.match(/<title[^>]*>([^<]+)<\/title>/)[1],
				$subpageContent = $('<div class="page-content hidden" data-menu-item="'+subpageIndex+'" data-title="'+pageTitle+'"/>');
			$subpageContent.append($pageBody.find('#container').find('#mainnav').remove().end().children());
			$subpageContent.appendTo($pageContentWrapper);
			pagesLoaded++;
			if (pagesLoaded == $mainnavItems.not('.active').length) {
				initContent();
			}
		});
	});
	
	var showSubpage = function(menuIndex) {
		
		$mainnavItems.eq(menuIndex).add($sidenav.find('li').eq(menuIndex)).addClass('active').siblings().removeClass('active');
		
		var $oldSubpageContent = $pageContentWrapper.children('[data-active]'),
			$newSubpageContent = $pageContentWrapper.children('[data-menu-item='+menuIndex+']');
		
		if ($oldSubpageContent.attr('data-menu-item') != $newSubpageContent.attr('data-menu-item')) {
		
			$oldSubpageContent.removeAttr('data-active').addClass('new-hidden');
			$oldSubpageContent.children('.ribbon').add($newSubpageContent.children('.ribbon')).hide();
			$newSubpageContent.attr('data-active', '1').addClass('init');
			setTimeout(function() {
				$newSubpageContent.removeClass('hidden');
			}, 1);
			var newSubpageContentHeight = $newSubpageContent.height();
			if ($newSubpageContent.find('#twitter-box').length) newSubpageContentHeight = newSubpageContentHeight - 10;
			$pageContentWrapper.css({ minHeight: newSubpageContentHeight });
			setTimeout(function() {
				$newSubpageContent.removeClass('init');
				$oldSubpageContent.removeClass('new-hidden').addClass('hidden');
			}, 300);
			setTimeout(function() {
				$newSubpageContent.children('.ribbon').fadeIn(300);
			}, 600);
	
			document.title = $newSubpageContent.data('title');
			
			toggleContentFooterHelper();
			
			animateContent($newSubpageContent);
		}
	}
	
	var searchForPageLinks = function() {
		
		$('a').filter(function() {
			return menuLinks.indexOf($(this).attr('href')) !== -1;
		}).click(function(e) {
			if (!localChrome) {
				var index = menuLinks.indexOf($(this).attr('href'));
				if (index != $pageContentWrapper.children('[data-active]').data('menu-item')) {
					showSubpage(index);
					if (window.history && history.pushState) history.pushState(index.toString(), document.title, $(this)[0].href);
				}
				e.preventDefault();
			}
		});
		
	}
	
	var updatePCWMinHeight = function() {
		$pageContentWrapper.css({ minHeight: 0 });
		setTimeout(function() { $pageContentWrapper.css({ minHeight: $pageContentWrapper.height() }); }, 300);
	}
	
	var initContent = function() {
		
		initContentHelpers();
		initTabs();
		initAccordions();
		initFilterTabs();
		initContentSwitch();
		initSliders();
		initTooltips();
		initTwitterFeed();
		initHomepage();
		initPortfolio();
		initContact();
		
		toggleContentFooterHelper();
		searchForPageLinks();
		$pageContentWrapper.css({ minHeight: $pageContentWrapper.height() });
		
	}
	
	var pageURL = $activeMainnavItem.children('a')[0].href;
	if (window.history && history.pushState) history.replaceState($activeMainnavItem.index().toString(), document.title, pageURL);
	
	window.addEventListener('popstate', function(e) {
		if (e.state) {
			showSubpage(e.state);
		}
	});
	
	initLayoutHelpers();
	searchForPageLinks();
	
	if (localChrome) {
		initContent();
	}
	
	$('body').attr('data-page-transition', settings.pageTransition);
	
	$sidenav.find('a').click(function() {
		$sidenavTrigger.click();
	});

});