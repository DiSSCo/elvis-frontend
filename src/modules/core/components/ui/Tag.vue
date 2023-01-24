<template>
    <div :class="`tag ${variant && variant} ${rounded && 'rounded'} ${size && size}`">
        {{ text }}
    </div>
</template>

<script>
export default {
  props: {
    text: String,
    variant: String,
    rounded: Boolean,
    size: String,
  },
};
</script>

<style lang="css">
.tag.large {
    width: 80%;
}

.tag.full {
  width: 100%;
}

.tag.rounded {
    border-radius: 9999px;
}
</style>
