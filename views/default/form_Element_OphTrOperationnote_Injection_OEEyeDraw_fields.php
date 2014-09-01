<?php
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

$values = array();
$options = array();
foreach (OphTrOperationnote_LensStatus::model()->findAll() as $lens_status) {
	$values[] = $lens_status;
	$options[$lens_status->id]['data-default-distance'] = $lens_status->default_distance;
}
?>
<div class="large-12 column end">
	<?php echo $form->dropDownList($element, 'lens_status_id', CHtml::listData($values,'id','name'),array('empty'=>'- Please select -', 'options' => $options), false, array('label' => 5, 'field' => 4))?>
	<?php echo $form->dropDownList($element, 'pre_antisept_drug_id', CHtml::listData(OphTrOperationnote_Injection_Antiseptic_Drug::model()->findAll(array('order'=>'display_order asc')),'id','name'),array('empty' => '- Please select -'),false,array('label' => 5, 'field' => 4))?>
	<?php echo $form->dropDownList($element, 'pre_skin_drug_id', CHtml::listData(OphTrOperationnote_Injection_Skin_Drug::model()->findAll(array('order'=>'display_order asc')),'id','name'),array('empty' => '- Please select -'),false,array('label' => 5, 'field' => 4))?>
	<?php echo $form->checkbox($element, 'pre_ioplowering_required', array('text-align' => 'right','class' => 'linked-fields','data-linked-fields' => 'pre_ioploweringdrugs', 'data-linked-values' => '1'), array('label' => 5, 'field' => 4))?>
	<?php echo $form->multiSelectList($element, 'pre_ioploweringdrugs', 'pre_ioploweringdrugs', 'id', CHtml::listData(OphTrOperationnote_Injection_IOP_Lowering::model()->findAll(array('order' => 'display_order asc')),'id','name'),array(),array('empty' => '- Please select -', 'label' => $element->getAttributeLabel('pre_ioploweringdrugs')),!$element->pre_ioplowering_required,false,null,false,false,array('label' => 5, 'field'=>4))?>
	<?php echo $form->dropDownList($element, 'drug_id', CHtml::listData(OphTrOperationnote_Injection_Treatment_Drug::model()->findAll(array('order'=>'display_order asc')),'id','name'),array('empty' => '- Please select -'),false,array('label' => 5, 'field'=>4))?>
	<?php echo $form->textField($element, 'number', array('size' => '10'), array(), array('label' => 5, 'field' => 2))?>
	<?php echo $form->textField($element, 'batch_number', array('size' => '10'), array(), array('label' => 5, 'field' => 4))?>
	<?php echo $form->datePicker($element, 'batch_expiry_date', !$element->getIsNewRecord() ? array('minDate' => Helper::convertDate2NHS($element->created_date)) : array('minDate' => 'yesterday'), array(), array('label' => 5, 'field' => 2))?>
	<?php if (Yii::app()->params['OphTrOperationnote_Injection_ShowAllUsers']) {?>
		<?php echo $form->dropDownList($element, 'injection_given_by_id', CHtml::listData(User::model()->findAll(array('order'=>'first_name asc, last_name asc')),'id','fullName'),array('empty' => '- Please select -'),false,array('label' => 5, 'field'=>4))?>
	<?php }else{?>
		<?php echo $form->dropDownList($element, 'injection_given_by_id', CHtml::listData(OphTrOperationnote_Injection_User::model()->with('user')->findAll(array('order'=>'first_name asc, last_name asc')),'id','user.fullName'),array('empty' => '- Please select -'),false,array('label' => 5, 'field'=>4))?>
	<?php }?>
	<?php echo $form->timePicker($element, 'injection_time', array(), array(), array('label' => 5, 'field' => 4))?>
	<?php echo $form->checkbox($element, 'post_ioplowering_required', array('text-align' => 'right', 'class' => 'linked-fields', 'data-linked-fields' => 'post_ioploweringdrugs', 'data-linked-values' => '1'), array('label' => 5, 'field' => 4))?>
	<?php echo $form->multiSelectList($element, 'post_ioploweringdrugs', 'post_ioploweringdrugs', 'id', CHtml::listData(OphTrOperationnote_Injection_IOP_Lowering::model()->findAll(array('order' => 'display_order asc')),'id','name'),array(),array('empty' => '- Please select -', 'label' => $element->getAttributeLabel('post_ioploweringdrugs')),!$element->post_ioplowering_required,false,null,false,false,array('label' => 5, 'field'=>4))?>
	<?php echo $form->radioBoolean($element, 'finger_count', array(), array('label' => 5, 'field' => 4))?>
	<?php echo $form->radioBoolean($element, 'iop_checked', array(), array('label' => 5, 'field' => 4))?>
	<?php echo $form->dropDownList($element, 'postinject_drops_id', CHtml::listData(OphTrOperationnote_Injection_Drop::model()->findAll(array('order'=>'display_order')),'id','name'),array('empty'=>'- Please select -'), false, array('label' => 5, 'field' => 4))?>
</div>
