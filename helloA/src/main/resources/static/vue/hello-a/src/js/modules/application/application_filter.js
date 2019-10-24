import Vue from 'vue';
import Netpify from '../../netpify';
import {  NPInput,
    NPEntry,
    NPResponsive,
    NPFilterWidget,
    NPSelect2} from "netpify/components";

Vue.use(Netpify);

Vue.component('np-input', NPInput);
Vue.component('np-entry', NPEntry);
Vue.component('np-select2', NPSelect2);
Vue.component('np-responsive', NPResponsive);
Vue.component('np-filter-widget', NPFilterWidget);
new Vue ({
    el: '#vue-app',
    data: {
        applications: [],
        parameters: [],
        saved_query: {},
        search_flag: {},
        can_view: false,
        can_add: false,
    },
    created: function() {
        this.applications = vue_data.hasOwnProperty('applications') ? vue_data.applications : [];
        this.saved_query = vue_data.hasOwnProperty('saved_query') ? vue_data.saved_query : {};
        this.parameters = vue_data.hasOwnProperty('parameters') ? vue_data.parameters : [];
        this.can_view = vue_data.hasOwnProperty('can_view') ? vue_data.can_view : false;
        this.can_add = vue_data.hasOwnProperty('can_add') ? vue_data.can_add : false;
        this.search_flag = vue_data.hasOwnProperty('search_flag') ? vue_data.search_flag : {};
        // this.setOpenStatus();
    },
    methods: {
        viewApplication: function(data){
            const id = data.application_reference;
            location.href = '/application/snapshot/view/' + id;
        },
        editApplication: function(data){
            const  id = data.application_reference;
            location.href = '/application/snapshot/edit/' + id;
        },
        canEdit: function(data) {
            return this.can_view &&  data['sales_owner_user_external_id'] === this.current_user && data['application_status_external_id'] === this.openStatusId;
        },
        // setOpenStatus: function () {
        //     let openStatus = this.parameters.hasOwnProperty('APPLICATION_STATUS_PARAM') ? this.parameters['APPLICATION_STATUS_PARAM'].find((obj) => {return obj['application_status_key'] === 'OPEN'}) : '-';
        //     this.openStatusId = openStatus['application_status_external_id'];
        // },
        formatApplicationStatus: function(data){
            if (this.parameters.APPLICATION_STATUS_PARAM) {
                const parameter = this.parameters.APPLICATION_STATUS_PARAM.find((obj) => {return obj.application_status_external_id === data});
                return !!parameter && parameter.hasOwnProperty('application_status_key') ? parameter.application_status : '-';
            }
            return '-';
        },
    },
    watch:{},
    computed: {
        url: function () {
            return window.location.pathname;
        },
        columns: function () {
            let columns = [
                {name:this.lang('application_reference'), key:'application_reference'},
                {name:this.lang('business_name'), key:'business_legal_name'},
                // {name:this.lang('acquirer'), key:'acquirer'},
                // {name:this.lang('contact_name'), key:'contact_name'},
                // {name:this.lang('sales_owner_fullname'), key:'sales_owner_fullname'},
                {name:this.lang('application_status'), key:'application_status_external_id', formatter: this.formatApplicationStatus},
                {name:this.lang('date_added'), key:'date_added', template: 'date', formatter: this.formatDatetime},
            ];

            return columns;
        },
        colgroup: function() {
            return  ['015p', '015p','015p', '012p', '015p'];
        },
        searchable: function () {
            let searchable;
            if(this.search_flag.hasOwnProperty('is_saved')) {
                let allowedStatuses = this.parameters.APPLICATION_STATUS_PARAM.filter((obj) => {
                    return obj.application_status_key == 'OPEN' || obj.application_status_key == 'SUBMITTED'});
                searchable = ['application_reference', 'business_legal_name',
                    {type:'select', name:'creator_user_external_id', options: this.parameters.USERS_PARAM, placeholder: this.lang('select_creator')},
                    {type:'select', name:'status', options: allowedStatuses, placeholder: this.lang('select_application_status')}]
            }
            else if  (this.search_flag.hasOwnProperty('is_submitted')) {
                let status_list = ['BOARDING_COMPLETE', 'BOARDING_FAILED', 'BOARDING_IN_PROGRESS'];
                let allowedStatuses = this.parameters.APPLICATION_STATUS_PARAM.filter((obj) => {
                    return status_list.includes(obj['application_status_key']);
                });
                searchable = ['application_reference', 'business_legal_name',
                    {type:'select', name:'creator_user_external_id', options: this.parameters.USERS_PARAM, placeholder: this.lang('select_creator')},
                    {type:'select', name:'status', options: allowedStatuses, placeholder: this.lang('select_application_status')}]
            }
            else if  (this.search_flag.hasOwnProperty('is_risk')) {
                let status_list = ['CREDIT_RISK_CHECKS_IN_PROGRESS', 'CREDIT_RISK_REFERRED', 'CREDIT_RISK_ERROR', 'CREDIT_RISK_DECLINED', 'CREDIT_RISK_APPROVED', 'CREDIT_RISK_PRE_APPROVED'];
                let allowedStatuses = this.parameters.APPLICATION_STATUS_PARAM.filter((obj) => {
                    return status_list.includes(obj['application_status_key']);
                });
                searchable = ['application_reference', 'business_legal_name', 'contact_first_name', 'contact_last_name',
                    {type:'select', name:'sales_owner_user_external_id', options: this.parameters.USERS_PARAM, placeholder: this.lang('select_owner')},
                    {type:'select', name:'creator_user_external_id', options: this.parameters.USERS_PARAM, placeholder: this.lang('select_creator')},
                    {type:'select', name:'status', options: allowedStatuses, placeholder: this.lang('select_application_status')}]
            }
            else if  (this.search_flag.hasOwnProperty('is_aml')) {
                let status_list = ['AML_CHECK_IN_PROGRESS', 'AML_REFERRED', 'AML_ERROR', 'AML_APPROVED'];
                let allowedStatuses = this.parameters.APPLICATION_STATUS_PARAM.filter((obj) => {
                    return status_list.includes(obj['application_status_key']);
                });
                searchable = ['application_reference', 'business_legal_name', 'contact_first_name', 'contact_last_name',
                    {type:'select', name:'sales_owner_user_external_id', options: this.parameters.USERS_PARAM, placeholder: this.lang('select_owner')},
                    {type:'select', name:'creator_user_external_id', options: this.parameters.USERS_PARAM, placeholder: this.lang('select_creator')},
                    {type:'select', name:'status', options: allowedStatuses, placeholder: this.lang('select_application_status')}]
            }
            else if  (this.search_flag.hasOwnProperty('is_quality_check')) {
                let status_list = ['READY_FOR_QUALITY_CHECK', 'QUALITY_CHECK_IN_PROGRESS', 'QUALITY_CHECK_APPROVED', 'QUALITY_CHECK_MORE_INFO_REQUIRED'];
                let allowedStatuses = this.parameters.APPLICATION_STATUS_PARAM.filter((obj) => {
                    return status_list.includes(obj['application_status_key']);
                });
                searchable = ['application_reference', 'business_legal_name', 'contact_first_name', 'contact_last_name',
                    {type:'select', name:'sales_owner_user_external_id', options: this.parameters.USERS_PARAM, placeholder: this.lang('select_owner')},
                    {type:'select', name:'creator_user_external_id', options: this.parameters.USERS_PARAM, placeholder: this.lang('select_creator')},
                    {type:'select', name:'status', options: allowedStatuses, placeholder: this.lang('select_application_status')}]
            }
            else {
                searchable = ['application_reference',
                    'business_legal_name',
                    // 'contact_first_name', 'contact_last_name',
                    // {type:'select', name:'sales_owner_user_external_id', options: this.parameters.USERS_PARAM, placeholder: this.lang('select_owner')},
                    // {type:'select', name:'creator_user_external_id', options: this.parameters.USERS_PARAM, placeholder: this.lang('select_creator')},
                    {type:'select', name:'status', options: this.parameters.APPLICATION_STATUS_PARAM, placeholder: this.lang('select_application_status')}]
            }

            if(this.show_parent === true) {
                searchable.splice(3, 0,  {type:'select', name:'parent_type', options: this.parameters.PARENT_TYPES, placeholder: this.lang('select_parent_type')}, {type:'select', name:'partner_external_id', options: this.parameters.PARTNERS_IN_PARTNER_GROUP, placeholder: this.lang('select_partner')});
            }

            return searchable;
        }
    }
})
