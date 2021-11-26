/* eslint-disable camelcase */
const Joi = require('joi');
const {authorization, contentType} = require('../headers');

const headersSchema = Joi.object({
  'authorization': authorization,
  'content-type': contentType.applicationJSON,
});

const customer_info_th = {
  'thai_title': Joi.string().required(),
  'thai_first_name': Joi.string().required(),
  'thai_middle_name': Joi.string().optional().allow(''),
  'thai_last_name': Joi.string().required(),
  'thai_full_name': Joi.string().required(),
};

const customer_info_en = {
  'en_title': Joi.string().optional().allow(''),
  'en_first_name': Joi.string().optional().allow(''),
  'en_middle_name': Joi.string().optional().allow(''),
  'en_last_name': Joi.string().optional().allow(''),
  'en_full_name': Joi.string().optional().allow(''),
};

const identifier = {
  'card_number': Joi.string().required(),
  'card_type': Joi.string().required(),
  'card_issuing_country': Joi.string().optional().allow(''),
  'card_issue_date': Joi.string().optional().allow(''),
  'card_expiry_date': Joi.string().optional().allow(''),
};

const customer_address_id_card = {
  'id_card_street_address1': Joi.string().required(),
  'id_card_street_address2': Joi.string().required(),
  'id_card_address_subdistrict': Joi.string().required(),
  'id_card_address_district': Joi.string().required(),
  'id_card_address_province': Joi.string().required(),
  'id_card_address_zipcode': Joi.string().required(),
  'id_card_address_country': Joi.string().required(),
  'id_card_address_full': Joi.string().required(),
};

const customer_address_contact = {
  'contact_street_address1': Joi.string().required(),
  'contact_street_address2': Joi.string().required(),
  'contact_address_subdistrict': Joi.string().required(),
  'contact_address_district': Joi.string().required(),
  'contact_address_province': Joi.string().required(),
  'contact_address_zipcode': Joi.string().required(),
  'contact_address_country': Joi.string().required(),
  'contact_address_full': Joi.string().required(),
};

const customer_occupation = {
  'occupation_code': Joi.string().required(),
  'idp_specific_occupation_desc': Joi.string().optional().allow(''),
  'office_name': Joi.string().optional().allow(''),
};

const office_address = {
  'office_street_address1': Joi.string().optional().allow(''),
  'office_street_address2': Joi.string().optional().allow(''),
  'office_address_subdistrict': Joi.string().optional().allow(''),
  'office_address_district': Joi.string().optional().allow(''),
  'office_address_province': Joi.string().optional().allow(''),
  'office_address_zipcode': Joi.string().optional().allow(''),
  'office_address_country': Joi.string().optional().allow(''),
  'office_full_address': Joi.string().optional().allow(''),

};

const customer_contact = {
  'home_tel_no': Joi.string().optional().allow(''),
  'home_tel_no_ext': Joi.string().optional().allow(''),
  'mobile_tel_no': Joi.string().optional().allow(''),
  'email_addr': Joi.string().optional().allow(''),
  'nationality': Joi.string().optional().allow(''),
  'non_iso_nationality_description': Joi.string().optional().allow(''),
  'income': Joi.string().optional().allow(''),
  'marital_status': Joi.string().optional().allow(''),
  'gender': Joi.string().optional().allow(''),

};

const customer_biometric ={
  'biometric_data': Joi.string().optional().allow(''),
  'biometric_type': Joi.string().optional().allow(''),
  'biometric_format': Joi.string().optional().allow(''),

};

const enrollmentInfo = {
  'customer_info_th': Joi.object(customer_info_th).required(),
  'customer_info_en': Joi.object(customer_info_en).optional(),
  'birth_date': Joi.string().required(),
  'identifier': Joi.object(identifier).required(),
  'customer_address_id_card': Joi.object(customer_address_id_card).required(),
  'customer_address_contact': Joi.object(customer_address_contact).required(),
  'customer_occupation': Joi.object(customer_occupation).required(),
  'office_address': Joi.object(office_address).required(),
  'customer_contact': Joi.object(customer_contact).optional(),
  'customer_biometric': Joi.object(customer_biometric).optional(),
  'cust_created_date': Joi.string().optional(),

};


const bodySchema = Joi.object({
  'id_card': Joi.string().required().length(13),
  'channelName': Joi.string().required(),
  'locationCode': Joi.string().required(),
  'userId': Joi.string().required(),
  'referenceId': Joi.string().required(),
  'requester': Joi.string().required(),
  'msisdn': Joi.string().required(),
  'enrollmentInfo': Joi.object(enrollmentInfo).required(),
  'livePhoto': Joi.string().required(),

});

module.exports = {
  headersSchema,
  bodySchema,
};
