<script setup>
import { translateUi } from '../composables/Localization';
import { setBackground } from '../composables/Utilities';

setBackground('BG_ReceptionRoom.jpg');

</script>

<template>
    <main>
        <div class="container-xl py-md-3">
            <div class="row">
                <div id="ba-home" class="col-12 ba-page">
                    <div id="ba-home-info" class="card p-2">
                        <div class="card-body">
                            <div class="d-flex align-items-end p-2">
                                <img :src="'/images/ui/Arona_Construction.png'" height="120">
                                <h1>{{ translateUi('home_welcome') }}</h1>
                            </div>
                            <div>
                                <p>Currently under construction</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>
