import Vue from 'vue';
import Netpify from '../../netpify';
import {
    NPPreloader,
    NPPdfModal,
    NPRadios,
    NPButtonRadios,
    NPNotice,
    NPDatePicker,
    NPSelect2,
    NPPostcodeSearch,
    NPResponsive,
    NPInput,
    NPEntry,
    NPCheckBox,
    NPPhone,
    NPBank,
    NPVat
} from '../../netpify/components';

Vue.use(Netpify);

const APP_STATUS_OPEN = 1;
const APP_STATUS_AWAITING_SIGNATURE = 2;
const APP_STATUS_SIGNED = 3;
const APP_STATUS_AML_ERROR = 4;
const APP_STATUS_AML_CHECK_IN_PROGRESS = 5;
const APP_STATUS_AML_REFERRED = 6;
const APP_STATUS_AML_APPROVED = "7";
const APP_STATUS_AML_DECLINED = 8;
const APP_STATUS_BOARDING_FAILED = 9;
const APP_STATUS_BOARDING_IN_PROGRESS = 10;
const APP_STATUS_BOARDING_COMPLETE = 11;
const APP_STATUS_BOARDING_ACQUIRER_DECLINED = 12;
const APP_STATUS_BOARDING_CANCELLED = 13;

const APP_SUB_STATUS_RI_AML_REFERRED = 'RI_AML_REFERRED';
const APP_SUB_STATUS_RI_AML_DECLINED = 'RI_AML_DECLINED';
const APP_SUB_STATUS_AWAITING_SW_CODE = 'AWAITING_SW_CODE';

const PRINCIPALS = 'principals';
const SNAPSHOT = 'snapshot';
const BANK_DETAILS = 'bank_details';
const TERMS_AND_CONDITIONS = 'submit';
const BUSINESS_DETAILS = 'business_details';
const ERROR = 'error';


import {Principal, Bank} from './application_mixin.js';
import {BusinessDetails} from './application_merchant.js';
import {RegisteredAddress} from "./application_merchant.js";
import Sw from "../../entities/sw";
import pieChart from './pie_chart';

var bus = new Vue();
new Vue({

    el: '#vue-app',
    mixins: [pieChart],
    components: {
        'np-radios': NPRadios,
        'np-input': NPInput,
        'np-select2': NPSelect2,
        'np-preloader': NPPreloader,
        'np-checkbox': NPCheckBox,
        'np-entry': NPEntry,
        'np-notice': NPNotice,
        'np-button-radios': NPButtonRadios,
        'np-date-picker': NPDatePicker,
        'np-postcode-search': NPPostcodeSearch,
        'np-responsive': NPResponsive,
        'np-phone': NPPhone,
        'np-bank': NPBank,
        'np-vat': NPVat,
        'np-pdf-modal': NPPdfModal
    },
    data: {
        bus: bus,
        status: {
            APP_STATUS_OPEN: 1,
            APP_STATUS_AWAITING_SIGNATURE: 2,
            APP_STATUS_SIGNED: 3,
            APP_STATUS_AML_ERROR: 4,
            APP_STATUS_AML_CHECK_IN_PROGRESS: 5,
            APP_STATUS_AML_REFERRED: 6,
            APP_STATUS_AML_APPROVED: 7,
            APP_STATUS_AML_DECLINED: 8,
            APP_STATUS_BOARDING_FAILED: 9,
            APP_STATUS_BOARDING_IN_PROGRESS: 10,
            APP_STATUS_BOARDING_COMPLETE: 11,
            APP_STATUS_BOARDING_ACQUIRER_DECLINED: 12,
            APP_STATUS_BOARDING_CANCELLED: 13,
            APP_SUB_STATUS_RI_AML_REFERRED: 'RI_AML_REFERRED',
            APP_SUB_STATUS_RI_AML_DECLINED: 'RI_AML_DECLINED',
            APP_SUB_STATUS_AWAITING_SW_CODE: 'AWAITING_SW_CODE',
        },
        application_status: '',
        application_external_id: '',
        sw_to_add: new Sw(),
        re_submit_sw: new Sw(),
        sw_to_edit: new Sw(),
        principals: {},
        business_details: {},
        documents: {},
        chartData: {},
        bank: {},
        is_view: false,
        application_relation: [],
        is_editing: false,
        loading: false,
        signing: false,
        modal_type: null,
        application_submitted: false,
        principal_flags: [],
        errors: [],
        activePage: 'snapshot',
        types: {
            VALUE: 'value',
            TEXT: 'text',
            LIST: 'list',
            NUMERIC: 'numeric',
            BOOLEAN: 'boolean',
        },
        charge_item_types: {
            AMEX: 'AmericanExpress',
            DISCOVER: 'Discover',
        },
        amex_program: {
            OptBlue: 'OptBlue',
            ESA: 'ESA',
        },
        button_radios_submitted: false,
        parameters: {},
        application_signature: {
            onscreen_url: false,
        },
        terms: {
            read_vantiv_terms: '0',
            read_crane_terms: '0',
            read_gdpr: '0',
            vantiv: '0',
            have_legal_authority: false,
            claim_true: false,
            dd_will_setup: false,
            read_credorax_terms: false,
        },
        vantiv_api_error: {},
        principals_report: {},
        company_details: false,
        is_error: false,
        //aml
        principal_decisions: {},
        business_decisions: {},
        current_nwf_decline: {},
        current_rule_set: {},
        aml_is_error: false,
        aml_business_found: "",
        aml_report_valid_from_status: 5,
    },
    created: function () {
        let {is_editing, is_view, application_relation} = vue_data;
        this.is_editing = vue_data.is_editing;
        this.is_view = vue_data.is_view;
        this.application_relation = vue_data.application_relation;
        this.vantiv_api_error = vue_data.hasOwnProperty('vantiv_api_error') ? vue_data.vantiv_api_error : {};
        this.chartData = vue_data.hasOwnProperty('chart_data') ? vue_data.chart_data : {};
        this.errors = vue_data.hasOwnProperty('errors') ? vue_data.errors : {};
        this.business_details = vue_data.hasOwnProperty('business_details') ? new BusinessDetails(vue_data.business_details) : new BusinessDetails();
        this.business_details.registration_address = vue_data.business_details.hasOwnProperty('registration_address') && !!vue_data.business_details.registration_address ? new RegisteredAddress(vue_data.business_details.registration_address) : new RegisteredAddress();
        this.application_external_id = vue_data.hasOwnProperty('application_external_id') ? vue_data.application_external_id : '';
        this.parameters = vue_data.hasOwnProperty('parameters') ? vue_data.parameters : {};
        this.documents = vue_data.hasOwnProperty('documents') ? vue_data.documents : {};
        this.bank = vue_data.hasOwnProperty('bank') ? new Bank(vue_data.bank) : new Bank();
        this.principals = vue_data.hasOwnProperty('principals') ? vue_data.principals.map(obj => new Principal(obj)) : [new Principal()];
        this.principal_flags = ['is_beneficial_owner', 'is_control_owner']; //'is_authorised_signatory',
        this.application_status = this.getApplicationStatusId();
        this.company_details = vue_data.hasOwnProperty('company_details') ? vue_data.company_details : [];
        this.principals_report = vue_data.hasOwnProperty('principals_report') ? vue_data.principals_report : [];
        this.principal_decisions = vue_data.hasOwnProperty('principal_decisions') ? vue_data.principal_decisions : [];
        this.business_decisions = vue_data.hasOwnProperty('business_decisions') ? vue_data.business_decisions : [];
        this.aml_business_found = vue_data.hasOwnProperty('aml_business_found') ? vue_data.aml_business_found : "";
        this.bus.$on('refresh', function () {
        });
    },
    mounted: function () {
        let chartBlock = $('#chartContainerAmount');
        this.initChart(this.parameters.APPLICATION_STATUS_PARAM, this.chartData, chartBlock, this.application_relation.application_status_external_id);

    },
    computed: {
        corporate_identification: function () {
            return this.company_details.hasOwnProperty('corporate_identification') ? this.company_details.corporate_identification : {};
        },
        corporate_directors: function () {
            return this.company_details.hasOwnProperty('corporate_directors') ? this.company_details.corporate_directors : {};
        },
        corporate_structure: function () {
            return this.company_details.hasOwnProperty('corporate_structure') ? this.company_details.corporate_structure : {};
        },
        parent_company: function () {
            return this.corporate_structure.hasOwnProperty('parent_company') ? this.corporate_structure.parent_company : {};
        },
        ultimate_parent_company: function () {
            return this.corporate_structure.hasOwnProperty('ultimate_parent_company') ? this.corporate_structure.ultimate_parent_company : {};
        },
        corporate_financials: function () {
            return this.company_details.hasOwnProperty('corporate_financials') ? this.company_details.corporate_financials : {};
        },
        corporate_summary: function () {
            return this.company_details.hasOwnProperty('corporate_summary') ? this.company_details.corporate_summary : {};
        },
        corporate_rating: function () {
            return this.company_details.hasOwnProperty('corporate_rating') ? this.company_details.corporate_rating : {};
        },
        alerts: function () {
            return this.company_summary.hasOwnProperty('alerts') ? this.company_summary.alerts : {};
        },
        financial_accounts: function () {
            return this.corporate_financials.hasOwnProperty('financial_accounts') ? this.corporate_financials.financial_accounts : [];
        },
        percentage_change: function () {
            return this.corporate_financials.hasOwnProperty('percentage_change') ? this.corporate_financials.percentage_change : {};
        },
        director_summary: function () {
            return this.corporate_summary.hasOwnProperty('director_summary') ? this.corporate_summary.director_summary : {};
        },
        company_summary: function () {
            return this.corporate_summary.hasOwnProperty('company_summary') ? this.corporate_summary.company_summary : {};
        },
        financials_to_display: function () {
            if (this.financial_accounts.length > 4) return this.financial_accounts.slice(0, 4);
            else return this.financial_accounts;
        },
        parent_company_shares: function () {
            return this.formatShareHolderDetails(this.corporate_structure);
        },
        ultimate_parent_company_shares: function () {
            return this.formatShareHolderDetails(this.ultimate_parent_company);
        },
        vantivTermsOfServiceUrl() {
            const baseUrl = '/assets/pdf/';
            return baseUrl + "test.pdf";
        },
        createChart: function () {
        },
        pageConfig: function () {
            let page_config = {
                'snapshot': {
                    'button_text': this.lang('business_details'),
                    'action': () => {
                        this.activePage = 'business_details';
                    },
                    'icon': '\uf200',
                    'complete': false,
                    'status': 'complete',
                    'disabled': this.application_submitted,
                    'sub_tabs': {
                        'snapshot': {
                            'button_text': this.lang('business_details'),
                            'action': () => {
                                this.activePage = 'business_details';
                            },
                            'displayNone': false,
                            'disabled': this.application_submitted,
                        },
                        'documents': {
                            'button_text': this.lang('business_details'),
                            'action': () => {
                                this.activePage = 'business_details';
                            },
                            'displayNone': false,
                            'disabled': this.application_submitted,
                        },
                        // 'audit': {
                        //     'button_text': this.lang('documents'),
                        // },
                        'error': {
                            'button_text': this.lang('business_details'),
                            'action': () => {
                                this.activePage = 'business_details';
                            },
                            'displayNone': false,
                            'disabled': this.application_submitted,
                        },
                    }
                },
                'business_details': {
                    // 'button_text': (this.quote.payment_method === '2') ? this.lang('select_online_services') : this.lang('select_equipment'),
                    'button_text': this.lang('principals'),
                    'data': this.business_details,
                    'action': () => {
                        this.activePage = 'principal_details';

                    },
                    'back': () => {
                        this.activePage = 'snapshot';
                    },
                    'icon': '\uf0b1',
                    'status': 'progress',
                    'disabled': this.application_submitted,
                },
                'principal_details': {
                    'button_text': this.lang('bank_details'),
                    'data': this.principals,
                    'action': () => {
                        // this.filterAccessories();

                        this.activePage = 'bank_details';
                    },
                    'back': () => {
                        this.activePage = 'business_details';
                    },
                    'icon': '\uf2c0',
                    'status': 'complete',
                    'disabled': this.application_submitted,

                },
                'bank_details': {
                    'button_text': '',
                    'data': this.bank,
                    'action': () => {
                        // this.filterAccessories();
                        // this.activePage = 'submit';

                    },
                    'back': () => {
                        this.activePage = 'principal_details';
                    },
                    'icon': '\uf19c',
                    'status': 'progress',
                    'disabled': this.application_submitted,
                },
                'tab_report_dashboard': {
                    'button_text': this.lang('business_report'),
                    'back': () => {
                        this.activePage = 'bank_details';
                    },
                    'icon': '\uf200',
                    'complete': false,
                    'status': 'complete',
                    'disabled': this.application_submitted,
                    'sub_tabs': {
                        'tab_report_dashboard': {
                            'button_text': this.lang('business_report'),
                            'disabled': this.application_submitted,
                            'displayNone': true,
                            'back': () => {
                                this.activePage = 'bank_details';
                            },
                        },
                        'tab_report_rating': {
                            'button_text': this.lang('tab_report_rating'),
                            'disabled': this.application_submitted,
                            'displayNone': false,
                            'back': () => {
                                this.activePage = 'tab_rating';
                            },
                        },
                        'tab_report_current_directors': {
                            'button_text': this.lang('tab_report_current_directors'),
                            'disabled': this.application_submitted,
                            'displayNone': false,
                            'back': () => {
                                this.activePage = 'tab_rating';
                            },
                        }, 'tab_report_previous_directors': {
                            'button_text': this.lang('tab_report_previous_directors'),
                            'disabled': this.application_submitted,
                            'displayNone': false,
                            'back': () => {
                                this.activePage = 'tab_rating';
                            },
                        }, 'tab_report_parent_company': {
                            'button_text': this.lang('tab_report_parent_company'),
                            'disabled': this.application_submitted,
                            'displayNone': false,
                            'back': () => {
                                this.activePage = 'tab_rating';
                            },
                        }, 'tab_report_ultimate_parent_company': {
                            'button_text': this.lang('tab_report_ultimate_parent_company'),
                            'disabled': this.application_submitted,
                            'displayNone': false,
                            'back': () => {
                                this.activePage = 'tab_rating';
                            },
                        }, 'tab_report_balance_sheet': {
                            'button_text': this.lang('tab_report_balance_sheet'),
                            'disabled': this.application_submitted,
                            'displayNone': false,
                            'back': () => {
                                this.activePage = 'tab_rating';
                            },
                        }, 'tab_report_profit_and_loss': {
                            'button_text': this.lang('tab_report_profit_and_loss'),
                            'disabled': this.application_submitted,
                            'displayNone': false,
                            'back': () => {
                                this.activePage = 'tab_rating';
                            },
                        }, 'tab_report_payment_performance': {
                            'button_text': this.lang('tab_report_payment_performance'),
                            'disabled': this.application_submitted,
                            'displayNone': false,
                            'back': () => {
                                this.activePage = 'tab_rating';
                            },
                        }, 'tab_report_prev_acct_change': {
                            'button_text': this.lang('tab_report_prev_acct_change'),
                            'disabled': this.application_submitted,
                            'displayNone': false,
                            'back': () => {
                                this.activePage = 'tab_rating';
                            },
                        }, 'tab_report_alerts': {
                            'button_text': this.lang('tab_report_alerts'),
                            'disabled': this.application_submitted,
                            'displayNone': false,
                            'back': () => {
                                this.activePage = 'tab_rating';
                            },
                        }, 'tab_report_company': {
                            'button_text': this.lang('tab_report_company'),
                            'disabled': this.application_submitted,
                            'displayNone': false,
                            'back': () => {
                                this.activePage = 'tab_rating';
                            },
                        }, 'tab_report_director': {
                            'button_text': this.lang('tab_report_director'),
                            'disabled': this.application_submitted,
                            'displayNone': false,
                            'back': () => {
                                this.activePage = 'tab_rating';
                            },
                        },
                        'principal_report': {
                            'button_text': this.lang('principal_report'),
                            'disabled': this.application_submitted,
                            'displayNone': true,
                            'back': () => {
                                this.activePage = 'bank_details';
                            },
                        },
                        'aml_report': {
                            'button_text': this.lang('aml_report'),
                            'disabled': this.application_submitted,
                            'displayNone': true,
                            'back': () => {
                                this.activePage = 'bank_details';
                            },
                        },
                    },
                    'group_tabs': {
                        'principal_report': {
                            'button_text': this.lang('principal_report'),
                            'disabled': this.application_submitted,
                            'displayNone': true,
                            'back': () => {
                                this.activePage = 'bank_details';
                            },
                        },
                        'aml_report': {
                            'button_text': this.lang('aml_report'),
                            'disabled': this.application_submitted,
                            'displayNone': true,
                            'back': () => {
                                this.activePage = 'bank_details';
                            },
                        },
                    },

                },
                // 'submit': {
                //     'button_text': this.lang('complete_application'),
                //     'action': () => {
                //         // this.filterAccessories();
                //         this.saveApplication();
                //     },
                //     'back': () => {
                //         this.activePage = 'bank_details';
                //     },
                //     'icon': '\uf1c1',
                //     'status': 'progress',
                //     'disabled': this.application_submitted,
                // },
                // 'documents': {
                //     'button_text': this.lang('documents'),
                //     'action': () => {
                //         this.saveApplication();
                //         this.activePage = 'onscreen_signature';
                //     },
                //     'back': () => {
                //         this.activePage = 'bank_details';
                //     },
                //     'icon': '\uf0b1',
                // },
                // 'onscreen_signature': {
                //     'button_text': this.lang('submit'),
                //     'action': () => {
                //         this.saveApplication();
                //         // this.submitApplication();
                //     },
                //     'back': () => {
                //         this.activePage = 'documents';
                //     },
                //     'icon': '\uf155',
                // },
            };
            return page_config;
        },
        showBack: function () {
            return this.getActivePage()['back']
            // return !!this.pageConfig[this.activePage]['back'];
        },
        pageList: function () {
            return this.pageConfig ? Object.keys(this.pageConfig) : [];
        },
        isOnBankDetailsPage: function () {
            return (this.activePage === 'bank_details');
        },
        agreementLength: function () {
            return this.formatOptionType(this.parameters, this.quote.agreement_length, 'AGREEMENT_LENGTH');
        },
        isCharity: function () {
            return 'true';
        },
        isLimited: function () {
            return 'true'
        },
        isSignable: function () {
            return this.terms.read_gdpr === '1'
        },
        applicationDocumentSummary: function() {
            return this.documents ? this.documents.filter(d => d.group === 'APPLICATION' || d.type === 'ADOBE_AUDIT') : [];
        },
        vantivErrors : function () {
           let message =  "";
           if (this.vantiv_api_error.error_message != undefined && this.vantiv_api_error.error_message[0] != undefined) {
               this.vantiv_api_error.error_message.forEach((obj,key)=> {
                   if(obj.message != undefined || obj.message != null ){
                       message = message + ((key > 0) ? ";" : "") + obj.message;
                   }
               });
           }else if(this.vantiv_api_error.error_message != undefined) {
               if(this.vantiv_api_error.error_message.underwritingStatus != undefined){
                   message = this.vantiv_api_error.error_message.underwritingStatus.reason
               }
           }
           return message.split(";");
        }
    },
    methods: {
        isBold: function (rule) {
            return rule.is_final_decision == 1;
        },
        formatShareHolderDetails: function (company) {
            let share_holder_details = [];
            if (company.hasOwnProperty("shareholders")) {
                for (var i = 0; i < company.shareholders.length; i++) {
                    let share_holder = company.hasOwnProperty("shareholders") ? company.shareholders[i] : {};
                    let share_capital = company.hasOwnProperty("share_capital") && company.share_capital.length > 0 ? _.find(company.share_capital, {
                        'share_class_no': share_holder.share_class_no
                    }) : {};
                    let share_holding = company.hasOwnProperty("shareholdings") ? company.shareholdings[i] : {};
                    let data = {
                        "share_capital": share_capital,
                        "share_holdings": share_holding,
                        "share_holders": share_holder
                    };
                    share_holder_details.push(data);
                }
            }
            return share_holder_details;
        },
        formatName: function (name) {
            var fullName = '';
            if (!!name && typeof name !== "undefined") {
                fullName += !name.tittle || name.tittle === '' ? '' : name.tittle + ' ';
                fullName += !name.title || name.title === '' ? '' : name.title + ' ';
                fullName += !name.first_name || name.first_name === '' ? '' : name.first_name + ' ';
                fullName += !name.middle_name || name.middle_name === '' ? '' : name.middle_name + ' ';
                fullName += !name.last_name || name.last_name === '' ? '' : name.last_name + ' ';
                fullName += !name.suffix || name.suffix === '' ? '' : name.suffix;
                fullName = fullName === '' ? '-' : fullName;
            }
            else {
                fullName = "-";
            }
            return fullName;
        },
        toggleDisplay: function (identifier) {
            var thisTree = $('td#' + identifier);
            // Open tree if closed
            if (thisTree.data("status") === 'closed') {
                thisTree.find("i").removeClass("fa-plus-square").addClass("fa-minus-square");
                $("td[data-parent=" + identifier + "]").closest("tr").removeClass("displayNoneImportant");
                thisTree.data("status", "open");
            } else {
                // Close tree if open
                thisTree.find("i").addClass("fa-plus-square").removeClass("fa-minus-square");       //change tree icon
                // Hide all subtrees, change icons and set status to closed
                $("td[data-parent=" + identifier + "]").data("status", "closed");
                $("td[data-parent=" + identifier + "]").closest("tr").addClass("displayNoneImportant");
                $("td[data-grandparent=" + identifier + "]").closest("tr").addClass("displayNoneImportant")
                $("td[data-parent=" + identifier + "]").find("i").addClass("fa-plus-square").removeClass("fa-minus-square");
                thisTree.data("status", "closed");
            }
        },
        formatSource: function (data) {
            if (data === '') {
                return '-'
            }
            return this.formatSelectType(this.parameters, data, 'AML_ASSESSMENT_SOURCE_PARAM')
        },
        isPartOfReportingWindow: function () {
            let is = false;
            let vm = this;
            is = this.isPartOfReportingGroupTabsWindow();
            if (is === false) {
                is = this.isPartOfReportingSubTabsWindow();
            }
            return is;
        },
        isPartOfReportingSubTabsWindow: function () {
            let is = false;
            let vm = this;
            Object.keys(vm.pageConfig["tab_report_dashboard"]['sub_tabs']).forEach(function (sub_tab, sub_key) {
                let tab = vm.pageConfig["tab_report_dashboard"]['sub_tabs'][sub_tab];
                if (tab.displayNone == false) {
                    if (sub_tab === vm.activePage) {
                        is = true;
                    }
                }
            });
            return is;
        },
        isPartOfReportingGroupTabsWindow: function () {
            let is = false;
            let vm = this;
            Object.keys(vm.pageConfig["tab_report_dashboard"]['group_tabs']).forEach(function (sub_tab, sub_key) {
                if (sub_tab === vm.activePage) {
                    is = true;
                }
            });
            return is;
        },
        changeReportPage: function (val) {
            this.activePage = val;
            console.log(val);
        },
        formatAddress: function (address, single_line = false) {
            var fullAddress = '';
            var separator = '';
            if (!single_line) {
                separator = '<br/>';
            } else {
                separator = ',&nbsp';
            }
            if (!!address && (typeof address !== "undefined")) {
                fullAddress += !address.address_line_1 || address.address_line_1 === '' ? '' : address.address_line_1 + separator;
                fullAddress += !address.address_line_2 || address.address_line_2 === '' ? '' : address.address_line_2 + separator;
                fullAddress += !address.town_city || address.town_city === '' ? '' : address.town_city + separator;
                fullAddress += !address.county || address.county === '' ? '' : address.county + separator;
                fullAddress += !address.postcode || address.postcode === '' ? '' : address.postcode + separator;
                fullAddress += !address.country || address.country === '' ? '' : address.country;
                fullAddress = fullAddress === '' ? '-' : fullAddress;
            }
            else {
                fullAddress = "-";
            }
            return fullAddress;
        },
        formatPrincipalAddress: function (address, single_line = false) {
            var fullAddress = '';
            var separator = '';
            if (!single_line) {
                separator = '<br/>';
            } else {
                separator = ',&nbsp';
            }
            if (!!address && (typeof address !== "undefined")) {
                fullAddress += !address.street_line_1 || address.street_line_1 === '' ? '' : address.street_line_1 + separator;
                fullAddress += !address.street_line_2 || address.street_line_2 === '' ? '' : address.street_line_2 + separator;
                fullAddress += !address.city || address.city === '' ? '' : address.city + separator;
                fullAddress += !address.county_code || address.county_code === '' ? '' : address.county_code + separator;
                // fullAddress += !address.zip_code || address.zip_code === '' ? '' : address.zip_code + separator;
                // fullAddress += !address.country_code || address.country_code === '' ? '' : address.country_code;
                fullAddress = fullAddress === '' ? '-' : fullAddress;
            }
            else {
                fullAddress = "-";
            }
            return fullAddress;
        },
        formatAssessmentFactor: function (data) {
            return this.formatSelectType(this.parameters, data, 'AML_ASSESSMENT_FACTORS_PARAM')
        },
        formatCriteriaType: function (data) {
            return this.formatSelectType(this.parameters, data, 'CRITERIA_TYPES')
        },
        formatInstruction: function (data) {
            return this.formatSelectType(this.parameters, data, 'AML_ASSESSMENT_INSTRUCTION_PARAM')
        },
        formatComparisonValue: function (data) {
            if (data === '') {
                return '-'
            } else if (!isNaN(data)) {
                return data % 1 !== 0 ? parseFloat(data).toFixed(2) : this.formatBooleanOption(String(data));
            }
            return data !== '' && typeof data !== 'undefined' ? this.lang(data) : '-';
        },
        formatRuleDetails: function (rule) {
            let description = '';
            if (typeof rule !== "undefined") {
                description += `${this.formatInstruction(rule.instruction).toUpperCase()}  ${this.lang('ruleset_when')} ${this.lang('equals')} ${this.formatComparisonValue(rule.compared_value)} <br/>`;
                // {this.formatCriteriaType(rule.comparison_operator)}
            } else {
                description = "-";
            }
            return description;
        },
        formatWorth: function (value) {
            var worth = '';
            if (!!value && typeof value !== "undefined") {
                worth += this.valCurrency === '' ? '' : this.valCurrency + ' ';
                worth += this.formatNumber(value);
            }
            else {
                worth = "-";
            }
            return worth;
        },
        getCurrency: function () {
            if (this.financial_accounts.length == 0) {
                return '';
            } else {
                return this.financial_accounts[0].currency;
            }
        },
        formatNumber: function (number) {
            let num = parseFloat(this.vet(number));
            return num ? num.toLocaleString('en') : 0;
        },
        formatIndustryType: function (corporate_identification) {
            var industryInfo = '';
            if (typeof corporate_identification !== "undefined" && corporate_identification.sic_codes !== undefined) {
                industryInfo += corporate_identification.sic_codes[0].code === '' ? '' : corporate_identification.sic_codes[0].code + '<br/>';
                industryInfo += corporate_identification.sic_codes[0].description === '' ? '' : corporate_identification.sic_codes[0].description + '<br/>';
                industryInfo += corporate_identification.business_activities === '' ? '' : corporate_identification.business_activities;
            }
            else {
                industryInfo = "-";
            }
            return industryInfo;
        },
        getTradingName: function () {
            if (this.corporate_identification.hasOwnProperty('ccls')) {
                let ccls = this.corporate_identification.ccls;
                return ccls[0] ? ccls[0][0] ? ccls[0][0]['trading_name'] ? ccls[0][0]['trading_name'] : '-' : '-' : '-'
            }
            return '-'
        },
        showPage: function () {
            var vm = this;
            window.setTimeout(function () {
                let link = window.location.hash;

                link = link !== '' ? link : '#dashboard';


                vm.setActiveContent(link);
            }, 100);
        },
        vet: function (value) {
            if (!!value && (typeof value !== "undefined")) return value;
            else return '-';
        },
        searchPageSubTabs(tab) {
            let page_config = this.pageConfig;
            let active_page = this.activePage;
            Object.keys(page_config).forEach(function (tab, key) {
                if (tab == active_page) {
                    return true;
                } else if (page_config[tab]['sub_tabs']) {
                    Object.keys(page_config[tab]['sub_tabs']).forEach(function (sub_tab, sub_key) {
                        if (sub_tab == active_page) {
                            return true;
                        }
                    });
                }
            });
        },
        getActivePageParentName() {
            let active_page = this.activePage;
            let page_config = this.pageConfig;
            let parent_name = '';
            Object.keys(page_config).forEach(function (tab, key) {
                if (tab == active_page) {
                    parent_name = active_page;
                }
                if (page_config[tab]['sub_tabs']) {
                    Object.keys(page_config[tab]['sub_tabs']).forEach(function (sub_tab, sub_key) {
                        if (sub_tab == active_page) {
                            parent_name = tab;
                        }
                    });
                }
            });
            return parent_name;
        },
        formatPersonalInfo: function (data) {
            let result = "";
            switch (data) {
                case '1':
                    result = '<i class=" fa fa-check" style="color:#3c763d"></i>';
                    break;
                case '-1':
                default:
                    result = '<i class=" fa fa-times" style="color:#D21111"></i>';
            }
            //data === '0' ? data = 'N/A' : data === '1' ? data = '<i class="fa fa-check" style="color:#3c763d"></i>' :
            //  data === '-1' ? data = '<i class=" fa fa-times" style="color:#D21111"></i>' : '';
            // return data;
            return result;
        },
        addressError: function (data) { //principal.intelligence_data
            let check = this.safeGet(['response_data', 'electoral_roll', 'address_match'], data) != '1' ||
            this.safeGet(['response_data', 'electoral_roll', 'postcode_match'], data) != '1' ||
            this.safeGet(['response_data', 'electoral_roll', 'country_code_match'], data) != '1' ? 'TRUE' : 'FALSE';
            return check;
        },
        personalInfoError: function (data) { //principal.intelligence_data
            let check = this.safeGet(['response_data', 'electoral_roll', 'forename_match'], data) != '1' ||
            this.safeGet(['response_data', 'credit_reference', 'date_of_birth_match'], data) != '1' ||
            this.safeGet(['response_data', 'electoral_roll', 'surname_match'], data) != '1' ? 'TRUE' : 'FALSE';
            return check;
        },
        alertError: function (data) { //principal.intelligence_data
            let check = this.safeGet(['response_data', 'credit_reference', 'deceased'], data) != '0' ||
            this.safeGet(['response_data', 'watchlist', 'pep_hits'], data) != '1' ||
            this.safeGet(['response_data', 'watchlist', 'sanctions_hits'], data) != '1' ||
            this.safeGet(['response_data', 'watchlist', 'enforcement_hits'], data) != '1' ? 'TRUE' : 'FALSE';
            return check;
        },
        creditReferenceError: function (data) { //principal.intelligence_data
            let check = this.safeGet(['response_data', 'credit_reference', 'no_of_ccj'], data) != '0' ||
            this.safeGet(['response_data', 'credit_reference', 'boe_match'], data) != '0' ||
            this.safeGet(['response_data', 'credit_reference', 'cifas_match'], data) != '0' ||
            this.safeGet(['response_data', 'credit_reference', 'coa_match'], data) != '0' ||
            this.safeGet(['response_data', 'credit_reference', 'ofac_match'], data) != '0' ||
            this.safeGet(['response_data', 'credit_reference', 'high_risk_address_match'], data) != '0' ||
            this.safeGet(['response_data', 'watchlist', 'associated_entity_hits'], data) != '1' ||
            this.safeGet(['response_data', 'credit_reference', 'commercial_entities_at_address_match'], data) != '0'
                ? 'TRUE' : 'FALSE';
            return check;
        },
        formatValue: function (data) {
            let result = "";
            switch (data) {
                case '0':
                    result = '<i class=" fa fa-check" style="color:#3c763d"></i>';
                    break;
                case '1':
                    result = '<i class=" fa fa-info-circle" style="color: #FF8811"></i>';
                    break;
                default:
                    result = '<i class="fa fa-question-circle" style="color: #1359B8"></i>';
            }
            return result;
        },
        formatWatchlist: function (data) {
            let result = "";
            switch (data) {
                case '1':
                    result = '<i class=" fa fa-check" style="color:#3c763d"></i>';
                    break;
                case '0':
                    result = '<i class=" fa fa-info-circle" style="color: #FF8811"></i>';
                    break;
                default:
                    result = '<i class="fa fa-question-circle" style="color: #1359B8"></i>';
            }
            return result;
        },
        formatCCJ: function (data) {
            let result = '<i class="fa fa-question-circle" style="color: #1359B8"></i>';
            if (data == 0)
                result = '<i class=" fa fa-check" style="color:#3c763d"></i>';
            if (data > 0)
                result = '<i class=" fa fa-times" style="color:#D21111"></i>';
            return result;
        },
        isThisPageOrItSubActive(page, from) {
            let active_page = this.activePage;
            let page_config = this.pageConfig;
            let found = false;
            if (page === active_page) {
                return true;
            } else {
                Object.keys(page_config).forEach(function (tab, key) {
                    if (!!page_config[tab]['sub_tabs'] && tab == page) {
                        Object.keys(page_config[tab]['sub_tabs']).forEach(function (sub_tab, sub_key) {
                            let sub_tab_data = page_config[tab]['sub_tabs'][sub_tab];
                            if (sub_tab == active_page && found != true) {
                                if (from == "PROGRESS") {
                                    found = true;
                                } else {
                                    if (sub_tab_data.displayNone == false) {
                                        found = true;
                                    }
                                }
                            }
                        });
                    }
                });
            }
            return found;
        },
        // isThisPageOrItGroupSubActive(page) {
        //     let active_page = this.activePage;
        //     let page_config = this.pageConfig;
        //     let found = false;
        //     if (page === active_page) {
        //         return true;
        //     } else {
        //         Object.keys(page_config).forEach(function (tab, key) {
        //             if (!!page_config[tab]['group_tabs'] && tab == page) {
        //                 Object.keys(page_config[tab]['group_tabs']).forEach(function (sub_tab, sub_key) {
        //                     if (sub_tab == active_page && found != true) {
        //                         found = true;
        //                     }
        //                 });
        //             }
        //         });
        //     }
        //     return found;
        // },
        setActiveContent: function (link = '') {
            let vm = this;
            if (link == '') {
                link = window.location.hash;
                link = link !== '' ? link : '#dashboard'
            }
            let reflink = link;

            $('#side-menu li').removeClass('active');
            $('#side-menu ul').removeClass('activeNav');
            $('#side-menu li').removeClass('activePar');
            let curr_el = $('a[href*="' + reflink + '"]').closest('li');
            let parent_el = $('a[href*="' + reflink + '"]').closest('ul');
            curr_el.addClass('active');
            parent_el.addClass('activeNav');
            let key = curr_el.data("parent-key");
            parent_el.find("li[data-sub-key=" + key + "]").addClass('activePar');
            $('.pageContent').addClass('displayNoneImportant');
            $(link).removeClass('displayNoneImportant');

        },
        formatActualValue: function (data) {
            if (data === '') {
                return '-'
            } else if (!isNaN(data)) {
                return data % 1 !== 0 ? parseFloat(data).toFixed(2) : this.formatBooleanOption(String(data));
            }
            return data !== '' && typeof data !== 'undefined' ? this.lang(data) : '-';
        },
        hideNWFDetails: function () {
            $('#show-nwf-modal').modal('hide');
        },
        showRuleDetails: function (rule) {
            this.current_rule_set = Object.assign({}, rule);
            $('#show-rule-modal').modal('show');
        },
        hideRuleDetails: function () {
            $('#show-rule-modal').modal('hide');
        },
        getCustomerServiceContactEmail() {
            if(this.business_details.contacts && this.business_details.contacts.length > 0){
                return this.business_details.contacts[0].email
            }
        },
        checkShowPage(page){
            if(page == ERROR && this.errors.length == 0){
                return false;
            }
            return true;
        },
        inFileInfoToDisplay(field){
            let allowedFields = ['file_name','date_added', 'name','type','signed'];
            if(allowedFields.includes(field)){
                return true;
            }
            return false;
        },
        getApplicationStatusId() {
            let status_block = this.parameters.APPLICATION_STATUS_PARAM.find(obj => {
                return obj.application_status_external_id === this.application_relation.application_status_external_id
            });
            let status = status_block.application_status_id;
            return status;
        },
        updatesignstatus() {
            //TODO update sign status
            console.log("TODO update sign status");
        },
        agree(key) {
            if (key === 'vantiv') {
                this.terms.read_vantiv_terms = '1';
            }
        },
        cancel(key) {
            if (key === 'vantiv') {
                this.terms.read_vantiv_terms = '0';
            }
        },
        removePrincipal: function (index) {
            this.principals.splice(index, 1);
            // this.toggleMainPrincipal('0');
        },
        addPrincipal: function () {
            this.principals.push(new Principal());
        },
        getSubItemKeys: function (subitem) {
            return subitem ? Object.keys(subitem) : [];
        },
        isActivePage: function (page_title) {
            return (page_title === this.activePage);
        },
        changeSourceOnImageLoadError(obj) {
            Vue.set(obj.media, 'picture', '/assets/default/img/terminal_icon.png');
        },
        switchTo: function (page) {
            this.activePage = page;
            // this.saveApplication();
        },
        getBackButtonAction: function () {
            this.getActivePage()['back']()
            // this.pageConfig[this.activePage]['back']();
        },
        getQuoteButtonText: function () {
            return this.getActivePage()['button_text']
        },
        getActivePage: function () {
            let page_config = this.pageConfig;
            let active_page = this.activePage;
            let page = '';
            Object.keys(page_config).forEach(function (tab, key) {
                if (tab == active_page) {
                    page = page_config[tab];
                    return;
                } else if (page_config[tab]['sub_tabs']) {
                    Object.keys(page_config[tab]['sub_tabs']).forEach(function (sub_tab, sub_key) {
                        if (sub_tab == active_page) {
                            page = page_config[tab]['sub_tabs'][sub_tab];
                            return;
                        }
                    });
                }
            });
            return page;
        },
        getQuoteButtonAction: function () {
            this.button_radios_submitted = true;
            // if (this.activePage === 'equipments') {
            //     this.pageConfig[this.activePage]['action']();
            // } //TODO: Check equipment validation
            let isValid = this.validate('#' + this.activePage);
            // console.log('form is '+isValid);
            if (isValid
            ) {
                this.pageConfig[this.activePage]['action']();
            }
        },
        submitApplication: function () {
            if (this.validate('#' + this.activePage) === true) {

                let payload = $('#quote_form').serialize();
                payload += '&create_application=' + create_application;
                const url = window.location.href;
                this.showPreloader = true;
                this.loading = true;

                this.loading = false;
            }
        },
        updateBusinessAddress: function (data, obj) {
            Vue.set(obj, 'store_zip_code', data.postcode.substring(0, 5));
            Vue.set(obj, 'store_address_line_1', this.getAddressLine1(data));
            Vue.set(obj, 'store_address_line_2', data.street);
            Vue.set(obj, 'store_city', data.city);
            Vue.set(obj, 'store_state_code', data.county.substring(0, 2));
        },
        updatePrincipalAddress: function (data, obj) {
            Vue.set(obj, 'zip_code', data.postcode.substring(0, 5));
            Vue.set(obj, 'street_line_1', this.getAddressLine1(data));
            Vue.set(obj, 'street_line_2', data.street);
            Vue.set(obj, 'city', data.city);
            Vue.set(obj, 'state_code', data.county.substring(0, 2));
        },
        getAddressLine1: function (data) {
            let address_line_1 = ''
            if (data.building_number) {
                address_line_1 = data.building_number;
            }
            if (data.building_name) {
                address_line_1 += " " + data.building_name;
            }
            return address_line_1;
        },
        isChargePartOfPP: function (charge) {
            let charge_data = [];
            if (this.parameters.FORMATTED_CHARGE_ITEMS.TRANSACTION_CHARGES) {
                charge_data = this.parameters.FORMATTED_CHARGE_ITEMS.TRANSACTION_CHARGES.TRANSACTION.filter(obj => obj.charge_api_id === charge);
            }
            if (charge_data.length > 0) {
                return true;
            }
            return false;
        },
        //formattters
        removeSlashes: function (data, index, field) {
            let regex = /[/]/g;
            field === 'contact_dob' ? this.principals[index].contact_dob = data.replace(regex, '-') : '';
            console.log(field === 'contact_dob' ? this.principals[index].contact_dob = data.replace(regex, '-') : '')
        },
        formatStates: function (data) {
            return this.formatSelectType(this.parameters, data, 'STATES_PARAM');
        },
        formatPhoneNumber: function (phone_code, phone_number) {
            if (phone_number) {
                return `+${phone_code.split('|')[1]} ${phone_number}`
            } else return '-';
        },
        formatCountry: function (data) {
            return this.formatSelectType(this.parameters, data, 'COUNTRIES_PARAM');
        },
        formatBooleanOption: function (data) {
            return this.formatOptionType(this.parameters, data, 'YES_NO')
        },
        formatPaymentMethod: function (data) {
            return this.formatOptionType(this.parameters, data, 'PAYMENT_METHODS');
        },
        formatOwnershipOptions: function (data) {
            return this.formatOptionType(this.parameters, data, 'GOODS_OWNERSHIP_OPTIONS');
        },
        formatAgreementLength: function (data) {
            return this.formatOptionType(this.parameters, data, 'AGREEMENT_LENGTH');
        },
        formatCurrencyValue: function (data) {
            return '£ ' + data;
        },
        formatPercentValue: function (data) {
            return data + ' %';
        },
        formatApplicationStatus: function (data) {
            if (this.parameters.APPLICATION_STATUS_PARAM) {
                const parameter = this.parameters.APPLICATION_STATUS_PARAM.find((obj) => {
                    return obj.application_status_external_id === data
                });
                return !!parameter && parameter.hasOwnProperty('application_status_key') ? parameter.application_status : '-';
            }
            return '-';
        },
        formatBusinessTypes: function (data) {
            return this.formatSelectType(this.parameters, data, 'FD_BUSINESS_TYPE_PARAM');
        },
        formatOwnershipTypes: function (data) {
            return this.formatSelectType(this.parameters, data, 'OWNERSHIP_TYPE_PARAM');
        },
        formatOwnershipPosition: function (data) {
            return this.formatSelectType(this.parameters, data, 'FD_OWNER_POSITION_PARAM');
        },
        formatACH: function (data) {
            return this.formatSelectType(this.parameters, data, 'ACH_TYPES');
        },
        formatNationality: function (data) {
            let vm = this;

            return this.formatSelectType(vm.parameters, data, 'NATIONALITIES');
        },
        formatIssuedId: function (data) {
            let vm = this;

            return this.formatSelectType(vm.parameters, data, 'PRINCIPAL_TYPES_PARAM');
        },

        formatMids: function (mids) {
            let block_html = '';
            if (mids) {
                mids.forEach(obj => {
                    if(obj.mid != null)
                    block_html = block_html + obj.mid + '<br>';
                })
            }
            return (block_html == '') ? "-" : block_html;
        },
        formatAmexProgram: function (data) {
            let vm = this;
            return this.formatSelectType(vm.parameters, data, 'AMEX_PROGRAM');
        },
        isControlOwner(principal) {
            return principal.is_authorised_signatory === '1' || principal.is_control_owner === '1';
        },
        showPdf: function (data) {
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
        //save functions
        saveApplication: function (create_application) {
            const payload = {
                provider_id: '223232'
            };
            this.showPreloader = true;
            this.loading = true;

            this.getAxiosInstance().post('/application/ajaxsaveapplication', payload)
                .then(response => {
                    this.showPreloader = false;
                    if (response.data.result === 'SUCCESS') {
                        // setTimeout(function () {
                        //     let redirect_url = '/application/add';
                        //     window.location.href = redirect_url;
                        // }, 500);
                    }
                    this.loading = false;
                })
        },
        showResubmitToVantivModel: function () {
            this.re_submit_sw = new Sw();
            this.re_submit_sw.division = this.application_relation.division;
            this.re_submit_sw.template_mid = this.application_relation.template_mid;
            this.re_submit_sw.store_number = this.application_relation.store_number;
            this.re_submit_sw.application_external_id = this.application_external_id;
            $('#re-submit-to-vantiv-modal').modal();
        },
        //SW Code ADD
        handleAddSwSuccess: function (data) {
            $('#add-sw-modal').modal('hide');
            this.bus.$emit('refresh');
            location.reload();
        },
        showAddSwModal: function () {
            this.sw_to_add = this.getSwModalModel();
            this.sw_to_add.division = this.application_relation.division;
            this.sw_to_add.template_mid = this.application_relation.template_mid;
            this.sw_to_add.store_number = this.application_relation.store_number;
            delete(this.sw_to_add['sw_external_id']);
            $('#add-sw-modal').modal();
        },
        getSwModalModel: function () {
            const sw = new Sw();
            sw.application_external_id = this.application_relation.application_external_id;
            return sw;
        },
        // showAmlApproveBlock: function () {
        //     let show = $('#approveBlock').hasClass('displayNone');
        //     if(show) {
        //         $('#approveBlock').removeClass('displayNone');
        //
        //         $('#declineBlock').addClass('displayNone');
        //         $('#moreInfoBlock').addClass('displayNone');
        //     } else {
        //         $('#approveBlock').addClass('displayNone');
        //     }
        // },
        showAmlDeclineBlock: function () {
            let show = $('#declineBlock').hasClass('displayNone');
            if (show) {
                $('#declineBlock').removeClass('displayNone');

                // $('#approveBlock').addClass('displayNone');
                $('#moreInfoBlock').addClass('displayNone');
            } else {
                $('#declineBlock').addClass('displayNone');
            }
        },
        showAmlMoreInfoBlock: function () {

            let show = $('#moreInfoBlock').hasClass('displayNone');
            if (show) {
                $('#moreInfoBlock').removeClass('displayNone');

                // $('#approveBlock').addClass('displayNone');
                $('#declineBlock').addClass('displayNone');
                $('#cancelApplicationBlock').addClass('displayNone');
            } else {
                $('#approveBlock').addClass('displayNone');
            }
        },
        showCancelBlock: function () {

            let show = $('#cancelApplicationBlock').hasClass('displayNone');
            if (show) {
                $('#cancelApplicationBlock').removeClass('displayNone');
                $('#moreInfoBlock').addClass('displayNone');

            }
        }
    },
    watch: {}
})
