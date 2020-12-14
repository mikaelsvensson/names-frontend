// Vue:
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'

// Buefy:
import {Button, Field, Input, Navbar, Modal, Radio, Toast, Skeleton} from 'buefy'
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
import Name from "@/components/Name";

//
// Buefy
//
[Button, Field, Input, Navbar, Modal, Radio, Toast, Skeleton].forEach(component => {
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
    faRegular.faCopy,
    faSolid.faExclamationTriangle,
    faSolid.faThumbsUp,
    faSolid.faComment
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
        name: 'explore',
        path: '/explore/:filters*',
        component: Explore
    },
    {
        name: 'name',
        path: '/name/:nameId',
        component: Name
    },
    {
        path: '/share',
        component: Share
    },
    {
        name: 'favourites',
        path: '/favourites/:filters*',
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
