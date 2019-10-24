export default {
    methods: {
    initChart: function (application_status_param, chart_data, chartBlock, application_status_external_id) {
        let vm = this;

        let chart_title = vm.lang('application_progress');
        //setup charts
        let status_block = application_status_param.find(obj =>{
            return obj.application_status_external_id === application_status_external_id
        });
        let status = status_block.application_status_key;
        let colour_not_success = '#b2b6ba'; //grey
        let colour_success = $('body').css('color');
        // let colours = ["#90ed7d", "#434348", "#7cb5ec"]; //green, deep ash, light blue
        let data = {};
        let groupsData = [], dataLength = Object.entries(chart_data).length, trackData = [], drillDataLength;
        let groups_y = parseFloat(100 / dataLength).toFixed(2); // get the radius for each of the application_status_groups
        // Build the data arrays
        for (let group in chart_data) {
            if (chart_data.hasOwnProperty(group)) {
                let group_block = chart_data[group];
                let current_group = {
                    name: vm.lang(group),
                    y: Number(groups_y),
                    color: colour_not_success,
                    done: false
                }
                if (group_block.hasOwnProperty('is_complete') && group_block.is_complete === true) {
                    current_group.done = true;
                    current_group.color = colour_success;
                    let current_track = {
                        name: group,
                        y: Number(groups_y),
                        color: colour_success,
                        done: true,
                        message: 'done',
                    };

                    trackData.push(current_track);
                } else {
                    //build tracks
                    let group_tracks = group_block.tracks;

                    //group is active and has progress /index
                    if ( group_block.hasOwnProperty('index') && group_block.index !=='' ) {
                        let track_index = group_block.hasOwnProperty('index') ? group_block.index : '';
                        drillDataLength = group_tracks.length; //number of tracks
                        let tracks_ay = parseFloat(groups_y * ((track_index + 1) / drillDataLength)).toFixed(2) // get the radius for each of the application_status_groups tracks
                        let tracks_by = parseFloat(groups_y - tracks_ay).toFixed(2) // get the radius for each of the application_status_groups tracks

                        //build first track (done track) of group
                        let track_a_name = group_tracks[track_index].find(obj => {
                            return obj === status;
                        })

                        let track_a = {
                            name: group,
                            y: Number(tracks_ay),
                            color: colour_success,
                            done: true,
                            message: 'in_progress',
                            status_name: track_a_name, //name of status
                        };
                        trackData.push(track_a);

                        //build second track (undone track) of group
                        let track_b = {
                            name: group,
                            y: Number(tracks_by),
                            color: colour_not_success,
                            done: false,
                            message: 'in_progress',
                            status_name: track_a_name,
                        };
                        trackData.push(track_b);

                    }else{
                        let track_b = {
                            name: group,
                            y: Number(groups_y),
                            color: colour_not_success,
                            message: 'pending',
                            done: false,
                        };
                        trackData.push(track_b);
                    }
                }
                groupsData.push(current_group);
            }
        }
        // setup chart common params
        data.series = [
            {
                name: vm.lang('application_groups'),
                data: groupsData,
                size: '40%',
                innerSize: '40%',
                dataLabels: {
                    enabled: false
                },
            },
            {
                name: vm.lang('application_status'),
                data: trackData,
                size: '80%',
                innerSize: '20%',
                dataLabels: {
                    enabled: false,
                },
                id: 'status'
            }
        ],
            data.chart = {
                animation: false,
                renderTo: 'container',
                type: 'pie',
                height: 300,
                width: 300,
                backgroundColor: 'rgba(255, 255, 255, 0.0)'
            };
        data.title = {
            text: chart_title,
            verticalAlign: 'bottom',
            y: 10,
        };
        data.credits = {
            enabled: false,
        };
        data.tooltip = {
            formatter: function () {
                //display tooltip message
                if (this.point.hasOwnProperty('status_name')){
                    return  '<b>' + vm.lang(this.point.name) + ':</b> ' + vm.lang(this.point.message) +
                        '<br>' + vm.lang('current_status') +': ' + vm.formatApplicationStatusByKey(application_status_param,this.point.status_name);
                }
                return '<b>' + vm.lang(this.point.name) + ':</b> ' + vm.lang(this.point.message);
            },
            enabled: true,
        };
        data.plotOptions = {
            pie: {
                animation: {
                    duration: 1111,
                    easing: 'easeOutQuad',
                },
                shadow: false,
                center: ['50%', '50%'],
                cursor: 'pointer',

                dataLabels: {
                    enabled: false
                },
                point: {
                    events: {
                        click: function () {
                            // moveToPoint(this);
                        }
                    }
                }
            },
        };
        data.exporting = {
            enabled: false,
            url: site_url + 'report/chart_download',
        };
        data.responsive = {
            rules: [{
                condition: {
                    maxWidth: 400
                },
                chartOptions: {
                    series: [{
                        id: 'status',
                        dataLabels: {
                            enabled: false
                        }
                    }]
                }
            }]
        };
        chartBlock.highcharts(data);
    },
        formatApplicationStatusByKey: function (application_status_param, data) {
            if (application_status_param) {
                const parameter = application_status_param.find((obj) => {
                    return obj.application_status_key=== data
                });
                return !!parameter && parameter.hasOwnProperty('application_status_key') ? parameter.application_status : '-';
            }
            return '-';
        },
    },

}
