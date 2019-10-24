import Vue from 'vue';
import Netpify from '../../netpify';
import {NPDatePicker, NPSelect2, NPPostcodeSearch, NPResponsive, NPCompanySearch, NPInput, NPEntry, NPCheckBox, NPPhone} from '../../netpify/components';

Vue.use(Netpify);

Vue.component('np-date-picker', NPDatePicker);
Vue.component('np-select2', NPSelect2);
Vue.component('np-postcode-search', NPPostcodeSearch);
Vue.component('np-responsive', NPResponsive);
Vue.component('np-company-search', NPCompanySearch);
Vue.component('np-input', NPInput);
Vue.component('np-entry', NPEntry);
Vue.component('np-checkbox', NPCheckBox);
Vue.component('np-phone', NPPhone);

class Owner {
    constructor(owner) {
        this.owner_title = '';
        this.owner_first_name = '';
        this.owner_second_name = '';
        this.owner_surname = '';
        this.contact_dob = '';
        this.owner_nationality = '826';
        this.owner_position = '';
        this.is_main_principal = '';
        this.ownership_perc = '';
        this.owner_email = '';
        this.alternative_phone_number = '';
        this.alternative_phone_code = 'GB|44';
        this.telephone_number = '';
        this.telephone_code = 'GB|44';
        this.zip_code = '';
        this.house_name = '';
        this.house_number = '';
        this.street_line_1 = '';
        this.locality = '';
        this.city = '';
        this.county_code = '';
        this.country_code = '826';
        this.title = '';
        this.first_name = '';
        this.last_name = '';
        this.position = '';
        this.phone_no = '';
        this.email_address = '';
        this.date_from = '';
        this.date_to = '';
        this.address_complete = '';
        this.lived_here_for_3_years = '';
        this.contacts = [];

        if (owner) {
            this.setOwner(owner);
        }
    }

    setOwner(owner) {
        let owner_keys = Object.keys(owner);
        owner_keys.map(f => {
            if (f === 'is_main_principal') {
                this[f] = owner[f].toString();
            } else {
                this[f] = owner[f]
            }
        });
    }
}


class Address {
    constructor(address) {

        this.zip_code = '';
        this.house_name = '';
        this.house_number = '';
        this.flat_name = '';
        this.flat_number = '';
        this.street_line_1 = '';
        this.locality = '';
        this.city = '';
        this.county_code = '';
        this.country_code = '826';
        this.title = '';
        this.first_name = '';
        this.last_name = '';
        this.position = '';
        this.phone_no = '';
        this.email = '';
        this.date_from = '';
        this.date_to = '';
        this.date_to_limit = '';
        this.simplifi_admin_user = '';

        if (address) {
            this.setAddress(address);
        }
    }

    setAddress(address) {
        let address_keys = Object.keys(address);
        address_keys.map(f => {
            this[f] = address[f]
        });
    }
}


new Vue({
    el: '#np-app',
    data: {
        merchant: {},
        owners: null,
        personnel_mode: 2,
        current_index: 0,
        personnel: {
            shareholder: 2,
            director: 1
        },
        dayInMilliseconds: 86400000
    },
    created: function () {
        this.merchant = vue_data.hasOwnProperty('merchant') ? (vue_data.merchant) : {};
        this.owners = this.merchant.hasOwnProperty('owners') ? vue_data.merchant.owners.map(obj => new Owner(obj)) : [new Owner()];
        this.parameters = vue_data.hasOwnProperty('parameters') ? vue_data.parameters : [];
        this.checkCompleteAddresses();
        this.toggleMainPrincipal('0');
    },
    methods: {
        removeAddressSlashes: function (data, index, contact_index, field) {
            let regex = /[/]/g;
            field === 'date_from' ? this.owners[index].date_from = data.date_from.replace(regex, '-')
                : field === 'contact_date_from' ? this.owners[index].contacts[contact_index].date_from = data.contacts[contact_index].date_from.replace(regex, '-')
                : field === 'contact_date_to' ? this.owners[index].contacts[contact_index].date_to = data.contacts[contact_index].date_to.replace(regex, '-') : '';
        },
        removeSlashes: function (data, index, field) {
            let regex = /[/]/g;
            field === 'contact_dob' ? this.owners[index].contact_dob = data.replace(regex, '-') : '';
        },
        viewApplication: function (data) {
            const id = data.application_external_id;
            location.href = '/application/snapshot/view/' + id;
        },
        editApplication: function (data) {
            const id = data.application_external_id;
            location.href = '/application/snapshot/edit/' + id;
        },
        formatStatus: function (data) {
            let vm = this;
            return this.formatSelectType(vm.parameters, data, 'APPLICATION_STATUS_PARAM');
        },
        formatPrincipal: function (data) {
            let vm = this;
            return this.formatOptionType(vm.parameters, data, 'YES_NO_OPTIONS');
        },
        formatPhoneNumber: function (data) {
            let vm = this;
            return this.formatOptionType(vm.parameters, data, 'YES_NO_OPTIONS');
        },
        formatNationality: function (data) {
            let vm = this;
            return this.formatSelectType(vm.parameters, data, 'NATIONALITIES');
        },
        formatPosition: function (data) {
            let vm = this;
            return this.formatSelectType(vm.parameters, data, 'FD_OWNER_POSITION_PARAM');
        },
        formatCountry: function (data) {
            let vm = this;
            if (data) {
                return this.formatSelectType(vm.parameters, data, 'COUNTRIES_PARAM');
            } else {
                return '-';
            }
        },
        processCompanySearchData: function (data) {
            const shareholder = Object.assign(data.shareholder, data.shareholder.details);
            let principal = this.owners[this.current_index], vm = this;

            let keyMap = {
                owner_title: 'title',
                owner_first_name: 'first_name',
                owner_second_name: 'middle_name',
                owner_surname: 'last_name',
                contact_dob: 'date_of_birth',
                owner_nationality: 'nationality',
                owner_position: 'position',
                ownership_perc: 'percentage_of_shares',
                // email_address: '',
                // alternative_phone_number: '',
                // alternative_phone_code: 'GB|44',
                // telephone_number: '',
                // telephone_code: 'GB|44',
                zip_code: 'address',
                house_name: '',
                house_number: '',
                flat_name: '',
                flat_number: '',
                street_line_1: '',
                locality: '',
                city: '',
                county_code: '',
                country_code: 826
            };

            Object.keys(keyMap).forEach(d => {
                if (keyMap[d] !== '' && shareholder.hasOwnProperty(keyMap[d])) {
                    if (d === 'zip_code') {
                        let zip_code = shareholder[keyMap[d]]['postcode'] ? shareholder[keyMap[d]]['postcode'] : '';
                        if (zip_code) {
                            Vue.set(principal, d, zip_code);
                            let postcodeElement = vm.$refs['zip_code_' + vm.current_index][0];
                            postcodeElement.search(zip_code);
                        }
                    } else if (d === 'contact_dob') {
                        let contact_dob = (shareholder[keyMap[d]] ? shareholder[keyMap[d]] : '').split('-');
                        let dob = `01-${contact_dob[1]}-${contact_dob[0]}`;
                        Vue.set(principal, d, dob);
                    } else if (d === 'owner_title') {
                        Vue.set(principal, d, `${shareholder[keyMap[d]]}.`);
                    } else {
                        Vue.set(principal, d, shareholder[keyMap[d]]);
                    }
                } else {
                    if (d === 'telephone_code' || d === 'alternative_phone_code') {
                        Vue.set(principal, d, 'GB|44');
                    }
                    else if (d === 'owner_nationality') {
                        Vue.set(principal, d, '826');
                    }
                    else {
                        Vue.set(principal, d, '');
                    }
                }
            });

        },
        addPrincipal: function () {
            this.owners.push(new Owner());
            this.setApplicationSave();
        },
        toggleMainPrincipal: function ($event, main_principal_index) {
            // console.log($event);
            let vm = this;//, selected = this.owners[main_principal_index]['is_main_principal'] === '1';
            if ($event === '1') {
                this.owners.forEach((obj, index) => {
                    if (index !== main_principal_index) {
                        Vue.set(vm.owners[index], 'is_main_principal', '0');
                    }
                })
            } else {
                // If everything is 0, set the first one to be the main
                if (this.owners.every((obj) => {
                    return obj.is_main_principal === '0'
                })) {
                    Vue.set(vm.owners[0], 'is_main_principal', '1');
                }
            }

        },
        removePrincipal: function (index) {
            this.owners.splice(index, 1);
            this.toggleMainPrincipal('0');
            this.setApplicationSave();
        },
        togglePreviousAddresses: function (owner) {
            if (owner.lived_here_for_3_years === '0') {
                owner.contacts.push(new Address());
            } else {
                owner.contacts = [];
            }
        },
        addAddress: function (owner_index) {
            let owner = this.owners[owner_index], vm = this;
            let contact_count = owner.contacts.push(new Address());
            const address = owner.contacts[contact_count - 1];
            const date_to_limit = (contact_count === 1) ? owner.date_from : owner.contacts[contact_count - 2].date_from;
            if (date_to_limit !== '' && !isNaN(date_to_limit)) {
                let dateTo = new Date(this.convert_uk_date_to_iso(date_to_limit));
                dateTo.setDate(dateTo.getDate() - 1);
                this.setApplicationSave();
                let target_date = ((dateTo.getDate() >= 10) ? dateTo.getDate() : '0' + dateTo.getDate()) + '-' + ((dateTo.getMonth() + 1 >= 10) ? dateTo.getMonth() + 1 : '0' + (dateTo.getMonth() + 1)) + '-' + dateTo.getFullYear();
                Vue.set(address, 'date_to', target_date);
                Vue.set(address, 'date_to_limit', date_to_limit);
            }

        },
        removeAddress: function (owner, index) {
            this.setApplicationSave();
            owner.contacts.splice(index, 1);
        },
        updateAddress: function (data, address) {
            address.zip_code = data.postcode;
            address.flat_name = data.flatName;
            address.flat_number = data.flatNumber;
            address.house_name = data.buildingName;
            address.house_number = data.buildingNumber;
            address.street_line_1 = data.street;
            // address.locality = data.locality ;
            address.city = data.city;
            address.county_code = data.county;
            address.country_code = 826;
        },
        searchPersonnel(index) {
            Vue.set(this, 'current_index', index);
            // Vue.set(this, 'personnel_mode', this.personnel_mode.shareholder);
            if (this.merchant.registration_number) {
                this.searchByRegNumber()
            } else {
                this.searchByLegalName();
            }
        },
        searchByLegalName() {
            const component = this.$refs['company-search'];
            component.show();
            component.searchByCompanyName();
        },
        searchByRegNumber() {
            const component = this.$refs['company-search'];
            component.show();
            component.searchByRegNumber();
        },
        returnDifferenceBetweenUKDates: function (date_from, date_to) {
            if (!date_from) {
                return 0;
            }
            let dateTo = date_to ? new Date(this.convert_uk_date_to_iso(date_to)).getTime() : new Date().getTime();
            let dateFrom = new Date(this.convert_uk_date_to_iso(date_from)).getTime();

            return Math.round((dateTo - dateFrom) / this.dayInMilliseconds);
        },
        convert_uk_date_to_iso: function (string) { //accept string DD-MM-YYYYY
            let arr = string.split('-');
            return arr[2] + '-' + arr[1] + '-' + arr[0];
        },
        hasCompleteAddresses: function (principal) {
            // Complete address >= 3 years

            let vm = this, three_years = 1095, interval = vm.returnDifferenceBetweenUKDates(principal.date_from);
            // console.log('interval: ' + interval)
            if (interval === 0) {
                return true;
            }
            if (principal.contacts.length > 0) {
                principal.contacts.forEach((obj) => {
                    interval += vm.returnDifferenceBetweenUKDates(obj.date_from, obj.date_to);
                })
            }

            return interval >= three_years;
        },
        //TODO when a new principal is added do not show the previous address button until the date from field is filled
        principalAddress: function (principal, index, contact_index, element) {
            this.removeAddressSlashes(principal, index, contact_index, element);
            Vue.set(principal, 'address_complete', this.hasCompleteAddresses(principal));
        },
        checkCompleteAddresses: function () {
            let vm = this;
            vm.owners.forEach((obj) => {
                vm.principalAddress(obj);
            })
        },
        // checkOwnerPercent: function (principals){
        // //      console.log(principal);
        //     var sum = 0;
        //     Array.prototype.forEach.call(principals, (obj) => {
        //        // console.log(obj.ownership_perc);
        //         if(!isNaN(parseFloat(obj.ownership_perc))){
        //             sum = sum + parseFloat(obj.ownership_perc);
        //             sum > 100 ? console.log('red') : 'green';
        //             console.log(sum);
        //         }
        //     });
        //
        // }
    },
    watch: {},
})