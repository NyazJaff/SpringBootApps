import Vue from 'vue';

import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";

// import 'material-design-icons-iconfont/dist/material-design-icons.css'


Vue.use(Vuetify);

const vuetifyOptions = {
    theme: {
        dark: false,
    },
};

new Vue({
    el: '#vue',
    vuetify: new Vuetify(vuetifyOptions),
    data: {
        tasks: [
            {
                done: false,
                text: 'Foobar',
            },
            {
                done: false,
                text: 'Fizzbuzz',
            },
        ],
        task: null,
        sticky: false,
        singleLine: true,
        icon: 'mdi-plus',
        color: undefined,
        iconColor: undefined,
        elevation: 4,
        colors: ['red', 'blue', 'teal lighten-2', 'warning lighten-1', 'orange'],
        icons: ['mdi-access-point-network', 'mdi-plus', 'mdi-minus', 'mdi-network-strength-2-alert', 'mdi-earth'],
        extended: false,
        extendedSlot: false,
        prominent: false,
        dense: false,
        collapse: false,
        flat: false,
        bg: false,
        extensionHeight: 48,
        players: [
            {
                id: "1",
                name: "Lionel Mesiiaiss",
                description: "Argentina's superstar"
            },
            {
                id: "2",
                name: "Christiano Ronaldo",
                description: "World #1-ranked player from Portugal"
            }
        ]
    },computed: {
        completedTasks () {
            return this.tasks.filter(task => task.done).length
        },
        progress () {
            return this.completedTasks / this.tasks.length * 100
        },
        remainingTasks () {
            return this.tasks.length - this.completedTasks
        },
    },

    methods: {
        create () {
            this.tasks.push({
                done: false,
                text: this.task,
            })

            this.task = null
        },
    },
});



// import Vue from 'vue';

// import Vuetify from "vuetify";
// import "vuetify/dist/vuetify.min.css";
// const vuetifyOptions = { }

// Vue.use(Vuetify);

//     new Vue({
//         el: '#vue',
//          vuetify: new Vuetify(vuetifyOptions),
//         data: {
//             players: [
//                 {
//                     id: "1",
//                     name: "Lionel Mesiiaiss",
//                     description: "Argentina's superstar"
//                 },
//                 {
//                     id: "2",
//                     name: "Christiano Ronaldo",
//                     description: "World #1-ranked player from Portugal"
//                 }
//             ]
//         }
//     });
