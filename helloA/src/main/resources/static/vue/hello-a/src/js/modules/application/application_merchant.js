export class BusinessDetails {
    constructor(businessDetails) {
        this.application_external_id = '';
        this.application_status = '';

        this.chain = '';
        this.template_mid = '';
        this.legal_name = '';
        this.contact_company_name = '';
        this.business_type_id = '';
        this.tin = '';
        this.store_number = '';
        this.website = '';
        this.division = '';
        this.business_start_date = '';
        this.email = '';
        this.primary_business = '';
        this.secondary_business = '';

        this.mcc = '';
        this.annual_revenue = '';
        this.company_phone_code = 'US|1';  //?
        this.company_telephone_number = '';//?
        this.customer_service_phone_code = 'US|1';//?
        this.customer_service_telephone_number = '';//?


        this.card_processing = {
            billing_description_name : '?',
            american_express_merchant_id : '?',
            discover : '?',
        };

        this.registration_address = {
            store_address_line_1: '',
            store_address_line_2: '',
            store_building_number: '',
            store_building_name: '',
            store_street: '',
            store_city: '',
            store_state_code: '',
            store_zip_code: '62701',
            store_country_iso3 : '',
            store_country_code : '840',
        };


        if (businessDetails) {
            this.setBusinessDetails(businessDetails);
        }
    }

    setBusinessDetails(businessDetails) {
        let merchant_keys = Object.keys(businessDetails);
        merchant_keys.map(f => {
            this[f] = businessDetails[f]
        });
    }
}


export class RegisteredAddress {
    constructor(item) {
        this.change_city_flag = false; //used to check if city should be cleared when state is changed
        this.store_address_line_1 = '';
        this.store_address_line_2 = '';
        this.store_building_number = '';
        this.store_building_name = '';
        this.store_street = '';
        this.store_city = '';
        this.store_state_code = '';
        this.store_zip_code = '62701';
        this.store_country_iso3 = '840';
        if (item) {
            this.setAddress(item);
        }
    }

    setAddress(item) {
        let address_keys = Object.keys(item);
        address_keys.map(f => {
            this[f] = item[f]
        });
    }
}