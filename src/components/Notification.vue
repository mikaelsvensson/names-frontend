<template>
  <div :class="classNames">
    <div class="notification-icon">
      <font-awesome-icon
        size="2x"
        :icon="iconName"
      />
    </div>
    <div class="notification-message">
      <slot />
    </div>
  </div>
</template>

<script>
const TYPE_CONFIG = {
  INFO: {
    className: '',
    iconName: [ 'fa', 'comment' ]
  },
  LOGIN: {
    className: '',
    iconName: [ 'fa', 'door-open' ]
  },
  SUCCESS: {
    className: 'is-success',
    iconName: [ 'fa', 'thumbs-up' ]
  },
  WARNING: {
    className: 'is-warning',
    iconName: [ 'fa', 'exclamation-triangle' ]
  },
  ERROR: {
    className: 'is-danger',
    iconName: [ 'fa', 'frown' ]
  },
}

export const Types = Object.keys(TYPE_CONFIG).reduce((types, key) => ({...types, [key]: key}), {})

const DEFAULT_TYPE = Object.keys(TYPE_CONFIG)[0]

export default {
  name: "Notification",
  props: {
    type: {
      type: String,
      default: DEFAULT_TYPE,
      validator: function (value) {
        return Object.keys(TYPE_CONFIG).includes(value)
      }
    }
  },
  computed: {
    classNames: function () {
      return `notification ${TYPE_CONFIG[(this.type ?? DEFAULT_TYPE).toUpperCase()].className} is-light content notification-root`
    },
    iconName: function () {
      return TYPE_CONFIG[(this.type ?? DEFAULT_TYPE).toUpperCase()].iconName
    }
  }
}
</script>

<style scoped>
.notification-root {
  display: flex;
}
.notification-icon {
  flex: 0;
  opacity: 0.75;
}
.notification-message {
  flex: 1;
  padding: 5px 0 0 15px;
}
</style>
