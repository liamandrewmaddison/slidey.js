var imageSlider = function (options) {

	var opts = {
		parent: $('.image-slider'),
		threshold: 10, //percentage
	};

	$.extend(opts, options);

	if (opts.parent.length > 1) {
		return opts.parent.each(function(i, elem){
			imageSlider({
				parent: $(elem),
				threshold: opts.threshold
			});
		});
	}
	
	var templates = {
		dots: '{{#dots}}<a href="javascript:;" data-id="{{i}}" class="image-slider__dot"></a>{{/dots}}',
	};

	var imageSliderModule = {
		store: {
			threshold: opts.threshold, //percentage
			index: 0,
			distanceTravelled: 0,
			percentageTravelled: 0,
			initialClickPos: 0,
			currentMousePos: 0,
			direction: null,
		},
		events: {
			isMouseDown: false,
			isMouseMove: false,
		},
		cacheDom: function () {
			this.$parent = opts.parent;
			this.$sliderList = this.$parent.find('.image-slider__list');
			this.$images = this.$parent.find('.image-slider__image');
			this.$next = this.$parent.find('.image-slider__next');
			this.$prev = this.$parent.find('.image-slider__prev');
			this.$dots = this.$parent.find('.image-slider__dots');
		},
		bindEvents: function () {
			this.$parent.on('mousedown touchstart', this.mousedown.bind(this));
			$(document).on('mousemove touchmove', this.mousemove.bind(this));
			$(document).on('mouseup touchend', this.mouseup.bind(this));
			this.$next.on('click', this.next.bind(this));
			this.$prev.on('click', this.prev.bind(this));
			this.$dots.on('click', this.nav.bind(this));
		},
		getCurrentEvent: function (event) {
			if (
				event.type == 'touchstart' ||
				event.type == 'touchmove' ||
				event.type == 'touchend'
				) {
				return { 
					x: event.originalEvent.touches[0].pageX,
					y: event.originalEvent.touches[0].pageY,
				}
			} else if (
				event.type == 'mousedown' ||
				event.type == 'mousemove' ||
				event.type == 'mousestart'
				) {
				return {
					x: event.pageX,
					y: event.pageY,
				}
			}
		},
		getMousePos: function (event) {
			var pageEvents = this.getCurrentEvent(event);
			var x = pageEvents.x - this.$parent.offset().left;
			var y = pageEvents.y - this.$parent.offset().top;
			return { x: x, y: y };
		},
		setDirection: function (event) {
			var pageX = this.getCurrentEvent(event).x;
			if (pageX > this.store.currentMousePos) {
				this.store.direction = 'right';
			} else if (pageX < this.store.currentMousePos) {
				this.store.direction = 'left';
			}
			this.store.currentMousePos = pageX;
		},
		createSlider: function () {
			this.parentWidth = this.$parent.width();
			this.$sliderList.width(this.$images.length * this.parentWidth);
			this.$images.width(this.parentWidth);
		},
		next: function (e) {
			if (this.store.index >= (this.$images.length - 1)) {
				this.store.index = 0;
			} else {
				this.store.index++;
			}
			this.render();
		},
		prev: function (e) {
			if (this.store.index <= 0) {
				this.store.index = (this.$images.length - 1);
			} else {
				this.store.index--;
			}
			this.render();
		},
		nav: function (e) {
			if (e.target.dataset.id) {
				this.store.index = e.target.dataset.id;
				this.render();
			}
		},
		mousedown: function (e) {
			this.events.isMouseDown = true;
			this.store.initialClickPos = this.getMousePos(e).x;
		},
		mousemove: function (e) {
			if (this.events.isMouseDown) {
				this.events.isMouseMove = true;
				e.stopPropagation();
				this.setDirection(e);
				var currentMouseTravel = this.getMousePos(e).x;
				var movement = this.store.initialClickPos - currentMouseTravel;
				this.store.percentageTravelled = (movement/this.parentWidth) * 100;
				this.$sliderList.addClass('image-slider__list--no-animation');
				this.$sliderList.css({
					transform: 'translate3d(' + (-this.store.distanceTravelled - movement) + 'px, 0, 0)',
					cursor: '-webkit-grabbing',
				});
			}
		},
		mouseup: function (e) {
			if (this.events.isMouseMove) {
				switch (this.store.direction) {
					case 'left':
						if (this.store.percentageTravelled >= this.store.threshold && 
							this.store.index < this.$images.length - 1)
						{
							this.next();
						} else {
							this.render();
						}
						break;
					case 'right':
						if ((this.store.percentageTravelled * -1) >= this.store.threshold &&
							this.store.index !== 0) 
						{
							this.prev();
						} else {
							this.render();
						}
				}
				this.store.percentageTravelled = 0;
				this.store.initialClickPos = 0;
			}
			this.events.isMouseDown = false;
			this.events.isMouseMove = false;
		},
		safeCheck: function () {
			if (this.$images.length <= 1) {
				this.$prev.hide();
				this.$next.hide();
				this.$dots.hide();
			}
		},
		renderDots: function () {
			var dots = []; 
			this.$images.map(function(i, elem){
				dots.push({
					i: i,
					elem: elem,
				});
			});
			var template = Mustache.render(templates.dots, { dots: dots});
			this.$dots.html(template);
		},
		render: function () {
			var amountToMove = this.store.index * this.parentWidth;
			this.store.distanceTravelled = amountToMove;
			this.$sliderList.removeClass('image-slider__list--no-animation');
			this.$sliderList.css({
				transform: 'translate3d(' + (-amountToMove) + 'px, 0, 0)',
				'cursor': 'default',
			});
			this.$dots.find('a').removeClass('image-slider__dot--active');
			this.$dots.find('a[data-id="' + this.store.index + '"]').addClass('image-slider__dot--active');
		},
		init: function () {
			this.cacheDom();
			this.bindEvents();
			this.createSlider();
			this.renderDots();
			this.render();
			this.safeCheck();
			this.$images.find('img').show();
		}
	};

	return imageSliderModule.init();
};