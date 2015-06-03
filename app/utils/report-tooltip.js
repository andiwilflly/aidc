ICAD.reportTooltip = {
	create: function(el, view) {
		this.remove();
		var that = this,
			$targetEl = $(el),
			$targetElTop = $targetEl.offset().top,
			$targetElLeft = $targetEl.offset().left,
			$tableContainer = $("#reporting-details-container"),
			tableContainerTop = $tableContainer.offset().top,
			tableContainerLeft = $tableContainer.offset().left,
			tableHeight = view.detailsSideInner.height(),
			tableScroll = view.detailsWrapper.scrollTop(),
			tableWrapperTop = view.detailsWrapper.offset().top - 1,
			limitHeightTooltipBottom = tableHeight - tableScroll - ($targetElTop - tableWrapperTop) - view.itemHeight,
			limitHeightTooltipTop = tableScroll + ($targetElTop - tableWrapperTop),
			answerText = $.trim($targetEl.find("span").text()),
			tooltipBox = $("<div class='tooltip-answer'><i class='tooltip-answer__close'></i><div class='tooltip-answer__content'></div></div>"),
			tooltipBoxContent = tooltipBox.find('.tooltip-answer__content'),
			closeTooltipBtn = tooltipBox.find(".tooltip-answer__close"),
			limitHeightTooltip = 350,
			tooltipBorderHeight = 2;

		view.detailsWrapper.animate({scrollLeft: $("#reporting-details-table").width()}, 800);
		tooltipBoxContent.text(answerText);

		if( tableHeight > 450 ){
			if( limitHeightTooltipBottom >= limitHeightTooltip ) {
				tooltipBoxContent.css({"max-height": limitHeightTooltipBottom});
			} else {
				tooltipBox.css({
					"bottom": view.itemHeight,
					"top": "auto"
				});

				tooltipBoxContent.css({
					"overflow": "auto",
					"max-height": limitHeightTooltipTop
				});
			}
			$targetEl.append(tooltipBox);
		} else {
			tooltipBoxContent.css({"max-height": 350});
			$tableContainer.append(tooltipBox);

			var bottomLimitContainer = tableContainerTop + limitHeightTooltip,
				bottomLimitTooltip =  $targetElTop + view.itemHeight + tooltipBoxContent.outerHeight() + tooltipBorderHeight;

			if( bottomLimitTooltip > bottomLimitContainer ){
				var delta = bottomLimitTooltip - bottomLimitContainer;
				$tableContainer.css({
					"height": 355 + delta
				})
			}

			tooltipBox
				.css({
					"left": $targetElLeft - tableContainerLeft,
					"top": $targetElTop - tableContainerTop + view.itemHeight
				})
				.addClass("js-inside-body");
		}


		ICAD.onScroll(view.detailsWrapper, function() {
			$(".js-inside-body")
				.css({
					"left": $targetEl.offset().left - $tableContainer.offset().left,
					"top": $targetEl.offset().top - $tableContainer.offset().top + view.itemHeight
				})
		}, 1);

		closeTooltipBtn.on("click", function() {
			that.remove();
		});

		tooltipBox.on("click", function(e) {
			e.stopPropagation();
		});

	},
	remove: function() {
		$("body").find(".tooltip-answer").remove();
		$("body").find(".answer-tooltip-open").removeClass("answer-tooltip-open");
		$("#reporting-details-container")
			.css({"height": "auto"});
	}
};
