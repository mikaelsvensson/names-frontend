// Vue:
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'

// Buefy:
import {Button, Field, Input, Navbar, Modal, Radio, Toast} from 'buefy'
import '@/assets/main.scss' // import 'buefy/dist/buefy.css'

// Font Awesome:
import {library} from '@fortawesome/fontawesome-svg-core'
import * as faSolid from '@fortawesome/free-solid-svg-icons'
import * as faRegular from '@fortawesome/free-regular-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'

import Explore from "@/components/Explore";
import Home from "@/components/Home";
import PerformAction from "@/components/PerformAction";
import Share from "@/components/Share";
import Favourites from "@/components/Favourites";

//
// Buefy
//
[Button, Field, Input, Navbar, Modal, Radio, Toast].forEach(component => {
    Vue.use(component)
})

//
// Font Awesome
//

library.add(
    faSolid.faQuestion,
    faSolid.faSmile,
    faRegular.faSmile,
    faSolid.faMeh,
    faRegular.faMeh,
    faSolid.faFrown,
    faRegular.faFrown,
    faRegular.faCopy
)

Vue.component('font-awesome-icon', FontAwesomeIcon)

//
// Vue
//
const routes = [
    {
        path: '*',
        component: Home
    },
    {
        path: '/explore',
        component: Explore
    },
    {
        path: '/share',
        component: Share
    },
    {
        path: '/favourites',
        component: Favourites
    },
    {
        path: '/:actionId',
        component: PerformAction
    }
]

Vue.use(VueRouter)

const router = new VueRouter({
    routes // short for `routes: routes`
})


Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App),
    components: {App}
}).$mount('#app')
