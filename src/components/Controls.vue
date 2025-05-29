<template>
  <div class="d-flex">
    <v-card class="on-screen-controls" color="white">
      <v-row>
        <v-spacer />
        <v-col>
          <v-btn
            @mousedown="sendCommand('forward')"
            @mouseup="sendCommand('stop')"
            ><v-icon>mdi-arrow-up</v-icon></v-btn
          >
        </v-col>
        <v-spacer />
      </v-row>
      <v-row>
        <v-col>
          <v-btn @mousedown="sendCommand('left')" @mouseup="sendCommand('stop')"
            ><v-icon>mdi-arrow-left</v-icon></v-btn
          >
        </v-col>
        <v-spacer />
        <v-col>
          <v-btn
            @mousedown="sendCommand('right')"
            @mouseup="sendCommand('stop')"
            ><v-icon>mdi-arrow-right</v-icon></v-btn
          >
        </v-col>
      </v-row>
      <v-row>
        <v-spacer />
        <v-col>
          <v-btn @mousedown="sendCommand('down')" @mouseup="sendCommand('stop')"
            ><v-icon>mdi-arrow-down</v-icon></v-btn
          >
        </v-col>
        <v-spacer />
      </v-row>
    </v-card>
    <v-card>
      <v-btn>Start</v-btn>
      <v-btn @click="sendCommand('stop')">Stop</v-btn>
      <v-number-input
        v-model="state.speed"
        min="1"
        max="2"
        step="0.1"
        :precision="1"
      ></v-number-input>
    </v-card>
  </div>
</template>
<script>
import { onMounted, onUnmounted, ref, reactive } from "vue";
import { extractDomain } from "@/utils/domainUtils";

export default {
  setup() {
    const state = reactive({
      speed: 1,
    });

    const controlWebsocket = ref(null);
    const connectionStatus = ref("Disconnected");

    const connectWebSocket = () => {
      const url = extractDomain(import.meta.env.VITE_REMOTE_HOST);
      controlWebsocket.value = new WebSocket(`ws://${url}/ws/control/`);

      controlWebsocket.value.onopen = () => {
        connectionStatus.value = "Connected";
        console.log("WebSocket connected");
      };

      controlWebsocket.value.onclose = () => {
        connectionStatus.value = "Disconnected";
        console.log("WebSocket disconnected");
      };

      controlWebsocket.value.onerror = (error) => {
        connectionStatus.value = "Error";
        console.error("WebSocket error:", error);
      };
    };

    const sendCommand = (command) => {
      controlWebsocket.value.send(
        JSON.stringify({ action: command, speed: state.speed })
      );
    };

    onMounted(() => {
      connectWebSocket();
    });

    onUnmounted(() => {
      if (controlWebsocket) {
        controlWebsocket.value.close();
      }
    });
    return {
      sendCommand,
      state,
    };
  },
};
</script>
<style lang="scss">
.on-screen-controls {
  height: auto;
  width: 200px;
}
</style>
