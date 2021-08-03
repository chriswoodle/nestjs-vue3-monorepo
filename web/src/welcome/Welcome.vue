<template>
    <h1>Welcome</h1>
    <router-view></router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'Welcome',
    components: {
    },
    async created() {

    }
})
</script>

<style lang='scss' scoped>
</style>

