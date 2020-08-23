// Vue:
import Vue from 'vue'
import App from './App.vue'

// Buefy:
import {Button, Field, Input} from 'buefy'
import '@/assets/main.scss' // import 'buefy/dist/buefy.css'

// Font Awesome:
import {library} from '@fortawesome/fontawesome-svg-core'
import * as faSolid from '@fortawesome/free-solid-svg-icons'
import * as faRegular from '@fortawesome/free-regular-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'

//
// Buefy
//
[Button, Field, Input].forEach(component => {
    Vue.use(component)
})

//
// Font Awesome
//

library.add(
    faSolid.faThumbsUp,
    faRegular.faThumbsUp,
    faSolid.faThumbsDown,
    faRegular.faThumbsDown
)

Vue.component('font-awesome-icon', FontAwesomeIcon)

//
// Vue
//

Vue.config.productionTip = false

new Vue({
    render: h => h(App),
}).$mount('#app')
