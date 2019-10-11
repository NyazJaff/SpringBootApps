<template>
    <div class="card">
        <div class="card-body">
            <h6 class="card-title">
                {{ player.name }}
            </h6>
            <p class="card-text">
                {{ player.description }}
            </p>
        </div>
    </div>
</template>


<script>
    export default  {
        name : 'player-card',
        props: {
            player: []
        }
    }

</script>
<!--Vue.component('player-card', {-->
<!--props: ['player'],-->
<!--template: ``-->
<!--});-->