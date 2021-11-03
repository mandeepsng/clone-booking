var currentData = null;
var weekday = jQuery.fn.pickadate.defaults.weekdaysShort;
var months = jQuery.fn.pickadate.defaults.monthsFull;
var openEmployeeView = $('.bigButtonNextStep');
//var stepperService = $('.step-three #updatedIcon');
var catImg;
var stepperImgSrc;
var selectedServiceValue;
var picker_open_close;
var selectedDateAndTime;
var selectedDay;
var selectedWeekday;
var selectedWeekDate;
var selectedDayLabel;
var stepperDate = $('.step-five a:first-child .selectedOption');
$(window).on('load', function() {
	endLoadingScreen();
	$('.accordion').accordion({
		heightStyle: 'content',
		autoHeight: false,
		animated: false,
		activate: function(event, ui) {
            // if a category has master category and its preselected open the master category and then open the category
            $('.preselected-master-category').click();

			$('.booking-step').removeClass('active');

			if( $(ui.newPanel).hasClass('selectCompany') )
			{
				 $('.booking-step.step-one').addClass('active');
			}
			else if( $(ui.newPanel).hasClass('selectService') )
			{

				 $('.booking-step.step-three').addClass('active');

				 if($('.preselectedCategory').length>0 && $('.preselectedCategory').attr('aria-selected')=='false'){
			 		  $('#preServiceChecked').val('0');
			 			$('.preselectedCategory').click();
				 }

			}
			else if( $(ui.newPanel).hasClass('selectAppointee') )
			{
				 $('.booking-step.step-four').addClass('active');
			}
			else if( $(ui.newPanel).hasClass('chooseDateTime') )
			{
				 $('.booking-step.step-five').addClass('active');
			}
		},
	});
	$('#single_booking').click();
	$('.accordion').find('#ui-id-1').addClass('ui-state-disabled');
	$('.accordion').find('#ui-id-3').addClass('ui-state-disabled');
	$('.accordion').find('#ui-id-5').addClass('ui-state-disabled');
	$('.accordion').find('#ui-id-7').addClass('ui-state-disabled');

	$('.accordion2').accordion({
		heightStyle: 'content',
		collapsible: true,
		active: false,
		animated: false,
		autoHeight: false,
		beforeActivate: function(event,ui){
			let category_id = ui.newHeader.attr('data-value');
			let compid = window.compid;
			let duration = $('#container').attr('data-duration');
			let location_id = $('#location_id').val();
			let online_booking_type = '';

      if ($('#force_new_existing_patient').length > 0 && !isIframe()) {
        if ($('#force_new_existing_patient').val() == 1 && $('#online_booking_type').val() == '') {
          $('#set_branch_location').val(location_id);
          $('#force_client_Modal').foundation('reveal', 'open');
        }
      }

			if ($('#online_booking_type').length > 0) {
				online_booking_type = $('#online_booking_type').val();
			}
			//if ajax its called for one category dont call again.
			if(($(ui.oldHeader).length==1) && (($(ui.oldHeader).length)!=$(ui.newHeader).length)){
				return 0;
			}
			//if category its allready loaded don't load again.
			if(!($(ui.newHeader).data('is_loaded'))) {
				$.ajax({
					url:'ajax/bookings_services.php?compid=' + compid + '&group_id=' + category_id + '&duration=' + duration + '&location_id=' + location_id + '&online_booking_type=' + online_booking_type,
				}).done(function (data) {
					ui.newHeader.next().find('table').html(data);
                    checkNewExisting();
					let service_rows=document.querySelectorAll(".row-service-select");
					service_rows.forEach(function(elem) {
						elem.addEventListener("click", selectService, true);
						let openModalReview=elem.querySelector('.expand-modal-reviews');
						let closeModalReview =elem.querySelector('.close-modal');
						if(Boolean(openModalReview) && Boolean(closeModalReview)){
							openModalReview.addEventListener("click",modalReview);
							closeModalReview.addEventListener('click',closeModal);
						}
					})
					if ($('#service_select').val() == '1') {
						let pre_service = $('#pre_service').val();
						ui.newPanel.find(".service_add").each(function () {
							if (parseInt($(this).attr('id')) == parseInt(pre_service)) {
								$(this).closest('tr').click();
								$(this).closest('tr').addClass('row-selected');
								$(this).closest('tr').find("#serviceSelectBtn").addClass('selectedService');

								if ($('#preServiceChecked').val() == '0') {
									$('#preServiceChecked').val('1');
									ConfirmServices();
									return;
								}
							}
						});
					}


				});
				$(ui.newHeader).data('is_loaded',true);
			}
			// if a category has master category and its preselected open the master category and then open the category
				$('.preselected-master-category').click();
		},
        activate: function(event, ui) {
            checkNewExisting();
        }
	});
	if ($('.category').length == 1) {
		$('.category').click();
	}
	if ($('#location_id').val() != '') {
		startLoadingScreen();
		let location_id = parseInt($('#location_id').val());
		$('.other-loc-check:input[value=' + location_id + ']').attr("checked", true).trigger("change").click();

		if ($('#pre_service').val() == '') {
			endLoadingScreen();
		}
	}

	let pre_category =  $('#pre_category').val();
	let pre_service = $('#pre_service').val();
	if(pre_category !=='' && pre_service == '') {

			$('.suggested-categories .suggested-cat').each(function(){
				if($('h3[data-value = ' + pre_category + ' ]').attr('data-master-category')== $(this).data('master-cat')) {
                    $(this).addClass('preselected-master-category');
                }

			});
			$('h3[data-value = ' + pre_category + ' ]').addClass('preselectedCategory').click();
	}
	if (pre_service != '') {
		$.ajax({
			url: 'ajax/' + $('#ajax_page').val(),
			type: 'POST',
			async: false,
			dataType: 'json',
			data: {
				mode: 'get_service_data',
				compid: window.compid,
				service_id: pre_service,
				csrf_token: window.pb_code,
			},
			success: function(data) {
				let preselected_category =data.category_id;
				if((pre_category != '' &&  pre_category == preselected_category) || (pre_category == '')){ // if its selected only service and if its selected service from its category
					$('.categories').find('.category_' + preselected_category).addClass('preselectedCategory');
					$('#service_select').val('1');
					$('.step-three').find('.default-status').text(data.service_name);

					if(pre_category != '') {
							$('.suggested-categories .suggested-cat').each(function(){
								if($('h3[data-value = ' + pre_category + ' ]').attr('data-master-category')== $(this).data('master-cat')){
									$(this).addClass('preselected-master-category');
								}
							});
					}
					if( $('#location_id').val() > 0)
					{
						$('.preselectedCategory').click();

						if ($('#user').val() != '') {
							let staff_member = $('#user').val();
							setTimeout(function () {
								$('.users:input[value=' + staff_member + ']').click();
								endLoadingScreen();
							}, 500);
						}

					}
				}
                if(data.online_book == 0) {
                    window.invisible_service = data;
                    $(".step-three, #step_three").addClass("booking-step-disabled");
                    ConfirmServices(true);
                }
				endLoadingScreen();
			}
		});
	}

	var assistantAvatar;
	var selectedAssistantValue;
	var stepperAssistant = $('.step-four .updatedIconClass');
	$('.booking-step').on('mouseenter', function() {
		if (!$(this).hasClass('booking-step-disabled')) {
			if ($(this).find('.default-status').text().indexOf('Choose') === -1) {
				$(this).find('.default-status').hide();
				$(this).find('.hover-status').show();
			}
		}
	});

	$('.booking-step').on('mouseleave', function() {
		$(this).find('.default-status').show();
		$(this).find('.hover-status').hide();
	});

	if ($('#user').val() != '') {
		$('input[name=users][value=\'' + $('#user').val() + '\']').click();
		$('html, body').animate({
			//scrollTop: $(document).height() - 1000
		}, 1000);
	}

	$('#rebook').click(function() {

		$('input[name=users][value=\'' + $(this).attr('data-user') + '\']').click();
		$('#service').val($(this).attr('data-value'));
		$('#serviceids').val($(this).attr('data-value'));
		$('#service_name').val($(this).attr('data-name'));
		$('#duration').val($(this).attr('data-duration'));
		$('#price').val($(this).attr('data-price'));

		$('.service_add').each(function() {
			if ($(this).attr('id') == $('#service').val()) {
				$(this).attr('checked', 'checked');
			} else {
				$(this).removeAttr('checked');
			}
		});

		$('html, body').animate({
			//scrollTop: $(document).height() - 1000
		}, 1000);
	});
	var getSlots = $('#slots');
	var $button_open_close = $('#btnCalendar');
	var $input_open_close = $('#datepicker2').pickadate({
		 firstDay:  parseInt($('#datepicker2').data('weekStart')),
		clear: 'Cancel',
		onSet: function(e) {
			setTimeout(function() {
				if (!e.disable) {
					GetAvailableDates();
				}
			}, 500);
		},
	});
	picker_open_close = $input_open_close.pickadate('picker');
	$button_open_close.on('click', function(event) {
		if (picker_open_close.get('open')) {
			picker_open_close.close();
		} else {
			picker_open_close.open();
			setTimeout(function() {
				GetAvailableDates();
			}, 500);
		}

		event.stopPropagation();
	}).on('mousedown', function(event) {
		event.preventDefault();
	});

	var datepicker;
	var selectedDay;

	$('#datepicker2').change(function() {
	    let selected_date = $(this).val() + ' ' + new Date().getHours()  + ':' + new Date().getMinutes();
		var date = new Date(selected_date.replace(/-/g, '/'));

		day = date.getDate();
		month = date.getMonth() + 1;
		year = date.getFullYear();
		if (month < 10)
			month = '0' + month;
		if (day < 10)
			day = '0' + day;
		$('#date_select').val(year + '-' + month + '-' + day);
		$('#time_select').val('');
		ValidateForm();

		var formatedDate = date;
		var options = {
			weekday: 'short',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		};
		var formatted = translateDate(formatedDate);
		$(".selectedDate").find("span").html(formatted);

		if ($('#user').val() != '')
			GetTimes();

		selectedDay = options.day + ' ' + options.weekday;
	});

	$('.dateArrows').click(function() {
		var today = new Date($('#date_select').val());
		today.setHours(20);
		var date;

		if ($(this).hasClass('previous')) {

			today.setTime(today.getTime() - (1 * 24 * 60 * 60 * 1000));
		}
		if ($(this).hasClass('next')) {

			today.setTime(today.getTime() + (1 * 24 * 60 * 60 * 1000));

		}
		date = today;

		day = date.getDate();
		month = date.getMonth() + 1;
		year = date.getFullYear();
		if (month < 10)
			month = '0' + month;
		if (day < 10)
			day = '0' + day;
		$('#date_select').val(year + '-' + month + '-' + day);
		$('#time_select').val('');
		ValidateForm();

		var formatedDate = date;
		var options = {
			weekday: 'short',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		};
		var formatted = translateDate(formatedDate);
		$(".selectedDate").find("span").html(formatted);

		if ($('#user').val() != '' && $('#service').val() != '' && $('#service').val() != '0') {
			GetTimes();
		} else {
			alert('Select Service');
		}

		selectedDay = options.day + ' ' + options.weekday;

	});

	$('.days').click(function() {

		var date;
		if ($(this).attr('data-value') == 'more')
			date = new Date();
		else
			date = new Date($(this).attr('data-value'));

		day = date.getDate();
		month = date.getMonth() + 1;
		year = date.getFullYear();
		if (month < 10)
			month = '0' + month;
		if (day < 10)
			day = '0' + day;
		$('#date_select').val(year + '-' + month + '-' + day);
		$('#time_select').val('');
		ValidateForm();

		var formatedDate = date;
		var options = {
			weekday: 'short',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		};
		var formatted = translateDate(formatedDate);
		$(".selectedDate").find("span").html(formatted);

		if ($('#user').val() != '' && $('#service').val() != '' && $('#service').val() != '0') {
			GetTimes();
		} else {
			alert('Select Service');
		}

		selectedDay = options.day + ' ' + options.weekday;

	});

	$('input[name=users]').click(function() {
		$('#user').val($(this).val());

		// Go straight to next step when choosing assistant
		$('#booknow-step-2-next').click();
		$('#ui-id-5').removeClass('ui-state-disabled');
		$('#ui-id-5').click();

		if ($('#container').attr('data-date') != 0) {
			GetTimes();
		} else {
			setTimeout(function() {
				$('#btnCalendar').click();
			}, 1000);
		}

		$label = $(this).parent();
		if ($label.data().name != '' && typeof $label.data().name !== 'undefined') {
			$('.step-four .stepper-status .default-status').text(translate($label.data().name));
		}
		assistantAvatar = $label.find('.assistantImgWrap img').attr('src');
		selectedAssistantValue = $label.attr('data-uid');
		$(stepperAssistant).find('img').attr('src', assistantAvatar);
		$(stepperAssistant).css({ 'opacity': '1' });

		$(stepperAssistant).parent().find('.animated').toggleClass('flipInX');

		window.localStorage.setItem('selectedAssistantValue', selectedAssistantValue);
		window.localStorage.setItem('selectedAssistantImg', assistantAvatar);

		$uservalcheck = $('#user').val();
		$selected_user_tooltip = $('label[data-uid=' + $uservalcheck + ']').attr('data-name');
		$('.user_tooltip').attr('title', $selected_user_tooltip);
		$('.user_tooltip').tooltip();

		GetAvailableDates();
		selectFirstAvailableSlot();
	});

	$('#btnBack').click(function() {
		$('.content_services').css('display', 'none');
		$('.content_main').css('display', '');
	});

	$('#add_note').click(function() {
		$('#note').fadeIn();
	});

	$('#user-info-dialog').dialog({
		autoOpen: false,
		maxWidth: '600px',
		width: '100vw',
		modal: true,
		marginBottom: '100px',
	});
	$('#user-info-dialog').css('margin-bottom', '100px');
	$('#bookingform').css('display', 'block');

	// Append Badges on location
	$.ajax({
		url: 'ajax/api.php',
		type: 'POST',
		async: true,
		data: {
			mode: 'get_badges',
			compid: window.compid,
			csrf_token: window.pb_code,
		},
		success: function(data) {
			var badges = JSON.parse(data);
			$('#locations-list label').each(function(i, e) {
				var location_label = $(this).find('h4');
				let location_id = $(this).data('location_id');
				if (location_id != '' && typeof location_id !== 'undefined') {
					if (typeof badges[location_id] !== 'undefined') {
						$.each(badges[location_id], function() {
							let current_label = location_label.text();
							$('<img/>', {
								src: 'https://' + window.root_server + '/cdn/attachments/' + this.url,
								title: this.description
							}).css('height', '25px').css('width', '25px').appendTo(location_label);
						});
					}
				}
			});
		},
	});
});

$(document).ready(function() {


	var userInfoTimeouot;
	$('#users_div label').mouseenter(function() {
		$uid = $(this).data('uid');
		$('#user-info-dialog').dialog({
			'title': $(this).data('name'),
		});
		$img = $(this).children('.assistantImgWrap').children('img').clone();
		userInfoTimeouot = setTimeout(function() {
			$('#user-info-dialog').html('');
			$('#user-info-dialog').html($img);

			$.get('ajax/get_assistant_notes.php', {
				uid: $uid,
			}, function(out) {
				if (out != '') {
					$('#user-info-dialog').append(out);
					$('#user-info-dialog').dialog('open');
				}
			}, 'html');
		}, 2000);
	});
	$('#users_div label').mouseleave(function() {
		clearTimeout(userInfoTimeouot);
	});

	$('.other-loc-check').change(function() {
		//map.fitBounds(bounds);
		$('#location_id').val($(this).val());
		// Reset the service selector
		resetSelectedService();

	});
	var map_zoom = 0;
	if (company_meta.connect_map_zoom) {
		map_zoom = company_meta.connect_map_zoom;
	} else {
		map_zoom = 14;
	}

	$('[data-region]').each(function() {
		$(this).on('mouseenter', function() {
			var lat = $(this).find('input').data('lat');
			var long = $(this).find('input').data('lng');
			if (typeof lat != 'undefined' && lat != 0 && typeof long != 'undefined' && long != 0) {
				$('#location-map').empty();
				var url = 'https://maps.google.com/maps?q=' + lat + ',' + long + '&hl=en&z=' + map_zoom + '&output=embed';
				$('#location-map').append('<iframe src=\'' + encodeURI(url) + '\' />');
			}
			// if (lat != 0 && long != 0) {
			// 	window.map.setCenter({ lat: lat, lng: long });
			// 	window.map.setZoom(18);
			// }

		});
		// $(this).on('mouseleave', function() {
		// 	map.fitBounds(bounds);
		//  });
	});

	$('#step-location-next').click(function() {
		$('#ui-id-1').removeClass('ui-state-disabled').click();
		if ($('.accordion2').children('h3').length === 1) {
			$('.accordion2').children('h3').click();
		}
		return false;
	});

	var nextStep = $('#step-location-next');

	function showNextStep() {
		$('html, body').animate({
			//scrollTop: $(nextStep).offset().top
		}, 1500);
		$(nextStep).css({
			'opacity': '1',
			'z-index': '1',
		});
	}


	$('#locations-list input').change(function() {
		//$(stepperLocation).toggleClass('flipInX');
		if ($(this).data().name != '' && typeof $(this).data().name !== 'undefined') {
			$('.step-one>.stepper-status .default-status').text(translate($(this).data().name));
		}

		if ($(this).is(':checked')) {
			showNextStep();
			$('.location-notice').remove();
			if ($(this).val() != '') {
				if (typeof window.locations[$(this).val()].notice !== 'undefined' && window.locations[$(this).val()].notice != '' && window.locations[$(this).val()].notice != null) {
					var $notice_container = $('<div/>', {
						class: "location-notice",
						text: window.locations[$(this).val()].notice
					});
					$('.popup-message-container').append($notice_container);
				}
			}

			//	$(stepperLocation).css('background-color', '#2196f3');
		}
	});

	// Group by region filter

	var brancheLocations = $('#locations-list label');
	var filterOptions = $('#regionsContainer div');

	$(filterOptions).each(function() {
		$('#regionsContainer div').on('click', function() {
			$filterString = $(this).data('region');
			$(brancheLocations).hide();

			if ($filterString != 'all') {
				$('#locations-list label[data-region="' + $filterString + '"]').show();
			} else {
				$(brancheLocations).show();
			}
		});
	});

	var selectedBrancheValue;

	$(brancheLocations).on('click', function() {
        if($(".step-three").hasClass("booking-step-disabled")) {
            $('.step-four').click();
            return;
        }
		selectedBrancheValue = $(this).find('input').val();
		window.localStorage.setItem('selectedBrancheValue', selectedBrancheValue);
		$('#set_branch_location').val(selectedBrancheValue);
		forceOpenServices(selectedBrancheValue, 0);
	});

	var selLocation = $('#sel-location');
	var selService = $('#step-location-next');
	var selAssistant = $('#ui-id-3');
	var selDate = $('#ui-id-5');
	$('.step-one').on('click', function() {
        if($(this).hasClass('booking-step-disabled')) {
            return;
        }
		$(selLocation).click();
		clearTimeSlots();
	});

	$('.step-three').on('click', function() {
        if($(this).hasClass('booking-step-disabled')) {
            return;
        }
		$(selService).click();
		clearTimeSlots();
	});

	$('.step-four').on('click', function() {
        $('#ui-id-3').click();
        if(window.invisible_service) {
            ConfirmServices(true);
        } else {
            ConfirmServices();
        }
		clearTimeSlots();
		selectFirstAvailableSlot();
	});

	$('.step-five').on('click', function() {
		$(selDate).click();
	});

	// Filter by master category if available
	let masterServices = $('.categories .category');
	let masterServicesFilter = $('.suggested-categories .suggested-cat');

	$(masterServicesFilter).each(function() {
		$(masterServicesFilter).on('click', function() {
			$filterStr = $(this).data('master-cat');
			$('.categories .category[aria-selected=true]').click();
			$(masterServices).hide();
			$(masterServices).next().hide();
			$(masterServicesFilter).removeClass('preselected-master-category');
            $(this).addClass('preselected-master-category');
			if ($filterStr != 'All') {

				$('.categories .category[data-master-category="' + $filterStr + '"]').show();
			} else {
				$(masterServices).show();
			}
		});
	});

	$('#slots').on('click', '.slot', function() {
		var current_date = new Date();
		var advance_time = $('#advance_time').val();
		var date_select = $('#date_select').val();
		var time = $(this).html();
		var date_selected = new Date(Date.parse(date_select));
		var arr3 = time.split(':');
		var arr2 = time.split(':');
		date_selected.setHours(arr3[0]);
		date_selected.setMinutes(arr3[1]);

		arr2 = advance_time.split(':');
		date_selected.setHours(date_selected.getHours() - parseInt(arr2[0]));
		date_selected.setMinutes(date_selected.getMinutes() - parseInt(arr2[1]));

		diff = date_selected - current_date;

		$('.selected').removeClass('selected');
		$(this).addClass('selected');
		$('#time_select').val($(this).html());
		$('#userSelected').val($(this).attr('data-user'));
		$('#room_id').val($(this).attr('data-room_id'));
		selectedDateAndTime = $(this).attr('data-user');
		ValidateForm();

		AddMultipleServices(date_selected);

		selectedDay = $(this).parent().parent().parent().find('.selectedDate span').text();
		selectedDay = selectedDay.split(/[ ]+/);
		selectedWeekday = selectedDay[1].trim();
		selectedWeekDate = selectedDay[2].trim();
		selectedWeekDate = selectedWeekDate.substring(0, 3);
		selectedDayLabel = selectedWeekday + '<br>' + selectedWeekDate;

		$(stepperDate).parent().toggleClass('flipInY');
		$(stepperDate).prev().css('opacity', '0');
		$(stepperDate).empty();
		$(stepperDate).html(selectedDayLabel);

		window.localStorage.setItem('selectedDateAndTime', selectedDateAndTime);
		window.localStorage.setItem('selectedDayAndMonth', selectedDayLabel);

		$('#btnJustBook').click();
	});

	window.group_bookings_number = 0;
	$('#group_bookings_number').change(function() {
		var max = parseInt($(this).attr('max'));
		var min = parseInt($(this).attr('min'));
		if ($(this).val() > max) {
			$(this).val(max);
		} else if ($(this).val() < min) {
			$(this).val(min);
		}
		window.group_bookings_number = parseInt($(this).val());
		$('#group_bookings_data').val(window.group_bookings_number);
	});

	$('input[type=radio][name=group_choice]').change(function() {
		if (this.value == 'single_booking') {
			$('.group-bookings-quantity').hide();
			window.group_bookings_number = 0;
		} else if (this.value == 'group_booking') {
			$('.group-bookings-quantity').slideDown();
			window.group_bookings_number = $('#group_bookings_number').val();
			// Reset the services selected
			$('.row-service-select, .row-service-select input').prop("checked", false).removeClass('row-selected');
		}
		$('#group_bookings_data').val(window.group_bookings_number);
	});

});

function isIframe () {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

function startLoadingScreen() {
	$('#container').css('height', '400px');
	$('#loading_preselected').show();
}

function endLoadingScreen() {
	$('#container').css('height', '');
	setTimeout(function() {
		$('#loading_preselected').hide();
	}, 800);
}

function PayBooking() {
	//$("#btnAddAnother").click();
	//$("#bookingform").attr("action","bookings_paypalpayment.php");
	//$("#bookingform").attr("action","booking_confirm.php");
	$('#payment_paypal').val('1');
	$('#user_price_total').val($('#user_price_total_' + $('#userSelected').val()).val());
	$('#user_duration_total').val($('#user_duration_total_' + $('#userSelected').val()).val());
	$('#bookingform').submit();
}

function BookNow() {
	//$("#btnAddAnother").click();
	$('#user_price_total').val($('#user_price_total_' + $('#userSelected').val()).val());
	$('#user_duration_total').val($('#user_duration_total_' + $('#userSelected').val()).val());
	$('#btnSubmit').click();
}

function BookNowAnother() {
	$('#book_another').val('1');
	$('#btnSubmit').click();
}

function selectServiceType(type) {

    var urlPreselectedParams = new URLSearchParams(window.location.search);
    let preselected = urlPreselectedParams.get('staff') || urlPreselectedParams.get('service');

    urlPreselectedParams.delete('location_id');
    urlPreselectedParams.delete('compid');
    if (urlPreselectedParams.toString().length > 0)
        urlPreselectedParams = '&' + urlPreselectedParams.toString();
    var selectedBrancheValue = $('#set_branch_location').val();
    let hideType = 'EXISTING';
    if (type == 1) {
        hideType = 'NEW';
    }
    if(!preselected) {
        forceOpenServices(selectedBrancheValue, type, urlPreselectedParams);
    } else if(preselected && type == 1) {
        $('#online_booking_type').val('EXISTING');
        var force_new_existing_patient = $('#force_new_existing_patient').val();
        var company = window.compid;
        if (force_new_existing_patient == 1) {
            $('#online_booking_type').val('');
            window.location.href = 'index.php?compid=' + company + '&existing=1&branch=' + selectedBrancheValue+urlPreselectedParams;
            return false;
        }
    }

    $(`.${hideType}`).hide();
    $('#force_client_Modal').find('.close-reveal-modal').click();
}

function ValidateForm() {
	if ($('#serviceids').val() != '' && $('#userSelected').val() != '' && $('#date_select').val() != '' && $('#time_select').val() != '') {
		$('#btnSubmit').removeAttr('disabled');
		$('#btnJustBook').removeAttr('disabled');
		$('#btnSubmitPay').removeAttr('disabled');
		$('#btnAddAnother').removeAttr('disabled');
	} else {
		$('#btnSubmit').attr('disabled', 'disabled');
		$('#btnJustBook').attr('disabled', 'disabled');
		$('#btnSubmitPay').attr('disabled', 'disabled');
		$('#btnAddAnother').attr('disabled', 'disabled');
	}
}

function selectService(event) {
	//Required because it triggered the function if you click everywhare.
	if ($(event.target).is('.serv-rating, .expand-modal-reviews, .modal-overlay, .modal-reviews, .fa-info-circle, .fa-window-restore') || $(event.target).parents().hasClass('modal-reviews')) {
		return false;
	}
	if(window.group_bookings_number > 0) {
		$('.row-service-select, .row-service-select input').prop("checked", false).removeClass('row-selected');
	}
	let input = $(this).find("input");
	let checkboxButton = $(this).find("#serviceSelectBtn");
	$(input).prop("checked", !$(input).prop("checked"));
	$(this).toggleClass("row-selected");
	if (window.one_touch_book == 1) {
		$('.step-three .animated').toggleClass('jello');
		$(checkboxButton).toggleClass('pure-button-secondary');
		$(checkboxButton).toggleClass('pure-button-primary');
		$(checkboxButton).toggleClass('selectedService');

		ConfirmServices();

		$service_tooltip = '';
		if ($('#service_name').val() != '') {
			$service_tooltip = $('#service_name').val();
		}
	}
}

function resetSelectedService() {
	$('.selectedService').click();
	$('.category.ui-state-active').click();
}

function ConfirmServices(invisible = false) {

	var serviceids = '';
	var service_price_total_default = 0;
	var service_names = [];
	var auto_select_anyone = 0;
	if (typeof window.company_meta.connect_auto_anyone !== 'undefined' && window.company_meta.connect_auto_anyone != '' && window.company_meta.connect_auto_anyone == 1) {
		auto_select_anyone = window.company_meta.connect_auto_anyone;
	}
	window.total_services_duration = 0;

    if(!invisible) {
        $('.service_add').each(function() {

            if ($(this).is(':checked')) {
                $('#service').val($(this).attr('data-value'));
                $('#service_name').val($(this).attr('data-name'));
                $('#duration').val($(this).attr('data-duration'));
                $('#price').val($(this).attr('data-price'));
                service_price_total_default = 0 + parseFloat(service_price_total_default) + parseFloat($(this).attr('data-price'));
                serviceids += $(this).attr('data-value') + ',';
                service_names.push($(this).data().name);
                window.total_services_duration += $(this).data('minutes_duration');
            }
        });
    } else {
        if(window.invisible_service) {
            $('#service_name').val(window.invisible_service.service_name);
            $('#duration').val(window.invisible_service.duration);
            $('#price').val(window.invisible_service.price);
            service_price_total_default = 0 + parseFloat(service_price_total_default) + parseFloat(window.invisible_service.price);
            serviceids +=  $('#service').val() + ',';
            service_names.push(window.invisible_service.service_name);
            window.total_services_duration += window.invisible_service.minutes_duration;
        }
    }

	var print_total_duration = window.total_services_duration;
	var group_flag = '';
	if (window.group_bookings_number > 0) {
		print_total_duration = print_total_duration * window.group_bookings_number;
		group_flag = ' (' + window.group_bookings_number + ' persons)';
	}
	print_total_duration = timeConvert(print_total_duration);
	var totalDurationTrans = translate('Total Duration');
	var total_duration_info = totalDurationTrans + ': ' + print_total_duration + group_flag;
	$('#total_duration_box').text(total_duration_info);
	if (service_names.length > 0) {
		$('.step-three .stepper-status .default-status').text(service_names);
	}
	if (serviceids == '') {
		$('#serviceids').val('');
		return false;
	} else {
		$('#service_price_total_default').val(service_price_total_default.toFixed(2));
		$('#serviceids').val(serviceids.substring(0, serviceids.length - 1));
		ShowHideUsers();
		if ($('#lock_services').val() != '1')
			$('#ui-id-1').removeClass('ui-state-disabled');

		$('#ui-id-3').removeClass('ui-state-disabled');
		$('#ui-id-3').click();

		if ($('#lock_staff').val() == '1' || auto_select_anyone == 1) {
			$('.users[value=Any]').click();
			$('#ui-id-3').addClass('ui-state-disabled');
		}
        if(!invisible) {
            SortServiceIds();
        }
	}
	return true;

}

function SortServiceIds() {
	var arr;
	var serviceids = $('#serviceids').val();
	if (serviceids == '') {
		arr = [];
	} else {
		arr = serviceids.split(',');
	}

	var index = 0;
	var color_service_array = [];
	var not_color_service_array = [];
	for (var i in arr) {
		var service_id = $('#' + arr[i]).attr('data-value');
		var service_name = $('#' + arr[i]).attr('data-name');
		var service_duration = $('#' + arr[i]).attr('data-duration');
		var service_price = $('#' + arr[i]).attr('data-price');
		var category_name = $('#' + arr[i]).attr('data-category_name');
		var other_duration = $('#' + arr[i]).attr('data-other_duration');

		if (category_name.toLowerCase().indexOf('color') > -1 || category_name.toLowerCase().indexOf('colour') > -1 || category_name.toLowerCase().indexOf('technical') > -1 || category_name.toLowerCase().indexOf('treatment') > -1 || service_name.toLowerCase().indexOf('color') > -1 || service_name.toLowerCase().indexOf('colour') > -1) {
			color_service_array.push(arr[i]);
		} else {
			not_color_service_array.push(arr[i]);
		}

		index++;
	}
	var str = '';
	for (var i in color_service_array) {
		str += color_service_array[i] + ',';
	}
	for (var i in not_color_service_array) {
		str += not_color_service_array[i] + ',';
	}
	str = str.substring(0, str.length - 1);

	$('#serviceids').val(str);
}

function ShowHideUsers() {
	$('#users_div').hide();
	$('#notify-nostaff').hide();
	$('#staff-preloader').show();
	$('#users_div label[data-name=Anyone]').hide();
	$('#spec-text').hide();
	$('#users_div label').each(function() {
		if ($(this).attr('data-name') != 'Anyone') {
			$(this).hide();
		}
	});

	$.ajax({
		url: 'ajax/' + $('#ajax_page').val(),
		type: 'POST',
		dataType: 'json',
		data: {
			mode: 'users_total_price',
			service_ids: $('#serviceids').val(),
			compid: window.compid,
			csrf_token: window.pb_code,
		},
		success: function(data) {
			$.ajax({
				url: 'ajax/' + $('#ajax_page').val(),
				type: 'POST',
				dataType: 'json',
				data: {
					mode: 'get_disabled_users',
					service_ids: $('#serviceids').val(),
					compid: window.compid,
					location_id: $('#location_id').val(),
					csrf_token: window.pb_code,
				},
				success: function(disabledusers) {
					/*
					for(var i in data2) {
						if(data2[i].disabledusers != null) {
							var arr=data2[i].disabledusers.split(",");
							for(var j in arr) {
								disabledusers.push(arr[j]);
							}
						}
					}
					*/
					var serviceIds = $('#serviceids').val().split(',');
					data.forEach(function(user) {
						var duration = parseInt(user.duration);
						var hrs = Math.floor(user.duration / 60);
						var mins = user.duration % 60;

						$('#user_price_total_' + user.user_id).val(user.price);
						$('#user_duration_total_' + user.user_id).val(user.duration);
						$('#html_user_price_total_' + user.user_id).html(window.comCurrency + user.price);
						$('#html_user_duration_total_' + user.user_id).html(hrs + ':' + mins);
						if ($.inArray(parseInt(user.user_id), disabledusers) > -1) {
							$('#services_user_' + user.user_id).next().hide();
						} else {
							$('#services_user_' + user.user_id).next().show();
						}
					});

					var uniq = [];

					$.each($('#users_div').children('label'), function(index, el) {
						if ($(this).css('display') === 'block' && $(this).attr('data-name') != 'Anyone') {
							uniq[uniq.length] = $(this);
						}
					});

					if (uniq.length === 1) {
						$(uniq[0]).find('input[name=users]').click();
						$('html, body').animate({
							//scrollTop: $(document).height() - 1000
						}, 1000);
					} else if (uniq.length === 0) {
						$('#users_div label[data-name=Anyone]').hide();
						$('#spec-text').hide();
						$('#notify-nostaff').show();
					} else {
						$('#users_div label[data-name=Anyone]').show();
						$('#spec-text').show();
					}
					$assistant = $('#container').data('assistant');
					if (parseInt($assistant) > 0) {
						$('.users[value=' + $assistant + ']').trigger('click');
					}


					$('#staff-preloader').fadeOut(function() {
						$('#users_div').fadeIn();
					});
				},
			});
		},
	});

}

function AddJsonValues(service_id, service_name, service_price, user_id, user_name, date_select, time_select, note_text, service_duration, category_name, other_duration, room_id, location_id) {
	if (typeof service_id === 'undefined' || service_id == '') {
		alert('Please select a service');
		return;
	}
	var myarray = [];
	var json = null;
	if ($('#json_values').val() != '')
		json = jQuery.parseJSON($('#json_values').val());
	var id = 0;
	var count = 0;
	if (json != null) {
		for (var i in json) {
			myarray.push(json[i]);

		}
		count = myarray.length;
		id = myarray[count - 1].id + 1;
	}

	if (other_duration == '') {
		//other_duration=service_duration;
		other_duration = 0;
	}

	if (time_select == 'after') {
		var minutes_duration;
		var before_service_duration = myarray[count - 1].service_duration;
		if (before_service_duration.indexOf(':') > (-1)) {
			var time = before_service_duration.split(':');
			minutes_duration = parseInt(time[0]) * 60 + parseInt(time[1]) + parseInt(myarray[count - 1].other_duration);

		} else {
			minutes_duration = parseInt(before_service_duration) * 60 + parseInt(myarray[count - 1].other_duration);

		}

		var before_time = myarray[count - 1].time_select;
		if (before_time.indexOf(':') > (-1)) {
			var time = before_time.split(':');
			var minutes = parseInt(time[0]) * 60 + parseInt(time[1]);
			minutes = minutes + minutes_duration;
			var hours = Math.floor(minutes / 60);
			if (hours < 10)
				hours = '0' + hours;
			var minutes = minutes % 60;
			if (minutes < 10)
				minutes = '0' + minutes;

			time_select = hours + ':' + minutes;
		} else {
			var minutes = parseInt(before_time) * 60;
			minutes = minutes + minutes_duration;
			var hours = Math.floor(minutes / 60);
			if (hours < 10)
				hours = '0' + hours;
			var minutes = minutes % 60;
			if (minutes < 10)
				minutes = '0' + minutes;

			time_select = hours + ':' + minutes;
		}

		date_select = myarray[count - 1].date_select;

	}
	service_name = replaceAll(service_name, '\'', '');
	category_name = replaceAll(category_name, '\'', '');

	var myJSON = '';

	var booking = {
		'id': id,
		'service_id': service_id,
		'service_name': service_name,
		'service_price': service_price,
		'user_id': user_id,
		'user_name': user_name,
		'date_select': date_select,
		'time_select': time_select,
		'note': note_text,
		'service_duration': service_duration,
		'other_duration': other_duration,
		'category_name': category_name,
		'room_id': room_id,
		'location_id': location_id,
	};

	myarray.push(booking);

	myJSON = JSON.stringify(myarray);
	$('#json_values').val(myJSON);

	return id;

}

function replaceAll(str, find, replace) {
	return str.replace(new RegExp(find, 'g'), replace);
}

function RemoveBooking(link) {
	var id = $(link).parent().attr('id').replace('booking_', '');

	var myarray = [];
	var json = null;
	if ($('#json_values').val() != '')
		json = jQuery.parseJSON($('#json_values').val());
	if (json != null) {
		for (var i in json) {
			if (json[i].id != id)
				myarray.push(json[i]);
		}
	}

	myJSON = JSON.stringify(myarray);
	$('#json_values').val(myJSON);

	if ($(link).parent().parent().find('p').length == 2) {
		$(link).parent().parent().css('display', 'none');
		$('#book_after').css('display', 'none');
	}

	$(link).parent().remove();
}

// Most of this is copied from @grr verbatim:
(function($) {
	var xhrPool = [];
	$(document).ajaxSend(function(e, jqXHR, options) {
		xhrPool.push(jqXHR);
	});
	$(document).ajaxComplete(function(e, jqXHR, options) {
		xhrPool = $.grep(xhrPool, function(x) {
			return x != jqXHR;
		});
	});
	// I changed the name of the abort function here:
	window.abortAllMyAjaxRequests = function() {
		$.each(xhrPool, function(idx, jqXHR) {
			jqXHR.abort();
		});
	};
})(jQuery);

function CheckTimes(count, totalCount) {
	if (count == totalCount) {
		if ($('#slots').find('.no-times').length > 0) {
			$('#slots').html('<div class=\'no-times\'><p>- No appointments remaining on this day; please select an alternative date. - </p></div>');
		}
		$('#loader').hide();
	}
}

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function GetTimes() {

	window.abortAllMyAjaxRequests();

	$('#slots').html('<div class=\'no-times\'><p>Loading... </p></div>');

	$('#loader').show();
	$('#json_values').val('');
	var method = 'single';
	var users = '';
	if ($('#user').val() == 'Any') {
		$('input[name=users]').each(function() {
			if ($(this).val() != 'Any' && ($(this).parent().css('display') != 'none' || $('#lock_staff').val() == '1'))
				users += $(this).val() + ',';
		});
	} else {
		users = $('#user').val();
	}

	if (users.indexOf(',') != -1) {
		method = 'multiple';
		users = users.substr(0, users.length - 1);
	}

	var arr = [];
	arr = users.split(',');
	//$("#slots").html("");
	var counter = 0;
	var existTimes = false;
	var ajaxRequestCount = 0;
	$.ajax({
		url: 'ajax/' + $('#ajax_page').val(),
		type: 'POST',
		dataType: 'json',
		data: {
			mode: 'get_available_dates',
			submode: 'times',
			date: $('#date_select').val(),
			selectedUsers: arr,
			serviceids: $('#serviceids').val(),
			compid: window.compid,
			location_id: $('#location_id').val(),
			group_bookings_number: window.group_bookings_number,
			csrf_token: window.pb_code,
		},
		success: function(data) {
			$('#slots').find('.no-times').remove();
			arr = Object.keys(data.timeslots);
			if(parseInt(data.settings.connect_auto_anyone_random) && $('#user').val() == 'Any') {
                arr.sort(() => Math.random() - 0.5);
            }
			arr.forEach((i, index) => {
				var user_name = $('#users_div').find('label[data-uid=' + i + ']').attr('data-name');
				if (user_name != null) {
					let user_el = $('<p/>').addClass("user").text(user_name);
					$('#slots').append(user_el);
				}

				var hadMorning = false;
				var hadAfternoon = false;
				var hadEvening = false;

				for (var j in data.timeslots[i]) {
					if (data.timeslots[i][j] < '12:00' && data.timeslots[i][j] >= '00:00' && !hadMorning) {
						$('#slots').append('<div><p>' + translate('Morning') + '</p></div>');
						hadMorning = true;
					}

					if (data.timeslots[i][j] >= '12:00' && data.timeslots[i][j] < '17:00' && !hadAfternoon) {
						$('#slots').append('<div><p>' + translate('Afternoon') + '</p></div>');
						hadAfternoon = true;
					}

					if (data.timeslots[i][j] >= '17:00' && data.timeslots[i][j] <= '23:59' && !hadEvening) {
						$('#slots').append('<div><p>' + translate('Evening') + '</p></div>');
						hadEvening = true;
					}
                    var timeslots_company_format =  data.timeslots[i][j];
                    if(window.company_meta.time_format == '12' && typeof window.company_meta.time_format !== "undefined"){
                        timeslots_company_format =  moment($('#date_select').val()+' '+data.timeslots[i][j],'YYYY-MM-DD HH:mm').format('hh:mm A');
                    }

					$('#slots').append('<span  data-user="' + i + '" class="slot slot_' + j + '">' +timeslots_company_format + '</span>');

				}
			});

			$('#loader').hide();
			if ($('#slots').find('.no-times').length > 0) {
				$('#slots').html('<div class=\'no-times\'><p>- ' + translate('No appointments remaining on this day; please select an alternative date.') + ' - </p></div>');
			}

			$('#ava_rooms').find('.rooms').html(data.ava_rooms);
		},
	});


}

function GetAvailableDates() {
	$('#loading_ava_times').show();
	//var day=picker_open_close.get('date', 'dd');
	//var month=picker_open_close.get('month', 'mm');
	//var year=picker_open_close.get('month', 'yyyyy');
	var date = new Date(picker_open_close.get('view', 'yyyy-mm-dd'));
	//new Date(parseInt($("#datepicker2_table").find("div").attr("data-pick")));
	//var date=new Date(picker_open_close.get('month', 'mm'));//new Date(parseInt($("#datepicker2_table").find("div").attr("data-pick")));
	//var date =new Date(year+"-"+month+"-"+day);
	var selectedYear = date.getFullYear();
	var selectedMonth = date.getMonth() + 1;
	if (selectedMonth < 10)
		selectedMonth = '0' + selectedMonth;
	selectedMonth = selectedMonth + '/' + selectedYear;
	var selectedUsers = [];
	var auto_select_anyone = 0;
	if (typeof window.company_meta.connect_auto_anyone !== 'undefined' && window.company_meta.connect_auto_anyone != '' && window.company_meta.connect_auto_anyone == 1) {
		auto_select_anyone = window.company_meta.connect_auto_anyone;
	}
	if ($('#user').val() == 'Any') {
		$('input[name=users]').each(function() {
			if ($(this).val() != 'Any' && (($(this).parent().css('display') != 'none' || $('#lock_staff').val() == '1') || auto_select_anyone == 1)) {
				selectedUsers.push($(this).val());
			}
		});

	} else {
		selectedUsers.push($('#user').val());
	}
	var method = '';
	if (selectedUsers.length > 1)
		method = 'multiple';
	else
		method = 'single';

	var serviceids = $('#serviceids').val();
	var company = window.compid;

	var itemsCalendar = [];

	$('#datepicker2_table').find('tbody').find('td').each(function() {
		$(this).removeAttr('style');
		$(this).find('div').eq(0).removeClass('picker__day--disabled');
		$(this).find('div').eq(0).removeAttr('aria-disabled');
		$(this).find('div').eq(0).find('.circleHolder').remove();
		$(this).find('div').eq(0).append('<div class=\'circleHolder\'></div>');
		var date = new Date(parseInt($(this).find('div').attr('data-pick')));
		//var date=new Date(picker_open_close.get('view', 'yyyy-mm-dd'));

		var day = date.getDate();
		var month = date.getMonth() + 1;
		var year = date.getFullYear();
		if (month < 10)
			month = '0' + month;
		if (day < 10)
			day = '0' + day;

		var item = {
			unix: parseInt($(this).find('div').attr('data-pick')),
			date: year + '-' + month + '-' + day,
		};

		//dates.push(year+"-"+month+"-"+day);
		itemsCalendar.push(item);
	});

	$.ajax({
		url: 'ajax/' + $('#ajax_page').val(),
		type: 'POST',
		dataType: 'json',
        async: false,
		data: {
			mode: 'get_available_dates',
			submode: 'dates',
			selectedMonth: selectedMonth,
			selectedUsers: selectedUsers,
			serviceids: serviceids,
			compid: company,
			location_id: $('#location_id').val(),
			group_bookings_number: window.group_bookings_number,
			csrf_token: window.pb_code,
		},
		success: function(data) {
			currentData = data;
			var available_dates = [];
			var available_dates_morning = [];
			var available_dates_afternoon = [];
			var available_dates_evening = [];
			var count_slots_dates = [];

			var ref_times = data.prefered_bookings;
			for (var user_id in ref_times) {

				for (var date in ref_times[user_id]) {
					for (var time in ref_times[user_id][date]) {

						if (!ref_times[user_id][date][time].resource_available) {
							continue;
						}

						if (ref_times[user_id][date][time].time <= '12:00') {
							if ($.inArray(date, available_dates_morning) == -1) {
								available_dates_morning.push(date);
							}
						}
						if (ref_times[user_id][date][time].time > '12:00' && ref_times[user_id][date][time].time <= '17:00') {
							if ($.inArray(date, available_dates_afternoon) == -1) {
								available_dates_afternoon.push(date);
							}
						}
						if (ref_times[user_id][date][time].time > '17:00') {
							if ($.inArray(date, available_dates_evening) == -1) {
								available_dates_evening.push(date);
							}
						}
					}
					if ($.inArray(date, available_dates) == -1) {
						available_dates.push(date);
					}

					if (parseInt(count_slots_dates[date]) > 0)
						count_slots_dates[date] = count_slots_dates[date] + ref_times[user_id][date].length;
					else
						count_slots_dates[date] = 0 + ref_times[user_id][date].length;

				}
			}

			var disabled_dates = [];

			$(itemsCalendar).each(function(i) {
				if ($.inArray(itemsCalendar[i].date, available_dates_morning) != -1) {
					$('#datepicker2_table').find('tbody').find('td').find('div[data-pick=' + itemsCalendar[i].unix + ']').find('.circleHolder').append('<div title=\'' + translate('Morning times available') + '\' class=\'circle morning\'></div>');
				}
				if ($.inArray(itemsCalendar[i].date, available_dates_afternoon) != -1) {
					$('#datepicker2_table').find('tbody').find('td').find('div[data-pick=' + itemsCalendar[i].unix + ']').find('.circleHolder').append('<div title=\'' + translate('Afternoon times available') + '\' class=\'circle afternoon\'></div>');
				}
				if ($.inArray(itemsCalendar[i].date, available_dates_evening) != -1) {
					$('#datepicker2_table').find('tbody').find('td').find('div[data-pick=' + itemsCalendar[i].unix + ']').find('.circleHolder').append('<div title=\'' + translate('Evening times available') + '\' class=\'circle evening\'></div>');
				}

				if ($.inArray(itemsCalendar[i].date, available_dates) == -1) {
					var dateStr = itemsCalendar[i].date.split('-');
					var date = new Date(dateStr[0], dateStr[1], dateStr[2]); //Date.parse(itemsCalendar[i].date)

					$('#datepicker2_table').find('tbody').find('td').find('div[data-pick=' + itemsCalendar[i].unix + ']').parent().attr('style', 'background: #f5f5f5;');
					$('#datepicker2_table').find('tbody').find('td').find('div[data-pick=' + itemsCalendar[i].unix + ']').addClass('picker__day--disabled');
					$('#datepicker2_table').find('tbody').find('td').find('div[data-pick=' + itemsCalendar[i].unix + ']').attr('aria-disabled', 'true');
					//aria-disabled
				} else {
					$('#datepicker2_table').find('tbody').find('td').find('div[data-pick=' + itemsCalendar[i].unix + ']').addClass('picker__day--enabled');
				}
			});

			if ($(window).width() < '767') {
				$('.picker__day--enabled').on('click', function() {
					if (!$(this).hasClass('picker__day--highlighted')) {
						//$('html, body').animate({scrollTop:$('#slots').offset().top-75}, 200)
					}
				});
			}

			//picker_open_close.set('disable', disabled_dates);
			if ($('.picker__footer .picker-legend').length == 0) {
				$tims = '<div class=\'picker-legend\'><div title=\'' + translate('Morning times available') + '\' class=\'circle morning\'></div> ' + translate('Morning times available');
				$tims += '<div title=\'' + translate('Afternoon times available') + '\' class=\'circle afternoon\'></div> ' + translate('Afternoon times available');
				$tims += '<div title=\'' + translate('Evening times available') + '\' class=\'circle evening\'></div> ' + translate('Evening times available') + '</div> ';
				$('.picker__footer').append($tims);
			}
		},
	}).done(function() {
		$('#loading_ava_times').hide();
	});

	return false;
}

function AddMultipleServices(date_selected) {
	var serviceids = $('#serviceids').val();
	var arr = serviceids.split(',');

	//var service_id=$("#service").val();
	//var service_name=$("#service_name").val();
	var user_id = $('#userSelected').val();
	var user_name = $('#span_' + user_id).html();
	var date_select = $('#date_select').val();
	var room_id = $('#room_id').val();
	//var time_select="after";
	//var service_price=$("#price").val();
	//var service_duration=$("#duration").val();
	var note_text = $('#note_text').val();

	var location_id = 0;
	if ($('#sel-location').length > 0) {
		location_id = $('.other-loc-check:checked').val();
	}
	$('#json_values').val('');
	var index = 0;
	for (var i in arr) {
        if(window.invisible_service && (window.invisible_service.id == arr[i])) {
            var service_id = window.invisible_service.id;
            var service_name = window.invisible_service.service_name;
            var service_duration = window.invisible_service.duration;
            var service_price = window.invisible_service.price;
            var category_name = window.invisible_service.category_name;
            var other_duration = window.invisible_service.other_duration;
        } else {
            var service_id = $('#' + arr[i]).attr('data-value');
            var service_name = $('#' + arr[i]).attr('data-name');
            var service_duration = $('#' + arr[i]).attr('data-duration');
            var service_price = $('#' + arr[i]).attr('data-price');
            var category_name = $('#' + arr[i]).attr('data-category_name');
            var other_duration = $('#' + arr[i]).attr('data-other_duration');
        }


		var time_select = '';
		if (index == 0) {
			time_select = $('#time_select').val();
		} else {
			time_select = 'after';
		}

		var id = AddJsonValues(service_id, service_name, service_price, user_id, user_name, date_select, time_select, note_text, service_duration, category_name, other_duration, room_id, location_id);
		index++;
	}

	SortServices();

	$('#ui-id-7').removeClass('ui-state-disabled');
	$('#ui-id-7').click();
	if ($('#booknow-step4').length > 0) {
		$('#booknow-step3').hide();
		$('#booknow-step4').show();
	}
}

function SortServices() {
	if ($('#json_values').val() != '')
		json = jQuery.parseJSON($('#json_values').val());
	var id = 0;
	var count = 0;
	//var color_category_array=[];
	var color_service_array = [];
	var not_color_service_array = [];
	var myarray = [];
	var time_select = '';
	var index = 0;
	if (json != null) {

		for (var i in json) {
			if (
				json[i].category_name.toLowerCase().indexOf('color') > -1 || json[i].category_name.toLowerCase().indexOf('colour') > -1 || json[i].category_name.toLowerCase().indexOf('technical') > -1 || json[i].category_name.toLowerCase().indexOf('treatment') > -1 || json[i].service_name.toLowerCase().indexOf('color') > -1 || json[i].service_name.toLowerCase().indexOf('colour') > -1) {
				color_service_array.push(json[i]);
			} else {
				not_color_service_array.push(json[i]);
			}

			if (index == 0) {
				time_select = json[i].time_select;
			}

			index++;
		}

		id = 0;
		for (var i in color_service_array) {
			color_service_array[i].id = id;
			myarray.push(color_service_array[i]);
			id++;
		}

		for (var i in not_color_service_array) {
			not_color_service_array[i].id = id;
			myarray.push(not_color_service_array[i]);
			id++;
		}

	}

	$('#json_values').val('');
	var index = 0;
	for (var i in myarray) {

		var user_id = myarray[i].user_id; //$("#"+arr[i]).attr("data-value");
		var room_id = myarray[i].room_id; //$("#"+arr[i]).attr("data-value");
		var user_name = myarray[i].user_name; //$("#"+arr[i]).attr("data-value");
		var date_select = myarray[i].date_select; //$("#"+arr[i]).attr("data-value");
		var service_id = myarray[i].service_id; //$("#"+arr[i]).attr("data-value");
		var service_name = myarray[i].service_name; //$("#"+arr[i]).attr("data-name");
		var service_duration = myarray[i].service_duration; //$("#"+arr[i]).attr("data-duration");
		var service_price = myarray[i].service_price; //$("#"+arr[i]).attr("data-price");
		var category_name = myarray[i].category_name; //$("#"+arr[i]).attr("data-category_name");
		var other_duration = myarray[i].other_duration; //$("#"+arr[i]).attr("data-category_name");

		var note_text = myarray[i].note;
		var location_id = myarray[i].location_id;

		if (index == 0) {
		} else {
			time_select = 'after';
		}

		var id = AddJsonValues(service_id, service_name, service_price, user_id, user_name, date_select, time_select, note_text, service_duration, category_name, other_duration, room_id, location_id);
		index++;
	}
}

function forceOpenServices(selectedBrancheValue, type,preselected_params) {

	if (selectedBrancheValue == '' || selectedBrancheValue == 0) {
		$('.accordion2 .category').show();
		$('#step-location-next').click();
		$('html, body').stop();
		$('html, body').animate({ scrollTop: 0 }, 'slow');
		if (type == 1) {
			$('#online_booking_type').val('EXISTING');
			var force_new_existing_patient = $('#force_new_existing_patient').val();
			var company = window.compid;
			if (force_new_existing_patient == 1) {
				$('#online_booking_type').val('');

				window.location.href = 'index.php?compid=' + company + '&existing=1&branch=' + selectedBrancheValue+preselected_params;
				return false;
			}
		} else if (type == 2) {
			$('#online_booking_type').val('NEW');
		}
	} else {
		$.post('ajax/get_categories_in_location.php', {
			location_id: selectedBrancheValue,
			compid: window.compid,
			type: type,
			csrf_token: window.pb_code,
		}, function(out) {
			$('.accordion2 .category').each(function() {
				$val = parseInt($(this).attr('data-value'));
				if ($.inArray($val, out) > -1) {
					$(this).show();
				} else {
					$(this).hide();
				}
			});
			$('#step-location-next').click();
			$('html, body').stop();
			//$("html, body").animate({ scrollTop: 0 }, "slow");
			if (type == 1) {
				$('#online_booking_type').val('EXISTING');
				var force_new_existing_patient = $('#force_new_existing_patient').val();
				var company = window.compid;
				if (force_new_existing_patient == 1) {
					$('#online_booking_type').val('');
					window.location.href = 'index.php?compid=' + company + '&existing=1&branch=' + selectedBrancheValue+preselected_params;
					return false;
				}
			} else if (type == 2) {
				$('#online_booking_type').val('NEW');
			}
		}, 'json');
	}
}

function clearTimeSlots() {
	$('#slots').html('');
}

function selectFirstAvailableSlot() {
	setTimeout(function() {
		$('.picker__day--enabled:first').trigger('click');
	}, 500);
}

function changeMapLocation($lat, $lng) {
	if ($('.other-loc-check:checked').val() === '0') {
		$(window.list).each(function(i, e) {
			window.marker[i].setMap(window.map);
			window.marker[i].setAnimation(google.maps.Animation.BOUNCE);
			window.map.setZoom(5);
			window.map.setCenter({ lat: e[1], lng: e[2] });
			window.map.fitBounds(window.bounds);
		});
	} else {
		// only one map marker.
		$sel = $('.other-loc-check:checked');
		$lid = $sel.val();
		$lat = parseFloat($sel.attr('data-lat'));
		$lng = parseFloat($sel.attr('data-lng'));

		$(window.list).each(function(i, e) {
			if (e[3] === $lid) {
				window.marker[i].setMap(window.map);
				window.marker[i].setAnimation(google.maps.Animation.DROP);
				window.map.setZoom(16);
				window.map.setCenter({ lat: e[1], lng: e[2] });
			} else {
				window.marker[i].setMap(null);
			}
		});
	}
}

function timeConvert(n) {
	var num = n;
	var hours = (num / 60);
	var rhours = Math.floor(hours);
	var minutes = (hours - rhours) * 60;
	var rminutes = Math.round(minutes);
	var print_hours = '';
	var print_minutes = '';
	if (rhours > 0) {
		var singular_hour = 'hour';
		if (rhours > 1) {
			singular_hour = 'hours';
		}
		print_hours = rhours + ' ' + singular_hour;
	}
	if (rminutes > 0) {
		var singular_minute = 'minute';
		if (rminutes > 1) {
			singular_minute = 'minutes';
		}
		print_minutes = rminutes + ' ' + singular_minute;
	}
	return print_hours + ' ' + print_minutes;
}

function translateDate(date){
   return [
	 weekday[date.getDay()] + ',',
	 date.getDate(),
	 months[date.getMonth()],
	 date.getFullYear()
   ].join(' ');
}

function showReviews(elem) {
    $(".service-details .hidden-feedbacks").show();
    $(elem).hide();
}
function modalReview() {
	$(this).siblings('.modal-reviews').fadeToggle('fast', 'linear');
	$(this).siblings('.modal-overlay').fadeToggle('fast', 'linear');
}

function closeModal() {
  $(this).parents('.modal-reviews').fadeToggle('fast', 'linear');
  $(this).parents('.modal-reviews').next().fadeToggle('fast', 'linear');
}
function checkNewExisting() {
    if ($('.new-contact').length == $('.row-service-select').length) {
        $('.EXISTING').hide();
    } else if ($('.existing-contact').length == $('.row-service-select').length) {
        $('.NEW').hide();
    }
}
