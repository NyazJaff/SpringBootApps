import Vue from 'vue';

// import {
//     PlayerCard
// } from './components';
window.onload = function () {
    new Vue({
        el: '#vue',
        // componenets : {
        //     // 'player-card' : PlayerCard
        // },
        data: {
            players: [
                {
                    id: "1",
                    name: "Lionel Messi",
                    description: "Argentina's superstar"
                },
                {
                    id: "2",
                    name: "Christiano Ronaldo",
                    description: "World #1-ranked player from Portugal"
                }
            ]
        }
    });
}