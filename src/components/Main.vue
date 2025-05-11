<template>
  <div class="d-flex align-center justify-center pt-5">
    <Video></Video>
  </div>
  <div class="d-flex align-center justify-center">
    <Controls />
  </div>
</template>

<script>
import Video from "@/components/Video.vue";
import Controls from "@/components/Controls.vue";

export default {
  components: { Video, Controls },
};
</script>
