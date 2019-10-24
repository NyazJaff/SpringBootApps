import Vue from 'vue';
import Netpify from '../../netpify';
import {NPInput, NPEntry, NPResponsive, NPCheckBox, NPNotice} from '../../netpify/components';

Vue.use(Netpify);

Vue.component('np-input', NPInput);
Vue.component('np-responsive', NPResponsive);
Vue.component('np-entry', NPEntry);
Vue.component('np-checkbox', NPCheckBox);
Vue.component('np-notice', NPNotice);

class QuotePayload {
    constructor(quote_payload) {
        this.quoteId = '';
        this.criteria = [];
        this.effectiveDate = '';
        this.expiryDate = '';
        this.quote = [];

        if (quote_payload) {
            this.setService(quote_payload);
        }
    }

    setService(quote_payload) {
        let quote_payload_keys = Object.keys(quote_payload);
        quote_payload_keys.map(f => {
            this[f] = quote_payload[f]
        });
    }
}

class PricingItem {
    constructor(datum) {
        this.charge_ref = '';
        this.fee_base = '';
        this.fee_perc = '';
        this.min_value = '';
        this.max_value = '';

        if (datum) {
            this.setDatum(datum);
        }
    }

    setDatum(datum) {
        let datum_keys = Object.keys(datum);
        datum_keys.map(f => {
            this[f] = datum[f]
        });
    }
}

new Vue({
    el: '#np-app',
    data: {
        pricing: [],
        services: [],
        unavailable_services: [],
        secondary_pricing: [],
        edit_rates: '0',
        pricing_categories: {
            MERCHANT_TARIFF: 'Merchant Tariff',
            CLIENT_TARIFF: 'Client Tariff',
            MANUAL_ADJUSTMENT: 'Manual Adjustments',
        }
    },
    created: function () {
        // this.outlet = vue_data.hasOwnProperty('outlet') ? new Application(vue_data.outlet) : new Application();
        this.pricing = vue_data.hasOwnProperty('pricing') ? vue_data.pricing : [new PricingItem()];
        this.secondary_pricing = vue_data.hasOwnProperty('secondary_pricing') ? vue_data.secondary_pricing : [new PricingItem()];
        this.services = vue_data.hasOwnProperty('services') ? vue_data.services : [];
        this.unavailable_services = vue_data.hasOwnProperty('unavailable_services') ? vue_data.unavailable_services : [];
        this.parameters = vue_data.hasOwnProperty('parameters') ? vue_data.parameters : [];
    },
    computed: {
        tariffs: function () {
            let vm = this;
            if (vm.pricing) {

                let grouped_prices = {}, formatted_prices = {};

                vm.pricing.forEach((price) => {
                    let obj = price.config;
                    if (grouped_prices.hasOwnProperty(obj.section_name)) {
                        grouped_prices[obj.section_name]['rates'].push(price);
                        if (obj.order < grouped_prices[obj.section_name]['order']) {
                            grouped_prices[obj.section_name]['order'] = obj.order;
                        }
                    } else {
                        grouped_prices[obj.section_name] = {};
                        grouped_prices[obj.section_name]['rates'] = [price];
                        grouped_prices[obj.section_name]['order'] = obj.order;
                    }
                });

                for (const [key, value] of Object.entries(grouped_prices)) {
                    value['rates'].sort(this.sortConfig);
                    formatted_prices[value.order] = {};
                    formatted_prices[value.order]['name'] = key;
                    formatted_prices[value.order]['rates'] = value['rates'];
                }
                return formatted_prices;

            }
            return [];
        },
        // selectedEcomServices: function () {
        //     let vm = this;
        //     return (vm.servicesToDisplay.filter(obj => {
        //         return (obj.quantity === '1');
        //     }));
        // },
        ecommServices: function () {
            let vm = this;
            return (vm.services.filter(obj => {
                return (obj.hasOwnProperty('ecomm') && obj.ecomm === true);
            }));
        },
        nonEcommServices: function () {
            let vm = this;
            return (vm.services.filter(obj => {
                return (!obj.hasOwnProperty('ecomm') || !obj.ecomm);
            }));
        },
        servicesToDisplay: function () {
            return this.nonEcommServices.filter(obj => {
                if (obj.mandatory === true || obj.mandatory === '1') {
                    Vue.set(obj, 'quantity', '1');
                }
                return (obj.hasOwnProperty('display') && (obj.display === true || obj.display === '1'));
            });
        },
        hiddenServices: function () {
            return this.nonEcommServices.filter(obj => {
                return ((!obj.hasOwnProperty('display') || !obj.display) && obj.hasOwnProperty('mandatory') && (obj.mandatory === true || obj.mandatory === '1'));
            });
        },
        unsupported_se: function () {
            let vm = this;
            let textval2 = '';
            let textval1 = '';
            let textval3 = '';

            if(this.unavailable_services.length < 2) {
                textval1 = 'The Service ';
                textval3 = ' is no longer supported and will be removed when next you save';
                textval2 = '['+this.unavailable_services[0]+']';
            }
            else {
                textval1 = 'The Services ';
                textval3 = ' are no longer supported and will be removed when next you save';
                this.unavailable_services.forEach(function (val, index) {
                    textval2 += val + ', ';
                });
            }
            return textval1+'['+textval2+']'+textval3;
        },

    },
    methods: {
        isMandatoryService: function (service) {
            if (service.hasOwnProperty('mandatory') && (service.mandatory === true || service.mandatory === '1')) {
                return true;
            }
            return false;
        },
        getRateHelp: function (rate) {
            let vm = this;
            let help_text = '<table><thead>';
            help_text += '<colgroup><col class="col-md-030p"><col class="col-md-020p"><col class="col-md-020p"><col class="col-md-020p"></colgroup>';
            help_text += `<tr><td>${this.lang('fee')}</td><td>${this.lang('is_editable')}</td><td>${this.lang('min_lower_limit')}</td><td>${this.lang('max_upper_limit')}</td></tr></thead><tbody>`;

            let helpRow = ((fee, obj) => {
                return `<tr><td>${vm.lang(fee)}</td><td>${ (obj.is_editable === true ? vm.lang('yes') : vm.lang('no'))}</td><td>${obj.lower_limit}</td><td>${obj.upper_limit}</td></tr>`;
            });

            let fields = ['fee_perc', 'per_item', 'min_value', 'max_value'];
            fields.forEach((index) => {
                help_text += rate.config.hasOwnProperty(index) ? helpRow(index, rate['config'][index]) : '';
            });
            help_text += '</tbody></table>';

            return help_text;
        },
        isNotClientTariff: function (rate) {
            return (rate.config.pricing_category !== this.pricing_categories.CLIENT_TARIFF);
        },
    },
    watch: {},
})

