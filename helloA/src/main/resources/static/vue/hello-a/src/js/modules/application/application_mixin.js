

export class Principal {
    constructor(principal) {
        this.is_beneficial_principal = '';
        this.is_control_principal = '';
        this.is_authorised_signatory = '';

        this.trading_name = '';
        this.title = '';
        this.first_name = '';
        this.last_name = '';
        this.position = '';
        this.share_percentage = '';
        this.ssn_number = '';
        this.ownership_established_date = '';
        this.date_of_birth = '';
        this.nationality = '';
        this.email = '';
        this.phone_number = '';
        this.phone_code = 'US|1';
        this.change_city_flag = false; //used to check if city should be cleared when state is changed
        this.zip_code = '';
        this.house_name = '';
        this.house_number = '';
        this.street_line_1 = '';
        this.street_line_2 = '';
        this.city = '';
        this.county_code = '';
        this.state_code = '';
        this.country_code = '840';
        this.date_moved_into_above_address = '';

        this.issued_id = {
            id_type : '',
            id_number : '',
            issued_city : '',
            issued_state : '',
            issued_country : '840',
            date_issued : '',
            date_expired : '',
        },

        this.contacts = [];
        if (principal) {
            this.setOwner(principal);
        }
    }

    setOwner(principal) {
        let principal_keys = Object.keys(principal);
        principal_keys.map(f => {
            if (f === 'is_main_principal') {
                this[f] = principal[f].toString();
            } else {
                this[f] = principal[f]
            }
        });
    }
}

export class Bank {
    constructor(bank) {

        this.merchant_name = '?';
        this.sic = '';
        this.voucher = '';
        this.ach = '';
        this.deposits_routing = '';
        this.deposits_dda = '';
        this.fees_routing = '';
        this.fees_dda = '';
        this.exception_routing = '';
        this.exception_dda = '';
        this.alt_routing = '';
        this.alt_dda = '';
        this.account_type = '';
        this.account_holder_name = '';
        this.bank_name = '';

        this.acquired = '';
        this.discover_account_number = '';
        this.amex_program = '';
        this.receive_opt_blue_marketing = '1';
        this.amex_account_number = '';
        this.sw_codes = '';
        if (bank) {
            this.setData(bank);
        }
    }

    setData(data) {
        let data_keys = Object.keys(data);
        data_keys.map(f => {
            this[f] = data[f]
        });
    }
}
