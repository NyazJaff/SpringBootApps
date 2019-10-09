Vue.component('player-card', {
props: ['player'],
template: `<div class="card">
    <div class="card-body">
        <h6 class="card-title">
            {{ player.name }}
        </h6>
        <p class="card-text">
        <div>
            {{ player.description }}
        </div>
        </p>
    </div>
</div>`
});