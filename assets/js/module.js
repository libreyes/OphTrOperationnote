/**
 * OpenEyes
 *
 * (C) Moorfields Eye Hospital NHS Foundation Trust, 2008-2011
 * (C) OpenEyes Foundation, 2011-2013
 * This file is part of OpenEyes.
 * OpenEyes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * OpenEyes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with OpenEyes in a file titled COPYING. If not, see <http://www.gnu.org/licenses/>.
 *
 * @package OpenEyes
 * @link http://www.openeyes.org.uk
 * @author OpenEyes <info@openeyes.org.uk>
 * @copyright Copyright (c) 2008-2011, Moorfields Eye Hospital NHS Foundation Trust
 * @copyright Copyright (c) 2011-2013, OpenEyes Foundation
 * @license http://www.gnu.org/licenses/gpl-3.0.html The GNU General Public License V3.0
 */

function callbackAddProcedure(procedure_id) {
	var eye = $('input[name="Element_OphTrOperationnote_ProcedureList\[eye_id\]"]:checked').val();

	$.ajax({
		'type': 'GET',
		'url': baseUrl+'/OphTrOperationnote/Default/loadElementByProcedure?procedure_id='+procedure_id+'&eye='+eye,
		'success': function(html) {
			if (html.length >0) {
				if (html.match(/must-select-eye/)) {
					$('.procedureItem').map(function(e) {
						var r = new RegExp('<input type="hidden" value="'+procedure_id+'" name="Procedures');
						if ($(this).html().match(r)) {
							$(this).remove();
						}
					});
					if ($('.procedureItem').length == 0) {
						$('#procedureList').hide();
					}
					new OpenEyes.UI.Dialog.Alert({
						content: "You must select either the right or the left eye to add this procedure."
					}).open();
				} else {
					var m = html.match(/data-element-type-class="(Element.*?)"/);
					if (m) {
						m[1] = m[1].replace(/ .*$/,'');

						if (m[1] == 'Element_OphTrOperationnote_GenericProcedure' || $('.'+m[1]).length <1) {
							$('.Element_OphTrOperationnote_ProcedureList .sub-elements').append(html);
							$('.'+m[1]+':last').attr('style','display: none;');
														$('.'+m[1]+':last').removeClass('hidden');
							$('.'+m[1]+':last').slideToggle('fast');
						}

						updateComplicationTypes();
					}
				}
			}
		}
	});
}

function updateComplicationTypes()
{
	var has_cataract = 0;
	var has_trabectome = 0;
	var has_trabeculectomy = 0;
	var has_injection = 0;

	if ($('.Element_OphTrOperationnote_Cataract').length >0) {
		has_cataract = 1;
	}

	if ($('.Element_OphTrOperationnote_Trabectome').length >0) {
		has_trabectome = 1;
	}

	if ($('.Element_OphTrOperationnote_Trabeculectomy').length >0) {
		has_trabeculectomy = 1;
	}

	if ($('.Element_OphTrOperationnote_Injection').length >0) {
		has_injection = 1;
	}

	$.ajax({
		'type': 'GET',
		'url': baseUrl+'/OphTrOperationnote/default/getComplicationTypes?has_cataract=' + has_cataract + '&has_trabectome=' + has_trabectome + '&has_trabeculectomy=' + has_trabeculectomy + '&has_injection=' + has_injection,
		'success': function(html) {
			$('#complication_type').html(html);
		}
	});

	if (!has_cataract) {
		$('tr[data-type="Cataract"]').hide();
		$('ul.Cataract_complications').html('');
	}

	if (!has_trabectome) {
		$('tr[data-type="Trabectome"]').hide();
		$('ul.Trabectome_complications').html('');
	}

	if (!has_trabeculectomy) {
		$('tr[data-type="Trabeculectomy"]').hide();
		$('ul.Trabeculectomy_complications').html('');
	}

	if (!has_injection) {
		$('tr[data-type="Injection"]').hide();
		$('ul.Injection_complications').html('');
	}
}

/*
 * Post the removed operation_id and an array of ElementType class names currently in the DOM
 * This should return any ElementType classes that we should remove.
 */

function callbackRemoveProcedure(procedure_id) {
	var procedures = '';

	var hpid = $('input[type="hidden"][name="Element_OphTrOperationnote_GenericProcedure['+procedure_id+'][proc_id]"][value="'+procedure_id+'"]');

	if (hpid.length >0) {
		hpid.parent().slideToggle('fast',function() {
			hpid.parent().remove();
		});

		return;
	}

	$('input[name="Procedures_procs[]"]').map(function() {
		if (procedures.length >0) {
			procedures += ',';
		}
		procedures += $(this).val();
	});

	$.ajax({
		'type': 'POST',
		'url': baseUrl+'/OphTrOperationnote/Default/getElementsToDelete',
		'data': "remaining_procedures="+procedures+"&procedure_id="+procedure_id+"&YII_CSRF_TOKEN="+YII_CSRF_TOKEN,
		'dataType': 'json',
		'success': function(data) {
			$.each(data, function(key, val) {
				$('.'+val).slideToggle('fast',function() {
					$('.'+val).remove();

					updateComplicationTypes();
				});
			});
		}
	});
}

function setCataractSelectInput(key, value) {
	$('#Element_OphTrOperationnote_Cataract_'+key+'_id').children('option').map(function() {
		if ($(this).text() == value) {
			$('#Element_OphTrOperationnote_Cataract_'+key+'_id').val($(this).val());
		}
	});
}

function setCataractInput(key, value) {
	$('#Element_OphTrOperationnote_Cataract_'+key).val(value);
}

$(document).ready(function() {
	handleButton($('#et_save'),function() {
		if ($('#Element_OphTrOperationnote_Buckle_report').length >0) {
			$('#Element_OphTrOperationnote_Buckle_report').val(ED.getInstance('ed_drawing_edit_Buckle').report());
		}
		if ($('#Element_OphTrOperationnote_Cataract_report2').length >0) {
			$('#Element_OphTrOperationnote_Cataract_report2').val(ED.getInstance('ed_drawing_edit_Cataract').report());
		}
	});

	handleButton($('#et_cancel'),function(e) {
		if (m = window.location.href.match(/\/update\/[0-9]+/)) {
			window.location.href = window.location.href.replace('/update/','/view/');
		} else {
			window.location.href = baseUrl+'/patient/episodes/'+OE_patient_id;
		}
		e.preventDefault();
	});

	handleButton($('#et_deleteevent'));

	handleButton($('#et_canceldelete'));

	handleButton($('#et_print'),function(e) {
		OphTrOperationnote_do_print();
		e.preventDefault();
	});

	var last_Element_OphTrOperationnote_ProcedureList_eye_id = null;

	$('[data-element-type-class="Element_OphTrOperationnote_ProcedureList"]').undelegate('input[name="Element_OphTrOperationnote_ProcedureList\[eye_id\]"]','change').delegate('input[name="Element_OphTrOperationnote_ProcedureList\[eye_id\]"]','change',function() {
		var element = $(this);

		if ($(this).val() == 3) {
			var i = 0;
			var procs = '';
			$('input[name="Procedures[]"]').map(function() {
				if (procs.length >0) {
					procs += '&';
				}
				procs += 'proc'+i+'='+$(this).val();
				i += 1;
			});

			if (procs.length >0) {
				$.ajax({
					'type': 'GET',
					'url': baseUrl+'/OphTrOperationnote/default/verifyprocedure',
					'data': procs,
					'success': function(result) {
						if (result != 'yes') {
							$('#Element_OphTrOperationnote_ProcedureList_eye_id_'+last_Element_OphTrOperationnote_ProcedureList_eye_id).attr('checked','checked');
							if (parseInt(result.split("\n").length) == 1) {
								new OpenEyes.UI.Dialog.Alert({
									content: "The following procedure requires a specific eye selection and cannot be entered for both eyes at once:\n\n"+result
								}).open();
							} else {
								new OpenEyes.UI.Dialog.Alert({
									content: "The following procedures require a specific eye selection and cannot be entered for both eyes at once:\n\n"+result
								}).open();
							}
							return false;
						} else {
							if ($('.procedure-selection').is(':hidden')) {
								$('.procedure-selection').slideToggle('fast');
							}

							changeEye();
							last_Element_OphTrOperationnote_ProcedureList_eye_id = element.val();

							return true;
						}
					}
				});
			} else {
				if ($('.procedure-selection').children('div').is(':hidden')) {
					$('.procedure-selection').children('div').slideToggle('fast');
				}

				changeEye();

				last_Element_OphTrOperationnote_ProcedureList_eye_id = $(this).val();

				return true;
			}

			return false;
		} else {
			if ($('.procedure-selection').children('div').is(':hidden')) {
				$('.procedure-selection').children('div').slideToggle('fast');
			}

			changeEye();
			last_Element_OphTrOperationnote_ProcedureList_eye_id = $(this).val();

			return true;
		}
	});

	$('[data-element-type-class="Element_OphTrOperationnote_Anaesthetic"]').undelegate('input[name="Element_OphTrOperationnote_Anaesthetic\[anaesthetic_type_id\]"]','click').delegate('input[name="Element_OphTrOperationnote_Anaesthetic\[anaesthetic_type_id\]"]','click',function(e) {
		anaestheticSlide.handleEvent($(this));
	});

	$('[data-element-type-class="Element_OphTrOperationnote_Cataract"]').undelegate('input[name="Element_OphTrOperationnote_Anaesthetic\[anaesthetist_id\]"]','click').delegate('input[name="Element_OphTrOperationnote_Anaesthetic\[anaesthetist_id\]"]','click',function(e) {
		anaestheticGivenBySlide.handleEvent($(this));
	});

	$('#Element_OphTrOperationnote_Cataract_iol_type_id').die('change').live('change',function() {
		if ($(this).children('optgroup').children('option:selected').text() == 'MTA3UO' || $(this).children('option:selected').text() == 'MTA4UO') {
			$('#Element_OphTrOperationnote_Cataract_iol_position_id').val(4);
		}
	});

	$('#Element_OphTrOperationnote_Cataract_iol_power').die('keypress').live('keypress',function(e) {
		if (e.keyCode == 13) {
			return false;
		}
		return true;
	});

	$('tr.clickable').disableSelection();

	$('tr.clickable').click(function() {
		$(this).children('td:first').children('input[type="radio"]').attr('checked',true);
	});

	$(this).delegate('.ed_clear', 'click', function(e) {
		e.preventDefault();

		var element = $(this).closest('.sub-element');

		var description = 'description';
		var report = 'report';

		var textarea = element.find([
			'textarea[name$="[' + description + ']"]',
			'textarea[name$="[' + report + ']"]',
		].join(',')).first();

		textarea.val('');
		textarea.trigger('autosize');
	});

	$(this).delegate('#btn-glaucomatube-report', 'click', function(e) {
		e.preventDefault();
		var element = $(this).closest('.sub-element');
		reportEyedraw(element, ED.getInstance('ed_drawing_edit_' + element.data('element-type-id')), 'description' );
	});

	$('#btn-trabeculectomy-report').die('click').live('click',function(e) {
		e.preventDefault();
		var element = $(this).closest('.element');
		reportEyedraw(element,	ED.getInstance('ed_drawing_edit_Trabeculectomy'), 'report');
	});

	$('#btn-trabectome-report').die('click').live('click',function(e) {
		e.preventDefault();
		var element = $(this).closest('.element');
		var drawing_name = $('#Element_OphTrOperationnote_Trabectome_eyedraw').prev('canvas').attr('id').replace(/canvas/,'drawing');
		reportEyedraw(element,	ED.getInstance(drawing_name), 'description');
	});

	$('[data-element-type-class="Element_OphTrOperationnote_Complications"]').undelegate('.addComplication','click').delegate('.addComplication','click',function(e) {
		e.preventDefault();

		$.ajax({
			'type': 'GET',
			'url': baseUrl+'/OphTrOperationnote/default/newComplicationRow',
			'success': function(html) {
				$('.complications tbody').append(html);
			}
		});
	});

	$('[data-element-type-class="Element_OphTrOperationnote_Complications"]').undelegate('.removeComplication','click').delegate('.removeComplication','click',function(e) {
		e.preventDefault();

		var ul = $(this).closest('ul');

		$(this).closest('li').remove();

		$('[data-element-type-class="Element_OphTrOperationnote_Complications"] select[name="complication_type"]').change();

		if (ul.children('li').length == 0) {
			ul.closest('tr').hide();
		}
	});

	$('[data-element-type-class="Element_OphTrOperationnote_Complications"]').undelegate('select[name="complication_type"]','change').delegate('select[name="complication_type"]','change',function(e) {
		e.preventDefault();

		var target = $(this).parent().next('td').children('select');

		if ($(this).val() == '') {
			target.html('');
		} else {
			var type_id = $(this).val();

			var selected_ids = {};
			selected_ids['selected_ids'] = [];

			$('#complication_type_' + type_id + ' input[type="hidden"]').map(function() {
				selected_ids['selected_ids'].push($(this).val());
			});

			$.ajax({
				'type': 'GET',
				'url': baseUrl+'/OphTrOperationnote/default/getComplications?type_id=' + type_id + '&' + $.param(selected_ids),
				'success': function(html) {
					target.html(html);
				}
			});
		}
	});

	$('[data-element-type-class="Element_OphTrOperationnote_Complications"]').undelegate('select[name="complication"]','change').delegate('select[name="complication"]','change',function(e) {
		e.preventDefault();

		if ($(this).val() != '') {
			var type_name = $('[data-element-type-class="Element_OphTrOperationnote_Complications"] select[name="complication_type"] option:selected').text();

			var html = '<li><span class="text">' + $(this).children('option:selected').text() + '</span><a class="removeComplication remove-one">Remove</a><input type="hidden" name="Element_OphTrOperationnote_Complications[complications][]" value="' + $(this).val() + '" />';

			if ($(this).children('option:selected').text() == 'Other') {
				html += '<input class="other_complication" type="text" name="Element_OphTrOperationnote_Complications[other][]" value="" /></li>';
			} else {
				html += '<input type="hidden" name="Element_OphTrOperationnote_Complications[other][]" value="" /></li>';
			}

			$('[data-element-type-class="Element_OphTrOperationnote_Complications"] ul.' + type_name + '_complications').append(html);

			$('#complication_type_' + $('[data-element-type-class="Element_OphTrOperationnote_Complications"] select[name="complication_type"]').val()).show();

			$('tr[data-type="' + type_name + '"] input.other_complication').focus();

			$(this).children('option:selected').remove();
		}
	});

	$('body').undelegate('.showComplicationsElement','click').delegate('.showComplicationsElement','click',function(e) {
		e.preventDefault();

		var element = $('section.Element_OphTrOperationnote_Complications');

		setTimeout(function() {
			var offTop = element.offset().top - 90;
			var speed = (Math.abs($(window).scrollTop() - offTop)) * 1.5;
			$('body').animate({
				scrollTop : offTop
			}, speed, null, function() {
				$('.element-title', element).effect('pulsate', {
					times : 2
				}, 600);
			});
		}, 100);
	});
});

function reportEyedraw(element, eyedraw, fieldName)
{
	var text = eyedraw.report();
	text = text.replace(/, +$/, '');

	var field = $('textarea[name$="[' + fieldName + ']"]', element).first();
	if (field.val()) {
		text = field.val() + ", " + text.toLowerCase();
	}
	field.val(text);
	field.trigger('autosize');
}


function callbackVerifyAddProcedure(proc_name,durations,callback) {
	var eye = $('input[name="Element_OphTrOperationnote_ProcedureList\[eye_id\]"]:checked').val();

	if (eye != 3) {
		callback(true);
		return;
	}

	$.ajax({
		'type': 'GET',
		'url': baseUrl+'/OphTrOperationnote/Default/verifyprocedure?name='+proc_name+'&durations='+durations,
		'success': function(result) {
			if (result == 'yes') {
				callback(true);
			} else {
				new OpenEyes.UI.Dialog.Alert({
					content: "You must select either the right or the left eye before adding this procedure."
				}).open();
				callback(false);
			}
		}
	});
}

function AnaestheticSlide() {if (this.init) this.init.apply(this, arguments); }

AnaestheticSlide.prototype = {
	init : function(params) {
		this.anaestheticTypeSliding = false;
	},
	handleEvent : function(e) {
		var slide = false;

		if (!this.anaestheticTypeSliding) {
			if (e.val() == 5 && !$('#Element_OphTrOperationnote_Anaesthetic_anaesthetist_id').is(':hidden')) {
				this.slide(true);
			} else if (e.val() != 5 && $('#Element_OphTrOperationnote_Anaesthetic_anaesthetist_id').is(':hidden')) {
				this.slide(false);
			}
		}

		// If topical anaesthetic type is selected, select topical delivery
		if (e.val() == 1) {
			$('#Element_OphTrOperationnote_Anaesthetic_anaesthetic_delivery_id_5').click();
		}
	},
	slide : function(hide) {
		this.anaestheticTypeSliding = true;
		$('#Element_OphTrOperationnote_Anaesthetic_anaesthetist_id').slideToggle('fast');
		if (hide) {
			if (!$('#div_Element_OphTrOperationnote_Anaesthetic_anaesthetic_witness_id').is(':hidden')) {
				$('#div_Element_OphTrOperationnote_Anaesthetic_anaesthetic_witness_id').slideToggle('fast');
			}
		} else {
			if ($('#Element_OphTrOperationnote_Anaesthetic_anaesthetist_id_3').is(':checked') && $('#div_Element_OphTrOperationnote_Anaesthetic_anaesthetic_witness_id').is(':hidden')) {
				$('#div_Element_OphTrOperationnote_Anaesthetic_anaesthetic_witness_id').slideToggle('fast');
			}
		}

		$('#Element_OphTrOperationnote_Anaesthetic_anaesthetic_delivery_id').slideToggle('fast');
		$('#div_Element_OphTrOperationnote_Anaesthetic_Agents').slideToggle('fast');
		$('#div_Element_OphTrOperationnote_Anaesthetic_Complications').slideToggle('fast');
		$('#div_Element_OphTrOperationnote_Anaesthetic_anaesthetic_comment').slideToggle('fast',function() {
			anaestheticSlide.anaestheticTypeSliding = false;
		});
	}
}

function AnaestheticGivenBySlide() {if (this.init) this.init.apply(this, arguments); }

AnaestheticGivenBySlide.prototype = {
	init : function(params) {
		this.anaestheticTypeWitnessSliding = false;
	},
	handleEvent : function(e) {
		var slide = false;

		// if Fife mode is enabled
		if ($('#div_Element_OphTrOperationnote_Anaesthetic_anaesthetic_witness_id')) {
			// If nurse is selected, show the witness field
			if (!this.anaestheticTypeWitnessSliding) {
				if ((e.val() == 3 && $('#div_Element_OphTrOperationnote_Anaesthetic_anaesthetic_witness_id').is(':hidden')) ||
					(e.val() != 3 && !$('#div_Element_OphTrOperationnote_Anaesthetic_anaesthetic_witness_id').is(':hidden'))) {
					this.slide();
				}
			}
		}
	},
	slide : function() {
		this.anaestheticTypeWitnessSliding = true;
		$('#div_Element_OphTrOperationnote_Anaesthetic_anaesthetic_witness_id').slideToggle('fast',function() {
			anaestheticGivenBySlide.anaestheticTypeWitnessSliding = false;
		});
	}
}

var anaestheticSlide = new AnaestheticSlide;
var anaestheticGivenBySlide = new AnaestheticGivenBySlide;

function sidePortController(_drawing)
{
	var phakoIncision;
	var sidePort1;
	var sidePort2;

	// Register controller for notifications
	_drawing.registerForNotifications(this, 'notificationHandler', ['ready', 'parameterChanged', 'doodleAdded', 'doodleDeleted']);

	// Method called for notification
	this.notificationHandler = function(_messageArray)
	{
		switch (_messageArray['eventName'])
		{
			// Ready notification
			case 'ready':
				// Get reference to the phakoIncision
				phakoIncision = _drawing.firstDoodleOfClass('PhakoIncision');

				// If this is a newly created drawing, add two sideports
				if (_drawing.isNew)
				{
					sidePort1 = _drawing.addDoodle('SidePort', {rotation:0});
					sidePort2 = _drawing.addDoodle('SidePort', {rotation:Math.PI});
					_drawing.deselectDoodles();
				}
				// Else cancel sync for an updated drawing
				else
				{
					if (typeof(phakoIncision) != 'undefined') {
						phakoIncision.willSync = false;
					}
				}
				break;

			// Parameter change notification
			case 'parameterChanged':
				// Only sync for new drawings
				if (_drawing.isNew)
				{
					// Get rotation value of surgeon doodle
					var surgeonDrawing = ED.getInstance('ed_drawing_edit_Position');
					var surgeonRotation = surgeonDrawing.firstDoodleOfClass('Surgeon').rotation;

					// Get doodle that has moved in opnote drawing
					var masterDoodle = _messageArray['object'].doodle;

					// Stop syncing if PhakoIncision or a SidePort is changed
					if (masterDoodle.drawing.isActive && (masterDoodle.className == 'PhakoIncision' || masterDoodle.className == 'SidePort'))
					{
						if (typeof(phakoIncision) != 'undefined') {
							phakoIncision.willSync = false;
						}
					}

					// Keep sideports in sync with PhakoIncision while surgeon is still syncing with it
					if (masterDoodle.className == "PhakoIncision" && masterDoodle.willSync)
					{
						if (typeof(sidePort1) != 'undefined')
						{
							sidePort1.setSimpleParameter('rotation', (surgeonRotation + Math.PI/2)%(2* Math.PI));
						}
						if (typeof(sidePort2) != 'undefined')
						{
							sidePort2.setSimpleParameter('rotation', (surgeonRotation - Math.PI/2)%(2* Math.PI));
						}
					}
				}
				break;
			case 'doodleDeleted':
				if ($.inArray(_messageArray['object'],eyedraw_iol_classes) != -1) {
					$('#div_Element_OphTrOperationnote_Cataract_iol_type_id').hide();
					$('#div_Element_OphTrOperationnote_Cataract_iol_power').hide();
					$('#div_Element_OphTrOperationnote_Cataract_iol_position_id').hide();
					$('#Element_OphTrOperationnote_Cataract_iol_position_id').children('option').map(function() {
						if ($(this).text() == 'None') {
							$(this).attr('selected','selected');
						}
					});
				}
				break;
			case 'doodleAdded':
				if ($.inArray(_messageArray['object']['className'],eyedraw_iol_classes) != -1) {
					$('#div_Element_OphTrOperationnote_Cataract_iol_type_id').show();
					$('#div_Element_OphTrOperationnote_Cataract_iol_power').show();
					$('#div_Element_OphTrOperationnote_Cataract_iol_position_id').show();
					if ($('#Element_OphTrOperationnote_Cataract_iol_position_id').children('option:selected').text() == 'None') {
						$('#Element_OphTrOperationnote_Cataract_iol_position_id').children('option').map(function() {
							if ($(this).text() == '- Please select -') {
								$(this).attr('selected','selected');
							}
						});
					}
				}
				break;
		}
	}
}

function trabeculectomyController(_drawing)
{
	_drawing.registerForNotifications(this, 'notificationHandler', ['ready', 'parameterChanged']);

	this.notificationHandler = function(_messageArray)
	{
		var conjFlap = _drawing.firstDoodleOfClass('ConjunctivalFlap');
		var trabFlap = _drawing.firstDoodleOfClass('TrabyFlap');
		switch (_messageArray['eventName'])
		{
			case 'parameterChanged':
				if (_drawing.isNew)
				{
					var doodle = _messageArray['object'].doodle;

					if (doodle.isSelected && (doodle.className == 'TrabyFlap' || doodle.className == 'TrabySuture' || doodle.className == 'ConjunctivalFlap')) {
						trabFlap.willSync = false;
					}

					if (doodle.className == 'TrabyFlap') {
						if (_messageArray['object']['parameter'] == 'rotation') {
							if (trabFlap.willSync) {
								var sutures = _drawing.allDoodlesOfClass('TrabySuture');

								for (var i = 0; i < sutures.length; i++) {
									var np = new ED.Point(sutures[i].originX, sutures[i].originY);

									var delta = _messageArray['object'].value - _messageArray['object'].oldValue;

									np.setWithPolars(np.length(), np.direction() + delta);

									sutures[i].originX = np.x;
									sutures[i].originY = np.y;

									sutures[i].rotation += delta;
								}

								if (conjFlap) {
									conjFlap.rotation = doodle.rotation;
								}
							}
						}
					}
				}
		}
	}
}

function changeEye() {
	// Swap side of each drawing
	var drawingEdit1 = window.ED ? ED.getInstance('ed_drawing_edit_Position') : undefined;
	var drawingEdit2 = window.ED ? ED.getInstance('ed_drawing_edit_Cataract') : undefined;
	var drawingEdit3 = window.ED ? ED.getInstance('ed_drawing_edit_Trabeculectomy') : undefined;
	var drawingEdit4 = window.ED ? ED.getInstance('ed_drawing_edit_Injection') : undefined;

	if (typeof(drawingEdit1) != 'undefined') {
		if (drawingEdit1.eye == ED.eye.Right) drawingEdit1.eye = ED.eye.Left;
		else drawingEdit1.eye = ED.eye.Right;

		// Set surgeon position to temporal side
		var doodle = drawingEdit1.firstDoodleOfClass('Surgeon');
		doodle.setParameterWithAnimation('surgeonPosition', 'Temporal');
	}

	if (typeof(drawingEdit2) != 'undefined') {
		if (drawingEdit2.eye == ED.eye.Right) drawingEdit2.eye = ED.eye.Left;
		else drawingEdit2.eye = ED.eye.Right;
	}

	if (typeof(drawingEdit3) != 'undefined') {
		if (drawingEdit3.eye == ED.eye.Right) drawingEdit3.eye = ED.eye.Left;
		else drawingEdit3.eye = ED.eye.Right;

		rotateTrabeculectomy();
	}

	if (typeof(drawingEdit4) != 'undefined') {
		if (drawingEdit4.eye == ED.eye.Right) drawingEdit4.eye = ED.eye.Left;
		else drawingEdit4.eye = ED.eye.Right;

		rotateInjection();
	}
}

function rotateTrabeculectomy()
{
	var _drawing = ED.getInstance('ed_drawing_edit_Trabeculectomy');

	if (_drawing.isNew) {
		var sidePort = _drawing.firstDoodleOfClass('SidePort');
		var trabFlap = _drawing.firstDoodleOfClass('TrabyFlap');

		if (_drawing.eye == ED.eye.Right) {
			sidePort.setParameterWithAnimation('rotation',225 * (Math.PI/180));
			trabFlap.setParameterWithAnimation('site',$('#Element_OphTrOperationnote_Trabeculectomy_site_id').children('option:selected').text());
		} else {
			sidePort.setParameterWithAnimation('rotation',135 * (Math.PI/180));
			trabFlap.setParameterWithAnimation('site',$('#Element_OphTrOperationnote_Trabeculectomy_site_id').children('option:selected').text());
		}
	}
}

function rotateInjection()
{
	var _drawing = ED.getInstance('ed_drawing_edit_Injection');

	if (_drawing.isNew) {
		var injectionSite = _drawing.firstDoodleOfClass('InjectionSite');

		if (_drawing.eye == ED.eye.Right) {
			injectionSite.setParameterWithAnimation('rotation',315 * (Math.PI/180));
		} else {
			injectionSite.setParameterWithAnimation('rotation',45 * (Math.PI/180));
		}
	}
}

function OphTrOperationnote_do_print() {
	printIFrameUrl(OE_print_url, null);
	enableButtons();
}

function OphTrOperationnote_antSegListener(_drawing) {
	var self = this;

	self.drawing = _drawing;
	self._default_distance = null;

	var side = 'right';
	if (self.drawing.eye) {
		side = 'left';
	}
	self.side = side;
	self._injectionDoodles = {};
	self._unsynced = new Array();
	// state flag to track whether we are updating the doodle or not
	self._updating = false;
	self.init();
}

OphTrOperationnote_antSegListener.prototype.init = function()
{
	var self = this;

	self.setDefaultDistance();
	self.drawing.registerForNotifications(self, 'callback', ['doodleAdded', 'doodleDeleted', 'parameterChanged']);

	$('#Element_OphTrOperationnote_AnteriorSegment_' + self.side + '_lens_status_id').bind('change', function() {
		self.setDefaultDistance();
	});
}

// get the default distance from the lens status
OphTrOperationnote_antSegListener.prototype.setDefaultDistance = function() {
	var self = this;

	var selVal = $('#Element_OphTrOperationnote_AnteriorSegment_' + self.side + '_lens_status_id').val();
	if (selVal) {
		$('#Element_OphTrOperationnote_AnteriorSegment_' + self.side + '_lens_status_id').find('option').each(function() {
			if ($(this).val() == selVal) {
				self._default_distance = $(this).attr('data-default-distance');
				return false;
			}
		});
		self.updateDistances();
	}
	else {
		self._default_distance = null;
	}
}

// update individual injection distance
OphTrOperationnote_antSegListener.prototype.updateDoodleDistance = function(doodle, distance)
{
	validityArray = doodle.validateParameter('distance', distance.toString());
	if (validityArray.valid) {
		doodle.setParameterWithAnimation('distance', validityArray.value);
	}
	else { console.log('SYNC ERROR: invalid distance from lens status for doodle'); }
}

// iterate through all registered injection site doodles, and update those that have not been manually altered
OphTrOperationnote_antSegListener.prototype.updateDistances = function()
{
	var self = this;
	for (var id in self._injectionDoodles) {
		var obj = self._injectionDoodles[id];
		skip = false;
		for (var j = 0; j <= self._unsynced.length; j++) {
			if (self._unsynced[j] == id) {
				skip = true;
				break;
			}
		}
		// it's not synced
		if (skip) {
			continue;
		}
		self.updateDoodleDistance(obj, self._default_distance);
	}
}

// listener callback function for eyedraw
OphTrOperationnote_antSegListener.prototype.callback = function(_messageArray) {
	var self = this;


	if (_messageArray.eventName == "doodleAdded" && _messageArray.object.className == 'InjectionSite') {
		// set the distance to the default value from the lens status
		self._injectionDoodles[_messageArray.object.id] = _messageArray.object;
		if (self._default_distance) {
			self.updateDoodleDistance(_messageArray.object, self._default_distance);
		}
	}
	// we get parameter change noticed for changes initiated by our object, so we don't want to unsync those sites
	else if (_messageArray.eventName == "parameterChanged"
		&& _messageArray.object.doodle.className == "InjectionSite"
		&& _messageArray.object.parameter == "distance") {

		// when editing/after validation, initial doodles are not added, so need to verify the doodle is known to our listener
		var id = _messageArray.object.doodle.id;
		if (!self._injectionDoodles[id]) {
			self._injectionDoodles[id] = _messageArray.object.doodle;
		}

		if (_messageArray.object.value != _messageArray.object.oldvalue
			&& _messageArray.object.value != self._default_distance) {
			// unsync this injection from future changes to lens status
			for (var i = 0; i <= self._unsynced.length; i++) {
				if (self._unsynced[i] == _messageArray.object.doodle.id) {
					return;
				}
			}
			self._unsynced.push(_messageArray.object.doodle.id);
		}
	}

};
