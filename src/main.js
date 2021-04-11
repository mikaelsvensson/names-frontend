// Vue:
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'

// I18n:
import VueI18n from 'vue-i18n'
import messagesEn from './locales/en'
import messagesSv from './locales/sv'

// Buefy:
import {Button, Field, Input, Navbar, Modal, Radio, Toast, Skeleton, Tooltip} from 'buefy'
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
import AboutPrivacyPolicy from "@/components/AboutPrivacyPolicy";
import About from "@/components/About";
import Recommendations from "@/components/Recommendations";

//
// Buefy
//
[Button, Field, Input, Navbar, Modal, Radio, Toast, Skeleton, Tooltip].forEach(component => {
    Vue.use(component)
})

//
// Font Awesome
//

library.add(
    faSolid.faQuestion,
    faSolid.faQuestionCircle,
    faSolid.faArrowRight,
    faSolid.faSmile,
    faRegular.faSmile,
    faSolid.faMeh,
    faRegular.faMeh,
    faSolid.faFrown,
    faRegular.faFrown,
    faRegular.faCopy,
    faSolid.faExclamationTriangle,
    faSolid.faThumbsUp,
    faSolid.faComment,
    faSolid.faDoorOpen
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
        name: 'recommendations',
        path: '/recommendations/:filters*',
        component: Recommendations
    },
    {
        name: 'favourites',
        path: '/favourites/:filters*',
        component: Favourites
    },
    {
        path: '/about',
        component: About
    },
    {
        path: '/about/privacy',
        component: AboutPrivacyPolicy
    },
    {
        path: '/:actionId',
        component: PerformAction
    }
]

Vue.use(VueI18n)

const DEFAULT_LOCALE = 'en'

const locales = {
    [DEFAULT_LOCALE]: messagesEn,
    sv: messagesSv
};

const userLocale = (navigator.language || navigator.userLanguage || 'xx').substr(0, 2)

const i18n = new VueI18n({
    locale: Object.keys(locales).includes(userLocale) ? userLocale : DEFAULT_LOCALE,
    messages: locales
})

Vue.use(VueRouter)

const router = new VueRouter({
    routes
})


Vue.config.productionTip = false

new Vue({
    router,
    i18n,
    render: h => h(App),
    components: {App}
}).$mount('#app')
